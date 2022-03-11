// Módulos.
import { Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import idx, { IDXOptional } from 'idx';
// Funciones.
import { date2StringFormat, number2Month } from '../scripts/dates';
import { currencyFormat, number2Words } from '../scripts/numbers';
import { IsString, MaxLength, validate, IsMongoId, IsDateString, IsNumber, IsEnum, IsArray, Min, IsDefined, IsNotEmpty } from 'class-validator';
import { RemodelErrors } from '../scripts/data-management';
import { pdf2Base64 } from '../classes/pdf';
// Configuración.
import configuration from '../configuration';
// Constantes.
import { CATALOGS } from '../constants/constants';
// Modelos.
import AccountModel, { Account } from './accounts';
import AccountProcessesModel from './processes/accounts';
import BalanceModel, { IUglyBalance } from './processes/balance';
import FilesModel from './files';
import { FileStructure } from './notifications';
import InvoiceModel, { Invoice } from './invoices';
import InvoiceModelV2, { Invoice as InvoiceV2, RelatedCFDI, Concept } from './invoicesV2';
import PaymentModel, { CardDetails, Payment } from './payments';
import { Client } from './clients';
import { isEmpty } from '../scripts/object-prototypes';
import ConektaModel, { IRetailOrder, IProduct } from './conekta/apis';
import { Contact } from './contacts';

export class Receipt {
    // Identificador.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    _id?: string;
    // Identificador del catálogo padre.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
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
    // Folio.
    // NOTE: El folio se asigna de manera automática dentro del servicio a partir de la versión 1.7.3
    /*
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    */
    @IsNumber({},{
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    folio: number;
    // Fecha del movimiento.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsDateString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    movementDate: string;    
    // Conceptos (ITEMS).
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsArray({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    items: Array<Item>;
    // Cantidad total.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    total: number;
    // Subtotal.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    subTotal: number;
    // I.V.A.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    taxes: number;
    // Descuento.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    discount: number;
    // Tipo de cambio al día.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    exchangeRate: number;
    // Moneda.
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
    currencyValue: string;
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
    // Arhivo adjunto.
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(120, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    receiptFile?: string;
    // Factura.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    invoice?: string;
    // Balance anterior.
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    previousBalance?: number = 0;
    // Tipo de operación (se utiliza para recibos de ODX).
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    operationType?: string;
    // Identificador del catálogo de la operación (se utiliza para recibos de ODX).
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(70, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    operationId?: string;
}

export class Item {
    // Identificador.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    _id?: string;
    // Identificador del producto.
    // @IsDefined({
    //     message: 'El campo es requerido.'
    // })
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    productId?: string;
    // Nombre del producto.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(1000, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    productName: string;
    // Cantidad.
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    quantity?: number;
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
    // Clave de unidad.
    @IsDefined({
        message: 'El campo es requerido.',
		groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
		groups: ['POST', 'PUT']
    })
    unitCve?: string = 'E48';
    // Descuento.
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    discount?: number;
    // Total.
    @IsNumber({ allowNaN: false }, {
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @Min(0, {
        message: 'El valor no puede ser negativo.',
        groups: ['POST', 'PUT']
    })
    total?: number;
    // Clave del producto para SAT.
    // @IsDefined({
    //     message: 'El campo es requerido.',
    //     groups: ['POST']
    // })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @IsNotEmpty({
        message: 'El campo no puede estar vacío.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(20, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    satProductCode?: string = '81161700';
    // Llave (sólo se utiliza en la generación de facturas)
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    key?: string;
}

export interface IPendingReceipt {
    receipt?: Receipt;
    folio?: number;
    accountNumber: string;
    clientFolio: number;
    creditedAmount: number;
    paidAmount: number;
    pendingAmount: number;
}

interface IInvoiceV1EX extends Invoice {
    files: {
        pdf: string;
        xml: string;
    }
}

// DELETE:
interface IInvoiceConcept {
    '_attributes': {
        ClaveProdServ: string;
        NoIdentificacion: string;
        Cantidad: string;
        ClaveUnidad: string;
        Descripcion: string;
        ValorUnitario: string;
        Importe: string;
    },
    'cfdi:Impuestos': {
        'cfdi:Traslados': {
            'cfdi:Traslado': {
                '_attributes': {
                    Base: string;
                    Impuesto: string;
                    TipoFactor: string;
                    TasaOCuota: string;
                    Importe: string;
                }
            }
        }
    }
}

export default class ReceiptModel {
    
    //Propiedades.
    private receipt: any;

    // Constructor.
    constructor(receipt?: any) {
        this.receipt = receipt;
    }
    
    //Métodos.

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        let { items, ...receipt } = this.receipt;
        items = Array.isArray(items) ? items : [];
        return this.validateSchemas(receipt, items);
    }

    private async validateSchemas(_receipt: any = {}, _items: Array<any> = [], groups: Array<string> = ['POST']): Promise<any[]> {
        
        _items = Array.isArray(_items) ? _items : [];
        let errors: Array<any> = [];
        
        // RECIBO.
        let receipt = new Receipt();
        receipt.parentId = _receipt.parentId;
        receipt.parentType = _receipt.parentType;
        receipt.folio = _receipt.folio;
        receipt.movementDate = _receipt.movementDate;
        receipt.items = _items;
        receipt.total = _receipt.total;
        receipt.subTotal = _receipt.subTotal;
        receipt.taxes = _receipt.taxes;
        receipt.discount = _receipt.discount;
        receipt.exchangeRate = _receipt.exchangeRate;
        receipt.currencyValue = _receipt.currencyValue;
        receipt.statusValue = _receipt.statusValue;
        receipt.typeValue = _receipt.typeValue;
        receipt.receiptFile = _receipt.receiptFile;
        receipt.invoice = _receipt.invoice;
        receipt.previousBalance = _receipt.previousBalance;
        receipt.operationType = _receipt.operationType;
        receipt.operationId = _receipt.operationId;
        let receiptErrors = await validate(receipt, { groups, skipMissingProperties: true });
        errors = errors.concat(RemodelErrors(receiptErrors, 'receipt'));
        // CONCEPTOS.
        if(_items.length > 0) {
            _items.forEach( async (_item: any, index: number) => {
                let item = new Item();
                item.productId = _item.productId;
                item.productName = _item.productName;
                item.quantity = _item.quantity;
                item.discount = _item.discount;
                item.unitCost = _item.unitCost;
                item.unitCve = _item.unitCve;
                item.total = _item.total;
                item.satProductCode = _item.satProductCode;
                let itemErrors = await validate(item, { groups, skipMissingProperties: true });
                errors = errors.concat(RemodelErrors(itemErrors, `receipt.items[${index}]`));
            });
        }
        
        return errors;
    }
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getReceipt(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.finance.receipts.getReceipt, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
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
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }
    
    public getReceipts(query: any): Promise<any> {
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
            axios.get(configuration.services.domain.finance.receipts.getReceipts, { params })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || []);
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

    public postReceipt = (body: any): Promise<any> => {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let { /*items, stamp,*/ isFromInstallation, ...receipt }: { /*items: Array<Item>, stamp: boolean,*/ isFromInstallation: boolean } & Receipt =  body;
            // stamp = (typeof stamp === 'boolean') ? stamp : false;
            isFromInstallation = (typeof isFromInstallation === 'boolean') ? isFromInstallation : false;
            let receiptTotal: number = receipt.total;
            
            // CCCC U   U EEEEE N   N TTTTT  AAA        AAA   CCCC TTTTT IIIII V   V  AAA
            //C     U   U E     NN  N   T   A   A      A   A C       T     I   V   V A   A
            //C     U   U EEE   N N N   T   AAAAA      AAAAA C       T     I   V   V AAAAA
            //C     U   U E     N  NN   T   A   A      A   A C       T     I    V V  A   A
            // CCCC  UUU  EEEEE N   N   T   A   A      A   A  CCCC   T   IIIII   V   A   A

            let accountModel = new AccountModel();
            let isActive: boolean = false;
            try {
                isActive = await accountModel.isAccountActive(receipt.parentId);
            } catch(error) {
                isActive = false;
            }
            if(isActive || isFromInstallation) {

                //BBBB   AAA  L      AAA  N   N  CCCC EEEEE
                //B   B A   A L     A   A NN  N C     E
                //BBBB  AAAAA L     AAAAA N N N C     EEE
                //B   B A   A L     A   A N  NN C     E
                //BBBB  A   A LLLLL A   A N   N  CCCC EEEEE
                
                let balance: any = {};
                let account: Account = new Account();
                let client: Client = new Client();
                try {
                    let balanceModel: BalanceModel = new BalanceModel();
                    // balance = await balanceModel.getAccountBalance({ accountNumber: receipt.parentId });
                    balance = await balanceModel.getAccountFullBalanceUGLY({ accountNumber: receipt.parentId });
                    account = balance.account;
                    client = balance.client;
                } catch(error) {
                    return reject(error);
                }
                // NOTE: El signo está invertido en el nuevo balance.
                // console.log('RECIBO - Balance total: ', balance.total);
                if(balance.total > 0) {

                    // AAA  N   N TTTTT IIIII  CCCC IIIII PPPP   OOO   SSSS
                    //A   A NN  N   T     I   C       I   P   P O   O S
                    //AAAAA N N N   T     I   C       I   PPPP  O   O  SSS
                    //A   A N  NN   T     I   C       I   P     O   O     S
                    //A   A N   N   T   IIIII  CCCC IIIII P      OOO  SSSS

                    let paymentModel: PaymentModel = new PaymentModel();
                    let advancedPayments: { results: Array<Payment>, summary: any } = { results: [], summary: {} };
                    let payments2Update: Array<any> = [];
                    try {
                        let filters: any = {
                            parentType: 'account',
                            parentId: receipt.parentId,
                            statusValue: ['advanced', 'credit', 'paid', 'unassigned']
                        };
                        advancedPayments = await paymentModel.getPayments(filters);
                    } catch(error) {
                        return reject(error);
                    }
                    // console.log('RECIBO - Número de anticipos: ', advancedPayments.results.length);
                    if(advancedPayments.results.length > 0) {
                        // Se recorren todos los pagos adelantados.
                        let advancedIndex: number = 1;
                        for(const advancedPayment of advancedPayments.results) {
                            // 1. Se debe obtener el monto disponible (no asignado) el pago.
                            let unassignedAmount: number = advancedPayment.amountPaid;
                            // TODO: Se obtiene con base en los detalles, se debe obtener con base en las facturas.
                            switch(advancedPayment.statusValue) {
                                case 'unassigned':
                                    // Total desde las facturas (para pagos sin asignación completa).
                                    if(Array.isArray(advancedPayment.invoices) && (advancedPayment.invoices || []).length > 0) {
                                        for(const invoice of (advancedPayment.invoices || [])) {
                                            // Se obtiene el total de la factura.
                                            // @ts-ignore
                                            let invoiceJSON: any = invoice.json;
                                            let invoiceTotal: number = parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Total']) || '0').toString());
                                            // Se resta el total al total disponible.
                                            unassignedAmount -= invoiceTotal;
                                        }
                                    }
                                    break;
                                default:
                                    // Total desde el detalle de los pagos (para pagos adelantados).
                                    if(Array.isArray(advancedPayment.details) && (advancedPayment.details || []).length > 0) {
                                        for(const advancePaymentDetail of (advancedPayment.details || [])) {
                                            unassignedAmount -= advancePaymentDetail.amount;
                                        }
                                    }
                                    break;
                            }
                            // console.log(`RECIBO - Cantidad sin asignar del anticipo #${advancedIndex}: `, unassignedAmount);
                            // 2. Se revisa si el monto disponible se puede aplicar al recibo.
                            // NOTE: De hecho mientras el monto disponible sea mayor a 0 se puede usar.
                            if(unassignedAmount <= receiptTotal) {
                                // Se puede asignar TODO el monto disponible.
                                // a) Se resta el monto disponible al total del recibo (para continuar con el siguiente pago).
                                receiptTotal -= unassignedAmount;
                                // b) El pago es marcado para morir, digo para agregar el recibo a los detalles.
                                payments2Update.push({
                                    _id: advancedPayment._id,
                                    details: advancedPayment.details,
                                    statusValue: advancedPayment.statusValue != 'credit' ? 'assigned' : advancedPayment.statusValue,
                                    newDetail: {
                                        // Falta el ID del recibo que se va a crear, nos estamos adelantando.
                                        amount: unassignedAmount
                                    }
                                });
                                // NOTE: Por ahora esto no aplica... hasta que lo vuelvan a pedir.
                                // c) Se revisa si el pago tiene asignada una factura tipo "ANTICIPO" (que así debería ser).
                                // 84111506 <- Es el identificador del concepto por anticipo.
                                /*
                                if(Array.isArray(advancedPayment.invoices) && advancedPayment.invoices.length > 0) {
                                    for(const advancedPaymentInvoice of advancedPayment.invoices) {
                                        try {
                                            let invoiceJSON: any = JSON.parse(advancedPaymentInvoice.json);
                                            let uuid: any = idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes']['UUID']);
                                            let invoiceConceptServiceKey: any = idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes']['ClaveProdServ']);
                                            if(typeof invoiceConceptServiceKey === 'string' && invoiceConceptServiceKey === '84111506') {
                                                // Si se encontró una factura de "ANTICIPO", se le genera una de "EGRESO" con el monto correspondiente:
                                                advancedInvoices.push({
                                                    uuid,
                                                    relationshipType: '07'
                                                });
                                                egressInvoices.push({
                                                    // invoice: invoiceJSON,
                                                    uuid,
                                                    relationshipType: '07',
                                                    amount: unassignedAmount
                                                });
                                            }
                                        } catch(error) {
                                            continue;
                                        }
                                    }
                                }
                                */
                            } else {
                                // console.log('RECIBO - Recibo saldado / pagado.');
                                // Se puede asignar sólo parte del monto.
                                // a) El pago es marcado para morir, digo para agregar el recibo a los detalles.
                                payments2Update.push({
                                    _id: advancedPayment._id,
                                    details: advancedPayment.details,
                                    statusValue: advancedPayment.statusValue,
                                    newDetail: {
                                        // Falta el ID del recibo que se va a crear, nos estamos adelantando.
                                        amount: receiptTotal
                                    }
                                });
                                // b) Al poder cubrir el total del recibo, este se vuelve 0.
                                receiptTotal = 0;
                                // NOTE: Por ahora esto no aplica... hasta que lo vuelvan a pedir.
                                // c) Se revisa si el pago tiene asignada una factura tipo "ANTICIPO" (que así debería ser).
                                // 84111506 <- Es el identificador del concepto por anticipo.
                                /*
                                if(Array.isArray(advancedPayment.invoices) && advancedPayment.invoices.length > 0) {
                                    for(const advancedPaymentInvoice of advancedPayment.invoices) {
                                        try {
                                            let invoiceJSON: any = JSON.parse(advancedPaymentInvoice.json);
                                            let uuid: any = idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes']['UUID']);
                                            let invoiceConceptServiceKey: any = idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes']['ClaveProdServ']);
                                            if(typeof invoiceConceptServiceKey === 'string' && invoiceConceptServiceKey === '84111506') {
                                                // Si se encontró una factura de "ANTICIPO", se le genera una de "EGRESO" con el monto correspondiente:
                                                advancedInvoices.push({
                                                    uuid,
                                                    relationshipType: '07'
                                                });
                                                egressInvoices.push({
                                                    // invoice: invoiceJSON,
                                                    uuid,
                                                    relationshipType: '07',
                                                    amount: receiptTotal
                                                });
                                            }
                                        } catch(error) {
                                            continue;
                                        }
                                    }
                                }
                                */
                            }
                            advancedIndex++;
                            // 3. Si ya se cubrió el total del recibo, se sale del bucle.
                            if(receiptTotal === 0) {
                                break;
                            }
                        }

                        // console.log('RECIBO - Total del recibo: ', receiptTotal);

                        //TTTTT  OOO  TTTTT  AAA  L
                        //  T   O   O   T   A   A L
                        //  T   O   O   T   AAAAA L
                        //  T   O   O   T   A   A L
                        //  T    OOO    T   A   A LLLLL

                        // Se actualizan el total y el balance anterior.
                        try {
                            receipt.previousBalance = parseFloat(balance.total);
                            if(receiptTotal === 0) receipt.statusValue = 'paid';
                        } catch(error) {
                            return reject({
                                status: 400,
                                module: 'Recibos',
                                message: 'No se pudo actualizar el total de recibo con el saldo anterior.',
                                error
                            });
                        }

                        //FFFFF  OOO  L     IIIII  OOO
                        //F     O   O L       I   O   O
                        //FFF   O   O L       I   O   O
                        //F     O   O L       I   O   O
                        //F      OOO  LLLLL IIIII  OOO
                        
                        // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                        // El folio se genera automáticamente desde el microservicio a partir de la versión 1.7.3
                        /*
                        let lastReceiptFolio: number = 1;
                        let folioFilter: any = {
                            // serie: 'A',
                            limit: 1,
                            page: 1,
                            sort: { "field": "folio", "type": "DESC" }
                        };
                        try {
                            let _receiptsResult = await this.getReceipts(folioFilter);
                            if(Array.isArray(_receiptsResult.results) && _receiptsResult.results.length > 0) {
                                lastReceiptFolio = parseInt(_receiptsResult.results[0].folio) + 1;
                            }
                        } catch(error) {
                            return reject(error);
                        } finally {
                            // Se debe completar la información del recibo.
                            receipt.folio = lastReceiptFolio;
                            // receipt.items = items;
                        }
                        */

                        // console.log('==================== RECIBO ====================');
                        // console.log(receipt);
                        
                        //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
                        //E     R   R R   R O   O R   R E     S
                        //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
                        //E     R   R R   R O   O R   R E         S
                        //EEEEE R   R R   R  OOO  R   R EEEEE SSSS

                        let errors: Array<any> = [];
                        this.validateSchemas(receipt, receipt.items)
                        .then((data: any) => {
                            errors = data;
                        });
                        if(errors.length > 0) {
                            let response: any = {
                                module: 'Recibos',
                                message: 'La información no es válida.',
                                errors
                            };
                            return reject(response);
                        } else {

                            //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
                            //F     A   A C       T   U   U R   R A   A
                            //FFF   AAAAA C       T   U   U RRRR  AAAAA
                            //F     A   A C       T   U   U R   R A   A
                            //F     A   A  CCCC   T    UUU  R   R A   A

                            let attachments: Array<FileStructure> = [];
                            let receiptInvoiceUUID: any = '';
                            let stampingError: any = {};
                            let serieNFolio: string = '';
                            let emailSubjectType: 'Estado de cuenta' | 'Factura' = 'Estado de cuenta';
                            // let paymentMethod: string = idx(client, _ => _.businessData.paymentMethod) || 'PUE';
                            // if((stamp || paymentMethod === 'PPD') && parseFloat(receipt.total) > 0) {
                            // WARNING: Por disposición oficial, ahora TODOS los recibos generan una factura previa ¯\_(ツ)_/¯.
                                let invoiceModelV2: InvoiceModelV2 = new InvoiceModelV2();
                                try {
                                    // 1. Se obtienen los datos para la factura.
                                    let invoiceV2: any = await invoiceModelV2.getInvoiceFromReceipt(receipt);
                                    
                                    // console.log('==================== FACTURA ====================');
                                    // let { account, client, ...soloInvoice }: { account: Account, client: Client } & any = invoiceV2;
                                    // console.log(JSON.stringify(soloInvoice));
                                    // return resolve({
                                    //     status: 200,
                                    //     message: 'Ok'
                                    // });
            
                                    // NOTE: Se deben agregag como CFDIs relacionados todos los de anticipos.
                                    // NOTE: Por ahora esto no aplica... hasta que lo vuelvan a pedir.
                                    // invoiceV2.relatedCfdis = advancedInvoices;
                                    // 2. Se guarda / timbra la factura.
                                    invoiceV2.returnFiles = true;
                                    let invoiceV1: IInvoiceV1EX = await invoiceModelV2.postInvoice(invoiceV2);
                                    emailSubjectType = 'Factura';
                                    // console.log(`[MODELOS][RECIBOS][postReceipt] Factura generada con éxito.\r\n`);
                                    // 3. Se obtiene el UUID de la factura.
                                    let invoiceJSON: any = JSON.parse(invoiceV1.json);
                                    receiptInvoiceUUID = idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes']['UUID']);
                                    serieNFolio = `${invoiceV1.serie}${invoiceV1.folio}`;
                                    // 4. Se agrega el identificador de la factura el recibo.
                                    if(typeof invoiceV1._id === 'string') receipt.invoice = invoiceV1._id;
                                    // 5. Se revisan los archivos recibidos y se agregan al arreglo de archivos adjuntos.
                                    // XML.
                                    let xmlFile: string = (idx(invoiceV1, _ => _.files.xml) || '').toString();
                                    if(typeof xmlFile === 'string' && xmlFile.length > 0) {
                                        // NOTE: Se debe convertir a base64, ya que el archivo viene literalemnte en texto.
                                        let xmlBuffer: Buffer = Buffer.from(xmlFile, 'utf8');
                                        let xmlBase64: string = xmlBuffer.toString('base64');
                                        attachments.push({
                                            type: 'application/xml',
                                            name: `${serieNFolio}.xml`,
                                            content: xmlBase64
                                        });
                                    }
                                    // PDF.
                                    /*
                                    let pdfFile: string = (idx(invoiceV1, _ => _.files.pdf) || '').toString();
                                    if(typeof pdfFile === 'string' && pdfFile.length > 0) {
                                        attachments.push({
                                            type: 'application/pdf',
                                            name: `${serieNFolio}.pdf`,
                                            content: pdfFile
                                        });
                                    }
                                    */
                                } catch(error) {
                                    // console.log(`[MODELOS][RECIBOS][postReceipt] Error de factura:\r\n`);
                                    // console.log('Error de facturación: ', error);
                                    stampingError = error;
                                }
                            // }

                            //EEEEE  GGGG RRRR  EEEEE  SSSS  OOO   SSSS
                            //E     G     R   R E     S     O   O S
                            //EEE   G  GG RRRR  EEE    SSS  O   O  SSS
                            //E     G   G R   R E         S O   O     S
                            //EEEEE  GGGG R   R EEEEE SSSS   OOO  SSSS

                            // NOTE: Por ahora esto no aplica... hasta que lo vuelvan a pedir.
                            /*
                            if(egressInvoices.length > 0) {
                                for(const egressInvoice of egressInvoices) {
                                    // Se genera la factura de tipo egreso.
                                }
                            }
                            */
                            
                            //RRRR  EEEEE  SSSS TTTTT
                            //R   R E     S       T
                            //RRRR  EEE    SSS    T
                            //R   R E         S   T
                            //R   R EEEEE SSSS    T

                            axios.post(configuration.services.domain.finance.receipts.postReceipt, receipt)
                            .then( async (response: any) => {
                                
                                let newReceipt: Receipt =  response.data as Receipt || new Receipt();
                                
                                //PPPP  DDDD  FFFFF
                                //P   P D   D F
                                //PPPP  D   D FFF
                                //P     D   D F
                                //P     DDDD  F

                                let filesErrors: Array<any> = [];
                                let receiptPDF: string = '';
                                try {
                                    let pdf: any = await this.getPDFFromReceipt({ folio: newReceipt.folio });
                                    receiptPDF = pdf.pdf;
                                } catch(error) {
                                    // Ocurrió un error al crear el PDF pero se debe continuar con la ejecución.
                                    filesErrors.push(error);
                                }
                                // Si se logró generar el recibo, se guarda el archivo y se actualiza el recibo.
                                if(receiptPDF.length > 0) {

                                    // AAA  RRRR   CCCC H   H IIIII V   V  OOO
                                    //A   A R   R C     H   H   I   V   V O   O
                                    //AAAAA RRRR  C     HHHHH   I   V   V O   O
                                    //A   A R   R C     H   H   I    V V  O   O
                                    //A   A R   R  CCCC H   H IIIII   V    OOO

                                    // Variables
                                    let id = receipt.parentId;
                                    let category = 'receipts';
                                    let company = configuration.company.name;
                                    let pdfBuffer: Buffer | undefined;
                                    pdfBuffer = Buffer.from(receiptPDF, 'base64');
                                    let receiptFile: string = '';
                                    if(pdfBuffer){
                                        try {
                                            // Se guarda el archivo.
                                            let fileModel: FilesModel = new FilesModel();
                                            let fileName: string = (serieNFolio !== '') ? serieNFolio : receipt.folio.toString();
                                            let _file: any = await fileModel.postFileFromBuffer(pdfBuffer, 'application/pdf', `${fileName}.pdf`, id, category, company);
                                            receiptFile = _file.path;
                                            // Se agrega el archivo a los archivos adjuntos.
                                            attachments.push({
                                                type: 'application/pdf',
                                                name: `${fileName}.pdf`,
                                                content: receiptPDF // pdfBuffer.toString('base64')
                                            });
                                        } catch(error) {
                                            // Ocurrió un error al guardar el PDF pero se debe continuar con la ejecución.
                                            filesErrors.push(error);
                                        } finally {
                                            receipt.receiptFile = receiptFile;
                                        }
                                    }

                                    // AAA   CCCC TTTTT U   U  AAA  L     IIIII ZZZZZ  AAA   CCCC IIIII  OOO  N   N
                                    //A   A C       T   U   U A   A L       I      Z  A   A C       I   O   O NN  N
                                    //AAAAA C       T   U   U AAAAA L       I     Z   AAAAA C       I   O   O N N N
                                    //A   A C       T   U   U A   A L       I    Z    A   A C       I   O   O N  NN
                                    //A   A  CCCC   T    UUU  A   A LLLLL IIIII ZZZZZ A   A  CCCC IIIII  OOO  N   N
    
                                    if(receiptFile.length > 0) {
                                        try {
                                            await this.putReceipt({ _id: newReceipt._id, receiptFile });
                                            newReceipt.receiptFile = receiptFile;
                                        } catch(error) {
                                            // Ocurrió un error al actualizar el recibo, pero se debe continuar con la ejecución.
                                            filesErrors.push(error);
                                        }
                                    }
                                }

                                //PPPP   AAA   GGGG  OOO   SSSS
                                //P   P A   A G     O   O S
                                //PPPP  AAAAA G  GG O   O  SSS
                                //P     A   A G   G O   O     S
                                //P     A   A  GGGG  OOO  SSSS

                                let receiptId: any = idx(response, _ => _.data._id);
                                let paymentsUpdateError: Array<any> = [];
                                if(payments2Update.length > 0) {
                                    for(const payment of payments2Update) {
                                        try {
                                            let data: any = {
                                                _id: payment._id,
                                                details: payment.details,
                                                statusValue: payment.statusValue
                                            };
                                            data.details.push({
                                                receiptId,
                                                amount: payment.newDetail.amount
                                            });
                                            await paymentModel.putPayment(data);
                                        } catch(error) {
                                            paymentsUpdateError.push(error);
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
                                        subject: `Domain ${emailSubjectType} ${account.accountNumber}.`
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
                                
                                return resolve({
                                    receipt: newReceipt,
                                    stampingError,
                                    filesErrors,
                                    paymentsUpdateError,
                                    mailingErrors
                                });
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
                                        message: 'Ocurrió un error al intentar guardar la información (RECIBO).',
                                        error: idx(error, _ => _.response.data) || error
                                    });
                                }
                            });
                        }
                    } else {
                        return reject({
                            status: 400,
                            module: 'Recibos',
                            message: 'La cuenta tiene saldo a favor pero no se pudo obtener información sobre los anticipos (LISTA VACÍA).'
                        });
                    }
                } else {

                    //TTTTT  OOO  TTTTT  AAA  L
                    //  T   O   O   T   A   A L
                    //  T   O   O   T   AAAAA L
                    //  T   O   O   T   A   A L
                    //  T    OOO    T   A   A LLLLL

                    // Se actualizan el total y el balance anterior.
                    try {
                        receipt.previousBalance = parseFloat(balance.total);
                    } catch(error) {
                        return reject({
                            status: 400,
                            module: 'Recibos',
                            message: 'No se pudo actualizar el total de recibo con el saldo anterior.',
                            error
                        });
                    }

                    //FFFFF  OOO  L     IIIII  OOO
                    //F     O   O L       I   O   O
                    //FFF   O   O L       I   O   O
                    //F     O   O L       I   O   O
                    //F      OOO  LLLLL IIIII  OOO
                    
                    // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                    // El folio se genera automáticamente desde el microservicio a partir de la versión 1.7.3
                    /*
                    let lastReceiptFolio: number = 1;
                    let folioFilter: any = {
                        // serie: 'A',
                        limit: 1,
                        page: 1,
                        sort: { "field": "folio", "type": "DESC" }
                    };
                    try {
                        let _receiptsResult = await this.getReceipts(folioFilter);
                        if(Array.isArray(_receiptsResult.results) && _receiptsResult.results.length > 0) {
                            lastReceiptFolio = parseInt(_receiptsResult.results[0].folio) + 1;
                        }
                    } catch(error) {
                        return reject(error);
                    } finally {
                        // Se debe completar la información del recibo.
                        receipt.folio = lastReceiptFolio;
                        // receipt.items = items;
                    }
                    */

                    //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
                    //E     R   R R   R O   O R   R E     S
                    //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
                    //E     R   R R   R O   O R   R E         S
                    //EEEEE R   R R   R  OOO  R   R EEEEE SSSS

                    let errors: Array<any> = [];
                    this.validateSchemas(receipt, receipt.items)
                    .then((data: any) => {
                        errors = data;
                    });
                    if(errors.length > 0) {
                        let response: any = {
                            module: 'Recibos',
                            message: 'La información no es válida.',
                            errors
                        };
                        return reject(response);
                    } else {

                        //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
                        //F     A   A C       T   U   U R   R A   A
                        //FFF   AAAAA C       T   U   U RRRR  AAAAA
                        //F     A   A C       T   U   U R   R A   A
                        //F     A   A  CCCC   T    UUU  R   R A   A

                        let attachments: Array<FileStructure> = [];
                        let stampingError: any = {};
                        let serieNFolio: string = '';
                        let emailSubjectType: 'Estado de cuenta' | 'Factura' = 'Estado de cuenta';
                        // Antes de facturar, se debe revisar que el total (total - saldo anterior) sea mayor a 0.
                        // let paymentMethod: string = idx(client, _ => _.businessData.paymentMethod) || 'PUE';
                        // if((stamp || paymentMethod === 'PPD') && parseFloat(receipt.total) > 0) {
                        // WARNING: Por disposición oficial, ahora TODOS los recibos generan una factura previa ¯\_(ツ)_/¯.
                            let invoiceModelV2: InvoiceModelV2 = new InvoiceModelV2();
                            try {
                                // 1. Se obtienen los datos para la factura.
                                let invoiceV2: any = await invoiceModelV2.getInvoiceFromReceipt(receipt);
                                // console.log('==================== FACTURA v2 ====================\n', invoiceV2);
                                // 2. Se guarda / timbra la factura.
                                invoiceV2.returnFiles = true;
                                let invoiceV1: IInvoiceV1EX = await invoiceModelV2.postInvoice(invoiceV2);
                                emailSubjectType = 'Factura';
                                // console.log('[FACTURA v1] - ', invoiceV1);
                                // console.log(`[MODELOS][RECIBOS][postReceipt] Factura generada con éxito.\r\n`);
                                // 3. Se agrega el identificador de la factura el recibo.
                                if(typeof invoiceV1._id === 'string') receipt.invoice = invoiceV1._id;
                                serieNFolio = `${invoiceV1.serie}${invoiceV1.folio}`;
                                // 4. Se revisan los archivos recibidos y se agregan al arreglo de archivos adjuntos.
                                // XML.
                                let xmlFile: string = (idx(invoiceV1, _ => _.files.xml) || '').toString();
                                if(typeof xmlFile === 'string' && xmlFile.length > 0) {
                                    // NOTE: Se debe convertir a base64, ya que el archivo viene literalemnte en texto.
                                    let xmlBuffer: Buffer = Buffer.from(xmlFile, 'utf8');
                                    let xmlBase64: string = xmlBuffer.toString('base64');
                                    attachments.push({
                                        type: 'application/xml',
                                        name: `${serieNFolio}.xml`,
                                        content: xmlBase64
                                    });
                                }
                                // PDF.
                                /*
                                let pdfFile: string = (idx(invoiceV1, _ => _.files.pdf) || '').toString();
                                if(typeof pdfFile === 'string' && pdfFile.length > 0) {
                                    attachments.push({
                                        type: 'application/pdf',
                                        name: `${serieNFolio}.pdf`,
                                        content: pdfFile
                                    });
                                }
                                */
                            } catch(error) {
                                // console.log(`[MODELOS][RECIBOS][postReceipt] Error de factura:\r\n`);
                                // console.log(error);
                                stampingError = error;
                            }
                        // }
                        
                        //RRRR  EEEEE  SSSS TTTTT
                        //R   R E     S       T
                        //RRRR  EEE    SSS    T
                        //R   R E         S   T
                        //R   R EEEEE SSSS    T

                        axios.post(configuration.services.domain.finance.receipts.postReceipt, receipt)
                        .then( async (response: any) => {

                            let newReceipt: Receipt =  response.data as Receipt || new Receipt();
                            
                            //PPPP  DDDD  FFFFF
                            //P   P D   D F
                            //PPPP  D   D FFF
                            //P     D   D F
                            //P     DDDD  F

                            let filesErrors: Array<any> = [];
                            let receiptPDF: string = '';
                            try {
                                let pdf: any = await this.getPDFFromReceipt({ folio: newReceipt.folio });
                                receiptPDF = pdf.pdf;
                            } catch(error) {
                                // Ocurrió un error al crear el PDF pero se debe continuar con la ejecución.
                                filesErrors.push(error);
                            }
                            // Si se logró generar el recibo, se guarda el archivo y se actualiza el recibo.
                            if(receiptPDF.length > 0) {
                                    
                                // AAA  RRRR   CCCC H   H IIIII V   V  OOO
                                //A   A R   R C     H   H   I   V   V O   O
                                //AAAAA RRRR  C     HHHHH   I   V   V O   O
                                //A   A R   R C     H   H   I    V V  O   O
                                //A   A R   R  CCCC H   H IIIII   V    OOO

                                // Variables
                                let id = receipt.parentId;
                                let category = 'receipts';
                                let company = configuration.company.name;
                                let pdfBuffer: Buffer | undefined;
                                pdfBuffer = Buffer.from(receiptPDF, 'base64');
                                let receiptFile: string = '';
                                if(pdfBuffer){
                                    try {
                                        // Se guarda el archivo.
                                        let fileModel: FilesModel = new FilesModel();
                                        let fileName: string = (serieNFolio !== '') ? serieNFolio : receipt.folio.toString();
                                        let _file: any = await fileModel.postFileFromBuffer(pdfBuffer, 'application/pdf', `${fileName}.pdf`, id, category, company);
                                        receiptFile = _file.path;
                                        // Se agrega el archivo a los archivos adjuntos.
                                        attachments.push({
                                            type: 'application/pdf',
                                            name: `${fileName}.pdf`,
                                            content: receiptPDF // pdfBuffer.toString('base64')
                                        });
                                    } catch(error) {
                                        // Ocurrió un error al guardar el PDF pero se debe continuar con la ejecución.
                                        filesErrors.push(error);
                                    } finally {
                                        receipt.receiptFile = receiptFile;
                                    }
                                }

                                // AAA   CCCC TTTTT U   U  AAA  L     IIIII ZZZZZ  AAA   CCCC IIIII  OOO  N   N
                                //A   A C       T   U   U A   A L       I      Z  A   A C       I   O   O NN  N
                                //AAAAA C       T   U   U AAAAA L       I     Z   AAAAA C       I   O   O N N N
                                //A   A C       T   U   U A   A L       I    Z    A   A C       I   O   O N  NN
                                //A   A  CCCC   T    UUU  A   A LLLLL IIIII ZZZZZ A   A  CCCC IIIII  OOO  N   N

                                if(receiptFile.length > 0) {
                                    try {
                                        await this.putReceipt({ _id: newReceipt._id, receiptFile });
                                        newReceipt.receiptFile = receiptFile;
                                    } catch(error) {
                                        // Ocurrió un error al actualizar el recibo, pero se debe continuar con la ejecución.
                                        filesErrors.push(error);
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
                                    subject: `Domain ${emailSubjectType} ${account.accountNumber}.`
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
                            
                            return resolve({
                                receipt: newReceipt,
                                stampingError,
                                filesErrors,
                                mailingErrors
                            });
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
                                    message: 'Ocurrió un error al intentar guardar la información (RECIBO).',
                                    error: idx(error, _ => _.response.data) || error
                                });
                            }
                        });
                    }
                }
            } else {
                return reject({
                    status: '404',
                    module: 'Recibos',
                    message: 'El estatus de la cuenta no es ACTIVA o no es una INSTALACIÓN.'
                });
            }
        });
    }

    public rePostReceipt(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { _id, id, ...rest}: { _id: string, id: string } & any = body;

            //RRRR  EEEEE  CCCC IIIII BBBB   OOO
            //R   R E     C       I   B   B O   O
            //RRRR  EEE   C       I   BBBB  O   O
            //R   R E     C       I   B   B O   O
            //R   R EEEEE  CCCC IIIII BBBB   OOO

            // 1. Se obtiene la información de la factura.
            let receipt: Receipt = new Receipt();
            try {
                receipt = await this.getReceipt({ _id: (_id || id) });
            } catch(error) {
                return reject(error);
            }
            if(['cancelled', 'error'].indexOf(receipt.statusValue) >= 0) {
                return reject({
                    status: 400,
                    module: 'Recibos',
                    message: 'El recibo debe estar activo, pendiente o pagado.'
                });
            }

            //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
            //F     A   A C       T   U   U R   R A   A
            //FFF   AAAAA C       T   U   U RRRR  AAAAA
            //F     A   A C       T   U   U R   R A   A
            //F     A   A  CCCC   T    UUU  R   R A   A

            // 2. Se crea de nuevo la factura si no tiene.
            let fileName: string = `${receipt.folio}`;
            let attachments: Array<FileStructure> = [];
            let invoice: string = '';
            if(isEmpty(receipt.invoice)) {
                // WARNING: Por disposición oficial, ahora TODOS los recibos generan una factura previa ¯\_(ツ)_/¯.
                let invoiceModelV2: InvoiceModelV2 = new InvoiceModelV2();
                try {
                    // 1. Se obtienen los datos para la factura.
                    let invoiceV2: any = await invoiceModelV2.getInvoiceFromReceipt(receipt);
                    // 2. Se guarda / timbra la factura.
                    invoiceV2.returnFiles = true;
                    let invoiceV1: Invoice = await invoiceModelV2.postInvoice(invoiceV2);
                    // 3. Se agrega el identificador de la factura el recibo.
                    if(typeof invoiceV1._id === 'string') {
                        invoice = invoiceV1._id;
                        fileName = `${invoiceV1.serie}${invoiceV1.folio}`;
                    }
                    // 4. Se revisan los archivos recibidos y se agregan al arreglo de archivos adjuntos.
                    // XML.
                    // @ts-ignore
                    let xmlFile: string = (idx(invoiceV1, _ => _.files.xml) || '').toString();
                    if(typeof xmlFile === 'string' && xmlFile.length > 0) {
                        // NOTE: Se debe convertir a base64, ya que el archivo viene literalemnte en texto.
                        let xmlBuffer: Buffer = Buffer.from(xmlFile, 'utf8');
                        let xmlBase64: string = xmlBuffer.toString('base64');
                        attachments.push({
                            type: 'application/xml',
                            name: `${fileName}.xml`,
                            content: xmlBase64
                        });
                    }
                    // PDF.
                    // NOTE: La factura no se agrega, el nuevo formato de recibo ya contiene la información.
                } catch(error) {
                    return reject(error);
                }

                // AAA   CCCC TTTTT U   U  AAA  L     IIIII ZZZZZ  AAA   CCCC IIIII  OOO  N   N
                //A   A C       T   U   U A   A L       I      Z  A   A C       I   O   O NN  N
                //AAAAA C       T   U   U AAAAA L       I     Z   AAAAA C       I   O   O N N N
                //A   A C       T   U   U A   A L       I    Z    A   A C       I   O   O N  NN
                //A   A  CCCC   T    UUU  A   A LLLLL IIIII ZZZZZ A   A  CCCC IIIII  OOO  N   N

                try {
                    await this.putReceipt({ _id: (_id || id), invoice });
                } catch(error) {
                    return reject(error);
                }
                
            } else {
                // @ts-ignore
                fileName = `${receipt.invoice.serie}${receipt.invoice.folio}`;
            }
                
            //PPPP  DDDD  FFFFF
            //P   P D   D F
            //PPPP  D   D FFF
            //P     D   D F
            //P     DDDD  F

            // 3. Se crean de nuevo los archivos PDF.
            let pdfFile: string = '';
            let filesErrors: Array<any> = [];
            try {
                let pdf: any = await this.getPDFFromReceipt({ _id: receipt._id });
                pdfFile = pdf.pdf;
            } catch(error) {
                filesErrors.push(error);
            }   
            // Si se logró generar el recibo, se guarda el archivo y se actualiza el recibo.
            let updatedReceipt: Receipt = new Receipt();
            if(pdfFile.length > 0) {
                    
                // AAA  RRRR   CCCC H   H IIIII V   V  OOO
                //A   A R   R C     H   H   I   V   V O   O
                //AAAAA RRRR  C     HHHHH   I   V   V O   O
                //A   A R   R C     H   H   I    V V  O   O
                //A   A R   R  CCCC H   H IIIII   V    OOO

                // Variables
                let id = receipt.parentId;
                let category = 'receipts';
                let company = configuration.company.name;
                let pdfBuffer: Buffer | undefined;
                pdfBuffer = Buffer.from(pdfFile, 'base64');
                let receiptFile: string = '';
                if(pdfBuffer){
                    try {
                        // Se guarda el archivo.
                        let fileModel: FilesModel = new FilesModel();
                        let _file: any = await fileModel.postFileFromBuffer(pdfBuffer, 'application/pdf', `${fileName}.pdf`, id, category, company);
                        receiptFile = _file.path;
                        // Se agrega el archivo a los archivos adjuntos.
                        attachments.push({
                            type: 'application/pdf',
                            name: `${fileName}.pdf`,
                            content: pdfFile
                        });
                    } catch(error) {
                        filesErrors.push(error);
                    }
                }

                // AAA   CCCC TTTTT U   U  AAA  L     IIIII ZZZZZ  AAA   CCCC IIIII  OOO  N   N
                //A   A C       T   U   U A   A L       I      Z  A   A C       I   O   O NN  N
                //AAAAA C       T   U   U AAAAA L       I     Z   AAAAA C       I   O   O N N N
                //A   A C       T   U   U A   A L       I    Z    A   A C       I   O   O N  NN
                //A   A  CCCC   T    UUU  A   A LLLLL IIIII ZZZZZ A   A  CCCC IIIII  OOO  N   N

                if(receiptFile.length > 0) {
                    try {
                        updatedReceipt = await this.putReceipt({ _id: (_id || id), receiptFile });
                    } catch(error) {
                        filesErrors.push(error);
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
                    accountNumber: receipt.parentId,
                    attachments,
                    template: 'client_notification',
                    content: [
                        {
                            name: 'message',
                            content: 'Por medio del presente correo le hacemos llegar su factura del mes.'
                        }
                    ],
                    subject: `Domain Estado de cuenta ${receipt.parentId}.`
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
            
            return resolve({
                receipt: updatedReceipt,
                filesErrors,
                mailingErrors
            });
        });
    }

    public postReceipts(body: any, file: Express.Multer.File): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { isTest, ...rest } = body;
            isTest = isTest ? JSON.parse(isTest) : false;

            //JJJJJ  SSSS  OOO  N   N
            //  J   S     O   O NN  N
            //  J    SSS  O   O N N N
            //J J       S O   O N  NN
            // J    SSSS   OOO  N   N

            let items: Array<Receipt> = [];
            if(file) {
                try {
                    items = JSON.parse(file.buffer.toString('utf8'));
                } catch(error) {
                    return reject({
                        status: 400,
                        module: 'Recibos',
                        message: 'No se pudo leer la información del archivo.',
                        error
                    });
                }
            } else {
                return reject({
                    status: 404,
                    module: 'Recibos',
                    message: 'No se encontró un archivo en la petición.'
                });
            }
            
            //FFFFF  OOO  L     IIIII  OOO
            //F     O   O L       I   O   O
            //FFF   O   O L       I   O   O
            //F     O   O L       I   O   O
            //F      OOO  LLLLL IIIII  OOO
            
            // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
            // El folio se genera automáticamente desde el microservicio a partir de la versión 1.7.3
            /*
            let lastReceiptFolio: number = 1;
            let folioFilter: any = {
                // serie: 'A',
                limit: 1,
                page: 1,
                sort: { "field": "folio", "type": "DESC" }
            };
            try {
                let _receiptsResult = await this.getReceipts(folioFilter);
                if(Array.isArray(_receiptsResult.results) && _receiptsResult.results.length > 0) {
                    lastReceiptFolio = parseInt(_receiptsResult.results[0].folio);
                }
            } catch(error) {
                return reject(error);
            }
            */

            //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
            //E     R   R R   R O   O R   R E     S
            //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
            //E     R   R R   R O   O R   R E         S
            //EEEEE R   R R   R  OOO  R   R EEEEE SSSS
            
            let goodRecords: Array<Receipt> = [];
            let badRecords: Array<any> = [];
            if(Array.isArray(items) && items.length > 0) {
                for(const receipt of items) {
                    
                    // CCCC U   U EEEEE N   N TTTTT  AAA
                    //C     U   U E     NN  N   T   A   A
                    //C     U   U EEE   N N N   T   AAAAA
                    //C     U   U E     N  NN   T   A   A
                    // CCCC  UUU  EEEEE N   N   T   A   A

                    if(receipt.parentType === 'account') {
                        if((typeof receipt.parentId === 'string' && receipt.parentId.match(/^[0-9]+$/g) !== null) || typeof receipt.parentId === 'number') {
                            // La cuenta para el movimiento es de tipo LEGACY y se debe obtener el número nuevo.
                            try {
                                let accountModel: AccountModel = new AccountModel();
                                let _account: Account = await accountModel.getAccount({ legacyId: receipt.parentId });
                                receipt.parentId = _account.accountNumber;
                            } catch(error) {
                                // @ts-ignore
                                receipt.error = error;
                                badRecords.push({
                                    folio: receipt.folio,
                                    errors: error
                                });
                                continue;
                            }
                        }
                    }

                    // Análisis y transformación de datos.
                    try {
                        // Información general.
                        receipt.parentId = receipt.parentId;
                        // receipt.folio = lastReceiptFolio;
                        let movementDate = receipt.movementDate ? new Date(receipt.movementDate) : new Date();
                        receipt.movementDate = date2StringFormat(movementDate, 'YYYY-MM-DDThh:mm:ss.000Z');
                        // Totales.
                        receipt.total = receipt.total ? parseFloat(receipt.total.toFixed(2)) : 0;
                        receipt.subTotal = receipt.subTotal ? parseFloat(receipt.subTotal.toFixed(2)) : 0;
                        receipt.discount = receipt.discount ? parseFloat(receipt.discount.toFixed(2)) : 0;
                        receipt.taxes = receipt.taxes ? parseFloat(receipt.taxes.toFixed(2)) : 0;
                        // Items.
                        for(const item of receipt.items) {
                            item.productName = item.productName.toString().slice(0, 200);
                        }
                        // lastReceiptFolio++;
                    } catch(error) {}
                    let receiptErrors: any = await this.validateSchemas(receipt, receipt.items);
                    // Se revisa si el cliente se puede insertar o no.
                    if(receiptErrors.length > 0) {
                        badRecords.push({
                            folio: receipt.folio,
                            errors: receiptErrors
                        });
                    } else {
                        goodRecords.push(receipt);
                    }
                }
            } else {
                return reject({
                    status: 400,
                    module: 'Recibos',
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
                    module: 'Recibos',
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
                        messge: 'Todo okey dokey.',
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
                    axios.post(configuration.services.domain.finance.receipts.postReceipts, goodRecords, {
                        maxContentLength: 52428890
                    })
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
                        console.log(error);
                        return reject({
                            status: 400,
                            module: 'Recibos',
                            message: 'Ocurrió un error al intentar guardar la información (RECIBOS).',
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

    public postVerySpecificSIMShippingChargeReceipt(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { accountNumber, ...rest }: { accountNumber: string } & any = body;
            if(!accountNumber) {
                return reject({
                    status: 400,
                    module: 'Recibos',
                    message: 'Se debe mandar un número de cuenta para asignar el recibo.'
                });
            }

            // Recibo.
            let today: Date = new Date();
            let movementDate: string = date2StringFormat(today, 'YYYY-MM-DDThh:mm:ss.000Z');
            let receipt: Receipt = new Receipt();
            receipt = {
                folio: -1,
                parentId: accountNumber,
                parentType: 'account',
                movementDate,
                items: [
                    {
                        productName: 'Envío SIM Domain',
                        quantity: 1,
                        discount: 0,
                        unitCost: 172.41,
                        total: 172.41,
                        satProductCode: '78102205',
                        unitCve: 'E48'
                    }
                ],
                total: 200,
                subTotal: 172.41,
                taxes: 27.59,
                discount: 0,
                exchangeRate: 1,
                currencyValue: 'MXN',
                statusValue: 'pending',
                typeValue: 'manual'
            };

            // Se hace el post.
            try {
                let result: {
                    receipt: Receipt,
                    stampingError: Array<any>,
                    filesErrors: Array<any>,
                    mailingErrors: Array<any>
                };
                result = await this.postReceipt(receipt);
                return resolve(result);
            } catch(error) {
                return reject(error);
            }
        });
    }

    //PPPP  U   U TTTTT
    //P   P U   U   T
    //PPPP  U   U   T
    //P     U   U   T
    //P      UUU    T

    public putReceipt(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let errors: Array<any> = [];
            let { items, ...receipt } = body;
            this.validateSchemas(receipt, items, ['PUT'])
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Recibos',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.put(configuration.services.domain.finance.receipts.putReceipt, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
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
                            message: 'Ocurrió un error al intentar actualizar la información.',
                            error: idx(error, _ => _.response.data) || error
                        });
                    }
                });
            }
        });
    }

    // DELETE:
    public putReceiptErrors(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let { receiptsFiles, ...rest }:  {receiptsFiles: Array<string>} & any = body;
            let errors: Array<any> = [];
            let updatedReceipts: number = 0;
            if(Array.isArray(receiptsFiles) && receiptsFiles.length > 0) {
                let index: number = 0;
                for(const receiptFile of receiptsFiles) {
                    // 1. Se busca el recibo.
                    let getReceipts: { results: Array<Receipt>, summary: any } = { results: [], summary: {} };
                    try {
                        getReceipts = await this.getReceipts({ receiptFile });
                    } catch(error) {
                        errors.push(error);
                        continue;
                    }
                    // 2. Se revisa si sólo es uno y se actualiza.
                    if(getReceipts.results.length === 1) {
                        try {
                            await this.putReceipt({ _id: getReceipts.results[0]._id, statusValue: 'error' });
                            updatedReceipts++;
                        } catch(error) {
                            errors.push(error);
                            continue;
                        }
                    }
                    index++;
                }
            }
            return resolve({
                status: errors.length > 0 ? 206 : 200,
                message: `Recibos actualizados con éxito: ${updatedReceipts}.`,
                errors
            })
        });
    }

    // DELETE:
    public putReceiptDecimals(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let { receipts, ...rest }:  {receipts: Array<{ receiptFile: string, total: number, subTotal: number, taxes: number, discount: number }>} & any = body;
            let errors: Array<any> = [];
            let updatedReceipts: number = 0;
            if(Array.isArray(receipts) && receipts.length > 0) {
                let index: number = 0;
                for(const receipt of receipts) {
                    // 1. Se busca el recibo.
                    let getReceipts: { results: Array<Receipt>, summary: any } = { results: [], summary: {} };
                    try {
                        getReceipts = await this.getReceipts({ receiptFile: receipt.receiptFile });
                    } catch(error) {
                        errors.push(error);
                        continue;
                    }
                    // 2. Se revisa si sólo es uno y se actualiza.
                    if(getReceipts.results.length === 1) {
                        // Modificación de datos.
                        let subTotal: number = parseFloat(receipt.subTotal.toFixed(2));
                        let taxes: number = parseFloat(receipt.taxes.toFixed(2));
                        let total: number = parseFloat(receipt.total.toFixed(2));
                        let discount: number = parseFloat(receipt.taxes.toFixed(2));
                        try {
                            await this.putReceipt({ _id: getReceipts.results[0]._id, subTotal, taxes, discount, total });
                            updatedReceipts++;
                        } catch(error) {
                            errors.push(error);
                            continue;
                        }
                    }
                    index++;
                }
            }
            return resolve({
                status: errors.length > 0 ? 206 : 200,
                message: `Recibos actualizados con éxito: ${updatedReceipts}.`,
                errors
            })
        });
    }

    // DELETE:
    public putFixItems(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let receipts: { results: Array<Receipt>, summary: any} = { results: [], summary: {} };
            try {
                // { discount: { $gt: 0 }, invoice: { $ne: null } }
                let filters = {
                    typeValue: 'monthly',
                    movementDate: {"start":"2020-03-01","end":"2020-03-31"},
                    all: true
                };
                receipts = await this.getReceipts(filters);
            } catch(error) {
                return reject(error);
            }
            console.log(`Total de recibos: ${receipts.results.length}`);

            let counter: number = 0;
            for(const receipt of receipts.results) {

                // Se revisa si tiene descuento.
                if(receipt.discount === 0) continue;
                // Y después si éste es diferente al total de los descuentos de los conceptos.
                let itemsDiscount:number = 0;
                for(const item of receipt.items) {
                    itemsDiscount += item.discount || 0;
                }
                itemsDiscount = parseFloat(itemsDiscount.toFixed(2));
                if(itemsDiscount >= receipt.discount) continue;

                counter++;
                console.log(counter);
                // Se reparte el descuento restante entre los conceptos.
                let remainingDiscount: number = parseFloat((receipt.discount - itemsDiscount).toFixed(2));
                let index: number = 0;
                while(remainingDiscount > 0 && index < receipt.items.length) {

                    // Se resta lo que se pueda del descuento por concepto.
                    let itemTotal: number = receipt.items[index].total ? parseFloat((receipt.items[index].total as number).toFixed(2)) : 0;
                    let itemDiscount: number = receipt.items[index].discount ? parseFloat((receipt.items[index].discount as number).toFixed(2)) : 0;
                    let itemTotalWithDiscount: number = parseFloat((itemTotal - itemDiscount).toFixed(2));
                    if(itemTotal > 0) {
                        if(itemTotalWithDiscount >= remainingDiscount) {
                            receipt.items[index].discount = parseFloat((itemDiscount + remainingDiscount).toFixed(2));
                            remainingDiscount = 0;
                        } else {
                            receipt.items[index].discount = itemTotalWithDiscount;
                            remainingDiscount = parseFloat((remainingDiscount - itemTotalWithDiscount).toFixed(2));
                        }
                    }

                    index++;
                }

                // Se actualiza el recibo.
                try {
                    await this.putReceipt({ _id: receipt._id, items: receipt.items });
                } catch(error) {
                    continue;
                }
            }

            console.log('Proceso terminado con éxito.');
            return resolve({
                status: 200,
                message: 'Proceso terminado con éxito.'
            })
        });
    }

    // DELETE:
    public putEraseDiscounts(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            console.log(`Proceso de eliminación de descuentos iniciado: ${new Date()}`);
            let receipts: { results: Array<Receipt>, summary: any} = { results: [], summary: {} };
            try {
                // { discount: { $gt: 0 }, invoice: { $ne: null } }
                let filters = {
                    typeValue: 'monthly',
                    movementDate: {"start":"2020-03-01","end":"2020-03-31"},
                    all: true
                    // page: 3
                };
                receipts = await this.getReceipts(filters);
            } catch(error) {
                return reject(error);
            }
            console.log(`Total de recibos: ${receipts.results.length}`);
            // return resolve(receipts.summary);

            let invoiceModelV2: InvoiceModelV2 = new InvoiceModelV2();
            for(const receipt of receipts.results) {

                // Se revisa si tiene descuento.
                if(receipt.discount === 0) continue;

                // TODO: Se deben saltar los recibos que ya se habían corregido.
                let accounts2Exclude: Array<string> = [ 'M-000-0000130', 'M-000-0000706', 'M-000-0000742', 'M-000-0001874' ];
                if(accounts2Exclude.indexOf(receipt.parentId) >= 0) continue;

                // OOO  PPPP   CCCC IIIII  OOO  N   N        1
                //O   O P   P C       I   O   O NN  N       11
                //O   O PPPP  C       I   O   O N N N        1
                //O   O P     C       I   O   O N  NN        1
                // OOO  P      CCCC IIIII  OOO  N   N      11111

                // Conciste en copiar los conceptos dentro de la factura al recibo.
                // WARNING: De esta manera se pierde el identificador del producto :(
                
                // Concepto dentro del recibo:                              | Concepto dentro de la factura:
                /*                                                          |
                {                                                           |{
                    "unitCve": "E48",                                       |   "_attributes": {
                    "satProductCode": "81161700",                           |       "ClaveProdServ":"81161700",
                    "_id": "5e5b5681e3bca855ba14cea3",                      |       "NoIdentificacion":"M-000-0000002",
                    "productId": "5d6ed00f378b6d5a9e980d53",                |       "Cantidad":"1",
                    "productName": "Servicio Internet Dedicado 40 Mbps",    |       "ClaveUnidad":"E48",
                    "quantity": 1,                                          |       "Descripcion":"Servicio Internet Dedicado 40 Mbps",
                    "discount": 601.68,                                     |       "ValorUnitario":"10028",
                    "unitCost": 10028,                                      |       "Importe":"10028"
                    "total": 10028                                          |   },
                }                                                           |   "cfdi:Impuestos":{
                                                                            |    "cfdi:Traslados":{
                                                                            |        "cfdi:Traslado":{
                                                                            |            "_attributes":{
                                                                            |                "Base":"10028",
                                                                            |                "Impuesto":"002",
                                                                            |                "TipoFactor":"Tasa",
                                                                            |                "TasaOCuota":"0.160000",
                                                                            |                "Importe":"1604.48"
                                                                            |            }
                                                                            |        }
                                                                            |    }
                                                                            |}
                */
                // Se obtienen los conceptos de la factura.
                /*
                let invoice: JSON = receipt.invoice ? JSON.parse(receipt.invoice) : {};
                let invoiceConcepts: any = idx(invoice, _ => _['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']);
                let invoiceItems: Array<IInvoiceConcept> = [];
                if(Array.isArray(invoiceConcepts)) {
                    invoiceItems = invoiceItems.concat(invoiceConcepts);
                } else if(invoiceConcepts.hasOwnProperty('_attributes')) {
                    invoiceItems.push(invoiceConcepts);
                } else {
                    // En este punto el recibo no tiene una factura.
                    continue;
                }
                let receiptItems: Array<Item> = [];
                // Se modifican los conceptos del recibo para empatar los de la factura.
                for(const concept of invoiceItems) {
                    receiptItems.push({
                        unitCve: concept._attributes.ClaveUnidad,
                        satProductCode: concept._attributes.ClaveProdServ,
                        // _id
                        productId: '',
                        productName: concept._attributes.Descripcion,
                        quantity: parseFloat(concept._attributes.Cantidad),
                        discount: 0,
                        unitCost: parseFloat(concept._attributes.ValorUnitario),
                        total: parseFloat(concept._attributes.Importe)
                    });
                }
                */

                // OOO  PPPP   CCCC IIIII  OOO  N   N       222
                //O   O P   P C       I   O   O NN  N      2   2
                //O   O PPPP  C       I   O   O N N N        22
                //O   O P     C       I   O   O N  NN       2
                // OOO  P      CCCC IIIII  OOO  N   N      22222

                // Eliminar simplemente el descuento de cada concepto.
                let receiptItems: Array<Item> = [];
                let itemsDiscount: number = 0;
                for(const item of receipt.items) {

                    let itemDiscount: number = 0;
                    // WARNING: Se deben conciderar las cuentas con un descuento fijo, por ahora se hará a mano:
                    // NOTE: Las 4 que son de cuentas maestras es mejor no hacerlas :(
                    /*
                    OT104-0000804   2500        M-000-0000130
                    OT104-0005078   3500        M-000-0000706
                    OT104-0005306   100         M-000-0000742
                    MO100-0000332   300.855     null
                    FO101-0000579   86.21       null
                    FO101-0000944   1852.59     null
                    FO101-0000956   86.21       null
                    MO100-0000765   688.79      null
                    TL102-0000043   43.1        M-000-0001874
                    MO100-0000787   430         null
                    FO101-0001120   86.2        null
                    MO100-0000844   258.62      null
                    MO100-0000894   86.2        null
                    MO100-0000911   344         null
                    MO100-0000979   86.21       null
                    MO100-0001030   258.62      null
                    */
                    switch(receipt.parentId) {
                        case 'MO100-0000332':
                            itemDiscount = parseFloat((300.855).toFixed(2));
                            break;
                        case 'FO101-0000579':
                            itemDiscount = parseFloat((86.21).toFixed(2));
                            break;
                        case 'FO101-0000944':
                            itemDiscount = parseFloat((1852.59).toFixed(2));
                            break;
                        case 'FO101-0000956':
                            itemDiscount = parseFloat((86.21).toFixed(2));
                            break;
                        case 'MO100-0000765':
                            itemDiscount = parseFloat((688.79).toFixed(2));
                            break;
                        case 'MO100-0000787':
                            itemDiscount = parseFloat((430).toFixed(2));
                            break;
                        case 'FO101-0001120':
                            itemDiscount = parseFloat((86.2).toFixed(2));
                            break;
                        case 'MO100-0000844':
                            itemDiscount = parseFloat((258.62).toFixed(2));
                            break;
                        case 'MO100-0000894':
                            itemDiscount = parseFloat((86.2).toFixed(2));
                            break;
                        case 'MO100-0000911':
                            itemDiscount = parseFloat((344).toFixed(2));
                            break;
                        case 'MO100-0000979':
                            itemDiscount = parseFloat((86.21).toFixed(2));
                            break;
                        case 'MO100-0001030':
                            itemDiscount = parseFloat((258.62).toFixed(2));
                            break;
                    }
                    itemsDiscount = itemDiscount;

                    // 1) Se agrega el item actualizado al arreglo.
                    receiptItems.push({
                        unitCve: item.unitCve,
                        satProductCode: item.satProductCode,
                        productId: item.productId,
                        productName: item.productName,
                        quantity: item.quantity,
                        discount: itemDiscount,
                        unitCost: item.unitCost,
                        total: item.total
                    });
                }
                let subTotal: number = parseFloat(receipt.subTotal.toFixed(2));
                let taxes: number = parseFloat((subTotal * 0.16).toFixed(2));
                let total: number = parseFloat((subTotal + taxes).toFixed(2));
                let discount: number = parseFloat((receipt.discount - itemsDiscount).toFixed(2));
                // console.log('Descuento: ', discount);

                // AAA   CCCC TTTTT U   U  AAA  L     IIIII ZZZZZ  AAA   CCCC IIIII  OOO  N   N
                //A   A C       T   U   U A   A L       I      Z  A   A C       I   O   O NN  N
                //AAAAA C       T   U   U AAAAA L       I     Z   AAAAA C       I   O   O N N N
                //A   A C       T   U   U A   A L       I    Z    A   A C       I   O   O N  NN
                //A   A  CCCC   T    UUU  A   A LLLLL IIIII ZZZZZ A   A  CCCC IIIII  OOO  N   N

                try {
                    let data: any = { 
                        _id: receipt._id,
                        items: receiptItems,
                        subTotal,
                        taxes,
                        total
                    };
                    await this.putReceipt(data);
                } catch(error) {
                    // console.log('Error (recibo): ', error);
                    continue;
                }

                //N   N  OOO  TTTTT  AAA   SSSS      DDDD  EEEEE       CCCC RRRR  EEEEE DDDD  IIIII TTTTT  OOO
                //NN  N O   O   T   A   A S          D   D E          C     R   R E     D   D   I     T   O   O
                //N N N O   O   T   AAAAA  SSS       D   D EEE        C     RRRR  EEE   D   D   I     T   O   O
                //N  NN O   O   T   A   A     S      D   D E          C     R   R E     D   D   I     T   O   O
                //N   N  OOO    T   A   A SSSS       DDDD  EEEEE       CCCC R   R EEEEE DDDD  IIIII   T    OOO

                // NOTE: Se debe eliminar el IVA del descuento antes de crear la nota.
                discount = parseFloat((discount / 1.16).toFixed(2));
                // @ts-ignore
                let invoice: Invoice = receipt.invoice ? receipt.invoice : new Invoice();
                // let invoice: Invoice = receipt.invoice ? JSON.parse('{ value: "dummy" }') : new Invoice();
                let creditNote: any = {
                    invoiceId: invoice._id,
                    relationshipType: '01',
                    cfdiUse: 'G02',
                    paymentForm: '01',
                    paymentMethod: 'PUE',
                    concepts: [
                        {
                            concept: 'Descuento del mes de marzo de 2020',
                            quantity: 1,
                            unitCost: discount,
                            productCode: '81161700',
                            unitCode: 'E48'
                        }
                    ]
                }
                try {
                    await invoiceModelV2.postCreditNoteV2(creditNote);
                } catch(error) {
                    // console.log('Error (nota de crédito): ', error);
                    continue;
                }
            }

            console.log(`Proceso de eliminación de descuentos terminado: ${new Date()}`);
            return resolve({
                status: 200,
                message: 'Proceso terminado con éxito.'
            })
        });
    }

    //DDDD  EEEEE L     EEEEE TTTTT EEEEE
    //D   D E     L     E       T   E
    //D   D EEE   L     EEE     T   EEE
    //D   D E     L     E       T   E
    //DDDD  EEEEE LLLLL EEEEE   T   EEEEE

    public deleteReceipt(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.finance.receipts.deleteReceipt, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
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

    //PPPP  RRRR   OOO   CCCC EEEEE  SSSS  OOO   SSSS
    //P   P R   R O   O C     E     S     O   O S
    //PPPP  RRRR  O   O C     EEE    SSS  O   O  SSS
    //P     R   R O   O C     E         S O   O     S
    //P     R   R  OOO   CCCC EEEEE SSSS   OOO  SSSS

    public getPDFBase64FromReceipt(receipt: Receipt): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            //BBBB   AAA  L      AAA  N   N  CCCC EEEEE
            //B   B A   A L     A   A NN  N C     E
            //BBBB  AAAAA L     AAAAA N N N C     EEE
            //B   B A   A L     A   A N  NN C     E
            //BBBB  A   A LLLLL A   A N   N  CCCC EEEEE
            
            let balance: any = {};
            let account: Account = new Account();
            let client: Client = new Client();
            if(receipt.parentType === 'account') {
                let balanceModel: BalanceModel = new BalanceModel();
                try {
                    balance = await balanceModel.getAccountFullBalanceUGLY({ accountNumber: receipt.parentId });
                    account = balance.account;
                    client = balance.client;
                } catch(error) {
                    return reject(error);
                }
            } else {
                return reject({
                    status: 400,
                    module: 'Recibos',
                    message: 'El recibo no pertenece a una cuenta.'
                });
            }
    
            //PPPP  DDDD  FFFFF
            //P   P D   D F
            //PPPP  D   D FFF
            //P     D   D F
            //P     DDDD  F

            let pdfToBase64: string ='';
            try {
                // Dirección.
                let address: any = account.address;
                let location: any = address.extraDetails;
                let address1: string = `${address.street || ''}, ${address.outdoorNumber || 'S/N'}, ${idx(location, _ => _.name) || ''}`;
                let address2: string = `C.P.: ${address.zipCode || ''}, ${idx(location, _ => _.town.name) || ''}, ${idx(location, _ => _.state.name) || ''}`;
                // Fecha del recibo.
                let receiptDate: Date = new Date(receipt.movementDate);
                // Referencias de pago.
                let paymentReferences: string[] = [];
                if(Array.isArray(account.paymentReferences) && account.paymentReferences.length > 0) {
                    for(const reference of account.paymentReferences) {
                        switch(reference.referenceName) {
                            case 'BBVA Bancomer':
                                paymentReferences[1] = reference.reference;
                                break;
                            case 'Banco del Bajío':
                                paymentReferences[0] = reference.reference;
                                break;
                        }
                    }
                }
                // Fecha de vencimiento.
                let dueDate:Date = new Date(receiptDate.getFullYear(), receiptDate.getMonth() + 1, 0);
                // Conceptos.
                // Se debe dar fomato a las cantidades.
                let concepts: Array<{ productName: string, total: string }> = [];
                for(const item of receipt.items) {
                    concepts.push({
                        productName: item.productName,
                        total: `$${currencyFormat.format(item.total || 0)}`
                    });
                }
                // Últimos movimientos.
                let lastMovements: Array<{ type: string, date: string, total: string }> = [];
                if(Array.isArray(balance.balance) && balance.balance.length > 0) {
                    let index: number = balance.balance.length - 5;
                    for(index; index < balance.balance.length; index++) {
                        lastMovements.push({
                            type: balance.balance[index].type === 'charge' ? 'Recibo' : 'Pago',
                            date: date2StringFormat(new Date(balance.balance[index].date), 'DD/MM/YYYY'),
                            total: balance.balance[index].type === 'charge' ? `$${currencyFormat.format(balance.balance[index].charge)}` : `$${currencyFormat.format(balance.balance[index].payment)}`
                        });
                    }
                }
                // Datos completos.
                // NOTE: Como aquí lo único constante es el cambio, ahora se debe utilizar la razón social en lugar del nombre del cliente en recibos sin timbrar ¯\_(ツ)_/¯.
                let ejsData: any = {
                    receipt: {
                        folio: receipt.folio,
                        dueDate: date2StringFormat(dueDate, 'DD/MM/YYYY'), // receipt.movementDate.substring(0,10),
                        month: number2Month(receiptDate.getMonth() + 1),
                        date: date2StringFormat(receiptDate, 'DD/MM/YYYY'),
                        concepts, // : receipt.items,
                        subTotal: `$${currencyFormat.format(receipt.subTotal)}`,
                        discount: `$${currencyFormat.format(receipt.discount)}`,
                        taxes: `$${currencyFormat.format(receipt.taxes)}`,
                        total: `$${currencyFormat.format(receipt.total)}`,
                        totalInText: number2Words(receipt.total, receipt.currencyValue)
                    },
                    client: {
                        // name: `${client.firstName || ''} ${client.secondName || ''} ${client.firstLastName || ''} ${client.secondLastName || ''}`,
                        name: idx(client, _ => _.businessData.businessName) || '',
                        address1,
                        address2,
                        rfc: idx(client, _ => _.businessData.rfc) || ''
                    },
                    account: {
                        accountNumber: account.accountNumber,
                        paymentReferences,
                        phone: account.phone || '-'
                    },
                    document: {
                        page: 1,
                        totalPages: 1
                    },
                    balance: {
                        // NOTE: Por cuestiones estúpidas, el signo del total en el balance está invertido 
                        // NOTE: Si el recibo ya existe, el total adeudado ya se está sumando en el balance.
                        total: `$${currencyFormat.format((balance.total * -1)/* + receipt.total*/)}`,
                        lastMovements
                    },
                    currentDate: date2StringFormat(new Date(), 'DD/MM/YYYY')
                };
                // Se crea ahora si el PDF.
                let pdfToBase64Result = await pdf2Base64('../templates/receipt.v1.ejs', ejsData);
                pdfToBase64 = pdfToBase64Result.data;
                // Se devuelve el resultado.
                return resolve({
                    pdf: pdfToBase64
                });
            } catch(error) {
                return reject(error);
            }
        });
    }

    public getPDFFromReceipt(query: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let { _id, id, folio, replace, ...rest }: { _id: string, id: string, folio: string, replace: boolean } & any = query;
            replace = (typeof replace === 'string') ? JSON.parse(replace) : false;

            //RRRR  EEEEE  CCCC IIIII BBBB   OOO
            //R   R E     C       I   B   B O   O
            //RRRR  EEE   C       I   BBBB  O   O
            //R   R E     C       I   B   B O   O
            //R   R EEEEE  CCCC IIIII BBBB   OOO

            let receipt: Receipt = new Receipt();
            try {
                receipt = await this.getReceipt({ _id, folio });
            } catch(error) {
                return reject(error);
            }
            if(['cancelled', 'error'].indexOf(receipt.statusValue) >= 0) {
                return reject({
                    status: 400,
                    module: 'Recibos',
                    message: 'El recibo debe estar activo, pendiente o pagado.'
                });
            }

            //BBBB   AAA  L      AAA  N   N  CCCC EEEEE
            //B   B A   A L     A   A NN  N C     E
            //BBBB  AAAAA L     AAAAA N N N C     EEE
            //B   B A   A L     A   A N  NN C     E
            //BBBB  A   A LLLLL A   A N   N  CCCC EEEEE
            
            let balance: { account: Account, client: Client, balance: Array<IUglyBalance>, total: number} = {
                account: new Account(),
                client: new Client(),
                balance: [],
                total: 0
            };
            let account: Account = new Account();
            let client: Client = new Client();
            if(receipt.parentType === 'account') {
                let balanceModel: BalanceModel = new BalanceModel();
                try {
                    balance = await balanceModel.getAccountFullBalanceUGLY({ accountNumber: receipt.parentId });
                    account = balance.account;
                    client = balance.client;
                } catch(error) {
                    return reject(error);
                }
            } else {
                return reject({
                    status: 400,
                    module: 'Recibos',
                    message: 'El recibo no pertenece a una cuenta.'
                });
            }

            //TTTTT EEEEE L     EEEEE FFFFF  OOO  N   N  OOO
            //  T   E     L     E     F     O   O NN  N O   O
            //  T   EEE   L     EEE   FFF   O   O N N N O   O
            //  T   E     L     E     F     O   O N  NN O   O
            //  T   EEEEE LLLLL EEEEE F      OOO  N   N  OOO

            // NOTE: Sólo se debe revisar si la cuenta es maestra, para hacer la búsqueda en las cuentas relacionadas.
            let phone: string = account.phone || '--';
            if(account.isMaster) {
                // Se obtienen todas las cuentas asociadas.
                let accountModel: AccountModel = new AccountModel();
                let getAccounts: { results: Array<Account>, summary: any } = { results: [], summary: {} };
                try {
                    getAccounts = await accountModel.getAccounts({ masterReference: account.accountNumber });
                } catch(error) {
                    // NOTE: Aún no sé si se deba hacer algo aquí.
                }
                // Se recorren todas las cuentas asociadas, si existen.
                let phones: Array<string> = [];
                if(getAccounts.results.length > 0) {
                    for(const slaveAccount of getAccounts.results) {
                        if(typeof slaveAccount.phone === 'string' && slaveAccount.phone.length > 0) {
                            phones.push(slaveAccount.phone);                        }
                    }
                }
                // Se revisa si se encontró al menos 1 resultado.
                if(phones.length > 0) {
                    // FIX: Se debe revisar cuál teléfono se va a agregar.
                    phone = phones[0];
                }
            }

            //FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA
            //F     A   A C       T   U   U R   R A   A
            //FFF   AAAAA C       T   U   U RRRR  AAAAA
            //F     A   A C       T   U   U R   R A   A
            //F     A   A  CCCC   T    UUU  R   R A   A

            let pdfTemplate: string = '../templates/receipt.v1.ejs';
            let errors: Array<any> = [];
            // @ts-ignore
            let invoice: Invoice = receipt.invoice; // new Invoice();
            let invoiceModel: InvoiceModel = new InvoiceModel();
            let invoiceEJS: any = {};
            let invoiceConcepts: Array<Item> = [];
            let invoiceTotal: number = 0;
            // if(typeof receipt.invoice === 'string' && receipt.invoice.length > 0) {
            if(!isEmpty(receipt.invoice)) {
                
                // try {
                //     invoice = await invoiceModel.getInvoice({ _id: receipt.invoice });
                //     invoiceJSON = JSON.parse(invoice.json);
                // } catch(error) {
                //     errors.push(error);
                // }
                
                //EEEEE JJJJJ  SSSS
                //E       J   S
                //EEE     J    SSS
                //E     J J       S
                //EEEEE  J    SSSS
                
                pdfTemplate = '../templates/receipt.v2.ejs';
                let invoiceJSON: any = JSON.parse(invoice.json);
                invoiceTotal = parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Total']) || '0.00').toString());
                let jsonConcepts: any = idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']);
                if(Array.isArray(jsonConcepts) && jsonConcepts.length > 0) {
                    for(const jsonConcept of jsonConcepts) {
                        invoiceConcepts.push({
                            amount: parseFloat((idx(jsonConcept, _ => _['_attributes']['Cantidad']) || 1).toString()),
                            // @ts-ignore
                            key: idx(jsonConcept, _ => _['_attributes']['NoIdentificacion']) || receipt.parentId,
                            unitKey: idx(jsonConcept, _ => _['_attributes']['ClaveUnidad']) || 'E48',
                            serviceKey: idx(jsonConcept, _ => _['_attributes']['ClaveProdServ']),
                            description: (idx(jsonConcept, _ => _['_attributes']['Descripcion']) || '').toString(),
                            // @ts-ignore
                            unitCost: `$${currencyFormat.format(parseFloat((idx(jsonConcept, _ => _['_attributes']['ValorUnitario']) || '0.00').toString()))}`,
                            // @ts-ignore
                            total: `$${currencyFormat.format(parseFloat((idx(jsonConcept, _ => _['_attributes']['Importe']) || '0.00').toString()))}`
                        });
                    }
                } else if(!isEmpty(jsonConcepts) && jsonConcepts.hasOwnProperty('_attributes')) {
                    invoiceConcepts.push({
                        amount: parseFloat((idx(jsonConcepts, _ => _['_attributes']['Cantidad']) || 1).toString()),
                        // @ts-ignore
                        key: idx(jsonConcept, _ => _['_attributes']['NoIdentificacion']) || receipt.parentId,
                        unitKey: idx(jsonConcepts, _ => _['_attributes']['ClaveUnidad']) || 'E48',
                        serviceKey: idx(jsonConcepts, _ => _['_attributes']['ClaveProdServ']),
                        description: (idx(jsonConcepts, _ => _['_attributes']['Descripcion']) || '').toString(),
                        // @ts-ignore
                        unitCost: `$${currencyFormat.format(parseFloat((idx(jsonConcepts, _ => _['_attributes']['ValorUnitario']) || '0.00').toString()))}`,
                        // @ts-ignore
                        total: `$${currencyFormat.format(parseFloat((idx(jsonConcepts, _ => _['_attributes']['Importe']) || '0.00').toString()))}`
                    });
                }
                invoiceEJS = {
                    folio: `${invoice.serie.toUpperCase()}-${invoice.folio}`,
                    uuid: invoice.uuid,
                    stampingDate: idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Fecha']),
                    csd: idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['NoCertificado']),
                    satCSD: idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes']['NoCertificadoSAT']),
                    cfdiUse: idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Receptor']['_attributes']['UsoCFDI']),
                    paymentForm: idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['FormaPago']),
                    paymentMethod: idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['MetodoPago']),
                    subtotal: `$${currencyFormat.format(parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['SubTotal']) || '0.00').toString()))}`,
                    discount: `$${currencyFormat.format(parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Descuento']) || '0.00').toString()))}`,
                    total: `$${currencyFormat.format(parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Total']) || '0.00').toString()))}`,
                    taxes: `$${currencyFormat.format(parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Impuestos']['_attributes']['TotalImpuestosTrasladados']) || '0.00').toString()))}`,
                    totalInText: number2Words(parseFloat((idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Total']) || '0.00').toString()), (idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Moneda']) || 'MXN').toString()),
                    qrCode: invoice.qrCode,
                    originalString: invoice.originalString || '',
                    concepts: invoiceConcepts,
                    cfdiStamp: idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes']['SelloCFD']),
                    satStamp: idx(invoiceJSON, _ => _['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes']['SelloSAT']),
                    // TODO: Revisar si de debe obtener de la factura o de la información que se guarda en el recibo.
                    currency: (idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['Moneda']) || 'MXN').toString(),
                    exchangeRate: (idx(invoiceJSON, _ => _['cfdi:Comprobante']['_attributes']['TipoCambio']) || '1').toString()
                };
            }

            //

            let contacts: Array<Contact> = account.contacts ? account.contacts.results : [];
            let email: string = '';
            if(Array.isArray(contacts) && contacts.length > 0) {
                for(const contact of contacts) {
                    if(Array.isArray(contact.contactMeans) && contact.contactMeans.length > 0) {
                        for(const contactMean of contact.contactMeans) {
                            // Correo electrónio.
                            if(contactMean.contactMeanName === 'email' && contactMean.notify) {
                                if(!email) email = contactMean.value;
                            }
                            // Teléfono (si no se cuenta con alguno válido).
                            if(isNaN(parseInt(phone))) {
                                if(contactMean.contactMeanName === 'mobilePhone'/* && contactMean.notify*/) {
                                    phone = contactMean.value;
                                }
                            }
                        }
                    }
                }
            }
            // Se deben revisar que los valores sean correctos de lo contrario se debe utilizar un valor por defecto.
            if(!email) email = 'admin@domain.com';
            if(isNaN(parseInt(phone))) phone = '4426280000';
    
            // CCCC  OOO  N   N EEEEE K   K TTTTT  AAA
            //C     O   O NN  N E     K  K    T   A   A
            //C     O   O N N N EEE   KKK     T   AAAAA
            //C     O   O N  NN E     K  K    T   A   A
            // CCCC  OOO  N   N EEEEE K   K   T   A   A

            // NOTE: La orden a Conekta se debe tomar de la factura primero, si el recibo no tiene entonces se tomará del mismo recibo.
            let conektaModel: ConektaModel = new ConektaModel();
            let order: IRetailOrder = {
                // accountNumber: receipt.parentId,
                currency: 'MXN',
                // @ts-ignore
                customer_info: {
                    name: idx(client, _ => _.businessData.businessName) || '',
                    phone,
                    email
                },
                line_items: [],
                object: 'order'
            };
            // Teléfono y correo electrónico.
            // NOTE: Ya ser revisa arriba, entonces esto ya no es necesario.
            // if(!isNaN(parseInt(phone))) order.customer_info.phone = phone;
            let line_items: Array<IProduct> = [];
            // Se obtienen los cargos de la orden.
            
            // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
            // Las cantidades se manejan siempre en centavos... por lo que hay que multiplicar todo por 100 ¯\_ʕ•ᴥ•ʔ_/¯

            // NOTA: Se va a crear una sola línea de cobro con el total ya sea de la factura o del recibo.
            // FACTURA:
            if(!isEmpty(receipt.invoice)) {
                /*
                for(const concept of invoiceConcepts) {
                    line_items.push({
                        // @ts-ignore
                        name: concept.description,
                        unit_price: (concept.unitCost ? parseFloat(concept.unitCost.toString().replace('$', '')) : 0) * 100,
                        quantity: concept.quantity || 1
                    });
                    // TODO: Conciderar las líneas que tienen descuento.
                }
                */
                line_items.push({
                    name: 'Servicio de telecomunicaciones',
                    unit_price: invoiceTotal * 100,
                    quantity: 1
                });
            } else {
                // RECIBO:
                /*
                for(const item of receipt.items) {
                    line_items.push({
                        name: item.productName,
                        unit_price: (item.unitCost || 0) * 100,
                        quantity: item.quantity || 1
                    });
                    // TODO: Conciderar las líneas que tienen descuento.
                }
                */
                line_items.push({
                    name: 'Servicio de telecomunicaciones',
                    unit_price: receipt.total * 100,
                    quantity: 1
                });
            }
            order.line_items = line_items;
            // Se manda obtener la orden a Conekta.
            let reference: any;
            try {
                let result: any = await conektaModel.postRetailerOrder(order);
                // Referencia a convertir en código de barras.
                reference = idx(result, _ => _.charges.data[0].payment_method.reference) || '';
            } catch(error) {
                // return reject(error);
                reference = undefined;
            }

            // Código de barras.

            let barcode: string = '';
            if(reference) {
                try {
                    barcode = await conektaModel.getBarcode({ value: reference, height: 95, width: 227 });
                } catch(error) {
                    // return reject(error);
                    barcode = '';
                }
            }

            //PPPP  DDDD  FFFFF
            //P   P D   D F
            //PPPP  D   D FFF
            //P     D   D F
            //P     DDDD  F

            let pdfToBase64: string ='';
            try {
                // Dirección.
                let address: any = client.address;
                let location: any = address.extraDetails;
                let address1: string = `${address.street || ''}, ${address.outdoorNumber || 'S/N'}${address.interiorNumber ? ` int. ${address.interiorNumber},` : ','} ${idx(location, _ => _.name) || ''}`;
                let address2: string = `C.P.: ${address.zipCode || ''}, ${idx(location, _ => _.town.name) || ''}, ${idx(location, _ => _.state.name) || ''}`;
                // Fecha del recibo.
                let receiptDate: Date = new Date(receipt.movementDate);
                // Referencias de pago.
                let paymentReferences: string[] = [];
                if(Array.isArray(account.paymentReferences) && account.paymentReferences.length > 0) {
                    for(const reference of account.paymentReferences) {
                        switch(reference.referenceName) {
                            case 'BBVA Bancomer':
                                paymentReferences[1] = reference.reference;
                                break;
                            case 'Banco del Bajío':
                                paymentReferences[0] = reference.reference;
                                break;
                            case 'MONEX':
                                paymentReferences[2] = reference.reference;
                                break;
                        }
                    }
                }
                // Fecha de vencimiento.
                let dueDate:Date = new Date(receiptDate.getFullYear(), receiptDate.getMonth() + 1, 0);
                // Conceptos.
                // Se debe dar fomato a las cantidades.
                let concepts: Array<{ productName: string, total: string }> = [];
                for(const item of receipt.items) {
                    concepts.push({
                        productName: item.productName,
                        total: `$${currencyFormat.format(item.total || 0)}`
                    });
                }
                // Últimos movimientos.
                let lastMovements: Array<{ type: string, date: string, total: string }> = [];
                if(Array.isArray(balance.balance) && balance.balance.length > 0) {
                    let notCancelledItems: Array<IUglyBalance> = balance.balance.filter((item: IUglyBalance) => {
                        return ['cancelled', 'error'].indexOf(item.status) < 0;
                    });
                    let index: number = notCancelledItems.length > 5 ? notCancelledItems.length - 5 : 0;
                    for(index; index < notCancelledItems.length; index++) {
                        lastMovements.push({
                            type: notCancelledItems[index].type === 'charge' ? 'Recibo' : 'Pago',
                            date: date2StringFormat(new Date(notCancelledItems[index].date), 'DD/MM/YYYY'),
                            total: notCancelledItems[index].type === 'charge' ? `$${currencyFormat.format(notCancelledItems[index].charge)}` : `$${currencyFormat.format(notCancelledItems[index].payment)}`
                        });
                    }
                    /*
                    let index: number = balance.balance.length > 5 ? balance.balance.length - 5 : 0;
                    for(index; index < balance.balance.length; index++) {
                        lastMovements.push({
                            type: balance.balance[index].type === 'charge' ? 'Recibo' : 'Pago',
                            date: date2StringFormat(new Date(balance.balance[index].date), 'DD/MM/YYYY'),
                            total: balance.balance[index].type === 'charge' ? `$${currencyFormat.format(balance.balance[index].charge)}` : `$${currencyFormat.format(balance.balance[index].payment)}`
                        });
                    }
                    */
                }
                // Total.
                // Datos completos.
                // NOTE: Como aquí lo único constante es el cambio, ahora se debe utilizar la razón social en lugar del nombre del cliente en recibos sin timbrar ¯\_(ツ)_/¯.
                let ejsData: any = {
                    receipt: {
                        folio: receipt.folio,
                        dueDate: date2StringFormat(dueDate, 'DD/MM/YYYY'), // receipt.movementDate.substring(0,10),
                        month: number2Month(receiptDate.getMonth() + 1),
                        date: date2StringFormat(receiptDate, 'DD/MM/YYYY'),
                        concepts, // : receipt.items,
                        subTotal: `$${currencyFormat.format(receipt.subTotal)}`,
                        discount: `$${currencyFormat.format(receipt.discount)}`,
                        taxes: `$${currencyFormat.format(receipt.taxes)}`,
                        total: `$${currencyFormat.format(receipt.total)}`,
                        totalInText: number2Words(receipt.total, receipt.currencyValue)
                    },
                    client: {
                        // name: `${client.firstName || ''} ${client.secondName || ''} ${client.firstLastName || ''} ${client.secondLastName || ''}`,
                        name: idx(client, _ => _.businessData.businessName) || '',
                        address1,
                        address2,
                        rfc: idx(client, _ => _.businessData.rfc) || '',
                        businessData: {
                            businessName: idx(client, _ => _.businessData.businessName) || '',
                            issuingAccountNumber: idx(client, _ => _.businessData.issuingAccountNumber) || '',
                            issuingBankRfc: idx(client, _ => _.businessData.issuingBankRfc) || '',
                            issuingBankName: idx(client, _ => _.businessData.issuingBankName) || ''
                        }
                    },
                    account: {
                        accountNumber: account.accountNumber,
                        paymentReferences,
                        phone
                    },
                    document: {
                        page: 1,
                        totalPages: 1
                    },
                    balance: {
                        // NOTE: Por cuestiones estúpidas, el signo del total en el balance está invertido 
                        // NOTE: Si el recibo ya existe, el total adeudado ya se está sumando en el balance.
                        total: `$${currencyFormat.format((balance.total * -1)/* + receipt.total*/)}`,
                        lastMovements
                    },
                    currentDate: date2StringFormat(new Date(), 'DD/MM/YYYY'),
                    barcode: barcode !== '' ? `data:image/png;base64,${barcode}` : '',
                    // EXTRA: Si se enviaron datos de la factura, se deben agregar.
                    invoice: invoiceEJS
                };
                // Se crea ahora si el PDF.
                let pdfToBase64Result = await pdf2Base64(pdfTemplate, ejsData);
                pdfToBase64 = pdfToBase64Result.data;
            } catch(error) {
                return reject(error);
            }
            // Si se logró generar el recibo, se guarda el archivo y se actualiza el recibo.
            if(pdfToBase64.length > 0 && replace) {
                                    
                // AAA  RRRR   CCCC H   H IIIII V   V  OOO
                //A   A R   R C     H   H   I   V   V O   O
                //AAAAA RRRR  C     HHHHH   I   V   V O   O
                //A   A R   R C     H   H   I    V V  O   O
                //A   A R   R  CCCC H   H IIIII   V    OOO

                let id = receipt.parentId;
                let category = 'receipts';
                let company = configuration.company.name;
                let pdfBuffer: Buffer | undefined;
                pdfBuffer = Buffer.from(pdfToBase64, 'base64');
                let receiptFile: string = '';
                if(pdfBuffer){
                    try {
                        // Se guarda el archivo.
                        let fileModel: FilesModel = new FilesModel();
                        let _file: any = await fileModel.postFileFromBuffer(pdfBuffer, 'application/pdf', `${receipt.folio}.pdf`, id, category, company);
                        receiptFile = _file.path;
                        // MAYBE: Preguntar si el archivo se va a enviar por correo.
                        // Se agrega el archivo a los archivos adjuntos.
                        // attachments.push({
                        //     type: 'application/pdf',
                        //     name: 'Recibo.pdf',
                        //     content: receiptPDF // pdfBuffer.toString('base64')
                        // });
                    } catch(error) {
                        // Ocurrió un error al guardar el PDF pero se debe continuar con la ejecución.
                        errors.push(error);
                    }
                }

                // AAA   CCCC TTTTT U   U  AAA  L     IIIII ZZZZZ  AAA   CCCC IIIII  OOO  N   N
                //A   A C       T   U   U A   A L       I      Z  A   A C       I   O   O NN  N
                //AAAAA C       T   U   U AAAAA L       I     Z   AAAAA C       I   O   O N N N
                //A   A C       T   U   U A   A L       I    Z    A   A C       I   O   O N  NN
                //A   A  CCCC   T    UUU  A   A LLLLL IIIII ZZZZZ A   A  CCCC IIIII  OOO  N   N

                if(receiptFile.length > 0) {
                    try {
                        await this.putReceipt({ folio: receipt.folio, receiptFile });
                        receipt.receiptFile = receiptFile;
                    } catch(error) {
                        // Ocurrió un error al actualizar el recibo, pero se debe continuar con la ejecución.
                        errors.push(error);
                    }
                }
            }

            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

            return resolve({
                pdf: pdfToBase64,
                errors
            });
        });
    }

    public getPendingReceipts(query: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let { month, year, ...rest }: { month: string | number, year: string} & any = query;
            // Fechas.
            month = (typeof month === 'string') ? parseInt(month) : month;
            month -= 1;
            year = (typeof year === 'string') ? parseInt(year) : year;
            let nextMonth: number = month + 1;
            let start: string = date2StringFormat(new Date(year, month, 1), 'YYYY-MM-DD');
            let end: string = date2StringFormat(new Date(year, nextMonth, 0), 'YYYY-MM-DD');
            // console.log(start);
            // console.log(end);

            //RRRR  EEEEE  CCCC IIIII BBBB   OOO   SSSS
            //R   R E     C       I   B   B O   O S
            //RRRR  EEE   C       I   BBBB  O   O  SSS
            //R   R E     C       I   B   B O   O     S
            //R   R EEEEE  CCCC IIIII BBBB   OOO  SSSS

            // 1. Se obtienen todos los recibos pendientes del periodo.
            let getReceipts: { results: Array<Receipt>, summary: any } = { results: [], summary: {} };
            try {
                // { movementDate:{ $gte: ISODate('2019-9-1'), $lte: ISODate('2019-9-30') }, statusValue: 'pending', total: { $gt: 0 } }
                let params = {
                    all: true,
                    movementDate: { "start": start, "end": end },
                    statusValue: "pending"
                };
                getReceipts = await this.getReceipts(params);
            } catch(error) {
                return reject(error);
            }
            // 2. Se revisan y filtran todos los recibos.
            // console.log(`Total de recibos: ${getReceipts.results.length}`);
            if(getReceipts.results.length > 0) {
                let results: Array<IPendingReceipt> = [];
                let summary: { quantity: number, amount: number } = { quantity: 0, amount: 0 };
                let slaveAccounts: number = 0;
                for(const receipt of getReceipts.results) {
                    // Se revisa que el total sea mayor a 0.
                    if(receipt.total > 0 && receipt.parentType === 'account') {
                                                
                        // CCCC U   U EEEEE N   N TTTTT  AAA
                        //C     U   U E     NN  N   T   A   A
                        //C     U   U EEE   N N N   T   AAAAA
                        //C     U   U E     N  NN   T   A   A
                        // CCCC  UUU  EEEEE N   N   T   A   A
                        
                        // Se obtiene la cuenta a la que pertenece.
                        let account: Account = new Account();
                        let client: Client = new Client();
                        let accountModel: AccountModel = new AccountModel();
                        try {
                            account = await accountModel.getAccount({ accountNumber: receipt.parentId });
                            client = account.client || new Client();
                        } catch(error) {
                            // Si no se encuentra la cuenta se continúa con el siguiente recibo.
                            continue;
                        }
                        // Se revisa que la cuenta no sea una cuenta "esclava".
                        if(!account.masterReference || typeof account.masterReference !== 'string' || account.masterReference === '') {
                            // console.log(`Referencia maestra: ${account.masterReference}`);
                            // console.log(`¿Es maestra? R=${account.isMaster}`);

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
                                getPayments = await paymentModel.getPayments({ 'details.receiptId': receipt._id });
                            } catch(error) {
                                // Si ocurre algún error se continúa con el siguiente recibo.
                                // Más bien no, se dejan las cantidades en 0 y se continúa.
                                // continue;
                            }
                            // Si se encontraron pagos, se suman los montos que pertenecen al recibo.
                            
                            // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                            // Se puden separar los pagos "normales" de los "acreditados" aquí.

                            if(getPayments.results.length > 0) {
                                for(const payment of getPayments.results) {
                                    if((Array.isArray(payment.details) && payment.details.length > 0) && payment.statusValue !== 'credit') {
                                        for(const detail of payment.details) {
                                            if(detail.receiptId === receipt._id) {
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

                            pendingAmount = parseFloat((receipt.total - paidAmount - creditedAmount).toFixed(2));
                            pendingAmount = pendingAmount < 0 ? 0 : pendingAmount;
                            pendingAmount = parseFloat(pendingAmount.toFixed(2));
                            
                            // Resultados.
                            results.push({
                                receipt,
                                accountNumber: account.accountNumber,
                                clientFolio: client.folio,
                                creditedAmount,
                                paidAmount,
                                pendingAmount
                            });
                            // Resumen.
                            summary.quantity++;
                            summary.amount = parseFloat((summary.amount + pendingAmount).toFixed(2));
                            // process.stdout.write(`Recibos pendientes: ${summary.quantity}\r`);
                        } else {
                            // console.log(`Referencia maestra: ${account.masterReference}`);
                            // console.log(`¿Es maestra? R=${account.isMaster}`);
                            slaveAccounts++;
                            // process.stdout.write(`Cuentas esclavas: ${slaveAccounts}\r`);
                        }
                    }
                }
                // console.log(`Cuentas esclavas (no se tomaron en cuenta): ${slaveAccounts}`);
                // console.log('Proceso terminado.');
                
                //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
                //R   R E     S     U   U L       T   A   A D   D O   O
                //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
                //R   R E         S U   U L       T   A   A D   D O   O
                //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
                
                return resolve({
                    status: 200,
                    results,
                    summary
                })
            } else {
                return reject({
                    status: 404,
                    message: 'No se encontró ningún recibo pendiente dentro del periodo.'
                });
            }
        });
    }

    public async getPendingReceiptsV2(request: Request, response: Response): Promise<any> {
        // return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            /*
            let report: any = require('../auxiliar/reports/pending-receipts-09-19.json');
            let counter: number = 0;
            for(const receipt of report.results) {
                if(receipt.pendingAmount <= 200) counter++;
            }
            response.write(`{"counter":${counter}}`);
            return response.end();
            */

            /*
            //send multiple responses to the client
            for(let i: number = 0; i <=  5; i++) {
                response.write(JSON.stringify({ message: `Part #:${i}` }));
            }
            //end the response process
            response.end();
            */
            
            // Experimento: Se manda la respuesta por partes, y debe ser un arreglo, por lo que se envía primero un corchete.
            response.write('{ "results": [');

            let { month, year, ...rest }: { month: string | number, year: string} & any = request.query;
            // Fechas.
            month = (typeof month === 'string') ? parseInt(month) : month;
            month -= 1;
            year = (typeof year === 'string') ? parseInt(year) : year;
            let nextMonth: number = month + 1;
            let start: string = date2StringFormat(new Date(year, month, 1), 'YYYY-MM-DD');
            let end: string = date2StringFormat(new Date(year, nextMonth, 0), 'YYYY-MM-DD');

            //RRRR  EEEEE  CCCC IIIII BBBB   OOO   SSSS
            //R   R E     C       I   B   B O   O S
            //RRRR  EEE   C       I   BBBB  O   O  SSS
            //R   R E     C       I   B   B O   O     S
            //R   R EEEEE  CCCC IIIII BBBB   OOO  SSSS

            // 1. Se obtienen todos los recibos pendientes del periodo.
            let getReceipts: { results: Array<Receipt>, summary: any } = { results: [], summary: {} };
            try {
                // { movementDate:{ $gte: ISODate('2019-9-1'), $lte: ISODate('2019-9-30') }, statusValue: 'pending', total: { $gt: 0 } }
                let params = {
                    all: true,
                    movementDate: { "start": start, "end": end },
                    statusValue: "pending"
                };
                getReceipts = await this.getReceipts(params);
            } catch(error) {
                response.status(400).end(JSON.stringify(error));
            }
            // 2. Se revisan y filtran todos los recibos.
            // console.log(`Total de recibos: ${getReceipts.results.length}`);
            if(getReceipts.results.length > 0) {
                let results: Array<IPendingReceipt> = [];
                let summary: { total: number, quantity: number, amount: number } = { total: getReceipts.summary.total, quantity: 0, amount: 0 };
                let slaveAccounts: number = 0;
                for(const receipt of getReceipts.results) {
                    // Se revisa que el total sea mayor a 0.
                    if(receipt.total > 0 && receipt.parentType === 'account') {
                                                
                        // CCCC U   U EEEEE N   N TTTTT  AAA
                        //C     U   U E     NN  N   T   A   A
                        //C     U   U EEE   N N N   T   AAAAA
                        //C     U   U E     N  NN   T   A   A
                        // CCCC  UUU  EEEEE N   N   T   A   A
                        
                        // Se obtiene la cuenta a la que pertenece.
                        let account: Account = new Account();
                        // let client: Client = new Client();
                        let accountModel: AccountModel = new AccountModel();
                        try {
                            account = await accountModel.getAccountSimple({ accountNumber: receipt.parentId });
                            // client = account.client || new Client();
                        } catch(error) {
                            // Si no se encuentra la cuenta se continúa con el siguiente recibo.
                            continue;
                        }
                        // Tiempo: 3m 19.53s
                        /*
                        "summary": {
                            "total": 763,
                            "quantity": 633,
                            "amount": 661003.84
                        }
                        */
                        // Se revisa que la cuenta no sea una cuenta "esclava".
                        if(!account.masterReference || typeof account.masterReference !== 'string' || account.masterReference === '') {
                            // console.log(`Referencia maestra: ${account.masterReference}`);
                            // console.log(`¿Es maestra? R=${account.isMaster}`);

                            //PPPP   AAA   GGGG  OOO   SSSS
                            //P   P A   A G     O   O S
                            //PPPP  AAAAA G  GG O   O  SSS
                            //P     A   A G   G O   O     S
                            //P     A   A  GGGG  OOO  SSSS

                            // Se obtienen los pagos realizados al recibo.
                            let paidAmount: number = 0;
                            let pendingAmount: number = 0;
                            // let getPayments: { results: Array<Payment>, summary: any } = { results: [], summary: {} };
                            let paymentModel: PaymentModel = new PaymentModel();
                            /*
                            OPCIÓN #1: Solicitar todos los pagos y recorrerlos 1 a 1 filtrando por recibo.
                            try {
                                getPayments = await paymentModel.getPayments({ 'details.receiptId': receipt._id, statusValue: ['paid', 'assigned', 'advanced', 'unassigned'] });
                            } catch(error) {
                                // Si ocurre algún error se continúa con el siguiente recibo.
                                // Más bien no, se dejan las cantidades en 0 y se continúa.
                                // continue;
                            }
                            // Si se encontraron pagos, se suman los montos que pertenecen al recibo.
                            if(getPayments.results.length > 0) {
                                for(const payment of getPayments.results) {
                                    if(Array.isArray(payment.details) && payment.details.length > 0) {
                                        for(const detail of payment.details) {
                                            if(detail.receiptId === receipt._id) {
                                                paidAmount += detail.amount;
                                            }
                                        }
                                    }
                                }
                            }
                            */
                            // OPCIÓN #2: Utilizando la función de agregasión.
                            // Tiempo: 10m 54.86s
                            /*
                            "summary": {
                                "total": 763,
                                "quantity": 633,
                                "amount": 661003.84
                            }
                            */
                            // Tiempo: 2m 47.24s
                            /*
                            "summary": {
                                "total": 763,
                                "quantity": 644,
                                "amount": 661003.84
                            }
                            */
                            let getPayments: { total: number } = { total: 0 };
                            try {
                                getPayments = await paymentModel.getPayments4ReceiptTotal({ _id: receipt._id });
                                paidAmount = parseFloat(getPayments.total.toString());
                            } catch(error) {}
                            // Se agrega la información del recibo al arreglo del resultado.
                            paidAmount = (paidAmount <= receipt.total) ? parseFloat(paidAmount.toFixed(2)) : receipt.total;
                            pendingAmount = parseFloat((receipt.total - paidAmount).toFixed(2));
                            // Resultados.
                            response.write(`${(summary.quantity > 0 ? ',' : '')}${JSON.stringify({
                                // receipt,
                                folio: receipt.folio,
                                accountNumber: receipt.parentId, // account.accountNumber,
                                clientFolio: account.clientId, // client.folio,
                                paidAmount,
                                pendingAmount
                            })}`);
                            // Resumen.
                            summary.quantity++;
                            summary.amount = parseFloat((summary.amount + pendingAmount).toFixed(2));
                            // process.stdout.write(`Recibos pendientes: ${summary.quantity}\r`);
                        } else {
                            // console.log(`Referencia maestra: ${account.masterReference}`);
                            // console.log(`¿Es maestra? R=${account.isMaster}`);
                            slaveAccounts++;
                            // process.stdout.write(`Cuentas esclavas: ${slaveAccounts}\r`);
                        }
                    }
                }
                // console.log(`Cuentas esclavas (no se tomaron en cuenta): ${slaveAccounts}`);
                // console.log('Proceso terminado.');
                
                //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
                //R   R E     S     U   U L       T   A   A D   D O   O
                //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
                //R   R E         S U   U L       T   A   A D   D O   O
                //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

                // Experimento: Se manda la respuesta por partes, y debe ser un arreglo, por lo que se debe terminar con un corchete.
                response.write(`], "summary": ${JSON.stringify(summary)}`);
                response.write('}');
                response.end();
            } else {
                response.status(400).end(JSON.stringify({
                    status: 404,
                    message: 'No se encontró ningún recibo pendiente dentro del periodo.'
                }));
            }
        // });
    }

    public getReceiptDetails(query: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let { _id, ...rest }: { _id: string } & any = query;

            //RRRR  EEEEE  CCCC IIIII BBBB   OOO
            //R   R E     C       I   B   B O   O
            //RRRR  EEE   C       I   BBBB  O   O
            //R   R E     C       I   B   B O   O
            //R   R EEEEE  CCCC IIIII BBBB   OOO

            let receipt: Receipt = new Receipt();
            try {
                receipt = await this.getReceipt({ _id });
            } catch(error) {
                return reject(error);
            }
                                 
            // CCCC U   U EEEEE N   N TTTTT  AAA
            //C     U   U E     NN  N   T   A   A
            //C     U   U EEE   N N N   T   AAAAA
            //C     U   U E     N  NN   T   A   A
            // CCCC  UUU  EEEEE N   N   T   A   A
            
            // Se obtiene la cuenta a la que pertenece.
            let account: Account = new Account();
            let client: Client = new Client();
            let accountModel: AccountModel = new AccountModel();
            try {
                account = await accountModel.getAccount({ accountNumber: receipt.parentId });
                client = account.client || new Client();
            } catch(error) {
                return reject(error);
            }
            
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
                getPayments = await paymentModel.getPayments({ 'details.receiptId': receipt._id });
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
                            if(detail.receiptId === receipt._id) {
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

            pendingAmount = parseFloat((receipt.total - paidAmount - creditedAmount).toFixed(2));
            pendingAmount = pendingAmount < 0 ? 0 : pendingAmount;
            pendingAmount = parseFloat(pendingAmount.toFixed(2));
            
            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
            
            let result: IPendingReceipt = {
                receipt,
                accountNumber: account.accountNumber,
                clientFolio: client.folio,
                creditedAmount,
                paidAmount,
                pendingAmount
            };
            return resolve(result);
        });
    }
    
    //TTTTT  OOO  TTTTT  AAA  L     EEEEE  SSSS
    //  T   O   O   T   A   A L     E     S
    //  T   O   O   T   AAAAA L     EEE    SSS
    //  T   O   O   T   A   A L     E         S
    //  T    OOO    T   A   A LLLLL EEEEE SSSS

    public getReceiptsTotal(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.finance.receipts.getReceiptsTotal, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
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
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }
}