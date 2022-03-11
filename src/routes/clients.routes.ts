import { Router } from 'express';
import { ClientController } from '../controllers/clients';
import { ClientStatusController } from '../controllers/catalogs/clientStatuses';
import { ClientPriorityController } from '../controllers/catalogs/clientPriorities';

import multer from 'multer';
import { ClientProcessesController } from '../controllers/processes/clients';
let upload = multer();

const fileFilter = (request: Express.Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    if (!file.originalname.match(/\.(json)$/)) {
        let error: Error = { 
            message: 'El tipo de archivo no está permitido.' ,
            name: ''
        };
        return callback(error, false);
    }
    return callback(null, true);
};
let jsonUpload = multer({ fileFilter });

const router = Router();

// CCCC L     IIIII EEEEE N   N TTTTT EEEEE  SSSS
//C     L       I   E     NN  N   T   E     S
//C     L       I   EEE   N N N   T   EEE    SSS
//C     L       I   E     N  NN   T   E         S
// CCCC LLLLL IIIII EEEEE N   N   T   EEEEE SSSS

let clientController: ClientController = new ClientController();

router.route('/clients')
    .get(clientController.getClients)
    .post(jsonUpload.single('file'), clientController.postClients);

router.route('/client')
    .get(clientController.getClient)
    .post(upload.array('files'), clientController.postClient)
    .put(clientController.putClient)
    .delete(clientController.deleteClient);

//EEEEE  SSSS TTTTT  AAA  TTTTT U   U  SSSS
//E     S       T   A   A   T   U   U S
//EEE    SSS    T   AAAAA   T   U   U  SSS
//E         S   T   A   A   T   U   U     S
//EEEEE SSSS    T   A   A   T    UUU  SSSS

let clientStatusController: ClientStatusController = new ClientStatusController();

router.route('/catalogs/client/statuses')
    .get(clientStatusController.getClientStatuses);

router.route('/catalogs/client/status')
    .get(clientStatusController.getClientStatus)
    .post(clientStatusController.postClientStatus)
    .put(clientStatusController.putClientStatus)
    .delete(clientStatusController.deleteClientStatus);

//PPPP  RRRR  IIIII  OOO  RRRR  IIIII DDDD   AAA  DDDD  EEEEE  SSSS
//P   P R   R   I   O   O R   R   I   D   D A   A D   D E     S
//PPPP  RRRR    I   O   O RRRR    I   D   D AAAAA D   D EEE    SSS
//P     R   R   I   O   O R   R   I   D   D A   A D   D E         S
//P     R   R IIIII  OOO  R   R IIIII DDDD  A   A DDDD  EEEEE SSSS

let clientPriorityController: ClientPriorityController = new ClientPriorityController();

router.route('/catalogs/client/priorities')
    .get(clientPriorityController.getClientPriorities);

router.route('/catalogs/client/priority')
    .get(clientPriorityController.getClientPriority)
    .post(clientPriorityController.postClientPriority)
    .put(clientPriorityController.putClientPriority)
    .delete(clientPriorityController.deleteClientPriority);

// AAA  RRRR   CCCC H   H IIIII V   V  OOO   SSSS
//A   A R   R C     H   H   I   V   V O   O S
//AAAAA RRRR  C     HHHHH   I   V   V O   O  SSS
//A   A R   R C     H   H   I    V V  O   O     S
//A   A R   R  CCCC H   H IIIII   V    OOO  SSSS

router.route('/client/files')
    .post(upload.array('files'), clientController.postFiles)
    .delete(clientController.deleteFiles);

//EEEEE M   M  AAA  IIIII L
//E     MM MM A   A   I   L
//EEE   M M M AAAAA   I   L
//E     M   M A   A   I   L
//EEEEE M   M A   A IIIII LLLLL

let clientProcessesController: ClientProcessesController = new ClientProcessesController();

router.route('/client/sendEmail')
    .post(clientProcessesController.sendEmail);

router.route('/client/sendAdvertising')
    .post(clientProcessesController.sendAdvertising);

export default router;