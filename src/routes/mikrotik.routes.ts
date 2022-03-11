import { Router } from 'express';
import { MikrotikAPIsController } from '../controllers/mikrotik/apis';

const router = Router();

let mikrotikAPIsController: MikrotikAPIsController = new MikrotikAPIsController();

//U   U  SSSS U   U  AAA  RRRR  IIIII  OOO   SSSS
//U   U S     U   U A   A R   R   I   O   O S
//U   U  SSS  U   U AAAAA RRRR    I   O   O  SSS
//U   U     S U   U A   A R   R   I   O   O     S
// UUU  SSSS   UUU  A   A R   R IIIII  OOO  SSSS

router.route('/device/users/info')
    .get(mikrotikAPIsController.getUsers);

router.route('/device/user/info')
    .get(mikrotikAPIsController.getUser)
    .post(mikrotikAPIsController.postUser)
    .put(mikrotikAPIsController.putUser);
    
//PPPP  EEEEE RRRR  FFFFF IIIII L     EEEEE  SSSS
//P   P E     R   R F       I   L     E     S
//PPPP  EEE   RRRR  FFF     I   L     EEE    SSS
//P     E     R   R F       I   L     E         S
//P     EEEEE R   R F     IIIII LLLLL EEEEE SSSS

router.route('/device/profiles/info')
    .get(mikrotikAPIsController.getProfiles);

router.route('/device/profile/info')
    .post(mikrotikAPIsController.postProfile);

export default router;