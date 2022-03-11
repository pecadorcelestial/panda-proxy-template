import * as express from 'express';
import ODXModel from '../models/odxs';

export class ODXController {

    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getODXS(request: express.Request, response: express.Response) {
        let model = new ODXModel();
        model.getODXS(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error))
        })
    }

    public getODX(request: express.Request, response: express.Response) {
        let model = new ODXModel();
        model.getODX(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getEvidence(request: express.Request, response: express.Response) {
        let model = new ODXModel();
        model.getEvidence(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getChargeDetails(request: express.Request, response: express.Response) {
        let model = new ODXModel();
        model.getChargeDetails(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getPDFromODX(request: express.Request, response: express.Response) {
        let model = new ODXModel();
        model.getPDFromODX(request.query)
        .then((data: any) => {
            // let pdfFromText: string = `data:application/pdf;base64,${data.pdf}`;
            response.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-disposition': 'attachment;filename=odx.pdf',
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

    public postODX(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ODXModel();
        model.postODX(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.folio;
            next();
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postODXs(request: express.Request, response: express.Response): void {
        // @ts-ignore        
        let file: Express.Multer.File = request.file;
        let model = new ODXModel();
        model.postODXs(request.body, file)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postODXApproval(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ODXModel();
        model.postODXApproval(request.body, request.user)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.account.accountNumber;
            request.documentId = data.folio;
            next();
        })
        .catch((error: any) =>{
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postODXReceipt(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ODXModel();
        model.postODXReceipt(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.folio;
            next();
        })
        .catch((error: any) =>{
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postEvidence(request: express.Request, response: express.Response, next: express.NextFunction) {
        // @ts-ignore        
        let file: Express.Multer.File = request.file;
        let model = new ODXModel();
        model.postEvidence(request.body, file)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data._id;
            next();
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postChargeDetail(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ODXModel();
        model.postChargeDetail(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data._id;
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

    public putODX(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ODXModel();
        model.putODX(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.folio;
            next();
        })
        .catch((error: any) =>{
            response.status(400).end(JSON.stringify(error));
        });
    }

    public putEvidence(request: express.Request, response: express.Response, next: express.NextFunction) {
        // @ts-ignore        
        let file: Express.Multer.File = request.file;
        let model = new ODXModel();
        model.putEvidence(request.body, file)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data._id;
            next();
        })
        .catch((error: any) =>{
            response.status(400).end(JSON.stringify(error));
        });
    }

    public putChargeDetail(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ODXModel();
        model.putChargeDetail(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data._id;
            next();
        })
        .catch((error: any) =>{
            response.status(400).end(JSON.stringify(error));
        });
    }

    //DDDD  EEEEE L     EEEEE TTTTT EEEEE
    //D   D E     L     E       T   E
    //D   D EEE   L     EEE     T   EEE
    //D   D E     L     E       T   E
    //DDDD  EEEEE LLLLL EEEEE   T   EEEEE

    public deleteODX(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ODXModel();
        model.deleteODX(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.folio;
            next();
        })
        .catch((error: any) =>{
            response.status(400).end(JSON.stringify(error));
        })
    }

    public deleteEvidence(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ODXModel();
        model.deleteEvidence(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.data._id;
            next();
        })
        .catch((error: any) =>{
            response.status(400).end(JSON.stringify(error));
        })
    }

    public deleteChargeDetail(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ODXModel();
        model.deleteChargeDetail(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.data._id;
            next();
        })
        .catch((error: any) =>{
            response.status(400).end(JSON.stringify(error));
        })
    }
}