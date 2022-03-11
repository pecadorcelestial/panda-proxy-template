import * as express from 'express';
import ProspectStatusModel from '../../models/catalogs/prospectStatuses';

export class ProspectStatusController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getProspectStatus(request: express.Request, response: express.Response) {
        let model = new ProspectStatusModel();
        model.getProspectStatus(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getProspectStatuses(request: express.Request, response: express.Response) {
        let model = new ProspectStatusModel();
        model.getProspectStatuses(request.query)
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

    public postProspectStatus(request: express.Request, response: express.Response) {
        let model = new ProspectStatusModel();
        model.postProspectStatus(request.body)
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

    public putProspectStatus(request: express.Request, response: express.Response) {
        let model = new ProspectStatusModel();
        model.putProspectStatus(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
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

    public deleteProspectStatus(request: express.Request, response: express.Response) {
        let model = new ProspectStatusModel();
        model.deleteProspectStatus(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

}