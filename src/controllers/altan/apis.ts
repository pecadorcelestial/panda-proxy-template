import * as express from 'express';
import AltanAPIsModel from '../../models/altan/apis';

export class AltanAPIsController {
    
    // GGGG EEEEE TTTTT
    //G     E       T
    //G  GG EEE     T
    //G   G E       T
    // GGGG EEEEE   T

    public getServiceAvailability = (request: express.Request, response: express.Response): void => {
        let model = new AltanAPIsModel();
        model.getServiceAvailability(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getClientProfile = (request: express.Request, response: express.Response): void => {
        let model = new AltanAPIsModel();
        model.getClientProfile(request.query)
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

    public postActivation = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        let model = new AltanAPIsModel();
        model.postActivation(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            let parentId = request.body.parentId;
            if(typeof parentId === 'string' && parentId.length > 0) {
                request.resourceId = parentId;
                request.resourceType = 'account';
                next();
            }
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postInactivation = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        let model = new AltanAPIsModel();
        model.postInactivation(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            let parentId = request.body.parentId;
            if(typeof parentId === 'string' && parentId.length > 0) {
                request.resourceId = parentId;
                request.resourceType = 'account';
                next();
            }
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postResume = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        let model = new AltanAPIsModel();
        model.postResume(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            let parentId = request.body.parentId;
            if(typeof parentId === 'string' && parentId.length > 0) {
                request.resourceId = parentId;
                request.resourceType = 'account';
                next();
            }
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postPredeactivate = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        let model = new AltanAPIsModel();
        model.postPredeactivate(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            let parentId = request.body.parentId;
            if(typeof parentId === 'string' && parentId.length > 0) {
                request.resourceId = parentId;
                request.resourceType = 'account';
                next();
            }
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postDeactivation = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        let model = new AltanAPIsModel();
        model.postDeactivation(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            let parentId = request.body.parentId;
            if(typeof parentId === 'string' && parentId.length > 0) {
                request.resourceId = parentId;
                request.resourceType = 'account';
                next();
            }
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postReactivation = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        let model = new AltanAPIsModel();
        model.postReactivation(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            let parentId = request.body.parentId;
            if(typeof parentId === 'string' && parentId.length > 0) {
                request.resourceId = parentId;
                request.resourceType = 'account';
                next();
            }
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postPurchase = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        let model = new AltanAPIsModel();
        model.postPurchase(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            let parentId = request.body.parentId;
            if(typeof parentId === 'string' && parentId.length > 0) {
                request.resourceId = parentId;
                request.resourceType = 'account';
                next();
            }
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postBarring = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        let model = new AltanAPIsModel();
        model.postBarring(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            let parentId = request.body.parentId;
            if(typeof parentId === 'string' && parentId.length > 0) {
                request.resourceId = parentId;
                request.resourceType = 'account';
                next();
            }
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }
    
    public postUnbarring = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        let model = new AltanAPIsModel();
        model.postUnbarring(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            let parentId = request.body.parentId;
            if(typeof parentId === 'string' && parentId.length > 0) {
                request.resourceId = parentId;
                request.resourceType = 'account';
                next();
            }
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }
    
    public postPreregister = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        let model = new AltanAPIsModel();
        model.postPreregister(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            let parentId = request.body.parentId;
            if(typeof parentId === 'string' && parentId.length > 0) {
                request.resourceId = parentId;
                request.resourceType = 'account';
                next();
            }
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    //PPPP   AAA  TTTTT  CCCC H   H
    //P   P A   A   T   C     H   H
    //PPPP  AAAAA   T   C     HHHHH
    //P     A   A   T   C     H   H
    //P     A   A   T    CCCC H   H

    public patchPropertiesUpdate = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        let model = new AltanAPIsModel();
        model.patchPropertiesUpdate(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            let parentId = request.body.parentId;
            if(typeof parentId === 'string' && parentId.length > 0) {
                request.resourceId = parentId;
                request.resourceType = 'account';
                next();
            }
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    //IIIII M   M EEEEE IIIII
    //  I   MM MM E       I
    //  I   M M M EEE     I
    //  I   M   M E       I
    //IIIII M   M EEEEE IIIII

    public getIMEIStatus = (request: express.Request, response: express.Response): void => {
        let model = new AltanAPIsModel();
        model.getIMEIStatus(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public lockIMEI = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        let model = new AltanAPIsModel();
        model.lockIMEI(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            let parentId = request.body.parentId;
            if(typeof parentId === 'string' && parentId.length > 0) {
                request.resourceId = parentId;
                request.resourceType = 'account';
                next();
            }
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

    public unlockIMEI = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        let model = new AltanAPIsModel();
        model.unlockIMEI(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            let parentId = request.body.parentId;
            if(typeof parentId === 'string' && parentId.length > 0) {
                request.resourceId = parentId;
                request.resourceType = 'account';
                next();
            }
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }
    
    //BBBB   AAA  TTTTT  CCCC H   H
    //B   B A   A   T   C     H   H
    //BBBB  AAAAA   T   C     HHHHH
    //B   B A   A   T   C     H   H
    //BBBB  A   A   T    CCCC H   H

    public postBatchBarring = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        let model = new AltanAPIsModel();
        model.postBatchBarring(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }    

    public postBatchSuspend = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        let model = new AltanAPIsModel();
        model.postBatchSuspend(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }
    
	//V   V IIIII  SSSS TTTTT  AAA        333   666   000
	//V   V   I   S       T   A   A      3   3 6     0   0
	//V   V   I    SSS    T   AAAA         33  6 66  0   0
	// V V    I       S   T   A   A      3   3 66  6 O   O
	//  V   IIIII SSSS    T   A   A       333   666   000

    public get360Offers = (request: express.Request, response: express.Response): void => {
        let model = new AltanAPIsModel();
        model.get360Offers(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public get360SearchSubscriber = (request: express.Request, response: express.Response): void => {
        let model = new AltanAPIsModel();
        model.get360SearchSubscriber(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public get360Profile = (request: express.Request, response: express.Response): void => {
        let model = new AltanAPIsModel();
        model.get360Profile(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public get360DeviceInfo = (request: express.Request, response: express.Response): void => {
        let model = new AltanAPIsModel();
        model.get360DeviceInfo(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public get360NetworkProfile = (request: express.Request, response: express.Response): void => {
        let model = new AltanAPIsModel();
        model.get360NetworkProfile(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public post360APN = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        let model = new AltanAPIsModel();
        model.post360APN(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

	// SSSS EEEEE RRRR  V   V IIIII  CCCC IIIII  OOO   SSSS       SSSS U   U PPPP  L     EEEEE M   M EEEEE N   N TTTTT  AAA  RRRR  IIIII  OOO   SSSS
	//S     E     R   R V   V   I   C       I   O   O S          S     U   U P   P L     E     MM MM E     NN  N   T   A   A R   R   I   O   O S
	// SSS  EEE   RRRR  V   V   I   C       I   O   O  SSS        SSS  U   U PPPP  L     EEE   M M M EEE   N N N   T   AAAAA RRRR    I   O   O  SSS
	//    S E     R   R  V V    I   C       I   O   O     S          S U   U P     L     E     M   M E     N  NN   T   A   A R   R   I   O   O     S
	//SSSS  EEEEE R   R   V   IIIII  CCCC IIIII  OOO  SSSS       SSSS   UUU  P     LLLLL EEEEE M   M EEEEE N   N   T   A   A R   R IIIII  OOO  SSSS

    public getManagedServices = (request: express.Request, response: express.Response): void => {
        let model = new AltanAPIsModel();
        model.getManagedServices(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postManagedService = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        let model = new AltanAPIsModel();
        model.postManagedService(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
            let parentId = request.body.parentId;
            if(typeof parentId === 'string' && parentId.length > 0) {
                request.resourceId = parentId;
                request.resourceType = 'account';
                next();
            }
        })
        .catch((error: any) => {            
            response.status(400).end(JSON.stringify(error));
        });
    }

}