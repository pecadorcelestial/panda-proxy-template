// Módulos.
import axios from 'axios';
import idx from 'idx';
import { IsString, IsDefined, IsNumber, Min, Max, validate, IsEnum, MaxLength, IsMongoId, IsNotEmpty } from 'class-validator';
// Modelos.
import AccountModel, { Account } from './accounts';
import { ZipCodeModel } from './locations';
// Clases.
import Google from '../classes/google';
// Funciones.
import { percentFound } from '../scripts/strings';
import { RemodelErrors } from '../scripts/data-management';
// Configuración.
import configuration from '../configuration';
// Constantes.
import { CATALOGS } from '../constants/constants';

export class Address {
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
    // Calle.
    @IsDefined({
        message: 'El campo es requerido.'
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @IsNotEmpty({
        message: 'El campo no puede estar vacío.'
    })
    @MaxLength(100, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    street: string;
    // Número exterior.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(20, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    outdoorNumber: string;
    // Número interior.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(20, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    interiorNumber: string;
    // Colonia / asentamiento.
    @IsDefined({
        message: 'El campo es requerido.'
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @IsNotEmpty({
        message: 'El campo no puede estar vacío.'
    })
    @MaxLength(100, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    settlement: string;
    // Ubicación.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(100, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    location: string;
    // Referencia.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(255, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    reference: string;
    // Latitud.
    @IsDefined({
        message: 'El campo es requerido.'
    })
    @IsNumber({
        allowNaN: false
    },{
        message: 'El tipo de dato es incorrecto.'
    })
    @Min(-85, {
        message: 'El valor es menor al permitido.'
    })
    @Max(85, {
        message: 'El valor es mayor al permitido.'
    })
    latitude: number;
    // Longitud.
    @IsDefined({
        message: 'El campo es requerido.'
    })
    @IsNumber({
        allowNaN: false
    },{
        message: 'El tipo de dato es incorrecto.'
    })
    @Min(-180, {
        message: 'El valor es menor al permitido.'
    })
    @Max(180, {
        message: 'El valor es mayor al permitido.'
    })
    longitude: number;
    // Código postal.
    @IsDefined({
        message: 'El campo es requerido.'
    })
    @IsNumber({
        allowNaN: false
    },{
        message: 'El tipo de dato es incorrecto.'
    })
    @Min(1000, {
        message: 'El valor es menor al permitido.'
    })
    @Max(99999, {
        message: 'El valor es mayor al permitido.'
    })
    zipCode: number;
    // Identificador del codigo postal.
    @IsDefined({
        message: 'El campo es requerido.'
    })
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.'
    })
    extraDetails: string;
    // Tipo (valor).
    // @IsDefined({
    //     message: 'El campo es requerido.',
    //     groups: ['POST']
    // })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    typeValue: string;
}

export default class AddressModel {

    //Propiedades.
    private address: any;

    //Constructor.
    constructor(address?: any) {
        this.address = address;    
    }

    //Métodos.

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        return this.validateSchemas(this.address);
    }

    private async validateSchemas(_address: any = {}): Promise<any[]> {
        
        let errors: Array<any> = [];
        
        let address = new Address();
        address.parentId = _address.parentId;
        address.parentType = _address.parentType;
        address.street = _address.street;
        address.outdoorNumber = _address.outdoorNumber;
        address.interiorNumber = _address.interiorNumber;
        address.settlement = _address.settlement;
        address.location = _address.location;
        address.reference = _address.reference;
        address.latitude = _address.latitude;
        address.longitude = _address.longitude;
        address.zipCode = _address.zipCode;
        address.extraDetails = _address.extraDetails;
        address.typeValue = _address.typeValue;
        let addressErrors = await validate(address, { skipMissingProperties: true });
        errors = RemodelErrors(addressErrors, 'address');
        
        return errors;
    }
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getAddress(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.addresses.getAddress, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Direcciones',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Direcciones',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    } 

    public getAddresses(query: any): Promise<any> {
        // Parámetros.
        let { limit, page, ...filters } = query;
        let params: any = {
            limit,
            page
        };
        Object.keys(filters).forEach(key => params[key] = filters[key]);
        // Petición.
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.addresses.getAddresses, { params })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || []);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Direcciones',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Direcciones',
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

    public postAddress(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let errors: Array<any> = [];
            let address: Address = body;
            address.typeValue = address.typeValue || 'default';
            this.validateSchemas(address)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Direcciones',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.post(configuration.services.domain.addresses.postAddress, address)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Direcciones',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Direcciones',
                            message: 'Ocurrió un error al intentar guardar la información (DIRECCIÓN).',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            }
        });
    }

    public postAddresses(body: any, file: Express.Multer.File): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            // let print: boolean = true;

            let { isTest, ...rest } = body;
            isTest = isTest ? JSON.parse(isTest) : false;

            //JJJJJ  SSSS  OOO  N   N
            //  J   S     O   O NN  N
            //  J    SSS  O   O N N N
            //J J       S O   O N  NN
            // J    SSSS   OOO  N   N

            let items: Array<Address> = [];
            if(file) {
                try {
                    items = JSON.parse(file.buffer.toString('utf8'));
                } catch(error) {
                    return reject({
                        status: 400,
                        module: 'Direcciones',
                        message: 'No se pudo leer la información del archivo.',
                        error
                    });
                }
            } else {
                return reject({
                    status: 404,
                    module: 'Direcciones',
                    message: 'No se encontró un archivo en la petición.'
                });
            }
            
            //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
            //E     R   R R   R O   O R   R E     S
            //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
            //E     R   R R   R O   O R   R E         S
            //EEEEE R   R R   R  OOO  R   R EEEEE SSSS
            
            let goodRecords: Array<Address> = [];
            let badRecords: Array<any> = [];
            if(Array.isArray(items) && items.length > 0) {
                for(const address of items) {
                    
                    // CCCC U   U EEEEE N   N TTTTT  AAA
                    //C     U   U E     NN  N   T   A   A
                    //C     U   U EEE   N N N   T   AAAAA
                    //C     U   U E     N  NN   T   A   A
                    // CCCC  UUU  EEEEE N   N   T   A   A

                    if(address.parentType === 'account') {
                        if((typeof address.parentId === 'string' && address.parentId.match(/^[0-9]+$/g) !== null) || typeof address.parentId === 'number') {
                            // La cuenta para el movimiento es de tipo LEGACY y se debe obtener el número nuevo.
                            try {
                                let accountModel: AccountModel = new AccountModel();
                                let _account: Account = await accountModel.getAccount({ legacyId: address.parentId });
                                address.parentId = _account.accountNumber;
                            } catch(error) {
                                badRecords.push({
                                    address,
                                    errors: error
                                });
                                continue;
                            }
                        }
                    }

                    // Análisis y transformación de datos.
                    try {
                        // TODO: Eliminar.
                        address.parentId = address.parentId.toString();
                        address.zipCode = address.zipCode;
                        delete address.latitude;
                        delete address.longitude;
                    } catch(error) {}

                    // CCCC  OOO  M   M PPPP  L     EEEEE TTTTT  AAA  RRRR       IIIII N   N FFFFF  OOO  RRRR  M   M  AAA   CCCC IIIII  OOO  N   N
                    //C     O   O MM MM P   P L     E       T   A   A R   R        I   NN  N F     O   O R   R MM MM A   A C       I   O   O NN  N
                    //C     O   O M M M PPPP  L     EEE     T   AAAAA RRRR         I   N N N FFF   O   O RRRR  M M M AAAAA C       I   O   O N N N
                    //C     O   O M   M P     L     E       T   A   A R   R        I   N  NN F     O   O R   R M   M A   A C       I   O   O N  NN
                    // CCCC  OOO  M   M P     LLLLL EEEEE   T   A   A R   R      IIIII N   N F      OOO  R   R M   M A   A  CCCC IIIII  OOO  N   N

                    if(typeof address.zipCode === 'number' && typeof address.settlement === 'string') {

                        //U   U BBBB  IIIII  CCCC  AAA   CCCC IIIII  OOO  N   N
                        //U   U B   B   I   C     A   A C       I   O   O NN  N
                        //U   U BBBB    I   C     AAAAA C       I   O   O N N N
                        //U   U B   B   I   C     A   A C       I   O   O N  NN
                        // UUU  BBBB  IIIII  CCCC A   A  CCCC IIIII  OOO  N   N

                        let location: any = {};
                        try {
                            let zipCodeModel = new ZipCodeModel();
                            let zipCodes = await zipCodeModel.getZipCodes({ zipCode: address.zipCode });
                            if(Array.isArray(zipCodes) && zipCodes.length > 1) {
                                // Existe más de una ubicación y se deben filtrar.
                                let filteredZipCodes: Array<any> = zipCodes.filter((zipCode: any, index: number) => {
                                    let weight: number = percentFound(zipCode.name, address.settlement);
                                    zipCodes[index].weight = weight;
                                    return weight > 0;
                                });
                                filteredZipCodes.sort((a: any, b: any) => {
                                    return b.weight - a.weight;
                                });
                                // if(print) {
                                //     console.log('[MODELOS][DIRECIONES][postAddresses] Filtradors: ', filteredZipCodes);
                                //     print = false;
                                // }
                                location = filteredZipCodes[0];
                                if(location) {
                                    if(filteredZipCodes.length > 0) {
                                        address.settlement = location.name;
                                        address.extraDetails = location._id;
                                    }
                                } else {
                                    badRecords.push({
                                        address,
                                        errors: 'Búsqueda de dirección (arreglo), no se encontró ninguna coincidencia.'
                                    });
                                    continue;
                                }
                            } else if(Array.isArray(zipCodes) && zipCodes.length === 1) {
                                // Existe sólo una ubicación y esa se utiliza.
                                location = zipCodes[0];
                                address.settlement = location.name;
                                address.extraDetails = location._id;
                            } else {
                                badRecords.push({
                                    address,
                                    errors: 'Búsqueda de dirección (1), no se encontró ninguna coincidencia.'
                                });
                                continue;
                            }
                        } catch(error) {
                            badRecords.push({
                                address,
                                errors: error
                            });
                            continue;
                        }

                        // CCCC  OOO   OOO  RRRR  DDDD  EEEEE N   N  AAA  DDDD   AAA   SSSS
                        //C     O   O O   O R   R D   D E     NN  N A   A D   D A   A S
                        //C     O   O O   O RRRR  D   D EEE   N N N AAAAA D   D AAAAA  SSS
                        //C     O   O O   O R   R D   D E     N  NN A   A D   D A   A     S
                        // CCCC  OOO   OOO  R   R DDDD  EEEEE N   N A   A DDDD  A   A SSSS
                        
                        try {
                            let google = new Google();
                            let coordinates = await google.getCoordinatesFromAddress({
                                street: address.street,
                                outdoorNumber: address.outdoorNumber,
                                interiorNumber: address.interiorNumber,
                                settlement: location.settlement.name,
                                town: location.town.name,
                                state: location.state.name,
                                country: location.country.name,
                                zipCode: address.zipCode.toString()
                            });
                            let geometry = coordinates[0].geometry;
                            let latitude = geometry.location.lat;
                            let longitude = geometry.location.lng;
                            // Latitud.
                            address.latitude = latitude;
                            // Longitud.
                            address.longitude = longitude;
                            // Punto.
                            address['loc'] = { type: 'Point', coordinates: [longitude, latitude] };
                        } catch(error) {
                            badRecords.push({
                                address,
                                errors: error
                            });
                            continue;
                        }

                        //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
                        //V   V A   A L       I   D   D A   A C       I   O   O NN  N
                        //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
                        // V V  A   A L       I   D   D A   A C       I   O   O N  NN
                        //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

                        let addressErrors: any = await this.validateSchemas(address);
                        // Se revisa si el cliente se puede insertar o no.
                        if(addressErrors.length > 0) {
                            badRecords.push({
                                address,
                                errors: addressErrors
                            });
                        } else {
                            goodRecords.push(address);
                        }
                    } else {
                        badRecords.push({
                            address,
                            errors: 'No hay código postal o colonia.'
                        });
                    }
                }
            } else {
                return reject({
                    status: 400,
                    module: 'Direcciones',
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
                    module: 'Direcciones',
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
                        message: 'Todo okey dokey.',
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
                    axios.post(configuration.services.domain.addresses.postAddresses, goodRecords)
                    .then((response: any) => {
                        return resolve({
                            status: 200,
                            message: 'Información insertada con éxito.',
                            data: idx(response, _ => _.data) || {},
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
                            module: 'Direcciones',
                            message: 'Ocurrió un error al intentar guardar la información (DIRECCIÓN).',
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

    public putAddress(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let errors: Array<any> = [];
            this.validateSchemas(body)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.put(configuration.services.domain.addresses.putAddress, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Direcciones',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Direcciones',
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

    public deleteAddress(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.addresses.deleteAddress, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Direcciones',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Direcciones',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

}