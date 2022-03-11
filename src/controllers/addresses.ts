import * as express from 'express';
import AddressModel from '../models/addresses';

export class AddressController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getAddress(request: express.Request, response: express.Response) {
        let model = new AddressModel();
        model.getAddress(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getAddresses (request: express.Request, response: express.Response) {
        let model = new AddressModel();
        model.getAddresses(request.query)
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

    public postAddress(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new AddressModel();
        model.postAddress(request.body)
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

    public postAddresses(request: express.Request, response: express.Response) {
        console.log('[CONTROLADORES][DIRECCIONES][postAddresses]');
        // Pruebas.
        request.socket.setKeepAlive();
        // @ts-ignore        
        let file: Express.Multer.File = request.file;
        let model = new AddressModel();
        model.postAddresses(request.body, file)
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

    public putAddress(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new AddressModel();
        model.putAddress(request.body)
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

    public deleteAddress(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new AddressModel();
        model.deleteAddress(request.query)
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

}