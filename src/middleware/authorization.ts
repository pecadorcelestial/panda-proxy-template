//NOTA: Sólo se utiliza en el servidor de APIs REST.
//      Para las rutas, la autorización se hace desde la redirección.

import * as express from 'express';

// declare global {
//     namespace Express {
//         interface Request {
//             user?: string
//         }
//     }
// }

import idx from 'idx';
import * as authorizationJWT from '../classes/jwt';

import { parseCookies } from '../scripts/data-management';
import { pluralize } from '../scripts/strings';
import UserModel, { User } from '../models/users';

const authorizationErrors: string[] = [
    /* Videojuegos */
    'Lo sentimos, pero la autorización que buscas está en otro sitio. \ud83c\udf44',
    'Es peligroso ir solo y sin autorización, toma esto -> \u2694\ufe0f',
    'Debes vencer a Sheng Long para tener autorización. \ud83e\udd4a',
    '¿Token?... ¿Tokeeen?... ¡TOOOKEEEEEEN! \ud83d\udc0d',
    /* Películas */
    'Why so unauthorized? \ud83e\udd21',
    'Toto, tengo la sensación de que ya no estamos autorizados. \ud83d\udc36',
    'May the blocked request be with you.',
    'Un usuario sin autorización intentó accesar una vez, le quité la petición y la comí con alubias y un delicioso Chianti. \ud83e\udd2b \ud83d\udc11',
    'Show me the token! \ud83c\udfc8',
    'Hasta la vista, baby. \ud83d\ude0e',
    'Veo peticiones no autorizadas. \ud83d\udc7b',
    'Houston, tenemos un problema. \ud83d\ude80',
    'You\'re gonna need a bigger token. \ud83e\udd88',
    'You\'ve got to ask yourself one question: "Do I feel authorized?" Well, do ya, punk?',
    'You shall not pass! \ud83e\uddd9',
    /* Rechazadas */
    /*'¿Me hablas a mi?',*/
    /*'E.T. Petición. Denegada.',*/
    /*'I\'ll be back.',*/
    /* ---------- */
    '¿Qué autorización Ramirez?, ¿qué autorización?, ahorita, dame un seguindito y te digo si es o no es... a ver... \ud83d\udc6e',
    'Ahorita vemos qué onda... a ver... ahorita vemos qué pedo... mmm no, no todavía no \ud83d\udc6e',
    ' - Yo creo que es mejor idea esperar los resultados de la autenticación.\n\r - Tranquila y yo nerviosa ¿si?.\n\r - Es que no estoy segura de que sea buena... \ud83d\ude32',
    '¡wuuu!, ¡Santa madre! ahorita vemos qué pedo, qué pedal, qué jais, qué rollo ¡QUÉ PEDRO PINCHE PABLO! \ud83d\udc6e',
    'juuu... juuu... juuu... juuu... ¡Que se armen los pinches chingadazos!, pe, pi, po, ¡pum! \ud83d\udc6e',
    'Me están dando ganas de bailar un pinche cumbión bien loco, un pinche cumbión bien loco... ¿Qué me ves Ramirez?, ¿qué me ves? \ud83d\udc6e',
    'Bueno, ¿y supo si sí era o no? Nel, no está autenticado... es harina... \ud83d\udc6e',
    'Ay papaya de Celaya... ¡Ay Papantla tus hijos vuelan!... ¡Vamonos perras! ¡arrr! ¡arrr! \ud83d\udc6e'
];

const BisonQuoteESP: string = 'Para usted, el día que el Proxy le denegó el acceso fue el día más importante de su vida. Pero para mi... fue lunes \ud83d\udc80';
const BisonQuoteENG: string = 'For you, the day Proxy denied your access was the most important day of your life. But for me... it was tuesday \ud83d\udc80';

const publicPaths: Array<string> = [
    '/',
    '/account/assignPaymentReferencesAutomatically',
    '/contacts',                        // NOTE: Se expone para operaciones sin autenticación para el portal de cliente.
    '/google/coordinates2Address',
    '/login',
    '/login/client',
    '/login/distributor',
    '/loginWithGoogle',
    '/loginWithDN',
    '/notifications/email',
    '/signOff',
    '/signOff/domain',
    '/user/permissions',
    '/user/client',                     // NOTE: Se expone para operaciones sin autenticación para el portal de cliente.
    '/zipCodes',
    '/catalogs/countries',
    '/catalogs/states',
    '/catalogs/towns',
    '/catalogs/settlements',
    '/altan/service/availability',
    '/altan/activate',
    '/altan/products',
    '/altan/imei/status',
    '/processes/accounts/receipts',     // TODO: Quitar ya que es temporal.
    '/conekta/webhook',                 // NOTE: Se expone sin autenticación para la respuesta del servicio CONEKTA.
];

const clientAllowedPaths: Array<string> = [
    '/account',
    '/address',
    '/client',
    '/conekta/order/retailer',
    '/contact',
    '/contacts',
    '/utilities/barcode'
];

interface IPermission {
    module: string;
    permissions: string;
};

export default class AppAuthorization {

    constructor() {}

    public validateCookie(app: express.Application): void {
        app.use((request: express.Request, response: express.Response, next: express.NextFunction) => 
        {
            // Se revisa si la URL solicitada es de acceso público.
            let pathParts: Array<string> = request.path.split('/');
            pathParts = pathParts.filter((item: string) => {
                return item != '';
            });
            // Módulo.
            let module: string = pathParts[0];
            // console.log('[SERVIDOR][APP][validateCookie] URL: ', request.path);
            // console.log('[SERVIDOR][APP][validateCookie] Método: ', request.method);
            // console.log('[SERVIDOR][APP][validateCookie] Encabezados: ', request.headers);
            // console.log('[SERVIDOR][APP][validateCookie] Cookies: ', request.headers.cookie);
            if(publicPaths.indexOf(request.path) >= 0 || request.path.indexOf('/public') === 0 || request.path.indexOf('/uploads') === 0 || request.path.indexOf('/payment-response') === 0 || request.path.indexOf('/openpay/webhook') === 0) {
                // Si lo es se deja continuar.
                next();
            } else {
                // Mensaje de rechazo:
                let message: string = authorizationErrors[Math.floor(Math.random() * authorizationErrors.length)] || 'No estás autorizado a estar aquí. Buen día :)';
                switch(new Date().getDay()) {
                    case 1:
                        message = BisonQuoteESP;
                        break;
                    case 2:
                        message = BisonQuoteENG;
                        break;
                }
                // Cookies.
                let cookies: any = parseCookies(request.headers.cookie);
                // console.log(`[COOKIES]: ${JSON.stringify(cookies)}`);
                if(cookies && cookies.ientcToken) {
                    // console.log(`[COOKIE]: ${(cookies.ientcToken)}`);
                    let newJWT = new authorizationJWT.JWT(cookies.ientcToken);
                    let options = {
                        algorithms: [authorizationJWT.Algorithm.HS256]
                    };
                    newJWT.validate(options, async (error: any, result: any) => {
                        if(error) {
                            return response.status(407).end(JSON.stringify({
                                message
                            }));
                        } else {
                            // TODO: Aquí falta validar la audiencia, editor, correo, etc.
                            // Y con base en eso dar permiso dependiendo de la acción requerida y los permisos del usuario.

                            // OOO  RRRR  IIIII  GGGG EEEEE N   N
                            //O   O R   R   I   G     E     NN  N
                            //O   O RRRR    I   G  GG EEE   N N N
                            //O   O R   R   I   G   G E     N  NN
                            // OOO  R   R IIIII  GGGG EEEEE N   N

                            // console.log(result);
                            let userAgent: string | undefined = request.headers['user-agent'];
                            let audience: string = result.aud;
                            let origin: string | undefined = request.get('origin');
                            // console.log(request.headers);
                            // console.log('[SERVIDOR][APP][validateCookie] Agente: ', userAgent);
                            // console.log('[SERVIDOR][APP][validateCookie] Audiencia: ', audience);
                            // console.log('[SERVIDOR][APP][validateCookie] Origen: ', origin);
                            // NOTE: Se debe revisar que la petición no venga de la aplicación móvil.
                            if((!userAgent || userAgent.indexOf('okhttp') < 0) && audience !== origin) {
                                console.log('La audiencia y el origen son distintos.');
                                return response.status(407).end(JSON.stringify({
                                    message
                                }));
                            }

                            // SSSS IIIII  GGGG U   U IIIII EEEEE N   N TTTTT EEEEE
                            //S       I   G     U   U   I   E     NN  N   T   E
                            // SSS    I   G  GG U   U   I   EEE   N N N   T   EEE
                            //    S   I   G   G U   U   I   E     N  NN   T   E
                            //SSSS  IIIII  GGGG  UUU  IIIII EEEEE N   N   T   EEEEE

                            try {
                                request.user = result.user;
                            } catch(error) {}
                            let environment: string = (process.env.NODE_ENV || 'development').toString();
                            let environments: Array<string> = ['local', 'development'];
                            if(environments.indexOf(environment.toLowerCase().trim()) >= 0) {
                                return next();
                            }

                            //PPPP  EEEEE RRRR  M   M IIIII  SSSS  OOO   SSSS
                            //P   P E     R   R MM MM   I   S     O   O S
                            //PPPP  EEE   RRRR  M M M   I    SSS  O   O  SSS
                            //P     E     R   R M   M   I       S O   O     S
                            //P     EEEEE R   R M   M IIIII SSSS   OOO  SSSS

                            // TODO: ¡IMPLEMENTAR PERMISOS PARA ESTOS USUARIOS!
                            if(['client', 'account', 'distributor'].indexOf(result.type) >= 0) {
                                next();
                            } else {
                                let userIsAllowedToDoThis: boolean = await this.isUserAllowedToDoThis(result.user, request.path, request.method);
                                if(userIsAllowedToDoThis) {
                                    next();
                                } else {
                                    return response.status(407).end(JSON.stringify({
                                        message: authorizationErrors[Math.floor(Math.random() * authorizationErrors.length)] || 'No estás autorizado a estar aquí. Buen día :)'
                                    }));
                                }
                            }
                        }
                    });
                } else {
                    // console.log(`[ERROR]: No se encontró la cookie de Domain.`);
                    return response.status(407).end(JSON.stringify({
                        message
                    }));
                }
            }
        });
    }

    public validateHeader(app: express.Application): void {
        app.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
            // Se revisa si la URL solicitada es de acceso público.
            // console.log('[SERVIDOR][APPAPP][validateHeader] URL: ', request.path);
            // console.log('[SERVIDOR][][validateHeader] Método: ', request.method);
            if(publicPaths.indexOf(request.path) >= 0 || request.path.indexOf('/public') === 0 || request.path.indexOf('/uploads') === 0 || request.path.indexOf('/payment-response') === 0 || request.path.indexOf('/openpay/webhook') === 0) {
                // Si lo es se deja continuar.
                next();
            } else {
                // Mensaje de rechazo:
                let message: string = authorizationErrors[Math.floor(Math.random() * authorizationErrors.length)] || 'No estás autorizado a estar aquí. Buen día :)';
                switch(new Date().getDay()) {
                    case 1:
                        message = BisonQuoteESP;
                        break;
                    case 2:
                        message = BisonQuoteENG;
                        break;
                }
                // De lo contrario se debe revisar el encabezado de autorización.
                let token: string = idx(request, _ => _.headers.authorization) || '';
                if(token) {
                    let newJWT = new authorizationJWT.JWT(token);
                    let options = {
                        algorithms: [authorizationJWT.Algorithm.HS256]
                    };
                    newJWT.validate(options, async (error: any, result: any) => {
                        if(error) {
                            return response.status(407).end(JSON.stringify({
                                message
                            }));
                        } else {
                            // TODO: Aquí falta validar la audiencia, editor, correo, etc.
                            // Y con base en eso dar permiso dependiendo de la acción requerida y los permisos del usuario.

                            // SSSS IIIII  GGGG U   U IIIII EEEEE N   N TTTTT EEEEE
                            //S       I   G     U   U   I   E     NN  N   T   E
                            // SSS    I   G  GG U   U   I   EEE   N N N   T   EEE
                            //    S   I   G   G U   U   I   E     N  NN   T   E
                            //SSSS  IIIII  GGGG  UUU  IIIII EEEEE N   N   T   EEEEE

                            try {                                
                                request.user = result.user;
                            } catch(error) {}
                            let environment: string = (process.env.NODE_ENV || 'development').toString();
                            let environments: Array<string> = ['local', 'development'];
                            if(environments.indexOf(environment.toLowerCase().trim()) >= 0) {
                                return next();
                            }
                            
                            //PPPP  EEEEE RRRR  M   M IIIII  SSSS  OOO   SSSS
                            //P   P E     R   R MM MM   I   S     O   O S
                            //PPPP  EEE   RRRR  M M M   I    SSS  O   O  SSS
                            //P     E     R   R M   M   I       S O   O     S
                            //P     EEEEE R   R M   M IIIII SSSS   OOO  SSSS

                            // NOTE: Por ahora se revisa si el tipo en el resultado es cliente, y no se revisan los permisos.
                            // FIX: Validar rutas específicas que utilizarán desde el portal de clientes.
                            if(['client', 'account'].indexOf(result.type) >= 0) {
                                next();
                            } else {
                                let userIsAllowedToDoThis: boolean = await this.isUserAllowedToDoThis(result.user, request.path, request.method);
                                if(userIsAllowedToDoThis) {
                                    return next();
                                } else {
                                    return response.status(407).end(JSON.stringify({
                                        message: authorizationErrors[Math.floor(Math.random() * authorizationErrors.length)] || 'No estás autorizado a estar aquí. Buen día :)'
                                    }));
                                }
                            }
                        }
                    });
                } else {
                    return response.status(407).end(JSON.stringify({
                        message
                    }));
                }
            }
        });
    }

    public helper(app: express.Application): void {
        app.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
            // console.log('[SERVIDOR][APPAPP][helper] URL: ', request.path);
            // console.log('[SERVIDOR][APPAPP][helper] Headers: ', request.headers);
            next();
        });
    }

    //PPPP  EEEEE RRRR  M   M IIIII  SSSS  OOO   SSSS
    //P   P E     R   R MM MM   I   S     O   O S
    //PPPP  EEE   RRRR  M M M   I    SSS  O   O  SSS
    //P     E     R   R M   M   I       S O   O     S
    //P     EEEEE R   R M   M IIIII SSSS   OOO  SSSS

    private async isUserAllowedToDoThis(email: string, path: string, method: string): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // 0. Obtener el módulo correspondiente a la ruta.
            // P. ej.: 
            //       - Ruta = /clients ó /client
            //       - Módulo = clients
            let pathParts: Array<string> = path.split('/');
            pathParts = pathParts.filter((item: string) => {
                return item != '';
            });
            // Módulo.
            let module: string = pathParts[0];
            module = module.replace('/', '');
            // Revisar si es:
            // a) Catálogos.
            if(module === 'catalogs') {
                // module = pathParts[1];
                // module = module.replace('/', '');
                // FIX: Por ahora todos los procesos son públicos
                return resolve(true);
            }
            // b) Proceso.
            if(module === 'processes') {
                // FIX: Por ahora todos los procesos son públicos
                return resolve(true);
            }
            // c) Archivos.
            if(module === 'uploads') {
                // FIX: Por ahora todos los archivos son públicos
                return resolve(true);
            }
            // 1. Permisos.
            let permissions: Array<IPermission> = [];
            let userModel: UserModel = new UserModel();
            try {
                let userProfile: { email: string, permissions: Array<IPermission>, user: User } = await userModel.getUserPermissions({ email });
                permissions = userProfile.permissions;
            } catch(error) {
                return resolve(false);
            }
            // 2. Obtener la operación a ejecutar: GET, POST, PUT o DELETE.
            // method = method.trim().toUpperCase();
            let requestType: string = '';
            switch(method.trim().toUpperCase()) {
                case 'GET':
                    requestType = 'R';
                    break;
                case 'POST':
                    requestType = 'C';
                    break;
                case 'PUT':
                    requestType = 'U';
                    break;
                case 'DELTE':
                    requestType = 'D';
                    break;
            }
            // 3. Revisar si el usuario tiene dicho permiso.
            /*
            permissions: [ 
                { 
                    module: 'clients', 
                    permissions: 'CRUDA' 
                },
                { 
                    module: 'services', 
                    permissions: 'CRUDA' 
                } 
            ]
            */
            let grantAccess: boolean = false;
            if(Array.isArray(permissions) && permissions.length > 0) {
                for(const permission of permissions) {
                    // TODO: Se deben tratar nombres de módulos "especiales", p. ej.: "odx".
                    switch(module){
                        case 'altan':
                            if(['altan', 'altans'].indexOf(permission.module.trim().toLowerCase())) {
                                if(permission.permissions.indexOf(requestType) >= 0) {
                                    grantAccess = true;
                                } else {
                                    // Se deben continuar revisando el arreglo de peticiones.
                                    continue;
                                }
                            }
                            break;
                        // ÓRDENES DE TRABAJO / INSTALACIÓN / SERVICIO.
                        case 'odx':
                        case 'odxs':
                            if(['odx', 'odxs'].indexOf(permission.module.trim().toLowerCase())) {
                                if(permission.permissions.indexOf(requestType) >= 0) {
                                    grantAccess = true;
                                } else {
                                    // Se deben continuar revisando el arreglo de peticiones.
                                    continue;
                                }
                            }
                            break;
                        // REPORTES.
                        case 'report':
                        case 'reports':
                            // FINANZAS.
                            // PAGOS.
                            if(pathParts.indexOf('finance') >= 0 && pathParts.indexOf('collection') >= 0) {
                                if(['payment', 'payments'].indexOf(permission.module.trim().toLowerCase())) {
                                    if(permission.permissions.indexOf(requestType) >= 0) {
                                        grantAccess = true;
                                        break;
                                    } else {
                                        // Se deben continuar revisando el arreglo de peticiones.
                                        continue;
                                    }
                                }
                            }
                            // FACTURACIÓN.
                            if(pathParts.indexOf('finance') >= 0 && pathParts.indexOf('billing') >= 0) {
                                if(['invoice', 'invoices'].indexOf(permission.module.trim().toLowerCase())) {
                                    if(permission.permissions.indexOf(requestType) >= 0) {
                                        grantAccess = true;
                                        break;
                                    } else {
                                        // Se deben continuar revisando el arreglo de peticiones.
                                        continue;
                                    }
                                }
                            }
                            break;
                        // TELEVISIÓN.
                        case 'tv':
                        case 'tvs':
                            if(['tv', 'tvs'].indexOf(permission.module.trim().toLowerCase())) {
                                if(permission.permissions.indexOf(requestType) >= 0) {
                                    grantAccess = true;
                                } else {
                                    // Se deben continuar revisando el arreglo de peticiones.
                                    continue;
                                }
                            }
                            break;
                        // DEFECTO.
                        default:
                            if(permission.module.trim().toLowerCase() === pluralize(module)) {
                                if(permission.permissions.indexOf(requestType) >= 0) {
                                    grantAccess = true;
                                } else {
                                    // ACCESS DENIED!!!
                                    return resolve(false);
                                }
                            }
                            break;
                    }
                }
                // Se debe revisar si se encontró el módulo dentro de los permisos.
                if(grantAccess) {
                    return resolve(true);
                } else {
                    // ACCESS DENIED!!!
                    return resolve(false);
                }
            } else {
                // ACCESS DENIED!!!
                return resolve(false);
            }
        });
    }

    // TODO: Terminar implementación.
    private async isClientAllowedToDoThis(path: string, method: string): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

        });
    }
};