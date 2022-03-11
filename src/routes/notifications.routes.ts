import { Router } from 'express';
import { EmailController, SMSController } from '../controllers/notifications';

const router = Router();

//EEEEE M   M  AAA  IIIII L
//E     MM MM A   A   I   L
//EEE   M M M AAAAA   I   L
//E     M   M A   A   I   L
//EEEEE M   M A   A IIIII LLLLL

let emailController: EmailController = new EmailController();

router.route('/notifications/email')
    .post(emailController.postEmail);

// SSSS M   M  SSSS
//S     MM MM S
// SSS  M M M  SSS
//    S M   M     S
//SSSS  M   M SSSS

let smsController: SMSController = new SMSController();

router.route('/notifications/sms')
    .get(smsController.getSMS)
    .post(smsController.postSMS);

export default router;