import axios from 'axios';
import idx from 'idx';
import { IsString, validate, MaxLength, IsMongoId } from 'class-validator';
import configuration from '../../configuration';
import { RemodelErrors } from '../../scripts/data-management';

class AddressType {
    // Identificador.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.'
    })
    _id: string;
    // Nombre.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    name: string;
    // Expresión regular.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    value: string;
}

export default class AddressTypeModel {

    //Propiedades.
    private addressType: any;

    //Constructor.
    constructor(addressType?: any) {
        this.addressType = addressType;    
    }

    //Métodos.

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        return this.validateSchemas(this.addressType);
    }

    private async validateSchemas(_addressType: any = {}): Promise<any> {
        
        let errors: Array<any> = [];
        
        let addressType = new AddressType();
        addressType.name = _addressType.name;
        addressType.value = _addressType.value;
        let addressTypeErrors = await validate(addressType, { skipMissingProperties: true });
        errors = RemodelErrors(addressTypeErrors, 'addressType');
        
        return errors;
    }
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getAddressType(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.finance.addresss.types.getType, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Tipos | Direcciones',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Tipos | Direcciones',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    } 

    public getAddressTypes(query: any): Promise<any> {
        // Parámetros.
        let { limit, page, ...filters } = query;
        let params: any = {
            limit,
            page
        };
        Object.keys(filters).forEach(key => params[key] = filters[key]);
        // Petición.
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.finance.addresss.types.getTypes, { params })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || []);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Tipos | Direcciones',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Tipos | Direcciones',
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

    public postAddressType(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let errors: Array<any> = [];
            this.validateSchemas(body)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Tipos | Direcciones',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.post(configuration.services.domain.finance.addresss.types.postType, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
	    				return reject({
                            status: 400,
                            module: 'Tipos | Direcciones',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Tipos | Direcciones',
                            message: 'Ocurrió un error al intentar guardar la información (PAGO - TIPO).',
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

    public putAddressType(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let errors: Array<any> = [];
            this.validateSchemas(body)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Tipos | Direcciones',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.put(configuration.services.domain.finance.addresss.types.putType, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Tipos | Direcciones',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Tipos | Direcciones',
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

    public deleteAddressType(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.finance.addresss.types.deleteType, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Tipos | Direcciones',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Tipos | Direcciones',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

}