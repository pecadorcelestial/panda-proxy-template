// Módulos
import { Request, Response } from 'express';
import axios from 'axios';
import idx from 'idx';
// Modelos.
import AccountModel, { Account } from './accounts';
import { Client } from './clients';
import PaymentModel, { Payment } from './payments';
import { Receipt, Item } from './receipts';

export default class PointOfSaleModel {
    
    //PPPP   OOO   SSSS TTTTT
    //P   P O   O S       T
    //PPPP  O   O  SSS    T
    //P     O   O     S   T
    //P      OOO  SSSS    T

    public postPointOfSalePayment(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            let { posAccountNumber, ...payment }: { posAccountNumber: string } & Payment = body;

            // Proceso:
            // 1. Validar la información del pago.
            let paymentModel: PaymentModel = new PaymentModel();
            try {
                paymentModel.payment = payment;
                await paymentModel.validate();
            } catch(error) {
                return reject(error);
            }
            // 2. Validar identificador del usuario "punto de venta".
            let account: Account = new Account();
            let client: Client = new Client();
            let accountModel: AccountModel = new AccountModel();
            try {
                account = await accountModel.getAccount({ accountNumber: posAccountNumber });
            } catch(error) {
                return reject(error);
            }
            // 3. Generar pago a cliente.
            let posPayment: Payment = new Payment();
            try {
                posPayment = await paymentModel.postPayment(payment);
            } catch(error) {
                return reject(error);
            }
            // 4. Generar recibo a usuario "punto de venta".
            //    NOTE: Hasta este momento, la generación del recibo es SIN generación de factura.
            let posReceipt: Receipt = new Receipt();
            /*
            "parentId":"MO100-0000332",
            "parentType":"account",
            "folio":null,
            "movementDate":"2019-10-28T06:00:00.000Z",
            "items":[
                {
                    "productName":"asdfasdf",
                    "unitCost":387.931,
                    "discountTmp":0,
                    "discount":0,
                    "quantity":1,
                    "total":387.931,
                    "satProductCode":"81161700"
                }
            ],
            "total":"450.00",
            "subTotal":"387.93",
            "taxes":"62.07",
            "discount":"0.00",
            "currencyValue":"MXN",
            "exchangeRate":1,
            "statusValue":"pending",
            "typeValue":"individual"
            */
            let item: Item = {
                productName: ``,
                unitCost: payment.amountPaid,
                discount: 0,
                quantity: 1,
                total: payment.amountPaid,
                satProductCode: ''
            };
            /*
            posReceipt = {
                parentId
                parentType
                folio
                movementDate
                total
                subTotal
                taxes
                discount
                currencyValue
                exchangeRate
                statusValue
                typeValue
            };
            */
        });
    }
}