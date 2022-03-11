import express from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: string,
            resourceId?: string,
            resourceType?: string,
            documentId?: string
        }
    }
}

// IEN[64x_86x&*]/tuX

// Módulos.
import path from 'path';
import bodyParser from 'body-parser';
// Rutas.
import Routes from './routes/routes';
// Middleware.
import AppConfiguration from './middleware/configuration';
import AppAuthorization from './middleware/authorization';
// Constantes.
import { CATALOGS, CATALOGS_ES } from './constants/constants';
// Modelos.
import EventModel, { Event } from './models/events';
import { ODX } from './models/odxs';
// Funciones.
import { getFieldNameInSpanish } from './scripts/parameters';
import { isEmpty } from './scripts/object-prototypes';

class App {

    public app: express.Application;
    public appConfiguration: AppConfiguration = new AppConfiguration();
    private appAuthorization: AppAuthorization = new AppAuthorization();

    constructor() {
        this.app = express();
        this.config();
    }

    private config(): void{

        // AAA  N   N TTTTT EEEEE  SSSS
        //A   A NN  N   T   E     S
        //AAAAA N N N   T   EEE    SSS
        //A   A N  NN   T   E         S
        //A   A N   N   T   EEEEE SSSS

        // Opción que permite soporte para "Content-Type: application/json" en el payload.
        this.app.use(bodyParser.json({ limit: '50mb' }));
        // Opción que permite soporte para "Content-Type: application/x-www-form-urlencoded" en el payload.
        this.app.use(bodyParser.urlencoded({ extended: false }));
        // Encabezados:
        this.appConfiguration.setResponseHeaders(this.app);
        // Manejo de rechazos no manejados:
        this.appConfiguration.unhandledRejection();
        
        // AAA  M   M BBBB  IIIII EEEEE N   N TTTTT EEEEE
        //A   A MM MM B   B   I   E     NN  N   T   E
        //AAAAA M M M BBBB    I   EEE   N N N   T   EEE
        //A   A M   M B   B   I   E     N  NN   T   E
        //A   A M   M BBBB  IIIII EEEEE N   N   T   EEEEE

        this.appAuthorization.helper(this.app);
        // Si es "local", se validan los encabezados (para pruebas es más sencillo).
        // let environment: string = process.env.NODE_ENV || 'development';
        // if(environment.toLowerCase().trim() === 'local'/* || environment.toLowerCase().trim() === 'development'*/) {
        //     // Validación del encabezado de autorización:
        //     this.appAuthorization.validateHeader(this.app);
        // } else {
        //     // Validación de la cookie de autorización.
        //     this.appAuthorization.validateCookie(this.app);
        // }

        //RRRR  U   U TTTTT  AAA   SSSS
        //R   R U   U   T   A   A S
        //RRRR  U   U   T   AAAAA  SSS
        //R   R U   U   T   A   A     S
        //R   R  UUU    T   A   A SSSS
        
        // Rutas.
        this.app.use(Routes);
        // Folder público.
        this.app.use('/public', express.static(path.join(__dirname, 'public')));
        
        //DDDD  EEEEE  SSSS PPPP  U   U EEEEE  SSSS
        //D   D E     S     P   P U   U E     S
        //D   D EEE    SSS  PPPP  U   U EEE    SSS
        //D   D E         S P     U   U E         S
        //DDDD  EEEEE SSSS  P      UUU  EEEEE SSSS

        // TODO: Mover esta función a un archivo diferente.
        this.app.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
            
            //EEEEE V   V EEEEE N   N TTTTT  OOO
            //E     V   V E     NN  N   T   O   O
            //EEE   V   V EEE   N N N   T   O   O
            //E      V V  E     N  NN   T   O   O
            //EEEEE   V   EEEEE N   N   T    OOO

            let user: string = (!request.user || request.user === 'undefined') ? 'controlinterno_B' : request.user;
            let eventModel: EventModel = new EventModel();
            let body: any = {};
            // Recurso.
            let pathParts: Array<string> = request.path.split('/');
            let resource: string = '';
            resource = pathParts[pathParts.length - 1];

            // CCCC  AAA   SSSS  OOO   SSSS      EEEEE  SSSS PPPP  EEEEE  CCCC IIIII  AAA  L     EEEEE  SSSS
            //C     A   A S     O   O S          E     S     P   P E     C       I   A   A L     E     S
            //C     AAAAA  SSS  O   O  SSS       EEE    SSS  PPPP  EEE   C       I   AAAAA L     EEE    SSS
            //C     A   A     S O   O     S      E         S P     E     C       I   A   A L     E         S
            // CCCC A   A SSSS   OOO  SSSS       EEEEE SSSS  P     EEEEE  CCCC IIIII A   A LLLLL EEEEE SSSS
            
            let event: Event = new Event();
            switch(request.path.toLowerCase()) {
                case '/invoice/v2/cancellation':
                case '/invoice/v2/cancellation/':
                    // Cancelación de factura.
                    body = Object.assign({}, request.body);
                    event = {
                        parentType: request.resourceType ? request.resourceType : resource,
                        parentId: request.resourceId || 'unkown',
                        user,
                        description: 'Cancelación de factura.',
                        comment: `El usuario canceló la factura con folio ${request.documentId}.`,
                        typeValue: 'database'
                    }
                    try {
                        eventModel.postEvent(event);
                    } catch(error) {
                        // console.log('Ocurrió un error al intentar guardar el evento: ', error);
                    } finally {
                        next();
                    }
                    break;
                case '/invoice/v2/creditNote':
                case '/invoice/v2/creditNote/':
                    // Creación de una nota de crédito.
                    body = Object.assign({}, request.body);
                    event = {
                        parentType: request.resourceType ? request.resourceType : resource,
                        parentId: request.resourceId || 'unkown',
                        user,
                        description: 'Creación de una nota de crédito.',
                        comment: `El usuario creó una nota de crédito con folio ${request.documentId}.`,
                        typeValue: 'database'
                    }
                    try {
                        eventModel.postEvent(event);
                    } catch(error) {
                        // console.log('Ocurrió un error al intentar guardar el evento: ', error);
                    } finally {
                        next();
                    }
                    break;
                case '/odx/approval':
                case '/odx/approval/':
                    // Aprobación de una órden de trabajo.
                    body = Object.assign({}, request.body);
                    // Se obtiene el tipo de ODX.
                    let odxType: string = '';
                    try {
                        let odx: ODX = body as ODX;
                        // ODT === Trabajo / Instalación
                        // ODS === Servicio
                        // ODR === Recolección
                        // ODC === Cambio de domicilio
                        switch(odx.typeValue) {
                            case 'ODT':
                                odxType = ' de instalación';
                                break;
                            case 'ODS':
                                odxType = ' de servicio';
                                break;
                            case 'ODR':
                                odxType = ' de recolección';
                                break;
                            case 'ODC':
                                odxType = ' de cambio de domicilio';
                                break;
                        }
                    } catch(error) {}
                    // Evento.
                    event = {
                        parentType: 'account',
                        parentId: request.resourceId || 'unkown',
                        user,
                        description: 'Aprobación de una órden de trabajo.',
                        comment: `El usuario aprobó la órden${odxType} con folio ${request.documentId}.`,
                        typeValue: 'database'
                    }
                    try {
                        eventModel.postEvent(event);
                    } catch(error) {
                        // console.log('Ocurrió un error al intentar guardar el evento: ', error);
                    } finally {
                        next();
                    }
                    break;
            }

            // OOO  PPPP  EEEEE RRRR   AAA   CCCC IIIII  OOO  N   N EEEEE  SSSS
            //O   O P   P E     R   R A   A C       I   O   O NN  N E     S
            //O   O PPPP  EEE   RRRR  AAAAA C       I   O   O N N N EEE    SSS
            //O   O P     E     R   R A   A C       I   O   O N  NN E         S
            // OOO  P     EEEEE R   R A   A  CCCC IIIII  OOO  N   N EEEEE SSSS

            // Operaciones.
            let operation: string = '';
            if(CATALOGS.indexOf(resource) >= 0 && ['POST', 'PUT', 'DELETE'].indexOf(request.method.toUpperCase()) >= 0) {
                switch(request.method.toUpperCase()) {
                    case 'POST':
                        body = Object.assign({}, request.body);
                        operation = 'guardó';
                        break;
                    case 'PUT':
                        body = Object.assign({}, request.body);
                        operation = 'actualizó';
                        break;
                    case 'DELETE':
                        body = Object.assign({}, request.query);
                        operation = 'borró';
                        break;
                }
                
                // CCCC  AAA  M   M PPPP   OOO   SSSS
                //C     A   A MM MM P   P O   O S
                //C     AAAAA M M M PPPP  O   O  SSS
                //C     A   A M   M P     O   O     S
                // CCCC A   A M   M P      OOO  SSSS

                let fields: Array<string> = [];
                let additionalInfo: string = '';
                // NOTE: Por ahora sólo se utilizará en el PUT de cuentas.
                // TODO: Ir habilitando cada catálogo cuando estén listos.
                if(request.method.toUpperCase() === 'PUT' && resource === 'account') {
                    for(let key in body) {
                        if(body.hasOwnProperty(key)) {
                            let field: string = getFieldNameInSpanish(key);
                            if(field) fields.push(field);
                        }
                    }
                    if(fields.length > 0) {
                        let updatedFields: string = '';
                        for(const field of fields) {
                            updatedFields = `${updatedFields}<li>${field}</li>`;
                        }
                        additionalInfo = `</br>Elementos modificados:<ul>${updatedFields}</ul>`;
                    }
                }

                //EEEEE V   V EEEEE N   N TTTTT  OOO
                //E     V   V E     NN  N   T   O   O
                //EEE   V   V EEE   N N N   T   O   O
                //E      V V  E     N  NN   T   O   O
                //EEEEE   V   EEEEE N   N   T    OOO
                
                let catalog: string = CATALOGS_ES[CATALOGS.indexOf(resource)];
                let event: Event = {
                    parentType: request.resourceType ? request.resourceType : resource,
                    parentId: request.resourceId || 'unkown',
                    user,
                    description: 'Modificación a la base de datos.',
                    comment: `El usuario ${operation} un(a) ${catalog}.${additionalInfo}`,
                    typeValue: 'database'
                }
                try {
                    eventModel.postEvent(event);
                } catch(error) {
                    // console.log('Ocurrió un error al intentar guardar el evento: ', error);
                } finally {
                    next();
                }
            } else if(request.path.indexOf('altan') >= 0 ) {

                // AAA  L     TTTTT  AAA  N   N
                //A   A L       T   A   A NN  N
                //AAAAA L       T   AAAAA N N N
                //A   A L       T   A   A N  NN
                //A   A LLLLL   T   A   A N   N
                
                let altanOperation: string = '';
                switch(request.method.toUpperCase()) {
                    case 'POST':
                        body = Object.assign({}, request.body);
                        operation = 'guardó';
                        switch(resource) {
                            case 'activate':
                                altanOperation = `activó el servicio del MSISDN: ${body.msisdn || '(no disponible)'}.`;
                                break;
                            case 'inactivate':
                                altanOperation = `suspendió el servicio del MSISDN: ${body.msisdn || '(no disponible)'}.`;
                                break;
                            case 'resume':
                                altanOperation = `reanudó el servicio del MSISDN: ${body.msisdn || '(no disponible)'}.`;
                                break;
                            case 'predeactivate':
                                altanOperation = `predesactivó el servicio del MSISDN: ${body.msisdn || '(no disponible)'}.`;
                                break;
                            case 'deactivate':
                                altanOperation = `desactivó el servicio del MSISDN: ${body.msisdn || '(no disponible)'}.`;
                                break;
                            case 'reactivate':
                                altanOperation = `reactivó el servicio del MSISDN: ${body.msisdn || '(no disponible)'}.`;
                                break;
                            case 'purchase':
                                altanOperation = `compró uno o más productos adicionales para el servicio del MSISDN: ${body.msisdn || '(no disponible)'}.\nProductos: ${body.offerings || '(no disponible)'}.`;
                                break;
                            case 'lock':
                                altanOperation = `bloqueó el IMEI: ${body.imei || '(no disponible)'}.`;
                                break;
                            case 'unlock':
                                altanOperation = `desbloqueó el IMEI: ${body.imei || '(no disponible)'}.`;
                                break;
                            case 'update':
                                let updateOperation: string = '';
                                if(!isEmpty(body.primaryOffering) && typeof body.primaryOffering.offeringId === 'string') {
                                    updateOperation = `cambió la oferta principal (${body.primaryOffering.offeringId}) del`
                                } else if(!isEmpty(body.changeSubscriberSIM) && typeof body.changeSubscriberSIM.newIccid === 'string') {
                                    updateOperation = `cambió la SIM (${body.changeSubscriberSIM.newIccid}) asignada al`
                                } else if(!isEmpty(body.updateLinking) &&  typeof body.updateLinking.coordinates === 'string') {
                                    updateOperation = `cambió la ubicación /cooredenadas (${body.updateLinking.coordinates}) del`
                                }
                                altanOperation = `${updateOperation} servicio del MSISDN: ${body.msisdn || '(no disponible)'}. `;
                                break;
                            case 'barring':
                                altanOperation = `suspendió el tráfico saliente (datos, voz y mensajes) del servicio del MSISDN: ${body.msisdn || '(no disponible)'}.`;
                                break;
                            case 'unbarring':
                                altanOperation = `reanudó el tráfico saliente (datos, voz y mensajes) del servicio del MSISDN: ${body.msisdn || '(no disponible)'}.`;
                                break;
                            case 'product':
                                altanOperation = `guardó un nuevo producto disponible para Sin Cables / Movilidad.`;
                                break;
                        }
                        break;
                    case 'PUT':
                        body = Object.assign({}, request.body);
                        operation = 'actualizó';
                        switch(resource) {
                            case 'product':
                                altanOperation = `actualizó un producto disponible para Sin Cables / Movilidad.`;
                                break;
                        }
                        break;
                    case 'DELETE':
                        body = Object.assign({}, request.query);
                        operation = 'borró';
                        switch(resource) {
                            case 'product':
                                altanOperation = `borró un producto disponible (ya no u_u) para Sin Cables / Movilidad.`;
                                break;
                        }
                        break;
                }
                let event: Event = {
                    parentType: request.resourceType ? request.resourceType : resource,
                    parentId: request.resourceId || 'unkown',
                    user,
                    description: 'Modificación a cliente o producto de Sin Cables / Movilidad.',
                    comment: `El usuario ${altanOperation}.`,
                    typeValue: 'database'
                }
                try {
                    eventModel.postEvent(event);
                } catch(error) {
                    // console.log('Ocurrió un error al intentar guardar el evento: ', error);
                } finally {
                    next();
                }
            }

            //N   N EEEEE X   X TTTTT
            //NN  N E      X X    T
            //N N N EEE     X     T
            //N  NN E      X X    T
            //N   N EEEEE X   X   T

            next();
        });
    }
}

export default new App().app;