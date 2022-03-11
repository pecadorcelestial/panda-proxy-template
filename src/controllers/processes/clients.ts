import * as express from 'express';
import ClientProcessesModel from '../../models/processes/clients';

export class ClientProcessesController {
    
    //PPPP   OOO   SSSS TTTTT
    //P   P O   O S       T
    //PPPP  O   O  SSS    T
    //P     O   O     S   T
    //P      OOO  SSSS    T

    public sendEmail(request: express.Request, response: express.Response) {
        let model = new ClientProcessesModel();
        model.sendEmail(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public sendAdvertising(request: express.Request, response: express.Response) {
        let model = new ClientProcessesModel();
        model.sendAdvertising(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

}