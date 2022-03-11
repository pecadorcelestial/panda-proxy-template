import * as express from 'express';
import NineOneOneModel from '../models/911';

export class NineOneOneController {

    //PPPP   OOO   SSSS TTTTT
    //P   P O   O S       T
    //PPPP  O   O  SSS    T
    //P     O   O     S   T
    //P      OOO  SSSS    T

    public post911Call(request: express.Request, response: express.Response, next: express.NextFunction):void {
        let model = new NineOneOneModel();
        model.post911Call(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }
}