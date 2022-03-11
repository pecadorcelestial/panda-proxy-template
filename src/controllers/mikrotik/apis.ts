import * as express from 'express';
import MikrotikAPIsModel from '../../models/mikrotik/apis';

export class MikrotikAPIsController {
    
    //U   U  SSSS U   U  AAA  RRRR  IIIII  OOO   SSSS
    //U   U S     U   U A   A R   R   I   O   O S
    //U   U  SSS  U   U AAAAA RRRR    I   O   O  SSS
    //U   U     S U   U A   A R   R   I   O   O     S
    // UUU  SSSS   UUU  A   A R   R IIIII  OOO  SSSS

    public getUsers = (request: express.Request, response: express.Response): void => {
        let model = new MikrotikAPIsModel();
        model.getUsers(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getUser = (request: express.Request, response: express.Response): void => {
        let model = new MikrotikAPIsModel();
        model.getUser(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postUser = (request: express.Request, response: express.Response): void => {
        let model = new MikrotikAPIsModel();
        model.postUser(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public putUser = (request: express.Request, response: express.Response): void => {
        let model = new MikrotikAPIsModel();
        model.putUser(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    //PPPP  EEEEE RRRR  FFFFF IIIII L     EEEEE  SSSS
    //P   P E     R   R F       I   L     E     S
    //PPPP  EEE   RRRR  FFF     I   L     EEE    SSS
    //P     E     R   R F       I   L     E         S
    //P     EEEEE R   R F     IIIII LLLLL EEEEE SSSS

    public getProfiles = (request: express.Request, response: express.Response): void => {
        let model = new MikrotikAPIsModel();
        model.getProfiles(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postProfile = (request: express.Request, response: express.Response): void => {
        let model = new MikrotikAPIsModel();
        model.postProfile(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

}