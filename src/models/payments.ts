// Módulos
import { Request, Response } from 'express';
import axios from 'axios';
import idx from 'idx';
import { IsString, MaxLength, validate, IsMongoId, IsDateString, IsNumber, IsEnum, Validator, IsArray, IsDefined } from 'class-validator';
// Modelos.
import AccountModel, { Account } from './accounts';
import AccountProcessesModel from './processes/accounts';
import BalanceModel, { IBalance, IPendingReceipt } from './processes/balance';
import { Client } from './clients';
import { EmailModel, EmailWithTemplate, FileStructure, Message, To } from './notifications';
import InvoiceModel, { Invoice } from './invoices';
import InvoiceModelV2, { Invoice as InvoiceV2, Payment as PaymentV2, RelatedCFDI } from './invoicesV2';
import ReceiptModel, { Receipt } from './receipts';
import InternalAccountModel, { InternalAccount } from './catalogs/internalAccounts';
// Funciones.
import { buildQuery } from '../scripts/parameters';
import { currencyFormat } from '../scripts/numbers';
import { date2StringFormat } from '../scripts/dates';
import { isEmpty } from '../scripts/object-prototypes';
import { RemodelErrors } from '../scripts/data-management';
// Configuración.
import configuration from '../configuration';
// Constantes.
import { CATALOGS, PAYMENT_FORMS } from '../constants/constants';

export class Payment {
    // Identificador.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    _id?: string;
    // Identificador del catálogo padre.
    // @IsDefined({
    //     message: 'El campo es requerido.',
    //     groups: ['POST']
    // })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    parentId: string;
    // Tipo de catálogo padre.
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
    parentType: string;
    // Fecha de pago.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsDateString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    paymentDate: string;
    // Fecha de aplicaclión del pago por parte del banco.
    // @IsDefined({
    //     message: 'El campo es requerido.',
    //     groups: ['POST']
    // })
    @IsDateString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    applicationDate?: string;
    // Cantidad.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    amountPaid: number;
    // Tipo (valor).
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
    // Estatus (valor).
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
    // Descripción.
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(500, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    description?: string;
    // Moneda.
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
    currencyValue: string;
    // Tipo de cambio.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    exchangeRate: number;
    // Número de cuenta interna.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    internalAccountNumber?: string;
    // Comisión.
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    comission?: number;
    // Factura.
    @IsArray({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    invoices?: Array<string>;
    // Número de referencia.
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    reference?: string;
    // Forma de pago:
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @IsEnum(PAYMENT_FORMS, {
        message: 'El valor no está dentro del catálogo permitido.',
        groups: ['POST', 'PUT']
    })
    paymentForm: string;
    // Detalle (recibos incluidos en el pago).
    details?: { receiptId: string, amount: number }[];
    cardDetails?: CardDetails;
}

export class CardDetails {
    // Titular de la tarjeta.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    cardHolder: string;
    // Últimos 4 dígitos.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(40, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    lastDigits: string;
    // Referencia del pago.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(20, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    reference: string;
    // Nombre / tipo de tarjeta.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(15, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    cardValue: string;
    // Origen del pago.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(20, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    origin: string;
    // Frecuencia del pago.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    frequency: string;
    // Número de identificación del cliente.
    @IsString({
        message: 'El tipo de dato es incorrecto.'
    })
    @MaxLength(20, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.'
    })
    idNumber: string;
}

// Información de transacción bancaria.
/*
{
   "Ds_Date":"30/09/2019",
   "Ds_Hour":"17:22",
   "Ds_Amount":"100",
   "Ds_Currency":"484",
   "Ds_Order":"2019tGgZIjIS",
   "Ds_MerchantCode":"4074912",
   "Ds_Terminal":"1",
   "Ds_Signature":"92113b87aecd55e399bc5c617e3eed4904a1cab4",
   "Ds_AuthorisationCode":"728347",
   "Ds_AuthenticationECI":"06",
   "Ds_Response":"000",
   "Ds_SecurePayment":"0",
   "Ds_TransactionType":"0",
   "Ds_ConsumerLanguage":"SP",
   "Ds_ErrorCode":"",
   "Ds_ErrorMessage":"Successful approval/completion",
   "Ds_MaskedPAN":"481516XXXXXX1561"
}
*/
interface IBankResponse {
    // client: string;
    Ds_Date: string;                // dd/mm/yyyy
    Ds_Hour: string;                // HH:mm
    Ds_Amount: number;
    Ds_Currency: number;
    Ds_Order: string;               // Número de pedido.
    Ds_MerchantCode: number;        // Identificación de comercio.
    Ds_Terminal: number;            // Terminal.
    Ds_Signature: string;           // Firma del comercio.
    Ds_AuthorisationCode: string;   // ???
    Ds_AuthenticationECI: string;   // ???
    Ds_MerchantData: string;        // Datos opcionales enviados.    
    Ds_Response: number;            // 000 - Aprobada; 001 - Rechazada;
    Ds_SecurePayment: number;       // 0 - El pago se realizó de forma tradicional; 1 - El pago se realizó en modalidad 3D Secure.
    Ds_TransactionType: string;     // Tipo de operación.
    Ds_ConsumerLanguage: number;    // Idioma.
    Ds_ErrorCode: string;           // Código de error (futura implementación).
    Ds_ErrorMessage: string;        // Descripción de error.
    Ds_MaskedPAN: string;
}
/*
interface IPendingReceipt extends Receipt {
    payments: Array<number>
}
*/
interface IInvoiceV1EX extends Invoice {
    files: {
        pdf: string;
        xml: string;
    }
}

export interface ICollectionReport {
    account: string;
    name: string;
    charge: string;
    payment: string;
    reference: string;
    concept: string;
}

export default class PaymentModel {
    
    //Propiedades.
    private _payment: Payment;

    // Constructor.
    constructor(payment?: Payment) {
        this._payment = payment || new Payment();
    }
    
    //Métodos.

    // GGGG EEEEE TTTTT      /   SSSS EEEEE TTTTT
    //G     E       T       /   S     E       T
    //G  GG EEE     T      /     SSS  EEE     T
    //G   G E       T     /         S E       T
    // GGGG EEEEE   T    /      SSSS  EEEEE   T
    
    get payment(): Payment {
        return this._payment;
    }

    set payment(value: Payment) {
        this._payment = value;
    }
    
    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        // let { cardDetails, ...payment }: { cardDetails: CardDetails } & Payment;
        // cardDetails = this._payment.cardDetails || new CardDetails();
        return this.validateSchemas(this._payment);
    }

    private async validateSchemas(_payment: any = {}/*, _cardDetails: any = {}*/, groups: Array<string> = ['POST']): Promise<any> {
        
        let errors: Array<any> = [];
        
        // Movimiento.
        let payment = new Payment();
        payment.parentId = _payment.parentId;
        payment.parentType = _payment.parentType;
        payment.paymentDate = _payment.paymentDate;
        payment.applicationDate = _payment.applicationDate;
        payment.amountPaid = _payment.amountPaid;
        payment.typeValue = _payment.typeValue;
        payment.statusValue = _payment.statusValue;
        payment.description = _payment.description;
        payment.currencyValue = _payment.currencyValue;
        payment.exchangeRate = _payment.exchangeRate;
        payment.internalAccountNumber = _payment.internalAccountNumber;
        payment.comission = _payment.comission;
        payment.reference = _payment.reference;
        // payment.cardDetail = _payment.cardDetail;
        payment.invoices = _payment.invoices;
        payment.paymentForm = _payment.paymentForm;
        let paymentErrors = await validate(payment, { groups, skipMissingProperties: true });
        errors = errors.concat(RemodelErrors(paymentErrors, 'payment'));
        // Detalles de la tarjeta.
        if(payment.cardDetails) {
            let cardDetails = new CardDetails();
            cardDetails.cardHolder = payment.cardDetails.cardHolder;
            cardDetails.lastDigits = payment.cardDetails.lastDigits;
            cardDetails.reference = payment.cardDetails.reference;
            let cardDetailsErrors = await validate(cardDetails, { skipMissingProperties: true });
            errors = errors.concat(RemodelErrors(cardDetailsErrors, 'payment.cardDetails'));
        }
        // Se devuelven los errores.
        return errors;
    }
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getPayment(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let { invoices } = query;
            if(typeof invoices === 'string' && invoices.match(/\[(\"[a-z0-9]+\"(\,\s?)?)+\]/g)) {
                invoices = JSON.parse(invoices);
                query.invoices = invoices;
            }
            axios.get(configuration.services.domain.finance.payments.getPayment, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Pagos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Pagos',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }
    
    public getPayments(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {            
            // Parámetros.
            let { limit, page, all, ...filters } = query;
            let params: any = {
                all,
                limit,
                page
            };
            Object.keys(filters).forEach(key => params[key] = filters[key]);
            // Petición.
            axios.get(configuration.services.domain.finance.payments.getPayments, { params })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || []);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Pagos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
                        status: 400,
                        module: 'Pagos',
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

    public postPayment(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { relatedCfdis, createInvoices, ...payment }: { relatedCfdis: Array<string>, createInvoices: boolean} & Payment = body;
            createInvoices = (typeof createInvoices === 'boolean') ? createInvoices : true;

            // CCCC U   U EEEEE N   N TTTTT  AAA        AAA   CCCC TTTTT IIIII V   V  AAA
            //C     U   U E     NN  N   T   A   A      A   A C       T     I   V   V A   A
            //C     U   U EEE   N N N   T   AAAAA      AAAAA C       T     I   V   V AAAAA
            //C     U   U E     N  NN   T   A   A      A   A C       T     I    V V  A   A
            // CCCC  UUU  EEEEE N   N   T   A   A      A   A  CCCC   T   IIIII   V   A   A

            // FIX: Se elimina la validación de cuenta activa o post-pago.
            // let accountModel = new AccountModel();
            // accountModel.isAccountActive(payment.parentId)
            // .then((result: boolean) => {

                //  °   EEEEE X   X IIIII  SSSS TTTTT EEEEE  ???         1
                //  ¿   E      X X    I   S       T   E     ?   ?       11
                // ¿¿   EEE     X     I    SSS    T   EEE     ??         1
                //¿   ¿ E      X X    I       S   T   E       ?          1
                // ¿¿¿  EEEEE X   X IIIII SSSS    T   EEEEE   °        11111

                if(typeof payment.description === 'string') {
                    // Se revisa la descripción.
                    let description: string = payment.description;
                    // a) Se eliminan los signos $
                    description = description.replace(/\$/g, '');
                    // b) Se reasigna el valor.
                    payment.description = description;
                }

                let getPayments: {results: Array<Payment>, summary: any} = { results: [], summary: {} };
                try {
                    let filters: any = {
                        reference: payment.reference,
                        amountPaid: payment.amountPaid,
                        paymentDate: {"start":payment.paymentDate,"end":payment.paymentDate},
                        typeValue: payment.typeValue,
                        description: payment.description
                    };
                    getPayments = await this.getPayments(filters);
                } catch(error) {
                    return reject(error);
                }

                // YA EXISTE.
                if(Array.isArray(getPayments.results) && getPayments.results.length >= 1) {
                    return reject({
                        status: 409,
                        module: 'Pagos',
                        message: 'El pago que intentas guardar ya existe.'
                    });
                }
                
                //  °   EEEEE X   X IIIII  SSSS TTTTT EEEEE  ???        222
                //  ¿   E      X X    I   S       T   E     ?   ?      2   2
                // ¿¿   EEE     X     I    SSS    T   EEE     ??         22
                //¿   ¿ E      X X    I       S   T   E       ?         2
                // ¿¿¿  EEEEE X   X IIIII SSSS    T   EEEEE   °        22222

                if(typeof payment.description === 'string') {
                    // Se revisa la descripción.
                    let description: string = payment.description;
                    // a) Se eliminan los espacios del principio y final.
                    description = description.trim();
                    // b) Se eliminan los signos $
                    description = description.replace(/\$/g, '');
                    // c) Se eliminan los espacios de más.
                    description = description.replace(/ +(?= )/g,'');
                    // d) Se trunca a 500 caracteres.
                    if(description.length > 500) {
                        description = description.substring(0,500);
                    }
                    // e) Se reasigna el valor.
                    payment.description = description;
                }

                getPayments = { results: [], summary: {} };
                try {
                    let filters: any = {
                        reference: payment.reference,
                        amountPaid: payment.amountPaid,
                        paymentDate: {"start":payment.paymentDate,"end":payment.paymentDate},
                        typeValue: payment.typeValue,
                        description: payment.description
                    };
                    getPayments = await this.getPayments(filters);
                } catch(error) {
                    return reject(error);
                }
                
                // YA EXISTE.
                if(Array.isArray(getPayments.results) && getPayments.results.length >= 1) {
                    return reject({
                        status: 409,
                        module: 'Pagos',
                        message: 'El pago que intentas guardar ya existe.'
                    });
                } else {
                    
                    //RRRR  EEEEE FFFFF EEEEE RRRR  EEEEE N   N  CCCC IIIII  AAA
                    //R   R E     F     E     R   R E     NN  N C       I   A   A
                    //RRRR  EEE   FFF   EEE   RRRR  EEE   N N N C       I   AAAAA
                    //R   R E     F     E     R   R E     N  NN C       I   A   A
                    //R   R EEEEE F     EEEEE R   R EEEEE N   N  CCCC IIIII A   A
                    
                    // Se busca la cuenta por referencia por cada pago.
                    let getAccounts: {results: Array<Account>, summary: any} = { results: [], summary: {} };
                    let accountModel: AccountModel = new AccountModel();
                    try {
                        getAccounts = await accountModel.getAccounts({ 'paymentReferences.reference': payment.reference });
                    } catch(error) {
                        return reject(error);
                    }
                    // Tiene referencia, y se encontró una sola cuenta.
                    if(Array.isArray(getAccounts.results) && getAccounts.results.length === 1) {
                        let accountNumber: string = getAccounts.results[0].accountNumber;
                        payment.parentId = accountNumber;
                        payment.parentType = 'account';
                    }

                    //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
                    //E     R   R R   R O   O R   R E     S
                    //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
                    //E     R   R R   R O   O R   R E         S
                    //EEEEE R   R R   R  OOO  R   R EEEEE SSSS
    
                    let errors: Array<any> = [];
                    // Al insertar un pago el estatus es sólo 'pagado'.
                    // NOTE: El comentario de arriba es mentira y no la creo, es mentira y no la creo...
                    if(typeof payment.statusValue != 'string' || ['credit', 'batch'].indexOf(payment.statusValue) < 0) {
                        payment.statusValue = 'paid';
                    }
                    // Análisis y transformación de datos.
                    try {
                        if(typeof payment.amountPaid === 'string') {
                            payment.amountPaid = parseFloat(payment.amountPaid as string);
                        }
                        if(typeof payment.exchangeRate === 'string') {
                            payment.exchangeRate = parseFloat(payment.exchangeRate as string);
                        }
                        payment.comission = (typeof payment.comission === 'string' || typeof payment.comission === 'number') ? parseFloat(payment.comission.toString()) : 0.00;
                    } catch(error) {}
                    // Información del pago y detalles de la tarjeta.
                    await this.validateSchemas(payment)
                    .then( async (data: any) => {
                        if(Array.isArray(data) && data.length > 0) {
                            for(const error of data) {
                                errors.push(error);
                            }
                        }
                    });
                    // Se revisa si se encontró algún error.
                    if(errors.length > 0) {
                        let response: any = {
                            status: 400,
                            module: 'Pagos',
                            message: 'La información no es válida.',
                            errors
                        };
                        return reject(response);
                    } else {
    
                        //PPPP   AAA   GGGG  OOO
                        //P   P A   A G     O   O 
                        //PPPP  AAAAA G  GG O   O
                        //P     A   A G   G O   O
                        //P     A   A  GGGG  OOO
                        
                        // @ts-ignore
                        // payment.cardDetails = cardDetails;
                        axios.post(configuration.services.domain.finance.payments.postPayment, payment)
                        .then( async (response: any) => {
    
                            // AAA   SSSS IIIII  GGGG N   N  AAA   CCCC IIIII  OOO  N   N
                            //A   A S       I   G     NN  N A   A C       I   O   O NN  N
                            //AAAAA  SSS    I   G  GG N N N AAAAA C       I   O   O N N N
                            //A   A     S   I   G   G N  NN A   A C       I   O   O N  NN
                            //A   A SSSS  IIIII  GGGG N   N A   A  CCCC IIIII  OOO  N   N
                            
                            let paymentAssignment: any = {};
                            try {
                                // v1.
                                // let body: any = idx(response, _ => _.data) || payment;
                                // body['balance'] = balance;
                                // body['relatedCfdis'] = relatedCfdis;
                                // body['reference'] = payment.reference;
                                // body['accountNumber'] = payment.parentId;
                                // _paymentAssignment = await this.postPaymentAssignment(body);
                                // v2.
                                paymentAssignment = await this.postPaymentAssignmentV2({ _id: idx(response, _ => _.data._id), relatedCfdis, createInvoices });
                            } catch(error) {
                                return resolve({
                                    status: 206,
                                    message: 'No se pudo asignar el pago a ninguna cuenta.',
                                    data: response.data,
                                    error
                                });
                            }

                            //EEEEE M   M  AAA  IIIII L
                            //E     MM MM A   A   I   L
                            //EEE   M M M AAAAA   I   L
                            //E     M   M A   A   I   L
                            //EEEEE M   M A   A IIIII LLLLL

                            // WARNING: Sólo aplica para pagos a cuentas inactivas ¯\_ʕ•ᴥ•ʔ_/¯.
                            if(Array.isArray(getAccounts.results) && getAccounts.results.length === 1) {
                                let accountNumber: string = getAccounts.results[0].accountNumber;
                                let accountModel = new AccountModel();
                                let isActive: boolean = true;
                                // 1. Se revisa si la cuenta está activa.
                                try {
                                    isActive = await accountModel.isAccountActive(accountNumber);
                                } catch(error) {}
                                // 2. Si no lo está, se debe envíar un correo a 'Domain Administración' avisando del mismo.
                                if(!isActive) {
                                    
                                    //M   M EEEEE N   N  SSSS  AAA  JJJJJ EEEEE
                                    //MM MM E     NN  N S     A   A   J   E
                                    //M M M EEE   N N N  SSS  AAAAA   J   EEE
                                    //M   M E     N  NN     S A   A J J   E
                                    //M   M EEEEE N   N SSSS  A   A  J    EEEEE
                                    
                                    let emailModel: EmailModel = new EmailModel();
                                    let emailTo: Array<To> = [];
                                    let environment: string = (process.env.NODE_ENV || 'development').trim().toLowerCase();
                                    emailTo.push({
                                        email: environment === 'production' ? 'admin@domain.com' : 'frodriguez@domain.com',
                                        name: 'Domain Administración',
                                        type: 'to'
                                    });
                                    let message: Message = {
                                        html: `<h1>Example HTML content.</h1>`,
                                        subject: `Pago de cuenta inactiva: ${accountNumber}`,
                                        to: emailTo
                                    };
                                    // if(Array.isArray(attachments) && attachments.length > 0) message.attachments = attachments;
                                    let email: EmailWithTemplate = {
                                        async: true,
                                        message,
                                        template_name: 'olimpo_notification',
                                        template_content: [{
                                            name: 'message',
                                            content: `El cliente ha realizado un pago a una cuenta inactiva.<br/><br/>
                                            Cuenta: <b>${accountNumber}</b><br/>
                                            Cantidad: <b>$${currencyFormat.format(payment.amountPaid)}</b>`
                                        }]
                                    };
                                    try {
                                        await emailModel.postEmail(email);
                                    } catch(error) {}
                                }
                            }
                            
                            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
                            //R   R E     S     U   U L       T   A   A D   D O   O
                            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
                            //R   R E         S U   U L       T   A   A D   D O   O
                            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
                            
                            let result: any = Object.assign({}, paymentAssignment.data || idx(response, _ => _.data));
                            return resolve({
                                status: paymentAssignment.status,
                                data: result
                            });
                        })
                        .catch((error: any) => {
                            if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                                return reject({
                                    status: 400,
                                    module: 'Pagos',
                                    message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                                });
                            } else {
                                return reject({
                                    status: 400,
                                    module: 'Pagos',
                                    message: 'Ocurrió un error al intentar guardar la información del pago.',
                                    error: idx(error, _ => _.response.data) || error
                                });
                            }
                        });
                    }
                }
            // })
            // .catch((error: any) => {
            //     return reject({
            //         status: 400,
            //         error
            //     });
            // });
            
        });
    }

    public postPayments(body: any, file: Express.Multer.File): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { isTest, payments, createInvoices, ...rest } = body;
            isTest = isTest ? JSON.parse(isTest) : false;
            createInvoices = createInvoices ? JSON.parse(createInvoices) : true;

            //JJJJJ  SSSS  OOO  N   N
            //  J   S     O   O NN  N
            //  J    SSS  O   O N N N
            //J J       S O   O N  NN
            // J    SSSS   OOO  N   N

            let items: Array<Payment> = [];
            if(file) {
                try {
                    items = JSON.parse(file.buffer.toString('utf8'));
                } catch(error) {
                    return reject({
                        status: 400,
                        module: 'Pagos',
                        message: 'No se pudo leer la información del archivo.',
                        error
                    });
                }
            } else {
                if(Array.isArray(payments) && payments.length > 0) {
                    items = payments;
                } else {
                    return reject({
                        status: 404,
                        module: 'Pagos',
                        message: 'No se encontró un archivo ni una lista de pagos en la petición.'
                    });
                }
            }
            
            //RRRR  EEEEE V   V IIIII  SSSS IIIII  OOO  N   N
            //R   R E     V   V   I   S       I   O   O NN  N
            //RRRR  EEE   V   V   I    SSS    I   O   O N N N
            //R   R E      V V    I       S   I   O   O N  NN
            //R   R EEEEE   V   IIIII SSSS  IIIII  OOO  N   N
            
            let goodRecords: Array<Payment> = [];
            let badRecords: Array<any> = [];
            let existingPayments: Array<Payment> = [];
            let errors: Array<any> = [];
            let accountModel: AccountModel = new AccountModel();
            let assignedPayments: number = 0;
            let unassignablePayments: Array<Payment> = [];
            let assignedPaymentsErrors: number = 0;
            for(const payment of items) {

                // Se modifica el tipo de pago.
                payment.typeValue = 'batch';

                //  °   EEEEE X   X IIIII  SSSS TTTTT EEEEE  ???
                //  ¿   E      X X    I   S       T   E     ?   ?
                // ¿¿   EEE     X     I    SSS    T   EEE     ??
                //¿   ¿ E      X X    I       S   T   E       ?
                // ¿¿¿  EEEEE X   X IIIII SSSS    T   EEEEE   °

                let getPayments: {results: Array<Payment>, summary: any} = { results: [], summary: {} };
                try {
                    let filters = {
                        reference: payment.reference,
                        amountPaid: payment.amountPaid,
                        paymentDate: {"start":payment.paymentDate,"end":payment.paymentDate},
                        typeValue: payment.typeValue,
                        description: payment.description
                    };
                    getPayments = await this.getPayments(filters);
                } catch(error) {
                    errors.push(error);
                }
                // YA EXISTE.
                if(Array.isArray(getPayments.results) && getPayments.results.length >= 1) {
                    existingPayments.push(payment);
                    // Si el pago ya existe, se mueve al siguiente pago.
                    continue;
                } else {

                    //RRRR  EEEEE FFFFF EEEEE RRRR  EEEEE N   N  CCCC IIIII  AAA
                    //R   R E     F     E     R   R E     NN  N C       I   A   A
                    //RRRR  EEE   FFF   EEE   RRRR  EEE   N N N C       I   AAAAA
                    //R   R E     F     E     R   R E     N  NN C       I   A   A
                    //R   R EEEEE F     EEEEE R   R EEEEE N   N  CCCC IIIII A   A
                    
                    // Se busca la cuenta por referencia por cada pago.
                    let getAccounts: {results: Array<Account>, summary: any} = { results: [], summary: {} };
                    try {
                        getAccounts = await accountModel.getAccounts({ 'paymentReferences.reference': payment.reference });
                    } catch(error) {
                        errors.push(error);
                    }
                    // Tiene referencia, y se encontró una sola cuenta.
                    if(Array.isArray(getAccounts.results) && getAccounts.results.length === 1) {
    
                        //PPPP   OOO   SSSS TTTTT
                        //P   P O   O S       T
                        //PPPP  O   O  SSS    T
                        //P     O   O     S   T
                        //P      OOO  SSSS    T
    
                        let accountNumber: string = getAccounts.results[0].accountNumber;
                        payment.parentId = accountNumber;
                        payment.parentType = 'account';
                        // @ts-ignore
                        payment.createInvoices = createInvoices;
                        try {
                            await this.postPayment(payment);
                            goodRecords.push(payment);
                            assignedPayments++;
                        } catch(error) {
                            errors.push(error);
                            badRecords.push(payment);
                            assignedPaymentsErrors++;
                        } finally {
                            continue;
                        }
                    } else {
                        // Se agrega 1 vez al arreglo de pagos no asignables.
                        unassignablePayments.push(payment);
                        continue;
                    }                    
                }
            }
            
            //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
            //E     R   R R   R O   O R   R E     S
            //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
            //E     R   R R   R O   O R   R E         S
            //EEEEE R   R R   R  OOO  R   R EEEEE SSSS
            
            let postablePayments: Array<Payment> = [];
            if(unassignablePayments.length > 0) {
                let _index: number = 0;
                for(const unassignablePayment of unassignablePayments) {
                    
                    // CCCC U   U EEEEE N   N TTTTT  AAA
                    //C     U   U E     NN  N   T   A   A
                    //C     U   U EEE   N N N   T   AAAAA
                    //C     U   U E     N  NN   T   A   A
                    // CCCC  UUU  EEEEE N   N   T   A   A

                    /*
                    // NOTE: Se comenta esta parte ya que no debe exister este identificador.
                    if(unassignablePayment.parentType === 'account') {
                        if((typeof unassignablePayment.parentId === 'string' && unassignablePayment.parentId.match(/^[0-9]+$/g) !== null) || typeof unassignablePayment.parentId === 'number') {
                            // La cuenta para el movimiento es de tipo LEGACY y se debe obtener el número nuevo.
                            try {
                                let accountModel: AccountModel = new AccountModel();
                                let _account: Account = await accountModel.getAccount({ legacyId: unassignablePayment.parentId });
                                unassignablePayment.parentId = _account.accountNumber;
                            } catch(error) {
                                badRecords.push({
                                    parentId: unassignablePayment.parentId,
                                    errors: error
                                });
                                continue;
                            }
                        }
                    }
                    */

                    // Análisis y transformación de datos.
                    try {
                        unassignablePayment.parentId = unassignablePayment.parentId.toString();
                        unassignablePayment.parentType = unassignablePayment.parentType.toString();
                    } catch(error) {}
                    let paymentErrors: any = await this.validateSchemas(unassignablePayment, ['PUT']);
                    // Se revisa si el cliente se puede insertar o no.
                    if(paymentErrors.length > 0) {
                        badRecords.push({
                            parentId: unassignablePayment.parentId,
                            errors: paymentErrors
                        });
                        // Se elimina el registro de los elementos que no se pudieron asignar (para no guardarlo).
                        // NOTE: Esto se evita por algún posible conflicto ¯\_(ツ)_/¯
                        // unassignablePayments.splice(_index, 1);
                        // WARNING:
                    } else {
                        postablePayments.push(unassignablePayment);
                    }
                    _index++;
                }
            }
            
            //RRRR  EEEEE  SSSS TTTTT
            //R   R E     S       T
            //RRRR  EEE    SSS    T
            //R   R E         S   T
            //R   R EEEEE SSSS    T            

            // Si existen pagos sin asignación, se cargan "planos".
            if(postablePayments.length > 0) {
                axios.post(configuration.services.domain.finance.payments.postPayments, postablePayments)
                .then( async (response: any) => {
                    // Mensaje.
                    let emailTo: Array<To> = [];
                    // emailTo.push({
                    //     email: 'cota@domain.com',
                    //     name: 'Jesús Cota',
                    //     type: 'to'
                    // });
                    emailTo.push({
                        email: 'frodriguez@domain.com',
                        name: 'Francisco "Panda" Rodríguez',
                        type: 'to'
                    });
                    let message: Message = {
                        html: `<h1>Example HTML content.</h1>`,
                        subject: `Carga masiva de pagos - La carga terminó.`,
                        to: emailTo
                    };
                    let email: EmailWithTemplate = {
                        async: true,
                        message,
                        template_name: 'client_notification_new',
                        template_content: [{
                            name: 'message',
                            content: `Información guardada con éxito.<br/>
                                      Pagos sin asignar: ${postablePayments.length}<br/>
                                      Pagos asignados: ${assignedPayments}<br/>
                                      Repetidos: ${existingPayments.length}<br/>
                                      Errores: ${badRecords.length} - ${JSON.stringify(errors)}`
                        }]
                    };
                    try {
                        let emailModel: EmailModel = new EmailModel();
                        await emailModel.postEmail(email);
                    } catch(error) {}
                    // Resultado.
                    return resolve({
                        status: errors.length === 0 ? 200 : 206,
                        message: `Información guardada con éxito.\n
                                  Pagos sin asignar: ${postablePayments.length}.\n
                                  Pagos asignados: ${assignedPayments}\n
                                  Repetidos: ${existingPayments.length}\n
                                  Errores: ${badRecords.length}.`,
                        data: idx(response, _ => _.data) || {},
                        good: {
                            total: goodRecords.length
                        },
                        bad: {
                            total: badRecords.length,
                            records: badRecords
                        },
                        errors
                    });
                })
                .catch( async (error: any) => {
                    badRecords = badRecords.concat(postablePayments);
                    errors.push(error);
                    // Mensaje.
                    let emailTo: Array<To> = [];
                    // emailTo.push({
                    //     email: 'cota@domain.com',
                    //     name: 'Jesús Cota',
                    //     type: 'to'
                    // });
                    emailTo.push({
                        email: 'frodriguez@domain.com',
                        name: 'Francisco "Panda" Rodríguez',
                        type: 'to'
                    });
                    let message: Message = {
                        html: `<h1>Example HTML content.</h1>`,
                        subject: `Carga masiva de pagos - La carga terminó.`,
                        to: emailTo
                    };
                    let email: EmailWithTemplate = {
                        async: true,
                        message,
                        template_name: 'client_notification_new',
                        template_content: [{
                            name: 'message',
                            content: `Información guardada con éxito.<br/>
                                      Pagos sin asignar: ${postablePayments.length}<br/>
                                      Pagos asignados: ${assignedPayments}<br/>
                                      Repetidos: ${existingPayments.length}<br/>
                                      Errores: ${badRecords.length} - ${JSON.stringify(errors)}`
                        }]
                    };
                    try {
                        let emailModel: EmailModel = new EmailModel();
                        await emailModel.postEmail(email);
                    } catch(error) {}
                    // Resultado.
                    return resolve({
                        status: 206,
                        message: `Información guardada con éxito.\n
                                  Pagos sin asignar: ${postablePayments.length}.\n
                                  Pagos asignados: ${assignedPayments}\n
                                  Repetidos: ${existingPayments.length}\n
                                  Errores: ${badRecords.length}.`,
                        good: {
                            total: goodRecords.length
                        },
                        bad: {
                            total: badRecords.length,
                            records: badRecords
                        },
                        errors
                    });
                });
            } else {
                // Mensaje.
                let emailTo: Array<To> = [];
                // emailTo.push({
                //     email: 'cota@domain.com',
                //     name: 'Jesús Cota',
                //     type: 'to'
                // });
                emailTo.push({
                    email: 'frodriguez@domain.com',
                    name: 'Francisco "Panda" Rodríguez',
                    type: 'to'
                });
                let message: Message = {
                    html: `<h1>Example HTML content.</h1>`,
                    subject: `Carga masiva de pagos - La carga terminó.`,
                    to: emailTo
                };
                let email: EmailWithTemplate = {
                    async: true,
                    message,
                    template_name: 'client_notification_new',
                    template_content: [{
                        name: 'message',
                        content: `Información guardada con éxito.<br/>
                                  Pagos sin asignar: ${postablePayments.length}<br/>
                                  Pagos asignados: ${assignedPayments}<br/>
                                  Repetidos: ${existingPayments.length}<br/>
                                  Errores: ${badRecords.length} - ${JSON.stringify(errors)}`
                    }]
                };
                try {
                    let emailModel: EmailModel = new EmailModel();
                    await emailModel.postEmail(email);
                } catch(error) {}
                // Resultado.
                return resolve({
                    status: errors.length === 0 ? 200 : 206,
                    message: `Información guardada con éxito.\n
                              Pagos sin asignar: ${postablePayments.length}.\n
                              Pagos asignados: ${assignedPayments}\n
                              Repetidos: ${existingPayments.length}\n
                              Errores: ${badRecords.length}.`,
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

    public postPaymentWebhook(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let { accountNumber, ...bankResponse }: { accountNumber: string } & IBankResponse = body;

            try {
                // Se revisa si el movimiento es exitoso.
                if (bankResponse.Ds_Response > 0) {
                    // TODO: Enviar un correo de notificación de pago erroneo.
                    return resolve({
                        status: 200,
                        message: 'Ok.'
                    });
                }

                // Número de cuenta interna para los pagos en línea.
                let onlineAccount: InternalAccount = new InternalAccount();
                let internalAccountModel: InternalAccountModel = new InternalAccountModel();
                try {
                    onlineAccount = await internalAccountModel.getInternalAccount({ value: 'online' });
                } catch (error) {}

                //DDDD   AAA  TTTTT  OOO   SSSS
                //D   D A   A   T   O   O S
                //D   D AAAAA   T   O   O  SSS
                //D   D A   A   T   O   O     S
                //DDDD  A   A   T    OOO  SSSS
    
                // Se debe transformar la fecha de 'dd/mm/yyyy' a 'mm/dd/yyyy'.
                let dateParts: Array<string> = bankResponse.Ds_Date.split('/');
                let applicationDate: Date = new Date();
                try {
                    applicationDate = new Date(`${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`);
                } catch(error) {}
                // let amountPaid: number = (typeof bankResponse.Ds_Amount === 'string' && !isNaN(bankResponse.Ds_Amount) && bankResponse.Ds_Amount > 0) ? (bankResponse.Ds_Amount / 100) : 0;
                let amountPaid: number = parseFloat((bankResponse.Ds_Amount || 0).toString());
                // NOTE: El API del banco manda los enteros con 2 decimales más pero sin el punto que los separa.
                //         P. ej.: $1 === 100
                //         ¿Por qué? R = Por que pues #$%&@ tu madre.
                //                  R2 = La vida, no es justa...
                amountPaid = amountPaid / 100;
                // Se crea el objeto de pago.
                let payment: Payment = {
                    parentId: accountNumber,
                    parentType: 'account',
                    paymentDate: date2StringFormat(applicationDate),
                    applicationDate: date2StringFormat(applicationDate),
                    amountPaid: parseFloat(amountPaid.toFixed(2)),
                    typeValue: 'online',                // NOTE: Revisar si se puede obtener de algún lado.
                    statusValue: 'paid',                // NOTE: Se debe actualizar al asignar el pago.
                    description: 'Pago servicio de telecomunicaciones.', // bankResponse.Ds_MerchantData || '',
                    currencyValue: 'MXN',
                    exchangeRate: 1,
                    internalAccountNumber: onlineAccount._id,
                    // comission: '',
                    // cardDetails: '',
                    // invoices: '',
                    reference: bankResponse.Ds_Order,
                    // details: '',
                    paymentForm: '04',
                };
    
                //PPPP   AAA   GGGG  OOO
                //P   P A   A G     O   O
                //PPPP  AAAAA G  GG O   O
                //P     A   A G   G O   O
                //P     A   A  GGGG  OOO
    
                // Se intenta guardar el pago.
                try {
                    await this.postPayment(payment);
                } catch(error) {
    
                    //EEEEE M   M  AAA  IIIII L
                    //E     MM MM A   A   I   L
                    //EEE   M M M AAAAA   I   L
                    //E     M   M A   A   I   L
                    //EEEEE M   M A   A IIIII LLLLL
    
                    // Mensaje.
                    let emailTo: Array<To> = [];
                    // emailTo.push({
                    //     email: 'cota@domain.com',
                    //     name: 'Jesús Cota',
                    //     type: 'to'
                    // });
                    emailTo.push({
                        email: 'dev@domain.com',
                        name: 'El mejor departamento',
                        type: 'to'
                    });
                    let message: Message = {
                        html: `<h1>Example HTML content.</h1>`,
                        subject: `[ERROR] Al intentar guardar el pago enviado desde el banco.`,
                        to: emailTo
                    };
                    let email: EmailWithTemplate = {
                        async: true,
                        message,
                        template_name: 'client_notification_new',
                        template_content: [{
                            name: 'message',
                            content: `Ocurrió un error al intentar guardar el pago enviado por el banco.<br/><br/>
                                    <h2>Datos:</h2><br/>${JSON.stringify(bankResponse)}<br/><br/>
                                    <h2>Error:</h2><br/>${JSON.stringify(error)}`
                        }]
                    };
                    try {
                        let emailModel: EmailModel = new EmailModel();
                        await emailModel.postEmail(email);
                    } catch(error) {}
                }
            } catch(error) {
                console.log(error);
            } finally {
                // Se regresa siempre una respuesta exitosa.
                return resolve({
                    status: 200,
                    message: 'Ok.'
                });
            }
        });
    }

    //PPPP  U   U TTTTT
    //P   P U   U   T
    //PPPP  U   U   T
    //P     U   U   T
    //P      UUU    T

    public putPayment(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let errors: Array<any> = [];
            let { pleaseReference, ...payment }: {pleaseReference: boolean } & Payment = body;
            pleaseReference = pleaseReference ? pleaseReference : false;
            this.validateSchemas(payment, ['PUT'])
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Pagos',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.put(configuration.services.domain.finance.payments.putPayment, payment)
                .then( async (response: any) => {
                    // Se revisa si se solicita enviar el correo con las referencias.
                    if(pleaseReference) {
                        let accountProcessesModel: AccountProcessesModel = new AccountProcessesModel();
                        try {
                            await accountProcessesModel.sendPleaseReference({ accountNumber: payment.parentId });
                        } catch(error) {}
                    }
                    // Resultado.
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Pagos',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Pagos',
                            message: 'Ocurrió un error al intentar actualizar la información.',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            }
        });
    }

    public putUnassignPayment(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let { _id, ...rest } = body;

            //PPPP   AAA   GGGG  OOO
            //P   P A   A G     O   O
            //PPPP  AAAAA G  GG O   O
            //P     A   A G   G O   O
            //P     A   A  GGGG  OOO

            let payment: Payment = new Payment();
            try {
                payment = await this.getPayment({ _id });
            } catch(error) {
                return reject(error);
            }

            // Se revisa si existen facturas dentro del pago.
            if(Array.isArray(payment.invoices) && payment.invoices.length > 0) {
                return reject({
                    status: 400,
                    module: 'Pagos',
                    message: 'El pago aún cuenta con facturas asignadas.'
                })
            } else {
                
                // AAA   CCCC TTTTT U   U  AAA  L     IIIII ZZZZZ  AAA   CCCC IIIII  OOO  N   N
                //A   A C       T   U   U A   A L       I      Z  A   A C       I   O   O NN  N
                //AAAAA C       T   U   U AAAAA L       I     Z   AAAAA C       I   O   O N N N
                //A   A C       T   U   U A   A L       I    Z    A   A C       I   O   O N  NN
                //A   A  CCCC   T    UUU  A   A LLLLL IIIII ZZZZZ A   A  CCCC IIIII  OOO  N   N

                //RRRR  EEEEE  CCCC IIIII BBBB   OOO   SSSS
                //R   R E     C       I   B   B O   O S
                //RRRR  EEE   C       I   BBBB  O   O  SSS
                //R   R E     C       I   B   B O   O     S
                //R   R EEEEE  CCCC IIIII BBBB   OOO  SSSS

                let errors: Array<any> = [];
                if(Array.isArray(payment.details) && payment.details.length > 0) {
                    for(const detail of payment.details) {
                        // a) Se obtiene el recibo.
                        let receipt: Receipt = new Receipt();
                        let receiptModel: ReceiptModel = new ReceiptModel();
                        try {
                            receipt = await receiptModel.getReceipt({ _id: detail.receiptId });
                        } catch(error) {
                            errors.push(error);
                        }
                        // b) Se actualiza solamente si el estatus es "paid".
                        if(receipt.statusValue === 'paid') {
                            try {
                                await receiptModel.putReceipt({ _id: detail.receiptId, statusValue: 'pending' });
                            } catch(error) {
                                errors.push(error);
                            }
                        }
                    }
                }

                //PPPP   AAA   GGGG  OOO
                //P   P A   A G     O   O
                //PPPP  AAAAA G  GG O   O
                //P     A   A G   G O   O
                //P     A   A  GGGG  OOO

                let data: any = {
                    _id,
                    parentId: '',
                    statusValue: 'unassigned',
                    details: []
                };
                try {
                    let updatedPayment: Payment = await this.putPayment(data);
                    let result: any = Object.assign(updatedPayment, {});
                    result.errors = errors;
                    return resolve(result);
                } catch(error) {
                    return reject(error);
                }
            }
        });
    }

    //DDDD  EEEEE L     EEEEE TTTTT EEEEE
    //D   D E     L     E       T   E
    //D   D EEE   L     EEE     T   EEE
    //D   D E     L     E       T   E
    //DDDD  EEEEE LLLLL EEEEE   T   EEEEE

    public deletePayment(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.finance.payments.deletePayment, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Pagos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Pagos',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    //PPPP  RRRR   OOO   CCCC EEEEE  SSSS  OOO   SSSS
    //P   P R   R O   O C     E     S     O   O S
    //PPPP  RRRR  O   O C     EEE    SSS  O   O  SSS
    //P     R   R O   O C     E         S O   O     S
    //P     R   R  OOO   CCCC EEEEE SSSS   OOO  SSSS

    public postPaymentAssignment = (body: any): Promise<any> => {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let { _id, id, relatedCfdis, createInvoices, ...rest } = body;
            _id = _id ? _id : id;
            createInvoices = createInvoices ? JSON.parse(createInvoices) : true;
            if(typeof _id === 'string' && _id.length > 0) {

                //PPPP   AAA   GGGG  OOO
                //P   P A   A G     O   O
                //PPPP  AAAAA G  GG O   O
                //P     A   A G   G O   O
                //P     A   A  GGGG  OOO
                
                let payment: Payment;
                try {
                    payment = await this.getPayment({ _id });
                } catch(error) {
                    return reject(error);
                }

                // Se revisa que exista un identificador padre (que ya esté asignado a una cuenta).
                if(typeof payment.parentId != 'string' || payment.parentId.length === 0) {
                    return reject({
                        status: 400,
                        module: 'Pagos',
                        message: 'El pago no está asignado a ninguna cuenta.',
                    });
                }

                // Se revisa que el pago no esté cancelado.
                if(typeof payment.statusValue === 'string' && payment.statusValue === 'cancelled') {
                    return reject({
                        status: 400,
                        module: 'Pagos',
                        message: 'El pago está cancelado.',
                    });
                }
                
                // CCCC U   U EEEEE N   N TTTTT  AAA        AAA   CCCC TTTTT IIIII V   V  AAA
                //C     U   U E     NN  N   T   A   A      A   A C       T     I   V   V A   A
                //C     U   U EEE   N N N   T   AAAAA      AAAAA C       T     I   V   V AAAAA
                //C     U   U E     N  NN   T   A   A      A   A C       T     I    V V  A   A
                // CCCC  UUU  EEEEE N   N   T   A   A      A   A  CCCC   T   IIIII   V   A   A
                
                let accountModel = new AccountModel();
                // @ts-ignore
                accountModel.isAccountActive(payment.parentId)
                .then( async (result: boolean) => {

                    // SSSS  AAA  L     DDDD   OOO        AAA   SSSS IIIII  GGGG N   N  AAA  DDDD   OOO
                    //S     A   A L     D   D O   O      A   A S       I   G     NN  N A   A D   D O   O
                    // SSS  AAAAA L     D   D O   O      AAAAA  SSS    I   G  GG N N N AAAAA D   D O   O
                    //    S A   A L     D   D O   O      A   A     S   I   G   G N  NN A   A D   D O   O
                    //SSSS  A   A LLLLL DDDD   OOO       A   A SSSS  IIIII  GGGG N   N A   A DDDD   OOO

                    // NOTE: Si el tipo de pago es diferente a PAID, quiere decir que algo se facturó, el monto asignado
                    //       se obtiene de las facturas timbradas.
                    //       Pero si es PAID, es decir es nuevo, el monto asignado se toma del detalle.
                    // Se revisa si existe ya una factura o recibos asignados al pago.
                    let isItFullyAssigned: boolean = true;
                    // Cantidad total asignada.
                    let assignedAmount: number = 0;
                    // Cantidad asignada por facturación.
                    let billedAmount: number = 0;
                    if(payment.invoices && payment.invoices.length > 0) {
                        // @ts-ignore
                        for(const invoice of payment.invoices as Invoice[]) {
                        let invoiceJSON: any = JSON.parse(invoice.json);
                        let invoiceTotal: number = parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Total']) || '0').toString());
                        // Se revisa si el total no está en el complemento.
                        if(invoiceTotal === 0) {
                            let payments: any = idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['pago10:Pagos']);
                            if(Array.isArray(payments) && payments.length > 0) {
                                for(const payment of payments) {
                                    invoiceTotal += parseFloat(payment['pago10:Pago']['_attributes']['Monto'] || 0);                        
                                }
                            } else if(payments && payments.hasOwnProperty('_attributes')) {
                                invoiceTotal = parseFloat(payments['pago10:Pago']['_attributes']['Monto'] || 0);
                            }
                        }
                        // Se suma el total al total asignado.
                        billedAmount += invoiceTotal;
                        }
                        billedAmount = parseFloat(billedAmount.toFixed(2));
                    }
                    // Cantidad asignada por detalles.
                    let detailsAmount: number = 0;
                    if(payment.details && payment.details.length > 0) {
                        for(const detail of payment.details) {
                            detailsAmount += detail.amount;
                        }
                        detailsAmount = parseFloat(detailsAmount.toFixed(2));
                    }
                    // NOTE: Se revisa cuál monto es mayor y ese se toma como asignado.
                    assignedAmount = (billedAmount >= detailsAmount) ? billedAmount : detailsAmount;
                    // OPCIÓN ANTERIOR.
                    /*
                    if(['advanced', 'credit', 'paid', 'unassigned'].indexOf(payment.statusValue) >= 0) {
                        switch(payment.statusValue) {
                            case 'credit':
                            case 'unassigned': 
                                // Se obtiene el total de la factura.
                                if(Array.isArray(payment.invoices) && payment.invoices.length > 0) {
                                    for(const invoice of payment.invoices) {
                                        // @ts-ignore
                                        let invoiceJSON: any = JSON.parse(invoice.json);
                                        let invoiceTotal: number = parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Total']) || '0').toString());
                                        // Se revisa si el total no está en el complemento.
                                        if(invoiceTotal === 0) {
                                            let payments: any = idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['pago10:Pagos']);
                                            if(Array.isArray(payments) && payments.length > 0) {
                                                for(const payment of payments) {
                                                    invoiceTotal += parseFloat(payment['pago10:Pago']['_attributes']['Monto'] || 0);                        
                                                }
                                            } else if(payments && payments.hasOwnProperty('_attributes')) {
                                                invoiceTotal = parseFloat(payments['pago10:Pago']['_attributes']['Monto'] || 0);
                                            }
                                        }
                                        // Se suma el total al total asignado.
                                        assignedAmount += invoiceTotal;
                                    }
                                }
                                break;
                            default:
                                // Se obtiene el total de los pagos cubiertos.
                                if(Array.isArray(payment.details) && payment.details.length > 0) {
                                    for(const advancePaymentDetail of payment.details) {
                                        assignedAmount += advancePaymentDetail.amount;
                                    }
                                }
                                break;
                        }
                        // Condición anterior.
                        // (Array.isArray(payment.invoices) && payment.invoices.length > 0) || (Array.isArray(payment.details) && payment.details.length > 0)
                        // Nueva condición.
                        if(assignedAmount < payment.amountPaid) isItFullyAssigned = false;
                    }*/

                    if(isItFullyAssigned) {
                        return reject({
                            status: 400,
                            module: 'Pagos',
                            message: 'El pago ya se encuentra asignado por completo.',
                        });
                    } else {

                        //BBBB   AAA  L      AAA  N   N  CCCC EEEEE
                        //B   B A   A L     A   A NN  N C     E
                        //BBBB  AAAAA L     AAAAA N N N C     EEE
                        //B   B A   A L     A   A N  NN C     E
                        //BBBB  A   A LLLLL A   A N   N  CCCC EEEEE
                        
                        let balance: any = {};
                        let account: Account = new Account();
                        let pendingReceipts: Array<IPendingReceipt> = [];
                        try {
                            let balanceProcess: BalanceModel = new BalanceModel();
                            balance = await balanceProcess.getAccountBalance({ accountNumber: payment.parentId });
                            account = balance.account;
                            pendingReceipts = Array.isArray(balance.pendingReceipts) ? balance.pendingReceipts : [];
                        } catch(error) {
                            return reject(error);
                        }

                        //RRRR  EEEEE  CCCC IIIII BBBB   OOO   SSSS      PPPP  EEEEE N   N DDDD  IIIII EEEEE N   N TTTTT EEEEE  SSSS
                        //R   R E     C       I   B   B O   O S          P   P E     NN  N D   D   I   E     NN  N   T   E     S
                        //RRRR  EEE   C       I   BBBB  O   O  SSS       PPPP  EEE   N N N D   D   I   EEE   N N N   T   EEE    SSS
                        //R   R E     C       I   B   B O   O     S      P     E     N  NN D   D   I   E     N  NN   T   E         S
                        //R   R EEEEE  CCCC IIIII BBBB   OOO  SSSS       P     EEEEE N   N DDDD  IIIII EEEEE N   N   T   EEEEE SSSS
                        
                        let paymentDetails: Array<any> = [];
                        let receiptsToUpdate: string[] = [];

                        // Se resta la cantidad asignada al total del pago.
                        let remainingAmount: number = parseFloat((payment.amountPaid - assignedAmount).toFixed(2));

                        if(Array.isArray(pendingReceipts) && pendingReceipts.length > 0) {

                            // TODO: Intentar ordenar los recibos pendientes en orden ASC a partir de la fecha del movimiento.
                            pendingReceipts.sort((a: IPendingReceipt, b: IPendingReceipt) => {
                                let aMovementDate: Date = new Date(a.movementDate);
                                let bMovementDate: Date = new Date(b.movementDate);
                                if(aMovementDate < bMovementDate) return -1;
                                if(aMovementDate > bMovementDate) return 1;
                                return 0;
                            });

                            let index: number = 0;
                            let invoiceModel: InvoiceModel = new InvoiceModel();
                            while(remainingAmount > 0 && index < pendingReceipts.length) {

                                // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                                // No se debe, repito, NO SE DEBE revisar si se salda el total del recibo solamente, ya que
                                // el recibo puede tener pagos anteriores, hay que restar estos al total y después revisar si
                                // se puede saldar.

                                // Esto es culpa del déficit de atención de -Francisco Rodríguez-, si lo ves regalale un chocolate.

                                //PPPP   AAA   GGGG  OOO   SSSS
                                //P   P A   A G     O   O S
                                //PPPP  AAAAA G  GG O   O  SSS
                                //P     A   A G   G O   O     S
                                //P     A   A  GGGG  OOO  SSSS
                                
                                // Se obtienen los pagos realizados al recibo.
                                // Monto pagado.
                                let paidAmount: number = 0;
                                // Monto acreditado.
                                let creditedAmount: number = 0;
                                // Monto pendiente.
                                let pendingAmount: number = 0;
                                // Pagos relacionados al recibo.
                                let getPayments: { results: Array<Payment>, summary: any } = { results: [], summary: {} };
                                let paymentModel: PaymentModel = new PaymentModel();
                                try {
                                    getPayments = await paymentModel.getPayments({ 'details.receiptId': pendingReceipts[index]._id });
                                } catch(error) {
                                    return reject(error);
                                }
                                // Si se encontraron pagos, se suman los montos que pertenecen al recibo.
                                
                                // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                                // Se puden separar los pagos "normales" de los "acreditados" aquí.

                                if(getPayments.results.length > 0) {
                                    for(const payment of getPayments.results) {
                                        if((Array.isArray(payment.details) && payment.details.length > 0)) {
                                            for(const detail of payment.details) {
                                                if(detail.receiptId === pendingReceipts[index]._id) {
                                                    if(payment.statusValue !== 'credit') {
                                                        paidAmount += detail.amount;
                                                    } else {
                                                        creditedAmount += detail.amount;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                paidAmount = parseFloat(paidAmount.toFixed(2));
                                creditedAmount = parseFloat(creditedAmount.toFixed(2));

                                //TTTTT  OOO  TTTTT  AAA  L     EEEEE  SSSS
                                //  T   O   O   T   A   A L     E     S
                                //  T   O   O   T   AAAAA L     EEE    SSS
                                //  T   O   O   T   A   A L     E         S
                                //  T    OOO    T   A   A LLLLL EEEEE SSSS
                                
                                // Ahora sí se calculan los totales.
                                pendingAmount = parseFloat((pendingReceipts[index].total - paidAmount - creditedAmount).toFixed(2));
                                pendingAmount = pendingAmount < 0 ? 0 : pendingAmount;
                                pendingAmount = parseFloat(pendingAmount.toFixed(2));
                                // Se revisa la cantidad que se puede saldar del recibo.
                                if(remainingAmount >= pendingAmount) {
                                    // console.log('El recibo se puede saldar.');
                                    // Si se puede cubrir el recibo completo.
                                    paymentDetails.push({
                                        receiptId: pendingReceipts[index]._id,
                                        amount: pendingAmount
                                    });
                                    // Se resta el total del recibo al total retante.
                                    remainingAmount -= pendingAmount;
                                    remainingAmount = parseFloat(remainingAmount.toFixed(2));
                                    // IMPORTANTE: Faltaba agregar el recibo al arreglo de los que se pueden saldar.
                                    if(pendingReceipts[index]._id) receiptsToUpdate.push(pendingReceipts[index]._id as string);
                                } else {
                                    // console.log('El recibo NO se puede saldar.');
                                    // console.log(`[MODELOS][PAGOS][postPayment] No se puede saldar el recibo: ${pendingReceipts[index]._id}`);
                                    // Se agrega un movimiento con el total restante si no logra cubri el recibo.
                                    paymentDetails.push({
                                        receiptId: pendingReceipts[index]._id,
                                        amount: remainingAmount
                                    });
                                    remainingAmount -= remainingAmount;
                                }
                                index++;
                            }
                            payment.details = paymentDetails;
                        }

                        //RRRR  EEEEE  SSSS TTTTT  AAA  N   N TTTTT EEEEE
                        //R   R E     S       T   A   A NN  N   T   E
                        //RRRR  EEE    SSS    T   AAAAA N N N   T   EEE
                        //R   R E         S   T   A   A N  NN   T   E
                        //R   R EEEEE SSSS    T   A   A N   N   T   EEEEE

                        // SUPER PODEROSA NINJA TURBO NEO ULTRA HYPER MEGA MULTI ALPHA META EXTRA UBER PREFIJO NOTA:
                        // Si quedó un restante del pago al liquidar todo lo pendiente, se debe generar una factura tipo PUE de ANTICIPO.
                        
                        //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA   SSSS
                        //F     A   A C       T   U   U R   R A   A S
                        //FFF   AAAAA C       T   U   U RRRR  AAAAA  SSS
                        //F     A   A C       T   U   U R   R A   A     S
                        //F     A   A  CCCC   T    UUU  R   R A   A SSSS
                        
                        let invoiceModelV2: InvoiceModelV2 = new InvoiceModelV2();
                        let invoices: Array<InvoiceV2> = [];
                        let invoicesIds: Array<string> = [];
                        let invoiceErrors: any[] = [];
                        let attachments: Array<FileStructure> = [];
                        let invoiceType: 'Factura' | 'Complemento' = 'Factura';
                        // Se revisa si se desean crear las facturas.
                        if(createInvoices) {
                            // Paso 1: Se obtiene la factura desde el pago.
                            try {
                                payment.details = paymentDetails;
                                invoices = await invoiceModelV2.getInvoicesFromPayment(payment);
                            } catch(error) {
                                return reject(error);
                            }
                            // Paso 2: Se timbra / guarda la factura.
                            for(const invoice of invoices) {
                                try {
                                    // console.log(`[MODELOS][PAGOS][postPayment] Datos a facturar: ${JSON.stringify(invoice)}`);
                                    if(invoice.compType === 'P') invoiceType = 'Complemento';
                                    // TODO: Revisar que el objeto 'invoice' contenga lo siguiente:
                                    // invoice
                                    // [X] account
                                    // [X] client
                                    // [X] concepts
                                    // [X] relatedCfdis
                                    // [X] paymentComplement
                                    // [X] returnFiles
                                    // @ts-ignore
                                    invoice.returnFiles = true;
                                    let invoiceV2: IInvoiceV1EX = await invoiceModelV2.postInvoice(invoice);
                                    invoicesIds.push(invoiceV2._id as string);
                                    // Nombre del archivo.
                                    let fileName: string = `${invoiceV2.serie}${invoiceV2.folio}`;
                                    // Se revisan los archivos recibidos y se agregan al arreglo de archivos adjuntos.
                                    // XML.
                                    let xmlFile: string = (idx(invoiceV2, _ => _.files.xml) || '').toString();
                                    if(typeof xmlFile === 'string' && xmlFile.length > 0) {
                                        // NOTE: Se debe convertir a base64, ya que el archivo viene literalemnte en texto.
                                        let xmlBuffer: Buffer = Buffer.from(xmlFile, 'utf8');
                                        let xmlBase64: string = xmlBuffer.toString('base64');
                                        attachments.push({
                                            type: 'application/xml',
                                            // NOTE: Esto van a pedir que se cambie. 12/12/2019
                                            name: `${fileName}.xml`, // `${invoiceType}.xml`,
                                            content: xmlBase64
                                        });
                                    }
                                    // PDF.
                                    let pdfFile: string = (idx(invoiceV2, _ => _.files.pdf) || '').toString();
                                    if(typeof pdfFile === 'string' && pdfFile.length > 0) {
                                        attachments.push({
                                            type: 'application/pdf',
                                            // NOTE: Esto van a pedir que se cambie. 12/12/2019
                                            name: `${fileName}.pdf`, // `${invoiceType}.pdf`,
                                            content: pdfFile
                                        });
                                    }
                                } catch(error) {
                                    invoiceErrors.push(error);
                                }
                            }
                        }

                        //PPPP   AAA   GGGG  OOO
                        //P   P A   A G     O   O 
                        //PPPP  AAAAA G  GG O   O
                        //P     A   A G   G O   O
                        //P     A   A  GGGG  OOO
                        
                        // Se debe actualizar el pago con el detalle y número de factura.
                        let paymentErrors: any[] = [];
                        let updatedPayment: any = {};
                        let statusValue: string = remainingAmount > 0 ? 'advanced' : 'assigned'
                        if(payment.statusValue === 'credit') statusValue = 'credit';
                        try{
                            let data: any = { 
                                _id: payment._id,
                                details: paymentDetails,
                                statusValue
                            };
                            if(invoicesIds.length > 0) data['invoices'] = invoicesIds;
                            updatedPayment = await this.putPayment(data);
                        } catch(error) {
                            paymentErrors.push(error);
                        }

                        //RRRR  EEEE  CCCC IIIII BBBB   OOO   SSSS
                        //R   R E    C       I   B   B O   O S
                        //RRRR  EEE  C       I   BBBB  O   O  SSS
                        //R   R E    C       I   B   B O   O     S
                        //R   R EEEE  CCCC IIIII BBBB   OOO  SSSS
                        
                        // Se deben actualizar los recibos pagados.
                        let receiptsErrors: any[] = [];
                        let receiptModel: ReceiptModel = new ReceiptModel();
                        if(receiptsToUpdate.length > 0) {
                            for(const id of receiptsToUpdate) {
                                try{
                                    await receiptModel.putReceipt({ _id: id, statusValue: 'paid' });
                                } catch(error) {
                                    receiptsErrors.push(error);
                                }
                            }
                        }

                        //EEEEE M   M  AAA  IIIII L
                        //E     MM MM A   A   I   L
                        //EEE   M M M AAAAA   I   L
                        //E     M   M A   A   I   L
                        //EEEEE M   M A   A IIIII LLLLL
                        
                        let accountProcessesModel: AccountProcessesModel = new AccountProcessesModel();
                        let mailingErrors: Array<any> = [];
                        if(attachments.length > 0) {
                            let data: any = {
                                accountNumber: account.accountNumber,
                                attachments,
                                template: 'client_notification',
                                content: [
                                    {
                                        name: 'message',
                                        content: 'Por medio del presente correo le hacemos llegar su estado de cuenta del mes.'
                                    }
                                ],
                                subject: `Domain ${invoiceType} ${account.accountNumber}.`
                            };
                            try {
                                await accountProcessesModel.sendEmail(data);
                            } catch(error) {
                                mailingErrors.push(error);
                            }
                        }

                        //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
                        //R   R E     S     U   U L       T   A   A D   D O   O
                        //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
                        //R   R E         S U   U L       T   A   A D   D O   O
                        //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
                        
                        let result: any = Object.assign({}, updatedPayment);
                        result.updatedReceipts = receiptsToUpdate;
                        // result.attachments = attachments;
                        result.errors = {};
                        result.errors.paymentErrors = paymentErrors;
                        result.errors.receiptsErrors = receiptsErrors;
                        result.errors.invoiceErrors = invoiceErrors;
                        result.errors.mailingErrors = mailingErrors;
                        return resolve({
                            status: (receiptsErrors.length > 0 || invoiceErrors.length > 0) ? 206 : 200,
                            data: result
                        });
                    }
                })
                .catch((error: any) => {
                    return reject({
                        status: 400,
                        error
                    });
                });
            } else {
                return reject({
                    status: 404,
                    module: 'Pagos',
                    message: 'No se encontró ningún identificador en la petición.',
                });
            }
        });   
    }
    public postPaymentAssignmentV2 = (body: any): Promise<any> => {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let { _id, relatedCfdis, createInvoices, ...rest }: { _id: string, relatedCfdis: Array<string>, createInvoices: boolean } & any = body;
            createInvoices = (typeof createInvoices === 'boolean') ? createInvoices : true;
            if(_id) {
                
                //PPPP   AAA   GGGG  OOO
                //P   P A   A G     O   O
                //PPPP  AAAAA G  GG O   O
                //P     A   A G   G O   O
                //P     A   A  GGGG  OOO
                
                let payment: Payment;
                try {
                    payment = await this.getPayment({ _id });
                } catch(error) {
                    return reject(error);
                }
                // Se revisa que exista un identificador padre (que ya esté asignado a una cuenta).
                if(!payment.parentId) {
                    return reject({
                        status: 400,
                        module: 'Pagos',
                        message: 'El pago no está asignado a ninguna cuenta.',
                    });
                }
                // Se revisa que el pago no esté cancelado.
                if(!payment.statusValue || payment.statusValue === 'cancelled') {
                    return reject({
                        status: 400,
                        module: 'Pagos',
                        message: 'El pago está cancelado.',
                    });
                }
                
                // CCCC U   U EEEEE N   N TTTTT  AAA        AAA   CCCC TTTTT IIIII V   V  AAA
                //C     U   U E     NN  N   T   A   A      A   A C       T     I   V   V A   A
                //C     U   U EEE   N N N   T   AAAAA      AAAAA C       T     I   V   V AAAAA
                //C     U   U E     N  NN   T   A   A      A   A C       T     I    V V  A   A
                // CCCC  UUU  EEEEE N   N   T   A   A      A   A  CCCC   T   IIIII   V   A   A
                
                let accountModel = new AccountModel();
                // @ts-ignore
                accountModel.isAccountActive(payment.parentId)
                .then( async (result: boolean) => {

                    // SSSS  AAA  L     DDDD   OOO        AAA   SSSS IIIII  GGGG N   N  AAA  DDDD   OOO
                    //S     A   A L     D   D O   O      A   A S       I   G     NN  N A   A D   D O   O
                    // SSS  AAAAA L     D   D O   O      AAAAA  SSS    I   G  GG N N N AAAAA D   D O   O
                    //    S A   A L     D   D O   O      A   A     S   I   G   G N  NN A   A D   D O   O
                    //SSSS  A   A LLLLL DDDD   OOO       A   A SSSS  IIIII  GGGG N   N A   A DDDD   OOO

                    // Cantidad asignada en los detalles.
                    let detailsAmount: number = 0;
                    if(payment.details && payment.details.length > 0) {
                        for(const detail of payment.details) {
                            detailsAmount += detail.amount;
                        }
                        detailsAmount = parseFloat(detailsAmount.toFixed(2));
                    }
                    // Se obtiene el saldo sin asignar.
                    let unassignedAmount: number = parseFloat((payment.amountPaid - detailsAmount).toFixed(2));

                    //DDDD  EEEEE TTTTT  AAA  L     L     EEEEE  SSSS
                    //D   D E       T   A   A L     L     E     S
                    //D   D EEE     T   AAAAA L     L     EEE    SSS
                    //D   D E       T   A   A L     L     E         S
                    //DDDD  EEEEE   T   A   A LLLLL LLLLL EEEEE SSSS

                    // Nuevos detalles para el pago.
                    let details: Array<{ receiptId: string, amount: number }> = [];
                    // Arreglo de recibos a actualzar (marcar como pagados).
                    let receiptsToUpdate: string[] = [];
                    if(Array.isArray(payment.details)) details = details.concat(payment.details);
                    // Se revisa si hay saldo libre para asignar.
                    if(detailsAmount < payment.amountPaid) {
                        
                        // SUPER PODEROSA NINJA TURBO NEO ULTRA HYPER MEGA MULTI ALPHA META EXTRA UBER PREFIJO NOTA:
                        // Los recibos pendientes se deben obtener del balance, ya que si sólo se obtienen los recibos pendientes de la cuenta,
                        // esta puede pertenecer en realidad a una cuenta maestra, y se perdería el panorama más grande.

                        //BBBB   AAA  L      AAA  N   N  CCCC EEEEE
                        //B   B A   A L     A   A NN  N C     E
                        //BBBB  AAAAA L     AAAAA N N N C     EEE
                        //B   B A   A L     A   A N  NN C     E
                        //BBBB  A   A LLLLL A   A N   N  CCCC EEEEE
                        
                        let account: Account = new Account();
                        let pendingReceipts: Array<IPendingReceipt> = [];
                        try {
                            let balanceProcess: BalanceModel = new BalanceModel();
                            let balance: IBalance = await balanceProcess.getAccountBalance({ accountNumber: payment.parentId });
                            account = balance.account;
                            pendingReceipts = Array.isArray(balance.pendingReceipts) ? pendingReceipts.concat(balance.pendingReceipts) : [];
                        } catch(error) {
                            return reject(error);
                        }

                        //RRRR  EEEEE  CCCC IIIII BBBB   OOO   SSSS      PPPP  EEEEE N   N DDDD  IIIII EEEEE N   N TTTTT EEEEE  SSSS
                        //R   R E     C       I   B   B O   O S          P   P E     NN  N D   D   I   E     NN  N   T   E     S
                        //RRRR  EEE   C       I   BBBB  O   O  SSS       PPPP  EEE   N N N D   D   I   EEE   N N N   T   EEE    SSS
                        //R   R E     C       I   B   B O   O     S      P     E     N  NN D   D   I   E     N  NN   T   E         S
                        //R   R EEEEE  CCCC IIIII BBBB   OOO  SSSS       P     EEEEE N   N DDDD  IIIII EEEEE N   N   T   EEEEE SSSS
                        
                        // Se revisa si existen recibos pendientes.
                        if(pendingReceipts.length > 0) {

                            // Se ordenan los recibos pendientes en orden ASC a partir de la fecha del movimiento.
                            pendingReceipts.sort((a: IPendingReceipt, b: IPendingReceipt) => {
                                let aMovementDate: Date = new Date(a.movementDate);
                                let bMovementDate: Date = new Date(b.movementDate);
                                if(aMovementDate < bMovementDate) return -1;
                                if(aMovementDate > bMovementDate) return 1;
                                return 0;
                            });
                            // Se recorren uno a uno los recibos pendientes.
                            let index: number = 0;
                            while(unassignedAmount > 0 && index < pendingReceipts.length) {

                                // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                                // No se debe, repito, NO SE DEBE revisar si se salda el total del recibo solamente, ya que
                                // el recibo puede tener pagos anteriores, hay que restar estos al total y después revisar si
                                // se puede saldar.

                                // Esto es culpa del déficit de atención de -Francisco Rodríguez-, si lo ves regalale un chocolate.

                                //PPPP   AAA   GGGG  OOO   SSSS
                                //P   P A   A G     O   O S
                                //PPPP  AAAAA G  GG O   O  SSS
                                //P     A   A G   G O   O     S
                                //P     A   A  GGGG  OOO  SSSS
                                
                                // Se obtienen los pagos realizados al recibo.
                                // Monto pagado.
                                let paidAmount: number = 0;
                                // Monto acreditado.
                                let creditedAmount: number = 0;
                                // Monto pendiente.
                                let pendingAmount: number = 0;
                                // Pagos relacionados al recibo.
                                let getPayments: { results: Array<Payment>, summary: any } = { results: [], summary: {} };
                                let paymentModel: PaymentModel = new PaymentModel();
                                try {
                                    getPayments = await paymentModel.getPayments({ 'details.receiptId': pendingReceipts[index]._id });
                                } catch(error) {
                                    return reject(error);
                                }
                                // Si se encontraron pagos, se suman los montos que pertenecen al recibo.
                                
                                // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                                // Se puden separar los pagos "normales" de los "acreditados" aquí.

                                if(getPayments.results.length > 0) {
                                    for(const payment of getPayments.results) {
                                        if((Array.isArray(payment.details) && payment.details.length > 0)) {
                                            for(const detail of payment.details) {
                                                if(detail.receiptId === pendingReceipts[index]._id) {
                                                    if(payment.statusValue !== 'credit') {
                                                        paidAmount += detail.amount;
                                                    } else {
                                                        creditedAmount += detail.amount;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                paidAmount = parseFloat(paidAmount.toFixed(2));
                                creditedAmount = parseFloat(creditedAmount.toFixed(2));

                                //TTTTT  OOO  TTTTT  AAA  L     EEEEE  SSSS
                                //  T   O   O   T   A   A L     E     S
                                //  T   O   O   T   AAAAA L     EEE    SSS
                                //  T   O   O   T   A   A L     E         S
                                //  T    OOO    T   A   A LLLLL EEEEE SSSS
                                
                                // Ahora sí se calculan los totales.
                                pendingAmount = parseFloat((pendingReceipts[index].total - paidAmount - creditedAmount).toFixed(2));
                                pendingAmount = pendingAmount < 0 ? 0 : pendingAmount;
                                pendingAmount = parseFloat(pendingAmount.toFixed(2));
                                // Se revisa la cantidad que se puede saldar del recibo.
                                if(unassignedAmount >= pendingAmount) {
                                    // console.log('El recibo se puede saldar.');
                                    // Si se puede cubrir el recibo completo.
                                    details.push({
                                        receiptId: pendingReceipts[index]._id as string,
                                        amount: pendingAmount
                                    });
                                    // Se resta el total del recibo al total retante.
                                    unassignedAmount -= pendingAmount;
                                    unassignedAmount = parseFloat(unassignedAmount.toFixed(2));
                                    // IMPORTANTE: Faltaba agregar el recibo al arreglo de los que se pueden saldar.
                                    if(pendingReceipts[index]._id) receiptsToUpdate.push(pendingReceipts[index]._id as string);
                                } else {
                                    // console.log('El recibo NO se puede saldar.');
                                    // console.log(`[MODELOS][PAGOS][postPayment] No se puede saldar el recibo: ${pendingReceipts[index]._id}`);
                                    // Se agrega un movimiento con el total restante si no logra cubri el recibo.
                                    details.push({
                                        receiptId: pendingReceipts[index]._id as string,
                                        amount: unassignedAmount
                                    });
                                    unassignedAmount -= unassignedAmount;
                                }
                                index++;
                            }
                            // Se actualizan los detalles del pago.
                            payment.details = details;
                        }
                    }
                    
                    //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA   SSSS
                    //F     A   A C       T   U   U R   R A   A S
                    //FFF   AAAAA C       T   U   U RRRR  AAAAA  SSS
                    //F     A   A C       T   U   U R   R A   A     S
                    //F     A   A  CCCC   T    UUU  R   R A   A SSSS
        
                    // Tipo de factura.
                    let invoiceType: 'Factura' | 'Complemento' = 'Factura';
                    // Archivos adjuntos.
                    let attachments: Array<FileStructure> = [];
                    // Identificadores de las factura (se usan para actualizar el pago).
                    let invoicesIds: Array<string> = [];
                    // Errores de facturación.
                    let invoiceErrors: any[] = [];
                    // Solo se crean las facturas si el pago no tiene.
                    if((!Array.isArray(payment.invoices) || payment.invoices.length === 0) && createInvoices) {
                        // Modelo de facturación v2.
                        let invoiceModelV2: InvoiceModelV2 = new InvoiceModelV2();
                        // Arreglo de facturas.
                        let invoices: Array<InvoiceV2> = [];
                        // Se revisa si se desean crear las facturas.
                        // Paso 1: Se obtiene la factura desde el pago.
                        try {
                            // NOTE: Si se modificaron los detalles del pago, fue en el proceso anterior.
                            invoices = await invoiceModelV2.getInvoicesFromPayment(payment);
                        } catch(error) {
                            return reject(error);
                        }
                        // Paso 2: Se timbra / guarda la factura.
                        for(const invoice of invoices) {
                            try {
                                // console.log(`[MODELOS][PAGOS][postPayment] Datos a facturar: ${JSON.stringify(invoice)}`);
                                if(invoice.compType === 'P') invoiceType = 'Complemento';
                                // TODO: Revisar que el objeto 'invoice' contenga lo siguiente:
                                // invoice
                                // [X] account
                                // [X] client
                                // [X] concepts
                                // [X] relatedCfdis
                                // [X] paymentComplement
                                // [X] returnFiles
                                // @ts-ignore
                                invoice.returnFiles = true;
                                let invoiceV2: IInvoiceV1EX = await invoiceModelV2.postInvoice(invoice);
                                invoicesIds.push(invoiceV2._id as string);
                                // Nombre del archivo.
                                let fileName: string = `${invoiceV2.serie}${invoiceV2.folio}`;
                                // Se revisan los archivos recibidos y se agregan al arreglo de archivos adjuntos.
                                // XML.
                                let xmlFile: string = (idx(invoiceV2, _ => _.files.xml) || '').toString();
                                if(typeof xmlFile === 'string' && xmlFile.length > 0) {
                                    // NOTE: Se debe convertir a base64, ya que el archivo viene literalemnte en texto.
                                    let xmlBuffer: Buffer = Buffer.from(xmlFile, 'utf8');
                                    let xmlBase64: string = xmlBuffer.toString('base64');
                                    attachments.push({
                                        type: 'application/xml',
                                        // NOTE: Esto van a pedir que se cambie. 12/12/2019
                                        name: `${fileName}.xml`, // `${invoiceType}.xml`,
                                        content: xmlBase64
                                    });
                                }
                                // PDF.
                                let pdfFile: string = (idx(invoiceV2, _ => _.files.pdf) || '').toString();
                                if(typeof pdfFile === 'string' && pdfFile.length > 0) {
                                    attachments.push({
                                        type: 'application/pdf',
                                        // NOTE: Esto van a pedir que se cambie. 12/12/2019
                                        name: `${fileName}.pdf`, // `${invoiceType}.pdf`,
                                        content: pdfFile
                                    });
                                }
                            } catch(error) {
                                invoiceErrors.push(error);
                            }
                        }
                    }

                    // AAA   CCCC TTTTT U   U  AAA  L     IIIII ZZZZZ  AAA   CCCC IIIII  OOO  N   N EEEEE  SSSS
                    //A   A C       T   U   U A   A L       I      Z  A   A C       I   O   O NN  N E     S
                    //AAAAA C       T   U   U AAAAA L       I     Z   AAAAA C       I   O   O N N N EEE    SSS
                    //A   A C       T   U   U A   A L       I    Z    A   A C       I   O   O N  NN E         S
                    //A   A  CCCC   T    UUU  A   A LLLLL IIIII ZZZZZ A   A  CCCC IIIII  OOO  N   N EEEEE SSSS
                    
                    //PPPP   AAA   GGGG  OOO
                    //P   P A   A G     O   O 
                    //PPPP  AAAAA G  GG O   O
                    //P     A   A G   G O   O
                    //P     A   A  GGGG  OOO
                    
                    // Errores de pago.
                    let paymentErrors: any[] = [];
                    // Pagos actualizados.
                    let updatedPayment: any = {};
                    // Estatus.
                    let statusValue: string = unassignedAmount > 0 ? 'advanced' : 'assigned'
                    if(payment.statusValue === 'credit') statusValue = 'credit';
                    // Se debe actualizar el pago con el detalle y número de factura.
                    try{
                        let data: any = { 
                            _id: payment._id,
                            details,
                            statusValue
                        };
                        if(invoicesIds.length > 0) data['invoices'] = invoicesIds;
                        updatedPayment = await this.putPayment(data);
                    } catch(error) {
                        paymentErrors.push(error);
                    }

                    //RRRR  EEEE  CCCC IIIII BBBB   OOO   SSSS
                    //R   R E    C       I   B   B O   O S
                    //RRRR  EEE  C       I   BBBB  O   O  SSS
                    //R   R E    C       I   B   B O   O     S
                    //R   R EEEE  CCCC IIIII BBBB   OOO  SSSS
                    
                    // Errores de recibo.
                    let receiptsErrors: any[] = [];
                    // Modelo para recibos.
                    let receiptModel: ReceiptModel = new ReceiptModel();
                    // Se deben actualizar los recibos pagados.
                    if(receiptsToUpdate.length > 0) {
                        for(const receiptId of receiptsToUpdate) {
                            try{
                                await receiptModel.putReceipt({ _id: receiptId, statusValue: 'paid' });
                            } catch(error) {
                                receiptsErrors.push(error);
                            }
                        }
                    }

                    //EEEEE M   M  AAA  IIIII L
                    //E     MM MM A   A   I   L
                    //EEE   M M M AAAAA   I   L
                    //E     M   M A   A   I   L
                    //EEEEE M   M A   A IIIII LLLLL
                    
                    let accountProcessesModel: AccountProcessesModel = new AccountProcessesModel();
                    let mailingErrors: Array<any> = [];
                    if(attachments.length > 0) {
                        let data: any = {
                            accountNumber: payment.parentId,
                            attachments,
                            template: 'client_notification',
                            content: [
                                {
                                    name: 'message',
                                    content: 'Por medio del presente correo le hacemos llegar su estado de cuenta del mes.'
                                }
                            ],
                            subject: `Domain ${invoiceType} ${payment.parentId}.`
                        };
                        try {
                            await accountProcessesModel.sendEmail(data);
                        } catch(error) {
                            mailingErrors.push(error);
                        }
                    }

                    //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
                    //R   R E     S     U   U L       T   A   A D   D O   O
                    //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
                    //R   R E         S U   U L       T   A   A D   D O   O
                    //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
                    
                    let data: any = Object.assign({}, updatedPayment);
                    data.updatedReceipts = receiptsToUpdate;
                    data.errors = {
                        paymentErrors,
                        receiptsErrors,
                        invoiceErrors,
                        mailingErrors
                    };
                    return resolve({
                        status: (receiptsErrors.length > 0 || invoiceErrors.length > 0) ? 206 : 200,
                        data
                    });
                })
                .catch((error: any) => {
                    return reject(error);
                });
            } else {
                return reject({
                    status: 404,
                    module: 'Pagos',
                    message: 'No se encontró ningún identificador en la petición.',
                });
            }
        });
    }

    // DELETE: Esta función ya no se utiliza.
    public postPaymentStamping = (body: any): Promise<any> => {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let { _id, id, relatedCfdis, ...rest } = body;
            _id = _id ? _id : id;
            if(typeof _id === 'string' && _id.length > 0) {

                //PPPP   AAA   GGGG  OOO
                //P   P A   A G     O   O
                //PPPP  AAAAA G  GG O   O
                //P     A   A G   G O   O
                //P     A   A  GGGG  OOO

                let payment: Payment;
                try {
                    payment = await this.getPayment({ _id });
                } catch(error) {
                    return reject(error);
                }

                // Se revisa que exista un identificador padre (que ya esté asignado a una cuenta).
                if(typeof payment.parentId != 'string' || payment.parentId.length === 0) {
                    return reject({
                        status: 400,
                        module: 'Pagos',
                        message: 'El pago no está asignado a ninguna cuenta.',
                    });
                }

                // Se revisa que el pago no esté cancelado.
                if(typeof payment.statusValue === 'string' && payment.statusValue === 'cancelled') {
                    return reject({
                        status: 400,
                        module: 'Pagos',
                        message: 'El pago está cancelado.',
                    });
                } else if(typeof payment.statusValue === 'string' && payment.statusValue === 'unassigned') {
                    return reject({
                        status: 400,
                        module: 'Pagos',
                        message: 'El pago está parcialmente facturado (se debe utilizar otro recurso).',
                    });
                }
                
                // CCCC U   U EEEEE N   N TTTTT  AAA        AAA   CCCC TTTTT IIIII V   V  AAA
                //C     U   U E     NN  N   T   A   A      A   A C       T     I   V   V A   A
                //C     U   U EEE   N N N   T   AAAAA      AAAAA C       T     I   V   V AAAAA
                //C     U   U E     N  NN   T   A   A      A   A C       T     I    V V  A   A
                // CCCC  UUU  EEEEE N   N   T   A   A      A   A  CCCC   T   IIIII   V   A   A

                let accountModel = new AccountModel();
                // @ts-ignore
                accountModel.isAccountActive(payment.parentId)
                .then( async (result: boolean) => {
                    // Se revisa si existe ya una factura para el pago.
                    if(Array.isArray(payment.invoices) && payment.invoices.length > 0) {
                        return reject({
                            status: 400,
                            module: 'Pagos',
                            message: 'El pago ya cuenta con una o más facturas asignadas.',
                        });
                    } else {

                        //BBBB   AAA  L      AAA  N   N  CCCC EEEEE
                        //B   B A   A L     A   A NN  N C     E
                        //BBBB  AAAAA L     AAAAA N N N C     EEE
                        //B   B A   A L     A   A N  NN C     E
                        //BBBB  A   A LLLLL A   A N   N  CCCC EEEEE

                        let account: Account = new Account();
                        try {
                            let balanceProcess: BalanceModel = new BalanceModel();
                            let balance = await balanceProcess.getAccountBalance({ accountNumber: payment.parentId });
                            account = balance.account;
                        } catch(error) {
                            return reject(error);
                        }
                        
                        //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA   SSSS
                        //F     A   A C       T   U   U R   R A   A S
                        //FFF   AAAAA C       T   U   U RRRR  AAAAA  SSS
                        //F     A   A C       T   U   U R   R A   A     S
                        //F     A   A  CCCC   T    UUU  R   R A   A SSSS
                        
                        let invoiceModelV2: InvoiceModelV2 = new InvoiceModelV2();
                        let invoiceErrors: any[] = [];
                        let invoices: any = [];
                        let attachments: Array<FileStructure> = [];
                        // Paso 1: Se obtiene la factura desde el pago.
                        try {
                            invoices = await invoiceModelV2.getInvoicesFromPayment(payment);
                        } catch(error) {
                            return reject(error);
                        }
                        // Paso 2: Se timbra / guarda la factura.
                        let invoicesIds: Array<string> = [];
                        for(const invoice of invoices) {
                            try {
                                // console.log(`[MODELOS][PAGOS][postPayment] Datos a facturar: ${JSON.stringify(invoice)}`);
                                // TODO: Revisar que el objeto 'invoice' contenga lo siguiente:
                                // invoice
                                // [X] account
                                // [X] client
                                // [X] concepts
                                // [X] relatedCfdis
                                // [X] paymentComplement
                                // [X] returnFiles
                                invoice.returnFiles = true;
                                let invoiceV2 = await invoiceModelV2.postInvoice(invoice);
                                invoicesIds.push(invoiceV2._id);
                                // Se revisan los archivos recibidos y se agregan al arreglo de archivos adjuntos.
                                // XML.
                                let xmlFile: string = (idx(invoiceV2, _ => _.files.xml) || '').toString();
                                if(typeof xmlFile === 'string' && xmlFile.length > 0) {
                                    // NOTE: Se debe convertir a base64, ya que el archivo viene literalemnte en texto.
                                    let xmlBuffer: Buffer = Buffer.from(xmlFile, 'utf8');
                                    let xmlBase64: string = xmlBuffer.toString('base64');
                                    attachments.push({
                                        type: 'application/xml',
                                        name: 'Factura.xml',
                                        content: xmlBase64
                                    });
                                }
                                // PDF.
                                let pdfFile: string = (idx(invoiceV2, _ => _.files.pdf) || '').toString();
                                if(typeof pdfFile === 'string' && pdfFile.length > 0) {
                                    attachments.push({
                                        type: 'application/pdf',
                                        name: 'Factura.pdf',
                                        content: pdfFile
                                    });
                                }
                            } catch(error) {
                                invoiceErrors.push(error);
                            }
                        }
                        
                        //EEEEE M   M  AAA  IIIII L
                        //E     MM MM A   A   I   L
                        //EEE   M M M AAAAA   I   L
                        //E     M   M A   A   I   L
                        //EEEEE M   M A   A IIIII LLLLL

                        let accountProcessesModel: AccountProcessesModel = new AccountProcessesModel();
                        let mailingErrors: Array<any> = [];
                        if(attachments.length > 0) {
                            let data: any = {
                                accountNumber: account.accountNumber,
                                attachments,
                                template: 'client_notification',
                                content: [
                                    {
                                        name: 'message',
                                        content: 'Por medio del presente correo le hacemos llegar su estado de cuenta del mes.'
                                    }
                                ],
                                subject: `Domain Estado de cuenta ${account.accountNumber}.`
                            };
                            try {
                                await accountProcessesModel.sendEmail(data);
                            } catch(error) {
                                mailingErrors.push(error);
                            }
                        }

                        //PPPP   AAA   GGGG  OOO
                        //P   P A   A G     O   O 
                        //PPPP  AAAAA G  GG O   O
                        //P     A   A G   G O   O
                        //P     A   A  GGGG  OOO

                        // Se debe actualizar el pago con el detalle y número de factura.
                        try{
                            let data: any = { 
                                _id: payment._id,
                                invoices: invoicesIds
                            };
                            let updatedPayment = await this.putPayment(data);
                            return resolve({
                                status: 200, 
                                data: {
                                    payment: updatedPayment,
                                    invoiceErrors,
                                    mailingErrors
                                }
                            });
                        } catch(error) {
                            return resolve({
                                status: 206,
                                data: {
                                    message: 'No se pudo actualizar la información de la factura dentro del pago.',
                                    invoices: invoicesIds
                                }
                            });
                        }
                    }
                })
                .catch((error: any) => {
                    return reject({
                        status: 400,
                        error
                    });
                });
            } else {
                return reject({
                    status: 404,
                    module: 'Pagos',
                    message: 'No se encontró ningún identificador en la petición.',
                });
            }
        });
    }

    public postPaymentStampingV2 = (body: any): Promise<any> => {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let { _id, id, relatedCfdis, ...rest } = body;
            _id = _id ? _id : id;
            // console.log(_id);
            if(typeof _id === 'string' && _id.length > 0) {

                //PPPP   AAA   GGGG  OOO
                //P   P A   A G     O   O
                //PPPP  AAAAA G  GG O   O
                //P     A   A G   G O   O
                //P     A   A  GGGG  OOO

                let payment: Payment;
                try {
                    payment = await this.getPayment({ _id });
                } catch(error) {
                    return reject(error);
                }

                // Se revisa que exista un identificador padre (que ya esté asignado a una cuenta).
                if(typeof payment.parentId != 'string' || payment.parentId.length === 0) {
                    return reject({
                        status: 400,
                        module: 'Pagos',
                        message: 'El pago no está asignado a ninguna cuenta.',
                    });
                }

                // Se revisa que el pago no esté cancelado.
                if(typeof payment.statusValue === 'string' && payment.statusValue === 'cancelled') {
                    return reject({
                        status: 400,
                        module: 'Pagos',
                        message: 'El pago está cancelado.',
                    });
                }
                
                // CCCC U   U EEEEE N   N TTTTT  AAA        AAA   CCCC TTTTT IIIII V   V  AAA
                //C     U   U E     NN  N   T   A   A      A   A C       T     I   V   V A   A
                //C     U   U EEE   N N N   T   AAAAA      AAAAA C       T     I   V   V AAAAA
                //C     U   U E     N  NN   T   A   A      A   A C       T     I    V V  A   A
                // CCCC  UUU  EEEEE N   N   T   A   A      A   A  CCCC   T   IIIII   V   A   A

                // let accountModel = new AccountModel();
                // accountModel.isAccountActive(payment.parentId)
                // .then( async (result: boolean) => {
                    // Se revisa si existe ya una factura o recibos asignados al pago.
                    let isItFullyStamped: boolean = true;
                    let amountStamped: number = 0;
                    let invoicesIds: Array<string> = [];
                    if(Array.isArray(payment.invoices) && payment.invoices.length > 0) {
                        for(const invoice of payment.invoices) {
                            // @ts-ignore
                            let invoiceJSON: any = JSON.parse(invoice.json);
                            let invoiceTotal: number = parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Total']) || '0').toString());
                            // Se revisa si el total no está en el complemento.
                            if(invoiceTotal === 0) {
                                let payments: any = idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['pago10:Pagos']);
                                if(Array.isArray(payments) && payments.length > 0) {
                                    for(const payment of payments) {
                                        invoiceTotal += parseFloat(payment['pago10:Pago']['_attributes']['Monto'] || 0);                        
                                    }
                                } else if(payments && payments.hasOwnProperty('_attributes')) {
                                    invoiceTotal = parseFloat(payments['pago10:Pago']['_attributes']['Monto'] || 0);
                                }
                            }
                            // Se suma el total al total asignado.
                            amountStamped += invoiceTotal;
                            // console.log('Total (factura): ', amountStamped);
                            // Se agrega el _id al arreglo.
                            // @ts-ignore
                            invoicesIds.push(invoice._id);
                        }
                    }
                    // console.log('Total (facturado): ', amountStamped);
                    // console.log('Total (pagado): ', payment.amountPaid);
                    if(amountStamped < payment.amountPaid) isItFullyStamped = false;                    
                    // Se revisa si el pago ha sido completamente asignado (timbrado).
                    if(isItFullyStamped) {
                        return reject({
                            status: 400,
                            module: 'Pagos',
                            message: 'El pago ya se encuentra asignado por completo.',
                        });
                    } else {

                        //BBBB   AAA  L      AAA  N   N  CCCC EEEEE
                        //B   B A   A L     A   A NN  N C     E
                        //BBBB  AAAAA L     AAAAA N N N C     EEE
                        //B   B A   A L     A   A N  NN C     E
                        //BBBB  A   A LLLLL A   A N   N  CCCC EEEEE

                        let account: Account = new Account();
                        try {
                            let balanceProcess: BalanceModel = new BalanceModel();
                            let balance = await balanceProcess.getAccountBalance({ accountNumber: payment.parentId });
                            account = balance.account;
                        } catch(error) {
                            return reject(error);
                        }
                        
                        //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA   SSSS
                        //F     A   A C       T   U   U R   R A   A S
                        //FFF   AAAAA C       T   U   U RRRR  AAAAA  SSS
                        //F     A   A C       T   U   U R   R A   A     S
                        //F     A   A  CCCC   T    UUU  R   R A   A SSSS
                        
                        let invoices: any = [];
                        let invoiceModelV2: InvoiceModelV2 = new InvoiceModelV2();
                        let invoiceErrors: any[] = [];
                        let attachments: Array<FileStructure> = [];
                        // Paso 1: Se obtiene la factura desde el pago (hecho arriba).
                        // if(payment.statusValue === 'unassigned') {

                            //M   M  AAA   GGGG IIIII  AAA       N   N EEEEE  GGGG RRRR   AAA
                            //MM MM A   A G       I   A   A      NN  N E     G     R   R A   A
                            //M M M AAAAA G  GG   I   AAAAA      N N N EEE   G  GG RRRR  AAAAA
                            //M   M A   A G   G   I   A   A      N  NN E     G   G R   R A   A
                            //M   M A   A  GGGG IIIII A   A      N   N EEEEE  GGGG R   R A   A

                            // Cantidad que no ha sido facturada.
                            let unstampedAmount: number = parseFloat((payment.amountPaid - amountStamped).toFixed(2));
                            let receiptModel: ReceiptModel = new ReceiptModel();
                            // 1. Se deben obtener los totales por facturas y por detalles.
                            // NOTE: El total por facturas ya se obtuvo arriba.
                            let detailsTotal: number = 0;
                            if(Array.isArray(payment.details) && payment.details.length > 0) {
                                for(const advancePaymentDetail of payment.details) {
                                    detailsTotal += advancePaymentDetail.amount;
                                }
                            }
                            // 2. Se revisan las siguientes condiciones:
                            // console.log('Antes de obtener las facturas.');
                            if(detailsTotal === amountStamped || detailsTotal === 0) {
                                // a) DETALLE <= FACTURADO || DETALLE === 0
                                //        - En este caso se genera sólo una PUE.

                                // return resolve({
                                //     status: 200,
                                //     data: {message: 'Caso #1: Detalle es igual a lo facturado o el detalle es 0.'}
                                // });
                                // console.log('Caso #1: Detalle es igual a lo facturado o el detalle es 0.');
                                // PUE
                                try {
                                    invoices = await invoiceModelV2.getInvoicesFromCustomInfo(payment, undefined, unstampedAmount);
                                } catch(error) {
                                    return reject(error);
                                }
                            } else if(detailsTotal > amountStamped) {
                                // b) DETALLE > FACTURADO
                                //        - En este caso se debe facturar usando el recibo que corresponda.

                                // return resolve({
                                //     status: 200,
                                //     data: {message: 'Caso #2: Detalle es mayor a lo facturado.'}
                                // });
                                // console.log('Caso #2: Detalle es mayor a lo facturado.');

                                //PPPP  RRRR   OOO   CCCC EEEEE  SSSS  OOO       M   M  AAA  M   M  AAA  L      OOO  N   N
                                //P   P R   R O   O C     E     S     O   O      MM MM A   A MM MM A   A L     O   O NN  N
                                //PPPP  RRRR  O   O C     EEE    SSS  O   O      M M M AAAAA M M M AAAAA L     O   O N N N
                                //P     R   R O   O C     E         S O   O      M   M A   A M   M A   A L     O   O N  NN
                                //P     R   R  OOO   CCCC EEEEE SSSS   OOO       M   M A   A M   M A   A LLLLL  OOO  N   N

                                let amazingProcessErrors: Array<any> = [];
                                // 1. Se obtienen todas las facturas del pago (ya vienen en el objeto).
                                // @ts-ignore
                                let paymentInvoices: Array<Invoice> = payment.invoices;
                                // 2. Se recorren todos los recibos en los detalles y se obtiene la información de cada uno.
                                //    Aquí se requiere de la factura del recibo pero también viene junto con el objeto.
                                let paymentDetails: Array<{ receiptId: string, amount: number }> = [];
                                // 3. Por cada recibo se verifica si la fatura (si tiene) está siendo referida en alguna
                                //    facura del pago.
                                // let paymentInvoicesInfo: Array<{ amount: number, relatedCFDIs: RelatedCFDI }> = [];
                                if(Array.isArray(payment.details) && payment.details.length > 0){
                                    // console.log('Se recorre el arreglo de detalles.');
                                    for(const paymentDetail of payment.details) {
                                        let _receipt: Receipt = new Receipt();
                                        try {
                                            _receipt = await receiptModel.getReceipt({ _id: paymentDetail.receiptId });
                                        } catch(error) {
                                            amazingProcessErrors.push(error);
                                        }
                                        // 4. Se revisa si el recibo tiene factura.
                                        if(!isEmpty(_receipt.invoice)) {
                                            // console.log('El recibo tiene factura.');
                                            // @ts-ignore
                                            let receiptInvoiceRelatedCFDIs = await invoiceModelV2.getInvoiceRelatedCFDIsV3({ _id: _receipt.invoice._id });
                                            // 5. Si el recibo tiene factura...
                                            if(Array.isArray(receiptInvoiceRelatedCFDIs.relatedCFDIs) && receiptInvoiceRelatedCFDIs.relatedCFDIs.length > 0) {
                                                let invoiceFound: boolean = false;
                                                for(const _relatedCFDI of receiptInvoiceRelatedCFDIs.relatedCFDIs) {
                                                    for(const _paymentInvoice of paymentInvoices) {
                                                        if(_paymentInvoice._id === _relatedCFDI._id) {
                                                            invoiceFound = true;
                                                            break;
                                                        }
                                                    }
                                                }
                                                if(invoiceFound) {
                                                    // ... y está relacionada a una factura del pago se descarta.
                                                    // Nothing to do here ¯\_(ツ)_/¯
                                                } else {
                                                    // ... y NO está relacionada a una factura del pago se agrega el monto
                                                    // a lo facturable como COMPLEMENTO.

                                                    // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                                                    // El monto a aplicar a cada factura nueva, es el monto de cada detalle.
                                                    
                                                    if(unstampedAmount >= paymentDetail.amount) {
                                                        // paymentInvoicesInfo.push({
                                                        //     amount: paymentDetail.amount,
                                                        //     relatedCFDIs: {
                                                        //         // @ts-ignore
                                                        //         uuid: _receipt.invoice.uuid,
                                                        //         relationshipType: '01'
                                                        //     }
                                                        // });
                                                        paymentDetails.push(paymentDetail);
                                                        unstampedAmount -= paymentDetail.amount;
                                                        unstampedAmount = parseFloat(unstampedAmount.toFixed(2));
                                                    }
                                                }
                                            } else {
                                                // ... y NO está relacionada a una factura del pago se agrega el monto
                                                // a lo facturable como COMPLEMENTO.

                                                // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                                                // El monto a aplicar a cada factura nueva, es el monto de cada detalle.

                                                if(unstampedAmount >= paymentDetail.amount) {
                                                    // paymentInvoicesInfo.push({
                                                    //     amount: paymentDetail.amount,
                                                    //     relatedCFDIs: {
                                                    //         // @ts-ignore
                                                    //         uuid: _receipt.invoice.uuid,
                                                    //         relationshipType: '01'
                                                    //     }
                                                    // });
                                                    paymentDetails.push(paymentDetail);
                                                    unstampedAmount -= paymentDetail.amount;
                                                    unstampedAmount = parseFloat(unstampedAmount.toFixed(2));
                                                }
                                            }
                                        }
                                    }
                                }
                                // 6. Se revisan las facturas a crear, tanto complemento como PUE.
                                // (Por si te lo estás preguntando, los puntos 4 y 5 están dentro del punto 3.)
                                try {
                                    // console.log(payment, paymentDetails, unstampedAmount);
                                    invoices = await invoiceModelV2.getInvoicesFromCustomInfo(payment, paymentDetails, unstampedAmount);
                                    // console.log(invoices);
                                } catch(error) {
                                    return reject(error);
                                }
                            } else if(amountStamped === 0) {
                                // c) FACTURADO === 0

                                // return resolve({
                                //     status: 200,
                                //     data: {message: 'Caso #3: Facturado es igual a 0.'}
                                // });
                                // console.log('Caso #3: Facturado es igual a 0.');
                                // NORMAL
                                try {
                                    invoices = await invoiceModelV2.getInvoicesFromPayment(payment);
                                } catch(error) {
                                    return reject(error);
                                }
                            }
                        /*} else {
                            try {
                                invoices = await invoiceModelV2.getInvoicesFromPayment(payment);
                            } catch(error) {
                                return reject({
                                    status: 400,
                                    message: `Ocurrió un error al intentar obtener la(s) factura(s) desde el pago.`,
                                    error
                                });
                            }
                        }*/
                        // TESTS:
                        // return resolve({
                        //     status: 200,
                        //     data: invoices
                        // });
                        // console.log('==========================================================================');
                        // console.log('Facturas creadas: ', invoices[0].paymentComplement.payments);
                        // console.log('Facturas creadas: ', invoices[0]);
                        // Paso 2: Se timbra / guarda la factura.
                        for(const invoice of invoices) {
                            try {
                                // console.log(`[MODELOS][PAGOS][postPayment] Datos a facturar: ${JSON.stringify(invoice)}`);
                                // console.log('[MODELOS][PAGOS][postPayment] Datos a facturar: ', invoice);
                                // TODO: Revisar que el objeto 'invoice' contenga lo siguiente:
                                // invoice
                                // [X] account
                                // [X] client
                                // [X] concepts
                                // [X] relatedCfdis
                                // [X] paymentComplement
                                // [X] returnFiles
                                invoice.returnFiles = true;
                                let invoiceV2 = await invoiceModelV2.postInvoice(invoice);
                                invoicesIds.push(invoiceV2._id);
                                // Se revisan los archivos recibidos y se agregan al arreglo de archivos adjuntos.
                                // XML.
                                let xmlFile: string = (idx(invoiceV2, _ => _.files.xml) || '').toString();
                                if(typeof xmlFile === 'string' && xmlFile.length > 0) {
                                    // NOTE: Se debe convertir a base64, ya que el archivo viene literalemnte en texto.
                                    let xmlBuffer: Buffer = Buffer.from(xmlFile, 'utf8');
                                    let xmlBase64: string = xmlBuffer.toString('base64');
                                    attachments.push({
                                        type: 'application/xml',
                                        name: 'Factura.xml',
                                        content: xmlBase64
                                    });
                                }
                                // PDF.
                                let pdfFile: string = (idx(invoiceV2, _ => _.files.pdf) || '').toString();
                                if(typeof pdfFile === 'string' && pdfFile.length > 0) {
                                    attachments.push({
                                        type: 'application/pdf',
                                        name: 'Factura.pdf',
                                        content: pdfFile
                                    });
                                }
                            } catch(error) {
                                invoiceErrors.push(error);
                            }
                        }
                        
                        //EEEEE M   M  AAA  IIIII L
                        //E     MM MM A   A   I   L
                        //EEE   M M M AAAAA   I   L
                        //E     M   M A   A   I   L
                        //EEEEE M   M A   A IIIII LLLLL
                        
                        let accountProcessesModel: AccountProcessesModel = new AccountProcessesModel();
                        let mailingErrors: Array<any> = [];
                        if(attachments.length > 0) {
                            let data: any = {
                                accountNumber: account.accountNumber,
                                attachments,
                                template: 'client_notification',
                                content: [
                                    {
                                        name: 'message',
                                        content: 'Por medio del presente correo le hacemos llegar su estado de cuenta del mes.'
                                    }
                                ],
                                subject: `Domain Estado de cuenta ${account.accountNumber}.`
                            };
                            try {
                                await accountProcessesModel.sendEmail(data);
                            } catch(error) {
                                mailingErrors.push(error);
                            }
                        }

                        //PPPP   AAA   GGGG  OOO
                        //P   P A   A G     O   O 
                        //PPPP  AAAAA G  GG O   O
                        //P     A   A G   G O   O
                        //P     A   A  GGGG  OOO

                        // Se debe actualizar el pago con el detalle y número de factura.
                        try{
                            let data: any = { 
                                _id: payment._id,
                                statusValue: invoiceErrors.length === 0 ? 'assigned' : payment.statusValue,
                                invoices: invoicesIds
                            };
                            let updatedPayment = await this.putPayment(data);
                            return resolve({
                                status: 200, 
                                data: {
                                    payment: updatedPayment,
                                    invoiceErrors,
                                    mailingErrors
                                }
                            });
                        } catch(error) {
                            return resolve({
                                status: 206,
                                data: {
                                    message: 'No se pudo actualizar la información de la factura dentro del pago.',
                                    invoices: invoicesIds
                                }
                            });
                        }
                    }
                // })
                // .catch((error: any) => {
                //     return reject({
                //         status: 400,
                //         error
                //     });
                // });
            } else {
                return reject({
                    status: 404,
                    module: 'Pagos',
                    message: 'No se encontró ningún identificador en la petición.',
                });
            }
        });
    }

    public postPaymentManualAssignment = (body: any): Promise<any> => {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let { _id, id, relatedCfdis, receiptsToPay, ...rest } = body;
            _id = _id ? _id : id;
            
            // a) Se revisa que se haya enviado un identificador de pago.
            if(typeof _id != 'string' || _id === '') {
                return reject({
                    status: 404,
                    module: 'Pagos',
                    message: 'No se encontró ningún identificador en la petición.',
                });
            }
            // b) Se revisa que se haya enviado al menos un recibo.
            if(!Array.isArray(receiptsToPay) || receiptsToPay.length ===0) {
                return reject({
                    status: 404,
                    module: 'Pagos',
                    message: 'No se encontró ningún recibo en la petición.',
                });
            }

            //PPPP   AAA   GGGG  OOO
            //P   P A   A G     O   O
            //PPPP  AAAAA G  GG O   O
            //P     A   A G   G O   O
            //P     A   A  GGGG  OOO

            let payment: Payment;
            try {
                payment = await this.getPayment({ _id });
            } catch(error) {
                return reject(error);
            }

            // Se revisa que exista un identificador padre (que ya esté asignado a una cuenta).
            if(typeof payment.parentId != 'string' || payment.parentId.length === 0) {
                return reject({
                    status: 400,
                    module: 'Pagos',
                    message: 'El pago no está asignado a ninguna cuenta.',
                });
            }
            
            // CCCC U   U EEEEE N   N TTTTT  AAA        AAA   CCCC TTTTT IIIII V   V  AAA
            //C     U   U E     NN  N   T   A   A      A   A C       T     I   V   V A   A
            //C     U   U EEE   N N N   T   AAAAA      AAAAA C       T     I   V   V AAAAA
            //C     U   U E     N  NN   T   A   A      A   A C       T     I    V V  A   A
            // CCCC  UUU  EEEEE N   N   T   A   A      A   A  CCCC   T   IIIII   V   A   A

            let accountModel = new AccountModel();
            // @ts-ignore
            accountModel.isAccountActive(payment.parentId)
            .then( async (result: boolean) => {
                // Se revisa si existe ya una factura o recibos asignados al pago.
                if((Array.isArray(payment.invoices) && payment.invoices.length > 0) || (Array.isArray(payment.details) && payment.details.length > 0)) {
                    return reject({
                        status: 400,
                        module: 'Pagos',
                        message: 'El pago ya cuenta con una factura o pagos asignados.',
                    });
                } else {

                    //BBBB   AAA  L      AAA  N   N  CCCC EEEEE
                    //B   B A   A L     A   A NN  N C     E
                    //BBBB  AAAAA L     AAAAA N N N C     EEE
                    //B   B A   A L     A   A N  NN C     E
                    //BBBB  A   A LLLLL A   A N   N  CCCC EEEEE

                    let balance: any = {};
                    let pendingReceipts: Array<any> = [];
                    try {
                        let balanceProcess: BalanceModel = new BalanceModel();
                        balance = await balanceProcess.getAccountBalance({ accountNumber: payment.parentId });
                        pendingReceipts = Array.isArray(balance.pendingReceipts) ? balance.pendingReceipts : [];
                    } catch(error) {
                        return reject(error);
                    }

                    //RRRR  EEEEE  CCCC IIIII BBBB   OOO   SSSS      PPPP  EEEEE N   N DDDD  IIIII EEEEE N   N TTTTT EEEEE  SSSS
                    //R   R E     C       I   B   B O   O S          P   P E     NN  N D   D   I   E     NN  N   T   E     S
                    //RRRR  EEE   C       I   BBBB  O   O  SSS       PPPP  EEE   N N N D   D   I   EEE   N N N   T   EEE    SSS
                    //R   R E     C       I   B   B O   O     S      P     E     N  NN D   D   I   E     N  NN   T   E         S
                    //R   R EEEEE  CCCC IIIII BBBB   OOO  SSSS       P     EEEEE N   N DDDD  IIIII EEEEE N   N   T   EEEEE SSSS
                    
                    // Por cada uno de los recibos enviados, se debe revisar que existan dentro de los pendientes.
                    // Restar lo pagado, verificar lo faltante, y asignar el pago.
                    let paymentDetails: Array<any> = [];
                    let receiptsToUpdate: string[] = [];
                    let remainingAmount: number = payment.amountPaid;
                    let receiptsErrors: any[] = [];
                    if(Array.isArray(pendingReceipts) && pendingReceipts.length > 0) {

                        // 1) Se deben filtrar los recibos que se desean pagar de los recibos pendientes.
                        let receiptsToActuallyPay: Array<any> = [];
                        for(const _receiptToPay of receiptsToPay) {
                            let receiptFound: boolean = false;
                            for(const _pendingReceipt of pendingReceipts) {
                                if(_receiptToPay === _pendingReceipt._id) {
                                    receiptFound = true;
                                    receiptsToActuallyPay.push(_pendingReceipt);
                                    break;
                                }
                            }
                            if(!receiptFound) {
                                receiptsErrors.push({
                                    id: _receiptToPay,
                                    message: 'El recibo no se encuentra dentro de los pendientes de pago.'
                                })
                            }
                        }
                        if(receiptsToActuallyPay.length === 0) {
                            return reject({
                                status: 400,
                                message: `Pagos | Ninguno de los recibos enviados se encuentra pendiente.`
                            });
                        }
                        // 2) Se obtienen los detalles del pago.
                        let index: number = 0;
                        while(remainingAmount > 0 && index < receiptsToActuallyPay.length) {
                            
                            // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA TURBO 9000:
                            // No se debe, repito, NO SE DEBE revisar si se salda el total del recibo solamente, ya que
                            // el recibo puede tener pagos anteriores, hay que restar estos al total y después revisar si
                            // se puede saldar.

                            // Esto es culpa del déficit de atención de -Francisco Rodríguez-, si lo ves regalale un chocolate.

                            let pendingReceiptTotal: number = receiptsToActuallyPay[index].total || 0;
                            let pendingReceiptPayments: number = 0;
                            if(Array.isArray(receiptsToActuallyPay[index].payments) && receiptsToActuallyPay[index].payments.length > 0) {
                                receiptsToActuallyPay[index].payments.forEach((amount: number) => {
                                    pendingReceiptPayments += amount;
                                });
                            }
                            pendingReceiptTotal -= pendingReceiptPayments;
                            pendingReceiptTotal = pendingReceiptTotal < 0 ? 0 : pendingReceiptTotal;
                            // Se revisa la cantidad que se puede saldar del recibo.
                            if(remainingAmount >= pendingReceiptTotal) {
                                // Si se puede cubrir el recibo completo.
                                paymentDetails.push({
                                    receiptId: receiptsToActuallyPay[index]._id,
                                    amount: pendingReceiptTotal
                                });
                                // Se resta el total del recibo al total retante.
                                remainingAmount -= pendingReceiptTotal;
                                // IMPORTANTE: Faltaba agregar el recibo al arreglo de los que se pueden saldar.
                                receiptsToUpdate.push(receiptsToActuallyPay[index]._id);
                            } else {
                                // console.log(`[MODELOS][PAGOS][postPayment] No se puede saldar el recibo: ${receiptsToActuallyPay[index]._id}`);
                                // Se agrega un movimiento con el total restante si no logra cubri el recibo.
                                paymentDetails.push({
                                    receiptId: receiptsToActuallyPay[index]._id,
                                    amount: remainingAmount
                                });
                                remainingAmount -= remainingAmount;
                            }
                            index++;
                        }
                        payment.details = paymentDetails;
                    }

                    //RRRR  EEEEE  SSSS TTTTT  AAA  N   N TTTTT EEEEE
                    //R   R E     S       T   A   A NN  N   T   E
                    //RRRR  EEE    SSS    T   AAAAA N N N   T   EEE
                    //R   R E         S   T   A   A N  NN   T   E
                    //R   R EEEEE SSSS    T   A   A N   N   T   EEEEE

                    // SUPER PODEROSA NINJA TURBO NEO ULTRA HYPER MEGA MULTI ALPHA META EXTRA UBER PREFIJO NOTA:
                    // Si quedó un restante del pago al liquidar todo lo pendiente, se debe generar una factura tipo PUE de ANTICIPO.
                    
                    //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA   SSSS
                    //F     A   A C       T   U   U R   R A   A S
                    //FFF   AAAAA C       T   U   U RRRR  AAAAA  SSS
                    //F     A   A C       T   U   U R   R A   A     S
                    //F     A   A  CCCC   T    UUU  R   R A   A SSSS
                    
                    let invoiceModelV2: InvoiceModelV2 = new InvoiceModelV2();
                    let invoiceErrors: any[] = [];
                    let invoices: any = [];
                    // Paso 1: Se obtiene la factura desde el pago.
                    try {
                        payment.details = paymentDetails;
                        invoices = await invoiceModelV2.getInvoicesFromPayment(payment);
                    } catch(error) {
                        return reject(error);
                    }
                    // Paso 2: Se timbra / guarda la factura.
                    let invoicesIds: Array<string> = [];
                    for(const invoice of invoices) {
                        try {
                            // console.log(`[MODELOS][PAGOS][postPayment] Datos a facturar: ${JSON.stringify(invoice)}`);
                            // TODO: Revisar que el objeto 'invoice' contenga lo siguiente:
                            // invoice
                            // [X] account
                            // [X] client
                            // [X] concepts
                            // [X] relatedCfdis
                            // [X] paymentComplement
                            // [ ] returnFiles
                            let invoiceV2 = await invoiceModelV2.postInvoice(invoice);
                            invoicesIds.push(invoiceV2._id);
                        } catch(error) {
                            invoiceErrors.push(error);
                        }
                    }
                    
                    //PPPP   AAA   GGGG  OOO
                    //P   P A   A G     O   O 
                    //PPPP  AAAAA G  GG O   O
                    //P     A   A G   G O   O
                    //P     A   A  GGGG  OOO

                    // Se debe actualizar el pago con el detalle y número de factura.
                    let paymentErrors: any[] = [];
                    let updatedPayment: any = {};
                    try{
                        let data: any = { 
                            _id: payment._id,
                            details: paymentDetails,
                            statusValue: remainingAmount > 0 ? 'advanced' : 'assigned'
                        };
                        if(invoicesIds.length > 0) data['invoices'] = invoicesIds;
                        updatedPayment = await this.putPayment(data);
                    } catch(error) {
                        paymentErrors.push(error);
                    }

                    //RRRR  EEEE  CCCC IIIII BBBB   OOO   SSSS
                    //R   R E    C       I   B   B O   O S
                    //RRRR  EEE  C       I   BBBB  O   O  SSS
                    //R   R E    C       I   B   B O   O     S
                    //R   R EEEE  CCCC IIIII BBBB   OOO  SSSS

                    // Se deben actualizar los recibos pagados.
                    if(receiptsToUpdate.length > 0) {
                        receiptsToUpdate.forEach( async (id: string) => {
                            try{
                                let receiptModel: ReceiptModel = new ReceiptModel();
                                let updatedReceipt = await receiptModel.putReceipt({ _id: id, statusValue: 'paid' });
                            } catch(error) {
                                receiptsErrors.push(error);
                            }
                        });
                    }

                    //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
                    //R   R E     S     U   U L       T   A   A D   D O   O
                    //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
                    //R   R E         S U   U L       T   A   A D   D O   O
                    //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

                    let result: any = Object.assign({}, updatedPayment);
                    // result.paymentDetails = paymentDetails;
                    result.updatedReceipts = receiptsToUpdate;
                    result.errors = {};
                    result.errors.paymentErrors = paymentErrors;
                    result.errors.receiptsErrors = receiptsErrors;
                    result.errors.invoiceErrors = invoiceErrors;
                    return resolve({
                        status: (receiptsErrors.length > 0 || invoiceErrors.length > 0) ? 206 : 200,
                        data: result
                    });
                }
            })
            .catch((error: any) => {
                return reject({
                    status: 400,
                    error
                });
            });
        });
    }

    public postPaymentInvoicesCancellation(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let { ...filters }: any = body;

            //PPPP   AAA   GGGG  OOO   SSSS
            //P   P A   A G     O   O S
            //PPPP  AAAAA G  GG O   O  SSS
            //P     A   A G   G O   O     S
            //P     A   A  GGGG  OOO  SSSS

            let getPayments: { results: Array<Payment>, summary: any } = { results: [], summary: {} };
            try {
                getPayments = await this.getPayments(filters);
            } catch(error) {
                return reject(error);
            }
            // Se recorren todos los pagos...
            if(getPayments.results.length > 0) {
                let invoices2Cancel: Array<string> = [];
                let cancelledInvoices: number = 0;
                let cancellationErrors: Array<any> = [];
                for(const payment of getPayments.results) {
                    if(Array.isArray(payment.invoices) && payment.invoices.length > 0) {

                        //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA   SSSS
                        //F     A   A C       T   U   U R   R A   A S
                        //FFF   AAAAA C       T   U   U RRRR  AAAAA  SSS
                        //F     A   A C       T   U   U R   R A   A     S
                        //F     A   A  CCCC   T    UUU  R   R A   A SSSS

                        // Se cancelan todas las facturas asociadas al pago.
                        // @ts-ignore
                        let invoices: Array<Invoice> = payment.invoices as Array<Invoice>;
                        let invoiceModelV2: InvoiceModelV2 = new InvoiceModelV2();
                        for(const invoice of invoices) {
                            invoices2Cancel.push(invoice._id as string);
                            // Cancelación.
                            // TODO: Reactivar después de las preubas.
                            try {
                                await invoiceModelV2.postInvoiceCancellation({ _id: invoice._id });
                                cancelledInvoices++;
                            } catch(error) {
                                cancellationErrors.push(error);
                            }
                        }

                        // AAA   CCCC TTTTT U   U  AAA  L     IIIII ZZZZZ  AAA   CCCC IIIII  OOO  N   N
                        //A   A C       T   U   U A   A L       I      Z  A   A C       I   O   O NN  N
                        //AAAAA C       T   U   U AAAAA L       I     Z   AAAAA C       I   O   O N N N
                        //A   A C       T   U   U A   A L       I    Z    A   A C       I   O   O N  NN
                        //A   A  CCCC   T    UUU  A   A LLLLL IIIII ZZZZZ A   A  CCCC IIIII  OOO  N   N

                        // Se actualiza el estatus del pago.
                        // TODO: Reactivar después de las preubas.
                        // try {
                        //     await this.putPayment({ _id: payment._id, statusValue: 'error' });
                        // } catch(error) {
                        //     updateErrors.push(error);
                        // }
                    }
                }

                //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
                //R   R E     S     U   U L       T   A   A D   D O   O
                //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
                //R   R E         S U   U L       T   A   A D   D O   O
                //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

                return resolve({
                    status: 200,
                    payments: getPayments.results,
                    summary: {
                        payments: getPayments.results.length,
                        invoices: invoices2Cancel.length,
                        cancelledInvoices
                    },
                    errors: cancellationErrors
                });
            } else {
                return reject({
                    status: 404,
                    message: 'No se encontró ningún pago con los parámetros enviados.'
                });
            }
        });
    }

    //TTTTT  OOO  TTTTT  AAA  L     EEEEE  SSSS
    //  T   O   O   T   A   A L     E     S
    //  T   O   O   T   AAAAA L     EEE    SSS
    //  T   O   O   T   A   A L     E         S
    //  T    OOO    T   A   A LLLLL EEEEE SSSS

    public getPaymentsTotal(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.finance.payments.getPaymentsTotal, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Pagos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Pagos',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public getPayments4ReceiptTotal(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.finance.payments.getPayments4ReceiptTotal, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data[0]) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Pagos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Pagos',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    public getPayments4ReceiptsTotal(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.finance.payments.getPayments4ReceiptsTotal, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data[0]) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Pagos',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Pagos',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

    //RRRR  EEEEE PPPP   OOO  RRRR  TTTTT EEEEE  SSSS
    //R   R E     P   P O   O R   R   T   E     S
    //RRRR  EEE   PPPP  O   O RRRR    T   EEE    SSS
    //R   R E     P     O   O R   R   T   E         S
    //R   R EEEEE P      OOO  R   R   T   EEEEE SSSS

    public async getCollectionReport(request: Request, response: Response): Promise<any> {
        // return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            // Son 4 líneas por registro por que pues contabilidad ¯\_ʕ•ᴥ•ʔ_/¯.
            // ┌───────────┬────────────────────────────────────┬───────────┬───────────┬────────────┬────────────────────────────────────┐
            // │  Cuenta   │               Nombre               │   Cargo   │   Abono   │ Referencia │              Concepto              │
            // ├───────────┼────────────────────────────────────┼───────────┼───────────┼────────────┼────────────────────────────────────┤
            // │ 110010002 │              Bancomer              │ $5,921.89 │    ---    │   13999    │ ${Referencia}${Nombre del Cliente} │
            // ├───────────┼────────────────────────────────────┼───────────┼───────────┼────────────┼────────────────────────────────────┤
            // │ 110046430 │ ${Referencia}${Nombre del Cliente} │    ---    │ $5,921.89 │   13999    │ ${Referencia}${Nombre del Cliente} │
            // ├───────────┼────────────────────────────────────┼───────────┼───────────┼────────────┼────────────────────────────────────┤
            // │ 210050002 │     IVA Pendiente de Trasladar     │  $816.81  │    ---    │   13999    │ ${Referencia}${Nombre del Cliente} │
            // ├───────────┼────────────────────────────────────┼───────────┼───────────┼────────────┼────────────────────────────────────┤
            // │ 210050001 │           IVA Trasladado           │    ---    │  $816.81  │   13999    │ ${Referencia}${Nombre del Cliente} │
            // └───────────┴────────────────────────────────────┴───────────┴───────────┴────────────┴────────────────────────────────────┘

            // NOTE: Se pasan los parámetros como se reciben.
            // let { paymentDate, ...rest }: { paymentDate: string } & any = query;
            // let params = {
            //     paymentDate
            // };
            let getPayments: { results: Array<Payment>, summary: any } = { results: [], summary: {} };
            try {
                getPayments = await this.getPayments(request.query);
            } catch(error) {
                response.status(400).end(JSON.stringify(error));
            }
            // Se escribe la primera sección de la respuesta.
            response.write('{ "results": [');
            // Se recorren todos los resultados uno x uno.
            // let report: Array<ICollectionReport> = [];
            let errors: Array<any> = [];
            let lines: number = 0;
            for(const payment of getPayments.results) {
                if(['cancelled', 'error'].indexOf(payment.statusValue) < 0) {
                    // Línea #1.
                    // TODO: Preguntar como ↓
                    // a) Se debe obtener a cuál banco se hizo el pago (Bancomer, Banorte, etc.).
                    // b) Se debe obtener el nombre del cliente.
                    // c) Se debe obtener el total sin IVA.

                    let amountWithoutTaxes: number = parseFloat((payment.amountPaid / 1.16).toFixed(2));

                    // CCCC U   U EEEEE N   N TTTTT  AAA
                    //C     U   U E     NN  N   T   A   A
                    //C     U   U EEE   N N N   T   AAAAA
                    //C     U   U E     N  NN   T   A   A
                    // CCCC  UUU  EEEEE N   N   T   A   A

                    let accountModel: AccountModel = new AccountModel();
                    let account: Account = new Account();
                    let client: Client = new Client();
                    if(payment.parentType === 'account') {
                        try {
                            account = await accountModel.getAccount({ accountNumber: payment.parentId });
                            client = account.client || new Client();
                        } catch(error) {
                            errors.push(error);
                            continue;
                        }
                    } else {
                        continue;
                    }

                    //RRRR  EEEEE FFFFF EEEEE RRRR  EEEEE N   N  CCCC IIIII  AAA   SSSS
                    //R   R E     F     E     R   R E     NN  N C       I   A   A S
                    //RRRR  EEE   FFF   EEE   RRRR  EEE   N N N C       I   AAAAA  SSS
                    //R   R E     F     E     R   R E     N  NN C       I   A   A     S
                    //R   R EEEEE F     EEEEE R   R EEEEE N   N  CCCC IIIII A   A SSSS

                    // TODO: Tomar los datos del 'internalAccountNumber'.
                    let reference: string = payment.reference || '--';
                    // @ts-ignore
                    let referenceName: string = idx(payment.internalAccountNumber, _ => _.bank.name) || '--';
                    // for(const paymentReference of account.paymentReferences) {
                    //     if(typeof  paymentReference.reference === 'string' && reference === paymentReference.reference) {
                    //         referenceName = paymentReference.referenceName;
                    //     }
                    // }
                    // @ts-ignore
                    let bankContPAQiAccount: string = idx(payment.internalAccountNumber, _ => _.bank.contPAQiAccount) || '--';

                    // NOTE: Si no tiene nombre comercial sería el nomber "normal".
                    let clientName: string = idx(client.businessData, _ => _.businessName) || `${client.firstName} ${client.secondName} ${client.firstLastName} ${client.secondLastName}`;
                    clientName = clientName.replace(/\s+/g, ' ').trim();
                    let clientAccountNumber: string = idx(client.accountingData, _ => _.generalAccountNumber) || '--';
                    let concept: string = `${(reference !== '--' ? `${reference} ` : '')}${clientName}`;
                    response.write(`${(lines > 0 ? ',' : '')}${JSON.stringify({
                        // NOTE: Debe venir dentro de la información del banco en el pago.
                        account: bankContPAQiAccount,                            // NOTE: Según yo es la cuenta que tienen asignada en ContPAQi.
                        name: referenceName,
                        charge: `$${currencyFormat.format(amountWithoutTaxes)}`,
                        payment: '--',
                        reference,
                        concept
                    })}`);
                    lines++;

                    // Línea #2.
                    response.write(`${(lines > 0 ? ',' : '')}${JSON.stringify({
                        account: clientAccountNumber,
                        name: concept,
                        charge: '--',
                        payment: `$${currencyFormat.format(amountWithoutTaxes)}`,
                        reference,
                        concept
                    })}`);
                    lines++;

                    // Línea #3.
                    // d) Se debe obtener el IVA.

                    let taxes: number = parseFloat((payment.amountPaid - amountWithoutTaxes).toFixed(2));
                    response.write(`${(lines > 0 ? ',' : '')}${JSON.stringify({
                        account: configuration.contPAQi.pendingTaxes, // '21005002',
                        name: 'IVA Pendiente de Trasladar',
                        charge: `$${currencyFormat.format(taxes)}`,
                        payment: '--',
                        reference,
                        concept
                    })}`);
                    lines++;

                    // Línea #4.
                    response.write(`${(lines > 0 ? ',' : '')}${JSON.stringify({
                        account: configuration.contPAQi.transferredTaxes, // '21005001',
                        name: 'IVA Trasladado',
                        charge: '--',
                        payment: `$${currencyFormat.format(taxes)}`,
                        reference,
                        concept
                    })}`);
                    lines++;
                }
            }
            // TODO: Agregar la sección "summary"... no sé, tal vez... piénsalo...
            // FIXME: La sección "summary" debe ser personalizada al proceso, ya que no se puede enviar el de obtención de pagos.
            // NOTE: El total y las páginas si se pueden usar del "summary" de pagos.
            // Pagina anterior.
            let previousPage: string = '';
            if(getPayments.summary.currentPage > 1) {
                let previousPageParameters = Object.assign({}, request.query);
                previousPageParameters['page'] = getPayments.summary.currentPage - 1;
                previousPage = `${request.path}${buildQuery(previousPageParameters)}`;
            }
            // Pagina siguiente.
            let nextPage = '';
            if(getPayments.summary.currentPage < getPayments.summary.pages) {
                let nextPageParameters = Object.assign({}, request.query);
                nextPageParameters['page'] = getPayments.summary.currentPage + 1;
                nextPage = `${request.path}${buildQuery(nextPageParameters)}`;
            }
            // Resumen.
            let summary = {
                total: getPayments.summary.total,
                pages: getPayments.summary.pages,
                currentPage: getPayments.summary.currentPage,
                nextPage,
                previousPage
            };
            // Se escribe el resumen en la respuesta.
            response.write(`], "summary": ${JSON.stringify(summary)}}`);
            // Se termina el proceso.
            response.end();
        // });
    }
}