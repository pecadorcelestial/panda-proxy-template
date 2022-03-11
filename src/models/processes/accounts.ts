// Módulos.
import fs from 'fs';
import path from 'path';
// Modelos.
import AccountModel, { Account } from '../accounts';
import AltanAPIsModel from '../altan/apis';
import BalanceModel, { IUglyBalance } from './balance';
import { Client } from '../clients';
import { Contact } from '../contacts';
import DiscountsModel, { Discount } from '../discounts';
import { EmailModel, To, Email, Message, FileStructure, EmailWithTemplate, SMSModel } from '../notifications';
import EventModel, { Event } from '../events';
import PaymentModel, { Payment } from '../payments';
import ReceiptModel, { Receipt, Item } from '../receipts';
import OpenPayModel from '../openPay';
// Funciones.
import { number2Month, date2StringFormat } from '../../scripts/dates';
import { number2Words, currencyFormat } from '../../scripts/numbers';
import { pdf2Base64 } from '../../classes/pdf';
import { isRegExp } from 'util';
import { AltanProductModel, AltanProduct } from '../products';
    
export default class AccountProcessesModel {

    // Propiedades.
    private writer: fs.WriteStream;

    // Constructor.
    constructor() {
        // Nombre del archivo para logs.
        let logFile: string = '';
        let today: Date = new Date;
        logFile = `../../logs/${date2StringFormat(today, 'YYYYMMDDhhmmss')}.log`;
        // Stream de escritura.
        let writer = fs.createWriteStream(path.join(__dirname, logFile), { flags: 'a' })
        .on('error', (error: any) => {
            console.log('Ocurrió un error al crear el stream de escritura.', error);
        });
        this.writer = writer;
    }
    
    //PPPP   OOO   SSSS TTTTT
    //P   P O   O S       T
    //PPPP  O   O  SSS    T
    //P     O   O     S   T
    //P      OOO  SSSS    T
    
    /**
     * Función que genera el recibo de todas las cuentas activas.
     *
     * @param {*} body
     * @returns {Promise<any>}
     * @memberof AccountProcessesModel
     */
    public postAllAccountsReceipts(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { page, ...rest }: { page: number } & any = body;
            if(!page || page < 1) page = 1;

            // Se obtiene el listado de todas la cuentas ACTIVAS (paginado x 50).
            // VARIABLES:
            // Bandera para terminar la ejecución.
            let thisNeedsToStop: boolean = false;
            // Paginación.
            let limit: number = 50;
            let params = {
                limit,
                page,
                statusValue: 'active',
                // Revisar si a) es post-pago y b) requiere de factura.
                invoiceRequired: true,
                isForcedTerm: true,

                // SUPER PODEROSA NINJA TURBO NEO ULTRA HYPER MEGA MULTI ALPHA META EXTRA UBER PREFIJO NOTA:
                // Se debe revisar cuántos meses lleva del plazo.
            };
            // Cuentas (resultados y detalle).
            let accounts: any | Array<any> = [];
            let summary: any = {};
            // Errores.
            let errors: { pages: Array<any>, accounts: Array<any> } = {
                pages: [],
                accounts: []
            };
            // Número de paginas a recorrer.
            let finalPage: number = 0;
            // Número de intentos realizados.
            let retries: number = 0;
            // Modelos.
            let accountModel: AccountModel = new AccountModel();

            //DDDD  EEEEE  SSSS  CCCC U   U EEEEE N   N TTTTT  OOO
            //D   D E     S     C     U   U E     NN  N   T   O   O
            //D   D EEE    SSS  C     U   U EEE   N N N   T   O   O
            //D   D E         S C     U   U E     N  NN   T   O   O
            //DDDD  EEEEE SSSS   CCCC  UUU  EEEEE N   N   T    OOO

            let discount: number = 0;
            let today: Date = new Date();
            let month: number = today.getMonth() + 1;
            let year: number = today.getFullYear();
            let discountModel: DiscountsModel = new DiscountsModel();
            let getDiscount: Discount = new Discount();
            try {
                getDiscount = await discountModel.getDiscount({ type: 'monthly', status: 'pending', applicationMonth: month, applicationYear: year });
                discount = getDiscount.amount || 0;
            } catch(error) {
                // No se hace nada si ocurrió un error al buscar un descuento del mes actual.
            }

            //IIIII N   N IIIII  CCCC IIIII  OOO
            //  I   NN  N   I   C       I   O   O
            //  I   N N N   I   C       I   O   O
            //  I   N  NN   I   C       I   O   O
            //IIIII N   N IIIII  CCCC IIIII  OOO

            while(!thisNeedsToStop) {
                
                // CCCC U   U EEEEE N   N TTTTT  AAA   SSSS
                //C     U   U E     NN  N   T   A   A S
                //C     U   U EEE   N N N   T   AAAAA  SSS
                //C     U   U E     N  NN   T   A   A     S
                // CCCC  UUU  EEEEE N   N   T   A   A SSSS
                
                try {
                    let accountsResult: any = await accountModel.getAccounts(params);
                    // this.writer.write(`[PROCESOS][RECIBOS][postAllAccountsReceipts] Se obtuvieron las cuentas.\r\n`);
                    accounts = accountsResult.results;
                    summary = accountsResult.summary;
                    // this.writer.write(`[PROCESOS][RECIBOS][postAllAccountsReceipts] Resumen: ${JSON.stringify(summary)}\r\n`);
                    // Se obtiene la última pagina.
                    finalPage = finalPage <= 0 ? summary.pages : finalPage;
                    console.log(`=================================== PAGINA -${params.page}- DE -${finalPage}- ===================================\r\n`);
                    // this.writer.write(`[PROCESOS][RECIBOS][postAllAccountsReceipts] Pagina acutal: ${page}\r\n`);
                    // this.writer.write(`[PROCESOS][RECIBOS][postAllAccountsReceipts] Pagina final: ${finalPage}\r\n`);
                } catch(error) {
                    // Se registra el error.
                    // this.writer.write(`[PROCESOS][RECIBOS][postAllAccountsReceipts][ERROR] No se pudieron obtener las cuentas: ${JSON.stringify(error)}\r\n`);
                    console.log(`[PROCESOS][RECIBOS][postAllAccountsReceipts][ERROR] No se pudieron obtener las cuentas: ${JSON.stringify(error)}\r\n`);
                    errors.pages.push({
                        page,
                        message: 'No se pudo obtener la información.',
                        error
                    });
                    // Se continua con la siguiente pagina o no.
                    if(finalPage <= 0) {
                        // El error fue con la primera pagina, así que se debe "reintentar".
                        retries++;
                        // Si se llega a 3 reintentos, se debe finalizar la ejecución del proceso.
                        if(retries >= 3) {
                            thisNeedsToStop = true;
                        }
                    } else {
                        // Se aumenta en 1 la pagina.
                        page++;
                        params.page = page;
                        // Si la siguiente pagina es mayor a la final, se debe terminar la ejecución.
                        if(page > finalPage) {
                            thisNeedsToStop = true;
                        }
                    }
                    continue;
                }

                //RRRR  EEEEE  CCCC IIIII BBBB   OOO   SSSS
                //R   R E     C       I   B   B O   O S
                //RRRR  EEE   C       I   BBBB  O   O  SSS
                //R   R E     C       I   B   B O   O     S
                //R   R EEEEE  CCCC IIIII BBBB   OOO  SSSS

                try {
                    // this.writer.write(`[PROCESOS][RECIBOS][postAllAccountsReceipts] Se obtienen y mandan los recibos.\r\n`);
                    let sendReceiptsResult: any = await this.getAndSendReceipts(accounts, discount/*, isTest*/);
                    if(Array.isArray(sendReceiptsResult.errors) && sendReceiptsResult.errors.length > 0) {
                        errors.accounts.push(sendReceiptsResult.errors);
                    }
                } catch(error) {
                    // this.writer.write(`[PROCESOS][RECIBOS][postAllAccountsReceipts][ERROR] No se pudieron obtener / mandar los recibos: ${JSON.stringify(error)}\r\n`);
                    console.log(`[PROCESOS][RECIBOS][postAllAccountsReceipts][ERROR] No se pudieron obtener / mandar los recibos: ${JSON.stringify(error)}\r\n`);
                    errors.pages.push({
                        page,
                        message: 'No se pudieron enviar los recibos.',
                        error
                    });
                }
                // this.writer.write(`[PROCESOS][RECIBOS][postAllAccountsReceipts] Recibos enviados.\r\n`);

                // SSSS IIIII  GGGG U   U IIIII EEEEE N   N TTTTT EEEEE
                //S       I   G     U   U   I   E     NN  N   T   E
                // SSS    I   G  GG U   U   I   EEE   N N N   T   EEE
                //    S   I   G   G U   U   I   E     N  NN   T   E
                //SSSS  IIIII  GGGG  UUU  IIIII EEEEE N   N   T   EEEEE
                
                // this.writer.write(`=================================== FIN PAGINA -${params.page}- ===================================\r\n`);
                // console.log(`=================================== FIN PAGINA -${params.page}- ===================================\r\n`);
                // Se aumenta en 1 la pagina.
                page++;
                params.page = page;
                // Si la siguiente pagina es mayor a la final, se debe terminar la ejecución.
                if(page > finalPage) {
                    thisNeedsToStop = true;
                }
            }
            
            //DDDD  EEEEE  SSSS  CCCC U   U EEEEE N   N TTTTT  OOO
            //D   D E     S     C     U   U E     NN  N   T   O   O
            //D   D EEE    SSS  C     U   U EEE   N N N   T   O   O
            //D   D E         S C     U   U E     N  NN   T   O   O
            //DDDD  EEEEE SSSS   CCCC  UUU  EEEEE N   N   T    OOO

            // NOTE: Se debe marcar el descuento como "utilizado".

            try {
                await discountModel.putDiscount({ _id: getDiscount._id, status: 'applied' });
            } catch(error) {
                // No se hace nada si ocurrió un error al buscar un descuento del mes actual.
            }

            //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
            //E     R   R R   R O   O R   R E     S
            //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
            //E     R   R R   R O   O R   R E         S
            //EEEEE R   R R   R  OOO  R   R EEEEE SSSS

            // this.writer.write(`[PROCESOS][RECIBOS][postAllAccountsReceipts] Se detiene el proceso.\r\n`);
            console.log(`[PROCESOS][RECIBOS][postAllAccountsReceipts] Terminó el proceso.\r\n`);
            return resolve({
                errors
            });
        });
    }

    public sendAllAccountsOpenPayFormats(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // Se obtienen el primer y último día del mes.
            let today: Date = new Date();
            let firstDay: Date | string = new Date(today.getFullYear(), today.getMonth(), 1);
            firstDay = date2StringFormat(firstDay, 'YYYY-MM-DD');
            let lastDay: Date | string = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            let dueDate: string = date2StringFormat(lastDay, 'DD/MM/YYYYY hh:mm:ss');
            lastDay = date2StringFormat(lastDay, 'YYYY-MM-DD');
            // Se obtienen todos los recibos el mes que estén pendientes.
            let getReceipts: { results: Array<Receipt>, summary: any} = { results: [], summary: {} };
            try {
                let params: any = {
                    movementDate: {"start": firstDay, "end": lastDay},
                    statusValue: 'pending',
                    typeValue: 'monthly',
                    all: true
                };
                let receiptModel: ReceiptModel = new ReceiptModel();
                getReceipts = await receiptModel.getReceipts(params);
                // return resolve(getReceipts.summary);
            } catch(error) {
                return reject(error);
            }
            // Se recorre uno a uno para generar el archivo.
            let openpayModel: OpenPayModel = new OpenPayModel();
            for(const receipt of getReceipts.results) {
                if(receipt.total < 10000) {
                    
                    //PPPP  DDDD  FFFFF
                    //P   P D   D F
                    //PPPP  D   D FFF
                    //P     D   D F
                    //P     DDDD  F

                    let getPDF2base64: { status: number, base64: string } = { status: 200, base64: '' };
                    try {
                        // Se obtiene el PDF en base64 para adjuntarlo en el correo.
                        let data: any = {
                            accountNumber: receipt.parentId,
                            amount: receipt.total,
                            due_date: dueDate
                        };
                        getPDF2base64 = await openpayModel.postBase64StoreCharge(data);
                    } catch(error) {
                        continue;
                    }
                    
                    //EEEEE M   M  AAA  IIIII L
                    //E     MM MM A   A   I   L
                    //EEE   M M M AAAAA   I   L
                    //E     M   M A   A   I   L
                    //EEEEE M   M A   A IIIII LLLLL

                    let attachments: Array<FileStructure> = [];
                    attachments.push({
                        type: 'application/pdf',
                        name: 'FormatoPagoConveniencia.pdf',
                        content: getPDF2base64.base64
                    });
                    let data: any = {
                        accountNumber: receipt.parentId,
                        attachments,
                        template: 'client_notification',
                        content: [
                            {
                                name: 'message',
                                content: 'Por medio del presente le proporcionamos el formato de pago referenciado, con el cual podrá realiza su pago en las tiendas de conveniencia afiliadas.'
                            }
                        ],
                        subject: 'Domain - Pago en tiendas de conveniencia   '
                    };
                    try {
                        await this.sendEmail(data);
                    } catch(error) {
                        continue;
                    }
                }
            }

            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

            return resolve({
                stauts: 200,
                message: 'Mensaje enviado con éxito.'
            });
        });
    }
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    /**
     * Función que envía los recibos de todas las cuentas.
     *
     * @private
     * @param {Array<any>} accounts
     * @returns {Promise<any>}
     * @memberof AccountProcessesModel
     */
    private getAndSendReceipts(accounts: Array<Account>, discount: number = 0/*, isTest: boolean = true*/): Promise<any> {
        // console.log(`¿Son pruebas? R=${isTest}`);
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            // VARIABLES:
            // Cliente y su balance.
            let balance: any = {};
            let client: Client;
            // Recibo.
            let receipt: Receipt;
            // Errores.
            let errors: Array<any> = [];
            // Modelos.
            let balanceModel: BalanceModel = new BalanceModel();
            let receiptModel: ReceiptModel = new ReceiptModel();
            let accountModel: AccountModel = new AccountModel();
            // Se recorren uno a uno los registros.
            if(accounts && Array.isArray(accounts) && accounts.length > 0) {
                // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA TURBO 9000:
                // Se utiliza "for... of..." en lugar de "forEach" ya que con este último no se respetan las llamadas asíncronas.
                // https://www.coreycleary.me/why-does-async-await-in-a-foreach-not-actually-await/
                for(const account of accounts) {
                    // this.writer.write(`=================================== CUENTA: ${account.accountNumber} ===================================\r\n`);
                    console.log(`=================================== CUENTA: ${account.accountNumber} ===================================\r\n`);
                    
                    // CCCC  OOO  N   N DDDD  IIIII  CCCC IIIII  OOO  N   N EEEEE  SSSS
                    //C     O   O NN  N D   D   I   C       I   O   O NN  N E     S
                    //C     O   O N N N D   D   I   C       I   O   O N N N EEE    SSS
                    //C     O   O N  NN D   D   I   C       I   O   O N  NN E         S
                    // CCCC  OOO  N   N DDDD  IIIII  CCCC IIIII  OOO  N   N EEEEE SSSS

                    // 1. Es cuenta maestra.
                    // 2. No es cuenta maestra pero no es cuenta esclava.
                    // 3. Es post pago.

                    // Se revisa que la cuenta sea maestra o que no dependa de otra.
                    if(account.isMaster || (!account.isMaster && ((typeof account.masterReference != 'string' || account.masterReference === '') && account.isForcedTerm))) {
                        // this.writer.write(`[PROCESOS][RECIBOS][getAndSendReceipts] Si se debe generar recibo.\r\n`);
                        // console.log(`[PROCESOS][RECIBOS][getAndSendReceipts] Si se debe generar recibo ${account.accountNumber}.\r\n`);
                        
                        let accountErrors: { accountNumber: any, errors: Array<any> } = {
                            accountNumber: account.accountNumber,
                            errors: []
                        };

                        //BBBB   AAA  L      AAA  N   N  CCCC EEEEE
                        //B   B A   A L     A   A NN  N C     E
                        //BBBB  AAAAA L     AAAAA N N N C     EEE
                        //B   B A   A L     A   A N  NN C     E
                        //BBBB  A   A LLLLL A   A N   N  CCCC EEEEE
                        
                        // Se obtiene la información del balance del cliente.
                        // NOTE: Del balance sólo se obtiene la cuenta, el cliente y el total, por lo que se puede dejar la siguiente función.
                        try {
                            let balanceResult = await balanceModel.getAccountBalance({ accountNumber: account.accountNumber });
                            balance = balanceResult;
                            client = balance.client;
                            account['client'] = client;
                        } catch(error) {
                            // this.writer.write(`[PROCESOS][RECIBOS][getAndSendReceipts][ERROR] Balance: ${JSON.stringify(error)}\r\n`);
                            console.log(`[PROCESOS][RECIBOS][getAndSendReceipts][ERROR] No se pudo obtener el balance.\r\n`);
                            accountErrors.errors.push({
                                message: 'No se pudo obtener la información del balance.',
                                clientId: account.clientId,
                                error
                            });
                            // Se interrumple la ejecución de está iteración (cuenta).
                            continue;
                        }
                        
                        //RRRR  EEEEE  CCCC IIIII BBBB   OOO
                        //R   R E     C       I   B   B O   O
                        //RRRR  EEE   C       I   BBBB  O   O
                        //R   R E     C       I   B   B O   O
                        //R   R EEEEE  CCCC IIIII BBBB   OOO

                        // Se genera el recibo.
                        // El proceso que genera el recibo toma en cuenta los proporcionales actual o anterior.
                        try {
                            let _getAccountReceiptResult: {receipt: Receipt, slaveAccounts: Account[]} = await accountModel.getAccountReceipt(account);
                            receipt = _getAccountReceiptResult.receipt;
                            // this.writer.write(`[PROCESOS][RECIBOS][getAndSendReceipts] Recibo: ${JSON.stringify(receipt)}\r\n`);
                        } catch(error) {
                            // this.writer.write(`[PROCESOS][RECIBOS][getAndSendReceipts][ERROR] Recibo: ${JSON.stringify(error)}\r\n`);
                            console.log(`[PROCESOS][RECIBOS][getAndSendReceipts][ERROR] No se pudo obtener la información del recibo.\r\n`);
                            accountErrors.errors.push({
                                message: 'No se pudo generar el recibo de la cuenta.',
                                error
                            });
                            // Se interrumple la ejecución de está iteración (cuenta).
                            continue;
                        }
                        
                        //DDDD  EEEEE  SSSS  CCCC U   U EEEEE N   N TTTTT  OOO
                        //D   D E     S     C     U   U E     NN  N   T   O   O
                        //D   D EEE    SSS  C     U   U EEE   N N N   T   O   O
                        //D   D E         S C     U   U E     N  NN   T   O   O
                        //DDDD  EEEEE SSSS   CCCC  UUU  EEEEE N   N   T    OOO

                        if(discount > 0) {

                            // NOTE: El descuento se calcula, tal vez sólo por esta ocasión (02/28/2020) de la siguiente manera:
                            // Monto Renta Mensual / No. de días del mes (29) / 24 horas * 12 horas de afectación = Monto a Bonificar

                            let today: Date = new Date;
                            // TODO: Calcular los días del mes anterior así:
                            let days: number = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
                            // DELETE:
                            days = 29;
                            // NOTE: El descuento es sobre la renta mensual, no sobre el monto generado por el recibo.
                            // FIX:
                            let monthlyRent: number = parseFloat(receipt.total.toFixed(2));
                            let customDiscount: number = 0;
                            if(monthlyRent > 0) {
                                customDiscount = parseFloat((((monthlyRent / 29) / 24) * 12).toFixed(2));
                            }
                            if(customDiscount > 0) {
                                // TODO: Se debe aplicar el descuento en los conceptos para que el timbrado los tome en cuenta.
                                
                                receipt.discount = parseFloat((receipt.discount + customDiscount).toFixed(2));
                                receipt.total = parseFloat((receipt.total - customDiscount).toFixed(2));
                                receipt.total = receipt.total < 0 ? 0 : receipt.total;
                            }

                            // TODO: Pensar en una mejor forma de hacerlo.
                            /*
                            receipt.discount += discount;
                            receipt.total -= discount;
                            // TODO: Se debe revisar si el total no es menor a 0 ya con el descuento.
                            if(receipt.total < 0) {
                                receipt.total = 0;
                            }
                            */
                        }

                        // Se guarda el recibo.
                        // El proceso que guarda el recibo genera las facturas necesarias y envía por correo los documentos.
                        // if(!isTest) {
                            try {
                                // console.log(`[PROCESOS][RECIBOS][getAndSendReceipts] Antes de generar el recibo.\r\n`);
                                await receiptModel.postReceipt(receipt);
                            } catch(error) {
                                // this.writer.write(`[PROCESOS][RECIBOS][getAndSendReceipts] Error al guardar el recibo: ${JSON.stringify(error)}\r\n`);
                                console.log(`[PROCESOS][RECIBOS][getAndSendReceipts] Ocurrió un error al guardar el recibo.\r\n`);
                                accountErrors.errors.push({
                                    message: 'No se pudo guardar la información del recibo.',
                                    error
                                });
                                // Se interrumple la ejecución de está iteración (cuenta).
                                continue;
                            }
                        // }

                        //PPPP  L      AAA  ZZZZZ  OOO       FFFFF  OOO  RRRR  ZZZZZ  OOO   SSSS  OOO
                        //P   P L     A   A    Z  O   O      F     O   O R   R    Z  O   O S     O   O
                        //PPPP  L     AAAAA   Z   O   O      FFF   O   O RRRR    Z   O   O  SSS  O   O
                        //P     L     A   A  Z    O   O      F     O   O R   R  Z    O   O     S O   O
                        //P     LLLLL A   A ZZZZZ  OOO       F      OOO  R   R ZZZZZ  OOO  SSSS   OOO

                        // Se revisa si la cuenta tiene un plazo forzoso, y le elimina uno.
                        if(/*!isTest && */typeof account.forcedTermValue === 'string' && parseInt(account.forcedTermValue) > 0) {
                            let pendingTerms: number = account.pendingTerms || 0;
                            pendingTerms++;
                            try {
                                let accountModel = new AccountModel();
                                await accountModel.putAccount({ accountNumber: account.accountNumber, pendingTerms });
                            } catch(error) {
                                // this.writer.write(`[PROCESOS][RECIBOS][getAndSendReceipts] Errr al actualizar el plazo forzoso de la cuenta: ${JSON.stringify(error)}\r\n`);
                                console.log(`[PROCESOS][RECIBOS][getAndSendReceipts] Ocurrió un error al actualizar el plazo forzoso de la cuenta.\r\n`);
                                accountErrors.errors.push({
                                    message: 'No se pudo actualizar la información de la cuenta (plazo forzoso).',
                                    error
                                });
                            }
                        }
                
                        //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
                        //E     R   R R   R O   O R   R E     S
                        //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
                        //E     R   R R   R O   O R   R E         S
                        //EEEEE R   R R   R  OOO  R   R EEEEE SSSS

                        // Se revisa si ocurrieron errores.
                        if(accountErrors.errors.length > 0) {
                            // Errores.
                            // this.writer.write(`[PROCESOS][RECIBOS][getAndSendReceipts] Errores: ${JSON.stringify(accountErrors.errors)}\r\n`);
                            errors.push(accountErrors);
                        }
                    }
                };

                //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
                //R   R E     S     U   U L       T   A   A D   D O   O
                //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
                //R   R E         S U   U L       T   A   A D   D O   O
                //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO

                return resolve({
                    message: (errors.length === 0) ? 'El proceso de las cuentas terminó correctamente.' : 'Hubo errores durante el proceso de generación y envío de recibos.',
                    errors
                });
            } else {
                
                //EEEEE RRRR  RRRR   OOO  RRRR  EEEEE  SSSS
                //E     R   R R   R O   O R   R E     S
                //EEE   RRRR  RRRR  O   O RRRR  EEE    SSS
                //E     R   R R   R O   O R   R E         S
                //EEEEE R   R R   R  OOO  R   R EEEEE SSSS

                return reject({
                    message: 'Hubo errores durante el proceso de generación y envío de recibos.',
                    errors: [{
                        message: `La lista de cuentas está vacía al parecer.`
                    }]
                });
            }
        });
    }

    public getAccountDebit(query: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            //FFFFF EEEEE  CCCC H   H  AAA   SSSS
            //F     E     C     H   H A   A S
            //FFF   EEE   C     HHHHH AAAAA  SSS
            //F     E     C     H   H A   A     S
            //F     EEEEE  CCCC H   H A   A SSSS

            let { accountNumber, dueDate, ...rest }: { accountNumber: string, dueDate: string | Date } = query;
            // Si no se manda una fecha, se toma la fecha actual.
            dueDate = dueDate ? new Date(dueDate) : new Date();
            let day: number = dueDate.getDate();
            let month: number = dueDate.getMonth();
            let year: number = dueDate.getFullYear();
            // Primer día del mes.
            let firstMonthDay: Date = new Date(year, month, 1);
            // Último día del mes.
            let lastMonthDay: Date = new Date(year, month + 1, 0);
            
            //RRRR  EEEEE  CCCC IIIII BBBB   OOO   SSSS
            //R   R E     C       I   B   B O   O S
            //RRRR  EEE   C       I   BBBB  O   O  SSS
            //R   R E     C       I   B   B O   O     S
            //R   R EEEEE  CCCC IIIII BBBB   OOO  SSSS
            
            let receiptModel: ReceiptModel = new ReceiptModel();
            let paymentModel: PaymentModel = new PaymentModel();
            let getReceipts: { results: Array<Receipt>, summary: any } = { results: [], summary: {} };
            try {
                let params: any = {
                    all: true,
                    parentId: accountNumber,
                    movementDate: { start: date2StringFormat(firstMonthDay, 'YYYY-MM-DD'), end: date2StringFormat(lastMonthDay, 'YYYY-MM-DD') },
                    statusValue: 'pending',
                };
                getReceipts = await receiptModel.getReceipts(params);
                console.log('==================== RECIBOS ====================');
                console.log(getReceipts.results.length);
            } catch(error) {
                return reject(error);
            }
            
            let emailSent: number = 0;
            let errors: Array<any> = [];
            let accountModel: AccountModel = new AccountModel();
            if(Array.isArray(getReceipts.results) && getReceipts.results.length > 0) {
                // console.log('Si hay recibos pendientes.');
                for(const receipt of getReceipts.results) {
                        
                    //PPPP   AAA   GGGG  OOO   SSSS
                    //P   P A   A G     O   O S
                    //PPPP  AAAAA G  GG O   O  SSS
                    //P     A   A G   G O   O     S
                    //P     A   A  GGGG  OOO  SSSS

                    let getPayments: { total: number } = { total: 0 };
                    let paidAmount: number = 0;
                    try {
                        getPayments = await paymentModel.getPayments4ReceiptTotal({ _id: receipt._id });
                        paidAmount = parseFloat(getPayments.total.toString());
                        console.log('==================== PAGOS ====================');
                        console.log('Total pagado: ', paidAmount);
                    } catch(error) {}
                    
                    // CCCC  OOO  N   N DDDD  IIIII  CCCC IIIII  OOO  N   N EEEEE  SSSS
                    //C     O   O NN  N D   D   I   C       I   O   O NN  N E     S
                    //C     O   O N N N D   D   I   C       I   O   O N N N EEE    SSS
                    //C     O   O N  NN D   D   I   C       I   O   O N  NN E         S
                    // CCCC  OOO  N   N DDDD  IIIII  CCCC IIIII  OOO  N   N EEEEE SSSS

                    // NOTE: La cuenta debe deber al menos 10% de su mensualidad.
                    // receipt.total === 100%
                    let dueBalance: number = (receipt.total < 0 ? (receipt.total * -1) : receipt.total) - paidAmount;
                    dueBalance = dueBalance < 0 ? 0 : parseFloat(dueBalance.toFixed(2));
                    let dueBalancePercent: number = dueBalance > 0 ? (parseFloat(((dueBalance * 100) / receipt.total).toFixed(2))) : 0;

                    // La cuenta debe estar activa, ser maestra o individual.
                    console.log('==================== TOTALES ====================');
                    console.log('Total del recibo: ', receipt.total);
                    console.log('Adeudo: ', dueBalance);
                    console.log('Porcentaje: ', dueBalancePercent);
                    if(dueBalancePercent >= 10) {

                        // console.log('Si debe.');

                        // CCCC U   U EEEEE N   N TTTTT  AAA
                        //C     U   U E     NN  N   T   A   A
                        //C     U   U EEE   N N N   T   AAAAA
                        //C     U   U E     N  NN   T   A   A
                        // CCCC  UUU  EEEEE N   N   T   A   A

                        let account: Account = new Account();
                        let client: Client = new Client();
                        try {
                            account = await accountModel.getAccount({ accountNumber: receipt.parentId });
                            client = account.client || new Client();
                        } catch(error) {
                            errors.push({error});
                            continue;
                        }

                        // CCCC  OOO  N   N DDDD  IIIII  CCCC IIIII  OOO  N   N EEEEE  SSSS
                        //C     O   O NN  N D   D   I   C       I   O   O NN  N E     S
                        //C     O   O N N N D   D   I   C       I   O   O N N N EEE    SSS
                        //C     O   O N  NN D   D   I   C       I   O   O N  NN E         S
                        // CCCC  OOO  N   N DDDD  IIIII  CCCC IIIII  OOO  N   N EEEEE SSSS

                        // La cuenta debe estar activa, ser maestra o individual.
                        if(account.statusValue === 'active' && (account.isMaster || (!account.masterReference || (typeof account.masterReference === 'string' && account.masterReference === '')))) {
                            // console.log('Si se debe notificar.');
                            // El cliente no debe tener bandera "avoidSuspension".
                            if(!client.avoidSuspension) {
                                /*
                                //RRRR  EEEEE FFFFF EEEEE RRRR  EEEEE N   N  CCCC IIIII  AAA   SSSS
                                //R   R E     F     E     R   R E     NN  N C       I   A   A S
                                //RRRR  EEE   FFF   EEE   RRRR  EEE   N N N C       I   AAAAA  SSS
                                //R   R E     F     E     R   R E     N  NN C       I   A   A     S
                                //R   R EEEEE F     EEEEE R   R EEEEE N   N  CCCC IIIII A   A SSSS
        
                                let paymentReferences: { bbva: string, bajio: string } = { bbva: '', bajio: '' };
                                if(Array.isArray(account.paymentReferences) && account.paymentReferences.length > 0) {
                                    for(const reference of account.paymentReferences) {
                                        switch(reference.referenceName) {
                                            case 'BBVA Bancomer':
                                                paymentReferences.bbva = reference.reference;
                                                break;
                                            case 'Banco del Bajío':
                                                paymentReferences.bajio = reference.reference;
                                                break;
                                        }
                                    }
                                } else {
                                    errors.push({
                                        status: 404,
                                        message: `No se encontraron referencias en la cuenta ${account.accountNumber}.`
                                    });
                                }
        
                                // SSSS M   M  SSSS
                                //S     MM MM S
                                // SSS  M M M  SSS
                                //    S M   M     S
                                //SSSS  M   M SSSS

                                let phoneRegEx: RegExp = new RegExp(/[0-9]{10}/, 'gi');
                                if(account.phone && phoneRegEx.test(account.phone)) {
                                    let sms: any = {
                                        number: `52${account.phone}`,
                                        message: `Domain le informa que su factura está próxima a vencer. No olvide realizar su pago para continuar disfrutando del servicio.`
                                    };
                                    let smsModel: SMSModel = new SMSModel();
                                    try {
                                        await smsModel.postSMS(sms);
                                    } catch(error) {
                                        errors.push(error);
                                    }
                                }
        
                                //EEEEE M   M  AAA  IIIII L
                                //E     MM MM A   A   I   L
                                //EEE   M M M AAAAA   I   L
                                //E     M   M A   A   I   L
                                //EEEEE M   M A   A IIIII LLLLL
        
                                let data: any = {
                                    accountNumber: account.accountNumber,
                                    // attachments,
                                    template: 'pending_balance',
                                    content: [
                                        {
                                            name: 'due_date',
                                            content: lastMonthDay.getDate().toString()
                                        },
                                        {
                                            name: 'amount',
                                            content: currencyFormat.format(receipt.total - paidAmount)
                                        },
                                        {
                                            name: 'bancomer_reference',
                                            content: paymentReferences.bbva
                                        },
                                        {
                                            name: 'reference',
                                            content: paymentReferences.bajio
                                        }
                                    ],
                                    subject: `Domain - Saldo pendiente ${account.accountNumber}.`
                                };
                                try {
                                    await this.sendEmail(data);
                                    emailSent++;
                                    process.stdout.write(`Correos enviados: ${emailSent}\r`);
                                } catch(error) {
                                    errors.push(error);
                                }
                                */
                            }
                        }
                    }
                }
            }
            
            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
            
            // console.log(`Proceso terminado. Correos enviados: ${emailSent}`);
            return resolve({
                status: errors.length > 0 ? 206 : 200,
                message: `Proceso terminado con éxito. Correos enviados: ${emailSent}.`,
                errors
            });
        });
    }

    //EEEEE M   M  AAA  IIIII L
    //E     MM MM A   A   I   L
    //EEE   M M M AAAAA   I   L
    //E     M   M A   A   I   L
    //EEEEE M   M A   A IIIII LLLLL

    // NOTE: Función acutalizada para utilizar la función de envío genérica.
    public sendReferences(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let { accountNumber, ...rest}: { accountNumber: string } & any = body;

            // CCCC U   U EEEEE N   N TTTTT  AAA
            //C     U   U E     NN  N   T   A   A
            //C     U   U EEE   N N N   T   AAAAA
            //C     U   U E     N  NN   T   A   A
            // CCCC  UUU  EEEEE N   N   T   A   A

            let accountModel = new AccountModel();
            let account: Account = new Account();
            try {
                account = await accountModel.getAccount({ accountNumber });
            } catch(error) {
                return reject(error);
            }

            //RRRR  EEEEE FFFFF EEEEE RRRR  EEEEE N   N  CCCC IIIII  AAA   SSSS
            //R   R E     F     E     R   R E     NN  N C       I   A   A S
            //RRRR  EEE   FFF   EEE   RRRR  EEE   N N N C       I   AAAAA  SSS
            //R   R E     F     E     R   R E     N  NN C       I   A   A     S
            //R   R EEEEE F     EEEEE R   R EEEEE N   N  CCCC IIIII A   A SSSS

            let paymentReferences: { bbva: string, bajio: string } = { bbva: '', bajio: '' };
            if(Array.isArray(account.paymentReferences) && account.paymentReferences.length > 0) {
                for(const reference of account.paymentReferences) {
                    switch(reference.referenceName) {
                        case 'BBVA Bancomer':
                            paymentReferences.bbva = reference.reference;
                            break;
                        case 'Banco del Bajío':
                            paymentReferences.bajio = reference.reference;
                            break;
                    }
                }
            } else {
                return reject({
                    status: 404,
                    message: 'No se encontraron referencias en la cuenta.'
                });
            }

            //EEEEE M   M  AAA  IIIII L
            //E     MM MM A   A   I   L
            //EEE   M M M AAAAA   I   L
            //E     M   M A   A   I   L
            //EEEEE M   M A   A IIIII LLLLL

            let data: any = {
                accountNumber,
                // attachments,
                template: 'payment_data',
                content: [
                    {
                        name: 'payment_reference_bancomer',
                        content: paymentReferences.bbva
                    },
                    {
                        name: 'payment_reference',
                        content: paymentReferences.bajio
                    }
                ],
                subject: `Domain - Referencias bancarias ${accountNumber}.`
            };
            try {
                await this.sendEmail(data);
                return resolve({
                    stauts: 200,
                    message: 'Mensaje enviado con éxito.'
                });
            } catch(error) {
                return reject(error);
            }
        });
    }

    // NOTE: Función acutalizada para utilizar la función de envío genérica.
    public sendPastDueBalance(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            //FFFFF EEEEE  CCCC H   H  AAA   SSSS
            //F     E     C     H   H A   A S
            //FFF   EEE   C     HHHHH AAAAA  SSS
            //F     E     C     H   H A   A     S
            //F     EEEEE  CCCC H   H A   A SSSS

            // NOTE: Esto siempre es con el mes anterior.
            let today: Date = new Date();
            let dueDate: Date = new Date(today.getFullYear(), today.getMonth() - 1);
            let month: number = dueDate.getMonth();
            let year: number = dueDate.getFullYear();
            // Primer día del mes.
            let firstMonthDay: Date = new Date(year, month, 1);
            console.log(firstMonthDay);
            // Último día del mes.
            let lastMonthDay: Date = new Date(year, month + 1, 0);
            console.log(lastMonthDay);
            
            //RRRR  EEEEE  CCCC IIIII BBBB   OOO   SSSS
            //R   R E     C       I   B   B O   O S
            //RRRR  EEE   C       I   BBBB  O   O  SSS
            //R   R E     C       I   B   B O   O     S
            //R   R EEEEE  CCCC IIIII BBBB   OOO  SSSS
            
            let receiptModel: ReceiptModel = new ReceiptModel();
            let getReceipts: { results: Array<Receipt>, summary: any } = { results: [], summary: {} };
            try {
                let params: any = {
                    movementDate: { start: date2StringFormat(firstMonthDay, 'YYYY-MM-DD'), end: date2StringFormat(lastMonthDay, 'YYYY-MM-DD') },
                    statusValue: 'pending',
                    // typeValue: 'monthly',
                    all: true,
                    // limit: 3,
                    // page: 1,
                    sort: { field: 'movementDate', type: 'DESC' }
                };
                getReceipts = await receiptModel.getReceipts(params);
            } catch(error) {
                return reject(error);
            }
            // console.log(`Recibos pendientes: ${getReceipts.results.length}`);
            
            // AAA  DDDD  EEEEE U   U DDDD   OOO   SSSS
            //A   A D   D E     U   U D   D O   O S
            //AAAAA D   D EEE   U   U D   D O   O  SSS
            //A   A D   D E     U   U D   D O   O     S
            //A   A DDDD  EEEEE  UUU  DDDD   OOO  SSSS

            let emailSent: number = 0;
            let errors: Array<any> = [];
            let balanceModel: BalanceModel = new BalanceModel();
            // let accountModel: AccountModel = new AccountModel();
            let paymentModel: PaymentModel = new PaymentModel();
            if(Array.isArray(getReceipts.results) && getReceipts.results.length > 0) {
                let index: number = 0;
                for(const receipt of getReceipts.results) {
                    // if(receipt.total > 0) {

                        //PPPP   AAA   GGGG  OOO   SSSS
                        //P   P A   A G     O   O S
                        //PPPP  AAAAA G  GG O   O  SSS
                        //P     A   A G   G O   O     S
                        //P     A   A  GGGG  OOO  SSSS
                        
                        // Pagos relacionados al recibo.
                        let paidAmount: number = 0;
                        let getPayments: { results: Array<Payment>, summary: any } = { results: [], summary: {} };
                        try {
                            getPayments = await paymentModel.getPayments({ 'details.receiptId': receipt._id });
                        } catch(error) {
                            // console.log('Ocurrió un error al obtener los pagos: ', error);
                            errors.push(error);
                            continue;
                        }
                        // Si se encontraron pagos, se suman los montos que pertenecen al recibo.
                        if(getPayments.results.length > 0) {
                            for(const payment of getPayments.results) {
                                if((Array.isArray(payment.details) && payment.details.length > 0)) {
                                    for(const detail of payment.details) {
                                        if(detail.receiptId === receipt._id) {
                                            paidAmount += detail.amount;
                                        }
                                    }
                                }
                            }
                        }
                        // Se de formato al total pagado.
                        paidAmount = parseFloat(paidAmount.toFixed(2));
                        
                        // CCCC  OOO  N   N DDDD  IIIII  CCCC IIIII  OOO  N   N EEEEE  SSSS
                        //C     O   O NN  N D   D   I   C       I   O   O NN  N E     S
                        //C     O   O N N N D   D   I   C       I   O   O N N N EEE    SSS
                        //C     O   O N  NN D   D   I   C       I   O   O N  NN E         S
                        // CCCC  OOO  N   N DDDD  IIIII  CCCC IIIII  OOO  N   N EEEEE SSSS

                        // NOTE: La cuenta debe deber al menos 10% de su mensualidad.
                        // receipt.total === 100%
                        let dueBalance: number = parseFloat((receipt.total - paidAmount).toFixed(2));
                        dueBalance = dueBalance < 0 ? 0 : dueBalance;
                        let dueBalancePercent: number = 0;
                        // if(receipt.total > 0 && dueBalance > 0) {
                            dueBalancePercent = dueBalance > 0 ? parseFloat(((dueBalance * 100) / receipt.total).toFixed(2)): 0;
                        // }

                        // La cuenta debe estar activa, ser maestra o individual.
                        if(dueBalancePercent >= 10) {
                            
                            //BBBB   AAA  L      AAA  N   N  CCCC EEEEE
                            //B   B A   A L     A   A NN  N C     E
                            //BBBB  AAAAA L     AAAAA N N N C     EEE
                            //B   B A   A L     A   A N  NN C     E
                            //BBBB  A   A LLLLL A   A N   N  CCCC EEEEE

                            let balance: { account: Account, client: Client, balance: Array<IUglyBalance>, total: number };
                            let account: Account = new Account();
                            let client: Client = new Client();
                            try {
                                balance = await balanceModel.getAccountFullBalanceUGLY({ accountNumber: receipt.parentId });
                                account = balance.account;
                                client = balance.client;
                            } catch(error) {
                                // console.log('Ocurrió un error al obtener el balance: ', error);
                                errors.push(error);
                                continue;
                            }
                            let realBalance: number = balance.total;

                            //U   U L     TTTTT IIIII M   M  OOO       RRRR  EEEEE  CCCC IIIII BBBB   OOO
                            //U   U L       T     I   MM MM O   O      R   R E     C       I   B   B O   O
                            //U   U L       T     I   M M M O   O      RRRR  EEE   C       I   BBBB  O   O
                            //U   U L       T     I   M   M O   O      R   R E     C       I   B   B O   O
                            // UUU  LLLLL   T   IIIII M   M  OOO       R   R EEEEE  CCCC IIIII BBBB   OOO

                            let currentMonthReceipt: Receipt = new Receipt();
                            // Primer día del mes.
                            let currentMonthFirstDay: Date = new Date(today.getFullYear(), today.getMonth(), 1);
                            // Último día del mes.
                            let currentMonthLastDay: Date = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                            try {
                                let params: any = {
                                    movementDate: { start: date2StringFormat(currentMonthFirstDay, 'YYYY-MM-DD'), end: date2StringFormat(currentMonthLastDay, 'YYYY-MM-DD') },
                                    parentId: receipt.parentId,
                                    parentType: receipt.parentType,
                                    statusValue: 'pending',
                                    typeValue: 'monthly',
                                };
                                let currentMonthReceipts: { results: Array<Receipt>, summary: any } = await receiptModel.getReceipts(params);
                                if(currentMonthReceipts.results.length === 1 && currentMonthReceipts.results[0].parentId === receipt.parentId) {
                                    currentMonthReceipt = currentMonthReceipts.results[0];
                                    // NOTE: Sólo si se encontró el recibo del mes se resta.
                                    // console.log(`Total del último recibo: ${currentMonthReceipt.total}`);
                                    realBalance = parseFloat((realBalance - currentMonthReceipt.total).toFixed(2));
                                }
                            } catch(error) {
                                // console.log('Ocurrió un error al obtener el último recibo: ', error.error.errors);
                                errors.push(error);
                                continue;
                            }

                            // CCCC  OOO  N   N DDDD  IIIII  CCCC IIIII  OOO  N   N EEEEE  SSSS
                            //C     O   O NN  N D   D   I   C       I   O   O NN  N E     S
                            //C     O   O N N N D   D   I   C       I   O   O N N N EEE    SSS
                            //C     O   O N  NN D   D   I   C       I   O   O N  NN E         S
                            // CCCC  OOO  N   N DDDD  IIIII  CCCC IIIII  OOO  N   N EEEEE SSSS

                            if(account.statusValue === 'active' && (account.isMaster || (!account.masterReference || (typeof account.masterReference === 'string' && account.masterReference === '')))) {
                                // El cliente no debe tener bandera "avoidSuspension".
                                if(!client.avoidSuspension) {
            
                                    //RRRR  EEEEE FFFFF EEEEE RRRR  EEEEE N   N  CCCC IIIII  AAA   SSSS
                                    //R   R E     F     E     R   R E     NN  N C       I   A   A S
                                    //RRRR  EEE   FFF   EEE   RRRR  EEE   N N N C       I   AAAAA  SSS
                                    //R   R E     F     E     R   R E     N  NN C       I   A   A     S
                                    //R   R EEEEE F     EEEEE R   R EEEEE N   N  CCCC IIIII A   A SSSS
            
                                    let paymentReferences: { bbva: string, bajio: string } = { bbva: '', bajio: '' };
                                    if(Array.isArray(account.paymentReferences) && account.paymentReferences.length > 0) {
                                        for(const reference of account.paymentReferences) {
                                            switch(reference.referenceName) {
                                                case 'BBVA Bancomer':
                                                    paymentReferences.bbva = reference.reference;
                                                    break;
                                                case 'Banco del Bajío':
                                                    paymentReferences.bajio = reference.reference;
                                                    break;
                                            }
                                        }
                                    } else {
                                        errors.push({
                                            status: 404,
                                            message: `No se encontraron referencias en la cuenta ${account.accountNumber}.`
                                        });
                                        // console.log(`No se encontraron referencias en la cuenta ${account.accountNumber}.`);
                                    }

                                    // SSSS M   M  SSSS
                                    //S     MM MM S
                                    // SSS  M M M  SSS
                                    //    S M   M     S
                                    //SSSS  M   M SSSS

                                    let phoneRegEx: RegExp = new RegExp(/[0-9]{10}/, 'gi');
                                    if(account.phone && phoneRegEx.test(account.phone)) {
                                        let sms: any = {
                                            number: `52${account.phone}`,
                                            message: `Estimado cliente Domain, su cuenta presenta un saldo vencido de $${currencyFormat.format(dueBalance)}, por el cual el servicio puede suspenderse en el transcurso del día.`
                                        };
                                        let smsModel: SMSModel = new SMSModel();
                                        try {
                                            await smsModel.postSMS(sms);
                                        } catch(error) {
                                            errors.push(error);
                                        }
                                    }
            
                                    //EEEEE M   M  AAA  IIIII L
                                    //E     MM MM A   A   I   L
                                    //EEE   M M M AAAAA   I   L
                                    //E     M   M A   A   I   L
                                    //EEEEE M   M A   A IIIII LLLLL
            
                                    let data: any = {
                                        accountNumber: account.accountNumber,
                                        // attachments,
                                        template: 'overdue_balance',
                                        content: [
                                            {
                                                name: 'month',
                                                content: number2Month(month + 1)
                                            },
                                            {
                                                name: 'last_day',
                                                content: lastMonthDay.getDate().toString()
                                            },
                                            {
                                                name: 'total',
                                                content: currencyFormat.format(dueBalance)
                                            },
                                            {
                                                name: 'bancomer_reference',
                                                content: paymentReferences.bbva
                                            },
                                            {
                                                name: 'reference',
                                                content: paymentReferences.bajio
                                            }
                                        ],
                                        subject: `Domain - Saldo pendiente ${account.accountNumber}.`
                                    };
                                    try {
                                        await this.sendEmail(data);
                                        emailSent++;
                                        // process.stdout.write(`Correos enviados: ${emailSent}\r`);
                                    } catch(error) {
                                        // console.log('Ocurrió un error al enviar el correo: ', error);
                                        errors.push(error);
                                    }
                                }
                            }
                        }
                    // }
                    index++;
                    // console.log(`Correos enviados: ${index}`);
                    // process.stdout.write(`Porcentaje de avance: ${(((index * 100) / getReceipts.results.length).toFixed(2))}%\r`);
                }
            }
            
            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
            
            console.log(`[sendPastDueBalance] Proceso terminado. Correos enviados: ${emailSent}`);
            // console.log('==================== ERRORES ====================');
            // console.log(errors);
            return resolve({
                status: errors.length > 0 ? 2016 : 200,
                message: `Proceso terminado con éxito. Correos enviados: ${emailSent}.`,
                errors
            });
        });
    }

    public sendClose2DueDate(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            //FFFFF EEEEE  CCCC H   H  AAA   SSSS
            //F     E     C     H   H A   A S
            //FFF   EEE   C     HHHHH AAAAA  SSS
            //F     E     C     H   H A   A     S
            //F     EEEEE  CCCC H   H A   A SSSS

            let { dueDate, ...rest }: { dueDate: string | Date } = body;
            // Si no se manda una fecha, se toma la fecha actual.
            dueDate = dueDate ? new Date(dueDate) : new Date();
            let day: number = dueDate.getDate();
            let month: number = dueDate.getMonth();
            let year: number = dueDate.getFullYear();
            // Primer día del mes.
            let firstMonthDay: Date = new Date(year, month, 1);
            // Último día del mes.
            let lastMonthDay: Date = new Date(year, month + 1, 0);
            
            //RRRR  EEEEE  CCCC IIIII BBBB   OOO   SSSS
            //R   R E     C       I   B   B O   O S
            //RRRR  EEE   C       I   BBBB  O   O  SSS
            //R   R E     C       I   B   B O   O     S
            //R   R EEEEE  CCCC IIIII BBBB   OOO  SSSS
            
            let receiptModel: ReceiptModel = new ReceiptModel();
            let paymentModel: PaymentModel = new PaymentModel();
            let getReceipts: { results: Array<Receipt>, summary: any } = { results: [], summary: {} };
            try {
                let params: any = {
                    movementDate: { start: date2StringFormat(firstMonthDay, 'YYYY-MM-DD'), end: date2StringFormat(lastMonthDay, 'YYYY-MM-DD') },
                    statusValue: 'pending',
                    // typeValue: 'monthly',
                    all: true,
                    // limit: 3,
                    // page: 1
                    // sort: { field: 'movementDate', type: 'DESC' }
                };
                // console.log(params);
                getReceipts = await receiptModel.getReceipts(params);
                // console.log(getReceipts.results.length);
            } catch(error) {
                return reject(error);
            }
            // console.log(`Recibos pendientes: ${getReceipts.results.length}`);
            // return resolve({
            //     status: 200,
            //     message: 'Ok.'
            // });
            let emailSent: number = 0;
            let errors: Array<any> = [];
            let accountModel: AccountModel = new AccountModel();
            if(Array.isArray(getReceipts.results) && getReceipts.results.length > 0) {
                // console.log('Si hay recibos pendientes.');
                let index: number = 0;
                for(const receipt of getReceipts.results) {
                        
                    //PPPP   AAA   GGGG  OOO   SSSS
                    //P   P A   A G     O   O S
                    //PPPP  AAAAA G  GG O   O  SSS
                    //P     A   A G   G O   O     S
                    //P     A   A  GGGG  OOO  SSSS

                    let getPayments: { total: number } = { total: 0 };
                    let paidAmount: number = 0;
                    try {
                        getPayments = await paymentModel.getPayments4ReceiptTotal({ _id: receipt._id });
                        paidAmount = parseFloat(getPayments.total.toString());
                    } catch(error) {}
                    
                    // CCCC  OOO  N   N DDDD  IIIII  CCCC IIIII  OOO  N   N EEEEE  SSSS
                    //C     O   O NN  N D   D   I   C       I   O   O NN  N E     S
                    //C     O   O N N N D   D   I   C       I   O   O N N N EEE    SSS
                    //C     O   O N  NN D   D   I   C       I   O   O N  NN E         S
                    // CCCC  OOO  N   N DDDD  IIIII  CCCC IIIII  OOO  N   N EEEEE SSSS

                    // NOTE: La cuenta debe deber al menos 10% de su mensualidad.
                    // receipt.total === 100%
                    let dueBalance: number = (receipt.total < 0 ? (receipt.total * -1) : receipt.total) - paidAmount;
                    dueBalance = dueBalance < 0 ? 0 : parseFloat(dueBalance.toFixed(2));
                    let dueBalancePercent: number = dueBalance > 0 ? (parseFloat(((dueBalance * 100) / receipt.total).toFixed(2))) : 0;

                    // La cuenta debe estar activa, ser maestra o individual.
                    // console.log('Total: ', receipt.total);
                    // console.log('Adeudo: ', dueBalance);
                    // console.log('Porcentaje: ', dueBalancePercent);
                    if(dueBalancePercent >= 10) {

                        // console.log('Si debe.');

                        // CCCC U   U EEEEE N   N TTTTT  AAA
                        //C     U   U E     NN  N   T   A   A
                        //C     U   U EEE   N N N   T   AAAAA
                        //C     U   U E     N  NN   T   A   A
                        // CCCC  UUU  EEEEE N   N   T   A   A

                        let account: Account = new Account();
                        let client: Client = new Client();
                        try {
                            account = await accountModel.getAccount({ accountNumber: receipt.parentId });
                            client = account.client || new Client();
                        } catch(error) {
                            errors.push({error});
                            continue;
                        }

                        // CCCC  OOO  N   N DDDD  IIIII  CCCC IIIII  OOO  N   N EEEEE  SSSS
                        //C     O   O NN  N D   D   I   C       I   O   O NN  N E     S
                        //C     O   O N N N D   D   I   C       I   O   O N N N EEE    SSS
                        //C     O   O N  NN D   D   I   C       I   O   O N  NN E         S
                        // CCCC  OOO  N   N DDDD  IIIII  CCCC IIIII  OOO  N   N EEEEE SSSS

                        // La cuenta debe estar activa, ser maestra o individual.
                        if(account.statusValue === 'active' && (account.isMaster || (!account.masterReference || (typeof account.masterReference === 'string' && account.masterReference === '')))) {
                            // console.log('Si se debe notificar.');
                            // El cliente no debe tener bandera "avoidSuspension".
                            if(!client.avoidSuspension) {
        
                                //RRRR  EEEEE FFFFF EEEEE RRRR  EEEEE N   N  CCCC IIIII  AAA   SSSS
                                //R   R E     F     E     R   R E     NN  N C       I   A   A S
                                //RRRR  EEE   FFF   EEE   RRRR  EEE   N N N C       I   AAAAA  SSS
                                //R   R E     F     E     R   R E     N  NN C       I   A   A     S
                                //R   R EEEEE F     EEEEE R   R EEEEE N   N  CCCC IIIII A   A SSSS
        
                                let paymentReferences: { bbva: string, bajio: string } = { bbva: '', bajio: '' };
                                if(Array.isArray(account.paymentReferences) && account.paymentReferences.length > 0) {
                                    for(const reference of account.paymentReferences) {
                                        switch(reference.referenceName) {
                                            case 'BBVA Bancomer':
                                                paymentReferences.bbva = reference.reference;
                                                break;
                                            case 'Banco del Bajío':
                                                paymentReferences.bajio = reference.reference;
                                                break;
                                        }
                                    }
                                } else {
                                    errors.push({
                                        status: 404,
                                        message: `No se encontraron referencias en la cuenta ${account.accountNumber}.`
                                    });
                                }
        
                                // SSSS M   M  SSSS
                                //S     MM MM S
                                // SSS  M M M  SSS
                                //    S M   M     S
                                //SSSS  M   M SSSS

                                let phoneRegEx: RegExp = new RegExp(/[0-9]{10}/, 'gi');
                                if(account.phone && phoneRegEx.test(account.phone)) {
                                    let sms: any = {
                                        number: `52${account.phone}`,
                                        message: `Domain le informa que su factura está próxima a vencer. No olvide realizar su pago para continuar disfrutando del servicio.`
                                    };
                                    let smsModel: SMSModel = new SMSModel();
                                    try {
                                        await smsModel.postSMS(sms);
                                    } catch(error) {
                                        errors.push(error);
                                    }
                                }
        
                                //EEEEE M   M  AAA  IIIII L
                                //E     MM MM A   A   I   L
                                //EEE   M M M AAAAA   I   L
                                //E     M   M A   A   I   L
                                //EEEEE M   M A   A IIIII LLLLL
        
                                let data: any = {
                                    accountNumber: account.accountNumber,
                                    // attachments,
                                    template: 'pending_balance',
                                    content: [
                                        {
                                            name: 'due_date',
                                            content: lastMonthDay.getDate().toString()
                                        },
                                        {
                                            name: 'amount',
                                            content: currencyFormat.format(receipt.total - paidAmount)
                                        },
                                        {
                                            name: 'bancomer_reference',
                                            content: paymentReferences.bbva
                                        },
                                        {
                                            name: 'reference',
                                            content: paymentReferences.bajio
                                        }
                                    ],
                                    subject: `Domain - Saldo pendiente ${account.accountNumber}.`
                                };
                                try {
                                    await this.sendEmail(data);
                                    emailSent++;
                                    process.stdout.write(`Correos enviados: ${emailSent}\r`);
                                } catch(error) {
                                    errors.push(error);
                                }
                            }
                        }
                    }
                    index++;
                }
            }
            
            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
            
            console.log(`Proceso terminado. Correos enviados: ${emailSent}`);
            return resolve({
                status: errors.length > 0 ? 2016 : 200,
                message: `Proceso terminado con éxito. Correos enviados: ${emailSent}.`,
                errors
            });
        });
    }

    // NOTE: Función acutalizada para utilizar la función de envío genérica.
    public sendPleaseReference(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            
            let { accountNumber, ...rest}: { accountNumber: string } & any = body;

            // CCCC U   U EEEEE N   N TTTTT  AAA
            //C     U   U E     NN  N   T   A   A
            //C     U   U EEE   N N N   T   AAAAA
            //C     U   U E     N  NN   T   A   A
            // CCCC  UUU  EEEEE N   N   T   A   A

            let accountModel = new AccountModel();
            let account: Account = new Account();
            let contacts: Array<Contact> = [];
            try {
                account = await accountModel.getAccount({ accountNumber });
                // @ts-ignore
                contacts = account.contacts.results;
            } catch(error) {
                return reject(error);
            }

            //RRRR  EEEEE FFFFF EEEEE RRRR  EEEEE N   N  CCCC IIIII  AAA   SSSS
            //R   R E     F     E     R   R E     NN  N C       I   A   A S
            //RRRR  EEE   FFF   EEE   RRRR  EEE   N N N C       I   AAAAA  SSS
            //R   R E     F     E     R   R E     N  NN C       I   A   A     S
            //R   R EEEEE F     EEEEE R   R EEEEE N   N  CCCC IIIII A   A SSSS

            let paymentReferences: { bbva: string, bajio: string } = { bbva: '', bajio: '' };
            if(Array.isArray(account.paymentReferences) && account.paymentReferences.length > 0) {
                for(const reference of account.paymentReferences) {
                    switch(reference.referenceName) {
                        case 'BBVA Bancomer':
                            paymentReferences.bbva = reference.reference;
                            break;
                        case 'Banco del Bajío':
                            paymentReferences.bajio = reference.reference;
                            break;
                    }
                }
            } else {
                return reject({
                    status: 404,
                    message: 'No se encontraron referencias en la cuenta.'
                });
            }

            //EEEEE M   M  AAA  IIIII L
            //E     MM MM A   A   I   L
            //EEE   M M M AAAAA   I   L
            //E     M   M A   A   I   L
            //EEEEE M   M A   A IIIII LLLLL

            let data: any = {
                accountNumber,
                // attachments,
                template: 'pagos_sin_referencia',
                content: [
                    {
                        name: 'bancomer_reference',
                        content: paymentReferences.bbva
                    },
                    {
                        name: 'reference',
                        content: paymentReferences.bajio
                    }
                ],
                subject: `Domain - Pago no Referenciado - Cuenta ${accountNumber}.`
            };
            try {
                await this.sendEmail(data);
                return resolve({
                    stauts: 200,
                    message: 'Mensaje enviado con éxito.'
                });
            } catch(error) {
                return reject(error);
            }
        });
    }

    // TODO: Utilizar sólo esta petición, mover las anteriores a esta...
    public sendEmail(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let { accountNumber, attachments, template, content, subject, ...rest }: { accountNumber: string, attachments: Array<FileStructure>, template: string, content: Array<{ name: string, content: string }>, subject: string } & any = body;
            
            // CCCC U   U EEEEE N   N TTTTT  AAA
            //C     U   U E     NN  N   T   A   A
            //C     U   U EEE   N N N   T   AAAAA
            //C     U   U E     N  NN   T   A   A
            // CCCC  UUU  EEEEE N   N   T   A   A

            let accountModel = new AccountModel();
            let account: Account = new Account();
            let contacts: Array<Contact> = [];
            try {
                account = await accountModel.getAccount({ accountNumber });
                // @ts-ignore
                contacts = account.contacts.results;
            } catch(error) {
                return reject(error);
            }

            //DDDD  EEEEE  SSSS TTTTT IIIII N   N  AAA  TTTTT  AAA  RRRR  IIIII  OOO   SSSS
            //D   D E     S       T     I   NN  N A   A   T   A   A R   R   I   O   O S
            //D   D EEE    SSS    T     I   N N N AAAAA   T   AAAAA RRRR    I   O   O  SSS
            //D   D E         S   T     I   N  NN A   A   T   A   A R   R   I   O   O     S
            //DDDD  EEEEE SSSS    T   IIIII N   N A   A   T   A   A R   R IIIII  OOO  SSSS
            
            let emailModel: EmailModel = new EmailModel();
            let emailTo: Array<To> = [];
            if(Array.isArray(contacts) && contacts.length > 0) {
                for(const contact of contacts) {
                    if(Array.isArray(contact.contactMeans) && contact.contactMeans.length > 0) {
                        for(const contactMean of contact.contactMeans) {
                            if(contactMean.contactMeanName === 'email' && contactMean.notify) {
                                let environment: string = (process.env.NODE_ENV || 'development').trim().toLowerCase();
                                emailTo.push({
                                    email: environment === 'production' ? contactMean.value : 'frodriguez@domain.com',
                                    // @ts-ignore
                                    name: contactMean.contactMean.name,
                                    type: 'to'
                                });
                            }
                        }
                    }
                }
            } else {
                return reject({
                    status: 404,
                    module: 'Procesos | Cuentas',
                    message: 'No se encontraron contactos en la cuenta.'
                });
            }

            //EEEEE M   M  AAA  IIIII L
            //E     MM MM A   A   I   L
            //EEE   M M M AAAAA   I   L
            //E     M   M A   A   I   L
            //EEEEE M   M A   A IIIII LLLLL

            if(emailTo.length > 0) {
                
                //M   M EEEEE N   N  SSSS  AAA  JJJJJ EEEEE
                //MM MM E     NN  N S     A   A   J   E
                //M M M EEE   N N N  SSS  AAAAA   J   EEE
                //M   M E     N  NN     S A   A J J   E
                //M   M EEEEE N   N SSSS  A   A  J    EEEEE

                let message: Message = {
                    html: `<h1>Example HTML content.</h1>`,
                    subject,
                    to: emailTo
                };
                if(Array.isArray(attachments) && attachments.length > 0) message.attachments = attachments;
                let email: EmailWithTemplate = {
                    async: true,
                    message,
                    template_name: template,
                    template_content: content
                };
                try {
                    await emailModel.postEmail(email);
                    return resolve({
                        stauts: 200,
                        message: 'Mensaje enviado con éxito.'
                    });
                } catch(error) {
                    return reject(error);
                }
            } else {
                return reject({
                    status: 404,
                    module: 'Procesos | Cuentas',
                    message: 'No se encontraron contactos activos.'
                });
            }
        });
    }

    public sendBalance(body: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            //BBBB   AAA  L      AAA  N   N  CCCC EEEEE
            //B   B A   A L     A   A NN  N C     E
            //BBBB  AAAAA L     AAAAA N N N C     EEE
            //B   B A   A L     A   A N  NN C     E
            //BBBB  A   A LLLLL A   A N   N  CCCC EEEEE

            let { accountNumber, send, ...rest }: { accountNumber: string, send: boolean } & any = body;
            send = (typeof send === 'boolean') ? send : true;
            if(!accountNumber || (typeof accountNumber === 'string' && accountNumber.length === 0)) {
                return reject({
                    status: 400,
                    message: 'No se envío un número de cuenta.'
                });
            }

            let balance: { account: Account, client: Client, balance: Array<IUglyBalance>, total: number} = {
                account: new Account(),
                client: new Client(),
                balance: [],
                total: 0
            };
            let balanceModel: BalanceModel = new BalanceModel();
            try {
                balance = await balanceModel.getAccountFullBalanceUGLY({ accountNumber });
            } catch(error) {
                return reject(error);
            }

            //EEEEE JJJJJ  SSSS
            //E       J   S
            //EEE     J    SSS
            //E     J J       S
            //EEEEE  J    SSSS

            let movements: Array<any> = [];
            for(const movement of balance.balance) {
                if(movement.status !== 'error') {
                    let status: string = '';
                    switch(movement.status) {
                        case 'advanced': status = 'ADELANTO'; break;
                        case 'assigned': status = 'ASIGNADO'; break;
                        case 'cancelled': status = 'CANCELADO'; break;
                        case 'credit': status = 'NOTA DE CRÉDITO'; break;
                        case 'error': status = 'ERROR'; break;
                        case 'paid': status = 'PAGADO'; break;
                        case 'pending': status = 'PENDIENTE'; break;
                        case 'unassigned': status = 'S/A'; break;
                    }
                    movements.push({
                        date: date2StringFormat(movement.date, 'DD/MM/YYYY'),
                        description: movement.description,
                        folio: movement.folio,
                        status,
                        charge: movement.charge > 0 ? `$${currencyFormat.format(movement.charge)}` : '---',
                        payment: movement.payment > 0 ? `$${currencyFormat.format(movement.payment)}` : '---',
                        balance: `$${currencyFormat.format(movement.balance)}`
                    });
                }
            }
            let ejs = {
                account: balance.account,
                client: balance.client,
                balance: {
                    movements,
                    total: `$${currencyFormat.format(balance.total)}`
                },
                currentDate: date2StringFormat(new Date(), 'DD/MM/YYYY')
            };
            let pdfToBase64: { data: string } = { data: '' }; 
            try {
                pdfToBase64 = await pdf2Base64('../templates/account.balance.ejs', ejs);
                // console.log(pdfToBase64);
            } catch(error) {
                return reject(error);
            }

            //EEEEE M   M  AAA  IIIII L
            //E     MM MM A   A   I   L
            //EEE   M M M AAAAA   I   L
            //E     M   M A   A   I   L
            //EEEEE M   M A   A IIIII LLLLL

            if(send) {
                let attachments: Array<FileStructure> = [];
                attachments.push({
                    type: 'application/pdf',
                    name: 'Estado de Cuenta.pdf',
                    content: pdfToBase64.data
                });            
                let data: any = {
                    accountNumber,
                    attachments,
                    template: 'client_notification_new',
                    content: [
                        {
                            name: 'message',
                            content: `Por medio del presente le hacemos llegar su estado de cuenta.`
                        }
                    ],
                    subject: `Domain - Estado de Cuenta ${accountNumber}.`
                };
                try {
                    await this.sendEmail(data);
                    return resolve({
                        stauts: 200,
                        message: 'Mensaje enviado con éxito.'
                    });
                } catch(error) {
                    return reject(error);
                }
            } else {
                return resolve({
                    pdf: pdfToBase64.data
                });
            }
        });
    }

    // SSSS EEEEE RRRR  V   V IIIII  CCCC IIIII  OOO   SSSS
    //S     E     R   R V   V   I   C       I   O   O S
    // SSS  EEE   RRRR  V   V   I   C       I   O   O  SSS
    //    S E     R   R  V V    I   C       I   O   O     S
    //SSSS  EEEEE R   R   V   IIIII  CCCC IIIII  OOO  SSSS

    // Estatus de los servicios de Altán.
    // Active
    // Barring (B1W)
    public suspendMobilityService(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            //FFFFF EEEEE  CCCC H   H  AAA   SSSS
            //F     E     C     H   H A   A S
            //FFF   EEE   C     HHHHH AAAAA  SSS
            //F     E     C     H   H A   A     S
            //F     EEEEE  CCCC H   H A   A SSSS

            let { dueDate, ...rest }: { dueDate: string | Date } = body;
            // Si no se manda una fecha, se toma la fecha actual.
            let today: Date = new Date();
            let previousMonth: Date = new Date(today.getFullYear(), today.getMonth() - 1);
            dueDate = dueDate ? new Date(dueDate) : previousMonth;
            // console.log(dueDate);
            let day: number = dueDate.getDate();
            let month: number = dueDate.getMonth();
            let year: number = dueDate.getFullYear();
            // Primer día del mes.
            let firstMonthDay: Date = new Date(year, month, 1);
            // Último día del mes.
            let lastMonthDay: Date = new Date(year, month + 1, 0);
            // console.log(date2StringFormat(firstMonthDay, 'YYYY-MM-DD'));
            // console.log(date2StringFormat(lastMonthDay, 'YYYY-MM-DD'));
            
            //RRRR  EEEEE  CCCC IIIII BBBB   OOO   SSSS
            //R   R E     C       I   B   B O   O S
            //RRRR  EEE   C       I   BBBB  O   O  SSS
            //R   R E     C       I   B   B O   O     S
            //R   R EEEEE  CCCC IIIII BBBB   OOO  SSSS
            
            let receiptModel: ReceiptModel = new ReceiptModel();
            let getReceipts: { results: Array<Receipt>, summary: any } = { results: [], summary: {} };
            try {
                let params: any = {
                    movementDate: { start: date2StringFormat(firstMonthDay, 'YYYY-MM-DD'), end: date2StringFormat(lastMonthDay, 'YYYY-MM-DD') },
                    statusValue: 'pending',
                    // typeValue: 'monthly',
                    all: true,
                    // limit: 3,
                    // page: 1
                };
                getReceipts = await receiptModel.getReceipts(params);
            } catch(error) {
                return reject(error);
            }
            // console.log('Recibos pendientes: ', getReceipts.results.length);
            
            // AAA  DDDD  EEEEE U   U DDDD   OOO   SSSS
            //A   A D   D E     U   U D   D O   O S
            //AAAAA D   D EEE   U   U D   D O   O  SSS
            //A   A D   D E     U   U D   D O   O     S
            //A   A DDDD  EEEEE  UUU  DDDD   OOO  SSSS

            let msisdns2Suspend: Array<string> = [];
            let accounts2Suspend: Array<string> = [];
            let errors: Array<any> = [];
            // let balanceModel: BalanceModel = new BalanceModel();
            let accountModel: AccountModel = new AccountModel();
            let paymentModel: PaymentModel = new PaymentModel();
            let index: number = 0;
            if(Array.isArray(getReceipts.results) && getReceipts.results.length > 0) {
                for(const receipt of getReceipts.results) {

                    if((receipt.parentId.indexOf('MV104') < 0) && (receipt.parentId.indexOf('SC103') < 0) && (receipt.parentId.indexOf('M-000-') < 0)) {
                        continue;
                    }
                    // if(receipt.total > 0) {

                        //BBBB   AAA  L      AAA  N   N  CCCC EEEEE
                        //B   B A   A L     A   A NN  N C     E
                        //BBBB  AAAAA L     AAAAA N N N C     EEE
                        //B   B A   A L     A   A N  NN C     E
                        //BBBB  A   A LLLLL A   A N   N  CCCC EEEEE

                        /*
                        let balance: {
                            account: Account,
                            client: Client,
                            balance: Array<IUglyBalance>,
                            total: number
                        };
                        let account: Account = new Account();
                        let client: Client = new Client();
                        try {
                            balance = await balanceModel.getAccountFullBalanceUGLY({ accountNumber: receipt.parentId });
                            account = balance.account;
                            client = balance.client;
                        } catch(error) {
                            errors.push({error});
                            continue;
                        }
                        */

                        //PPPP   AAA   GGGG  OOO   SSSS
                        //P   P A   A G     O   O S
                        //PPPP  AAAAA G  GG O   O  SSS
                        //P     A   A G   G O   O     S
                        //P     A   A  GGGG  OOO  SSSS
                        
                        // Pagos relacionados al recibo.
                        let paidAmount: number = 0;
                        let getPayments: { results: Array<Payment>, summary: any } = { results: [], summary: {} };
                        try {
                            getPayments = await paymentModel.getPayments({ 'details.receiptId': receipt._id });
                        } catch(error) {
                            errors.push(error);
                            continue;
                        }
                        // Si se encontraron pagos, se suman los montos que pertenecen al recibo.
                        if(getPayments.results.length > 0) {
                            for(const payment of getPayments.results) {
                                if((Array.isArray(payment.details) && payment.details.length > 0)) {
                                    for(const detail of payment.details) {
                                        if(detail.receiptId === receipt._id) {
                                            paidAmount += detail.amount;
                                        }
                                    }
                                }
                            }
                        }
                        // Se de formato al total pagado.
                        paidAmount = parseFloat(paidAmount.toFixed(2));

                        // CCCC  OOO  N   N DDDD  IIIII  CCCC IIIII  OOO  N   N EEEEE  SSSS
                        //C     O   O NN  N D   D   I   C       I   O   O NN  N E     S
                        //C     O   O N N N D   D   I   C       I   O   O N N N EEE    SSS
                        //C     O   O N  NN D   D   I   C       I   O   O N  NN E         S
                        // CCCC  OOO  N   N DDDD  IIIII  CCCC IIIII  OOO  N   N EEEEE SSSS

                        // NOTE: La cuenta debe deber al menos 10% de su mensualidad.
                        // receipt.total === 100%
                        let dueBalance: number = parseFloat((receipt.total - paidAmount).toFixed(2));
                        dueBalance = dueBalance < 0 ? 0 : dueBalance;
                        let dueBalancePercent: number = 0;
                        // if(receipt.total > 0 && dueBalance > 0) {
                            dueBalancePercent = dueBalance > 0 ? parseFloat(((dueBalance * 100) / receipt.total).toFixed(2)) : 0;
                        // }

                        // La cuenta debe estar activa, ser maestra o individual.
                        if(dueBalancePercent >= 10) {

                            // NOTE: Aquí se revisa si la cuenta es maestra, ya que esa no cuenta con número ni con servicios asociados.
                            //       En este caso se deben obtener cada una de las cuentas y hacer lo mismo.

                            let services2Suspend: { msisdns2Suspend: Array<string>, accounts2Suspend:Array<string>} = { msisdns2Suspend: [], accounts2Suspend: [] };
                            // Cuentas de Movilidad y Sin Cables.
                            if((receipt.parentId.indexOf('MV104') >= 0) && (receipt.parentId.indexOf('SC103') >= 0)) {
                                try {
                                    services2Suspend = await this.getMSISDN2Suspend( receipt.parentId );
                                    // MSISDNs a suspender.
                                    if(services2Suspend.msisdns2Suspend.length > 0) {
                                        for(const msisdnFromAccount of services2Suspend.msisdns2Suspend) {
                                            msisdns2Suspend.push(msisdnFromAccount);
                                        }
                                    }
                                    // Cuentas a notificar.
                                    if(services2Suspend.accounts2Suspend.length > 0) {
                                        for(const account2Suspend of services2Suspend.accounts2Suspend) {
                                            accounts2Suspend.push(account2Suspend);
                                        }
                                    
                                        //EEEEE V   V EEEEE N   N TTTTT  OOO
                                        //E     V   V E     NN  N   T   O   O
                                        //EEE   V   V EEE   N N N   T   O   O
                                        //E      V V  E     N  NN   T   O   O
                                        //EEEEE   V   EEEEE N   N   T    OOO
                                        
                                        let eventModel: EventModel = new EventModel();
                                        let event: Event = {
                                            parentId: receipt.parentId,
                                            parentType: 'account',
                                            user: 'Olimpo',
                                            description: 'Cierre de servicio automático por adeudo.',
                                            comment: `Cierre de servicio automático por adeudo.`,
                                            typeValue: 'information'
                                        };
                                        try {
                                            await eventModel.postEvent(event);
                                        } catch(error) {
                                            errors.push(error);
                                        }
                                    }
                                } catch(error){}
                            } else if(receipt.parentId.indexOf('M-000-') >= 0) {
                                // Cuentas maestras.
                                try {
                                    let results: { results: Array<Account>, summary: any } = await accountModel.getAccounts({ masterReference: receipt.parentId, all: true });
                                    for(const account of results.results) {
                                        services2Suspend = await this.getMSISDN2Suspend( account.accountNumber );
                                        // MSISDNs a suspender.
                                        if(services2Suspend.msisdns2Suspend.length > 0) {
                                            for(const msisdnFromAccount of services2Suspend.msisdns2Suspend) {
                                                msisdns2Suspend.push(msisdnFromAccount);
                                            }
                                        }
                                        // Cuentas a notificar.
                                        if(services2Suspend.accounts2Suspend.length > 0) {
                                            for(const account2Suspend of services2Suspend.accounts2Suspend) {
                                                accounts2Suspend.push(account2Suspend);
                                            }
                                    
                                            //EEEEE V   V EEEEE N   N TTTTT  OOO
                                            //E     V   V E     NN  N   T   O   O
                                            //EEE   V   V EEE   N N N   T   O   O
                                            //E      V V  E     N  NN   T   O   O
                                            //EEEEE   V   EEEEE N   N   T    OOO
                                            
                                            let eventModel: EventModel = new EventModel();
                                            let event: Event = {
                                                parentId: receipt.parentId,
                                                parentType: 'account',
                                                user: 'Olimpo',
                                                description: 'Cierre de servicio automático por adeudo.',
                                                comment: `Cierre de servicio automático por adeudo.`,
                                                typeValue: 'information'
                                            };
                                            try {
                                                await eventModel.postEvent(event);
                                            } catch(error) {
                                                errors.push(error);
                                            }
                                        }
                                    }
                                } catch (error) {}
                            }
                        } else if(dueBalancePercent > 0 && dueBalancePercent < 10) {
                            // console.log(`Total del recibo: ${receipt.total}`);
                            // console.log(`Total pagado: ${paidAmount}`);
                            // console.log(`Adeudo: ${dueBalance}`);
                            // console.log(`Adeudo (%): ${dueBalancePercent}`);
                            // console.log('======================================');
                            index++;
                        }
                    // }
                    // index++;
                    // process.stdout.write(`Porcentaje de avance: ${(((index * 100) / getReceipts.results.length).toFixed(2))}%\r`);
                }
            }

            // SSSS U   U  SSSS PPPP  EEEEE N   N  CCCC IIIII  OOO  N   N
            //S     U   U S     P   P E     NN  N C       I   O   O NN  N
            // SSS  U   U  SSS  PPPP  EEE   N N N C       I   O   O N N N
            //    S U   U     S P     E     N  NN C       I   O   O N  NN
            //SSSS   UUU  SSSS  P     EEEEE N   N  CCCC IIIII  OOO  N   N

            console.log(JSON.stringify(msisdns2Suspend));
            let altanAPIModel: AltanAPIsModel = new AltanAPIsModel();
            try {
                // await altanAPIModel.postBatchBarring({ msisdns: msisdns2Suspend });
                // NOTE: Ahora se pida que se suspenda la línea por completo.
                let altanResponse: any = await altanAPIModel.postBatchSuspend({ msisdns: msisdns2Suspend });
                // console.log(altanResponse);
            } catch(error) {
                return reject(error);
            }
            
            //EEEEE M   M  AAA  IIIII L
            //E     MM MM A   A   I   L
            //EEE   M M M AAAAA   I   L
            //E     M   M A   A   I   L
            //EEEEE M   M A   A IIIII LLLLL
            
            if(accounts2Suspend.length > 0) {
                for(const accountNumber of accounts2Suspend) {
                    let data: any = {
                        accountNumber,
                        // attachments,
                        template: 'client_notification',
                        content: [
                            {
                                name: 'message',
                                content: `Le informamos que su línea ha sido suspendida por saldo vencido, le invitamos a realizar su pago para seguir disfrutando de su servicio. Si usted ya ha realizado su pago, haga caso omiso a este mensaje.`
                            }
                        ],
                        subject: 'Domain Notificación de Suspensión.'
                    };
                    try {
                        await this.sendEmail(data);
                    } catch(error) {
                        continue;
                    }
                }
            }
            
            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
            
            let unique = [...new Set(msisdns2Suspend)];
            // console.log(unique);
            console.log(`Proceso terminado con éxito. Servicios suspendidos: ${unique.length}.`);
            return resolve({
                status: errors.length > 0 ? 206 : 200,
                message: `Proceso terminado con éxito. Servicios suspendidos: ${msisdns2Suspend.length}.`,
                errors
            });
        });
    }

    private async getMSISDN2Suspend(accountNumber: string): Promise<{ msisdns2Suspend: Array<string>, accounts2Suspend:Array<string>}> {
        let result: { msisdns2Suspend: Array<string>, accounts2Suspend:Array<string>} = { msisdns2Suspend: [], accounts2Suspend: [] };
        
        // CCCC U   U EEEEE N   N TTTTT  AAA
        //C     U   U E     NN  N   T   A   A
        //C     U   U EEE   N N N   T   AAAAA
        //C     U   U E     N  NN   T   A   A
        // CCCC  UUU  EEEEE N   N   T   A   A

        let accountModel: AccountModel = new AccountModel();
        let account: Account = new Account();
        let client: Client = new Client();
        try {
            account = await accountModel.getAccount({ accountNumber });
            client = account.client as Client;
        } catch(error) {
            return result;
        }
        // Condiciones.
        if(account.statusValue === 'active' && (account.isMaster || (!account.masterReference || (typeof account.masterReference === 'string' && account.masterReference === '')))) {
            // El cliente no debe tener bandera "avoidSuspension".
            if(!client.avoidSuspension) {
                // Se agrega el DN si existe.
                if(account.phone) {
                    // Se agrega el MSISDN al arreglo de suspenciones.
                    // NOTE: Aquí faltan los servicios adicionales.
                    result.msisdns2Suspend.push(account.phone);
                    result.accounts2Suspend.push(account.accountNumber);
                    
                    //PPPP  RRRR   OOO  DDDD  U   U  CCCC TTTTT  OOO   SSSS       AAA   SSSS  OOO   CCCC IIIII  AAA  DDDD   OOO   SSSS
                    //P   P R   R O   O D   D U   U C       T   O   O S          A   A S     O   O C       I   A   A D   D O   O S
                    //PPPP  RRRR  O   O D   D U   U C       T   O   O  SSS       AAAAA  SSS  O   O C       I   AAAAA D   D O   O  SSS
                    //P     R   R O   O D   D U   U C       T   O   O     S      A   A     S O   O C       I   A   A D   D O   O     S
                    //P     R   R  OOO  DDDD   UUU   CCCC   T    OOO  SSSS       A   A SSSS   OOO   CCCC IIIII A   A DDDD   OOO  SSSS

                    // Se buscan todos los productos Altán asociados a la cuenta principal.
                    let altanProductModel: AltanProductModel = new AltanProductModel();
                    let altanProducts: { results: Array<AltanProduct>, summary: any } = { results: [], summary: {} };
                    let altanError: string = '';
                    try {
                        altanProducts = await altanProductModel.getAltanProducts({ accountNumber: account.accountNumber });
                    } catch(error) {
                        // No se pudo obtener la información de los servicios asociados.
                        altanError = 'No se pudieron obtener los servicios adicionales de la cuenta.'
                    }
                    // Si hay servicios asociados, se deben activar igual.
                    if(altanProducts.results.length > 0) {
                        for(const altanProduct of altanProducts.results) {
                            result.msisdns2Suspend.push(altanProduct.msisdn);
                        }
                    }
                }
            }
        }
        return result;
    }
}