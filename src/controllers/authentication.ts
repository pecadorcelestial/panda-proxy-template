import { Request, Response } from 'express';
import { AuthenticationModel } from '../models/authentication';
import * as authorizationJWT from '../classes/jwt';
import configuration from '../configuration';

export class AuthenticationController {

    //PPPP   OOO   SSSS TTTTT
    //P   P O   O S       T
    //PPPP  O   O  SSS    T
    //P     O   O     S   T
    //P      OOO  SSSS    T
    
    public postAuthenticate(request: Request, response: Response) {
        let { username, password }: { username: string, password: string } = request.body;
        let origin: string | undefined = request.get('origin');
        // console.log('[SERVIDOR][AUTHENTICATION][postAuthenticate] Origen: ', origin);
        if((username && username != '') && (password && password != '')) {
            let authentication = new AuthenticationModel(username, password);
            authentication.login()
            .then((data: any) => {
                // Si la información existe y es válida, se crea el token y se devuelve.
                // response.status(200).end(JSON.stringify(data));
                let newJWT = new authorizationJWT.JWT();
                let options: any = {
                    algorithm: authorizationJWT.Algorithm.HS256,
                    expiresIn: configuration.jwt.expiresIn,
                    // audience: origin || configuration.jwt.audience,
                    issuer: configuration.jwt.issuer
                };
                // NUEVO:
                if(origin) options.audience = origin;
                // console.log('[SERVIDOR][AUTHENTICATION][postAuthenticate] Opciones: ', options);
                let publicClaims: any = {};
                let privateClaims: any = {
                    user: username
                };
                newJWT.create(options, publicClaims, privateClaims, (error: any, result: any) => {
                    if(error) {
                        response.status(400).end(JSON.stringify({
                            message: 'Ocurrió un error al intentar generar el token.'
                        }));
                    } else {

                        // CCCC  OOO   OOO  K   K IIIII EEEEE
                        //C     O   O O   O K  K    I   E
                        //C     O   O O   O KKK     I   EEE
                        //C     O   O O   O K  K    I   E
                        // CCCC  OOO   OOO  K   K IIIII EEEEE
    
                        //Código para escribir una cookie en el cliente.
                        response.setHeader('Set-Cookie', `${configuration.token.name}=${result}; Domain=${configuration.token.domain}; Path=/; Max-Age=${configuration.token.maxAge}`);
                        response.status(200).end(JSON.stringify({
                            message: 'Token creado con éxito.',
                            token: result
                        }));
                    }
                });
            })
            .catch((error: any) => {
                response.status(400).end(JSON.stringify(error));
            });
        } else {
            // NOTE: Por ahora si no se envían ni el usuario ni la contraseña, igual se devuelve un token.
            let newJWT = new authorizationJWT.JWT();
            let options: any = {
                algorithm: authorizationJWT.Algorithm.HS256,
                expiresIn: configuration.jwt.expiresIn,
                // audience: origin || configuration.jwt.audience,
                issuer: configuration.jwt.issuer
            };
            // NUEVO:
            if(origin) options.audience = origin;
            console.log('[SERVIDOR][AUTHENTICATION][postAuthenticate] Opciones: ', options);
            let publicClaims: any = {};
            let privateClaims: any = {
                user: 'controlinterno'
            };
            newJWT.create(options, publicClaims, privateClaims, (error: any, result: any) => {
                if(error) {
                    response.status(400).end(JSON.stringify({
                        message: 'Ocurrió un error al intentar generar el token.'
                    }));
                } else {
                    
                    // CCCC  OOO   OOO  K   K IIIII EEEEE
                    //C     O   O O   O K  K    I   E
                    //C     O   O O   O KKK     I   EEE
                    //C     O   O O   O K  K    I   E
                    // CCCC  OOO   OOO  K   K IIIII EEEEE

                    // Se revisa el dominio del que se realizó la petición.
                    let allowedOrigins: Array<string> = configuration.security.cors;
                    let domain: string = ''; // configuration.token.domain;
                    if(origin && allowedOrigins.indexOf(origin) > -1) {
                        // Se quita el http o https.
                        origin = origin.replace(/(http|https):\/\//gi, '');
                        origin = origin.replace(/(:\d+)/gi, '');
                        let originParts: Array<string> = origin.split('.');
                        if(originParts.length >= 2) {
                            // OPCIÓN #1 - Se utliza el nombre completo del sitio.
                            for(let index: number = 0; index < originParts.length; index++) {
                                domain = `${domain.length === 0 ? '' : `${domain}.`}${originParts[index]}`;
                            }
                            // OPCIÓN #2 - Se utilizan sólo las 2 últimas partes del dominio.
                            // domain = `.${originParts[originParts.length-2]}.${originParts[originParts.length-1]}`;
                        }
                    }

                    // Código para escribir una cookie en el cliente.
                    // OPCIÓN #1.
                    response.setHeader('Set-Cookie', `${configuration.token.name}=${result}; Path=/; Max-Age=${configuration.token.maxAge}; HttpOnly`);
                    // OPCIÓN #2.
                    /*
                    export interface CookieOptions {
                        maxAge?: number;                        
                        signed?: boolean;
                        expires?: Date | boolean;
                        httpOnly?: boolean;
                        path?: string;
                        domain?: string;
                        secure?: boolean | 'auto';
                        encode?: (val: string) => void;
                        sameSite?: boolean | string;
                    }
                    */
                    // let cookieOptions: CookieOptions = {
                    //     domain: configuration.token.domain,
                    //     httpOnly: true,
                    //     maxAge: configuration.token.maxAge,
                    // };
                    // response.cookie(`${configuration.token.name}`, `${result}`, cookieOptions);
                    response.status(200).end(JSON.stringify({
                        message: 'Token creado con éxito.',
                        token: result
                    }));
                }
            });
        }
    }

    public postAuthenticateWithGoogle(request: Request, response: Response) {
        let userAgent: string | undefined = request.headers['user-agent'];
        let zUserAgent: string | string[] | undefined = request.headers['z-user-agent'];
        // console.log('==================== USER-AGENT ====================\n', userAgent);
        // console.log('==================== Z-USER-AGENT ====================\n', zUserAgent);
        // console.log('==================== HEADERS ====================\n', request.headers);
        let origin: string | undefined = request.get('origin');
        let model = new AuthenticationModel();
        model.postAuthenticateWithGoogle(request.body, userAgent, zUserAgent)
        .then((data: any) => {
            let newJWT = new authorizationJWT.JWT();
            let options = {
                algorithm: authorizationJWT.Algorithm.HS256,
                expiresIn: configuration.jwt.expiresIn,
                audience: origin || configuration.jwt.audience,
                issuer: configuration.jwt.issuer
            };
            let publicClaims: any = {};
            let privateClaims: any = {
                user: data.email || 'controlinterno_google'
            };
            newJWT.create(options, publicClaims, privateClaims, (error: any, result: any) => {
                if(error) {
                    response.status(400).end(JSON.stringify({
                        message: 'Ocurrió un error al intentar generar el token.'
                    }));
                } else {
                    
                    // CCCC  OOO   OOO  K   K IIIII EEEEE
                    //C     O   O O   O K  K    I   E
                    //C     O   O O   O KKK     I   EEE
                    //C     O   O O   O K  K    I   E
                    // CCCC  OOO   OOO  K   K IIIII EEEEE

                    //Código para escribir una cookie en el cliente.
                    // console.log(`COOKIE = ${configuration.token.name}=${result}; Domain=${configuration.token.domain}; Path=/; Max-Age=${configuration.token.maxAge}`);
                    response.setHeader('Set-Cookie', `${configuration.token.name}=${result}; Domain=${configuration.token.domain}; Path=/; Max-Age=${configuration.token.maxAge}`);
                    response.status(200).end(JSON.stringify({
                        message: 'Token creado con éxito.',
                        token: result,
                        data
                    }));
                }
            });
        })
        .catch((error: any) => {
            // console.log('Controlador Error: ', error);
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postAuthenticateClient(request: Request, response: Response) {
        let origin: string | undefined = request.get('origin');
        let model = new AuthenticationModel();
        model.login4Clients(request.body, origin)
        .then((data: any) => {
            
            // CCCC  OOO   OOO  K   K IIIII EEEEE
            //C     O   O O   O K  K    I   E
            //C     O   O O   O KKK     I   EEE
            //C     O   O O   O K  K    I   E
            // CCCC  OOO   OOO  K   K IIIII EEEEE

            //Código para escribir una cookie en el cliente.
            response.setHeader('Set-Cookie', `${configuration.token.name}=${data.token}; Domain=${configuration.token.domain}; Path=/; Max-Age=${configuration.token.maxAge}`);
            response.status(200).end(JSON.stringify({
                message: 'Token creado con éxito.',
                token: data.token,
                status: data.status
            }));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postAuthenticateDistributor(request: Request, response: Response) {
        let origin: string | undefined = request.get('origin');
        let model = new AuthenticationModel();
        model.login4Distributors(request.body, origin)
        .then((data: any) => {
            
            // CCCC  OOO   OOO  K   K IIIII EEEEE
            //C     O   O O   O K  K    I   E
            //C     O   O O   O KKK     I   EEE
            //C     O   O O   O K  K    I   E
            // CCCC  OOO   OOO  K   K IIIII EEEEE

            //Código para escribir una cookie en el cliente.
            response.setHeader('Set-Cookie', `${configuration.token.name}=${data.token}; Domain=${configuration.token.domain}; Path=/; Max-Age=${configuration.token.maxAge}`);
            response.status(200).end(JSON.stringify({
                message: 'Token creado con éxito.',
                token: data.token,
                account: data.account,
                status: data.status
            }));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postAuthenticateWithDN(request: Request, response: Response) {
        let origin: string | undefined = request.get('origin');
        let model = new AuthenticationModel();
        model.loginWithDN(request.body, origin)
        .then((data: { token: string, account: any }) => {
            
            // CCCC  OOO   OOO  K   K IIIII EEEEE
            //C     O   O O   O K  K    I   E
            //C     O   O O   O KKK     I   EEE
            //C     O   O O   O K  K    I   E
            // CCCC  OOO   OOO  K   K IIIII EEEEE

            // Se revisa el dominio del que se realizó la petición.
            let allowedOrigins: Array<string> = configuration.security.cors;
            // TODO: Revisar por qué se había comentado esto:
            let domain: string = configuration.token.domain;
            if(origin && allowedOrigins.indexOf(origin) > -1) {
                // Se quita el http o https.
                origin = origin.replace(/(http|https):\/\//gi, '');
                origin = origin.replace(/(:\d+)/gi, '');
                let originParts: Array<string> = origin.split('.');
                if(originParts.length >= 2) {
                    // for(let index: number = 0; index < originParts.length; index++) {
                    //     domain = `${domain.length === 0 ? '' : `${domain}.`}${originParts[index]}`;
                    // }
                    // NOTE: Al parecer debe ir sin el punto inicial.
                    // domain = `.${originParts[originParts.length-2]}.${originParts[originParts.length-1]}`;
                    // domain = `${originParts[originParts.length-2]}.${originParts[originParts.length-1]}`;
                }
            }

            // Código para escribir una cookie en el cliente.
            response.setHeader('Set-Cookie', `${configuration.token.name}=${data.token}; Path=/; Max-Age=${configuration.token.maxAge}; HttpOnly; SameSite=None; Secure`);
            response.status(200).end(JSON.stringify({
                message: 'Token creado con éxito.',
                token: data.token,
                account: data.account
            }));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postSignOff(request: Request, response: Response) {

        // CCCC  OOO   OOO  K   K IIIII EEEEE
        //C     O   O O   O K  K    I   E
        //C     O   O O   O KKK     I   EEE
        //C     O   O O   O K  K    I   E
        // CCCC  OOO   OOO  K   K IIIII EEEEE

        // Código para escribir una cookie en el cliente.
        response.setHeader('Set-Cookie', `${configuration.token.name}=; Path=/; Max-Age=0; HttpOnly`);
        response.status(200).end(JSON.stringify({
            message: 'Token eliminado con éxito.'
        }));
    }

    public postDomainSignOff(request: Request, response: Response) {

        // CCCC  OOO   OOO  K   K IIIII EEEEE
        //C     O   O O   O K  K    I   E
        //C     O   O O   O KKK     I   EEE
        //C     O   O O   O K  K    I   E
        // CCCC  OOO   OOO  K   K IIIII EEEEE

        // Código para escribir una cookie en el cliente.
        response.setHeader('Set-Cookie', `${configuration.token.name}=; Domain=${configuration.token.domain}; Path=/; Max-Age=0; HttpOnly`);
        response.status(200).end(JSON.stringify({
            message: 'Token eliminado con éxito.'
        }));
    }

}