// Módulos.
import axios from 'axios';
import idx from 'idx';
import { IsDefined, IsString, validate, MaxLength, IsMongoId, IsNotEmpty, IsEnum } from 'class-validator';
// Modelos.
import AccountModel, { Account } from './accounts';
// Funciones.
import { RemodelErrors } from '../scripts/data-management';
// Configuración.
import configuration from '../configuration';
// Constantes.
import { CATALOGS } from '../constants/constants';
import { EmailModel, To, Message, EmailWithTemplate } from './notifications';

export class Event {
    // Identificador.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.'
    })
    _id?: string;
    // Identificador del catálogo padre.
    @IsDefined({
        message: 'El campo es requerido.'
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    parentId: string;
    // Tipo de catálogo padre.
    @IsDefined({
        message: 'El campo es requerido.'
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @IsEnum(CATALOGS, {
        message: 'El valor no es válido.'
    })
    parentType: string;
    // Identificador del usuario.
    @IsDefined({
        message: 'El campo es requerido.'
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @IsNotEmpty({
        message: 'El campo no puede estar vacío.'
    })
    user: string;
    // Descripción.
    @IsDefined({
        message: 'El campo es requerido.'
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @IsNotEmpty({
        message: 'El campo no puede estar vacío.'
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    description: string;
    // Comentario.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @IsNotEmpty({
        message: 'El campo no puede estar vacío.'
    })
    @MaxLength(1024, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    comment: string;
    // Tipo de evento.
    @IsDefined({
        message: 'El campo es requerido.'
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @IsNotEmpty({
        message: 'El campo no puede estar vacío.'
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    typeValue: string;
}

export default class EventModel {
    
    //Propiedades.
    private _event: Event;
    
    //Constructor.
    constructor(event?: Event) {
        if(event) this._event = event;
    }

    //Métodos.

    // GGGG EEEEE TTTTT      /   SSSS EEEEE TTTTT
    //G     E       T       /   S     E       T
    //G  GG EEE     T      /     SSS  EEE     T
    //G   G E       T     /         S E       T
    // GGGG EEEEE   T    /      SSSS  EEEEE   T

    get event(): Event {
        return this._event;
    }

    set event(value: Event) {
        this._event = value;
    }

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any[]> {
        return this.validateSchema(this._event);
    }

    private async validateSchema(_event: any = {}): Promise<any[]> {

        let errors: Array<any> = [];

        let event = new Event();
        event.parentType = _event.parentType;
        event.parentId = _event.parentId;
        event.user = _event.user;
        event.description = _event.description;
        event.comment = _event.comment;
        event.typeValue = _event.typeValue;
        let eventErrors = await validate(event, { skipMissingProperties: true });
        errors = errors.concat(RemodelErrors(eventErrors, 'event'));
        
        return errors;
    }

    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getEvent(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.events.getEvent, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Eventos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Eventos',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }
    
    public getEvents(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // Parámetros.
            let { limit, page, ...filters } = query;
            let params: any = {
                limit,
                page
            };
            Object.keys(filters).forEach(key => params[key] = filters[key]);
            // Petición.
            axios.get(configuration.services.domain.events.getEvents, { params })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || []);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Eventos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Eventos',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    //PPPP   OOO   SSSS TTTTT
    //P   P O   O S       T
    //PPPP  O   O  SSS    T
    //P     O   O     S   T
    //P      OOO  SSSS    T

    public postEvent(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
            //V   V A   A L       I   D   D A   A C       I   O   O NN  N
            //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
            // V V  A   A L       I   D   D A   A C       I   O   O N  NN
            //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N
    
            let errors: Array<any> = [];
            this.validateSchema(body)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Eventos',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {

                //RRRR  EEEEE  SSSS TTTTT
                //R   R E     S       T
                //RRRR  EEE    SSS    T
                //R   R E         S   T
                //R   R EEEEE SSSS    T
        
                axios.post(configuration.services.domain.events.postEvent, body)
                .then( async (response: any) => {

                    //EEEEE M   M  AAA  IIIII L
                    //E     MM MM A   A   I   L
                    //EEE   M M M AAAAA   I   L
                    //E     M   M A   A   I   L
                    //EEEEE M   M A   A IIIII LLLLL

                    let { comment, user }: { comment: string, user: string } = body;
                    let emailError: any = {};
                    let emailModel: EmailModel = new EmailModel();
                    let emailTo: Array<To> = [];
                    if(typeof comment === 'string' && comment.length > 0) {
                        let labels: RegExpMatchArray | null = comment.match(/(#){1}(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})/gmi);
                        if(Array.isArray(labels) && labels.length > 0) {

                            // CCCC U   U EEEEE N   N TTTTT  AAA       /   CCCC L     IIIII EEEEE N   N TTTTT EEEEE
                            //C     U   U E     NN  N   T   A   A     /   C     L       I   E     NN  N   T   E
                            //C     U   U EEE   N N N   T   AAAAA    /    C     L       I   EEE   N N N   T   EEE
                            //C     U   U E     N  NN   T   A   A   /     C     L       I   E     N  NN   T   E
                            // CCCC  UUU  EEEEE N   N   T   A   A  /       CCCC LLLLL IIIII EEEEE N   N   T   EEEEE

                            let event: Event = body;
                            let parentHTML: string = '';
                            let parentSubject: string = '';
                            switch(event.parentType) {
                                case 'client':
                                    parentHTML = `<br/><br/><b>Cliente: </b><i>${event.parentId}</i>`;
                                    parentSubject = ` (Cliente: ${event.parentId})`;
                                    break;
                                case 'account':
                                    parentHTML = `<br/><br/><b>Cuenta: </b><i>${event.parentId}</i>`;
                                    parentSubject = ` (Cuenta: ${event.parentId})`;
                                    break;
                            }
                            for(const label of labels) {
                                let email: string = label.substring(1, label.length);
                                emailTo.push({
                                    email,
                                    name: email,
                                    type: 'to'
                                });
                            }
                            let message: Message = {
                                html: `<h1>Example HTML content.</h1>`,
                                subject: `OLIMPO - Fuiste mencionado en un evento${parentSubject}.`,
                                to: emailTo
                            };
                            let email: EmailWithTemplate = {
                                async: true,
                                message,
                                template_name: 'web_notification',
                                template_content: [{
                                    name: 'message',
                                    content: `El usuario ${user} te ha mencionado en el siguiente comentario:<br/><br/>${comment}${parentHTML}`
                                }]
                            };
                            try {
                                await emailModel.postEmail(email);
                            } catch(error) {
                                emailError = error;
                            }
                        }
                    }

                    //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
                    //R   R E     S     U   U L       T   A   A D   D O   O
                    //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
                    //R   R E         S U   U L       T   A   A D   D O   O
                    //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Eventos',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Eventos',
                            message: 'Ocurrió un error al intentar guardar la información (EVENTO).',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            }
        });
    }

    public postEvents(body: any, file?: Express.Multer.File): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let { isTest, events, ...rest }: { isTest: boolean, contacts: Array<Event> } & any = body;
            isTest = isTest ? JSON.parse(isTest) : false;

            //JJJJJ  SSSS  OOO  N   N
            //  J   S     O   O NN  N
            //  J    SSS  O   O N N N
            //J J       S O   O N  NN
            // J    SSSS   OOO  N   N

            let items: Event[] = [];
            if(file) {
                try {
                    items = JSON.parse(file.buffer.toString('utf8'));
                } catch(error) {
                    return reject({
                        status: 400,
                        module: 'Eventos',
                        message: 'No se pudo leer la información del archivo.',
                        error
                    });
                }
            } else {
                if(Array.isArray(events) && events.length > 0) {
                    items = events;
                } else {
                    return reject({
                        status: 404,
                        module: 'Eventos',
                        message: 'No se encontró un archivo ni una lista de registros en la petición.'
                    });
                }
            }
            
            //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
            //E     R   R R   R O   O R   R E     S
            //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
            //E     R   R R   R O   O R   R E         S
            //EEEEE R   R R   R  OOO  R   R EEEEE SSSS
            
            let goodRecords: Array<Event> = [];
            let badRecords: Array<Event> = [];
            if(Array.isArray(items) && items.length > 0) {
                for(const event of items) {
                    
                    // CCCC U   U EEEEE N   N TTTTT  AAA
                    //C     U   U E     NN  N   T   A   A
                    //C     U   U EEE   N N N   T   AAAAA
                    //C     U   U E     N  NN   T   A   A
                    // CCCC  UUU  EEEEE N   N   T   A   A

                    if(event.parentType === 'account') {
                        if((typeof event.parentId === 'string' && event.parentId.match(/^[0-9]+$/g) !== null) || typeof event.parentId === 'number') {
                            // La cuenta para el movimiento es de tipo LEGACY y se debe obtener el número nuevo.
                            try {
                                let accountModel: AccountModel = new AccountModel();
                                let _account: Account = await accountModel.getAccount({ legacyId: event.parentId });
                                event.parentId = _account.accountNumber;
                            } catch(error) {
                                badRecords.push(event);
                                continue;
                            }
                        }
                    }

                    // Análisis y transformación de datos.
                    try {
                        event.parentId = event.parentId.toString();
                        event.description = event.description.toString().slice(0, 70);
                        event.comment = event.comment.toString().slice(0, 1024);
                    } catch(error) {}
                    let eventErrors: any = await this.validateSchema(event);
                    // Se revisa si el cliente se puede insertar o no.
                    if(eventErrors.length > 0) {
                        badRecords.push(event);
                    } else {
                        goodRecords.push(event);
                    }
                }
            } else {
                return reject({
                    status: 400,
                    module: 'Eventos',
                    message: 'El archivo no contiene un arreglo o está vacío.'
                });
            }

            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T

            if(goodRecords.length === 0) {
                return reject({
                    status: 400,
                    module: 'Eventos',
                    message: 'No se encontró ningún registro bueno.',
                    good: {
                        total: goodRecords.length
                    },
                    bad: {
                        total: badRecords.length,
                        records: badRecords
                    }
                });
            } else {
                if(isTest) {
                    // PRUEBAS.
                    return resolve({ 
                        messge: 'Todo okey dokey.',
                        good: {
                            total: goodRecords.length
                        },
                        bad: {
                            total: badRecords.length,
                            records: badRecords
                        }
                    });
                } else {
                    // ESPARTANO.
                    axios.post(configuration.services.domain.events.postEvents, goodRecords)
                    .then((response: any) => {
                        return resolve({
                            status: 200,
                            message: 'Información insertada con éxito.',
                            data: idx(response, _ => _.data) || [],
                            good: {
                                total: goodRecords.length
                            },
                            bad: {
                                total: badRecords.length,
                                records: badRecords
                            }
                        });
                    })
                    .catch((error: any) => {
                        return reject({
                            status: 400,
                            module: 'Eventos',
                            message: 'Ocurrió un error al intentar guardar la información (EVENTO).',
                            data: idx(error, _ => _.response.data) || {},
                            good: {
                                total: goodRecords.length
                            },
                            bad: {
                                total: badRecords.length,
                                records: badRecords
                            }
                        });
                    });
                }
            }
        });
    }

    //PPPP  U   U TTTTT
    //P   P U   U   T
    //PPPP  U   U   T
    //P     U   U   T
    //P      UUU    T

    public putEvent(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
            //V   V A   A L       I   D   D A   A C       I   O   O NN  N
            //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
            // V V  A   A L       I   D   D A   A C       I   O   O N  NN
            //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N
    
            let errors: Array<any> = [];
            this.validateSchema(body)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Eventos',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {

                //RRRR  EEEEE  SSSS TTTTT
                //R   R E     S       T
                //RRRR  EEE    SSS    T
                //R   R E         S   T
                //R   R EEEEE SSSS    T
        
                axios.put(configuration.services.domain.events.putEvent, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Eventos',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Eventos',
                            message: 'Ocurrió un error al intentar actualizar la información.',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            }
        });
    }

    //DDDD  EEEEE L     EEEEE TTTTT EEEEE
    //D   D E     L     E       T   E
    //D   D EEE   L     EEE     T   EEE
    //D   D E     L     E       T   E
    //DDDD  EEEEE LLLLL EEEEE   T   EEEEE

    public deleteEvent(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.events.deleteEvent, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Eventos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Eventos',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

}