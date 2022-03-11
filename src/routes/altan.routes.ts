import { Router, Request, Response } from 'express';
import { AltanAPIsController } from '../controllers/altan/apis';
import { AltanProductTypeController } from '../controllers/altan/productTypes';
import { AltanProductStatusController } from '../controllers/altan/productStatus';
import { AltanProductController } from '../controllers/altan/products';
import { AltanCDRController } from '../controllers/altan/cdr';

const router = Router();

// OOO  PPPP  EEEEE RRRR   AAA   CCCC IIIII  OOO  N   N EEEEE  SSSS
//O   O P   P E     R   R A   A C       I   O   O NN  N E     S
//O   O PPPP  EEE   RRRR  AAAAA C       I   O   O N N N EEE    SSS
//O   O P     E     R   R A   A C       I   O   O N  NN E         S
// OOO  P     EEEEE R   R A   A  CCCC IIIII  OOO  N   N EEEEE SSSS

let altanAPIsController: AltanAPIsController = new AltanAPIsController();

router.route('/altan/service/availability')
    .get(altanAPIsController.getServiceAvailability);

router.route('/altan/client/profile')
    .get(altanAPIsController.getClientProfile);

router.route('/altan/activate')
    .post(altanAPIsController.postActivation);        

router.route('/altan/inactivate')
    .post(altanAPIsController.postInactivation);

router.route('/altan/resume')
    .post(altanAPIsController.postResume);

router.route('/altan/predeactivate')
    .post(altanAPIsController.postPredeactivate);

router.route('/altan/deactivate')
    .post(altanAPIsController.postDeactivation);

router.route('/altan/reactivate')
    .post(altanAPIsController.postReactivation);
    
router.route('/altan/purchase')
    .post(altanAPIsController.postPurchase);
    
router.route('/altan/properties/update')
    .patch(altanAPIsController.patchPropertiesUpdate);
    
router.route('/altan/barring')
    .post(altanAPIsController.postBarring);
    
router.route('/altan/unbarring')
    .post(altanAPIsController.postUnbarring);
    
router.route('/altan/preregister')
    .post(altanAPIsController.postPreregister);

//IIIII M   M EEEEE IIIII
//  I   MM MM E       I
//  I   M M M EEE     I
//  I   M   M E       I
//IIIII M   M EEEEE IIIII

router.route('/altan/imei/status')
    .get(altanAPIsController.getIMEIStatus);    

router.route('/altan/imei/lock')
    .post(altanAPIsController.lockIMEI);
    
router.route('/altan/imei/unlock')
    .post(altanAPIsController.unlockIMEI);
            
//BBBB   AAA  TTTTT  CCCC H   H
//B   B A   A   T   C     H   H
//BBBB  AAAAA   T   C     HHHHH
//B   B A   A   T   C     H   H
//BBBB  A   A   T    CCCC H   H

router.route('/altan/batch/barring')
    .post(altanAPIsController.postBatchBarring);

router.route('/altan/batch/suspend')
    .post(altanAPIsController.postBatchSuspend);

//PPPP  RRRR   OOO  DDDD  U   U  CCCC TTTTT  OOO   SSSS
//P   P R   R O   O D   D U   U C       T   O   O S
//PPPP  RRRR  O   O D   D U   U C       T   O   O  SSS
//P     R   R O   O D   D U   U C       T   O   O     S
//P     R   R  OOO  DDDD   UUU   CCCC   T    OOO  SSSS

let altanProductController: AltanProductController = new AltanProductController();

router.route('/altan/products')
    .get(altanProductController.getAltanProducts);

router.route('/altan/product')
    .get(altanProductController.getAltanProduct)
    .post(altanProductController.postAltanProduct)
    .put(altanProductController.putAltanProduct)
    .delete(altanProductController.deleteAltanProduct);

//TTTTT IIIII PPPP   OOO   SSSS
//  T     I   P   P O   O S
//  T     I   PPPP  O   O  SSS
//  T     I   P     O   O     S
//  T   IIIII P      OOO  SSSS

let altanProductTypesController: AltanProductTypeController = new AltanProductTypeController();

router.route('/altan/products/types')
    .get(altanProductTypesController.getProductTypes);

router.route('/altan/products/type')
    .get(altanProductTypesController.getProductType)
    .post(altanProductTypesController.postProductType)
    .put(altanProductTypesController.putProductType)
    .delete(altanProductTypesController.deleteProductType);

//EEEEE  SSSS TTTTT  AAA  TTTTT U   U  SSSS
//E     S       T   A   A   T   U   U S
//EEE    SSS    T   AAAAA   T   U   U  SSS
//E         S   T   A   A   T   U   U     S
//EEEEE SSSS    T   A   A   T    UUU  SSSS

let altanProductStatusController: AltanProductStatusController = new AltanProductStatusController();

router.route('/altan/products/types')
    .get(altanProductStatusController.getProductStatuses);

router.route('/altan/products/type')
    .get(altanProductStatusController.getProductStatus)
    .post(altanProductStatusController.postProductStatus)
    .put(altanProductStatusController.putProductStatus)
    .delete(altanProductStatusController.deleteProductStatus);

// CCCC DDDD  RRRR
//C     D   D R   R
//C     D   D RRRR
//C     D   D R   R
// CCCC DDDD  R   R

let altanCDRController: AltanCDRController = new AltanCDRController();

router.route('/altan/cdr')
    .get(altanCDRController.getAltanCDR);

//V   V IIIII  SSSS TTTTT  AAA        333   666   000
//V   V   I   S       T   A   A      3   3 6     0   0
//V   V   I    SSS    T   AAAA         33  6 66  0   0
// V V    I       S   T   A   A      3   3 66  6 O   O
//  V   IIIII SSSS    T   A   A       333   666   000

router.route('/altan/360/offers')
    .get(altanAPIsController.get360Offers);

router.route('/altan/360/search')
    .get(altanAPIsController.get360SearchSubscriber);

router.route('/altan/360/profile')
    .get(altanAPIsController.get360Profile);

router.route('/altan/360/device')
    .get(altanAPIsController.get360DeviceInfo);

router.route('/altan/360/networkProfile')
    .get(altanAPIsController.get360NetworkProfile);

router.route('/altan/360/apnUpdate')
    .post(altanAPIsController.post360APN);

// SSSS EEEEE RRRR  V   V IIIII  CCCC IIIII  OOO   SSSS       SSSS U   U PPPP  L     EEEEE M   M EEEEE N   N TTTTT  AAA  RRRR  IIIII  OOO   SSSS
//S     E     R   R V   V   I   C       I   O   O S          S     U   U P   P L     E     MM MM E     NN  N   T   A   A R   R   I   O   O S
// SSS  EEE   RRRR  V   V   I   C       I   O   O  SSS        SSS  U   U PPPP  L     EEE   M M M EEE   N N N   T   AAAAA RRRR    I   O   O  SSS
//    S E     R   R  V V    I   C       I   O   O     S          S U   U P     L     E     M   M E     N  NN   T   A   A R   R   I   O   O     S
//SSSS  EEEEE R   R   V   IIIII  CCCC IIIII  OOO  SSSS       SSSS   UUU  P     LLLLL EEEEE M   M EEEEE N   N   T   A   A R   R IIIII  OOO  SSSS

router.route('/altan/managedServices')
    .get(altanAPIsController.getManagedServices)
    .post(altanAPIsController.postManagedService);

export default router;