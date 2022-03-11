import * as express from 'express';
import VectormaxAPIsModel from '../../models/vectormax/apis';

export class VectormaxApisController {
    
    // CCCC U   U EEEEE N   N TTTTT  AAA   SSSS
    //C     U   U E     NN  N   T   A   A S
    //C     U   U EEE   N N N   T   AAAAA  SSS
    //C     U   U E     N  NN   T   A   A     S
    // CCCC  UUU  EEEEE N   N   T   A   A SSSS

    public getAccounts = (request: express.Request, response: express.Response): void => {
        let model = new VectormaxAPIsModel();
        model.getAccounts(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getAccount = (request: express.Request, response: express.Response): void => {
        let model = new VectormaxAPIsModel();
        model.getAccount(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postAccount = (request: express.Request, response: express.Response): void => {
        let model = new VectormaxAPIsModel();
        model.postAccount(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public putAccount = (request: express.Request, response: express.Response): void => {
        let model = new VectormaxAPIsModel();
        model.putAccount(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public deleteAccount = (request: express.Request, response: express.Response): void => {
        let model = new VectormaxAPIsModel();
        model.deleteAccount(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    //U   U  SSSS U   U  AAA  RRRR  IIIII  OOO   SSSS
    //U   U S     U   U A   A R   R   I   O   O S
    //U   U  SSS  U   U AAAAA RRRR    I   O   O  SSS
    //U   U     S U   U A   A R   R   I   O   O     S
    // UUU  SSSS   UUU  A   A R   R IIIII  OOO  SSSS

    public getUsers = (request: express.Request, response: express.Response): void => {
        let model = new VectormaxAPIsModel();
        model.getUsers(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postUser = (request: express.Request, response: express.Response): void => {
        let model = new VectormaxAPIsModel();
        model.postUser(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public putUser = (request: express.Request, response: express.Response): void => {
        let model = new VectormaxAPIsModel();
        model.putUser(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public deleteUser = (request: express.Request, response: express.Response): void => {
        let model = new VectormaxAPIsModel();
        model.deleteUser(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getRoles = (request: express.Request, response: express.Response): void => {
        let model = new VectormaxAPIsModel();
        model.getRoles(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    // SSSS U   U  SSSS  CCCC RRRR  IIIII PPPP   CCCC IIIII  OOO  N   N EEEEE  SSSS
    //S     U   U S     C     R   R   I   P   P C       I   O   O NN  N E     S
    // SSS  U   U  SSS  C     RRRR    I   PPPP  C       I   O   O N N N EEE    SSS
    //    S U   U     S C     R   R   I   P     C       I   O   O N  NN E         S
    //SSSS   UUU  SSSS   CCCC R   R IIIII P      CCCC IIIII  OOO  N   N EEEEE SSSS

    public deleteSubscriptions = (request: express.Request, response: express.Response): void => {
        let model = new VectormaxAPIsModel();
        model.deleteSubscriptions(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public postSubscription = (request: express.Request, response: express.Response): void => {
        let model = new VectormaxAPIsModel();
        model.postSubscription(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public deleteSubscription = (request: express.Request, response: express.Response): void => {
        let model = new VectormaxAPIsModel();
        model.deleteSubscription(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getSubscriptions = (request: express.Request, response: express.Response): void => {
        let model = new VectormaxAPIsModel();
        model.getSubscriptions(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    //DDDD  IIIII  SSSS PPPP   OOO   SSSS IIIII TTTTT IIIII V   V  OOO   SSSS
    //D   D   I   S     P   P O   O S       I     T     I   V   V O   O S
    //D   D   I    SSS  PPPP  O   O  SSS    I     T     I   V   V O   O  SSS
    //D   D   I       S P     O   O     S   I     T     I    V V  O   O     S
    //DDDD  IIIII SSSS  P      OOO  SSSS  IIIII   T   IIIII   V    OOO  SSSS

    public postDevice = (request: express.Request, response: express.Response): void => {
        let model = new VectormaxAPIsModel();
        model.postDevice(request.body)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public deleteDevice = (request: express.Request, response: express.Response): void => {
        let model = new VectormaxAPIsModel();
        model.deleteDevice(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

    public getDevices = (request: express.Request, response: express.Response): void => {
        let model = new VectormaxAPIsModel();
        model.getDevices(request.query)
        .then((data: any) => {
            response.status(200).end(JSON.stringify(data));
        })
        .catch((error: any) => {
            response.status(400).end(JSON.stringify(error));
        });
    }

}