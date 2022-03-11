// Módulos.
import axios, { AxiosResponse } from 'axios';
import idx from 'idx';
import { validate, Min, IsMongoId, IsDefined, IsString, IsEnum, MaxLength, IsNumber } from 'class-validator';
// Funciones.
import { RemodelErrors } from '../scripts/data-management';
// Configuración.
import configuration from '../configuration';
// Constantes.
import { CATALOGS } from '../constants/constants';

//M   M  OOO  V   V IIIII M   M IIIII EEEEE N   N TTTTT  OOO   SSSS
//MM MM O   O V   V   I   MM MM   I   E     NN  N   T   O   O S
//M M M O   O V   V   I   M M M   I   EEE   N N N   T   O   O  SSS
//M   M O   O  V V    I   M   M   I   E     N  NN   T   O   O     S
//M   M  OOO    V   IIIII M   M IIIII EEEEE N   N   T    OOO  SSSS

export class ShippingInfo {
    // Guía.
    // @IsDefined({
    //     message: 'El campo es requerido.',
    //     groups: ['POST']
    // })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    code: string;
    // Paquetería.
    // @IsDefined({
    //     message: 'El campo es requerido.',
    //     groups: ['POST']
    // })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    carrier: string;
    // Identificador de la dirección de envío.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    addressId: string;
}

export class Movement {
    // Identificador.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    _id?: string;
    // Folio.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({ allowNaN: false },{
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    folio: number;
    // Identificador del origen.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    originId: string;
    // Tipo de origen.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @IsEnum(CATALOGS, {
        message: 'El valor no es válido.',
        groups: ['POST', 'PUT']
    })
    originType: string;
    // Tipo de movimiento.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    typeValue: string;
    // Estatus del movimiento.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    statusValue: string;
    // Identificador del destino.
    // @IsDefined({
    //     message: 'El campo es requerido.',
    //     groups: ['POST']
    // })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    destinationId: string;
    // Tipo de destino.
    // @IsDefined({
    //     message: 'El campo es requerido.',
    //     groups: ['POST']
    // })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @IsEnum(CATALOGS, {
        message: 'El valor no es válido.',
        groups: ['POST', 'PUT']
    })
    destinationType: string;
    // Identificador del producto.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    productId: string;
    // Cantidad.
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(1, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    quantity?: number = 1;
    // Costo unitario.
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    unitCost?: number;
    // Costo total.
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    totalCost?: number;
    // Número de serie.
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    serialNumber?: string;
    // Código.
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    code?: string;
    // Información del envío.
    shippingInfo?: ShippingInfo;
}

export default class MovementModel {

    //Propiedades.
    private movement: Movement;

    // Constructor.
    constructor(movement?: Movement) {
        this.movement = movement || new Movement();
    }
    
    //Métodos.

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        let { ...movement }: Movement = this.movement;
        return this.validateSchema(movement);
    }

    private async validateSchema(_movement: any = {}, groups: Array<string> = ['POST']): Promise<any[]> {
        
        let errors: Array<any> = [];
        
        // RECIBO.
        let movement = new Movement();
        movement.folio = _movement.folio;
        movement.originId = _movement.originId;
        movement.originType = _movement.originType;
        movement.typeValue = _movement.typeValue;
        movement.statusValue = _movement.statusValue;
        movement.destinationId = _movement.destinationId;
        movement.destinationType = _movement.destinationType;
        movement.productId = _movement.productId;
        movement.quantity = _movement.quantity;
        movement.unitCost = _movement.unitCost;
        movement.totalCost = _movement.totalCost;
        movement.serialNumber = _movement.serialNumber;
        movement.code = _movement.code;
        // movement.shippingInfo = _movement.shippingInfo;
        let movementErrors = await validate(movement, { groups, skipMissingProperties: true });
        errors = errors.concat(RemodelErrors(movementErrors, 'movement'));
        // ENVÍO.
        if(_movement.shippingInfo) {
            let shippingInfo = new ShippingInfo();
            shippingInfo.code = _movement.shippingInfo.code;
            shippingInfo.carrier = _movement.shippingInfo.carrier;
            shippingInfo.addressId = _movement.shippingInfo.addressId;
            let shippingInfoErrors = await validate(shippingInfo, { groups, skipMissingProperties: true });
            errors = errors.concat(RemodelErrors(shippingInfoErrors, `movement.shippingInfo`));
        }
        
        return errors;
    }
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getMovement(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.inventory.movements.getMovement, { params: query })
            .then((response: AxiosResponse<any>) => {
                return resolve(response.data);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Movimientos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Movimientos',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }
    
    public getMovements(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {            
            // Parámetros.
            let { limit, page, all, ...filters }: { limit: number, page: number, all: boolean } & any = query;
            let params: any = {
                all,
                limit,
                page
            };
            Object.keys(filters).forEach(key => params[key] = filters[key]);
            // Petición.
            axios.get(configuration.services.domain.inventory.movements.getMovements, { params })
            .then((response: AxiosResponse<any>) => {
                return resolve(response.data);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Movimientos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
                        status: 400,
                        module: 'Movimientos',
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

    public postMovement(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let movements: Array<Movement> = body.movements || [];

            //U   U L     TTTTT IIIII M   M  OOO       FFFFF  OOO  L     IIIII  OOO
            //U   U L       T     I   MM MM O   O      F     O   O L       I   O   O
            //U   U L       T     I   M M M O   O      FFF   O   O L       I   O   O
            //U   U L       T     I   M   M O   O      F     O   O L       I   O   O
            // UUU  LLLLL   T   IIIII M   M  OOO       F      OOO  LLLLL IIIII  OOO
            
            let lastFolio: number = 1;
            let query: any = {
                limit: 1,
                page: 1,
                sort: { "field": "folio", "type": "DESC" }                
            };
            try {
                let getMovements: { results: Array<Movement>, summary: any } = await this.getMovements(query);
                if(Array.isArray(getMovements.results) && getMovements.results.length > 0) {
                    lastFolio = getMovements.results[0].folio + 1;
                }
            } catch(error) {
                return reject(error);
            }
            
            // CCCC  OOO  M   M PPPP  L     EEEEE TTTTT  AAA  RRRR       IIIII N   N FFFFF  OOO  RRRR  M   M  AAA   CCCC IIIII  OOO  N   N
            //C     O   O MM MM P   P L     E       T   A   A R   R        I   NN  N F     O   O R   R MM MM A   A C       I   O   O NN  N
            //C     O   O M M M PPPP  L     EEE     T   AAAAA RRRR         I   N N N FFF   O   O RRRR  M M M AAAAA C       I   O   O N N N
            //C     O   O M   M P     L     E       T   A   A R   R        I   N  NN F     O   O R   R M   M A   A C       I   O   O N  NN
            // CCCC  OOO  M   M P     LLLLL EEEEE   T   A   A R   R      IIIII N   N F      OOO  R   R M   M A   A  CCCC IIIII  OOO  N   N

            let errors: Array<any> = [];
            for(const movement of movements) {
                movement.folio = lastFolio;
    
                //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
                //E     R   R R   R O   O R   R E     S
                //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
                //E     R   R R   R O   O R   R E         S
                //EEEEE R   R R   R  OOO  R   R EEEEE SSSS
            
                try {
                    let movementErrors: Array<any> = await this.validateSchema(movement);
                    if(Array.isArray(movementErrors)) errors = errors.concat(movementErrors);
                } catch(error) {
                    return reject(error);
                }
            }
            if(errors.length > 0) {
                let response: any = {
                    module: 'Movimientos',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.post(configuration.services.domain.inventory.movements.postMovements, movements)
                .then((response: AxiosResponse<any>) => {
                    return resolve(response.data);
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Movimientos',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Movimientos',
                            message: 'Ocurrió un error al intentar guardar la información.',
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

    public putMovement(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let errors: Array<any> = [];
            this.validateSchema(body, ['PUT'])
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Movimientos',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.put(configuration.services.domain.inventory.movements.putMovement, body)
                .then((response: AxiosResponse<any>) => {
                    return resolve(response.data);
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Movimientos',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Movimientos',
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

    public deleteMovement(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.inventory.movements.deleteMovement, { params: query })
            .then((response: AxiosResponse<any>) => {
                return resolve(response.data);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Recibos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Recibos',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

}