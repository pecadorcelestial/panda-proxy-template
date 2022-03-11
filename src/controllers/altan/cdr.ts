import * as express from 'express';
import AltanCDRModel from '../../models/altan/cdr';

export class AltanCDRController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getAltanCDR(request: express.Request, response: express.Response) {
        let model = new AltanCDRModel();
        model.getAltanCDR(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }
}