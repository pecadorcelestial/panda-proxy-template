import * as express from 'express';
import { QuotationModel } from '../models/quotations';

export class QuotationController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getQuotation(request: express.Request, response: express.Response) {
        let model = new QuotationModel();
        model.getQuotation(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getQuotations(request: express.Request, response: express.Response) {
        let model = new QuotationModel();
        model.getQuotations(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getItems(request: express.Request, response: express.Response) {
        let model = new QuotationModel();
        model.getItems(request.query)
        .then((data: any) => {
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

    public postQuotation(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new QuotationModel();
        model.postQuotation(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data._id;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postItem(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new QuotationModel();
        model.postItem(request.body)
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

    public putQuotation(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new QuotationModel();
        model.putQuotation(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data._id;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public putItem(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new QuotationModel();
        model.putItem(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data._id;
            next();
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

    public deleteQuotation(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new QuotationModel();
        model.deleteQuotation(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.data._id;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public deleteItem(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new QuotationModel();
        model.deleteItem(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.data._id;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

}