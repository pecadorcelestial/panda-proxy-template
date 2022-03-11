import * as express from 'express';
import AccountModel from '../models/accounts';

export class AccountController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getAccount(request: express.Request, response: express.Response):void {
        let model = new AccountModel();
        model.getAccount(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getAccounts(request: express.Request, response: express.Response):void {
        let model = new AccountModel();
        model.getAccounts(request.query)
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

    public postAccount(request: express.Request, response: express.Response, next: express.NextFunction):void {
        let model = new AccountModel();
        model.postAccount(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.accountNumber;
            next();
        })
        .catch((error: any) => {
            // console.log('[ERROR][CUENTA]: ', JSON.stringify(error));
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postAccounts(request: express.Request, response: express.Response): void {
        // @ts-ignore        
        let file: Express.Multer.File = request.file;
        let model = new AccountModel();
        model.postAccounts(request.body, file)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }
    
    public postContract(request: express.Request, response: express.Response, next: express.NextFunction):void {
        let model = new AccountModel();
        model.postContract(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.accountNumber;
            next();
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public createAccountContract(request: express.Request, response: express.Response) {
        let model = new AccountModel();
        model.createAccountContract(request.body)
        .then((data: any) => {
            response.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-disposition': 'attachment;filename=mobilecontract.pdf',
                // 'Content-Length': data.pdf.length
            });
            response.end(Buffer.from(data.pdf, 'base64'));        
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

    public putAccount(request: express.Request, response: express.Response, next: express.NextFunction):void {
        let model = new AccountModel();
        model.putAccount(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.accountNumber;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public putAccountReferencesAutomatically(request: express.Request, response: express.Response, next: express.NextFunction):void {
        let model = new AccountModel();
        model.putAccountReferencesAutomatically(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.accountNumber;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    // TODO: Eliminar.
    public putAccountReferencesBatch(request: express.Request, response: express.Response, next: express.NextFunction):void {
        // @ts-ignore        
        let file: Express.Multer.File = request.file;
        let model = new AccountModel();
        model.putAccountReferencesBatch(request.body, file)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.accountNumber;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    // TODO: Eliminar.
    public putAccountFixReferences(request: express.Request, response: express.Response, next: express.NextFunction):void {
        let model = new AccountModel();
        model.putAccountFixReferences(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.accountNumber;
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

    public deleteAccount(request: express.Request, response: express.Response, next: express.NextFunction):void {
        let model = new AccountModel();
        model.deleteAccount(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.accountNumber;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    //RRRR  EEEEE  CCCC IIIII BBBB   OOO
    //R   R E     C       I   B   B O   O
    //RRRR  EEE   C       I   BBBB  O   O
    //R   R E     C       I   B   B O   O
    //R   R EEEEE  CCCC IIIII BBBB   OOO

    public getAccountReceipt(request: express.Request, response: express.Response):void {
        let model = new AccountModel();
        model.getAccountReceipt(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    // AAA  L     TTTTT  AAA  N   N
    //A   A L       T   A   A NN  N
    //AAAAA L       T   AAAAA N N N
    //A   A L       T   A   A N  NN
    //A   A LLLLL   T   A   A N   N

    public activateAllComplements(request: express.Request, response: express.Response):void {
        let model = new AccountModel();
        model.activateAllComplements(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public activateComplements(request: express.Request, response: express.Response):void {
        let model = new AccountModel();
        model.activateComplements(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }
}