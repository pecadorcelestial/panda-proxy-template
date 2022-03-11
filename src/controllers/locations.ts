import * as express from 'express';
import { ZipCodeModel, CountryModel, StateModel, TownModel, SettlementModel } from '../models/locations';

export class LocationController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getZipCodes(request: express.Request, response: express.Response) {
        let model = new ZipCodeModel();
        model.getZipCodes(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            // console.log('[ERROR][CÓDIGOS POSTALES]: ', JSON.stringify(error));
            response.status(400).end(JSON.stringify(error));
        });
    }

    public putUpdateZipCodes(request: express.Request, response: express.Response) {
        let model = new ZipCodeModel();
        model.putUpdateZipCodes(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getCountries(request: express.Request, response: express.Response) {
        let model = new CountryModel();
        model.getCountries(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getStates(request: express.Request, response: express.Response) {
        let model = new StateModel();
        model.getStates(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getTowns(request: express.Request, response: express.Response) {
        let model = new TownModel();
        model.getTowns(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getSettlements(request: express.Request, response: express.Response) {
        let model = new SettlementModel();
        model.getSettlements(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

}