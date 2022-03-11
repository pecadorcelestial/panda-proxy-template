import axios from 'axios';
import idx from 'idx';
import { validate, IsMongoId, IsBoolean, IsArray, IsDefined } from 'class-validator';
import configuration from '../../configuration';
import { RemodelErrors } from '../../scripts/data-management';
import { PaymentReference } from '../accounts';

export class AccountPaymentReference {
    // Identificador.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['PUT']
    })
    _id: string;
    // ¿Tomado? (No de borracho, si no de asignado).
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsBoolean({
        message: 'El tipo de dato es incorrecto.',
        groups: ['PUT', 'POST']
    })
    taken: boolean = false;
    // Referencias.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsArray({
        message: 'El tipo de dato es incorrecto.',
        groups: ['PUT', 'POST']
    })
    references: Array<PaymentReference>
}

export default class AccountPaymentReferenceModel {

    //Propiedades.
    private accountPaymentReference: AccountPaymentReference;

    //Constructor.
    constructor(accountPaymentReference: AccountPaymentReference = new AccountPaymentReference()) {
        this.accountPaymentReference = accountPaymentReference;
    }

    //Métodos.

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        return this.validateSchemas(this.accountPaymentReference);
    }

    private async validateSchemas(_accountPaymentReference: AccountPaymentReference = new AccountPaymentReference(), groups: Array<string> = ['POST']): Promise<any> {
        
        let errors: Array<any> = [];
        
        let accountPaymentReference = new AccountPaymentReference();
        accountPaymentReference.taken = _accountPaymentReference.taken;
        let accountPaymentReferenceErrors = await validate(accountPaymentReference, { groups, skipMissingProperties: true });
        errors = RemodelErrors(accountPaymentReferenceErrors, 'accountPaymentReference');
        if(Array.isArray(_accountPaymentReference.references) && _accountPaymentReference.references.length > 0) {
            let index: number = 0;
            for(const _reference of _accountPaymentReference.references) {
                let reference = new PaymentReference();
                reference.referenceName = _reference.referenceName;
                reference.reference = _reference.reference;
                let referenceErrors = await validate(reference, { groups, skipMissingProperties: true });
                errors = errors.concat(RemodelErrors(referenceErrors, `accountPaymentReference.reference[${index}]`));
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
    
    public getAccountPaymentReference(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.accounts.paymentReferences.getPaymentReference, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Referencias | Pagos | Cuentas',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Referencias | Pagos | Cuentas',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    } 

    public getAccountPaymentReferencees(query: any): Promise<any> {
        // Parámetros.
        let { limit, page, ...filters } = query;
        let params: any = {
            limit,
            page
        };
        Object.keys(filters).forEach(key => params[key] = filters[key]);
        // Petición.
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.accounts.paymentReferences.getPaymentReferences, { params })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || []);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Referencias | Pagos | Cuentas',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Referencias | Pagos | Cuentas',
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

    public postAccountPaymentReference(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let errors: Array<any> = [];
            this.validateSchemas(body)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Referencias | Pagos | Cuentas',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.post(configuration.services.domain.accounts.paymentReferences.postPaymentReference, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Referencias | Pagos | Cuentas',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Referencias | Pagos | Cuentas',
                            message: 'Ocurrió un error al intentar guardar la información (CUENTA - LENGUAGE).',
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

    public putAccountPaymentReference(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let errors: Array<any> = [];
            this.validateSchemas(body)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Referencias | Pagos | Cuentas',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.put(configuration.services.domain.accounts.paymentReferences.putPaymentReference, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Referencias | Pagos | Cuentas',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Referencias | Pagos | Cuentas',
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

    public deleteAccountPaymentReference(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.accounts.paymentReferences.deletePaymentReference, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Referencias | Pagos | Cuentas',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Referencias | Pagos | Cuentas',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }
}
