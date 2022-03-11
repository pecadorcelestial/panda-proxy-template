import PaymentModel, { Payment } from '../payments';
import ReceiptModel, { Receipt } from '../receipts';

export default class ReceiptProcessesModel {

    // Constructor.
    constructor() {}

    //PPPP  U   U TTTTT
    //P   P U   U   T
    //PPPP  U   U   T
    //P     U   U   T
    //P      UUU    T

    public putUpdateReceiptsStatus(body: any): Promise<any> {
        return new Promise( async (resolve: (value?: {} | PromiseLike<{}> | undefined) => void, reject: (reason?: any) => void) => {

            // 1. Se obtienen todos los recibos marcados como pendientes.
            // 2. Se recorren uno a uno.
            // 2.1. Se obtienen tods los pagos aplicados a dicho recibo.
            // 2.2. Se valida si el pago ya está "saldado" y se actualiza su estatus.
            // 3. Fin.

            //RRRR  EEEEE  CCCC IIIII BBBB   OOO   SSSS
            //R   R E     C       I   B   B O   O S
            //RRRR  EEE   C       I   BBBB  O   O  SSS
            //R   R E     C       I   B   B O   O     S
            //R   R EEEEE  CCCC IIIII BBBB   OOO  SSSS

            let receipts: Array<Receipt> = [];
            let receiptModel: ReceiptModel = new ReceiptModel();
            let paymentModel: PaymentModel = new PaymentModel();
            try {
                let getReceipts: { results: Array<Receipt>, summary: any } = await receiptModel.getReceipts({ statusValue: 'pending', all: true });
                receipts = receipts.concat(getReceipts.results);
            } catch(error) {
                return reject(error);
            }
            console.log(`Recibos encontrados: ${receipts.length}`);
            if(receipts.length > 0) {
                // let index: number = 0;
                for(const receipt of receipts) {
                    // console.log(index); index++;

                    //PPPP   AAA   GGGG  OOO   SSSS
                    //P   P A   A G     O   O S
                    //PPPP  AAAAA G  GG O   O  SSS
                    //P     A   A G   G O   O     S
                    //P     A   A  GGGG  OOO  SSSS

                    let amountPaid: number = 0;
                    let payments: Array<Payment> = [];
                    try {
                        let getPayments: { results: Array<Payment>, summary: any } = await paymentModel.getPayments({ 'details.receiptId': receipt._id });
                        payments = payments.concat(getPayments.results);
                    } catch(error) {
                        continue;
                    }
                    if(payments.length > 0) {
                        for(const payment of payments) {
                            if(Array.isArray(payment.details)) {
                                for(const detail of payment.details) {
                                    if(detail.receiptId === receipt._id) {
                                        amountPaid += detail.amount;
                                    }
                                }
                            } else {
                                continue;
                            }
                        }
                        amountPaid = parseFloat(amountPaid.toFixed(2));
                        if(amountPaid >= receipt.total) {
                            console.log('==================================');
                            console.log(`Total del recibo: ${receipt.total}`);
                            console.log(`Total pagado: ${amountPaid}`);

                            // AAA   CCCC TTTTT U   U  AAA  L     IIIII ZZZZZ  AAA   CCCC IIIII  OOO  N   N
                            //A   A C       T   U   U A   A L       I      Z  A   A C       I   O   O NN  N
                            //AAAAA C       T   U   U AAAAA L       I     Z   AAAAA C       I   O   O N N N
                            //A   A C       T   U   U A   A L       I    Z    A   A C       I   O   O N  NN
                            //A   A  CCCC   T    UUU  A   A LLLLL IIIII ZZZZZ A   A  CCCC IIIII  OOO  N   N

                            try {
                                // await receiptModel.putReceipt({ _id: receipt._id, statusValue: 'paid' });
                            } catch(error) {
                                continue;
                            }
                        } else {
                            continue;
                        }
                    } else {
                        continue;
                    }
                }
            } else {
                return reject({
                    status: 400,
                    module: 'Recibos (Procesos)',
                    message: 'No se encontró ningún recibo pendiente.'
                });
            }
            
            //RRRR  EEEEE  SSSS U   U L     TTTTT  AAA  DDDD   OOO
            //R   R E     S     U   U L       T   A   A D   D O   O
            //RRRR  EEE    SSS  U   U L       T   AAAAA D   D O   O
            //R   R E         S U   U L       T   A   A D   D O   O
            //R   R EEEEE SSSS   UUU  LLLLL   T   A   A DDDD   OOO
            
            console.log('Actualización terminada con éxito.');
            return resolve({
                status: 200,
                message: 'Actualización terminada con éxito.'
            });
        });
    }
}