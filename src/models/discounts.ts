// Módulos.
import axios, { AxiosResponse } from 'axios';
import idx from 'idx';
import { IsString, validate, IsDefined, IsNotEmpty, IsNumber, Min, Max, IsMongoId } from 'class-validator';
// Funciones.
import { RemodelErrors } from '../scripts/data-management';
// Configuración.
import configuration from '../configuration';

export class Discount {
    // Identificador.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    _id: string;
    // Tipo.
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
    type: string;
    // Cantidad.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(1, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    amount: number;
    // Estatus.
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
    status: string;
    // Mes de aplicación.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(1, {
        message: 'El valor no puede ser menor a 1.',
        groups: ['POST', 'PUT']
    })
    @Max(12, {
        message: 'El valor no puede ser mayor a 12.',
        groups: ['POST', 'PUT']
    })
    applicationMonth: number;
    // Año de aplicación.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(1, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    applicationYear: number;
}

export default class DiscountsModel {

    //Propiedades.
    private _discount: Discount;

    // Constructor.
    constructor(discount?: Discount) {
        this._discount = discount ? discount : new Discount();
    }
    
    //Métodos.

    // GGGG EEEEE TTTTT      /   SSSS EEEEE TTTTT
    //G     E       T       /   S     E       T
    //G  GG EEE     T      /     SSS  EEE     T
    //G   G E       T     /         S E       T
    // GGGG EEEEE   T    /      SSSS  EEEEE   T

    get discount(): Discount {
        return this._discount;
    }

    set discount(value: Discount) {
        this._discount = value;
    }

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        return this.validateSchemas(this._discount);
    }

    private async validateSchemas(_discount: any = {}, groups: Array<string> = ['POST']): Promise<any> {
        
        let errors: Array<any> = [];
        
        let discount = new Discount();
        discount.type = _discount.type;
        discount.amount = _discount.amount;
        discount.status = _discount.status;
        discount.applicationMonth = _discount.applicationMonth;
        discount.applicationYear = _discount.applicationYear;
        let discountErrors = await validate(discount, { groups, skipMissingProperties: true });
        errors = errors.concat(RemodelErrors(discountErrors, 'discount'));
        
        return errors;
    }
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getDiscount(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.finance.discounts.getDiscount, { params: query })
            .then((response: AxiosResponse<any>) => {
                return resolve(response.data);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Descuentos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Descuentos',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }
    
    public getDiscounts(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {            
            // Parámetros.
            let { limit, page, ...filters } = query;
            let params: any = {
                limit,
                page
            };
            Object.keys(filters).forEach(key => params[key] = filters[key]);
            // Petición.
            axios.get(configuration.services.domain.finance.discounts.getDiscounts, { params })
            .then((response: AxiosResponse<any>) => {
                return resolve(response.data);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Descuentos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Descuentos',
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

    public postDiscount(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {            
            let errors: Array<any> = [];
            this.validateSchemas(body)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Descuentos',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.post(configuration.services.domain.finance.discounts.postDiscount, body)
                .then( async (response: AxiosResponse<any>) => {
                    return resolve(response.data);
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Descuentos',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Descuentos',
                            message: 'Ocurrió un error al intentar guardar la información (CONTACTO).',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            }
        });
    }

    //PPPP  U   U TTTTT
    //P   P U   U   T
    //PPPP  U   U   T
    //P     U   U   T
    //P      UUU    T

    public putDiscount(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {            
            let errors: Array<any> = [];
            this.validateSchemas(body, ['PUT'])
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Descuentos',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.put(configuration.services.domain.finance.discounts.putDiscount, body)
                .then((response: AxiosResponse<any>) => {
                    return resolve(response.data);
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Descuentos',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Descuentos',
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

    public deleteDiscount(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.finance.discounts.deleteDiscount, { params: query })
            .then((response: AxiosResponse<any>) => {
                return resolve(response.data);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Descuentos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Descuentos',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

}