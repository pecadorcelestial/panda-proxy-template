import axios from 'axios';
import idx from 'idx';
import { IsArray, IsString, MaxLength, IsMongoId, IsEnum, IsDate, IsNumber, Min, validate } from 'class-validator';
import { RemodelErrors } from '../scripts/data-management';
import configuration from '../configuration';
import UserModel from './users';
import { CATALOGS } from '../constants/constants';

class Quotation {
    // Identificador.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.'
    })
    _id: string;
    // Identificador del catálogo padre.
    // @IsDefined({
    //     message: 'El campo es requerido.'
    // })
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    parentId: string;
    // Tipo de catálogo padre.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @IsEnum(CATALOGS, {
        message: 'El valor no es válido.'
    })
    parentType: string;
    // Identificador del usuario que la creó.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.'
    })
    createdBy: string;
    // Nombre de la cotización.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(150, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    name: string;
    // Lugar de expedición.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(100, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    placeOfIssue: string;
    // Fecha de expedición.
    @IsDate({
        message: 'El tipo de dato es incorrecto.'
    })
    dateOfIssue: Date;
    // Fecha de vencimiento.
    @IsDate({
        message: 'El tipo de dato es incorrecto.'
    })
    expirationDate: Date;
    // Número de cotización.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(10, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    number: string;
    // Costo de instalación.
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.'
    })
    installationCost: number;
    // Costo mensual.
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.'
    })
    monthlyCost: number;
    // Perioricidad.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    periodicityValue: string;
    // Estadus de la cotización.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    statusValue: string;
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.'
    })
    // Identificador del usuario que aprobó la cotización.
    approvedBy: string;
    // Elementos dentro de la cotización.
    @IsArray({
        message: 'El tipo de dato es incorrecto.'
    })
    items: Array<any>;
    // Plazo forzoso (si aplica).
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    forcedTermValue: string;
}

class QuotationItem {
    // Descripción del elemento.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(150, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    name: string;
    // Cantidad.
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.'
    })
    @Min(0, {
        message: 'El valor es menor al permitido.'
    })
    amount: number;
    // Porcentaje de descuento (si aplica).
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.'
    })
    @Min(0, {
        message: 'El valor es menor al permitido.'
    })
    discountPercentage: number;
    // Costo inicial.
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.'
    })
    @Min(0, {
        message: 'El valor es menor al permitido.'
    })
    initialCost: number;
    // Total.
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.'
    })
    @Min(0, {
        message: 'El valor es menor al permitido.'
    })
    total: number;
}

export class QuotationModel {
    
    //Propiedades.
    private quotation: any;
    
    //Constructor.
    constructor(quotation?: any) {
        this.quotation = quotation;
    }

    //Métodos.

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        return this.validateSchema(this.quotation);
    }

    private async validateSchema(_quotation: any = {}): Promise<any> {
        
        let errors: Array<any> = [];
        
        // Cotización.
        let quotation = new Quotation();
        quotation.parentId = _quotation.parentId;
        quotation.parentType = _quotation.parentType;
        quotation.createdBy = _quotation.createdBy;
        quotation.name = _quotation.name;
        quotation.placeOfIssue = _quotation.placeOfIssue;
        quotation.dateOfIssue = _quotation.dateOfIssue;
        quotation.expirationDate = _quotation.expirationDate;
        quotation.number = _quotation.number;
        quotation.installationCost = _quotation.installationCost;
        quotation.monthlyCost = _quotation.monthlyCost;
        quotation.periodicityValue = _quotation.periodicityValue;
        quotation.statusValue = _quotation.statusValue;
        quotation.approvedBy = _quotation.approvedBy;
        quotation.items = _quotation.items;
        quotation.forcedTermValue = _quotation.forcedTermValue;
        let quotationErrors = await validate(quotation, { skipMissingProperties: true });
        errors = errors.concat(RemodelErrors(quotationErrors, 'quotation'));
        // Elementos.
        if(Array.isArray(_quotation.items) && _quotation.items.length > 0) {
            _quotation.items.forEach( async (_item: any, index: number) => {
                let item = new QuotationItem();
                item.name = _item.name;
                item.amount = _item.amount;
                item.discountPercentage = _item.discountPercentage;
                item.initialCost = _item.initialCost;
                item.total = _item.total;
                let itemErrors = await validate(item, { skipMissingProperties: true });
                errors = errors.concat(RemodelErrors(itemErrors, `quotation.items[${index}]`));
            });
        }

        return errors;
    }

    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getQuotation(query: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let errors: Array<any> = [];

            // CCCC  OOO  TTTTT IIIII ZZZZZ  AAA   CCCC IIIII  OOO  N   N
            //C     O   O   T     I      Z  A   A C       I   O   O NN  N
            //C     O   O   T     I     Z   AAAAA C       I   O   O N N N
            //C     O   O   T     I    Z    A   A C       I   O   O N  NN
            // CCCC  OOO    T   IIIII ZZZZZ A   A  CCCC IIIII  OOO  N   N

            // let quotationId: string = '';
            let createdById: string = '';
            let approvedById: string = '';
            let _quotation: any = {};
            try {
                _quotation = await axios.get(configuration.services.domain.quotations.getQuotation, { params: query });
                // quotationId = _quotation.data._id;
                createdById = _quotation.data.createdBy;
                approvedById = _quotation.data.approvedBy;
            } catch(error) {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Cotizaciones',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject(idx(error, _ => _.response.data) || {
                        status: 400,
                        module: 'Cotizaciones',
                        message: 'Ocurrió un error al intentar obtener la información (SERVICIO).',
                        error
                    });
                }
            }
            
            //U   U  SSSS U   U  AAA  RRRR  IIIII  OOO   SSSS
            //U   U S     U   U A   A R   R   I   O   O S
            //U   U  SSS  U   U AAAAA RRRR    I   O   O  SSS
            //U   U     S U   U A   A R   R   I   O   O     S
            // UUU  SSSS   UUU  A   A R   R IIIII  OOO  SSSS
            
            let users: Array<string> = [];
            if(createdById && createdById != '') users.push(createdById);
            // Se agrega el valor "approvedById" sólo si no existe ya en el arreglo.
            if(approvedById && approvedById != '') {
                if(users.indexOf(approvedById) < 0) {
                    users.push(approvedById);
                }
            }
            let _users: any = [];
            if(users.length > 0) {
                try {
                    let params = {
                        _id: users
                    };
                    let userModel = new UserModel();
                    _users = await userModel.getUsers(params);
                } catch(error) {
                    errors.push(error);
                }
            }
            
            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
            
            let result: any = _quotation.data;
            result['createdBy'] = _users[0] || {};
            result['approvedBy'] = _users[1] || {};
            if(errors.length > 0) {
                result['errors'] = errors;
            }
            return resolve(result);
        });
    }
    
    public getQuotations(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // Parámetros.
            let { limit, page, ...filters } = query;
            let params: any = {
                limit,
                page
            };
            Object.keys(filters).forEach(key => params[key] = filters[key]);
            // Petición.
            axios.get(configuration.services.domain.quotations.getQuotations, { params })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || []);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Cotizaciones',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Cotizaciones',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public getItems(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.quotations.items.getItems, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Cotizaciones | Ítems',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Cotizaciones | Ítems',
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

    public postQuotation(body: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let errors: Array<any> = [];
            this.validateSchema(body)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Cotizaciones',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.post(configuration.services.domain.quotations.postQuotation, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Cotizaciones',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Cotizaciones',
                            message: 'Ocurrió un error al intentar guardar la información (COTIZACIÓN).',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            }
        });
    }

    public postItem(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
            //V   V A   A L       I   D   D A   A C       I   O   O NN  N
            //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
            // V V  A   A L       I   D   D A   A C       I   O   O N  NN
            //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N
    
            let item = new QuotationItem();
            item.name = body.name;
            item.amount = body.amount;
            item.discountPercentage = body.discountPercentage;
            item.initialCost = body.initialCost;
            item.total = body.total;
            validate(item, { skipMissingProperties: true })
            .then((errors: any) => {
                if (errors.length > 0) {
                    let errorsWithConstraints: any[] = RemodelErrors(errors);
                    let response: any = {
                        module: 'Cotizaciones | Ítems',
                        message: 'La información no es válida.',
                        errors: errorsWithConstraints
                    };
                    return reject(response);
                }
            });
    
            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T
    
            //Parámetros.
            let data = {
                _id: body.id,
                item
            }
            //Petición.
            axios.post(configuration.services.domain.quotations.items.postItem, data)
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Cotizaciones | Ítems',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Cotizaciones | Ítems',
	                    message: 'Ocurrió un error al intentar guardar la información (COTIZACIÓN - ITEM).',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    //PPPP  U   U TTTTT
    //P   P U   U   T
    //PPPP  U   U   T
    //P     U   U   T
    //P      UUU    T

    public putQuotation(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let errors: Array<any> = [];
            this.validateSchema(body)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Cotizaciones',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.put(configuration.services.domain.quotations.putQuotation, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Cotizaciones',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Cotizaciones',
                            message: 'Ocurrió un error al intentar actualizar la información.',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            }
        });
    }

    public putItem(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
            //V   V A   A L       I   D   D A   A C       I   O   O NN  N
            //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
            // V V  A   A L       I   D   D A   A C       I   O   O N  NN
            //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N
    
            let item = new QuotationItem();
            item.name = body.name;
            item.amount = body.amount;
            item.discountPercentage = body.discountPercentage;
            item.initialCost = body.initialCost;
            item.total = body.total;
            validate(item, { skipMissingProperties: true })
            .then((errors: any) => {
                if (errors.length > 0) {
                    let errorsWithConstraints: any[] = RemodelErrors(errors);
                    let response: any = {
                        module: 'Cotizaciones | Ítems',
                        message: 'La información no es válida.',
                        errors: errorsWithConstraints
                    };
                    return reject(response);
                }
            });
    
            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T
    
            let data = {
                _id: body.id,
                itemId: body.itemId,
                item
            };
            axios.put(configuration.services.domain.services.comments.putComment, data)
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Cotizaciones | Ítems',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Cotizaciones | Ítems',
	                    message: 'Ocurrió un error al intentar actualizar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    //DDDD  EEEEE L     EEEEE TTTTT EEEEE
    //D   D E     L     E       T   E
    //D   D EEE   L     EEE     T   EEE
    //D   D E     L     E       T   E
    //DDDD  EEEEE LLLLL EEEEE   T   EEEEE

    public deleteQuotation(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.quotations.deleteQuotation, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Cotizaciones',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Cotizaciones',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public deleteItem(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.quotations.items.deleteItem, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Cotizaciones | Ítems',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Cotizaciones | Ítems',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

}