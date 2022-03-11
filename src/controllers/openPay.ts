import * as express from 'express';
import OpenPayModel, { OpenPayTransactionModel } from '../models/openPay';

// OOO  PPPP  EEEEE N   N PPPP   AAA  Y   Y
//O   O P   P E     NN  N P   P A   A  Y Y
//O   O PPPP  EEE   N N N PPPP  AAAAA   Y
//O   O P     E     N  NN P     A   A   Y
// OOO  P     EEEEE N   N P     A   A  YYY

export class OpenPayController {
    
    //PPPP   OOO   SSSS TTTTT
    //P   P O   O S       T
    //PPPP  O   O  SSS    T
    //P     O   O     S   T
    //P      OOO  SSSS    T

    public postNDownloadStoreCharge(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new OpenPayModel();
        model.postNDownloadStoreCharge(request, response);
    }

    public postOpenPayWebhook(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new OpenPayModel();
        model.postOpenPayWebhook(request.body)
        .then((data: any) => {
            response.status(data.status).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(error.status).end(JSON.stringify(error));
        });
    }
    
}

//TTTTT RRRR   AAA  N   N  SSSS  AAA   CCCC  CCCC IIIII  OOO  N   N
//  T   R   R A   A NN  N S     A   A C     C       I   O   O NN  N
//  T   RRRR  AAAAA N N N  SSS  AAAAA C     C       I   O   O N N N
//  T   R   R A   A N  NN     S A   A C     C       I   O   O N  NN
//  T   R   R A   A N   N SSSS  A   A  CCCC  CCCC IIIII  OOO  N   N

export class OpenPayTransactionController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getOpenPayTransaction(request: express.Request, response: express.Response) {
        let model = new OpenPayTransactionModel();
        model.getOpenPayTransaction(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getOpenPayTransactions (request: express.Request, response: express.Response) {
        let model = new OpenPayTransactionModel();
        model.getOpenPayTransactions(request.query)
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

    public postOpenPayTransaction(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new OpenPayTransactionModel();
        model.postOpenPayTransaction(request.body)
        .then((data: any) => {
            response.status(data.status).end(JSON.stringify(data.data));
            request.resourceId = data.order_id;
            request.resourceType = 'openpay';
            next();
        })
        .catch((error: any) => {
            response.status(error.status).end(JSON.stringify(error));
        });
    }

    //PPPP  U   U TTTTT
    //P   P U   U   T
    //PPPP  U   U   T
    //P     U   U   T
    //P      UUU    T

    public putOpenPayTransaction(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new OpenPayTransactionModel();
        model.putOpenPayTransaction(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.order_id;
            request.resourceType = 'openpay';
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

    public deleteOpenPayTransaction(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new OpenPayTransactionModel();
        model.deleteOpenPayTransaction(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.data.order_id;
            request.resourceType = 'openpay';
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }
}