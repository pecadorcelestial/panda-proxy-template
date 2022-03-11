import * as express from 'express';
import InvoiceModel from '../models/invoices';

export class InvoiceController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getInvoice(request: express.Request, response: express.Response) {
        let model = new InvoiceModel();
        model.getInvoice(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getInvoices(request: express.Request, response: express.Response) {
        let model = new InvoiceModel();
        model.getInvoices(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getPDFFromInvoice(request: express.Request, response: express.Response) {
        let model = new InvoiceModel();
        model.getPDFFromInvoice(request.query)
        .then((data: any) => {
            /*
            // let pdfFromText: string = `data:application/pdf;base64,${data.pdf}`;
            response.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-disposition': 'attachment;filename=recibo.pdf',
                // 'Content-Length': data.pdf.length
            });
            response.end(Buffer.from(data.pdf, 'base64'));
            */
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    //PPPP   OOO   SSSS TTTTT
    //P   P O   O S       T
    //PPPP  O   O  SSS    T
    //P     O   O     S   T
    //P      OOO  SSSS    T

    public postInvoice(request: express.Request, response: express.Response, next: express.NextFunction) {
        // let xml: Express.Multer.File = (request.files && request.files['xml']) ? request.files['xml'][0] : undefined;
        // let pdf: Express.Multer.File = (request.files && request.files['pdf']) ? request.files['pdf'][0] : undefined;
        let model = new InvoiceModel();
        model.postInvoice(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data._id;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postInvoices(request: express.Request, response: express.Response) {
        // @ts-ignore        
        let file: Express.Multer.File = request.file;
        let model = new InvoiceModel();
        model.postInvoices(request.body, file)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    //PPPP  U   U TTTTT
    //P   P U   U   T
    //PPPP  U   U   T
    //P     U   U   T
    //P      UUU    T

    public putInvoice(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new InvoiceModel();
        model.putInvoice(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data._id;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public putInvoiceGetJSON(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new InvoiceModel();
        model.putInvoiceGetJSON(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data._id;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public updateInvoiceDate(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new InvoiceModel();
        model.updateInvoiceDate(request, response);
    }

    //DDDD  EEEEE L     EEEEE TTTTT EEEEE
    //D   D E     L     E       T   E
    //D   D EEE   L     EEE     T   EEE
    //D   D E     L     E       T   E
    //DDDD  EEEEE LLLLL EEEEE   T   EEEEE

    public deleteInvoice(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new InvoiceModel();
        model.deleteInvoice(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.data._id;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    //RRRR  EEEEE PPPP   OOO  RRRR  TTTTT EEEEE  SSSS
    //R   R E     P   P O   O R   R   T   E     S
    //RRRR  EEE   PPPP  O   O RRRR    T   EEE    SSS
    //R   R E     P     O   O R   R   T   E         S
    //R   R EEEEE P      OOO  R   R   T   EEEEE SSSS

    public getTotalInvoices(request: express.Request, response: express.Response) {
        let model = new InvoiceModel();
        model.getTotalInvoices(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }
    
    public getBillingReport(request: express.Request, response: express.Response) {
        let model = new InvoiceModel();
        model.getBillingReport(request, response);
    }

}