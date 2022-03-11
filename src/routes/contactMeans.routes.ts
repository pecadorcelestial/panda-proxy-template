import { Router } from 'express';
import { ContactMeansController } from '../controllers/catalogs/contactMeans';

const router = Router();

//M   M EEEEE DDDD  IIIII  OOO   SSSS      DDDD  EEEEE       CCCC  OOO  N   N TTTTT  AAA   CCCC TTTTT  OOO
//MM MM E     D   D   I   O   O S          D   D E          C     O   O NN  N   T   A   A C       T   O   O
//M M M EEE   D   D   I   O   O  SSS       D   D EEE        C     O   O N N N   T   AAAAA C       T   O   O
//M   M E     D   D   I   O   O     S      D   D E          C     O   O N  NN   T   A   A C       T   O   O
//M   M EEEEE DDDD  IIIII  OOO  SSSS       DDDD  EEEEE       CCCC  OOO  N   N   T   A   A  CCCC   T    OOO

let contactMeansController: ContactMeansController = new ContactMeansController();

router.route('/catalogs/contactMeans')
    .get(contactMeansController.getContactMeans);

router.route('/catalogs/contactMean')
    .get(contactMeansController.getContactMean)
    .post(contactMeansController.postContactMean)
    .put(contactMeansController.putContactMean)
    .delete(contactMeansController.deleteContactMean);
    
export default router;