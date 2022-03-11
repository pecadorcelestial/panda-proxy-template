import * as express from 'express';
import ReceiptProcessesModel from '../../models/processes/receipts';

export class ReceiptProcessesController {
    
    //PPPP  U   U TTTTT
    //P   P U   U   T
    //PPPP  U   U   T
    //P     U   U   T
    //P      UUU    T

    public putUpdateReceiptsStatus(request: express.Request, response: express.Response) {
        let model = new ReceiptProcessesModel();
        model.putUpdateReceiptsStatus(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }
}