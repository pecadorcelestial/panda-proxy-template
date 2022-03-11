import * as express from 'express';
import { ProductModel, AltanProductModel } from '../models/products';

//PPPP  RRRR   OOO  DDDD  U   U  CCCC TTTTT  OOO   SSSS
//P   P R   R O   O D   D U   U C       T   O   O S
//PPPP  RRRR  O   O D   D U   U C       T   O   O  SSS
//P     R   R O   O D   D U   U C       T   O   O     S
//P     R   R  OOO  DDDD   UUU   CCCC   T    OOO  SSSS

export class ProductController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getProduct(request: express.Request, response: express.Response) {
        let model = new ProductModel();
        model.getProduct(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getProducts(request: express.Request, response: express.Response) {
        let model = new ProductModel();
        model.getProducts(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getSpecifications(request: express.Request, response: express.Response) {
        let model = new ProductModel();
        model.getSpecifications(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getAlerts(request: express.Request, response: express.Response) {
        let model = new ProductModel();
        model.getAlerts(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getBundles(request: express.Request, response: express.Response) {
        let model = new ProductModel();
        model.getBundles(request.query)
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

    public postProduct(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ProductModel();
        model.postProduct(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data._id;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postProducts(request: express.Request, response: express.Response): void {
        // @ts-ignore        
        let file: Express.Multer.File = request.file;
        let model = new ProductModel();
        model.postProducts(request.body, file)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postSpecification(request: express.Request, response: express.Response) {
        let model = new ProductModel();
        model.postSpecification(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postAlert(request: express.Request, response: express.Response) {
        let model = new ProductModel();
        model.postAlert(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postBundle(request: express.Request, response: express.Response) {
        let model = new ProductModel();
        model.postBundle(request.body)
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

    public putProduct(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ProductModel();
        model.putProduct(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data._id;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public putSpecification(request: express.Request, response: express.Response) {
        let model = new ProductModel();
        model.putSpecification(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public putAlert(request: express.Request, response: express.Response) {
        let model = new ProductModel();
        model.putAlert(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public putBundle(request: express.Request, response: express.Response) {
        let model = new ProductModel();
        model.putBundle(request.body)
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

    public deleteProduct(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new ProductModel();
        model.deleteProduct(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.data._id;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public deleteSpecification(request: express.Request, response: express.Response) {
        let model = new ProductModel();
        model.deleteSpecification(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public deleteAlert(request: express.Request, response: express.Response) {
        let model = new ProductModel();
        model.deleteAlert(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public deleteBundle(request: express.Request, response: express.Response) {
        let model = new ProductModel();
        model.deleteBundle(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

}

// AAA  L     TTTTT  AAA  N   N
//A   A L       T   A   A NN  N
//AAAAA L       T   AAAAA N N N
//A   A L       T   A   A N  NN
//A   A LLLLL   T   A   A N   N

export class AltanProductController {

    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getAltanProduct(request: express.Request, response: express.Response) {
        let model = new AltanProductModel();
        model.getAltanProduct(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getAltanProducts(request: express.Request, response: express.Response) {
        let model = new AltanProductModel();
        model.getAltanProducts(request.query)
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

    public postAltanProduct(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new AltanProductModel();
        model.postAltanProduct(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data._id;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postAltanProducts(request: express.Request, response: express.Response, next: express.NextFunction) {
        let file: Express.Multer.File = request.file;
        let model = new AltanProductModel();
        model.postAltanProducts(request.body, file)
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

    public putAltanProduct(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new AltanProductModel();
        model.putAltanProduct(request.body)
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

    public deleteAltanProduct(request: express.Request, response: express.Response, next: express.NextFunction) {
        let model = new AltanProductModel();
        model.deleteAltanProduct(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            request.resourceId = data.data._id;
            next();
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

}