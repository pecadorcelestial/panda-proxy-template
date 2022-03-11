import * as express from 'express';
import ZendeskModel from '../models/zendesk';

export class ZendeskController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getClient(request: express.Request, response: express.Response) {
        let model = new ZendeskModel();
        model.getClient(request.query)
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

    public postClient(request: express.Request, response: express.Response) {
        let model = new ZendeskModel();
        model.postClient(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postTicket(request: express.Request, response: express.Response) {
        let model = new ZendeskModel();
        model.postTicket(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }
    
    public postContact(request: express.Request, response: express.Response) {
        let model = new ZendeskModel();
        model.postContact(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }
    
    
    public postZendeskWebhook(request: express.Request, response: express.Response) {
        let model = new ZendeskModel();
        model.postZendeskWebhook(request.body)
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
    
    public deleteClient(request: express.Request, response: express.Response) {
        let model = new ZendeskModel();
        model.deleteClient(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }
    
    public deleteTicket(request: express.Request, response: express.Response) {
        let model = new ZendeskModel();
        model.deleteTicket(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

}