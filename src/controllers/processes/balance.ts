import * as express from 'express';
import BalanceModel from '../../models/processes/balance';

export class BalanceController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getClientBalance(request: express.Request, response: express.Response) {
        let model = new BalanceModel();
        model.getClientBalance(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getAccountBalance(request: express.Request, response: express.Response) {
        let model = new BalanceModel();
        model.getAccountBalance(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getAccountFullBalance(request: express.Request, response: express.Response) {
        let model = new BalanceModel();
        model.getAccountFullBalance(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getAccountFullBalanceUGLY(request: express.Request, response: express.Response) {
        let model = new BalanceModel();
        model.getAccountFullBalanceUGLY(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    //PPPP  U   U TTTTT
    //P   P U   U   T
    //PPPP  U   U   T
    //P     U   U   T
    //P      UUU    T

    public putREbuildBalance(request: express.Request, response: express.Response) {
        let model = new BalanceModel();
        model.putREbuildBalance(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public putREbuildAllBalances(request: express.Request, response: express.Response) {
        let model = new BalanceModel();
        model.putREbuildAllBalances(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }
}