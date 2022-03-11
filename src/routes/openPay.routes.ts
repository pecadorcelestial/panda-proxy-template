import { Router, Request, Response } from 'express';
import { OpenPayController } from '../controllers/openPay';

const router = Router();

// OOO  PPPP  EEEEE N   N PPPP   AAA  Y   Y
//O   O P   P E     NN  N P   P A   A  Y Y
//O   O PPPP  EEE   N N N PPPP  AAAAA   Y
//O   O P     E     N  NN P     A   A   Y
// OOO  P     EEEEE N   N P     A   A  YYY

let openPayController: OpenPayController = new OpenPayController();

router.route('/openpay/store')
    .post(openPayController.postNDownloadStoreCharge);

export default router;