import idx from 'idx';
import ReceiptModel, { Receipt } from '../receipts';
import PaymentModel, { Payment } from '../payments';
import ClientModel, { Client } from '../clients';
import AccountModel, { Account } from '../accounts';
import InvoiceModel, { Invoice } from '../invoices';
import { isEmpty } from '../../scripts/object-prototypes';

export interface IPendingReceipt extends Receipt {
    payments: Array<Payment>
}

export interface IUglyBalance {
    date: Date;
    description: string;
    folio: string;
    invoices: Array<Invoice>;
    receipt: string;
    status: string;
    type: 'charge' | 'payment';
    charge: number;
    payment: number;
    balance: number;
}

export interface IBalance {
    account: Account;
    client: Client;
    receipts: Array<Receipt>;
    payments: Array<Payment>;
    total: number;
    pendingReceipts: Array<IPendingReceipt>;
}

// NOTE: Versión mejorada, tal vez no se pueda implementar en producción por que el FRONT-END utiliza la versión anterior.
export interface IUglyBalanceV2 {
    date: Date;
    description: string;
    folio: string;
    invoices: Array<Invoice>;
    receiptFile: string;            // URL del PDF del recibo.
    status: string;
    type: 'charge' | 'payment';
    amountCharged: number;
    amountPaid: number;
    balance: number;
    // Nuevo:
    receipt: Receipt,
    payment: Payment
}

export default class BalanceModel {

    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getClientBalance(query: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let errors: Array<any> = [];

            let { _id, folio } = query;
            if(!_id && !folio) {
                return reject({
                    status: 400,
                    module: 'Procesos | Balance',
                    message: 'El folio o el identificador del cliente son obligatorios.'
                });
            }

            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     L       I   E     NN  N   T   E
            //C     L       I   EEE   N N N   T   EEE
            //C     L       I   E     N  NN   T   E
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE
            
            let clientId: string = '';
            let _client: any = {};
            try {
                let clientModel: ClientModel = new ClientModel();
                _client = await clientModel.getClient(query);
                clientId = _client._id;
            } catch(error) {
                return reject(error);
            }
            // console.log(`[MODELOS][PROCESOS][BALANCE][getClientBalance] Cliente: ${JSON.stringify(_client.data)}`);
            
            //RRRR  EEEE  CCCC IIIII BBBB   OOO   SSSS
            //R   R E    C       I   B   B O   O S
            //RRRR  EEE  C       I   BBBB  O   O  SSS
            //R   R E    C       I   B   B O   O     S
            //R   R EEEE  CCCC IIIII BBBB   OOO  SSSS

            let _receipts: Array<any> = [];
            if(clientId && clientId != '') {
                try {
                    let params = {
                        all: true,
                        parentId: clientId,
                        parentType: 'client',
                        // statusValue: ['pending', 'paid']
                    };
                    let receiptModel = new ReceiptModel();
                    let receiptResponse = await receiptModel.getReceipts(params);
                    _receipts = receiptResponse.results;
                } catch(error) {
                    // Ocurrió un error pero no se debe detener la ejecución.
                    errors.push(error);
                }
            }
            // console.log(`[MODELOS][PROCESOS][BALANCE][getClientBalance] Recibos: ${JSON.stringify(_receipts)}`);
            
            //PPPP   AAA   GGGG  OOO   SSSS
            //P   P A   A G     O   O S
            //PPPP  AAAAA G  GG O   O  SSS
            //P     A   A G   G O   O     S
            //P     A   A  GGGG  OOO  SSSS
             
            let _payments: Array<any> = [];
            if(clientId && clientId != '') {
                try {
                    let params = {
                        all: true,
                        parentId: clientId,
                        parentType: 'client'
                    };
                    let paymentModel = new PaymentModel();
                    let paymentResponse = await paymentModel.getPayments(params);
                    _payments = paymentResponse.results; 
                } catch(error) {
                    // Ocurrió un error pero no se debe detener la ejecución.
                    errors.push(error);
                }
            }
            // console.log(`[MODELOS][PROCESOS][BALANCE][getClientBalance] Pagos: ${JSON.stringify(_payments)}`);

            // SSSS  AAA  L     DDDD   OOO   SSSS
            //S     A   A L     D   D O   O S
            // SSS  AAAAA L     D   D O   O  SSS
            //    S A   A L     D   D O   O     S
            //SSSS  A   A LLLLL DDDD   OOO  SSSS

            // 3) RECIBOS.
            let totalReceipts: number = 0;
            let pendingReceipts: Array<any> = [];
            if(Array.isArray(_receipts) && _receipts.length > 0) {
                for(const receipt of _receipts) {
                    // Total.
                    if(receipt.statusValue != 'cancelled') totalReceipts += receipt.total || 0;
                    // Recibos pendientes.
                    if(receipt.statusValue === 'pending') {
                        receipt.payments = [];
                        pendingReceipts.push(receipt);
                    }
                }
            }
            // Arreglo con los identificadores de los recibos pendientes.
            let pendingReceiptsID: Array<string> = [];
            pendingReceipts.forEach((pengingReceipt: any) => {
                pendingReceiptsID.push(pengingReceipt._id);
            });
            
            // 4) PAGOS.
            let totalPayments: number = 0;
            if(Array.isArray(_payments) && _payments.length > 0) {
                _payments.forEach((payment: any) => {
                    // Total.
                    totalPayments += payment.amountPaid || 0;
                    // ¿Pago de algún recibo pendiente?
                    let paymentDetails = payment.details || [];
                    // console.log(`[MODELOS][PROCESOS][BALANCE][getClientBalance] Detalles del pago: ${JSON.stringify(paymentDetails)}`);
                    if(Array.isArray(paymentDetails) && paymentDetails.length > 0) {                        
                        paymentDetails.forEach((detail: any) => {    
                            // console.log(`[MODELOS][PROCESOS][BALANCE][getClientBalance] Detalle del pago: ${JSON.stringify(detail)}`);
                            let receiptId = detail.receiptId;
                            if(receiptId && pendingReceiptsID.indexOf(receiptId) >= 0) {
                                // console.log(`[MODELOS][PROCESOS][BALANCE][getClientBalance] Si corresponde a un recibo pendiente.`);
                                // Agregar el pago al recibo pendiente.
                                for(let i=0; i<pendingReceipts.length; i++) {
                                    if(pendingReceipts[i]._id === receiptId) {
                                        // TODO: Revisar si se necesitan más datos.
                                        pendingReceipts[i].payments.push(detail.amount);
                                        break;
                                    }
                                }
                            }
                        });
                    }
                });
            }

            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
            
            let result: any = {};
            result['client'] = _client;
            result['total'] = totalReceipts - totalPayments;
            result['pendingReceipts'] = pendingReceipts;
            if(errors.length > 0) {
                result['errors'] = errors;
            }
            return resolve(result);
        });
    }

    public getAccountBalance(query: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let errors: Array<any> = [];

            // La búsqueda se puede hacer por:
            // - Número de cuenta.
            // - Referencia de pago.
            let { accountNumber, reference } = query;
            let filters: any = {};
            if(typeof accountNumber === 'string' && accountNumber.length > 0) {
                filters.accountNumber = accountNumber;
            } else if(typeof reference != 'string' || reference.length === 0) {
                filters['paymentReferences.reference'] = reference;
            } else {
                return reject({
                    status: 400,
                    module: 'Procesos | Balance',
                    message: 'El número de cuenta o el identificador de la cuenta son obligatorios.'
                });
            }

            // CCCC U   U EEEEE N   N TTTTT  AAA
            //C     U   U E     NN  N   T   A   A
            //C     U   U EEE   N N N   T   AAAAA
            //C     U   U E     N  NN   T   A   A
            // CCCC  UUU  EEEEE N   N   T   A   A

            let _account: any = {};
            let clientId: string;
            try {
                let accountModel: AccountModel = new AccountModel();
                _account = await accountModel.getAccount(filters);
                clientId = _account.clientId;
            } catch(error) {
                return reject(error);
            }
            
            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     L       I   E     NN  N   T   E
            //C     L       I   EEE   N N N   T   EEE
            //C     L       I   E     N  NN   T   E
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE
            
            let _client: any = {};
            try {
                let clientModel: ClientModel = new ClientModel();
                _client = await clientModel.getClient({ folio: clientId });
            } catch(error) {
                // No se termina el proceso al no encontrar el cliente.
                // return reject({
                //     status: 400,
                //     message: 'Ocurrió un error al intentar obtener la información (CLIENTE).',
                //     error: idx(error, _ => _.response.data) || error
                // });
            }
            
            //RRRR  EEEE  CCCC IIIII BBBB   OOO   SSSS
            //R   R E    C       I   B   B O   O S
            //RRRR  EEE  C       I   BBBB  O   O  SSS
            //R   R E    C       I   B   B O   O     S
            //R   R EEEE  CCCC IIIII BBBB   OOO  SSSS

            let _receipts: Array<any> = [];
            try {
                let params = {
                    all: true,
                    parentId: _account.accountNumber,
                    parentType: 'account',
                    sort: { field: 'movementDate', type: 'ASC' },
                    // statusValue: ['pending', 'paid']
                    // DELETE: Sólo para "empatar" saldos con el sistema anterior. ಠ╭╮ಠ
                    movementDate: { start: '2015-06-30' }
                };
                let receiptModel = new ReceiptModel();
                let receiptResponse = await receiptModel.getReceipts(params);
                _receipts = receiptResponse.results;
            } catch(error) {
                // Ocurrió un error pero no se debe detener la ejecución.
                errors.push(error);
            }

            //PPPP   AAA   GGGG  OOO   SSSS
            //P   P A   A G     O   O S
            //PPPP  AAAAA G  GG O   O  SSS
            //P     A   A G   G O   O     S
            //P     A   A  GGGG  OOO  SSSS
             
            let _payments: Array<any> = [];
            try {
                let params = {
                    all: true,
                    parentId: _account.accountNumber,
                    parentType: 'account',
                    sort: { field: 'paymentDate', type: 'ASC' },
                    // DELETE: Sólo para "empatar" saldos con el sistema anterior. ಠ╭╮ಠ
                    paymentDate: { start: '2015-06-30' }
                };
                let paymentModel = new PaymentModel();
                let paymentResponse = await paymentModel.getPayments(params);
                _payments = paymentResponse.results; 
            } catch(error) {
                // Ocurrió un error pero no se debe detener la ejecución.
                errors.push(error);
            }
            
            // SSSS  AAA  L     DDDD   OOO   SSSS
            //S     A   A L     D   D O   O S
            // SSS  AAAAA L     D   D O   O  SSS
            //    S A   A L     D   D O   O     S
            //SSSS  A   A LLLLL DDDD   OOO  SSSS

            // 3) RECIBOS.
            let totalReceipts: number = 0;
            let pendingReceipts: Array<any> = [];
            if(Array.isArray(_receipts) && _receipts.length > 0) {
                for(const receipt of _receipts) {
                    // Total.
                    if(receipt.statusValue != 'cancelled') totalReceipts += receipt.total || 0;
                    // Recibos pendientes.
                    if(receipt.statusValue === 'pending') {
                        receipt.payments = [];
                        pendingReceipts.push(receipt);
                    }
                }
            }
            // Arreglo con los identificadores de los recibos pendientes.
            let pendingReceiptsID: Array<string> = [];
            for(const pendingReceipt of pendingReceipts) {
                pendingReceiptsID.push(pendingReceipt._id);
            };
            
            // 4) PAGOS.
            let totalPayments: number = 0;
            if(Array.isArray(_payments) && _payments.length > 0) {
                for(const payment of _payments) {
                    // Total.
                    totalPayments += payment.amountPaid || 0;
                    // ¿Pago de algún recibo pendiente?
                    let paymentDetails = payment.details || [];
                    if(Array.isArray(paymentDetails) && paymentDetails.length > 0) {
                        for(const detail of paymentDetails) {
                            let receiptId = detail.receiptId;
                            if(receiptId && pendingReceiptsID.indexOf(receiptId) >= 0) {
                                // Agregar el pago al recibo pendiente.
                                for(let i=0; i<pendingReceipts.length; i++) {
                                    if(pendingReceipts[i]._id === receiptId) {
                                        // TODO: Revisar si se necesitan más datos.
                                        pendingReceipts[i].payments.push(detail.amount);
                                        break;
                                    }
                                }
                            }
                        };
                    }
                };
            }

            // NOTE: En este punto, todos los recibos pendientes tienen sus correspondientes pagos.

            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
            
            let result: any = {};
            result['account'] = _account;
            result['client'] = _client;
            result['receipts'] = _receipts;
            result['payments'] = _payments;
            result['total'] = totalReceipts - totalPayments;
            result['pendingReceipts'] = pendingReceipts;
            if(errors.length > 0) {
                result['errors'] = errors;
            }
            return resolve(result);
        });
    }

    public getAccountFullBalance(query: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let accountNumber: string = query.accountNumber;
            let errors: Array<any> = [];

            // CCCC U   U EEEEE N   N TTTTT  AAA
            //C     U   U E     NN  N   T   A   A
            //C     U   U EEE   N N N   T   AAAAA
            //C     U   U E     N  NN   T   A   A
            // CCCC  UUU  EEEEE N   N   T   A   A

            let _account: any = {};
            let clientId: string;
            try {
                let accountModel: AccountModel = new AccountModel();
                _account = await accountModel.getAccount({ accountNumber });
                clientId = _account.clientId;
            } catch(error) {
                return reject(error);
            }
            
            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     L       I   E     NN  N   T   E
            //C     L       I   EEE   N N N   T   EEE
            //C     L       I   E     N  NN   T   E
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE
            
            let _client: any = {};
            try {
                let clientModel: ClientModel = new ClientModel();
                _client = await clientModel.getClient({ folio: clientId });
            } catch(error) {
                // No se termina el proceso al no encontrar el cliente.
                // return reject({
                //     status: 400,
                //     message: 'Ocurrió un error al intentar obtener la información (CLIENTE).',
                //     error: idx(error, _ => _.response.data) || error
                // });
            }
            
            //RRRR  EEEE  CCCC IIIII BBBB   OOO   SSSS
            //R   R E    C       I   B   B O   O S
            //RRRR  EEE  C       I   BBBB  O   O  SSS
            //R   R E    C       I   B   B O   O     S
            //R   R EEEE  CCCC IIIII BBBB   OOO  SSSS

            let _receipts: Array<IPendingReceipt> = [];
            try {
                let params = {
                    all: true,
                    parentId: _account.accountNumber,
                    parentType: 'account',
                    // statusValue: ['pending', 'paid']
                };
                let receiptModel = new ReceiptModel();
                let receiptResponse = await receiptModel.getReceipts(params);
                _receipts = receiptResponse.results;
            } catch(error) {
                // Ocurrió un error pero no se debe detener la ejecución.
                errors.push(error);
            }

            //PPPP   AAA   GGGG  OOO   SSSS
            //P   P A   A G     O   O S
            //PPPP  AAAAA G  GG O   O  SSS
            //P     A   A G   G O   O     S
            //P     A   A  GGGG  OOO  SSSS
             
            let _payments: Array<any> = [];
            try {
                let params = {
                    all: true,
                    parentId: _account.accountNumber,
                    parentType: 'account'
                };
                let paymentModel = new PaymentModel();
                let paymentResponse = await paymentModel.getPayments(params);
                _payments = paymentResponse.results; 
            } catch(error) {
                // Ocurrió un error pero no se debe detener la ejecución.
                errors.push(error);
            }
            
            // SSSS  AAA  L     DDDD   OOO   SSSS
            //S     A   A L     D   D O   O S
            // SSS  AAAAA L     D   D O   O  SSS
            //    S A   A L     D   D O   O     S
            //SSSS  A   A LLLLL DDDD   OOO  SSSS

            // Recibos.
            let totalReceipts: number = 0;
            if(Array.isArray(_receipts) && _receipts.length > 0) {
                for(const receipt of _receipts) {
                    // Total.
                    if(['cancelled', 'error'].indexOf(receipt.statusValue) < 0) totalReceipts += receipt.total || 0;
                }
            }            
            // Pagos.
            let totalPayments: number = 0;
            let _unassignedPayments: Payment[] = [];
            if(Array.isArray(_payments) && _payments.length > 0) {
                for(const payment of _payments) {
                    // Total.
                    totalPayments += payment.amountPaid || 0;
                    // ¿Pago de algún recibo?
                    let paymentDetails = payment.details || [];
                    if(Array.isArray(paymentDetails) && paymentDetails.length > 0) {
                        for(const detail of paymentDetails) {
                            let receiptId = detail.receiptId;
                            // Se busca el recibo pagado.
                            let receiptIndex: number = _receipts.findIndex((_receipt: IPendingReceipt) => {
                                return _receipt._id === receiptId || _receipt.folio === receiptId;
                            });
                            // Se debe encontrar sólo 1, si es así se le agrega el pago a los detalles.
                            if(receiptIndex >= 0 && _receipts[receiptIndex]) {
                                if(!Array.isArray(_receipts[receiptIndex].payments)) {
                                    _receipts[receiptIndex].payments = [];
                                }
                                _receipts[receiptIndex].payments.push(payment);
                            }
                        };
                    } else {
                        // Si el pago no tiene detalle, entonces no fue asignado a ningún recibo.
                        _unassignedPayments.push(payment);
                    }
                };
            }

            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
            
            let result: any = {};
            result['account'] = _account;
            result['client'] = _client;
            result['payments'] = _unassignedPayments;
            result['receipts'] = _receipts;
            result['total'] = totalReceipts - totalPayments;
            if(errors.length > 0) {
                result['errors'] = errors;
            }
            return resolve(result);
        });
    }

    // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
    // SUPER PODEROSA NINJA TURBO NEO ULTRA HYPER MEGA MULTI ALPHA META EXTRA UBER PREFIJO NOTA:
    // Si el total es:
    // NEGATIVO: lo debe.
    // POSITIVO: es a favor.
    // ¯\_(ツ)_/¯
    public getAccountFullBalanceUGLY(query: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let accountNumber: string = query.accountNumber;
            
            // CCCC U   U EEEEE N   N TTTTT  AAA
            //C     U   U E     NN  N   T   A   A
            //C     U   U EEE   N N N   T   AAAAA
            //C     U   U E     N  NN   T   A   A
            // CCCC  UUU  EEEEE N   N   T   A   A

            let account: Account = new Account();
            let clientId: string;
            try {
                let accountModel: AccountModel = new AccountModel();
                account = await accountModel.getAccount({ accountNumber });
                clientId = account.clientId;
            } catch(error) {
                return reject(error);
            }
            
            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     L       I   E     NN  N   T   E
            //C     L       I   EEE   N N N   T   EEE
            //C     L       I   E     N  NN   T   E
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE
            
            let client: Client = new Client();
            try {
                let clientModel: ClientModel = new ClientModel();
                client = await clientModel.getClient({ folio: clientId });
            } catch(error) {
                return reject(error);
            }
            
            //RRRR  EEEE  CCCC IIIII BBBB   OOO   SSSS
            //R   R E    C       I   B   B O   O S
            //RRRR  EEE  C       I   BBBB  O   O  SSS
            //R   R E    C       I   B   B O   O     S
            //R   R EEEE  CCCC IIIII BBBB   OOO  SSSS

            let receipts: Array<IPendingReceipt> = [];
            try {
                let params = {
                    all: true,
                    parentId: account.accountNumber,
                    parentType: 'account',
                    // statusValue: ['pending', 'paid'],
                    sort: { field: 'movementDate', type: 'ASC' },
                    // DELETE: Sólo para "empatar" saldos con el sistema anterior. ಠ╭╮ಠ
                    movementDate: { start: '2015-06-30' }
                };
                let receiptModel = new ReceiptModel();
                let getReceipts: { results: Array<IPendingReceipt>, summary: any } = await receiptModel.getReceipts(params);
                receipts = getReceipts.results;
            } catch(error) {
                return reject(error);
            }

            //PPPP   AAA   GGGG  OOO   SSSS
            //P   P A   A G     O   O S
            //PPPP  AAAAA G  GG O   O  SSS
            //P     A   A G   G O   O     S
            //P     A   A  GGGG  OOO  SSSS
             
            let payments: Array<Payment> = [];
            try {
                let params = {
                    all: true,
                    parentId: account.accountNumber,
                    parentType: 'account',
                    sort: { field: 'paymentDate', type: 'ASC' },
                    // DELETE: Sólo para "empatar" saldos con el sistema anterior. ಠ╭╮ಠ
                    paymentDate: { start: '2015-06-30' }
                };
                let paymentModel = new PaymentModel();
                let getPayments: { results: Array<Payment>, summary: any } = await paymentModel.getPayments(params);
                payments = getPayments.results; 
            } catch(error) {
                return reject(error);
            }
            
            // SSSS  AAA  L     DDDD   OOO   SSSS
            //S     A   A L     D   D O   O S
            // SSS  AAAAA L     D   D O   O  SSS
            //    S A   A L     D   D O   O     S
            //SSSS  A   A LLLLL DDDD   OOO  SSSS

            let balance: Array<IUglyBalance> = [];
            let totalBalance: number = 0;
            let receiptIndex: number = 0;
            let paymentIndex: number = 0;
            // 1. Se deben ordenar recibos y pagos por fecha.
            // NOTE: Ya se hizo en la petición.
            // 2. Se recorren a la par recibos y pagos, se comparan fechas y se agrega el de fecha menor al arreglo del balance.
            while(receiptIndex < receipts.length && paymentIndex < payments.length) {
                let receiptDate: Date = new Date(receipts[receiptIndex].movementDate);
                let paymentDate: Date = new Date(payments[paymentIndex].paymentDate);
                if(receiptDate < paymentDate) {
                    // La fecha del recibo es menor.
                    // Se debe obtener la factura si aplica.
                    let hasInvoice: boolean = false;
                    let invoice: Invoice = new Invoice();
                    if(!isEmpty(receipts[receiptIndex].invoice)) {
                        // @ts-ignore
                        if(receipts[receiptIndex].invoice.hasOwnProperty('serie') && receipts[receiptIndex].invoice.hasOwnProperty('folio')) {
                            hasInvoice = true;
                            // @ts-ignore
                            invoice = receipts[receiptIndex].invoice;
                        }
                    }
                    // Se revisa el estatus del recibo y se suma o resta al balance total.
                    if(['cancelled', 'error'].indexOf(receipts[receiptIndex].statusValue) < 0) {
                        totalBalance -= parseFloat(receipts[receiptIndex].total.toFixed(2));
                    }
                    // Se agrega el recibo al arreglo.
                    balance.push({
                        date: receiptDate,
                        description: hasInvoice ? 'Factura' : 'Recibo',
                        folio: hasInvoice ? `${invoice.serie}${invoice.folio}` : `${receipts[receiptIndex].folio}`,
                        invoices: !isEmpty(invoice) ? [invoice] : [],
                        receipt: receipts[receiptIndex].receiptFile || '',
                        status: receipts[receiptIndex].statusValue,
                        type: 'charge',
                        charge: receipts[receiptIndex].total,
                        payment: 0,
                        balance: parseFloat(totalBalance.toFixed(2)),
                    });
                    // Se aumenta en uno el índice de los recibos.
                    receiptIndex++;
                } else {
                    // La fecha del pago es menor.
                    // Se revisa el estatus del pago y se suma o resta al balance total.
                    if(['cancelled', 'error'].indexOf(payments[paymentIndex].statusValue) < 0) {
                        totalBalance += parseFloat(payments[paymentIndex].amountPaid.toFixed(2));
                    }
                    // Se agrega el pago al arreglo.
                    balance.push({
                        date: paymentDate,
                        description: payments[paymentIndex].description || '',
                        folio: payments[paymentIndex].reference || '',
                        // @ts-ignore
                        invoices: payments[paymentIndex].invoices || [],
                        receipt: '',
                        status: payments[paymentIndex].statusValue,
                        type: 'payment',
                        charge: 0,
                        payment: payments[paymentIndex].amountPaid,
                        balance: parseFloat(totalBalance.toFixed(2)),
                    });
                    // Se aumenta en uno el índice de los pagos.
                    paymentIndex++;
                }
            }
            // 3. Al final se debe revisar si aún quedaron recibos o pagos.
            // RECIBOS.
            if(receiptIndex < receipts.length) {
                while(receiptIndex < receipts.length) {
                    // Fecha del recibo.
                    let receiptDate: Date = new Date(receipts[receiptIndex].movementDate);
                    // Se debe obtener la factura si aplica.
                    let hasInvoice: boolean = false;
                    let invoice: Invoice = new Invoice();
                    if(!isEmpty(receipts[receiptIndex].invoice)) {
                        // @ts-ignore
                        if(receipts[receiptIndex].invoice.hasOwnProperty('serie') && receipts[receiptIndex].invoice.hasOwnProperty('folio')) {
                            hasInvoice = true;
                            // @ts-ignore
                            invoice = receipts[receiptIndex].invoice;
                        }
                    }
                    // Se revisa el estatus del recibo y se suma o resta al balance total.
                    if(['cancelled', 'error'].indexOf(receipts[receiptIndex].statusValue) < 0) {
                        totalBalance -= parseFloat(receipts[receiptIndex].total.toFixed(2));
                    }
                    // Se agrega el recibo al arreglo.
                    balance.push({
                        date: receiptDate,
                        description: hasInvoice ? 'Factura' : 'Recibo',
                        folio: hasInvoice ? `${invoice.serie}${invoice.folio}` : `${receipts[receiptIndex].folio}`,
                        invoices: !isEmpty(invoice) ? [invoice] : [],
                        receipt: receipts[receiptIndex].receiptFile || '',
                        status: receipts[receiptIndex].statusValue,
                        type: 'charge',
                        charge: receipts[receiptIndex].total,
                        payment: 0,
                        balance: parseFloat(totalBalance.toFixed(2)),
                    });
                    // Se aumenta en uno el índice de recibos.
                    receiptIndex++;
                }
            }
            // PAGOS.
            if(paymentIndex < payments.length) {
                while(paymentIndex < payments.length) {
                    // Fecha del pago.
                    let paymentDate: Date = new Date(payments[paymentIndex].paymentDate);
                    // Se revisa el estatus del pago y se suma o resta al balance total.
                    if(['cancelled', 'error'].indexOf(payments[paymentIndex].statusValue) < 0) {
                        totalBalance += parseFloat(payments[paymentIndex].amountPaid.toFixed(2));
                    }
                    // Se agrega el pago al arreglo.
                    balance.push({
                        date: paymentDate,
                        description: payments[paymentIndex].description || '',
                        folio: payments[paymentIndex].reference || '',
                        // @ts-ignore
                        invoices: payments[paymentIndex].invoices || [],
                        receipt: '',
                        status: payments[paymentIndex].statusValue,
                        type: 'payment',
                        charge: 0,
                        payment: payments[paymentIndex].amountPaid,
                        balance: parseFloat(totalBalance.toFixed(2)),
                    });
                    // Se aumenta en uno el índice de pagos.
                    paymentIndex++;
                }
            }

            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
            
            totalBalance = parseFloat(totalBalance.toFixed(2));
            let result = {
                account,
                client,
                balance,
                total: totalBalance
            };
            return resolve(result);
        });
    }

    public getAccountFullBalanceUGLYv2(query: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let accountNumber: string = query.accountNumber;
            
            // CCCC U   U EEEEE N   N TTTTT  AAA
            //C     U   U E     NN  N   T   A   A
            //C     U   U EEE   N N N   T   AAAAA
            //C     U   U E     N  NN   T   A   A
            // CCCC  UUU  EEEEE N   N   T   A   A

            let account: Account = new Account();
            let clientId: string;
            try {
                let accountModel: AccountModel = new AccountModel();
                account = await accountModel.getAccount({ accountNumber });
                clientId = account.clientId;
            } catch(error) {
                return reject(error);
            }
            
            // CCCC L     IIIII EEEEE N   N TTTTT EEEEE
            //C     L       I   E     NN  N   T   E
            //C     L       I   EEE   N N N   T   EEE
            //C     L       I   E     N  NN   T   E
            // CCCC LLLLL IIIII EEEEE N   N   T   EEEEE
            
            let client: Client = new Client();
            try {
                let clientModel: ClientModel = new ClientModel();
                client = await clientModel.getClient({ folio: clientId });
            } catch(error) {
                return reject(error);
            }
            
            //RRRR  EEEE  CCCC IIIII BBBB   OOO   SSSS
            //R   R E    C       I   B   B O   O S
            //RRRR  EEE  C       I   BBBB  O   O  SSS
            //R   R E    C       I   B   B O   O     S
            //R   R EEEE  CCCC IIIII BBBB   OOO  SSSS

            let receipts: Array<IPendingReceipt> = [];
            try {
                let params = {
                    all: true,
                    parentId: account.accountNumber,
                    parentType: 'account',
                    // statusValue: ['pending', 'paid'],
                    sort: { field: 'movementDate', type: 'ASC' },
                    // DELETE: Sólo para "empatar" saldos con el sistema anterior. ಠ╭╮ಠ
                    movementDate: { start: '2015-06-30' }
                };
                let receiptModel = new ReceiptModel();
                let getReceipts: { results: Array<IPendingReceipt>, summary: any } = await receiptModel.getReceipts(params);
                receipts = getReceipts.results;
            } catch(error) {
                return reject(error);
            }

            //PPPP   AAA   GGGG  OOO   SSSS
            //P   P A   A G     O   O S
            //PPPP  AAAAA G  GG O   O  SSS
            //P     A   A G   G O   O     S
            //P     A   A  GGGG  OOO  SSSS
             
            let payments: Array<Payment> = [];
            try {
                let params = {
                    all: true,
                    parentId: account.accountNumber,
                    parentType: 'account',
                    sort: { field: 'paymentDate', type: 'ASC' },
                    // DELETE: Sólo para "empatar" saldos con el sistema anterior. ಠ╭╮ಠ
                    paymentDate: { start: '2015-06-30' }
                };
                let paymentModel = new PaymentModel();
                let getPayments: { results: Array<Payment>, summary: any } = await paymentModel.getPayments(params);
                payments = getPayments.results; 
            } catch(error) {
                return reject(error);
            }
            
            // SSSS  AAA  L     DDDD   OOO   SSSS
            //S     A   A L     D   D O   O S
            // SSS  AAAAA L     D   D O   O  SSS
            //    S A   A L     D   D O   O     S
            //SSSS  A   A LLLLL DDDD   OOO  SSSS

            let balance: Array<IUglyBalanceV2> = [];
            let totalBalance: number = 0;
            let receiptIndex: number = 0;
            let paymentIndex: number = 0;
            // 1. Se deben ordenar recibos y pagos por fecha.
            // NOTE: Ya se hizo en la petición.
            // 2. Se recorren a la par recibos y pagos, se comparan fechas y se agrega el de fecha menor al arreglo del balance.
            while(receiptIndex < receipts.length && paymentIndex < payments.length) {
                let receiptDate: Date = new Date(receipts[receiptIndex].movementDate);
                let paymentDate: Date = new Date(payments[paymentIndex].paymentDate);
                if(receiptDate < paymentDate) {
                    // La fecha del recibo es menor.
                    // Se debe obtener la factura si aplica.
                    let hasInvoice: boolean = false;
                    let invoice: Invoice = new Invoice();
                    if(!isEmpty(receipts[receiptIndex].invoice)) {
                        // @ts-ignore
                        if(receipts[receiptIndex].invoice.hasOwnProperty('serie') && receipts[receiptIndex].invoice.hasOwnProperty('folio')) {
                            hasInvoice = true;
                            // @ts-ignore
                            invoice = receipts[receiptIndex].invoice;
                        }
                    }
                    // Se revisa el estatus del recibo y se suma o resta al balance total.
                    if(['cancelled', 'error'].indexOf(receipts[receiptIndex].statusValue) < 0) {
                        totalBalance -= parseFloat(receipts[receiptIndex].total.toFixed(2));
                    }
                    // Se agrega el recibo al arreglo.
                    balance.push({
                        date: receiptDate,
                        description: hasInvoice ? 'Factura' : 'Recibo',
                        folio: hasInvoice ? `${invoice.serie}${invoice.folio}` : `${receipts[receiptIndex].folio}`,
                        invoices: !isEmpty(invoice) ? [invoice] : [],
                        receiptFile: receipts[receiptIndex].receiptFile || '',
                        status: receipts[receiptIndex].statusValue,
                        type: 'charge',
                        amountCharged: receipts[receiptIndex].total,
                        amountPaid: 0,
                        balance: parseFloat(totalBalance.toFixed(2)),
                        // Nuevos:
                        receipt: receipts[receiptIndex],
                        payment: new Payment()
                    });
                    // Se aumenta en uno el índice de los recibos.
                    receiptIndex++;
                } else {
                    // La fecha del pago es menor.
                    // Se revisa el estatus del pago y se suma o resta al balance total.
                    if(['cancelled', 'error'].indexOf(payments[paymentIndex].statusValue) < 0) {
                        totalBalance += parseFloat(payments[paymentIndex].amountPaid.toFixed(2));
                    }
                    // Se agrega el pago al arreglo.
                    balance.push({
                        date: paymentDate,
                        description: payments[paymentIndex].description || '',
                        folio: payments[paymentIndex].reference || '',
                        // @ts-ignore
                        invoices: payments[paymentIndex].invoices || [],
                        receiptFile: '',
                        status: payments[paymentIndex].statusValue,
                        type: 'payment',
                        amountCharged: 0,
                        amountPaid: payments[paymentIndex].amountPaid,
                        balance: parseFloat(totalBalance.toFixed(2)),
                        // Nuevo:
                        receipt: new Receipt(),
                        payment: payments[paymentIndex]
                    });
                    // Se aumenta en uno el índice de los pagos.
                    paymentIndex++;
                }
            }
            // 3. Al final se debe revisar si aún quedaron recibos o pagos.
            // RECIBOS.
            if(receiptIndex < receipts.length) {
                while(receiptIndex < receipts.length) {
                    // Fecha del recibo.
                    let receiptDate: Date = new Date(receipts[receiptIndex].movementDate);
                    // Se debe obtener la factura si aplica.
                    let hasInvoice: boolean = false;
                    let invoice: Invoice = new Invoice();
                    if(!isEmpty(receipts[receiptIndex].invoice)) {
                        // @ts-ignore
                        if(receipts[receiptIndex].invoice.hasOwnProperty('serie') && receipts[receiptIndex].invoice.hasOwnProperty('folio')) {
                            hasInvoice = true;
                            // @ts-ignore
                            invoice = receipts[receiptIndex].invoice;
                        }
                    }
                    // Se revisa el estatus del recibo y se suma o resta al balance total.
                    if(['cancelled', 'error'].indexOf(receipts[receiptIndex].statusValue) < 0) {
                        totalBalance -= parseFloat(receipts[receiptIndex].total.toFixed(2));
                    }
                    // Se agrega el recibo al arreglo.
                    balance.push({
                        date: receiptDate,
                        description: hasInvoice ? 'Factura' : 'Recibo',
                        folio: hasInvoice ? `${invoice.serie}${invoice.folio}` : `${receipts[receiptIndex].folio}`,
                        invoices: !isEmpty(invoice) ? [invoice] : [],
                        receiptFile: receipts[receiptIndex].receiptFile || '',
                        status: receipts[receiptIndex].statusValue,
                        type: 'charge',
                        amountCharged: receipts[receiptIndex].total,
                        amountPaid: 0,
                        balance: parseFloat(totalBalance.toFixed(2)),
                        // Nuevo:
                        receipt: receipts[receiptIndex],
                        payment: new Payment()
                    });
                    // Se aumenta en uno el índice de recibos.
                    receiptIndex++;
                }
            }
            // PAGOS.
            if(paymentIndex < payments.length) {
                while(paymentIndex < payments.length) {
                    // Fecha del pago.
                    let paymentDate: Date = new Date(payments[paymentIndex].paymentDate);
                    // Se revisa el estatus del pago y se suma o resta al balance total.
                    if(['cancelled', 'error'].indexOf(payments[paymentIndex].statusValue) < 0) {
                        totalBalance += parseFloat(payments[paymentIndex].amountPaid.toFixed(2));
                    }
                    // Se agrega el pago al arreglo.
                    balance.push({
                        date: paymentDate,
                        description: payments[paymentIndex].description || '',
                        folio: payments[paymentIndex].reference || '',
                        // @ts-ignore
                        invoices: payments[paymentIndex].invoices || [],
                        receiptFile: '',
                        status: payments[paymentIndex].statusValue,
                        type: 'payment',
                        amountCharged: 0,
                        amountPaid: payments[paymentIndex].amountPaid,
                        balance: parseFloat(totalBalance.toFixed(2)),
                        // Nuevo:
                        receipt: new Receipt(),
                        payment: payments[paymentIndex]
                    });
                    // Se aumenta en uno el índice de pagos.
                    paymentIndex++;
                }
            }

            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
            
            totalBalance = parseFloat(totalBalance.toFixed(2));
            let result = {
                account,
                client,
                balance,
                total: totalBalance
            };
            return resolve(result);
        });
    }

    //PPPP  U   U TTTTT
    //P   P U   U   T
    //PPPP  U   U   T
    //P     U   U   T
    //P      UUU    T

    public putREbuildBalance(body: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let accountNumber: string = body.accountNumber;
            
            //BBBB   AAA  L      AAA  N   N  CCCC EEEEE
            //B   B A   A L     A   A NN  N C     E
            //BBBB  AAAAA L     AAAAA N N N C     EEE
            //B   B A   A L     A   A N  NN C     E
            //BBBB  A   A LLLLL A   A N   N  CCCC EEEEE

            let getBalance: { account: Account, client: Client, balance: Array<IUglyBalanceV2>, total: number } = {
                account: new Account(),
                client: new Client(),
                balance: [],
                total: 0
            };
            try {
                getBalance = await this.getAccountFullBalanceUGLYv2({ accountNumber });
            } catch(error) {
                return reject(error);
            }
            // console.log('Balance.');

            //RRRR  EEEE  CCCC IIIII BBBB   OOO   SSSS      PPPP  EEEEE N   N DDDD  IIIII EEEEE N   N TTTTT EEEEE  SSSS
            //R   R E    C       I   B   B O   O S          P   P E     NN  N D   D   I   E     NN  N   T   E     S
            //RRRR  EEE  C       I   BBBB  O   O  SSS       PPPP  EEE   N N N D   D   I   EEE   N N N   T   EEE    SSS
            //R   R E    C       I   B   B O   O     S      P     E     N  NN D   D   I   E     N  NN   T   E         S
            //R   R EEEE  CCCC IIIII BBBB   OOO  SSSS       P     EEEEE N   N DDDD  IIIII EEEEE N   N   T   EEEEE SSSS

            let payments: Array<Payment> = [];
            let receipts: Array<Receipt> = [];
            if(getBalance.balance.length > 0) {
                for(const movement of getBalance.balance) {
                    // Recibos.
                    if(movement.type === 'charge') {
                        // Sólo se agregan recibos que no se generaron con error o fueron cancelados.
                        if(['cancelled', 'error'].indexOf(movement.receipt.statusValue) < 0) {
                            movement.receipt.statusValue = 'pending';
                            receipts.push(movement.receipt);
                        }
                    }
                    // Pagos.
                    if(movement.type === 'payment') {
                        // Sólo se agregan pagos que no se generaron con error, ni fueron cancelados o son derivados de una nota de crédito.
                        if(['cancelled', 'error'].indexOf(movement.receipt.statusValue) < 0) {
                            // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
                            // Se deben eliminar los detalles o se va a calcular información basura, además la idea es hacer una asignación desde 0.
                            if(movement.payment.statusValue !== 'credit') movement.payment.statusValue = 'paid';
                            movement.payment.details = [];
                            payments.push(movement.payment);                            
                        }
                    }
                }
            } else {
                return reject({
                    status: 400,
                    message: `Reconstrucción del balance | No se encontró ningún movimiento en el balance (${accountNumber}).`
                });
            }
            // console.log('Recibos.');

            // OOO  RRRR  DDDD  EEEEE N   N  AAA  M   M IIIII EEEEE N   N TTTTT  OOO
            //O   O R   R D   D E     NN  N A   A MM MM   I   E     NN  N   T   O   O
            //O   O RRRR  D   D EEE   N N N AAAAA M M M   I   EEE   N N N   T   O   O
            //O   O R   R D   D E     N  NN A   A M   M   I   E     N  NN   T   O   O
            // OOO  R   R DDDD  EEEEE N   N A   A M   M IIIII EEEEE N   N   T    OOO

            // Recibos.
            receipts.sort((a: Receipt, b: Receipt) => {
                let aMovementDate: Date = new Date(a.movementDate);
                let bMovementDate: Date = new Date(b.movementDate);
                if(aMovementDate < bMovementDate) return -1;
                if(aMovementDate > bMovementDate) return 1;
                return 0;
            });
            // Pagos.
            payments.sort((a: Payment, b: Payment) => {
                let aMovementDate: Date = new Date(a.paymentDate);
                let bMovementDate: Date = new Date(b.paymentDate);
                if(aMovementDate < bMovementDate) return -1;
                if(aMovementDate > bMovementDate) return 1;
                return 0;
            });
            // Saldo anterior.
            let previousBalance: number = 0;
            let paymentsPointer: number = 0;
            let receiptsPointer: number = 0;

            while(receiptsPointer < receipts.length) {
                // Revisar si existen pagos.
                if(paymentsPointer < payments.length) {
                    // Fecha del recibo.
                    let receiptDate: Date = new Date(receipts[receiptsPointer].movementDate);
                    // Fecha del pago.
                    let paymentDate: Date = new Date(payments[paymentsPointer].paymentDate);
                    // Se revisan las fechas de movimientos.
                    if(receiptDate < paymentDate) {
                        // NOTE: El recibo es anterior al pago.
                        // Se asigna el balance anterior al recibo.
                        receipts[receiptsPointer].previousBalance = previousBalance;
                        // Se modifica el balance.
                        previousBalance -= receipts[receiptsPointer].total;
                        previousBalance = parseFloat(previousBalance.toFixed(2));
                        // Se aumenta en 1 el apuntador de recibos.
                        receiptsPointer++;
                    } else {
                        // NOTE: El pago es anterior al recibo.
                        // Se modifica el balance.
                        previousBalance += payments[paymentsPointer].amountPaid;
                        previousBalance = parseFloat(previousBalance.toFixed(2));
                        // Se aumenta en 1 el apuntador de pagos.
                        paymentsPointer++;
                    }
                } else {
                    // Se asigna el balance anterior al recibo.
                    receipts[receiptsPointer].previousBalance = previousBalance;
                    // Se modifica el balance.
                    previousBalance -= receipts[receiptsPointer].total;
                    previousBalance = parseFloat(previousBalance.toFixed(2));
                    // Se aumenta en 1 el apuntador de recibos.
                    receiptsPointer++;
                }
            }
            // Después de recorrer los recibos se verifica que no existan aún más pagos.
            // NOTE: Esto ya puede ser un tanto inútil ya que no se modificaría el balance previo de ningún recibo.
            while(paymentsPointer < payments.length) {
                // Se modifica el balance.
                previousBalance += payments[paymentsPointer].amountPaid;
                previousBalance = parseFloat(previousBalance.toFixed(2));
                // Se aumenta en 1 el apuntador de pagos.
                paymentsPointer++;
            }
            
            //PPPP   AAA   GGGG  OOO   SSSS
            //P   P A   A G     O   O S
            //PPPP  AAAAA G  GG O   O  SSS
            //P     A   A G   G O   O     S
            //P     A   A  GGGG  OOO  SSSS
            
            // console.log('Recibos pendientes: ', pendingReceipts.length);
            // console.log('Pagos totales: ', payments.length);
            if(payments.length > 0 && receipts.length > 0) {
                // Se obtienen los detalles por pago, es decir, los recibos que se cubren por pago.
                // let paymentIndex: number = 0;
                for(const payment of payments) {
                    // console.log('Pago #', paymentIndex);
                    // paymentIndex++;

                    let remainingAmount: number = payment.amountPaid;
                    let details: Array<{ receiptId: string, amount: number }> = [];
                    let index: number = 0;
                    // let invoiceModel: InvoiceModel = new InvoiceModel();
                    while(remainingAmount > 0 && index < receipts.length) {
                        // Se revisa el pago sólo y sólo si está pendiene.
                        if(receipts[index].statusValue === 'pending') {
                            // console.log('Índice: ', index);
                            
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
                            // OPCIÓN #1 - Más tardada.
                            /*
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
                            */
                            // OPCIÓN #2 - La original (más rápida).
                            for(const payment of payments) {
                                if(Array.isArray(payment.details) && payment.details.length > 0) {
                                    for(const detail of payment.details) {
                                        if(receipts[index]._id === detail.receiptId) {
                                            paidAmount += parseFloat(detail.amount.toFixed(2));
                                        }
                                    }
                                }
                            }
                            paidAmount = parseFloat(paidAmount.toFixed(2));

                            //TTTTT  OOO  TTTTT  AAA  L     EEEEE  SSSS
                            //  T   O   O   T   A   A L     E     S
                            //  T   O   O   T   AAAAA L     EEE    SSS
                            //  T   O   O   T   A   A L     E         S
                            //  T    OOO    T   A   A LLLLL EEEEE SSSS
                            
                            // Se restan los pagos del total del recibo.
                            pendingAmount = parseFloat((receipts[index].total - paidAmount - creditedAmount).toFixed(2));
                            // Si el total de los pagos es mayor a la del total del recibo se debe igualar a 0.
                            // NOTE: Obviamente esto no debería pasar ¯\_(ツ)_/¯
                            pendingAmount = pendingAmount < 0 ? 0 : pendingAmount;
                            // Se redondean a 2 decimales.
                            pendingAmount = parseFloat(pendingAmount.toFixed(2));
                            // Se revisa la cantidad que se puede saldar del recibo.
                            if(pendingAmount > 0) {
                                if(remainingAmount >= pendingAmount) {
                                    // Si se puede cubrir el recibo completo.
                                    if(receipts[index]._id && typeof receipts[index]._id === 'string') {
                                        if(receipts[index]._id) {
                                            details.push({
                                                receiptId: receipts[index]._id || '',
                                                amount: pendingAmount
                                            });
                                        }
                                    }
                                    // Se resta el total del recibo al total retante.
                                    remainingAmount -= pendingAmount;
                                    remainingAmount = parseFloat(remainingAmount.toFixed(2));
                                    // NOTE: Se debe marcar el recibo como "pagado".
                                    receipts[index].statusValue = 'paid';
                                } else {
                                    // Se agrega un movimiento con el total restante si no logra cubri el recibo.
                                    if(receipts[index]._id && typeof receipts[index]._id === 'string') {
                                        if(receipts[index]._id) {
                                            details.push({
                                                receiptId: receipts[index]._id || '',
                                                amount: remainingAmount
                                            });
                                        }
                                    }
                                    // Se resta el total del recibo al total retante.
                                    remainingAmount -= remainingAmount;
                                    remainingAmount = parseFloat(remainingAmount.toFixed(2));
                                }
                            }
                        }
                        index++;
                    }
                    payment.details = details;
                    // NOTE: Si la cantidad faltante del pago es igual a 0, se deba actualizar el estatus del mismo.
                    if(remainingAmount <= 0) {
                        if(payment.statusValue !== 'credit') payment.statusValue = 'assigned';
                    } else if(remainingAmount === payment.amountPaid) {
                        // NOTE: Pero si la cantidad es exactamente igual al pago, se debe actualizar el estatus a "anticipo".
                        if(payment.statusValue !== 'credit') payment.statusValue = 'advanced';
                    }
                }
            } else {
                return reject({
                    status: 400,
                    message: `Reconstrucción del balance | No se encontró ningún pago o recibo en el balance (${accountNumber}).`
                });
            }
            // console.log('Pagos.');
            
            // AAA   CCCC TTTTT U   U  AAA  L     IIIII ZZZZZ  AAA   CCCC IIIII  OOO  N   N
            //A   A C       T   U   U A   A L       I      Z  A   A C       I   O   O NN  N
            //AAAAA C       T   U   U AAAAA L       I     Z   AAAAA C       I   O   O N N N
            //A   A C       T   U   U A   A L       I    Z    A   A C       I   O   O N  NN
            //A   A  CCCC   T    UUU  A   A LLLLL IIIII ZZZZZ A   A  CCCC IIIII  OOO  N   N

            // REcibos.
            let receiptsErrors: Array<any> = [];
            let receiptModel: ReceiptModel = new ReceiptModel();
            for(const receipt of receipts) {
                try {
                    // Sólo se actualiza el estatus.
                    let data = { 
                        _id: receipt._id,
                        statusValue: receipt.statusValue,
                        previousBalance: receipt.previousBalance
                    };
                    await receiptModel.putReceipt(data);
                } catch(error) {
                    receiptsErrors.push(error);
                }
            }
            // Pagos.
            let paymentsErrors: Array<any> = [];
            let paymentModel: PaymentModel = new PaymentModel();
            for(const payment of payments) {
                try {
                    // Se actualizan el estatus y los detalles.
                    await paymentModel.putPayment({ _id: payment._id, statusValue: payment.statusValue, details: payment.details });
                } catch(error) {
                    paymentsErrors.push(error);
                }
            }
            // console.log('Actualización.');

            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
            
            let result: any = {};
            result['payments'] = payments;
            result['receipts'] = receipts;
            result['errors'] = {
                receipts: receiptsErrors,
                payments: paymentsErrors
            };
            // console.log('Proceso terminado.');
            return resolve(result);
        });
    }

    public putREbuildAllBalances(body: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            // Hora de inicio.
            let startDate: Date = new Date();

            // CCCC U   U EEEEE N   N TTTTT  AAA   SSSS
            //C     U   U E     NN  N   T   A   A S
            //C     U   U EEE   N N N   T   AAAAA  SSS
            //C     U   U E     N  NN   T   A   A     S
            // CCCC  UUU  EEEEE N   N   T   A   A SSSS

            // 1. Se obtienen todas la cuentas.
            let getAccounts: { results: Array<Account>, summary: any } = { results: [], summary: {} };
            let accountModel: AccountModel = new AccountModel();
            try {
                let params = {
                    all: true,
                    masterReference: null,
                    statusValue: 'active'   // TODO: Revisar si es necesario sólo hacerlo con cuentas activas.
                };
                getAccounts = await accountModel.getAccounts(params);
            } catch(error) {
                return reject(error);
            }
            // 2. Se recorren y reconstruyen.
            if(getAccounts.results.length > 0) {
                let errors: Array<any> = [];
                let rebuilded: number = 0;
                console.log(`Total de cuentas: ${getAccounts.results.length}.`);

                // return resolve({
                //     status: 200,
                //     message: 'Ok'
                // });

                for(const account of getAccounts.results) {
                    // Reconstrucción.
                    try {
                        await this.putREbuildBalance({ accountNumber: account.accountNumber });
                        rebuilded++;
                        // process.stdout.write('hello: ' + x + '\r');
                        console.log(`Cuentas reconstruidas: ${rebuilded}`);
                    } catch(error) {
                        errors.push(error);
                        console.log(`Error #${errors.length}: `, error);
                    }
                }

                // Hora de término.
                let endDate: Date = new Date();
                let time: number = startDate.getTime() - endDate.getTime();
                let minutes: number = parseFloat(((time / 1000) / 60).toFixed(2));
                console.log(`Proceso terminado.\nBalances reconstruidos: ${rebuilded}.\nErrores: ${errors.length}.`);
                console.log(`Tiempo estimado: ${minutes} minutos.`);
                return resolve({
                    status: 200,
                    message: `Proceso terminado.\nBalances reconstruidos: ${rebuilded}.\nErrores: ${errors.length}.`
                });
            } else {
                return reject({
                    status: 404,
                    message: 'No se encontró ninguna cuenta... weird... ¯\_(ツ)_/¯'
                });
            }
        });
    }
}