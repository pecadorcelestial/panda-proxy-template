import { Router, Request, Response } from 'express';
import { NineOneOneController } from '../controllers/911';

const router = Router();

// CCCC U   U EEEEE N   N TTTTT  AAA   SSSS
//C     U   U E     NN  N   T   A   A S
//C     U   U EEE   N N N   T   AAAAA  SSS
//C     U   U E     N  NN   T   A   A     S
// CCCC  UUU  EEEEE N   N   T   A   A SSSS

let nineOneOneController: NineOneOneController = new NineOneOneController();

router.route('/911')
    .post(nineOneOneController.post911Call);

export default router;