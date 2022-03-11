import * as express from 'express';
import ReceiptModel from '../models/receipts';

export class ReceiptController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getReceipt(request: express.Request, response: express.Response) {
        let model = new ReceiptModel();
        model.getReceipt(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getReceipts (request: express.Request, response: express.Response) {
        let model = new ReceiptModel();
        model.getReceipts(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getPDFFromReceipt(request: express.Request, response: express.Response) {
        let model = new ReceiptModel();
        model.getPDFFromReceipt(request.query)
        .then((data: any) => {
            // let pdfFromText: string = `data:application/pdf;base64,${data.pdf}`;
            response.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-disposition': 'attachment;filename=recibo.pdf',
                // 'Content-Length': data.pdf.length
            });
            response.end(Buffer.from(data.pdf, 'base64'));
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

    public postReceipt(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ReceiptModel();
        model.postReceipt(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.parentId;
            request.resourceType = data.parentType;
            next();
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public rePostReceipt(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ReceiptModel();
        model.rePostReceipt(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.parentId;
            request.resourceType = data.parentType;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postReceipts(request: express.Request, response: express.Response) {
        // @ts-ignore        
        let file: Express.Multer.File = request.file;
        let model = new ReceiptModel();
        model.postReceipts(request.body, file)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postVerySpecificSIMShippingChargeReceipt(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ReceiptModel();
        model.postVerySpecificSIMShippingChargeReceipt(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.parentId;
            request.resourceType = data.parentType;
            next();
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

    public putReceipt(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ReceiptModel();
        model.putReceipt(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.parentId;
            request.resourceType = data.parentType;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    // DELETE:
    public putReceiptErrors(request: express.Request, response: express.Response) {
        let model = new ReceiptModel();
        model.putReceiptErrors(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    // DELETE:
    public putReceiptDecimals(request: express.Request, response: express.Response) {
        let model = new ReceiptModel();
        model.putReceiptDecimals(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    // DELETE:
    public putFixItems(request: express.Request, response: express.Response) {
        let model = new ReceiptModel();
        model.putFixItems(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    // DELETE:
    public putEraseDiscounts(request: express.Request, response: express.Response) {
        let model = new ReceiptModel();
        model.putEraseDiscounts(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    //DDDD  EEEEE L     EEEEE TTTTT EEEEE
    //D   D E     L     E       T   E
    //D   D EEE   L     EEE     T   EEE
    //D   D E     L     E       T   E
    //DDDD  EEEEE LLLLL EEEEE   T   EEEEE

    public deleteReceipt(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ReceiptModel();
        model.deleteReceipt(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.data.parentId;
            request.resourceType = data.data.parentType;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    //PPPP  RRRR   OOO   CCCC EEEEE  SSSS  OOO   SSSS
    //P   P R   R O   O C     E     S     O   O S
    //PPPP  RRRR  O   O C     EEE    SSS  O   O  SSS
    //P     R   R O   O C     E         S O   O     S
    //P     R   R  OOO   CCCC EEEEE SSSS   OOO  SSSS

    public getPendingReceipts(request: express.Request, response: express.Response) {
        let model = new ReceiptModel();
        model.getPendingReceipts(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getPendingReceiptsV2(request: express.Request, response: express.Response) {
        let model = new ReceiptModel();
        model.getPendingReceiptsV2(request, response);
    }

    public getReceiptDetails(request: express.Request, response: express.Response) {
        let model = new ReceiptModel();
        model.getReceiptDetails(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    //TTTTT  OOO  TTTTT  AAA  L     EEEEE  SSSS
    //  T   O   O   T   A   A L     E     S
    //  T   O   O   T   AAAAA L     EEE    SSS
    //  T   O   O   T   A   A L     E         S
    //  T    OOO    T   A   A LLLLL EEEEE SSSS

    public getReceiptsTotal(request: express.Request, response: express.Response) {
        let model = new ReceiptModel();
        model.getReceiptsTotal(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }
}