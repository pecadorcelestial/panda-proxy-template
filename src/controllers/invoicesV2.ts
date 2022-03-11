import * as express from 'express';
import InvoiceModelV2 from '../models/invoicesV2';
import idx from 'idx';
import { Receipt } from '../models/receipts';
import { Payment } from '../models/payments';
import { Invoice } from '../models/invoices';

export class InvoiceControllerV2 {

    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getInvoiceStatus(request: express.Request, response: express.Response) {
        let model = new InvoiceModelV2();
        model.getInvoiceStatus(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(error.status).end(JSON.stringify(error));
        });
    }
    
    public getInvoiceRelatedCFDIs(request: express.Request, response: express.Response) {
        let model = new InvoiceModelV2();
        model.getInvoiceRelatedCFDIsV3(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(error.status).end(JSON.stringify(error));
        });
    }

    // PRUEBAS.
    public getInvoicesFromPaymentById(request: express.Request, response: express.Response) {
        let model = new InvoiceModelV2();
        model.getInvoicesFromPaymentById(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(error.status).end(JSON.stringify(error));
        });
    }
    
    public getInvoiceFromReceiptByFolio(request: express.Request, response: express.Response) {
        let model = new InvoiceModelV2();
        model.getInvoiceFromReceiptByFolio(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(error.status).end(JSON.stringify(error));
        });
    }

    //PPPP   OOO   SSSS TTTTT
    //P   P O   O S       T
    //PPPP  O   O  SSS    T
    //P     O   O     S   T
    //P      OOO  SSSS    T

    public postInvoice(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new InvoiceModelV2();
        model.postInvoice(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data._id;
            next();
        })
        .catch((error: any) => {            
            response.status(error.status).end(JSON.stringify(error));
        });
    }

    public postCreditNote(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new InvoiceModelV2();
        model.postCreditNote(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data.data));
            if(typeof data.data._id === 'string' && data.data._id.length > 0) {
                request.resourceId = data.data._id;
                next();
            }
        })
        .catch((error: any) => {
            response.status(error.status).end(JSON.stringify(error));
        });
    }

    // NOTE: Esta versión acepta más de un sólo concepto.
    public postCreditNoteV2(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new InvoiceModelV2();
        model.postCreditNoteV2(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data.data));
            // if(typeof data.data._id === 'string' && data.data._id.length > 0) {
                request.resourceId = (idx(data, _ => _.data.parentId) || '').toString();
                request.resourceType = (idx(data, _ => _.data.parentType) || '').toString();
                let serie: string = (idx(data, _ => _.data.invoice.serie) || '').toString();
                let folio: string = (idx(data, _ => _.data.invoice.folio) || '').toString();
                request.documentId = `${serie}${folio}`;
                next();
            // }
        })
        .catch((error: any) => {
            response.status(error.status).end(JSON.stringify(error));
        });
    }

    public postInvoiceCancellation(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new InvoiceModelV2();
        model.postInvoiceCancellation(request.body)
        .then((data: { status: number, message: string, comments: string, invoice: Invoice, payment: Payment, receipt: Receipt, errors: Array<any>}) => {
            response.status(200).end(JSON.stringify(data));
            // NOTE: El identificador y el tipo del recurso padre no se pueden obtener de la factura, así que se revisa el pago o el recibo.
            request.resourceId = (idx(data, _ => _.payment.parentId) || idx(data, _ => _.receipt.parentId) || '').toString();
            request.resourceType = (idx(data, _ => _.payment.parentType) || idx(data, _ => _.receipt.parentType) || '').toString();
            request.documentId = `${data.invoice.serie}${data.invoice.folio}`;
            next();
        })
        .catch((error: any) => {
            response.status(error.status).end(JSON.stringify(error));
        });
    }

    //PPPP  U   U TTTTT
    //P   P U   U   T
    //PPPP  U   U   T
    //P     U   U   T
    //P      UUU    T

    public putRemoveInvoiceFromExistance(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new InvoiceModelV2();
        model.putRemoveInvoiceFromExistance(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data._id;
            next();
        })
        .catch((error: any) => {            
            response.status(error.status).end(JSON.stringify(error));
        });
    }

    //JJJJJ  OOO  BBBB   SSSS
    //  J   O   O B   B S
    //  J   O   O BBBB   SSS
    //J J   O   O B   B     S
    // J     OOO  BBBB  SSSS

    public auditInvoicesStatus(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new InvoiceModelV2();
        model.auditInvoicesStatus(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data._id;
            next();
        })
        .catch((error: any) => {            
            response.status(error.status).end(JSON.stringify(error));
        });
    }

}