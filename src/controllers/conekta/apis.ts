import * as express from 'express';
import ConektaModel from '../../models/conekta/apis';

export class ConektaController {
    
    //PPPP   OOO   SSSS TTTTT
    //P   P O   O S       T
    //PPPP  O   O  SSS    T
    //P     O   O     S   T
    //P      OOO  SSSS    T

    public postRetailerOrder(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ConektaModel();
        model.postRetailerOrder(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }
    
    //W   W EEEEE BBBB  H   H  OOO   OOO  K   K
    //W   W E     B   B H   H O   O O   O K  K
    //W W W EEE   BBBB  HHHHH O   O O   O KKK
    //WW WW E     B   B H   H O   O O   O K  K
    //W   W EEEEE BBBB  H   H  OOO   OOO  K   K

    public postConektaWebhook(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ConektaModel();
        model.postConektaWebhook(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getBarcode(request: express.Request, response: express.Response) {
        let model = new ConektaModel();
        model.getBarcode(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

}