import * as express from 'express';
import axios from 'axios';
import idx from 'idx';
import { IsString, MaxLength, IsNumber, validate, Min, Max, IsMongoId } from 'class-validator';
import { IsRFC } from '../decorators/rfc';
import { RemodelErrors } from '../scripts/data-management';
import configuration from '../configuration';
import FilesModel from './files';

export class GeneralSettings {
    // Nombre.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    name: string;
    // RFC.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(13, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    @IsRFC({
        message: 'El valor no tiene el formato correcto.'
    })
    rfc: string;
    // Razón social.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    businessName: string;
    // Dirección.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(150, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    address: string;
    // Código Postal.
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
    zipCode: string;
    // URL del logotipo.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(120, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    logo: string;
    // CSD.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    csd: string;
    // Archivo llave.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    key: string;
    // Contraseña de facturación.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(20, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    invoicePassword: string;
    // Regimen fiscal.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    taxRegimeValue: string;
}

export default class GeneralSettingsModel {
    
    //Propiedades.
    private generalSettings: any;
    
    //Constructor.
    constructor(generalSettings?: any) {
        this.generalSettings = generalSettings;
    }

    //Métodos.

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        return this.validateSchema(this.generalSettings);
    }

    private async validateSchema(_generalSettings: any = {}): Promise<any> {
        
        let errors: Array<any> = [];
        
        // PRODUCTO.
        let generalSettings = new GeneralSettings();
        generalSettings.name = _generalSettings.name;
        generalSettings.rfc = _generalSettings.rfc;
        generalSettings.businessName = _generalSettings.businessName;
        generalSettings.address = _generalSettings.address;
        generalSettings.zipCode = _generalSettings.zipCode;
        // generalSettings.logo = _generalSettings.logo;
        generalSettings.csd = _generalSettings.csd;
        generalSettings.key = _generalSettings.key;
        generalSettings.invoicePassword = _generalSettings.invoicePassword;
        generalSettings.taxRegimeValue = _generalSettings.taxRegimeValue;
        let generalSettingsErrors = await validate(generalSettings, { skipMissingProperties: true });
        errors = RemodelErrors(generalSettingsErrors, 'generalSettings');

        return errors;
    }

    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getGeneralSetting(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.generalSettings.getGeneralSetting, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Configuración',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Configuración',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }
    
    public getGeneralSettings(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // Parámetros.
            let { limit, page, ...filters } = query;
            let params: any = {
                limit,
                page
            };
            Object.keys(filters).forEach(key => params[key] = filters[key]);
            // Petición.
            axios.get(configuration.services.domain.generalSettings.getGeneralSettings, { params })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || []);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Configuración',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Configuración',
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

    public postGeneralSetting(body: any, logo: Express.Multer.File | undefined, csd: Express.Multer.File | undefined, key: Express.Multer.File | undefined): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {            

            // AAA  RRRR   CCCC H   H IIIII V   V  OOO   SSSS
            //A   A R   R C     H   H   I   V   V O   O S
            //AAAAA RRRR  C     HHHHH   I   V   V O   O  SSS
            //A   A R   R C     H   H   I    V V  O   O     S
            //A   A R   R  CCCC H   H IIIII   V    OOO  SSSS

            // Variables
            let id = 'local';
            let category = 'configuration';
            let company = configuration.company.name;
            let logoURL: string | undefined;
            let csdURL: string | undefined;
            let keyURL: string | undefined;

            // LOGO.
            if(logo){
                try {
                    /*
                    {
                        "_id":"5ce416a4717cc56b1004c08a",
                        "path":"uploads\\1558451876399.jpg",
                        "meta":{
                            "originalName":"photo5560008939505035179.jpg",
                            "contentType":"image/jpeg",
                            "encoding":"7bit",
                            "size":21446
                        },
                        "createdAt":"2019-05-21T15:17:56.401Z",
                        "updatedAt":"2019-05-21T15:17:56.401Z",
                        "__v":0
                    }
                    */
                    // let { buffer, ...rest } = logo;
                    // console.log(`[MODELOS][CONFIGURACIÓN GENERAL][postGeneralSetting] Propiedades: ${JSON.stringify(rest)}.`);
                    // text/xml
                    // Se revisa la extensión del archivo primero.
                    let fileExtension: string = '';
                    try {
                        let fileExtensionParts: Array<string> = logo.originalname.split('.');
                        fileExtension = fileExtensionParts[fileExtensionParts.length - 1];
                    } catch(error) {}
                    if(['jpg','jpeg', 'png', 'bmp'].indexOf(fileExtension) >= 0) {
                        let fileModel = new FilesModel();
                        let _file: any = await fileModel.postFile(logo, id, category, company);
                        logoURL = _file.path;
                    } else {
                        return reject({
                            status: 417,
                            message: `Configuración | El tipo de archivo esperado es "jpg|jpeg|png|bmp" y el enviado es "${fileExtension}".`,
                            urls: {
                                logo: logoURL || '',
                                csd: csdURL || '',
                                key: keyURL || ''
                            }
                        });
                    }
                } catch(error) {
                    return reject({
                        status: 417,
                        module: 'Configuración',
                        message: 'Ocurrió un error al intentar guardar el archivo (LOGO).',
                        urls: {
                            logo: logoURL || '',
                            csd: csdURL || '',
                            key: keyURL || ''
                        },
                        error
                    });
                }
            } else {
                // console.log(`[MODELOS][CONFIGURACIÓN GENERAL][postGeneralSetting] No se envió el archivo LOGO.`);
            }
            // console.log(`[MODELOS][CONFIGURACIÓN GENERAL][postGeneralSetting] LOGO guardado con éxito.`);

            // CSD
            if(csd){
                try {
                    // application/x-x509-ca-cert
                    let fileExtension: string = '';
                    try {
                        let fileExtensionParts: Array<string> = csd.originalname.split('.');
                        fileExtension = fileExtensionParts[fileExtensionParts.length - 1];
                    } catch(error) {}
                    if(fileExtension === 'cer') {
                        let fileModel = new FilesModel();
                        let _file: any = await fileModel.postFile(csd, id, category, company);
                        csdURL = _file.path;
                    } else {
                        return reject({
                            status: 417,
                            message: `Configuración | El tipo de archivo esperado es "cer" y el enviado es "${fileExtension}".`,
                            urls: {
                                logo: logoURL || '',
                                csd: csdURL || '',
                                key: keyURL || ''
                            }
                        });
                    }
                } catch(error) {
                    return reject({
                        status: 417,
                        module: 'Configuración',
                        message: 'Ocurrió un error al intentar guardar el archivo (CSD).',
                        urls: {
                            logo: logoURL || '',
                            csd: csdURL || '',
                            key: keyURL || ''
                        },
                        error
                    });
                }
            } else {
                // console.log(`[MODELOS][CONFIGURACIÓN GENERAL][postGeneralSetting] No se envió el archivo CSD.`);
            }
            // console.log(`[MODELOS][CONFIGURACIÓN GENERAL][postGeneralSetting] CSD guardado con éxito.`);

            // KEY
            if(key){
                try {
                    // application/octet-stream
                    let fileExtension: string = '';
                    try {
                        let fileExtensionParts: Array<string> = key.originalname.split('.');
                        fileExtension = fileExtensionParts[fileExtensionParts.length - 1];
                    } catch(error) {}
                    if(fileExtension === 'key') {
                        let fileModel = new FilesModel();
                        let _file: any = await fileModel.postFile(key, id, category, company);
                        keyURL = _file.path;
                    } else {
                        return reject({
                            status: 417,
                            message: `Configuración | El tipo de archivo esperado es "key" y el enviado es "${fileExtension}".`,
                            urls: {
                                logo: logoURL || '',
                                csd: csdURL || '',
                                key: keyURL || ''
                            }
                        });
                    }
                } catch(error) {
                    return reject({
                        status: 417,
                        module: 'Configuración',
                        message: 'Ocurrió un error al intentar guardar el archivo (KEY).',
                        urls: {
                            logo: logoURL || '',
                            csd: csdURL || '',
                            key: keyURL || ''
                        },
                        error
                    });
                }
            } else {
                // console.log(`[MODELOS][CONFIGURACIÓN GENERAL][postGeneralSetting] No se envió el archivo KEY.`);
            }
            // console.log(`[MODELOS][CONFIGURACIÓN GENERAL][postGeneralSetting] KEY guardado con éxito.`);

            // CCCC  OOO  N   N FFFFF IIIII  GGGG U   U RRRR   AAA   CCCC IIIII  OOO  N   N
            //C     O   O NN  N F       I   G     U   U R   R A   A C       I   O   O NN  N
            //C     O   O N N N FFF     I   G  GG U   U RRRR  AAAAA C       I   O   O N N N
            //C     O   O N  NN F       I   G   G U   U R   R A   A C       I   O   O N  NN
            // CCCC  OOO  N   N F     IIIII  GGGG  UUU  R   R A   A  CCCC IIIII  OOO  N   N

            let errors: Array<any> = [];
            let { ...settings } = body;
            // URLs
            settings.logo = (typeof logoURL === 'string' && logoURL.length > 0) ? logoURL : settings.logo;
            settings.csd = (typeof csdURL === 'string' && csdURL.length > 0) ? csdURL : settings.csd;
            settings.key = (typeof keyURL === 'string' && keyURL.length > 0) ? keyURL : settings.key;
            // Validación.
            this.validateSchema(settings)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    status: 404,
                    module: 'Configuración',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.post(configuration.services.domain.generalSettings.postGeneralSetting, settings)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Configuración',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Configuración',
                            message: 'Ocurrió un error al intentar guardar la información (CONFIGURACIÓN).',
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

    public putGeneralSetting(body: any, logo: Express.Multer.File | undefined, csd: Express.Multer.File | undefined, key: Express.Multer.File | undefined): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {            

            // AAA  RRRR   CCCC H   H IIIII V   V  OOO   SSSS
            //A   A R   R C     H   H   I   V   V O   O S
            //AAAAA RRRR  C     HHHHH   I   V   V O   O  SSS
            //A   A R   R C     H   H   I    V V  O   O     S
            //A   A R   R  CCCC H   H IIIII   V    OOO  SSSS

            // Variables
            let id = 'local';
            let category = 'configuration';
            let company = configuration.company.name;
            let logoURL: string | undefined;
            let csdURL: string | undefined;
            let keyURL: string | undefined;

            // LOGO.
            if(logo){
                try {
                    /*
                    {
                        "_id":"5ce416a4717cc56b1004c08a",
                        "path":"uploads\\1558451876399.jpg",
                        "meta":{
                            "originalName":"photo5560008939505035179.jpg",
                            "contentType":"image/jpeg",
                            "encoding":"7bit",
                            "size":21446
                        },
                        "createdAt":"2019-05-21T15:17:56.401Z",
                        "updatedAt":"2019-05-21T15:17:56.401Z",
                        "__v":0
                    }
                    */
                    // let { buffer, ...rest } = logo;
                    // console.log(`[MODELOS][CONFIGURACIÓN GENERAL][postGeneralSetting] Propiedades: ${JSON.stringify(rest)}.`);
                    // text/xml
                    // Se revisa la extensión del archivo primero.
                    let fileExtension: string = '';
                    try {
                        let fileExtensionParts: Array<string> = logo.originalname.split('.');
                        fileExtension = fileExtensionParts[fileExtensionParts.length - 1];
                    } catch(error) {}
                    if(fileExtension === 'xml') {
                        let fileModel = new FilesModel();
                        let _file: any = await fileModel.postFile(logo, id, category, company);
                        logoURL = _file.path;
                    } else {
                        return reject({
                            status: 417,
                            message: `Configuración | El tipo de archivo esperado es "xml" y el enviado es "${fileExtension}".`,
                            urls: {
                                logo: logoURL || '',
                                csd: csdURL || '',
                                key: keyURL || ''
                            }
                        });
                    }
                } catch(error) {
                    return reject({
                        status: 417,
                        module: 'Configuración',
                        message: 'Ocurrió un error al intentar guardar el archivo (LOGO).',
                        urls: {
                            logo: logoURL || '',
                            csd: csdURL || '',
                            key: keyURL || ''
                        },
                        error
                    });
                }
            } else {
                // console.log(`[MODELOS][CONFIGURACIÓN GENERAL][postGeneralSetting] No se envió el archivo LOGO.`);
            }
            // console.log(`[MODELOS][CONFIGURACIÓN GENERAL][postGeneralSetting] LOGO guardado con éxito.`);

            // CSD
            if(csd){
                try {
                    // application/x-x509-ca-cert
                    let fileExtension: string = '';
                    try {
                        let fileExtensionParts: Array<string> = csd.originalname.split('.');
                        fileExtension = fileExtensionParts[fileExtensionParts.length - 1];
                    } catch(error) {}
                    if(fileExtension === 'cer') {
                        let fileModel = new FilesModel();
                        let _file: any = await fileModel.postFile(csd, id, category, company);
                        csdURL = _file.path;
                    } else {
                        return reject({
                            status: 417,
                            message: `Configuración | El tipo de archivo esperado es "cer" y el enviado es "${fileExtension}".`,
                            urls: {
                                logo: logoURL || '',
                                csd: csdURL || '',
                                key: keyURL || ''
                            }
                        });
                    }
                } catch(error) {
                    return reject({
                        status: 417,
                        module: 'Configuración',
                        message: 'Ocurrió un error al intentar guardar el archivo (CSD).',
                        urls: {
                            logo: logoURL || '',
                            csd: csdURL || '',
                            key: keyURL || ''
                        },
                        error
                    });
                }
            } else {
                // console.log(`[MODELOS][CONFIGURACIÓN GENERAL][postGeneralSetting] No se envió el archivo CSD.`);
            }
            // console.log(`[MODELOS][CONFIGURACIÓN GENERAL][postGeneralSetting] CSD guardado con éxito.`);

            // KEY
            if(key){
                try {
                    // application/octet-stream
                    let fileExtension: string = '';
                    try {
                        let fileExtensionParts: Array<string> = key.originalname.split('.');
                        fileExtension = fileExtensionParts[fileExtensionParts.length - 1];
                    } catch(error) {}
                    if(fileExtension === 'key') {
                        let fileModel = new FilesModel();
                        let _file: any = await fileModel.postFile(key, id, category, company);
                        keyURL = _file.path;
                    } else {
                        return reject({
                            status: 417,
                            message: `Configuración | El tipo de archivo esperado es "key" y el enviado es "${fileExtension}".`,
                            urls: {
                                logo: logoURL || '',
                                csd: csdURL || '',
                                key: keyURL || ''
                            }
                        });
                    }
                } catch(error) {
                    return reject({
                        status: 417,
                        module: 'Configuración',
                        message: 'Ocurrió un error al intentar guardar el archivo (KEY).',
                        urls: {
                            logo: logoURL || '',
                            csd: csdURL || '',
                            key: keyURL || ''
                        },
                        error
                    });
                }
            } else {
                // console.log(`[MODELOS][CONFIGURACIÓN GENERAL][postGeneralSetting] No se envió el archivo KEY.`);
            }
            // console.log(`[MODELOS][CONFIGURACIÓN GENERAL][postGeneralSetting] KEY guardado con éxito.`);

            // CCCC  OOO  N   N FFFFF IIIII  GGGG U   U RRRR   AAA   CCCC IIIII  OOO  N   N
            //C     O   O NN  N F       I   G     U   U R   R A   A C       I   O   O NN  N
            //C     O   O N N N FFF     I   G  GG U   U RRRR  AAAAA C       I   O   O N N N
            //C     O   O N  NN F       I   G   G U   U R   R A   A C       I   O   O N  NN
            // CCCC  OOO  N   N F     IIIII  GGGG  UUU  R   R A   A  CCCC IIIII  OOO  N   N

            let errors: Array<any> = [];
            let { ...settings } = body;
            // URLs
            settings.logo = (typeof logoURL === 'string' && logoURL.length > 0) ? logoURL : settings.logo;
            settings.csd = (typeof csdURL === 'string' && csdURL.length > 0) ? csdURL : settings.csd;
            settings.key = (typeof keyURL === 'string' && keyURL.length > 0) ? keyURL : settings.key;
            // Validación.
            this.validateSchema(settings)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Configuración',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.put(configuration.services.domain.generalSettings.putGeneralSetting, settings)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Configuración',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Configuración',
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

    public deleteGeneralSetting(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.generalSettings.deleteGeneralSetting, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Configuración',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Configuración',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

}