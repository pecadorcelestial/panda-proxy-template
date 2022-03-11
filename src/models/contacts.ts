// Módulos.
import axios, { AxiosResponse } from 'axios';
import idx from 'idx';
import { IsString, MaxLength, validate, IsEnum, IsArray, IsMongoId, IsDefined, IsBoolean } from 'class-validator';
// Modelos.
import AccountModel, { Account } from './accounts';
// Funciones.
import { RemodelErrors } from '../scripts/data-management';
// Configuración.
import configuration from '../configuration';
// Constantes.
import { CATALOGS } from '../constants/constants';
import ZendeskModel, { IClient, IContact } from './zendesk';

export class Contact {
    // Identificador.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.'
    })
    _id: string;
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
    // Nombre.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    name: string;
    // Arreglo de medios de contacto.
    @IsDefined({
        message: 'El campo es requerido.'
    })
    @IsArray({
        message: 'El tipo de dato es incorrecto.'
    })
    contactMeans: Array<ContactMean>;
}

export class ContactMean {
    // Nombre del medio de contacto, p. ej.: email, phone, mobile, etc.
    @IsDefined({
        message: 'El campo es requerido.'
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    contactMeanName: string;
    // Valor.
    @IsDefined({
        message: 'El campo es requerido.'
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(150, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    value: string;
    // ¿Notificar?
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.'
    })
    notify?: boolean = true;
}

export default class ContactModel {

    //Propiedades.
    private _contact: Contact;

    // Constructor.
    constructor(contact?: Contact) {
        this._contact = contact ? contact : new Contact();
    }
    
    //Métodos.

    // GGGG EEEEE TTTTT      /   SSSS EEEEE TTTTT
    //G     E       T       /   S     E       T
    //G  GG EEE     T      /     SSS  EEE     T
    //G   G E       T     /         S E       T
    // GGGG EEEEE   T    /      SSSS  EEEEE   T

    get contact(): Contact {
        return this._contact;
    }

    set contact(value: Contact) {
        this._contact = value;
    }

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        return this.validateSchemas(this._contact);
    }

    private async validateSchemas(_contact: any = {}): Promise<any> {
        
        let errors: Array<any> = [];
        
        let contact = new Contact();
        contact.parentId = _contact.parentId;
        contact.parentType = _contact.parentType;
        contact.name = _contact.name;
        contact.contactMeans = _contact.contactMeans;
        if(Array.isArray(_contact.contactMeans) && _contact.contactMeans.length > 0) {
            let index: number = 0;
            for(const _contactMean of _contact.contactMeans) {
                let contactMean = new ContactMean();
                contactMean.contactMeanName = _contactMean.contactMeanName;
                contactMean.value = _contactMean.value;
                contactMean.notify = _contactMean.notify;
                let contactMeanErrors = await validate(contactMean, { skipMissingProperties: true });
                errors = errors.concat(RemodelErrors(contactMeanErrors, `contact.contactMeans[${index}]`));
                index++;
            }
        }
        let contactErrors = await validate(contact, { skipMissingProperties: true });
        errors = errors.concat(RemodelErrors(contactErrors, 'contact'));
        
        return errors;
    }
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getContact(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.contacts.getContact, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Contactos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Contactos',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }
    
    public getContacts(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {            
            // Parámetros.
            let { limit, page, ...filters } = query;
            let params: any = {
                limit,
                page
            };
            Object.keys(filters).forEach(key => params[key] = filters[key]);
            // Petición.
            axios.get(configuration.services.domain.contacts.getContacts, { params })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || []);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Contactos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Contactos',
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

    public postContact(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {            
            let errors: Array<any> = [];
            this.validateSchemas(body)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Contactos',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.post(configuration.services.domain.contacts.postContact, body)
                .then( async (response: AxiosResponse<any>) => {
                    
                    //ZZZZZ EEEEE N   N DDDD  EEEEE  SSSS K   K
                    //   Z  E     NN  N D   D E     S     K  K
                    //  Z   EEE   N N N D   D EEE    SSS  KKK
                    // Z    E     N  NN D   D E         S K  K
                    //ZZZZZ EEEEE N   N DDDD  EEEEE SSSS  K   K

                    // NOTE: Zendesk no cuenta con un sandbox de pruebas, por lo que las llamadas son directo a producción.
                    let environment: string = process.env.NODE_ENV || 'development';
                    if(environment.toLowerCase().trim() === 'production') {
                        let contact: Contact = response.data;
                        if(contact.parentType === 'client') {
                            let folio: number = parseInt(contact.parentId);
                            let clientId: number = 0;
                            let zendeskModel: ZendeskModel = new ZendeskModel();
                            try {
                                let clientZ: { results: Array<IClient>, facets: any, next_page: any, previous_page: any, count: any } = await zendeskModel.getClient({ external_id: folio });
                                if(clientZ.results.length > 0) clientId = clientZ.results[0].id || 0;
                            } catch(error) {
                                // TODO: Revisar qué hacer al ocurrir un error.
                            }
                            if(clientId > 0) {
                                for(const contactMean of contact.contactMeans) {
                                    let type: string = '';
                                    switch(contactMean.contactMeanName) {
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
                                    let contactZ: IContact = {
                                        type,
                                        value: contactMean.value,
                                        verified: true,
                                        primary: false
                                    };
                                    try {
                                        await zendeskModel.postContact({ clientId, contactZ });
                                    } catch(error) {
                                        // TODO: Revisar qué hacer al ocurrir un error.
                                    }
                                }
                            }
                        }
                    }

                    //RRRR  EEEEE  SSSS PPPP  U   U EEEEE  SSSS TTTTT  AAA
                    //R   R E     S     P   P U   U E     S       T   A   A
                    //RRRR  EEE    SSS  PPPP  U   U EEE    SSS    T   AAAAA
                    //R   R E         S P     U   U E         S   T   A   A
                    //R   R EEEEE SSSS  P      UUU  EEEEE SSSS    T   A   A

                    return resolve(response.data);
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Contactos',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Contactos',
                            message: 'Ocurrió un error al intentar guardar la información (CONTACTO).',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            }
        });
    }

    public postContacts(body: any, file?: Express.Multer.File): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let { isTest, contacts, ...rest }: { isTest: boolean, contacts: Array<Contact> } & any = body;
            isTest = isTest ? JSON.parse(isTest) : false;

            //JJJJJ  SSSS  OOO  N   N
            //  J   S     O   O NN  N
            //  J    SSS  O   O N N N
            //J J       S O   O N  NN
            // J    SSSS   OOO  N   N

            let items: Array<Contact> = [];
            if(file) {
                try {
                    items = JSON.parse(file.buffer.toString('utf8'));
                } catch(error) {
                    return reject({
                        status: 400,
                        module: 'Contactos',
                        message: 'No se pudo leer la información del archivo.',
                        error
                    });
                }
            } else {
                if(Array.isArray(contacts) && contacts.length > 0) {
                    items = contacts;
                } else {
                    return reject({
                        status: 404,
                        module: 'Contactos',
                        message: 'No se encontró un archivo ni una lista de registros en la petición.'
                    });
                }
            }
            
            //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
            //E     R   R R   R O   O R   R E     S
            //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
            //E     R   R R   R O   O R   R E         S
            //EEEEE R   R R   R  OOO  R   R EEEEE SSSS
            
            let goodRecords: Array<Contact> = [];
            let badRecords: Array<Contact> = [];
            if(Array.isArray(items) && items.length > 0) {
                for(const contact of items) {
                    
                    // CCCC U   U EEEEE N   N TTTTT  AAA
                    //C     U   U E     NN  N   T   A   A
                    //C     U   U EEE   N N N   T   AAAAA
                    //C     U   U E     N  NN   T   A   A
                    // CCCC  UUU  EEEEE N   N   T   A   A

                    if(contact.parentType === 'account') {
                        if((typeof contact.parentId === 'string' && contact.parentId.match(/^[0-9]+$/g) !== null) || typeof contact.parentId === 'number') {
                            // La cuenta para el movimiento es de tipo LEGACY y se debe obtener el número nuevo.
                            try {
                                let accountModel: AccountModel = new AccountModel();
                                let _account: Account = await accountModel.getAccount({ legacyId: contact.parentId });
                                contact.parentId = _account.accountNumber;
                            } catch(error) {
                                badRecords.push(contact);
                                continue;
                            }
                        }
                    }

                    // Análisis y transformación de datos.
                    try {
                        contact.parentId = contact.parentId.toString();
                        contact.name = contact.name.toString().slice(0, 70);
                    } catch(error) {}
                    let contactErrors: any = await this.validateSchemas(contact);
                    // Se revisa si el cliente se puede insertar o no.
                    if(contactErrors.length > 0) {
                        badRecords.push(contact);
                    } else {
                        goodRecords.push(contact);
                        // console.log(`Buenos: ${goodRecords.length}`);
                    }
                }
            } else {
                return reject({
                    status: 400,
                    module: 'Contactos',
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
                    module: 'Contactos',
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
                    axios.post(configuration.services.domain.contacts.postContacts, goodRecords)
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
                        console.log('Error: ', error)
                        return reject({
                            status: 400,
                            module: 'Contactos',
                            message: 'Ocurrió un error al intentar guardar la información (CONTACTO).',
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

    public putContact(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {            
            let errors: Array<any> = [];
            this.validateSchemas(body)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Contactos',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.put(configuration.services.domain.contacts.putContact, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Contactos',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Contactos',
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

    public deleteContact(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.contacts.deleteContact, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Contactos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Contactos',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

}