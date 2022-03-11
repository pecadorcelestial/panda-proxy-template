import axios from 'axios';
import idx from 'idx';
import { IsArray, IsString, MaxLength, validate, IsMongoId } from 'class-validator';
import { IsRFC } from '../decorators/rfc';
import { RemodelErrors } from '../scripts/data-management';
import configuration from '../configuration';
import ClientModel from './clients';
import UserModel from './users';
import { QuotationModel } from './quotations';
import ContractModel from './contracts';

class Prospect {
    // Tipo de prospecto (Identificador).
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    type: string;
    // Estatus del prospecto (Identificador).
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    status: string;
    // salesEvents: Object;        //*
    // Notas.
    @IsArray({
        message: 'El tipo de dato es incorrecto.'
    })
    notes: Array<any>;
    // Archivos.
    @IsArray({
        message: 'El tipo de dato es incorrecto.'
    })
    files: Array<string>;
    // businessInfo: Object;       //*
    // Identificador del prospecte al momento de convertir.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.'
    })
    clientId: string;
    // Identificador del ejecutivo de ventas (usuario).
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.'
    })
    salesExecutiveId: string;
    // quotes: Object;             //*
    // contracts: Object;          //*
}

class SalesEvents {
    // Tipo de evento de venta (Identificador).
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    type: string;
    // Descripción.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(255, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    description: String;
}

class BusinessData {
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
    // Nombre de la empresa.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    businessName: string;
}

export default class ProspectModel {
    
    //Propiedades.
    private prospect: any;

    //Constructor.
    constructor(prospect?: any) {
        this.prospect = prospect;
    }

    //Métodos.

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        let { salesEvents, businessData, ...prospect } = this.prospect;
        return this.validateSchemas(salesEvents, businessData, prospect);
    }

    private async validateSchemas(_salesEvents: any = {}, _businessData: any = {}, _prospect: any = {}): Promise<any> {
        
        let errors: Array<any> = [];
        
        // Eventos de ventas.
        let salesEvents = new SalesEvents();
        salesEvents.type = _salesEvents.type;
        salesEvents.description = _salesEvents.description;
        let accountingDataErrors = await validate(salesEvents, { skipMissingProperties: true });
        errors = errors.concat(RemodelErrors(accountingDataErrors, 'prospect.salesEvents'));
        // Datos del negocio.
        let businessData = new BusinessData();
        businessData.rfc = _businessData.rfc;
        businessData.businessName = _businessData.businessName;
        let businessDataErrors = await validate(businessData, { skipMissingProperties: true });
        errors = errors.concat(RemodelErrors(businessDataErrors, 'prospect.businessData'));
        // Prospecto.
        let prospect = new Prospect();
        prospect.type = _prospect.type;
        prospect.status = _prospect.status;
        prospect.notes = _prospect.notes;
        prospect.files = _prospect.files;
        prospect.clientId = _prospect.clientId;
        prospect.salesExecutiveId = _prospect.salesExecutiveId;
        prospect.status = _prospect.status;
        let prospectErrors = await validate(prospect, { skipMissingProperties: true });
        errors = errors.concat(RemodelErrors(prospectErrors, 'prospect'));

        // console.log('[MODELOS][CLIENTES][validateSchemas] Errores: ', errors);
        return errors;
    }
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getProspect(query: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let errors: Array<any> = [];

            //PPPP  RRRR   OOO   SSSS PPPP  EEEEE  CCCC TTTTT  OOO
            //P   P R   R O   O S     P   P E     C       T   O   O
            //PPPP  RRRR  O   O  SSS  PPPP  EEE   C       T   O   O
            //P     R   R O   O     S P     E     C       T   O   O
            //P     R   R  OOO  SSSS  P     EEEEE  CCCC   T    OOO

            let prospectId: string = '';
            let clientId: string = '';
            let salesExecutiveId: string = '';
            let _prospect: any = {};
            try {
                _prospect = await axios.get(configuration.services.domain.prospects.getProspect, { params: query });
                prospectId = _prospect.data._id;
                clientId = _prospect.data.clientId;
                salesExecutiveId = _prospect.data.salesExecutiveId;
            } catch(error) {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Prospectos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Prospectos',
	                    message: 'Ocurrió un error al intentar obtener la información (PROSPECTO).',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            }
            
            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     L       I   E     NN  N   T   E
            //C     L       I   EEE   N N N   T   EEE
            //C     L       I   E     N  NN   T   E
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE}

            let _client: any = {};
            if(clientId && clientId != '') {
                try {
                    let params = {
                        id: clientId
                    };
                    let clientModel = new ClientModel();
                    _client = await clientModel.getClient(params);
                } catch(error) {
                    errors.push(error);
                }
            }
            
            //EEEEE JJJJJ EEEEE  CCCC U   U TTTTT IIIII V   V  OOO       DDDD  EEEEE      V   V EEEEE N   N TTTTT  AAA   SSSS
            //E       J   E     C     U   U   T     I   V   V O   O      D   D E          V   V E     NN  N   T   A   A S
            //EEE     J   EEE   C     U   U   T     I   V   V O   O      D   D EEE        V   V EEE   N N N   T   AAAAA  SSS
            //E     J J   E     C     U   U   T     I    V V  O   O      D   D E           V V  E     N  NN   T   A   A     S
            //EEEEE  J    EEEEE  CCCC  UUU    T   IIIII   V    OOO       DDDD  EEEEE        V   EEEEE N   N   T   A   A SSSS
            
            let _salesExecutive: any = {};
            if(salesExecutiveId && salesExecutiveId != '') {
                try {
                    let params = {
                        id: salesExecutiveId
                    };
                    let userModel = new UserModel();
                    _salesExecutive = await userModel.getUser(params);
                } catch(error) {
                    errors.push(error);
                }
            }
    
            // CCCC  OOO  TTTTT IIIII ZZZZZ  AAA   CCCC IIIII  OOO  N   N EEEEE  SSSS
            //C     O   O   T     I      Z  A   A C       I   O   O NN  N E     S
            //C     O   O   T     I     Z   AAAAA C       I   O   O N N N EEE    SSS
            //C     O   O   T     I    Z    A   A C       I   O   O N  NN E         S
            // CCCC  OOO    T   IIIII ZZZZZ A   A  CCCC IIIII  OOO  N   N EEEEE SSSS

            let _quotations: any = {};
            if(prospectId && prospectId != '') {
                try {
                    let params = {
                        parentId: prospectId,
                        parentType: 'prospect'
                    };
                    let quotationModel = new QuotationModel();
                    _quotations = await quotationModel.getQuotation(params);
                } catch(error) {
                    errors.push(error);
                }
            }
            
            // CCCC  OOO  N   N TTTTT RRRR   AAA  TTTTT  OOO   SSSS
            //C     O   O NN  N   T   R   R A   A   T   O   O S
            //C     O   O N N N   T   RRRR  AAAAA   T   O   O  SSS
            //C     O   O N  NN   T   R   R A   A   T   O   O     S
            // CCCC  OOO  N   N   T   R   R A   A   T    OOO  SSSS
            
            let _contracts: any = {};
            if(prospectId && prospectId != '') {
                try {
                    let params = {
                        parentId: prospectId,
                        parentType: 'prospect'
                    };
                    let contractModel = new ContractModel();
                    _contracts = await contractModel.getContract(params);
                } catch(error) {
                    errors.push(error);
                }
            }
            
            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
            
            let result: any = _prospect.data;
            result['client'] = _client || {};
            result['salesExecutive'] = _salesExecutive || {};
            result['quotations'] = _quotations || [];
            result['contracts'] = _contracts || [];
            if(errors.length > 0) {
                result['errors'] = errors;
            }
            return resolve(result);
        });
    }
    
    public getProspects(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // Parámetros.
            let { limit, page, ...filters } = query;
            let params: any = {
                limit,
                page
            };
            Object.keys(filters).forEach(key => params[key] = filters[key]);
            // Petición.
            axios.get(configuration.services.domain.prospects.getProspects, { params })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || []);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Prospectos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Prospectos',
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

    public postProspect(body: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
            //E     R   R R   R O   O R   R E     S
            //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
            //E     R   R R   R O   O R   R E         S
            //EEEEE R   R R   R  OOO  R   R EEEEE SSSS
    
            let errors: Array<any> = [];
            let { salesEvents: _salesEvents, businessData: _businessData, quotation, contract, ...prospect } = body;
            // PROSPECTO.
            let prospectErrors: any = await this.validateSchemas(_salesEvents, _businessData, prospect);
            errors = errors.concat(prospectErrors);
            // COTIZACIÓN.
            let quotationModel = new QuotationModel(quotation || {});
            let quotationErrors: any = await quotationModel.validate();
            errors = errors.concat(quotationErrors);
            // CONTRATO.
            let contractModel = new ContractModel(contract || {});
            let contractErrors: any = await contractModel.validate();
            errors = errors.concat(contractErrors);
            // Si ocurrió algún error se termina la función.
            if(errors.length > 0) {
                let response: any = {
                    module: 'Prospectos',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            }
            
            //PPPP  RRRR   OOO   SSSS PPPP  EEEEE  CCCC TTTTT  OOO
            //P   P R   R O   O S     P   P E     C       T   O   O
            //PPPP  RRRR  O   O  SSS  PPPP  EEE   C       T   O   O
            //P     R   R O   O     S P     E     C       T   O   O
            //P     R   R  OOO  SSSS  P     EEEEE  CCCC   T    OOO

            let prospectId: string;
            let _prospect: any = {};
            let data: any = prospect;
            data['salesEvents'] = _salesEvents;
            data['businessData'] = _businessData;
            try {
                _prospect = await axios.post(configuration.services.domain.prospects.postProspect, data);
                prospectId = _prospect.data._id;
            } catch(error) {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Prospectos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject(idx(error, _ => _.response.data) || {
                        status: 400,
                        module: 'Prospectos',
                        message: 'Ocurrió un error al intentar guardar la información (PROSPECTO).',
                        error
                    });
                }
            }
    
            // CCCC  OOO  TTTTT IIIII ZZZZZ  AAA   CCCC IIIII  OOO  N   N EEEEE  SSSS
            //C     O   O   T     I      Z  A   A C       I   O   O NN  N E     S
            //C     O   O   T     I     Z   AAAAA C       I   O   O N N N EEE    SSS
            //C     O   O   T     I    Z    A   A C       I   O   O N  NN E         S
            // CCCC  OOO    T   IIIII ZZZZZ A   A  CCCC IIIII  OOO  N   N EEEEE SSSS

            let _quotation: any = {};
            try {
                quotation['parentType'] = 'prospect';
                quotation['parentId'] = prospectId;
                _quotation = await quotationModel.postQuotation(quotation);
            } catch(error) {
                errors.push(error);
            }
    
            // CCCC  OOO  N   N TTTTT RRRR   AAA  TTTTT  OOO   SSSS
            //C     O   O NN  N   T   R   R A   A   T   O   O S
            //C     O   O N N N   T   RRRR  AAAAA   T   O   O  SSS
            //C     O   O N  NN   T   R   R A   A   T   O   O     S
            // CCCC  OOO  N   N   T   R   R A   A   T    OOO  SSSS
    
            let _contract: any = {};
            try {
                contract['parentType'] = 'prospect';
                contract['parentId'] = prospectId;
                _contract = await contractModel.postContract(contract);
            } catch(error) {
                errors.push(error);
            }
            
            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
    
            let result: any = _prospect.data;
            result['quotations'] = _quotation ? [_quotation] : [];
            result['contracts'] = _contract ? [_contract] : [];
            if(errors.length > 0) {
                result['errors'] = errors;
            }
            return resolve(result);
        });
    }

    //PPPP  U   U TTTTT
    //P   P U   U   T
    //PPPP  U   U   T
    //P     U   U   T
    //P      UUU    T

    public putProspect(body: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let { salesEvents: _salesEvents, businessData: _businessData, ...prospect } = body;
            let errors: any = await this.validateSchemas(_salesEvents, _businessData, prospect);
            if(errors.length > 0) {
                let response: any = {
                    module: 'Prospectos',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                let data: any = prospect;
                data['salesEvents'] = _salesEvents;
                data['businessData'] = _businessData;
                axios.put(configuration.services.domain.prospects.putProspect, data)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Prospectos',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Prospectos',
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

    public deleteProspect(query: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let errors: Array<any> = [];
            
            //PPPP  RRRR   OOO   SSSS PPPP  EEEEE  CCCC TTTTT  OOO
            //P   P R   R O   O S     P   P E     C       T   O   O
            //PPPP  RRRR  O   O  SSS  PPPP  EEE   C       T   O   O
            //P     R   R O   O     S P     E     C       T   O   O
            //P     R   R  OOO  SSSS  P     EEEEE  CCCC   T    OOO

            let prospectId: string = '';
            let _prospect: any = {};
            try {
                _prospect = await axios.get(configuration.services.domain.prospects.getProspect, { params: query });
                if(_prospect.data) {
                    prospectId = _prospect.data._id;
                    await axios.delete(configuration.services.domain.prospects.deleteProspect, { params: query });
                }
            } catch(error) {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Prospectos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Prospectos',
	                    message: 'Ocurrió un error al intentar borrar la información (PROSPECTO).',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            }
            
            // CCCC  OOO  TTTTT IIIII ZZZZZ  AAA   CCCC IIIII  OOO  N   N EEEEE  SSSS
            //C     O   O   T     I      Z  A   A C       I   O   O NN  N E     S
            //C     O   O   T     I     Z   AAAAA C       I   O   O N N N EEE    SSS
            //C     O   O   T     I    Z    A   A C       I   O   O N  NN E         S
            // CCCC  OOO    T   IIIII ZZZZZ A   A  CCCC IIIII  OOO  N   N EEEEE SSSS
            
            try {
                let params = {
                    parentType: 'prospect',
                    parentId: prospectId
                };
                let quotationModel = new QuotationModel();
                await quotationModel.deleteQuotation(params);
            } catch(error) {
                errors.push(error);
            }
            
            // CCCC  OOO  N   N TTTTT RRRR   AAA  TTTTT  OOO   SSSS
            //C     O   O NN  N   T   R   R A   A   T   O   O S
            //C     O   O N N N   T   RRRR  AAAAA   T   O   O  SSS
            //C     O   O N  NN   T   R   R A   A   T   O   O     S
            // CCCC  OOO  N   N   T   R   R A   A   T    OOO  SSSS
            
            try {
                let params = {
                    parentType: 'prospect',
                    parentId: prospectId
                };
                let contractModel = new ContractModel();
                await contractModel.deleteContract(params);
            } catch(error) {
                errors.push(error);
            }
            
            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
    
            let result: any = {
                _id: prospectId,
                message: 'Registro eliminado con éxito.'
            }
            if(errors.length > 0) {
                result['errors'] = errors;
            }
            return resolve(result);
        });
    }

}