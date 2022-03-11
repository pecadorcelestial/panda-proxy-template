import { Router } from 'express';
import { ZendeskController } from '../controllers/zendesk';

const router = Router();

//ZZZZZ EEEEE N   N DDDD  EEEEE  SSSS K   K
//   Z  E     NN  N D   D E     S     K  K
//  Z   EEE   N N N D   D EEE    SSS  KKK
// Z    E     N  NN D   D E         S K  K
//ZZZZZ EEEEE N   N DDDD  EEEEE SSSS  K   K

let zendeskController: ZendeskController = new ZendeskController();

router.route('/zendesk/client')
    .get(zendeskController.getClient)
    .post(zendeskController.postClient)
    .delete(zendeskController.deleteClient);

router.route('/zendesk/contact')
    .post(zendeskController.postContact);

//TTTTT IIIII  CCCC K   K EEEEE TTTTT  SSSS
//  T     I   C     K  K  E       T   S
//  T     I   C     KKK   EEE     T    SSS
//  T     I   C     K  K  E       T       S
//  T   IIIII  CCCC K   K EEEEE   T   SSSS

router.route('/zendesk/ticket')
    .post(zendeskController.postTicket)
    .delete(zendeskController.deleteTicket);

//W   W EEEEE BBBB  H   H  OOO   OOO  K   K
//W   W E     B   B H   H O   O O   O K  K
//W W W EEE   BBBB  HHHHH O   O O   O KKK
//WW WW E     B   B H   H O   O O   O K  K
//W   W EEEEE BBBB  H   H  OOO   OOO  K   K

router.route('/zendesk/webhook')
    .post(zendeskController.postZendeskWebhook);

export default router;