// Módulos.
import { Request, Response } from 'express';
import { IsString, validate, MaxLength, IsMongoId, IsDefined, IsDateString } from 'class-validator';
import axios, { AxiosResponse } from 'axios';
import idx from 'idx';
import Openpay from 'openpay';
// Configuración.
import configuration from '../configuration';
// Modelos.
import AccountModel, { Account } from './accounts';
import { Address } from './addresses';
import { Contact } from './contacts';
import { EmailModel, EmailWithTemplate, FileStructure, Message, To } from './notifications';
import InternalAccountModel, { InternalAccount } from './catalogs/internalAccounts';
import PaymentModel, { Payment } from './payments';
// Funciones.
import { date2StringFormat } from '../scripts/dates';
import { RemodelErrors } from '../scripts/data-management';
import { pdf2Base64 } from '../classes/pdf';
// TODO: Pedir credenciales.
var openpay = new Openpay(configuration.services.openpay.id, configuration.services.openpay.privateKey);
// NOTE: Para su uso en producción.
let environment: string = process.env.NODE_ENV || 'development';
if(environment === 'production') {
    openpay.setProductionReady(true);
}

// OOO  PPPP  EEEEE N   N PPPP   AAA  Y   Y
//O   O P   P E     NN  N P   P A   A  Y Y
//O   O PPPP  EEE   N N N PPPP  AAAAA   Y
//O   O P     E     N  NN P     A   A   Y
// OOO  P     EEEEE N   N P     A   A  YYY

interface IStoreCharge {
    method: string;         // Debe contener el valor store para indicar que el pago se hará en tienda.
    amount: number;         // Cantidad del cargo. Debe ser una cantidad mayor a cero, con hasta dos dígitos decimales.
    description: string;    // (Longitud = 250) Una descripción asociada al cargo.
    order_id?: string;      // (Longitud = 100) Identificador único del cargo. Debe ser único entre todas las transacciones.
    due_date?: string;      // Fecha de vigencia para hacer el pago en la tienda en formato ISO 8601. 
    /*
    Ejemplo (UTC): 2014-08-01T00:50:00Z 

    NOTE: Del lado del servidor se cambiara a hora central:
    Ejemplo (Central Time): 2014-08-01T11:51:23-05:00
    */
    customer: ICustomer;
}

interface ICustomer {
    external_id?: string;       // (longitud = 100) Identificador externo único para el cliente asignado por el comercio.
    name: string;               // (longitud = 100) Nombre(s) del cliente.
    last_name?: string;         // (longitud = 100) Apellidos del cliente.
    email: string;              // (longitud = 100) Cuenta de correo electrónico del Cliente.
    requires_account?: boolean; // (default = true) Enviar con valor false si requiere que el cliente se cree sin cuenta para manejo del saldo.
    phone_number?: string;      // (longitud = 100) Número telefónico del Cliente.
    address?: IAddress;         // Dirección del Cliente. Usada comúnmente como dirección de envío.
}

interface IAddress {
    line1: string;          // (requerido) Primera línea de dirección del tarjeta habiente. Usada comúnmente para indicar la calle y número exterior e interior.
    line2?: string;         // Segunda línea de la dirección del tarjeta habiente. Usada comúnmente para indicar condominio, suite o delegación.
    line3?: string;         // Tercer línea de la dirección del tarjeta habiente. Usada comúnmente para indicar la colonia.
    postal_code: string;    // (requerido) Código postal del tarjeta habiente
    state: string;          // (requerido) Estado del tarjeta habiente
    city: string;           // (requerido) Ciudad del tarjeta habiente
    country_code: string;   // (requerido) Código del país del tarjeta habiente a dos caracteres en formato ISO_3166-1.
}

interface ICardPoints {
    used: number;
    remaining: number;
    amount: number;
    caption?: string;
}

interface IPaymentMethod {
    type: string;
    reference: string;
    paybin_reference: string;
    barcode_url: string;
    barcode_paybin_url: string;
}

interface ITransaction {
    id: string;                 // Identificador único asignado por Openpay al momento de su creación.
    description: string;        // Descripción de la transacción.
    error_message: string;      // Si la transacción está en status: failed, en este campo se mostrará la razón del fallo.
    authorization: string;      // Número de autorización generado por el procesador.
    amount: number;             // Cantidad de la transacción a dos decimales.
    operation_type: string;     // Tipo de afectación en la cuenta: in, out.
    order_id: string;           // Referencia única o número de orden/transacción.
    transaction_type: string;   // Tipo de transacción que fue creada: fee, charge, payout, transfer.
    creation_date: string;      // Fecha de creación de la transacción en formato ISO 8601.
    currency: string;           // Moneda usada en la operación, por default es MXN.
    status: string;             // Estatus actual de la transacción. Posibles valores: completed, in_progress, failed.
    method: string;             // Tipo de método usado en la transacción: card, bank o customer.
    payment_method: IPaymentMethod;
    customer_id: string;        // Identificar único del cliente al cual pertence la transacción. Si es valor es nulo, la transacción pertenece a la cuenta del comercio.
    bank_account: any;          // Datos de la cuenta bancaria usada en la transacción. Ver objeto BankAccoount
    card: any;                  // Datos de la tarjeta usada en la transacción. Ver objeto Card
    card_points: ICardPoints;   // Datos de los puntos de la tarjeta usados para el pago, si fueron utilizados.
    due_date: string;           // Fecha límite de pago.
}

interface IError {
    category: string;
    /*
    request: Indica un error causado por datos enviados por el cliente. 
             Por ejemplo, una petición inválida, un intento de una transacción sin fondos, o una transferencia a una cuenta que no existe. 

    internal: Indica un error del lado de Openpay, y ocurrira muy raramente. 

    gateway: Indica un error durante la transacción de los fondos de una tarjeta a la cuenta de Openpay o de la cuenta hacia un banco o tarjeta.
    */
    error_code: number;         // El código del error de Openpay indicando el problema que ocurrió.
    description: string;        // Descripción del error.
    http_code: number;          // Código de error HTTP de la respuesta.
    request_id: string;         // Identificador de la petición.
    fraud_rules: Array<string>; // Arreglo con la lista de coincidencia de reglas definidas para deteccion de fraudes.
}

/*
┌─────────────────────┬─────────────────────────────────────────────────────────────────┐
│ Valor               │ Descripción                                                     │
├─────────────────────┼─────────────────────────────────────────────────────────────────┤
│ verification        │ La notificación contiene el código de verificación del Webhook. │
│ charge.created      │ Se creó un cargo para ser pagado por transferencia bancaria.    │
│ charge.succeeded    │ Indica que el cargo se ha completado (tarjeta, banco o tienda). │
│ charge.refunded     │ Un cargo a tarjeta fue reembolzado.                             │
│ payout.created      │ Se ha programado un pago.                                       │
│ payout.succeeded    │ Se ha enviado el pago.                                          │
│ payout.failed       │ El pago fue rechazado.                                          │
│ transfer.succeeded  │ Se ha realizado una transferencia entre dos clientes.           │
│ fee.succeeded       │ Se ha cobrado una comisión a un cliente.                        │
│ spei.received       │ Se han agregado fondos a una cuenta mediante SPEI.              │
│ chargeback.created  │ Se ha recibido un contracargo de un cargo a tarjeta.            │
│ chargeback.rejected │ El contrcargo se ha ganado a favor del comercio.                │
│ chargeback.accepted │ El contracargo se ha perdido. Se ha creado una transacción tipo │
│                     │ contracargo que descontará los fondos de tu cuenta.             │
└─────────────────────┴─────────────────────────────────────────────────────────────────┘
*/
interface IWebhook {
    type: string;               // El tipo de evento que generó la notificación
    event_date: string;         // Fecha de creación del evento en formato ISO 8601
    transaction: ITransaction;  // El objeto de Transacción relacionado con el evento. No enviado en notificaciones de tipo verification.
    verification_code: string;  // El código de verificación del Webhook. Enviado solamente en notificaciones de tipo verification.
}

export default class OpenPayModel {

    //PPPP   OOO   SSSS TTTTT
    //P   P O   O S       T
    //PPPP  O   O  SSS    T
    //P     O   O     S   T
    //P      OOO  SSSS    T

    // NOTA SUPER ULTRA MEGA IMPORTANTE SUPER SAYAJIN HOKAGE 3.5 DIGIEVOLUCIONADA MAMALONA:
    // El monto máximo que se permite para este tipo de cargos es de $9,999.99 MXN
    public async postNDownloadStoreCharge(request: Request, response: Response): Promise<any> {
        // return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { accountNumber, ...charge }: { accountNumber: string } & IStoreCharge = request.body;
            // returnBase64 = typeof returnBase64 === 'boolean' ? returnBase64 : false;
            if(!accountNumber) {
                return response.status(400).end(JSON.stringify({
                    status: 400,
                    module: 'OpenPay',
                    message: 'No se incluyó un número de cuenta.'
                }));
            }
            if(charge.amount >= 10000) {
                return response.status(400).end(JSON.stringify({
                    status: 400,
                    module: 'OpenPay',
                    message: 'El monto enviado excede el máximo permitido.'
                }));
            }

            // CCCC U   U EEEEE N   N TTTTT  AAA
            //C     U   U E     NN  N   T   A   A
            //C     U   U EEE   N N N   T   AAAAA
            //C     U   U E     N  NN   T   A   A
            // CCCC  UUU  EEEEE N   N   T   A   A

            let account: Account = new Account();
            let address: Address = new Address();
            let contacts: Array<Contact> = [];
            let accountModel: AccountModel = new AccountModel();
            try {
                account = await accountModel.getAccount({ accountNumber });
                address = account.address || new Address();
                // @ts-ignore
                contacts = account.contacts.results;
            } catch(error) {
                return response.status(400).end(JSON.stringify(error));
            }

            // CCCC  AAA  RRRR   GGGG  OOO
            //C     A   A R   R G     O   O
            //C     AAAAA RRRR  G  GG O   O
            //C     A   A R   R G   G O   O
            // CCCC A   A R   R  GGGG  OOO

            // Nombre y apellidos.
            let firstName: string = (idx(account.client, _ => _.firstName) || '').toString();
            let secondName: string = (idx(account.client, _ => _.secondName) || '').toString();
            let familyName: string = (idx(account.client, _ => _.firstLastName) || '').toString();
            let surName: string = (idx(account.client, _ => _.secondLastName) || '').toString();
            let name: string = `${firstName} ${secondName}`.replace(/\s{2}/, '').trim();
            let lastName: string = `${familyName} ${surName}`.replace(/\s{2}/, '').trim();
            // Email.
            let email: string = 'admin@domain.com';
            for(const contact of contacts) {
                for(const contactMean of contact.contactMeans) {
                    if(contactMean.contactMeanName === 'email' && contactMean.notify) {
                        email = contactMean.value;
                        break;
                    }
                }
            }
            // Información del cliente.
            let customer: ICustomer = {
                // external_id: '',
                name,
                last_name: lastName,
                email,
                // requires_account: '',
                // phone_number: '',
                // address: '',
            };
            let orderId: string = `${accountNumber}.${date2StringFormat(new Date(), 'DDMMYYYYhhmmss')}`;
            let dueDate: string = date2StringFormat(charge.due_date ? new Date(charge.due_date) : new Date(), 'YYYY-MM-DDThh:mm:ss');
            let storeChargeRequest: IStoreCharge = {
                method: 'store',
                amount: parseFloat((charge.amount).toFixed(2)),
                description: 'Servicio de Telecomunicaciones.',
                order_id: orderId,
                due_date: dueDate,
                customer
            };
            openpay.charges.create(storeChargeRequest, async (error: IError, charge: ITransaction) => {
                if(error) {
                    return response.status(400).end(JSON.stringify({
                        status: 400,
                        module: 'OpenPay',
                        message: `${error.error_code} - ${error.description}`
                    }));
                } else {
                    // Se guarda la transacción.
                    let openPayTransactionModel: OpenPayTransactionModel = new OpenPayTransactionModel();
                    let transaction: OpenPayTransaction = {
                        order_id: orderId,
                        due_date: dueDate,
                        status: 'pending',
                        type: 'store'
                    };
                    try {
                        await openPayTransactionModel.postOpenPayTransaction(transaction);
                    } catch(error) {
                        console.log(JSON.stringify(error));
                    }

                    //PPPP  DDDD  FFFFF
                    //P   P D   D F
                    //PPPP  D   D FFF
                    //P     D   D F
                    //P     DDDD  F

                    // OPCIÓN #2 - PDF Personalizado.
                    // Se requieren de las siguientes variables:
                    // barcode (imagen)
                    // barcodeNumber
                    // totalToPay
                    // totalToPayCents
                    // productName
                    // date (1 de febrero de 2020, a las 17:52 PM)
                    // clientMail

                    // Cantidades.
                    let amount: string = charge.amount.toString();
                    let amountParts: Array<string> = amount.split('.');
                    let totalToPay: string = amountParts[0];
                    let totalToPayCents: string = amountParts[1] || '00';
                    // Fecha (hoy).
                    let today: Date = new Date();
                    let date: string = date2StringFormat(today, 'DD de MMM de YYYY, a las hh:mm HRS');
                    // Fecha de vencimiento.
                    let due_date: string = 'No Aplica';
                    if(charge.due_date) {
                        let dueDate: Date = new Date(charge.due_date);
                        due_date = date2StringFormat(dueDate, 'DD de MMM de YYYY');
                    }
                    // Correo electrónico.
                    let clientMail: string = email;
                    // Objeto EJS.
                    // console.log(charge);
                    let ejsData: any = {
                        barcodeNumber: charge.payment_method.reference,
                        barcode: charge.payment_method.barcode_url,
                        totalToPay,
                        totalToPayCents,
                        productName: account.productName,
                        date,
                        clientMail,
                        due_date
                    };
                    // console.log(ejsData);
                    let templateName: string = '../templates/paynetFormat.ejs';
                    try {
                        let pdfToBase64Result = await pdf2Base64(templateName, ejsData);
                        let pdfText: string = pdfToBase64Result.data;
                        let result: Buffer = Buffer.from(pdfText, 'base64');
                        response.writeHead(200, {
                            'Content-Transaction': 'application/pdf',
                            'Content-Disposition': `attachment; filename=formato.pdf`,
                            'Content-Length': result.length
                        });
                        return response.end(result);
                    } catch(error) {
                        // return response.status(400).end(JSON.stringify(error));
                        // OPCIÓN #1 - Se solicita el PDF.
                        // NOTE: Esta opción se utiliza sólo si el PDF personalizado no se puede generar.
                        axios.get(`${configuration.services.openpay.dashboardURL}/paynet-pdf/${configuration.services.openpay.id}/${charge.payment_method.reference}`, {
                            responseType: 'arraybuffer', // important
                            headers: {
                                Accept: 'application/pdf'
                            }
                        }).then((axiosResponse: AxiosResponse<any>) => {
                            // console.log(axiosResponse.headers);
                            // console.log(axiosResponse.data);
                            // response.data.pipe(fs.createWriteStream("/temp/my.pdf"));
                            let result: Buffer = Buffer.from(axiosResponse.data);
                            // const blob: Blob = new Blob([axiosResponse.data], { type: 'application/pdf' });
                            response.writeHead(200, {
                                'Content-Transaction': 'application/pdf',
                                'Content-Disposition': `attachment; filename=`,
                                'Content-Length': result.length
                            });
                            return response.end(result);
                        });
                    }

                    // Resultado.
                    // return resolve(charge);
                }
            });
        // });
    }

    // NOTE: Esta función devuelve el archivo en texto base64, la función de arriba devuelve el archvio para descargar.
    public async postBase64StoreCharge(body: any): Promise<any> {
        return new Promise(async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { accountNumber, ...charge }: { accountNumber: string } & IStoreCharge = body;
            // returnBase64 = typeof returnBase64 === 'boolean' ? returnBase64 : false;
            if(!accountNumber) {
                return reject({
                    status: 400,
                    module: 'OpenPay',
                    message: 'No se incluyó un número de cuenta.'
                });
            }
            if(charge.amount >= 10000) {
                return reject({
                    status: 400,
                    module: 'OpenPay',
                    message: 'El monto enviado excede el máximo permitido.'
                });
            }

            // CCCC U   U EEEEE N   N TTTTT  AAA
            //C     U   U E     NN  N   T   A   A
            //C     U   U EEE   N N N   T   AAAAA
            //C     U   U E     N  NN   T   A   A
            // CCCC  UUU  EEEEE N   N   T   A   A

            let account: Account = new Account();
            let address: Address = new Address();
            let contacts: Array<Contact> = [];
            let accountModel: AccountModel = new AccountModel();
            try {
                account = await accountModel.getAccount({ accountNumber });
                address = account.address || new Address();
                // @ts-ignore
                contacts = account.contacts.results;
            } catch(error) {
                return reject(error);
            }

            // CCCC  AAA  RRRR   GGGG  OOO
            //C     A   A R   R G     O   O
            //C     AAAAA RRRR  G  GG O   O
            //C     A   A R   R G   G O   O
            // CCCC A   A R   R  GGGG  OOO

            // Nombre y apellidos.
            let firstName: string = (idx(account.client, _ => _.firstName) || '').toString();
            let secondName: string = (idx(account.client, _ => _.secondName) || '').toString();
            let familyName: string = (idx(account.client, _ => _.firstLastName) || '').toString();
            let surName: string = (idx(account.client, _ => _.secondLastName) || '').toString();
            let name: string = `${firstName} ${secondName}`.replace(/\s{2}/, '').trim();
            let lastName: string = `${familyName} ${surName}`.replace(/\s{2}/, '').trim();
            // Email.
            let email: string = 'admin@domain.com';
            for(const contact of contacts) {
                for(const contactMean of contact.contactMeans) {
                    if(contactMean.contactMeanName === 'email' && contactMean.notify) {
                        email = contactMean.value;
                        break;
                    }
                }
            }
            // Información del cliente.
            let customer: ICustomer = {
                // external_id: '',
                name,
                last_name: lastName,
                email,
                // requires_account: '',
                // phone_number: '',
                // address: '',
            };
            let orderId: string = `${accountNumber}.${date2StringFormat(new Date(), 'DDMMYYYYhhmmss')}`;
            let dueDate: string = date2StringFormat(charge.due_date ? new Date(charge.due_date) : new Date(), 'YYYY-MM-DDThh:mm:ss');
            let storeChargeRequest: IStoreCharge = {
                method: 'store',
                amount: parseFloat((charge.amount).toFixed(2)),
                description: 'Servicio de Telecomunicaciones.',
                order_id: orderId,
                due_date: dueDate,
                customer
            };
            openpay.charges.create(storeChargeRequest, async (error: IError, charge: ITransaction) => {
                if(error) {
                    return reject({
                        status: 400,
                        module: 'OpenPay',
                        message: `${error.error_code} - ${error.description}`
                    });
                } else {
                    // Se guarda la transacción.
                    let openPayTransactionModel: OpenPayTransactionModel = new OpenPayTransactionModel();
                    let transaction: OpenPayTransaction = {
                        order_id: orderId,
                        due_date: dueDate,
                        status: 'pending',
                        type: 'store'
                    };
                    try {
                        await openPayTransactionModel.postOpenPayTransaction(transaction);
                    } catch(error) {
                        // console.log(JSON.stringify(error));
                    }

                    //PPPP  DDDD  FFFFF
                    //P   P D   D F
                    //PPPP  D   D FFF
                    //P     D   D F
                    //P     DDDD  F

                    // OPCIÓN #2 - PDF Personalizado.
                    // Se requieren de las siguientes variables:
                    // barcode (imagen)
                    // barcodeNumber
                    // totalToPay
                    // totalToPayCents
                    // productName
                    // date (1 de febrero de 2020, a las 17:52 PM)
                    // clientMail

                    // Cantidades.
                    let amount: string = charge.amount.toString();
                    let amountParts: Array<string> = amount.split('.');
                    let totalToPay: string = amountParts[0];
                    let totalToPayCents: string = amountParts[1] || '00';
                    // Fecha (hoy).
                    let today: Date = new Date();
                    let date: string = date2StringFormat(today, 'DD de MMM de YYYY, a las hh:mm HRS');
                    // Fecha de vencimiento.
                    let due_date: string = 'No Aplica';
                    if(charge.due_date) {
                        let dueDate: Date = new Date(charge.due_date);
                        due_date = date2StringFormat(dueDate, 'DD de MMM de YYYY');
                    }
                    // Correo electrónico.
                    let clientMail: string = email;
                    // Objeto EJS.
                    // console.log(charge);
                    let ejsData: any = {
                        barcodeNumber: charge.payment_method.reference,
                        barcode: charge.payment_method.barcode_url,
                        totalToPay,
                        totalToPayCents,
                        productName: account.productName,
                        date,
                        clientMail,
                        due_date
                    };
                    // console.log(ejsData);
                    let templateName: string = '../templates/paynetFormat.ejs';
                    try {
                        let pdfToBase64Result = await pdf2Base64(templateName, ejsData);
                        let pdfText: string = pdfToBase64Result.data;
                        let result: Buffer = Buffer.from(pdfText, 'base64');
                        return resolve({
                            status: 200,
                            base64: pdfText
                        });
                    } catch(error) {
                        return reject(error);
                        // OPCIÓN #1 - Se solicita el PDF.
                        // NOTE: Esta opción se utiliza sólo si el PDF personalizado no se puede generar.
                        // axios.get(`${configuration.services.openpay.dashboardURL}/paynet-pdf/${configuration.services.openpay.id}/${charge.payment_method.reference}`, {
                        //     responseType: 'arraybuffer', // important
                        //     headers: {
                        //         Accept: 'application/pdf'
                        //     }
                        // }).then((axiosResponse: AxiosResponse<any>) => {
                        //     let result: Buffer = Buffer.from(axiosResponse.data);
                        //     response.writeHead(200, {
                        //         'Content-Transaction': 'application/pdf',
                        //         'Content-Disposition': `attachment; filename=`,
                        //         'Content-Length': result.length
                        //     });
                        //     return response.end(result);
                        // });
                    }

                    // Resultado.
                    // return resolve(charge);
                }
            });
        });
    }

    public postOpenPayWebhook(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let { ...openPayResponse }: IWebhook = body;

            /*
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
                email: 'frodriguez@domain.com',
                name: 'Ministerio de magia',
                type: 'to'
            });
            let message: Message = {
                html: `<h1>Example HTML content.</h1>`,
                subject: `[INFO] Pago realizado con OpenPay.`,
                to: emailTo
            };
            let email: EmailWithTemplate = {
                async: true,
                message,
                template_name: 'client_notification_new',
                template_content: [{
                    name: 'message',
                    content: `Esta es la información enviada desde OpenPay:<br/><br/>
                            <h2>Datos:</h2><br/>${JSON.stringify(openPayResponse)}<br/><br/>`
                }]
            };
            try {
                let emailModel: EmailModel = new EmailModel();
                await emailModel.postEmail(email);
            } catch(error) {}
            */
            
            //TTTTT RRRR   AAA  N   N  SSSS  AAA   CCCC  CCCC IIIII  OOO  N   N
            //  T   R   R A   A NN  N S     A   A C     C       I   O   O NN  N
            //  T   RRRR  AAAAA N N N  SSS  AAAAA C     C       I   O   O N N N
            //  T   R   R A   A N  NN     S A   A C     C       I   O   O N  NN
            //  T   R   R A   A N   N SSSS  A   A  CCCC  CCCC IIIII  OOO  N   N

            let orderId: string = idx(openPayResponse, _ => _.transaction.order_id) || '';
            let openPayTransactionModel: OpenPayTransactionModel = new OpenPayTransactionModel();
            let transaction: OpenPayTransaction = new OpenPayTransaction();
            if(orderId) {
                try {
                    transaction = await openPayTransactionModel.getOpenPayTransaction({ order_id: orderId, status: 'pending' });
                } catch(error) {
                    return resolve({
                        status: 200,
                        message: 'No se encontró la transacción asociada con el identificador de la orden.'
                    });
                }
            } else {
                return resolve({
                    status: 200,
                    message: 'No se encontró el identificador de la orden.'
                });
            }

            // Se revisa el tipo de operación.
            switch(openPayResponse.type) {
                case 'charge.succeeded':
                case 'payout.succeeded':
                case 'transfer.succeeded':
                case 'fee.succeeded':
                case 'spei.received':
                
                    //DDDD   AAA  TTTTT  OOO   SSSS
                    //D   D A   A   T   O   O S
                    //D   D AAAAA   T   O   O  SSS
                    //D   D A   A   T   O   O     S
                    //DDDD  A   A   T    OOO  SSSS
        
                    // Se debe armar la información del pago y registrarlo.
                    // Número de cuenta.
                    let orderIdParts: Array<string> = orderId.split('.');
                    let accountNumber = orderIdParts[0];
                    // Fecha de aplicación del pago.
                    // "event_date" : "2013-11-22T11:04:49-06:00",
                    let applicationDate: Date = new Date(openPayResponse.event_date);
                    // Número de cuenta interna para los pagos en línea.
                    // 6504898maestra1
                    let onlineAccount: InternalAccount = new InternalAccount();
                    let internalAccountModel: InternalAccountModel = new InternalAccountModel();
                    try {
                        onlineAccount = await internalAccountModel.getInternalAccount({ value: '6504898maestra1' });
                    } catch (error) {}
                    // Se crea el objeto de pago.
                    let payment: Payment = {
                        parentId: accountNumber,
                        parentType: 'account',
                        paymentDate: date2StringFormat(applicationDate),
                        applicationDate: date2StringFormat(applicationDate),
                        amountPaid: parseFloat(openPayResponse.transaction.amount.toFixed(2)),
                        typeValue: 'openpay',                                   // NOTE: Revisar si se puede obtener de algún lado.
                        statusValue: 'paid',                                    // NOTE: Se debe actualizar al asignar el pago.
                        description: 'Pago servicio de telecomunicaciones.',    // bankResponse.Ds_MerchantData || '',
                        currencyValue: 'MXN',
                        exchangeRate: 1,
                        internalAccountNumber: onlineAccount._id,
                        // comission: '',
                        // cardDetails: '',
                        // invoices: '',
                        reference: openPayResponse.transaction.id,
                        // details: '',
                        paymentForm: '04',
                    };
                    
                    //PPPP   AAA   GGGG  OOO
                    //P   P A   A G     O   O
                    //PPPP  AAAAA G  GG O   O
                    //P     A   A G   G O   O
                    //P     A   A  GGGG  OOO
        
                    // Se intenta guardar el pago.
                    let paymentModel: PaymentModel = new PaymentModel();
                    try {
                        await paymentModel.postPayment(payment);
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
                            name: 'Ministerio de magia',
                            type: 'to'
                        });
                        let message: Message = {
                            html: `<h1>Example HTML content.</h1>`,
                            subject: `[ERROR] Al intentar guardar el pago enviado desde OpenPay.`,
                            to: emailTo
                        };
                        let email: EmailWithTemplate = {
                            async: true,
                            message,
                            template_name: 'client_notification_new',
                            template_content: [{
                                name: 'message',
                                content: `Ocurrió un error al intentar guardar el pago enviado por el banco.<br/><br/>
                                        <h2>Datos:</h2><br/>${JSON.stringify(openPayResponse.transaction.id)}<br/><br/>
                                        <h2>Error:</h2><br/>${JSON.stringify(error)}`
                            }]
                        };
                        try {
                            let emailModel: EmailModel = new EmailModel();
                            await emailModel.postEmail(email);
                        } catch(error) {}
                    }
                    
                    //TTTTT RRRR   AAA  N   N  SSSS  AAA   CCCC  CCCC IIIII  OOO  N   N
                    //  T   R   R A   A NN  N S     A   A C     C       I   O   O NN  N
                    //  T   RRRR  AAAAA N N N  SSS  AAAAA C     C       I   O   O N N N
                    //  T   R   R A   A N  NN     S A   A C     C       I   O   O N  NN
                    //  T   R   R A   A N   N SSSS  A   A  CCCC  CCCC IIIII  OOO  N   N

                    try {
                        await openPayTransactionModel.putOpenPayTransaction({ _id: transaction._id, status: 'fullfilled' });
                    } catch(error) {}
                    break;
                case 'verification':

                    //EEEEE M   M  AAA  IIIII L
                    //E     MM MM A   A   I   L
                    //EEE   M M M AAAAA   I   L
                    //E     M   M A   A   I   L
                    //EEEEE M   M A   A IIIII LLLLL

                    // Mensaje.
                    let emailTo: Array<To> = [];
                    emailTo.push({
                        email: 'dev@domain.com',
                        name: 'Ministerio de magia',
                        type: 'to'
                    });
                    let message: Message = {
                        html: `<h1>Example HTML content.</h1>`,
                        subject: `[INFO] Información de verificación de OpenPay.`,
                        to: emailTo
                    };
                    let email: EmailWithTemplate = {
                        async: true,
                        message,
                        template_name: 'client_notification_new',
                        template_content: [{
                            name: 'message',
                            content: `Esta es la información enviada desde OpenPay:<br/><br/>
                                    <h2>Datos:</h2><br/>${JSON.stringify(openPayResponse)}<br/><br/>`
                        }]
                    };
                    try {
                        let emailModel: EmailModel = new EmailModel();
                        await emailModel.postEmail(email);
                    } catch(error) {}
                    break;
                case 'charge.created':
                case 'charge.refunded':
                case 'payout.created':
                case 'payout.failed':
                case 'chargeback.created':
                case 'chargeback.rejected':
                case 'chargeback.accepted':
                default:
                    break;
            }
            // Se regresa siempre una respuesta exitosa.
            return resolve({
                status: 200,
                message: 'Ok.'
            });
        });
    }
}

//TTTTT RRRR   AAA  N   N  SSSS  AAA   CCCC  CCCC IIIII  OOO  N   N
//  T   R   R A   A NN  N S     A   A C     C       I   O   O NN  N
//  T   RRRR  AAAAA N N N  SSS  AAAAA C     C       I   O   O N N N
//  T   R   R A   A N  NN     S A   A C     C       I   O   O N  NN
//  T   R   R A   A N   N SSSS  A   A  CCCC  CCCC IIIII  OOO  N   N

class OpenPayTransaction {
    // Identificador.
    @IsMongoId({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    _id?: string;
    // Número de orden.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    @MaxLength(100, {
        message: 'El texto no puede ser mayor a $constraint1 caracteres.',
        groups: ['POST', 'PUT']
    })
    order_id: string;
    // Fecha de vencimiento.
    @IsDefined({
        message: 'El campo es requerido.',
        groups: ['POST']
    })
    @IsDateString({
        message: 'El tipo de dato es incorrecto.',
        groups: ['POST', 'PUT']
    })
    due_date: string;
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
    status: string;
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
    type: string;
}

export class OpenPayTransactionModel {

    //Propiedades.
    private transaction: OpenPayTransaction;

    //Constructor.
    constructor(transaction?: OpenPayTransaction) {
        this.transaction = transaction || new OpenPayTransaction();
    }

    //Métodos.

    //V   V  AAA  L     IIIII DDDD   AAA   CCCC IIIII  OOO  N   N
    //V   V A   A L       I   D   D A   A C       I   O   O NN  N
    //V   V AAAAA L       I   D   D AAAAA C       I   O   O N N N
    // V V  A   A L       I   D   D A   A C       I   O   O N  NN
    //  V   A   A LLLLL IIIII DDDD  A   A  CCCC IIIII  OOO  N   N

    public async validate(): Promise<any> {
        return this.validateSchemas(this.transaction);
    }

    private async validateSchemas(_transaction: any = {}, groups: Array<string> = ['POST']): Promise<any> {
        
        let errors: Array<any> = [];
        
        let transaction = new OpenPayTransaction();
        transaction._id = _transaction._id;
        transaction.order_id = _transaction.order_id;
        transaction.due_date = _transaction.due_date;
        transaction.status = _transaction.status;
        transaction.type = _transaction.type;
        let transactionErrors = await validate(transaction, { groups, skipMissingProperties: true });
        errors = RemodelErrors(transactionErrors, 'transaction');
        
        return errors;
    }
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getOpenPayTransaction(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.finance.openpay.transactions.getTransaction, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Transacciones | OpenPay',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Transacciones | OpenPay',
	                    message: 'Ocurrió un error al intentar obtener la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    } 

    public getOpenPayTransactions(query: any): Promise<any> {
        // Parámetros.
        let { limit, page, ...filters } = query;
        let params: any = {
            limit,
            page
        };
        Object.keys(filters).forEach(key => params[key] = filters[key]);
        // Petición.
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.get(configuration.services.domain.finance.openpay.transactions.getTransactions, { params })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || []);
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Transacciones | OpenPay',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Transacciones | OpenPay',
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

    public postOpenPayTransaction(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let errors: Array<any> = [];
            this.validateSchemas(body)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Transacciones | OpenPay',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.post(configuration.services.domain.finance.openpay.transactions.postTransaction, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Transacciones | OpenPay',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Transacciones | OpenPay',
                            message: 'Ocurrió un error al intentar guardar la información (RECIBO - TIPO).',
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

    public putOpenPayTransaction(body: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            let errors: Array<any> = [];
            this.validateSchemas(body)
            .then((data: any) => {
                errors = data;
            });
            if(errors.length > 0) {
                let response: any = {
                    module: 'Transacciones | OpenPay',
                    message: 'La información no es válida.',
                    errors
                };
                return reject(response);
            } else {
                axios.put(configuration.services.domain.finance.openpay.transactions.putTransaction, body)
                .then((response: any) => {
                    return resolve(idx(response, _ => _.data) || {});
                })
                .catch((error: any) => {
                    if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
                        return reject({
                            status: 400,
                            module: 'Transacciones | OpenPay',
                            message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
                        });
                    } else {
                        return reject({
                            status: 400,
                            module: 'Transacciones | OpenPay',
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

    public deleteOpenPayTransaction(query: any): Promise<any> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {
            axios.delete(configuration.services.domain.finance.openpay.transactions.deleteTransaction, { params: query })
            .then((response: any) => {
                return resolve(idx(response, _ => _.data) || {});
            })
            .catch((error: any) => {
                if(typeof error.code === 'string' && error.code === 'ECONNREFUSED') {
					return reject({
						status: 400,
						module: 'Transacciones | OpenPay',
						message: 'Parece que el servicio no está disponible por el momento.\r\nPor favor inténtalo de nuevo más tarde.'
					});
				} else {
					return reject({
	                    status: 400,
	                    module: 'Transacciones | OpenPay',
	                    message: 'Ocurrió un error al intentar borrar la información.',
						error: idx(error, _ => _.response.data) || error
	                });
				}
            });
        });
    }

}