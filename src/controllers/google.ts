import * as express from 'express';
import GoogleModel from '../models/google';

export class GoogleController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getAddressFromCoordinates(request: express.Request, response: express.Response) {
        let model = new GoogleModel();
        model.getAddressFromCoordinates(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

}