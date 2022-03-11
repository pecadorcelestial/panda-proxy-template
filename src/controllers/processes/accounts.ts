import * as express from 'express';
import AccountProcessesModel from '../../models/processes/accounts';

export class AccountProcessesController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T
    
    public getAccountDebit(request: express.Request, response: express.Response) {
        let model = new AccountProcessesModel();
        model.getAccountDebit(request.query)
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

    // DELETE:
    public postAllAccountsReceipts(request: express.Request, response: express.Response) {
        let model = new AccountProcessesModel();
        model.postAllAccountsReceipts(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    // DELETE:
    public sendAllAccountsOpenPayFormats(request: express.Request, response: express.Response) {
        let model = new AccountProcessesModel();
        model.sendAllAccountsOpenPayFormats(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    //EEEEE M   M  AAA  IIIII L
    //E     MM MM A   A   I   L
    //EEE   M M M AAAAA   I   L
    //E     M   M A   A   I   L
    //EEEEE M   M A   A IIIII LLLLL

    public sendReferences(request: express.Request, response: express.Response) {
        let model = new AccountProcessesModel();
        model.sendReferences(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public sendPastDueBalance(request: express.Request, response: express.Response) {
        let model = new AccountProcessesModel();
        model.sendPastDueBalance(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public sendClose2DueDate(request: express.Request, response: express.Response) {
        let model = new AccountProcessesModel();
        model.sendClose2DueDate(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public sendPleaseReference(request: express.Request, response: express.Response) {
        let model = new AccountProcessesModel();
        model.sendPleaseReference(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public sendEmail(request: express.Request, response: express.Response) {
        let model = new AccountProcessesModel();
        model.sendEmail(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public sendBalance(request: express.Request, response: express.Response) {
        let model = new AccountProcessesModel();
        model.sendBalance(request.body)
        .then((data: any) => {
            let send: boolean = request.body.send;
            send = (typeof send === 'boolean') ? send : true;
            if(send) {
                response.status(200).end(JSON.stringify(data));
            } else {
                response.writeHead(200, {
                    'Content-Type': 'application/pdf',
                    'Content-disposition': 'attachment;filename=EstadoDeCuenta.pdf',
                });
                response.end(Buffer.from(data.pdf, 'base64'));
            }
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    // SSSS EEEEE RRRR  V   V IIIII  CCCC IIIII  OOO   SSSS
    //S     E     R   R V   V   I   C       I   O   O S
    // SSS  EEE   RRRR  V   V   I   C       I   O   O  SSS
    //    S E     R   R  V V    I   C       I   O   O     S
    //SSSS  EEEEE R   R   V   IIIII  CCCC IIIII  OOO  SSSS

    public suspendMobilityService(request: express.Request, response: express.Response) {
        let model = new AccountProcessesModel();
        model.suspendMobilityService(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

}