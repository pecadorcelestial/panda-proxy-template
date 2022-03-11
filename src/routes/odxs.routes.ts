import { Router } from 'express';
import { ODXController } from '../controllers/odxs';
import { ODXStatusController } from '../controllers/catalogs/odxStatuses';
import { ODXTypeController } from '../controllers/catalogs/odxTypes';
import { ChargeDetailTypeController } from '../controllers/catalogs/chargeDetailTypes';

import multer from 'multer';
// CARGA MASIVA.
const batchFileFilter = (request: Express.Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    if (!file.originalname.match(/\.(json)$/)) {
        let error: Error = { 
            message: 'El tipo de archivo no está permitido.' ,
            name: ''
        };
        return callback(error, false);
    }
    return callback(null, true);
};
let batchUpload = multer({ fileFilter: batchFileFilter });
// EVIDENCIA.
const evidenceFileFilter = (request: Express.Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|pdf|doc|docx)$/)) {
        let error: Error = { 
            message: 'El tipo de archivo no está permitido.' ,
            name: ''
        };
        return callback(error, false);
    }
    return callback(null, true);
};
let evidenceUpload = multer({ fileFilter: evidenceFileFilter, limits: { fieldSize: 25 * 1024 * 1024 } });

const router = Router();

// OOO  DDDD  X   X
//O   O D   D  X X
//O   O D   D   X
//O   O D   D  X X
// OOO  DDDD  X   X

let odxController: ODXController = new ODXController();

router.route('/odxs')
    .get(odxController.getODXS)
    .post(batchUpload.single('file'), odxController.postODXs);

router.route('/odx')
    .post(odxController.postODX)
    .get(odxController.getODX)
    .put(odxController.putODX)
    .delete(odxController.deleteODX);

router.route('/odx/approval')
    .post(odxController.postODXApproval);

router.route('/odx/receipt')
    .post(odxController.postODXReceipt);

router.route('/odx/pdf')
    .get(odxController.getPDFromODX);

//EEEEE  SSSS TTTTT  AAA  TTTTT U   U  SSSS
//E     S       T   A   A   T   U   U S
//EEE    SSS    T   AAAAA   T   U   U  SSS
//E         S   T   A   A   T   U   U     S
//EEEEE SSSS    T   A   A   T    UUU  SSSS

let odxStatusController: ODXStatusController = new ODXStatusController();

router.route('/catalogs/odx/statuses')
    .get(odxStatusController.getODXStatuses);

router.route('/catalogs/odx/status')
    .get(odxStatusController.getODXStatus)
    .post(odxStatusController.postODXStatus)
    .put(odxStatusController.putODXStatus)
    .delete(odxStatusController.deleteODXStatus);

//TTTTT IIIII PPPP   OOO   SSSS
//  T     I   P   P O   O S
//  T     I   PPPP  O   O  SSS
//  T     I   P     O   O     S
//  T   IIIII P      OOO  SSSS

let odxTypeController: ODXTypeController = new ODXTypeController();

router.route('/catalogs/odx/types')
    .get(odxTypeController.getODXTypes);
        
router.route('/catalogs/odx/type')
    .get(odxTypeController.getODXType)
    .post(odxTypeController.postODXType)
    .put(odxTypeController.putODXType)
    .delete(odxTypeController.deleteODXType);

//EEEEE V   V IIIII DDDD  EEEEE N   N  CCCC IIIII  AAA
//E     V   V   I   D   D E     NN  N C       I   A   A
//EEE   V   V   I   D   D EEE   N N N C       I   AAAAA
//E      V V    I   D   D E     N  NN C       I   A   A
//EEEEE   V   IIIII DDDD  EEEEE N   N  CCCC IIIII A   A

router.route('/odx/evidence')
    .get(odxController.getEvidence)
    .post(evidenceUpload.single('file'), odxController.postEvidence)
    .delete(odxController.deleteEvidence);

// CCCC  AAA  RRRR   GGGG  OOO   SSSS
//C     A   A R   R G     O   O S
//C     AAAAA RRRR  G  GG O   O  SSS
//C     A   A R   R G   G O   O     S
// CCCC A   A R   R  GGGG  OOO  SSSS

router.route('/odx/chargeDetails')
    .get(odxController.getChargeDetails);

router.route('/odx/chargeDetail')
    .post(odxController.postChargeDetail)
    .put(odxController.putChargeDetail)
    .delete(odxController.deleteChargeDetail);

//TTTTT IIIII PPPP   OOO   SSSS
//  T     I   P   P O   O S
//  T     I   PPPP  O   O  SSS
//  T     I   P     O   O     S
//  T   IIIII P      OOO  SSSS

let chargeDetailTypeController: ChargeDetailTypeController = new ChargeDetailTypeController();

router.route('/catalogs/chargeDetail/types')
    .get(chargeDetailTypeController.getChargeDetailTypes);
        
router.route('/catalogs/chargeDetail/type')
    .get(chargeDetailTypeController.getChargeDetailType)
    .post(chargeDetailTypeController.postChargeDetailType)
    .put(chargeDetailTypeController.putChargeDetailType)
    .delete(chargeDetailTypeController.deleteChargeDetailType);

export default router;