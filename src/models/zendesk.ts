// Módulos
import axios, { AxiosResponse } from 'axios';
import idx from 'idx';
import { IsString, IsNotEmpty, IsDefined, IsNumber, Min, IsEnum, validate } from 'class-validator';
// Modelos.
import ClientModel, { Client } from './clients';
import { Contact } from './contacts';
import ODXModel, { ODX } from './odxs';
// Configuración.
import configuration from '../configuration';
// Funciones.
import { date2StringFormat } from '../scripts/dates';
import { RemodelErrors } from '../scripts/data-management';

export interface IClient {
    id?: number;
    name: string;
    email: string | null;
    verified: boolean;
    external_id: string;
    details: string;
    notes: string;
    phone: string | null;
    shared_phone_number: boolean;
    role: string;
    tags: Array<string>;
    user_fields: {
        business_name: string;
        priority: string;
    }
    identities: Array<IContact>;
}

export interface IContact {
    type: string;       //
    value: string;
    verified: boolean;
    primary: boolean;
}

/*
export interface ITicket {
    subject: string;        // El campo comment, crea un comentario inicial dentro del ticket.
    description: string;
    comment?: IComment;
    external_id?: string;   // ID Externo, puede ser el Folio de la ODX.
    type?: string;          // Tipo de ticket, opciones: "problem", "incident", "question", "task".
    priority?: string;      // Prioridad, opciones: "urgent", "high", "normal", "low".
    status?: string;        // Estatus, opciones: "new", "open", "pending", "hold", "solved", "closed".
    requester_id?: number;  // El usuario que solicita el ticket, ¿nos vemos buena onda?, if true > Obtenemos el ID del usuario en Zendesk del cliente de Olimpo ¯\_(ツ)_/¯, else > ALV.
    submitter_id?: number;  // Usuario que crea el ticket, por default es Olimpo/Desarrollo.
    assignee_id?: number;   // Usuario asignado, por default es el de Implementaciones.
    group_id?: number;      // ID del grupo asignado, por default Implementaciones.
    tags?: Array<string>;
    created_at: string;
}
*/

const TYPES: Array<string> = ['problem', 'incident', 'question', 'task'];
const PRIORITY: Array<string> = ['urgent', 'high', 'normal', 'low'];
const STATUS: Array<string> = ['new', 'open', 'pending', 'hold', 'solved', 'closed'];

export class Ticket {
    // Tema.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @IsNotEmpty({
        message: 'El campo no puede estar vacío.',
        groups: ['POST', 'PUT']
    })
    subject: string;
    // Descripción.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @IsNotEmpty({
        message: 'El campo no puede estar vacío.',
        groups: ['POST', 'PUT']
    })
    description?: string;
    // Comentario.
    comment?: IComment;
    // Identificador exteerno.
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @IsNotEmpty({
        message: 'El campo no puede estar vacío.',
        groups: ['POST', 'PUT']
    })
    external_id?: string;
    // Tipo.
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @IsEnum(TYPES, {
        message: 'El valor no es válido.',
        groups: ['POST', 'PUT']
    })
    type?: string;
    // Prioridad.
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @IsEnum(PRIORITY, {
        message: 'El valor no es válido.',
        groups: ['POST', 'PUT']
    })
    priority?: string;
    // Estatus.
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @IsEnum(STATUS, {
        message: 'El valor no es válido.',
        groups: ['POST', 'PUT']
    })
    status?: string;
    // Identificador del cliente (quién solicita).
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(1, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    requester_id?: number;
    // Identificador de quién lo crea.
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(1, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    submitter_id?: number;
    // Identificador de a quién se le asigna.
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(1, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    assignee_id?: number;
    // Identificador del grupo.
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(1, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    group_id?: number;
    // Etiquetas.
    tags?: Array<string>;
    // Fecha de creación.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @IsNotEmpty({
        message: 'El campo no puede estar vacío.',
        groups: ['POST', 'PUT']
    })
    created_at?: string;
}

export interface IComment {
    body: string;
    public: boolean;    // Si es false, no se visualiza para los 'end-users'.
    author_id?: number;  // Es el ID del usuario de Development Domain.
    created_at?: string;
}

export default class ZendeskModel {
    
    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    private async validateTicketSchema(_ticket: any = {}, groups: Array<string> = ['POST']): Promise<any[]> {
        
        let errors: Array<any> = [];
        
        let ticket: Ticket = new Ticket();
        ticket.subject = _ticket.subject;
        ticket.description = _ticket.description;
        ticket.comment = _ticket.comment;
        ticket.external_id = _ticket.external_id;
        ticket.type = _ticket.type;
        ticket.priority = _ticket.priority;
        ticket.status = _ticket.status;
        ticket.requester_id = _ticket.requester_id;
        ticket.submitter_id = _ticket.submitter_id;
        ticket.assignee_id = _ticket.assignee_id;
        ticket.group_id = _ticket.group_id;
        ticket.tags = _ticket.tags;
        ticket.created_at = _ticket.created_at;
        let ticketErrors = await validate(ticket, { groups, skipMissingProperties: true });
        errors = errors.concat(RemodelErrors(ticketErrors, 'client.accountingData'));
        
        return errors;
    }
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getClient(query: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { ...filters }: any = query;

            //FFFFF IIIII L     TTTTT RRRR   OOO   SSSS
            //F       I   L       T   R   R O   O S
            //FFF     I   L       T   RRRR  O   O  SSS
            //F       I   L       T   R   R O   O     S
            //F     IIIII LLLLL   T   R   R  OOO  SSSS

            let urlQuery: string = '';
            Object.keys(filters).forEach((key: string) => {
                // TODO: Revisar como dar formato a consultas de texto con espacios [facepalm].
                // console.log(filters);
                urlQuery = `${urlQuery.length > 0 ? `${urlQuery} ` : '?query='}${key}:${filters[key]}`;
            });
            // console.log(`${configuration.services.zendesk.clients.getClient}${urlQuery}`);
            // console.log(urlQuery);
            
            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T

            axios.get(`${configuration.services.zendesk.clients.getClient}${urlQuery}`, {
                headers: {
                    'Authorization': configuration.services.zendesk.authorization
                }
            })
            .then((response: AxiosResponse<any>) => {
                return resolve(response.data);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Zendesk',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Zendesk',
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

    public postClient(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { folio, ...rest }: { folio: number } & any = body;

            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     L       I   E     NN  N   T   E
            //C     L       I   EEE   N N N   T   EEE
            //C     L       I   E     N  NN   T   E
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE

            let client: Client = new Client();
            let contacts: Array<Contact> = [];
            let clientModel: ClientModel = new ClientModel();
            try {
                client = await clientModel.getClient({ folio });
                contacts = client.contacts || [];
            } catch(error) {
                return reject(error);
            }

            //ZZZZZ EEEEE N   N DDDD  EEEEE  SSSS K   K
            //   Z  E     NN  N D   D E     S     K  K
            //  Z   EEE   N N N D   D EEE    SSS  KKK
            // Z    E     N  NN D   D E         S K  K
            //ZZZZZ EEEEE N   N DDDD  EEEEE SSSS  K   K

            // Contactos.
            let contactsZ: Array<IContact> = [];
            for(const contact of contacts) {
                for(const contactMean of contact.contactMeans) {
                    // TODO: ¿Agregar todos o sólo los que tienen la bandera de notificación?
                    let contactMeanName: string = contactMean.contactMeanName;
                    let type: string = '';
                    switch(contactMeanName) {
                        case 'email':
                            type = 'email';
                            break;
                        case 'mobilePhone':
                        case 'fixedPhone':
                            type = 'phone_number';
                            break;
                        case 'socialMedia':
                            type = 'facebook';
                            break;
                        case 'whatsapp':
                            type = 'phone_number';
                            break;
                    }
                    contactsZ.push({
                        type,
                        value: contactMean.value,
                        verified: true,
                        primary: false
                    });
                }
            }
            // Cliente.
            let name: string = (`${client.firstName || ''} ${client.secondName || ''} ${client.firstLastName || ''} ${client.secondLastName || ''}`).replace(/\s{2}/gi, ' ').trim();
            let clientZ: IClient = {
                name,
                email: null,
                verified: true,
                external_id: client.folio.toString(),
                details: 'Cliente importado desde Olimpo.',
                notes: `https://olimpo.domain.net/clientes/${client.folio}`,
                phone: null,
                shared_phone_number: false,
                role: 'End-user',
                tags: ['cliente'],
                user_fields: {
                    business_name: idx(client.businessData, _ => _.businessName) || '',
                    priority: client.priorityValue
                },
                identities: contactsZ
            };

            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T

            axios.post(configuration.services.zendesk.clients.postClient, { user: clientZ }, {
                headers: {
                    'Authorization': configuration.services.zendesk.authorization
                }
            })
            .then((response: AxiosResponse<any>) => {
                return resolve(response.data);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Zendesk',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Zendesk',
	                    message: 'Ocurrió un error al intentar guardar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public postTicket(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { ...ticket }: Ticket = body;

            //DDDD   AAA  TTTTT  OOO   SSSS
            //D   D A   A   T   O   O S
            //D   D AAAAA   T   O   O  SSS
            //D   D A   A   T   O   O     S
            //DDDD  A   A   T    OOO  SSSS

            // Descripción.
            if(!ticket.description) ticket.description = ticket.subject;
            // Fecha de creación.
            let today: Date = new Date();
            let createdAt: string = date2StringFormat(today, 'YYYY-MM-DDThh:mm:ss');
            ticket.created_at = createdAt;
            // El identificador por defecto debe ser soporte.
            ticket.submitter_id = !ticket.submitter_id ? 402541957913 : ticket.submitter_id;
            // ticket.assignee_id = !ticket.assignee_id ? 402541957913 : ticket.assignee_id;
            if(!ticket.group_id && !ticket.assignee_id) {
                ticket.group_id = 360008385554;
            }

            //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
            //E     R   R R   R O   O R   R E     S
            //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
            //E     R   R R   R O   O R   R E         S
            //EEEEE R   R R   R  OOO  R   R EEEEE SSSS
            
            let errors: Array<any> = [];
            errors = await this.validateTicketSchema(ticket);
            // Si ocurrió algún error se termina la función.
            if(errors.length > 0) {
                let response: any = {
                    module: 'Zendesk',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            }

            //ZZZZZ EEEEE N   N DDDD  EEEEE  SSSS K   K
            //   Z  E     NN  N D   D E     S     K  K
            //  Z   EEE   N N N D   D EEE    SSS  KKK
            // Z    E     N  NN D   D E         S K  K
            //ZZZZZ EEEEE N   N DDDD  EEEEE SSSS  K   K

            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T

            axios.post(configuration.services.zendesk.tickets.postTicket, { ticket }, {
                headers: {
                    'Authorization': configuration.services.zendesk.authorization
                }
            })
            .then((response: AxiosResponse<any>) => {
                return resolve(response.data);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Zendesk',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Zendesk',
	                    message: 'Ocurrió un error al intentar guardar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public postContact(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let { clientId, contactZ, ...rest }: { clientId: number, contactZ: IContact } & any = body;

            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T

            let url: string = (configuration.services.zendesk.contacts.postContact).replace('{clientId}', clientId);
            axios.post(url, { identity: contactZ }, {
                headers: {
                    'Authorization': configuration.services.zendesk.authorization
                }
            })
            .then((response: AxiosResponse<any>) => {
                return resolve(response.data);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Zendesk',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Zendesk',
	                    message: 'Ocurrió un error al intentar guardar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }
    

    public postZendeskWebhook(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let environment: string = process.env.NODE_ENV || 'development';
            if(environment.toLowerCase().trim() === 'production') {
                return reject({
                    status: 400,
                    module: 'Zendesk',
                    message: 'No se cuenta con un sandbox de pruebas en Zendesk.'
                });
            }
            
            let { phone, extension, ...rest }: { phone: string, extension: string } & any = body;

            // Teléfono.
            if(!phone) {
                return reject({
                    status: 400,
                    module: 'Zendesk',
                    message: 'Se debe especificar el número telefónico.'
                });
            }
            // Extensión.
            if(!extension) {
                return reject({
                    status: 400,
                    module: 'Zendesk',
                    message: 'Se debe especificar el número de la extensión.'
                });
            }

            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     L       I   E     NN  N   T   E
            //C     L       I   EEE   N N N   T   EEE
            //C     L       I   E     N  NN   T   E
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE
            
            let requester_id: number = 0;
            let external_id: any;
            let clientZ: { results: Array<IClient>, facets: any, next_page: any, previous_page: any, count: any };
            try {
                clientZ = await this.getClient({ phone, role: 'end-user' });
                // TODO: Validar cantidad.
                /*
                A) Encontró solo un cliente.
                {
                    ticket: {}
                }
                B) Encontró más de uno.
                {
                    clients: [],
                    support: {}
                }
                if(response.ticket) {} else if(response.clients) {}
                */
                if(clientZ.results.length > 1) {
                    
                } else if(clientZ.results.length === 1) {
                    requester_id = clientZ.results[0].id || 0;
                    external_id = clientZ.results[0].external_id;
                } else {
                    return reject({
                        status: 400,
                        module: 'Zendesk',
                        message: 'No se encontró información del cliente en Zendesk.'
                    });
                }
            } catch(error) {
                return reject({
                    status: 400,
                    module: 'Zendesk',
                    message: 'No se encontró información del cliente en Zendesk.'
                });
            }

            // SSSS  OOO  PPPP   OOO  RRRR  TTTTT EEEEE
            //S     O   O P   P O   O R   R   T   E
            // SSS  O   O PPPP  O   O RRRR    T   EEE
            //    S O   O P     O   O R   R   T   E
            //SSSS   OOO  P      OOO  R   R   T   EEEEE

            let assignee_id: number = 0;
            // Se inicializa la información por si no se encuentra algún resultado.
            let supportZ: { results: Array<IClient>, facets: any, next_page: any, previous_page: any, count: any } = {
                results: [],
                facets: null,
                next_page: null,
                previous_page: null,
                count: 0
            };
            try {
                supportZ = await this.getClient({ extension });
                if(supportZ.results.length > 0) assignee_id = supportZ.results[0].id || 0;
            } catch(error) {
                // return reject(error);
            }

            //TTTTT IIIII  CCCC K   K EEEEE TTTTT
            //  T     I   C     K  K  E       T
            //  T     I   C     KKK   EEE     T
            //  T     I   C     K  K  E       T
            //  T   IIIII  CCCC K   K EEEEE   T

            // NOTE: Sólo se debe crear si se encontro un único resultado en clientes.
            if(clientZ.results.length === 1) {
                try {
                    let ticket: Ticket = {
                        requester_id,
                        external_id,
                        subject: `Ticket de Soporte por llamada entrante: Cliente No. ${external_id}.`,
                        comment: {
                            body: 'Completar el detalle del ticket con los comentarios que indique el cliente. Si requiere que el cliente reciba la notificación del ticket, convierta el ticket como público.',
                            public: false
                        },
                        type: 'task',
                        priority: 'normal',
                        status: 'new',
                        // assignee_id
                    };
                    if(assignee_id > 0) ticket.assignee_id = assignee_id;
                    let response: any = await this.postTicket(ticket);
                    
                    //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
                    //R   R E     S     U   U L       T   A   A D   D O   O
                    //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
                    //R   R E         S U   U L       T   A   A D   D O   O
                    //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

                    return resolve({
                        ticket: response
                    });
                } catch(error) {
                    // TODO: Devolver la información encontrada si no se pudo crear el ticket.
                    // return reject(error);                    
                    return resolve({
                        clients: clientZ,
                        support: supportZ
                    });
                }
            } else {

                //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
                //R   R E     S     U   U L       T   A   A D   D O   O
                //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
                //R   R E         S U   U L       T   A   A D   D O   O
                //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

                return resolve({
                    clients: clientZ,
                    support: supportZ
                });
            }
        });
    }
    
    //DDDD  EEEEE L     EEEEE TTTTT EEEEE
    //D   D E     L     E       T   E
    //D   D EEE   L     EEE     T   EEE
    //D   D E     L     E       T   E
    //DDDD  EEEEE LLLLL EEEEE   T   EEEEE
    
    public deleteClient(query: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { userId, ...rest }: { userId: string } & any = query;
            
            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T

            let url: string = (configuration.services.zendesk.clients.deleteClient).replace('{userId}', userId);
            axios.delete(url, {
                headers: {
                    'Authorization': configuration.services.zendesk.authorization
                }
            })
            .then((response: AxiosResponse<any>) => {
                return resolve(response.data);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Zendesk',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Zendesk',
	                    message: 'Ocurrió un error al intentar eliminar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public deleteTicket(query: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { ticketId, ...rest }: { ticketId: string } & any = query;
            
            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T

            let url: string = (configuration.services.zendesk.tickets.deleteTicket).replace('{ticketId}', ticketId);
            axios.delete(url, {
                headers: {
                    'Authorization': configuration.services.zendesk.authorization
                }
            })
            .then((response: AxiosResponse<any>) => {
                return resolve(response.data);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Zendesk',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Zendesk',
	                    message: 'Ocurrió un error al intentar eliminar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }
}