import * as express from 'express';
import GeneralSettingsModel from '../models/generalSettings';

export default class GeneralSettingsController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getGeneralSetting(request: express.Request, response: express.Response) {
        let model = new GeneralSettingsModel();
        model.getGeneralSetting(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getGeneralSettings (request: express.Request, response: express.Response) {
        let model = new GeneralSettingsModel();
        model.getGeneralSettings(request.query)
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

    public postGeneralSetting(request: express.Request, response: express.Response) {
        let logo: any = undefined;
        let csd: any = undefined;
        let key: any = undefined;
        if(request.files) {
            try {
                logo = (request.files['logo']) ? request.files['logo'][0] : undefined;
                csd = (request.files['csd']) ? request.files['csd'][0] : undefined;
                key = (request.files['key']) ? request.files['key'][0] : undefined;
            } catch(error) {
                // console.log(`[CONTROLADORES][CONFIGURACIÓN GENERAL][postGeneralSetting] Error al leer los archivos: ${error}`);
            }
        } /*else {
            response.status(400).end(JSON.stringify({
                stauts: 400,
                message: 'No se encontraron archivos en la petición.'
            }));
        }*/
        let model = new GeneralSettingsModel();
        model.postGeneralSetting(request.body, logo, csd, key)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(error.status || 400).end(JSON.stringify(error));
        });
    }

    //PPPP  U   U TTTTT
    //P   P U   U   T
    //PPPP  U   U   T
    //P     U   U   T
    //P      UUU    T

    public putGeneralSetting(request: express.Request, response: express.Response) {
        let logo: any = undefined;
        let csd: any = undefined;
        let key: any = undefined;
        if(request.files) {
            try {
                logo = (request.files['logo']) ? request.files['logo'][0] : undefined;
                csd = (request.files['csd']) ? request.files['csd'][0] : undefined;
                key = (request.files['key']) ? request.files['key'][0] : undefined;
            } catch(error) {
                // console.log(`[CONTROLADORES][CONFIGURACIÓN GENERAL][putGeneralSetting] Error al leer los archivos: ${error}`);
            }
        } /*else {
            response.status(400).end(JSON.stringify({
                stauts: 400,
                message: 'No se encontraron archivos en la petición.'
            }));
        }*/
        let model = new GeneralSettingsModel();
        model.putGeneralSetting(request.body, logo, csd, key)
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

    public deleteGeneralSetting(request: express.Request, response: express.Response) {
        let model = new GeneralSettingsModel();
        model.deleteGeneralSetting(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

}