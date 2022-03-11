import { Router, Request, Response } from 'express';
import { ConektaController } from '../controllers/conekta/apis';

const router = Router();

// OOO  PPPP  EEEEE N   N PPPP   AAA  Y   Y
//O   O P   P E     NN  N P   P A   A  Y Y
//O   O PPPP  EEE   N N N PPPP  AAAAA   Y
//O   O P     E     N  NN P     A   A   Y
// OOO  P     EEEEE N   N P     A   A  YYY

let conektaController: ConektaController = new ConektaController();

router.route('/conekta/order/retailer')
    .post(conektaController.postRetailerOrder);

router.route('/utilities/barcode')
    .get(conektaController.getBarcode);

//W   W EEEEE BBBB  H   H  OOO   OOO  K   K
//W   W E     B   B H   H O   O O   O K  K
//W W W EEE   BBBB  HHHHH O   O O   O KKK
//WW WW E     B   B H   H O   O O   O K  K
//W   W EEEEE BBBB  H   H  OOO   OOO  K   K

router.route('/conekta/webhook')
    .post(conektaController.postConektaWebhook);

export default router;