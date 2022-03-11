import * as express from 'express';
import PaymentModel from '../models/payments';

export class PaymentController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getPayment(request: express.Request, response: express.Response) {
        let model = new PaymentModel();
        model.getPayment(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getPayments (request: express.Request, response: express.Response) {
        let model = new PaymentModel();
        model.getPayments(request.query)
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

    public postPayment(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new PaymentModel();
        model.postPayment(request.body)
        .then((data: any) => {
            response.status(data.status).end(JSON.stringify(data.data));
            request.resourceId = data.parentId;
            request.resourceType = data.parentType;
            next();
        })
        .catch((error: any) => {
            response.status(error.status).end(JSON.stringify(error));
        });
    }

    public postPayments(request: express.Request, response: express.Response) {
        // @ts-ignore        
        let file: Express.Multer.File = request.file;
        let model = new PaymentModel();
        model.postPayments(request.body, file)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }
    
    public postPaymentWebhook(request: express.Request, response: express.Response, next: express.NextFunction) {
        // console.log(request.params);
        let model = new PaymentModel();
        request.body.accountNumber = request.params.accountNumber;
        model.postPaymentWebhook(request.body)
        .then((data: any) => {
            response.status(data.status).end(JSON.stringify(data));
            // request.resourceId = data.parentId;
            // request.resourceType = data.parentType;
            // next();
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

    public putPayment(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new PaymentModel();
        model.putPayment(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.parentId;
            request.resourceType = data.parentType;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public putUnassignPayment(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new PaymentModel();
        model.putUnassignPayment(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.parentId;
            request.resourceType = data.parentType;
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

    public deletePayment(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new PaymentModel();
        model.deletePayment(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.data.parentId;
            request.resourceType = data.data.parentType;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    //PPPP  RRRR   OOO   CCCC EEEEE  SSSS  OOO   SSSS
    //P   P R   R O   O C     E     S     O   O S
    //PPPP  RRRR  O   O C     EEE    SSS  O   O  SSS
    //P     R   R O   O C     E         S O   O     S
    //P     R   R  OOO   CCCC EEEEE SSSS   OOO  SSSS

    public postPaymentAssignment(request: express.Request, response: express.Response) {
        let model = new PaymentModel();
        model.postPaymentAssignment(request.body)
        .then((data: any) => {
            response.status(data.status).end(JSON.stringify(data.data));
        })
        .catch((error: any) => {            
            response.status(error.status).end(JSON.stringify(error));
        });
    }

    public postPaymentManualAssignment(request: express.Request, response: express.Response) {
        let model = new PaymentModel();
        model.postPaymentManualAssignment(request.body)
        .then((data: any) => {
            response.status(data.status).end(JSON.stringify(data.data));
        })
        .catch((error: any) => {            
            response.status(error.status).end(JSON.stringify(error));
        });
    }

    public postPaymentStamping(request: express.Request, response: express.Response) {
        let model = new PaymentModel();
        model.postPaymentStampingV2(request.body)
        .then((data: any) => {
            response.status(data.status).end(JSON.stringify(data.data));
        })
        .catch((error: any) => {            
            response.status(error.status).end(JSON.stringify(error));
        });
    }

    public postPaymentInvoicesCancellation(request: express.Request, response: express.Response) {
        let model = new PaymentModel();
        model.postPaymentInvoicesCancellation(request.body)
        .then((data: any) => {
            response.status(data.status).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(error.status).end(JSON.stringify(error));
        });
    }

    //TTTTT  OOO  TTTTT  AAA  L     EEEEE  SSSS
    //  T   O   O   T   A   A L     E     S
    //  T   O   O   T   AAAAA L     EEE    SSS
    //  T   O   O   T   A   A L     E         S
    //  T    OOO    T   A   A LLLLL EEEEE SSSS

    public getPaymentsTotal(request: express.Request, response: express.Response) {
        let model = new PaymentModel();
        model.getPaymentsTotal(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getPayments4ReceiptTotal(request: express.Request, response: express.Response) {
        let model = new PaymentModel();
        model.getPayments4ReceiptTotal(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getPayments4ReceiptsTotal(request: express.Request, response: express.Response) {
        let model = new PaymentModel();
        model.getPayments4ReceiptsTotal(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }
    
    //RRRR  EEEEE PPPP   OOO  RRRR  TTTTT EEEEE  SSSS
    //R   R E     P   P O   O R   R   T   E     S
    //RRRR  EEE   PPPP  O   O RRRR    T   EEE    SSS
    //R   R E     P     O   O R   R   T   E         S
    //R   R EEEEE P      OOO  R   R   T   EEEEE SSSS

    public getCollectionReport(request: express.Request, response: express.Response) {
        let model = new PaymentModel();
        model.getCollectionReport(request, response);
    }

}