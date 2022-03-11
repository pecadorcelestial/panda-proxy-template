import * as express from 'express';
import { EmailModel, SMSModel } from '../models/notifications';

//EEEEE M   M  AAA  IIIII L
//E     MM MM A   A   I   L
//EEE   M M M AAAAA   I   L
//E     M   M A   A   I   L
//EEEEE M   M A   A IIIII LLLLL

export class EmailController {
    
    //PPPP   OOO   SSSS TTTTT
    //P   P O   O S       T
    //PPPP  O   O  SSS    T
    //P     O   O     S   T
    //P      OOO  SSSS    T

    public postEmail(request: express.Request, response: express.Response) {
        let model = new EmailModel();
        model.postEmail(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

}

// SSSS M   M  SSSS
//S     MM MM S
// SSS  M M M  SSS
//    S M   M     S
//SSSS  M   M SSSS

export class SMSController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getSMS(request: express.Request, response: express.Response) {
        let model = new SMSModel();
        model.getSMS(request.query)
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

    public postSMS(request: express.Request, response: express.Response) {
        let model = new SMSModel();
        model.postSMS(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

}
