import * as express from 'express';
import CDRModel from '../models/cdr';

export class CDRController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getCDR(request: express.Request, response: express.Response):void {
        let model = new CDRModel();
        model.getCDR(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getCDRs(request: express.Request, response: express.Response):void {
        let model = new CDRModel();
        model.getCDRs(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

}