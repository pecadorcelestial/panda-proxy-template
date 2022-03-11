import { Router, Request, Response } from 'express';
import { CDRController } from '../controllers/cdr';

const router = Router();

// CCCC DDDD  RRRR
//C     D   D R   R
//C     D   D RRRR
//C     D   D R   R
// CCCC DDDD  R   R

let cdrController: CDRController = new CDRController();

router.route('/cdrs')
    .get(cdrController.getCDRs);

router.route('/cdr')
    .get(cdrController.getCDR);

export default router;