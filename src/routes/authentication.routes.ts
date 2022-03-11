import { Router } from 'express';
import { AuthenticationController } from '../controllers/authentication';

const router = Router();

// AAA  U   U TTTTT EEEEE N   N TTTTT IIIII  CCCC  AAA   CCCC IIIII  OOO  N   N
//A   A U   U   T   E     NN  N   T     I   C     A   A C       I   O   O NN  N
//AAAAA U   U   T   EEE   N N N   T     I   C     AAAAA C       I   O   O N N N
//A   A U   U   T   E     N  NN   T     I   C     A   A C       I   O   O N  NN
//A   A  UUU    T   EEEEE N   N   T   IIIII  CCCC A   A  CCCC IIIII  OOO  N   N

let authenticationController: AuthenticationController = new AuthenticationController();

router.route('/login')
    .post(authenticationController.postAuthenticate);

router.route('/login/client')
    .post(authenticationController.postAuthenticateClient);

router.route('/login/distributor')
    .post(authenticationController.postAuthenticateDistributor);

router.route('/loginWithGoogle')
    .post(authenticationController.postAuthenticateWithGoogle);

router.route('/loginWithDN')
    .post(authenticationController.postAuthenticateWithDN);

router.route('/signOff')
    .post(authenticationController.postSignOff);

router.route('/signOff/domain')
    .post(authenticationController.postDomainSignOff);

export default router;