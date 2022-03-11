// Módulos.
import axios from 'axios';
import idx from 'idx';
import { OAuth2Client } from 'google-auth-library';
// import { TokenPayload } from 'google-auth-library/build/src/auth/loginticket';
import { validate, IsString, IsDefined, IsEmail, MaxLength } from 'class-validator';
// Modelos.
import AccountModel, { Account } from './accounts';
import UserModel, { ClientUser, ClientUserModel } from './users';
// Funciones.
import { RemodelErrors } from '../scripts/data-management';
import { userPermissions } from '../scripts/users';
// Clases.
import * as authorizationJWT from '../classes/jwt';
// Configuración.
import configuration from '../configuration';

interface TokenPayload {
    // The Issuer Identifier for the Issuer of the response.
    // Always https://accounts.google.com or accounts.google.com for Google ID tokens.
    iss: string;
    // Access token hash. Provides validation that the access token is tied to the
    // identity token. If the ID token is issued with an access token in the  
    // server flow, this is always included. This can be used as an alternate
    // mechanism to protect against cross-site request forgery attacks, but if you
    // follow Step 1 and Step 3 it is not necessary to verify the access token.
    at_hash?: string;
    // True if the user's e-mail address has been verified; otherwise false.
    email_verified?: boolean;
    // An identifier for the user, unique among all Google accounts and never reused.
    // A Google account can have multiple emails at different points in
    // time, but the sub value is never changed. Use sub within your application
    // as the unique-identifier key for the user.
    sub: string;
    // The client_id of the authorized presenter. This claim is only needed when
    // the party requesting the ID token is not the same as the audience of the ID token.
    // This may be the case at Google for hybrid apps where a web
    // application and Android app have a different client_id but share the same
    // project.
    azp?: string;
    // The user's email address. This may not be unique and is not suitable for
    // use as a primary key. Provided only if your scope included the string "email".
    email?: string;
    // The URL of the user's profile page. Might be provided when:
    // - The request scope included the string "profile"
    // - The ID token is returned from a token refresh
    // - When profile claims are present, you can use them to update your app's
    // user records. Note that this claim is never guaranteed to be present.
    profile?: string;
    // The URL of the user's profile picture. Might be provided when:
    // - The request scope included the string "profile"
    // - The ID token is returned from a token refresh
    // - When picture claims are present, you can use them to update your app's
    // user records. Note that this claim is never guaranteed to be present.
    picture?: string;
    // The user's full name, in a displayable form. Might be provided when:
    // - The request scope included the string "profile"
    // - The ID token is returned from a token refresh
    // - When name claims are present, you can use them to update your app's user
    // records. Note that this claim is never guaranteed to be present.
    name?: string;
    // The user's given name, in a displayable form. Might be provided when:
    // - The request scope included the string "profile"
    // - The ID token is returned from a token refresh
    // - When name claims are present, you can use them to update your app's user
    // records. Note that this claim is never guaranteed to be present.
    given_name?: string;
    // The user's family name, in a displayable form. Might be provided when:
    // - The request scope included the string "profile"
    // - The ID token is returned from a token refresh
    // - When name claims are present, you can use them to update your app's user
    // records. Note that this claim is never guaranteed to be present.
    family_name?: string;
    // Identifies the audience that this ID token is intended for. It must be one
    // of the OAuth 2.0 client IDs of your application.
    aud: string;
    // The time the ID token was issued, represented in Unix time (integer seconds).
    iat: number;
    // The time the ID token expires, represented in Unix time (integer seconds).
    exp: number;
    // The value of the nonce supplied by your app in the authentication request.  
    // You should enforce protection against replay attacks by ensuring it is presented only once.
    nonce?: string;
    // The hosted G Suite domain of the user. Provided only if the user belongs to a hosted domain.
    hd?: string;
}

export class Credentials {
    //Nombre de usuario.
    @IsDefined({
        message: 'El campo es requerido.'
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @IsEmail(undefined, {
        message: 'El campo $property no tiene el formato correcto.'
    })
    //@MaxLength(10, {
    //    message: 'El campo $property tiene una longitud máxima a la esperada.'
    //})
    username: string;
    //Contraseña.
    @IsDefined({
        message: 'El campo es requerido.'
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    //@MaxLength(3, {
    //    message: 'El campo $property tiene una longitud máxima a la esperada.'
    //})
    password: string;
}

export class AuthenticationModel {
    
    private username: string;
    private password: string;
    private client = new OAuth2Client(configuration.google.oAuth.clientID);

    constructor(username?: string, password?: string) {
        this.username = username || '';
        this.password = password || '';
    }

    // TODO: Agregar la URL a la audiencia permitida por el token y validarlo posteriormente.
    
    public login(): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
            //V   V A   A L       I   D   D A   A C       I   O   O NN  N
            //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
            // V V  A   A L       I   D   D A   A C       I   O   O N  NN
            //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

            let credentials = new Credentials();
            credentials.username = this.username;
            credentials.password = this.password;
            validate(credentials, { skipMissingProperties: true })
            .then((errors: any) => {
                if (errors.length > 0) {
                    let errorsWithConstraints: any[] = RemodelErrors(errors);
                    return reject({
                        status: 404,
                        module: 'Autenticación',
                        message: 'La información no es válida.',
                        errors: errorsWithConstraints
                    });
                }
            });

            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T

            axios.post(configuration.services.domain.users.validate, {
                email: this.username,
                password: this.password
            })
            .then((response: any) => {
                return resolve({
                    data: idx(response, _ => _.data.data) || {}
                });
            })
            .catch((error: any) => {
                return reject({
                    status: 404,
                    module: 'Autenticación',
                    message: 'Ocurrió un error al intentar autenticar al usuario.',
                    error
                });
            });
        });
    }

    public postAuthenticateWithGoogle(body: any, userAgent?: string, zUserAgent?: string | string[] | undefined): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { token } = body;
            userAgent = (typeof userAgent === 'string' && userAgent.length > 0) ? userAgent.toLowerCase() : 'unknown';

            // GGGG  OOO   OOO   GGGG L     EEEEE
            //G     O   O O   O G     L     E
            //G  GG O   O O   O G  GG L     EEE
            //G   G O   O O   O G   G L     E
            // GGGG  OOO   OOO   GGGG LLLLL EEEEE

            let ticket: any;
            let payload: TokenPayload | undefined;
            let audience: string = configuration.google.oAuth.clientID;
            // NOTE: Se revisa si la petición de autenticación viene de una aplicaclión móvil.
            if(userAgent.indexOf('okhttp') >= 0) {
                // NOTE: Si lo es, se revisa de cuál aplicación... ya que el ID cambia.
                if(zUserAgent && typeof zUserAgent === 'string') {
                    switch(zUserAgent.toLowerCase()) {
                        case 'odxapp':
                            audience = configuration.google.oAuth.androidID.ODXApp;
                            break;
                        case 'salesapp':
                        default:
                            audience = configuration.google.oAuth.androidID.SalesApp;
                            break;
                    }
                } else {
                    audience = configuration.google.oAuth.androidID.SalesApp;
                }
            }
            try {
                ticket = await this.client.verifyIdToken({
                    idToken: token,
                    audience // : configuration.google.oAuth.clientID
                });
                // console.log(`[postAuthenticateWithGoogle] TICKET: ${ticket}`);
                payload = ticket.getPayload();
                // console.log(`[postAuthenticateWithGoogle] PAYLOAD: ${payload}`);
            } catch(error) {
                console.log('==================== ERROR ====================\n', error);
                // console.log(error);
                return reject({
                    status: 404,
                    module: 'Autenticación',
                    message: 'No se pudo verificar la información del usuario en Google.',
                    error: JSON.stringify(error)
                });
            }
            // const userid = payload.sub;      // Identificador del usuario en Google.
            /*
            { 
                iss: 'accounts.google.com',
                azp: '24758197066-rb9g9nmr65kkfjq25tuvegrdjv5skogu.apps.googleusercontent.com',
                aud: '24758197066-rb9g9nmr65kkfjq25tuvegrdjv5skogu.apps.googleusercontent.com',
                sub: '103253495274255210782',
                hd: 'domain.com',
                email: 'frodriguez@domain.com',
                email_verified: true,
                at_hash: 'ikwJHhtq_5kg3KgHt9BUxA',
                name: 'Francisco Rodriguez Domain',
                picture: 'https://lh5.googleusercontent.com/-_h1uU9fotrs/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3reJgIRfxLI8a0TiGGuvNgMnZZteig/s96-c/photo.jpg',
                given_name: 'Francisco',
                family_name: 'Rodriguez Domain',
                locale: 'en',
                iat: 1554921134,
                exp: 1554924734,
                jti: 'e31609aed562bef42e54d4b126178b85076a5612' 
            }
            */
            if(payload) {
                // console.log(payload);
                let { hd, email, email_verified, sub } = payload;
                // console.log(`Usuario: ${email}`);
                if(email_verified && configuration.google.oAuth.validDomains.indexOf(hd) >= 0) {
                    
                    //L      OOO   CCCC  AAA  L
                    //L     O   O C     A   A L
                    //L     O   O C     AAAAA L
                    //L     O   O C     A   A L
                    //LLLLL  OOO   CCCC A   A LLLLL

                    let userModel = new UserModel();
                    let _user: any = {};
                    try {
                        _user = await userModel.getUser({ email });
                    } catch(error) {
                        // console.log('USUARIO: ', error);
                        return reject(error);
                    }
                    if(_user) {
                        // NOTE: Obtener los permisos por módulos y cifrarlos de alguna manera en el token...
                        let permissions = userPermissions(_user);
                        // console.log(`PERMISOS: ${JSON.stringify(permissions)}`);
                        // imagen
                        // name
                        return resolve({
                            id: sub,
                            email,
                            permissions,
                            user: _user,
                            name: payload.name,
                            picture: payload.picture
                        });
                    } else {
                        // console.log({
                        //     status: 404,
                        //     module: 'Autenticación',
                        //     message: 'No se pudo verificar la información del usuario de manera local.'
                        // });
                        return reject({
                            status: 404,
                            module: 'Autenticación',
                            message: 'No se pudo verificar la información del usuario de manera local.'
                        });
                    }
                } else {
                    // console.log({
                    //     status: 404,
                    //     module: 'Autenticación',
                    //     message: 'No se pudo verificar la información del usuario en Google (cuenta no válida o fuera del dominio).'
                    // });
                    return reject({
                        status: 404,
                        module: 'Autenticación',
                        message: 'No se pudo verificar la información del usuario en Google (cuenta no válida o fuera del dominio).'
                    });    
                }
            } else {
                // console.log({
                //     status: 404,
                //     module: 'Autenticación',
                //     message: 'No se pudo verificar la información del usuario en Google (no hay payload).'
                // });
                return reject({
                    status: 404,
                    module: 'Autenticación',
                    message: 'No se pudo verificar la información del usuario en Google (no hay payload).'
                });
            }
        });
    }

    public login4Clients(body: any, origin?: string | undefined): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let { folio, password } = body;
            if(typeof folio === 'number' && typeof password === 'string') {
                // Se valida el usuario.
                let clientUser: ClientUser = new ClientUser();
                let clientUserModel: ClientUserModel = new ClientUserModel();
                try {
                    clientUser = await clientUserModel.validatePassword({ folio, password });
                } catch(error) {
                    return reject(error);
                }
                // Se revisa el estatus del cliente.
                if(clientUser.statusValue !== 'inactive') {

                    //JJJJJ W   W TTTTT
                    //  J   W   W   T
                    //  J   W W W   T
                    //J J   WW WW   T
                    // J    W   W   T
                    
                    // Si la información existe y es válida, se crea el token y se devuelve.
                    let newJWT = new authorizationJWT.JWT();
                    let options = {
                        algorithm: authorizationJWT.Algorithm.HS256,
                        expiresIn: configuration.jwt.expiresIn,
                        audience: origin || configuration.jwt.audience,
                        issuer: configuration.jwt.issuer
                    };
                    let publicClaims: any = {};
                    let privateClaims: any = {
                        user: folio,
                        type: 'client'
                    };
                    newJWT.create(options, publicClaims, privateClaims, (error: any, token: any) => {
                        if(error) {
                            return reject({
                                status: 400,
                                module: 'Autenticación',
                                message: 'Ocurrió un error al intentar generar el token.'
                            });
                        } else {
                            return resolve({
                                token,
                                status: clientUser.statusValue
                            });
                        }
                    });
                } else {
                    return reject({
                        status: 400,
                        module: 'Autenticación',
                        message: 'El cliente se encuentra inactivo.'
                    });
                }
            } else {
                return reject({
                    status: 400,
                    module: 'Autenticación',
                    message: 'El folio del cliente y la contraseña son obligatorios.'
                });
            }
        });
    }

    public login4Distributors(body: any, origin?: string | undefined): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let { folio, password }: { folio: number, password: string } = body;
            if(folio && password) {
                // Se valida el usuario.
                let clientUser: ClientUser = new ClientUser();
                let clientUserModel: ClientUserModel = new ClientUserModel();
                try {
                    clientUser = await clientUserModel.validatePassword({ folio, password });
                } catch(error) {
                    return reject(error);
                }
                // Se revisa el estatus del cliente.
                if(clientUser.statusValue !== 'inactive') {

                    // CCCC U   U EEEEE N   N TTTTT  AAA   SSSS
                    //C     U   U E     NN  N   T   A   A S
                    //C     U   U EEE   N N N   T   AAAAA  SSS
                    //C     U   U E     N  NN   T   A   A     S
                    // CCCC  UUU  EEEEE N   N   T   A   A SSSS

                    // Se revia que el cliente sea del tipo distribuidor.
                    let accountModel: AccountModel = new AccountModel();
                    let account: Account = new Account();
                    try {
                        let getAccounts: { results: Array<Account>, summary: any } = await accountModel.getAccounts({ clientId: folio, typeValue: 'distributor' });
                        if(getAccounts.results.length > 0) {
                            account = getAccounts.results[0];
                        } else {
                            return reject({
                                status: 404,
                                module: 'Autenticación',
                                message: 'El cliente no es distribuidor.'
                            });
                        }
                    } catch(error) {
                        return reject(error);
                    }

                    //JJJJJ W   W TTTTT
                    //  J   W   W   T
                    //  J   W W W   T
                    //J J   WW WW   T
                    // J    W   W   T
                    
                    // Si la información existe y es válida, se crea el token y se devuelve.
                    let newJWT = new authorizationJWT.JWT();
                    let options = {
                        algorithm: authorizationJWT.Algorithm.HS256,
                        expiresIn: configuration.jwt.expiresIn,
                        audience: origin || configuration.jwt.audience,
                        issuer: configuration.jwt.issuer
                    };
                    let publicClaims: any = {};
                    let privateClaims: any = {
                        user: folio,
                        accountNumber: account.accountNumber,
                        type: 'distributor'
                    };
                    newJWT.create(options, publicClaims, privateClaims, (error: any, token: any) => {
                        if(error) {
                            return reject({
                                status: 400,
                                module: 'Autenticación',
                                message: 'Ocurrió un error al intentar generar el token.'
                            });
                        } else {
                            return resolve({
                                token,
                                account,
                                status: clientUser.statusValue
                            });
                        }
                    });
                } else {
                    return reject({
                        status: 400,
                        module: 'Autenticación',
                        message: 'El cliente se encuentra inactivo.'
                    });
                }
            } else {
                return reject({
                    status: 400,
                    module: 'Autenticación',
                    message: 'El folio del cliente y la contraseña son obligatorios.'
                });
            }
        });
    }

    public loginWithDN(body: any, origin?: string | undefined): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { msisdn, ...rest }: { msisdn: string } & any = body;

            // CCCC U   U EEEEE N   N TTTTT  AAA
            //C     U   U E     NN  N   T   A   A
            //C     U   U EEE   N N N   T   AAAAA
            //C     U   U E     N  NN   T   A   A
            // CCCC  UUU  EEEEE N   N   T   A   A

            // 1. Se debe buscar la cuenta usando el DN.
            let account: Account = new Account();
            let accountModel: AccountModel = new AccountModel();
            try {
                // OPCIÓN #1.
                /*
                account = await accountModel.getAccount({ phone: msisdn });
                // @ts-ignore
                let categoryValue: string = account.product.categoryValue || '';
                if(['MV104', 'SC103'].indexOf(categoryValue) < 0) {
                    return reject({
                        status: 400,
	                    module: 'Autenticación',
	                    message: 'La cuenta no pertenece a las categorías de movilidad o sin cables.'
                    });
                }
                if(account.statusValue === 'inactive') {
                    return reject({
                        status: 400,
	                    module: 'Autenticación',
	                    message: 'La cuenta está inactiva.'
                    });
                }
                */
                // OPCIÓN #2.
                let getAccounts: { results: Array<Account>, summary: any } = await accountModel.getAccounts({ phone: msisdn });
                let accountFound: boolean = false;
                for(let index: number = 0; index < getAccounts.results.length; index++) {
                    if(getAccounts.results[index].accountNumber.indexOf('MV104') >= 0 || getAccounts.results[index].accountNumber.indexOf('SC103') >= 0) {
                        account = getAccounts.results[index];
                        accountFound = true;
                        break;
                    }
                }
                if(!accountFound) {
                    return reject({
                        status: 400,
	                    module: 'Autenticación',
	                    message: 'La cuenta no pertenece a las categorías de movilidad o sin cables.'
                    });
                } else if(account.statusValue === 'inactive') {
                    return reject({
                        status: 400,
	                    module: 'Autenticación',
	                    message: 'La cuenta está inactiva.'
                    });
                }
            } catch(error) {
                return reject(error);
            }

            // Máximos en Altán.
            // Datos = 25Gb
            // Minutos = 1500
            // SMS = 600

            // 2. Crear token de autenticación usando los datos de la cuenta.
            
            //JJJJJ W   W TTTTT
            //  J   W   W   T
            //  J   W W W   T
            //J J   WW WW   T
            // J    W   W   T
            
            let newJWT = new authorizationJWT.JWT();
            let options = {
                algorithm: authorizationJWT.Algorithm.HS256,
                expiresIn: configuration.jwt.expiresIn,
                audience: origin || configuration.jwt.audience,
                issuer: configuration.jwt.issuer
            };
            let publicClaims: any = {};
            let privateClaims: any = {
                user: account.accountNumber,
                type: 'account'
            };
            newJWT.create(options, publicClaims, privateClaims, (error: any, token: any) => {
                if(error) {
                    return reject({
                        status: 400,
                        module: 'Autenticación',
                        message: 'Ocurrió un error al intentar generar el token.'
                    });
                } else {
                    return resolve({
                        token,
                        account
                    });
                }
            });
        });
    }

}