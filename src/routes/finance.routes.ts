import { Router } from 'express';
// Controladores.
import { BalanceController } from '../controllers/processes/balance';
import { BankController } from '../controllers/catalogs/banks';
import { CardTypeController } from '../controllers/catalogs/cardTypes';
import { CurrencyController } from '../controllers/catalogs/currency';
import { DiscountsController } from '../controllers/discounts';
import { InternalAccountController } from '../controllers/catalogs/internalAccounts';
import { InvoiceController } from '../controllers/invoices';
import { InvoiceControllerV2 } from '../controllers/invoicesV2';
import { InvoiceStatusController } from '../controllers/catalogs/invoiceStatuses';
import { OpenPayTransactionController, OpenPayController } from '../controllers/openPay';
import { PaymentController } from '../controllers/payments';
import { PaymentStatusController } from '../controllers/catalogs/paymentStatuses';
import { PaymentTypeController } from '../controllers/catalogs/paymentTypes';
import { ReceiptController } from '../controllers/receipts';
import { ReceiptStatusController } from '../controllers/catalogs/receiptStatuses';
import { ReceiptTypeController } from '../controllers/catalogs/receiptTypes';
import { ReceiptProcessesController } from '../controllers/processes/receipts';

import multer from 'multer';

// Filtro para los archivos tipo XML y PDF.
const xmlNpdfFilesFilter = (request: Express.Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    if (!file.originalname.match(/\.(xml|pdf)$/)) {
        /*
        Esquema del error:
        {
            message: string,
            name: string,
            stack: string
        }
        */
        let error: Error = { 
            message: 'El tipo de archivo no está permitido.' ,
            name: ''
        };
        return callback(error, false);
    }
    return callback(null, true);
};

// Filtro para los archivos JSON.
const jsonFilesFilter = (request: Express.Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    if (!file.originalname.match(/\.(json)$/)) {
        let error: Error = { 
            message: 'El tipo de archivo no está permitido.' ,
            name: ''
        };
        return callback(error, false);
    }
    return callback(null, true);
};

// Uploader para archivos XML y PDF.
let uploadXMLorPDF = multer({ fileFilter: xmlNpdfFilesFilter });
let fields: Array<multer.Field> = [
    {
        name: 'xml',
        maxCount: 1
    },
    {
        name: 'pdf',
        maxCount: 1
    }
];

// Uploadre para archivos JSON.
let uploadJSON = multer({ fileFilter: jsonFilesFilter });

const router = Router();

//RRRR  EEEEE  CCCC IIIII BBBB   OOO   SSSS
//R   R E     C       I   B   B O   O S
//RRRR  EEE   C       I   BBBB  O   O  SSS
//R   R E     C       I   B   B O   O     S
//R   R EEEEE  CCCC IIIII BBBB   OOO  SSSS

let receiptController: ReceiptController = new ReceiptController();
let receiptStatusController: ReceiptStatusController = new ReceiptStatusController();
let receiptTypeController: ReceiptTypeController = new ReceiptTypeController();

router.route('/receipts')
    .get(receiptController.getReceipts)
    .post(uploadJSON.single('file'), receiptController.postReceipts);

router.route('/receipts/pendings')
    .get(receiptController.getPendingReceipts);

router.route('/receipts/pendings/v2')
    .get(receiptController.getPendingReceiptsV2);

router.route('/receipts/total')
    .get(receiptController.getReceiptsTotal);

// DELETE: ¡Borrar! Sólo para arreglos del legacy.
// router.route('/receipts/putStatus2Error')
//     .put(receiptController.putReceiptErrors);

// DELETE: ¡Borrar! Sólo para arreglos del legacy.
// router.route('/receipts/fixDecimals')
//     .put(receiptController.putReceiptDecimals);

// DELETE: ¡Borrar! Sólo para una corrección única de descuentos.
// router.route('/receipts/fixItems')
//     .put(receiptController.putFixItems);

// DELETE: ¡Borrar! Sólo para una corrección única de arreglos.
// router.route('/receipts/eraseDiscounts')
//     .put(receiptController.putEraseDiscounts);

router.route('/receipt')
    .get(receiptController.getReceipt)
    .post(receiptController.postReceipt)
    .put(receiptController.putReceipt)
    .delete(receiptController.deleteReceipt);

router.route('/receipt/again')
    .post(receiptController.rePostReceipt)

router.route('/receipt/details')
    .get(receiptController.getReceiptDetails)

router.route('/receipt/pdf')
    .get(receiptController.getPDFFromReceipt);

router.route('/receipt/common/shipping/sim')
    .post(receiptController.postVerySpecificSIMShippingChargeReceipt);

router.route('/catalogs/receipt/statuses')
    .get(receiptStatusController.getReceiptStatuses);

router.route('/catalogs/receipt/status')
    .get(receiptStatusController.getReceiptStatus)
    .post(receiptStatusController.postReceiptStatus)
    .put(receiptStatusController.putReceiptStatus)
    .delete(receiptStatusController.deleteReceiptStatus);

router.route('/catalogs/receipt/types')
    .get(receiptTypeController.getReceiptTypes);

router.route('/catalogs/receipt/type')
    .get(receiptTypeController.getReceiptType)
    .post(receiptTypeController.postReceiptType)
    .put(receiptTypeController.putReceiptType)
    .delete(receiptTypeController.deleteReceiptType);

//PPPP   AAA   GGGG  OOO   SSSS
//P   P A   A G     O   O S
//PPPP  AAAAA G  GG O   O  SSS
//P     A   A G   G O   O     S
//P     A   A  GGGG  OOO  SSSS

let paymentController: PaymentController = new PaymentController();
let paymentStatusController: PaymentStatusController = new PaymentStatusController();
let paymentTypeController: PaymentTypeController = new PaymentTypeController();
let cardTypeController: CardTypeController = new CardTypeController();

router.route('/payments')
    .get(paymentController.getPayments)
    .post(uploadJSON.single('file'), paymentController.postPayments);

router.route('/payments/receipt')
    .get(paymentController.getPayments4ReceiptTotal);

router.route('/payments/receipts')
    .get(paymentController.getPayments4ReceiptsTotal);

router.route('/payments/total')
    .get(paymentController.getPaymentsTotal);

router.route('/payment')
    .get(paymentController.getPayment)
    .post(paymentController.postPayment)
    .put(paymentController.putPayment)
    .delete(paymentController.deletePayment);

// router.route('/payment/invoices/cancellation')
//     .post(paymentController.postPaymentInvoicesCancellation);

router.route('/catalogs/payment/statuses')
    .get(paymentStatusController.getPaymentStatuses);

router.route('/catalogs/payment/status')
    .get(paymentStatusController.getPaymentStatus)
    .post(paymentStatusController.postPaymentStatus)
    .put(paymentStatusController.putPaymentStatus)
    .delete(paymentStatusController.deletePaymentStatus);

router.route('/catalogs/payment/types')
    .get(paymentTypeController.getPaymentTypes);

router.route('/catalogs/payment/type')
    .get(paymentTypeController.getPaymentType)
    .post(paymentTypeController.postPaymentType)
    .put(paymentTypeController.putPaymentType)
    .delete(paymentTypeController.deletePaymentType);

router.route('/catalogs/payment/cardTypes')
    .get(cardTypeController.getCardTypes);

router.route('/catalogs/payment/cardType')
    .get(cardTypeController.getCardType)
    .post(cardTypeController.postCardType)
    .put(cardTypeController.putCardType)
    .delete(cardTypeController.deleteCardType);

//W   W EEEEE BBBB  H   H  OOO   OOO  K   K
//W   W E     B   B H   H O   O O   O K  K
//W W W EEE   BBBB  HHHHH O   O O   O KKK
//WW WW E     B   B H   H O   O O   O K  K
//W   W EEEEE BBBB  H   H  OOO   OOO  K   K

let openPayController: OpenPayController = new OpenPayController();

router.route('/payment-response/:accountNumber')
    .post(paymentController.postPaymentWebhook);

router.route('/openpay/webhook')
    .post(openPayController.postOpenPayWebhook);

//FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA   SSSS
//F     A   A C       T   U   U R   R A   A S
//FFF   AAAAA C       T   U   U RRRR  AAAAA  SSS
//F     A   A C       T   U   U R   R A   A     S
//F     A   A  CCCC   T    UUU  R   R A   A SSSS

let invoiceController: InvoiceController = new InvoiceController();
let invoiceStatusController: InvoiceStatusController = new InvoiceStatusController();

router.route('/invoices')
    .get(invoiceController.getInvoices)
    .post(uploadJSON.single('file'), invoiceController.postInvoices);

router.route('/invoices/updateJSONs')
    .put(invoiceController.putInvoiceGetJSON);

// router.route('/invoices/updateDates')
//     .put(invoiceController.updateInvoiceDate);

router.route('/invoice')
    .get(invoiceController.getInvoice)
    .post(uploadXMLorPDF.fields(fields), invoiceController.postInvoice)
    .put(invoiceController.putInvoice)
    .delete(invoiceController.deleteInvoice);

router.route('/invoice/pdf')
    .get(invoiceController.getPDFFromInvoice);

router.route('/catalogs/invoice/statuses')
    .get(invoiceStatusController.getInvoiceStatuses);

router.route('/catalogs/invoice/statuses')
    .get(invoiceStatusController.getInvoiceStatus)
    .post(invoiceStatusController.postInvoiceStatus)
    .put(invoiceStatusController.putInvoiceStatus)
    .delete(invoiceStatusController.deleteInvoiceStatus);

router.route('/invoices/reports/total')
    .get(invoiceController.getTotalInvoices);

//FFFFF  AAA   CCCC TTTTT U   U RRRR   AAA   SSSS      V   V  222
//F     A   A C       T   U   U R   R A   A S          V   V 2   2
//FFF   AAAAA C       T   U   U RRRR  AAAAA  SSS       V   V   22
//F     A   A C       T   U   U R   R A   A     S       V V   2
//F     A   A  CCCC   T    UUU  R   R A   A SSSS         V   22222

let invoiceControllerV2: InvoiceControllerV2 = new InvoiceControllerV2();

router.route('/invoice/v2')
    .post(invoiceControllerV2.postInvoice);

router.route('/invoice/v2/cancellation')
    .post(invoiceControllerV2.postInvoiceCancellation);

router.route('/invoice/v2/creditNote')
    .post(invoiceControllerV2.postCreditNoteV2);

router.route('/invoice/v2/status')
    .get(invoiceControllerV2.getInvoiceStatus);

router.route('/invoice/v2/relatedCFDIs')
    .get(invoiceControllerV2.getInvoiceRelatedCFDIs);

router.route('/invoice/v2/remove')
    .put(invoiceControllerV2.putRemoveInvoiceFromExistance);

router.route('/invoice/v2/auditStatus')
    .put(invoiceControllerV2.auditInvoicesStatus);

// PRUEBAS.
router.route('/invoices/v2/payment/invoices')
    .get(invoiceControllerV2.getInvoicesFromPaymentById);

router.route('/invoices/v2/receipt/invoice')
    .get(invoiceControllerV2.getInvoiceFromReceiptByFolio);

//M   M  OOO  N   N EEEEE DDDD   AAA   SSSS
//MM MM O   O NN  N E     D   D A   A S
//M M M O   O N N N EEE   D   D AAAAA  SSS
//M   M O   O N  NN E     D   D A   A     S
//M   M  OOO  N   N EEEEE DDDD  A   A SSSS

let currencyController: CurrencyController = new CurrencyController();

router.route('/catalogs/currencies')
    .get(currencyController.getCurrencies);

router.route('/catalogs/currency')
    .get(currencyController.getCurrency)
    .post(currencyController.postCurrency)
    .put(currencyController.putCurrency)
    .delete(currencyController.deleteCurrency);

// CCCC U   U EEEEE N   N TTTTT  AAA   SSSS      IIIII N   N TTTTT EEEEE RRRR  N   N  AAA   SSSS
//C     U   U E     NN  N   T   A   A S            I   NN  N   T   E     R   R NN  N A   A S
//C     U   U EEE   N N N   T   AAAAA  SSS         I   N N N   T   EEE   RRRR  N N N AAAAA  SSS
//C     U   U E     N  NN   T   A   A     S        I   N  NN   T   E     R   R N  NN A   A     S
// CCCC  UUU  EEEEE N   N   T   A   A SSSS       IIIII N   N   T   EEEEE R   R N   N A   A SSSS

let internalAccountController: InternalAccountController = new InternalAccountController();

router.route('/catalogs/internalAccounts')
    .get(internalAccountController.getInternalAccounts);

router.route('/catalogs/internalAccount')
    .get(internalAccountController.getInternalAccount)
    .post(internalAccountController.postInternalAccount)
    .put(internalAccountController.putInternalAccount)
    .delete(internalAccountController.deleteInternalAccount);


//BBBB   AAA  N   N  CCCC  OOO   SSSS
//B   B A   A NN  N C     O   O S
//BBBB  AAAAA N N N C     O   O  SSS
//B   B A   A N  NN C     O   O     S
//BBBB  A   A N   N  CCCC  OOO  SSSS

let bankController: BankController = new BankController();

router.route('/catalogs/banks')
    .get(bankController.getBanks);

router.route('/catalogs/bank')
    .get(bankController.getBank)
    .post(bankController.postBank)
    .put(bankController.putBank)
    .delete(bankController.deleteBank);


//PPPP  RRRR   OOO   CCCC EEEEE  SSSS  OOO   SSSS
//P   P R   R O   O C     E     S     O   O S
//PPPP  RRRR  O   O C     EEE    SSS  O   O  SSS
//P     R   R O   O C     E         S O   O     S
//P     R   R  OOO   CCCC EEEEE SSSS   OOO  SSSS

//BBBB   AAA  L      AAA  N   N  CCCC EEEEE
//B   B A   A L     A   A NN  N C     E
//BBBB  AAAAA L     AAAAA N N N C     EEE
//B   B A   A L     A   A N  NN C     E
//BBBB  A   A LLLLL A   A N   N  CCCC EEEEE

let balanceController: BalanceController = new BalanceController();

router.route('/processes/balance/client')
    .get(balanceController.getClientBalance);

router.route('/processes/balance/account')
    .get(balanceController.getAccountBalance);

router.route('/processes/balance/account/details')
    .get(balanceController.getAccountFullBalance);

router.route('/processes/balance/account/UGLYDetails')
    .get(balanceController.getAccountFullBalanceUGLY);

router.route('/processes/balance/account/REbuild')
    .put(balanceController.putREbuildBalance);

router.route('/processes/balance/account/REbuildAll')
    .put(balanceController.putREbuildAllBalances);

//PPPP   AAA   GGGG  OOO   SSSS
//P   P A   A G     O   O S
//PPPP  AAAAA G  GG O   O  SSS
//P     A   A G   G O   O     S
//P     A   A  GGGG  OOO  SSSS

router.route('/processes/payment/assignment')
    .post(paymentController.postPaymentAssignment);

router.route('/processes/payment/unassignment')
    .put(paymentController.putUnassignPayment);

router.route('/processes/payment/manualAssignment')
    .post(paymentController.postPaymentManualAssignment);

router.route('/processes/payment/stamp')
    .post(paymentController.postPaymentStamping);

//RRRR  EEEEE  CCCC IIIII BBBB   OOO   SSSS
//R   R E     C       I   B   B O   O S
//RRRR  EEE   C       I   BBBB  O   O  SSS
//R   R E     C       I   B   B O   O     S
//R   R EEEEE  CCCC IIIII BBBB   OOO  SSSS

let receiptProcessesController: ReceiptProcessesController = new ReceiptProcessesController();

router.route('/processes/receipts/updateStatus')
    .put(receiptProcessesController.putUpdateReceiptsStatus);

//RRRR  EEEEE PPPP   OOO  RRRR  TTTTT EEEEE  SSSS
//R   R E     P   P O   O R   R   T   E     S
//RRRR  EEE   PPPP  O   O RRRR    T   EEE    SSS
//R   R E     P     O   O R   R   T   E         S
//R   R EEEEE P      OOO  R   R   T   EEEEE SSSS

router.route('/reports/finance/collection')
    .get(paymentController.getCollectionReport);

router.route('/reports/finance/billing')
    .get(invoiceController.getBillingReport);

// OOO  PPPP  EEEEE N   N PPPP   AAA  Y   Y
//O   O P   P E     NN  N P   P A   A  Y Y
//O   O PPPP  EEE   N N N PPPP  AAAAA   Y
//O   O P     E     N  NN P     A   A   Y
// OOO  P     EEEEE N   N P     A   A  YYY

let openPayTransactionController: OpenPayTransactionController = new OpenPayTransactionController();

router.route('/openpay/transactions')
    .get(openPayTransactionController.getOpenPayTransactions);

router.route('/openpay/transaction')
    .get(openPayTransactionController.getOpenPayTransaction)
    .post(openPayTransactionController.postOpenPayTransaction)
    .put(openPayTransactionController.putOpenPayTransaction)
    .delete(openPayTransactionController.deleteOpenPayTransaction);

//DDDD  EEEEE  SSSS  CCCC U   U EEEEE N   N TTTTT  OOO   SSSS
//D   D E     S     C     U   U E     NN  N   T   O   O S
//D   D EEE    SSS  C     U   U EEE   N N N   T   O   O  SSS
//D   D E         S C     U   U E     N  NN   T   O   O     S
//DDDD  EEEEE SSSS   CCCC  UUU  EEEEE N   N   T    OOO  SSSS

let discountsController: DiscountsController = new DiscountsController();

router.route('/discounts')
    .get(discountsController.getDiscounts);

router.route('/discount')
    .get(discountsController.getDiscount)
    .post(discountsController.postDiscount)
    .put(discountsController.putDiscount)
    .delete(discountsController.deleteDiscount);
    
export default router;