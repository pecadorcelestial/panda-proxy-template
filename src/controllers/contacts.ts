import * as express from 'express';
import ContactModel from '../models/contacts';

export class ContactController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getContact(request: express.Request, response: express.Response) {
        let model = new ContactModel();
        model.getContact(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getContacts (request: express.Request, response: express.Response) {
        let model = new ContactModel();
        model.getContacts(request.query)
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

    public postContact(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ContactModel();
        model.postContact(request.body)
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

    public postContacts(request: express.Request, response: express.Response) {
        let file: Express.Multer.File = request.file;
        let model = new ContactModel();
        model.postContacts(request.body, file)
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

    public putContact(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ContactModel();
        model.putContact(request.body)
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

    public deleteContact(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ContactModel();
        model.deleteContact(request.query)
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