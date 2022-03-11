import * as express from 'express';
import MovementModel from '../models/inventory';

export class MovementController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getMovement(request: express.Request, response: express.Response) {
        let model = new MovementModel();
        model.getMovement(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getMovements (request: express.Request, response: express.Response) {
        let model = new MovementModel();
        model.getMovements(request.query)
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

    public postMovement(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new MovementModel();
        model.postMovement(request.body)
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

    //PPPP  U   U TTTTT
    //P   P U   U   T
    //PPPP  U   U   T
    //P     U   U   T
    //P      UUU    T

    public putMovement(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new MovementModel();
        model.putMovement(request.body)
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

    public deleteMovement(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new MovementModel();
        model.deleteMovement(request.query)
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