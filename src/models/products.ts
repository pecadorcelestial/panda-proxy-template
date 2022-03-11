import axios from 'axios';
import idx from 'idx';
import { IsDefined, IsString, validate, MaxLength, IsMongoId, IsNumber, IsPositive, IsArray, IsBoolean, Min, ValidateIf, Max } from 'class-validator';
import { RemodelErrors } from '../scripts/data-management';
import configuration from '../configuration';

//PPPP  RRRR   OOO  DDDD  U   U  CCCC TTTTT  OOO   SSSS
//P   P R   R O   O D   D U   U C       T   O   O S
//PPPP  RRRR  O   O D   D U   U C       T   O   O  SSS
//P     R   R O   O D   D U   U C       T   O   O     S
//P     R   R  OOO  DDDD   UUU   CCCC   T    OOO  SSSS

export class Product {
    // Identificador.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    _id: string;
    // Código.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(10, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    code: string;
    // Nombre.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(500, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    name: string;
    // Descripción.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(500, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    description: string;
    // Estatus.
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
    // Tipo.
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
    // Inventario mínimo.
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @IsPositive({
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    minStock?: number;
    // Modelo.
    // ALTÁN: "v1"
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
    model: string;
    // Marca.
    // ALTÁN === altan
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
    brandValue: string;
    // Categoría.
    // ALTÁN: HBB / MBB
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
    categoryValue: string;    
    // Especificaciones.
    specifications?: Array<Specification>;
    // Precio.
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @IsPositive({
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    price?: number;
    // Prefijo: Se utiliza para nombrar cuentas.
    // SÓLO SI ES SERVICIO.
    @ValidateIf(o => o.typeValue === 'service')
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(5, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    prefix: string;
    // Alertas.
    alerts?: Array<Alert>;
    // ¿Es paquete?
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    isBundle?: boolean = false;
    // Productos asociados (PAQUETE).
    @IsArray({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    bundle?: Array<Bundle>;
    // Productos a los que está relacionado.
    @IsArray({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    realtedTo?: Array<string>;
}

export class Specification {
    // Identificador.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    _id: string;
    // Nombre.
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
    name: string;
    // Valor.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(200, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    value: string;
}

export class Bundle {
    // Identificador.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    _id: string;
    // Cantidad.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({}, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    quantity: number;
    // Producto asociado.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    productId: string;
}

export class Alert {
    // Identificador.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    _id: string;
    // Inventario mínimo.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @IsPositive({
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    minimumStock: number;
    // USUARIOS.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsArray({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    users: Array<string>;
}

export class ProductModel {

    //Propiedades.
    private product: any;
    
    //Constructor.
    constructor(product?: any) {
        this.product = product;
    }

    //Métodos.

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        let { specifications, ...product } = this.product;
        specifications = Array.isArray(specifications) ? specifications : [];
        return this.validateSchema(product, specifications);
    }

    private async validateSchema(_product: any = {}, _specifications: any = [], _alerts: any = [], _bundle: any = [], groups: Array<string> = ['POST']): Promise<any[]> {
        
        let errors: Array<any> = [];
        
        // PRODUCTO.
        let product = new Product();
        product.code = _product.code;
        product.name = _product.name;
        product.description = _product.description;
        product.minStock = _product.minStock;
        product.model = _product.model;
        product.brandValue = _product.brandValue;
        product.categoryValue = _product.categoryValue;
        // product.specifications = _product.specifications;
        product.price = _product.price;
        product.prefix = _product.prefix;
        product.isBundle = _product.isBundle;
        product.bundle = _product.bundle;
        product.realtedTo = _product.realtedTo;
        let productErrors = await validate(product, { groups, skipMissingProperties: true });
        errors = RemodelErrors(productErrors, 'product');
        // ESPECIFICACIONES.
        if(Array.isArray(_specifications) && _specifications.length > 0) {
            let index: number = 0;
            for(const _specification of _specifications) {
                let specification = new Specification();
                specification.name = _specification.name;
                specification.value = _specification.value;
                let specificationErrors = await validate(specification, { groups, skipMissingProperties: true });
                errors = errors.concat(RemodelErrors(specificationErrors, `product.specifications[${index}]`));
                index++;
            };
        }
        // PRODUCTOS ASOCIADOS.
        if(Array.isArray(_bundle) && _bundle.length > 0) {
            let index: number = 0;
            for(const _product of _bundle) {
                let bundle = new Bundle();
                bundle.quantity = _product.quantity;
                bundle.productId = _product.productId;
                let bundleErrors = await validate(bundle, { groups, skipMissingProperties: true });
                errors = errors.concat(RemodelErrors(bundleErrors, `product.bundle[${index}]`));
                index++;
            };
        }
        // ALERTAS.
        if(Array.isArray(_alerts) && _alerts.length > 0) {
            let index: number = 0;
            for(const _alert of _alerts) {
                let alert = new Alert();
                alert.minimumStock = _alert.minimumStock;
                alert.users = _alert.users;
                let alertErrors = await validate(alert, { groups, skipMissingProperties: true });
                errors = errors.concat(RemodelErrors(alertErrors, `product.alerts[${index}]`));
                index++;
            }
        }

        return errors;
    }

    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getProduct(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.products.getProduct, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Productos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Productos',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }
    
    public getProducts(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // Parámetros.
            let { limit, page, ...filters } = query;
            let params: any = {
                limit,
                page
            };
            Object.keys(filters).forEach(key => params[key] = filters[key]);
            // Petición.
            axios.get(configuration.services.domain.products.getProducts, { params })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || []);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Productos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
                        status: 400,
                        module: 'Productos',
                        message: 'Ocurrió un error al intentar obtener la información.',
                        error: idx(error, _ => _.response.data) || error
                    });
                }
            });
        });
    }

    public getSpecifications(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.products.specifications.getSpecifications, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Productos | Especificaciones',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Productos | Especificaciones',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public getAlerts(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.products.alerts.getAlerts, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Productos | Alertas',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Productos | Alertas',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public getBundles(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.products.bundles.getBundles, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Paquetes',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Paquetes',
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

    public postProduct(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let { specifications, alerts, bundle, ...product } = body;
            
            //PPPP  RRRR  EEEEE FFFFF IIIII JJJJJ  OOO
            //P   P R   R E     F       I     J   O   O
            //PPPP  RRRR  EEE   FFF     I     J   O   O
            //P     R   R E     F       I   J J   O   O
            //P     R   R EEEEE R     IIIII  J     OOO

            let prefix: string = '';
            let code: string = '';
            if(product.typeValue === 'service') {
                prefix = product.categoryValue;
                if(typeof prefix === 'string' && prefix.length > 0) {
                    prefix = prefix.toUpperCase();

                    // CCCC  OOO  DDDD  IIIII  GGGG  OOO
                    //C     O   O D   D   I   G     O   O
                    //C     O   O D   D   I   G  GG O   O
                    //C     O   O D   D   I   G   G O   O
                    // CCCC  OOO  DDDD  IIIII  GGGG  OOO

                    try {
                        let query: any = {
                            limit: 1,
                            page: 1,
                            code: `${prefix}-`,
                            sort: { "field": "code", "type": "DESC" }
                        };
                        let _products = await this.getProducts(query);
                        if(Array.isArray(_products.results) && _products.results.length > 0) {
                            let lastCode: string = _products.results[0].code;
                            let lastCodeParts: string[] = lastCode.split('-');
                            let lastCodeNumber: number = parseInt(lastCodeParts[1] || '1') + 1;
                            // Se revisa cuántos ceros se deben agregar.
                            let newCode: string = lastCodeNumber.toString();
                            while(newCode.toString().length < 3) {
                                newCode = `0${newCode}`;
                            }
                            code = `${prefix}-${newCode}`;
                        } else {
                            code = `${prefix}-001`;
                        }
                        // Se asignan el prefijo y el código.
                        if(typeof product.code != 'string' || product.code === '') product.code = code;
                        product.prefix = prefix;
                    } catch(error) {
                        return reject(error);
                    }                    
                } else {
                    return reject({
                        status: 400,
                        module: 'Productos',
                        message: 'El tipo de producto es SERVICIO pero no se proporcionó ninguna categoría.'
                    });
                }
            } else {
                // Si no es del tipo servicio, se elimina el prefijo.
                try {
                    delete product.prefix;
                } catch(error) {}
            }

            //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
            //E     R   R R   R O   O R   R E     S
            //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
            //E     R   R R   R O   O R   R E         S
            //EEEEE R   R R   R  OOO  R   R EEEEE SSSS
    
            let errors: Array<any> = [];
            specifications = Array.isArray(specifications) ? specifications : [];
            alerts = Array.isArray(alerts) ? alerts : [];
            bundle = Array.isArray(bundle) ? bundle : [];
            this.validateSchema(product, specifications, alerts, bundle)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    status: 400,
                    module: 'Productos',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                product.specifications = specifications;
                product.alerts = alerts;
                product.bundle = bundle;
                axios.post(configuration.services.domain.products.postProduct, product)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Productos',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Productos',
                            message: 'Ocurrió un error al intentar guardar la información (PRODUCTO).',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            }
        });
    }

    public postProducts(body: any, file: Express.Multer.File): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            //JJJJJ  SSSS  OOO  N   N
            //  J   S     O   O NN  N
            //  J    SSS  O   O N N N
            //J J       S O   O N  NN
            // J    SSSS   OOO  N   N

            let items: Array<Product> = [];
            if(file) {
                try {
                    items = JSON.parse(file.buffer.toString('utf8'));
                } catch(error) {
                    return reject({
                        status: 400,
                        module: 'Productos',
                        message: 'No se pudo leer la información del archivo.',
                        error
                    });
                }
            } else {
                return reject({
                    status: 404,
                    module: 'Productos',
                    message: 'No se encontró un archivo en la petición.'
                });
            }
            
            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T
        
            // ESPARTANO.
            // Se insertan uno a uno.
            let goodRecords: Array<Product> = [];
            let badRecords: Array<Product> = [];
            let errors: Array<any> = [];
            for(const product of items) {
                try {
                    await this.postProduct(product);
                    goodRecords.push(product);
                } catch(error) {
                    errors.push(error);
                    badRecords.push(product);
                }
            }
            if(goodRecords.length === 0) {
                return reject({
                    status: 400,
                    module: 'Productos',
                    message: 'Ocurrió un error al intentar guardar la información, no se pudo insertar ningún registro (CUENTAS).',
                    good: {
                        total: goodRecords.length
                    },
                    bad: {
                        total: badRecords.length,
                        records: badRecords
                    },
                    errors
                });
            } else {
                return resolve({
                    status: badRecords.length === 0 ? 200 : 206,
                    message: `Información guardada con éxito.\nCuentas guardadas: ${goodRecords.length - badRecords.length}.\nCuentas que no se pudieron guardar: ${badRecords.length}`,
                    good: {
                        total: goodRecords.length
                    },
                    bad: {
                        total: badRecords.length,
                        records: badRecords
                    },
                    errors
                });
            }
        });
    }

    public postSpecification(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
            //V   V A   A L       I   D   D A   A C       I   O   O NN  N
            //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
            // V V  A   A L       I   D   D A   A C       I   O   O N  NN
            //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N
    
            let specification = new Specification();
            specification.name = body.name;
            specification.value = body.value;
            validate(specification, { skipMissingProperties: true })
            .then((errors: any) => {
                if (errors.length > 0) {
                    let errorsWithConstraints: any[] = RemodelErrors(errors);
                    let response: any = {
                        module: 'Productos | Especificaciones',
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
                specification
            }
            //Petición.
            axios.post(configuration.services.domain.products.specifications.postSpecification, data)
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Productos | Especificaciones',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Productos | Especificaciones',
	                    message: 'Ocurrió un error al intentar guardar la información (MODELO).',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public postAlert(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
            //V   V A   A L       I   D   D A   A C       I   O   O NN  N
            //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
            // V V  A   A L       I   D   D A   A C       I   O   O N  NN
            //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N
    
            let alert = new Alert();
            alert.minimumStock = body.minimumStock;
            alert.users = body.users;
            validate(alert, { skipMissingProperties: true })
            .then((errors: any) => {
                if (errors.length > 0) {
                    let errorsWithConstraints: any[] = RemodelErrors(errors);
                    let response: any = {
                        module: 'Productos | Alertas',
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
                alert
            }
            //Petición.
            axios.post(configuration.services.domain.products.alerts.postAlert, data)
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Productos | Alertas',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Productos | Alertas',
	                    message: 'Ocurrió un error al intentar guardar la información (ALERTA).',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public postBundle(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
            //V   V A   A L       I   D   D A   A C       I   O   O NN  N
            //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
            // V V  A   A L       I   D   D A   A C       I   O   O N  NN
            //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N
    
            let bundle = new Bundle();
            bundle.quantity = body.quantity;
            bundle.productId = body.productId;
            validate(bundle, { skipMissingProperties: true })
            .then((errors: any) => {
                if (errors.length > 0) {
                    let errorsWithConstraints: any[] = RemodelErrors(errors);
                    let response: any = {
                        module: 'Paquetes',
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
                bundle
            }
            //Petición.
            axios.post(configuration.services.domain.products.bundles.postBundle, data)
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Paquetes',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Paquetes',
	                    message: 'Ocurrió un error al intentar guardar la información (PAQUETE).',
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

    public putProduct(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {            
            let errors: Array<any> = [];
            let { specifications, alerts, bundle, ...product } = body;
            specifications = Array.isArray(specifications) ? specifications : [];
            alerts = Array.isArray(alerts) ? alerts : [];
            bundle = Array.isArray(bundle) ? bundle : [];
            this.validateSchema(product, specifications, alerts, bundle, ['PUT'])
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Productos',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.put(configuration.services.domain.products.putProduct, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Productos',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Productos',
                            message: 'Ocurrió un error al intentar actualizar la información.',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            }
        });
    }

    public putSpecification(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
            //V   V A   A L       I   D   D A   A C       I   O   O NN  N
            //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
            // V V  A   A L       I   D   D A   A C       I   O   O N  NN
            //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N
    
            let specification = new Specification();
            specification._id = body.specificationId;
            specification.name = body.name;
            specification.value = body.value;
            validate(specification, { groups: ['PUT'], skipMissingProperties: true })
            .then((errors: any) => {
                if (errors.length > 0) {
                    let errorsWithConstraints: any[] = RemodelErrors(errors);
                    let response: any = {
                        module: 'Productos | Especificaciones',
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
    
            let params = {
                _id: body.id,
                specificationId: body.specificationId,
                specification
            };
            axios.put(configuration.services.domain.products.specifications.putSpecification, params)
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Productos | Especificaciones',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Productos | Especificaciones',
	                    message: 'Ocurrió un error al intentar actualizar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public putAlert(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
            //V   V A   A L       I   D   D A   A C       I   O   O NN  N
            //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
            // V V  A   A L       I   D   D A   A C       I   O   O N  NN
            //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N
    
            let alert = new Alert();
            alert._id = body.alertId;
            alert.minimumStock = body.minimumStock;
            alert.users = body.users;
            validate(alert, { groups: ['PUT'], skipMissingProperties: true })
            .then((errors: any) => {
                if (errors.length > 0) {
                    let errorsWithConstraints: any[] = RemodelErrors(errors);
                    let response: any = {
                        module: 'Productos | Alertas',
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
    
            let params = {
                _id: body.id,
                alertId: body.alertId,
                alert
            };
            axios.put(configuration.services.domain.products.alerts.putAlert, params)
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Productos | Alertas',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Productos | Alertas',
	                    message: 'Ocurrió un error al intentar actualizar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public putBundle(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
            //V   V A   A L       I   D   D A   A C       I   O   O NN  N
            //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
            // V V  A   A L       I   D   D A   A C       I   O   O N  NN
            //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N
    
            let bundle = new Bundle();
            bundle._id = body.bundleId;
            bundle.quantity = body.quantity;
            bundle.productId = body.productId;
            validate(bundle, { groups: ['PUT'], skipMissingProperties: true })
            .then((errors: any) => {
                if (errors.length > 0) {
                    let errorsWithConstraints: any[] = RemodelErrors(errors);
                    let response: any = {
                        module: 'Paquetes',
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
    
            let params = {
                _id: body.id,
                bundleId: body.bundleId,
                bundle
            };
            axios.put(configuration.services.domain.products.bundles.putBundle, params)
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Paquetes',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Paquetes',
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

    public deleteProduct(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.products.deleteProduct, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Productos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Productos',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public deleteSpecification(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.products.specifications.deleteSpecification, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Productos | Especificaciones',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Productos | Especificaciones',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public deleteAlert(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.products.alerts.deleteAlert, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Productos | Alertas',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Productos | Alertas',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public deleteBundle(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.products.bundles.deleteBundle, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Paquetes',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Paquetes',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

}

// AAA  L     TTTTT  AAA  N   N
//A   A L       T   A   A NN  N
//AAAAA L       T   AAAAA N N N
//A   A L       T   A   A N  NN
//A   A LLLLL   T   A   A N   N

class Coordinates {
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
}

export class AltanProduct {
    // MSISDN.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(10, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    msisdn: string;
    // Coordenadas.
    coordinates?: Coordinates;
    // Identificador del producto.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(15, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    offeringId: string;
    // Número de cuenta.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(20, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    accountNumber: string;
    // Estatus.
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
}

export class AltanProductModel {
    
    //Propiedades.
    private altanProduct: AltanProduct;
    
    //Constructor.
    constructor(altanProduct?: AltanProduct) {
        this.altanProduct = altanProduct || new AltanProduct();
    }

    //Métodos.

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        return this.validateSchema(this.altanProduct);
    }

    private async validateSchema(_altanProduct: any = {}, groups: Array<string> = ['POST']): Promise<any[]> {
        
        let errors: Array<any> = [];
        
        // PRODUCTO.
        let altanProduct = new AltanProduct();
        altanProduct.msisdn = _altanProduct.msisdn;
        // altanProduct.coordinates = _altanProduct.coordinates;
        altanProduct.offeringId = _altanProduct.offeringId;
        altanProduct.accountNumber = _altanProduct.accountNumber;
        altanProduct.statusValue = _altanProduct.statusValue;
        let productErrors = await validate(altanProduct, { groups, skipMissingProperties: true });
        errors = RemodelErrors(productErrors, 'product');
        // COORDENADAS.
        if(_altanProduct.coordinates) {
            let coordinates = new Coordinates();
            coordinates.latitude = _altanProduct.coordinates.latitude;
            coordinates.longitude = _altanProduct.coordinates.longitude;
            let coordinatesErrors = await validate(coordinates);
            errors = RemodelErrors(coordinatesErrors, 'coordenates');
        }

        return errors;
    }

    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getAltanProduct(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.products.altan.getProduct, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Productos Altán',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Productos Altán',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }
    
    public getAltanProducts(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // Parámetros.
            let { limit, page, ...filters } = query;
            let params: any = {
                limit,
                page
            };
            Object.keys(filters).forEach(key => params[key] = filters[key]);
            // Petición.
            axios.get(configuration.services.domain.products.altan.getProducts, { params })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || []);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Productos Altán',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
                        status: 400,
                        module: 'Productos Altán',
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

    public postAltanProduct(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let errors: Array<any> = [];
            this.validateSchema(body)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Productos Altán',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.post(configuration.services.domain.products.altan.postProduct, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Productos Altán',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Productos Altán',
                            message: 'Ocurrió un error al intentar guardar la información.',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            }
        });
    }

    public postAltanProducts(body: any, file?: Express.Multer.File): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let { products, ...rest }: { products: Array<AltanProduct> } & any = body;

            //JJJJJ  SSSS  OOO  N   N
            //  J   S     O   O NN  N
            //  J    SSS  O   O N N N
            //J J       S O   O N  NN
            // J    SSSS   OOO  N   N

            let items: Array<AltanProduct> = [];
            if(file) {
                try {
                    items = JSON.parse(file.buffer.toString('utf8'));
                } catch(error) {
                    return reject({
                        status: 400,
                        module: 'Productos Altán',
                        message: 'No se pudo leer la información del archivo.',
                        error
                    });
                }
            } else {
                if(Array.isArray(products) && products.length > 0) {
                    items = products;
                } else {
                    return reject({
                        status: 404,
                        module: 'Productos Altán',
                        message: 'No se encontró un archivo ni una lista de registros en la petición.'
                    });
                }
            }
            
            //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
            //E     R   R R   R O   O R   R E     S
            //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
            //E     R   R R   R O   O R   R E         S
            //EEEEE R   R R   R  OOO  R   R EEEEE SSSS
            
            let goodRecords: Array<AltanProduct> = [];
            let badRecords: Array<AltanProduct> = [];
            for(const product of items) {
                let productErrors: any = await this.validateSchema(product);
                // Se revisa si el cliente se puede insertar o no.
                if(productErrors.length > 0) {
                    badRecords.push(product);
                } else {
                    goodRecords.push(product);
                }
            }

            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T

            if(goodRecords.length === 0) {
                return reject({
                    status: 400,
                    module: 'Productos Altán',
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
                axios.post(configuration.services.domain.products.altan.postProducts, goodRecords)
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
                        module: 'Productos Altán',
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
        });
    }

    //PPPP  U   U TTTTT
    //P   P U   U   T
    //PPPP  U   U   T
    //P     U   U   T
    //P      UUU    T

    public putAltanProduct(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let errors: Array<any> = [];
            this.validateSchema(body)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Productos Altán',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.put(configuration.services.domain.products.altan.putProduct, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Productos Altán',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Productos Altán',
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

    public deleteAltanProduct(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.products.altan.deleteProduct, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Productos Altán',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Productos Altán',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

}