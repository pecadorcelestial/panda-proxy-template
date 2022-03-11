import * as express from 'express';
import ProspectModel from '../models/prospects';

export class ProspectController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getProspect(request: express.Request, response: express.Response) {
        let model = new ProspectModel();
        model.getProspect(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getProspects(request: express.Request, response: express.Response) {
        let model = new ProspectModel();
        model.getProspects(request.query)
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

    public postProspect(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ProspectModel();
        model.postProspect(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data._id;
            next();
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

    public putProspect(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ProspectModel();
        model.putProspect(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data._id;
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

    public deleteProspect(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ProspectModel();
        model.deleteProspect(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data._id;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

}