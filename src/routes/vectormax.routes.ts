import { Router } from 'express';
import { VectormaxApisController } from '../controllers/vectormax/apis';

const router = Router();

let vectormaxApisController: VectormaxApisController = new VectormaxApisController();

// CCCC U   U EEEEE N   N TTTTT  AAA   SSSS
//C     U   U E     NN  N   T   A   A S
//C     U   U EEE   N N N   T   AAAAA  SSS
//C     U   U E     N  NN   T   A   A     S
// CCCC  UUU  EEEEE N   N   T   A   A SSSS

router.route('/tv/accounts')
    .get(vectormaxApisController.getAccounts);

router.route('/tv/account')
    .get(vectormaxApisController.getAccount)
    .post(vectormaxApisController.postAccount)
    .put(vectormaxApisController.putAccount)
    .delete(vectormaxApisController.deleteAccount);
    
//U   U  SSSS U   U  AAA  RRRR  IIIII  OOO   SSSS
//U   U S     U   U A   A R   R   I   O   O S
//U   U  SSS  U   U AAAAA RRRR    I   O   O  SSS
//U   U     S U   U A   A R   R   I   O   O     S
// UUU  SSSS   UUU  A   A R   R IIIII  OOO  SSSS

router.route('/tv/account/users')
    .get(vectormaxApisController.getUsers);

router.route('/tv/account/user')
    .post(vectormaxApisController.postUser)
    .put(vectormaxApisController.putUser)
    .delete(vectormaxApisController.deleteUser);

router.route('/tv/roles')
    .get(vectormaxApisController.getRoles);

// SSSS U   U  SSSS  CCCC RRRR  IIIII PPPP   CCCC IIIII  OOO  N   N EEEEE  SSSS
//S     U   U S     C     R   R   I   P   P C       I   O   O NN  N E     S
// SSS  U   U  SSS  C     RRRR    I   PPPP  C       I   O   O N N N EEE    SSS
//    S U   U     S C     R   R   I   P     C       I   O   O N  NN E         S
//SSSS   UUU  SSSS   CCCC R   R IIIII P      CCCC IIIII  OOO  N   N EEEEE SSSS

router.route('/tv/subscriptions')
    .get(vectormaxApisController.getSubscriptions);

router.route('/tv/account/subscriptions')
    .delete(vectormaxApisController.deleteSubscriptions);

router.route('/tv/account/subscription')
    .post(vectormaxApisController.postSubscription)
    .delete(vectormaxApisController.deleteSubscription);

//DDDD  IIIII  SSSS PPPP   OOO   SSSS IIIII TTTTT IIIII V   V  OOO   SSSS
//D   D   I   S     P   P O   O S       I     T     I   V   V O   O S
//D   D   I    SSS  PPPP  O   O  SSS    I     T     I   V   V O   O  SSS
//D   D   I       S P     O   O     S   I     T     I    V V  O   O     S
//DDDD  IIIII SSSS  P      OOO  SSSS  IIIII   T   IIIII   V    OOO  SSSS

router.route('/tv/devices')
    .get(vectormaxApisController.getDevices);

router.route('/tv/account/device')
    .post(vectormaxApisController.postDevice)
    .delete(vectormaxApisController.deleteDevice);

export default router;