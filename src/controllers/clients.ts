import * as express from 'express';
import ClientModel from '../models/clients';

export class ClientController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getClient(request: express.Request, response: express.Response) {
        let model = new ClientModel();
        model.getClient(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getClients(request: express.Request, response: express.Response) {
        let model = new ClientModel();
        model.getClients(request.query)
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

    public postClient(request: express.Request, response: express.Response, next: express.NextFunction) {
        // @ts-ignore        
        let files: Express.Multer.File[] = request.files;
        let model = new ClientModel();
        model.postClient(request.body, files)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.folio;
            next();
        })
        .catch((error: any) => {
            // console.log('[ERROR][CLIENTE]: ', JSON.stringify(error));
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postFiles(request: express.Request, response: express.Response, next: express.NextFunction) {
        let { folio } = request.body;
        // @ts-ignore        
        let files: Express.Multer.File[] = request.files;
        let model = new ClientModel();
        model.postFiles(folio, files)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            // console.log('[ERROR][CLIENTE][ARCHIVOS]: ', JSON.stringify(error));
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postClients(request: express.Request, response: express.Response) {
        // @ts-ignore        
        let file: Express.Multer.File = request.file;
        let model = new ClientModel();
        model.postClients(request.body, file)
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

    public putClient(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ClientModel();
        model.putClient(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.folio;
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

    public deleteClient(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ClientModel();
        model.deleteClient(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.folio;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public deleteFiles(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ClientModel();
        model.deleteFiles(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

}