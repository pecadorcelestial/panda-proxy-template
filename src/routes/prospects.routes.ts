import { Router } from 'express';
import { ProspectController } from '../controllers/prospects';
import { ProspectTypeController } from '../controllers/catalogs/prospectTypes';
import { ProspectStatusController } from '../controllers/catalogs/prospectStatuses';
import { SalesEventTypeController } from '../controllers/catalogs/salesEventTypes';

const router = Router();

//PPPP  RRRR   OOO   SSSS PPPP  EEEEE  CCCC TTTTT  OOO
//P   P R   R O   O S     P   P E     C       T   O   O
//PPPP  RRRR  O   O  SSS  PPPP  EEE   C       T   O   O
//P     R   R O   O     S P     E     C       T   O   O
//P     R   R  OOO  SSSS  P     EEEEE  CCCC   T    OOO

let prospectController: ProspectController = new ProspectController();
let prospectStatusController: ProspectStatusController = new ProspectStatusController();
let prospectTypeController: ProspectTypeController = new ProspectTypeController();
let salesEventTypeController: SalesEventTypeController = new SalesEventTypeController();

router.route('/prospects')
    .get(prospectController.getProspects);

router.route('/prospect')
    .get(prospectController.getProspect)
    .post(prospectController.postProspect)
    .put(prospectController.putProspect)
    .delete(prospectController.deleteProspect);

//EEEEE  SSSS TTTTT  AAA  TTTTT U   U  SSSS
//E     S       T   A   A   T   U   U S
//EEE    SSS    T   AAAAA   T   U   U  SSS
//E         S   T   A   A   T   U   U     S
//EEEEE SSSS    T   A   A   T    UUU  SSSS

router.route('/catalogs/prospect/statuses')
    .get(prospectStatusController.getProspectStatuses);

router.route('/catalogs/prospect/status')
    .get(prospectStatusController.getProspectStatus)
    .post(prospectStatusController.postProspectStatus)
    .put(prospectStatusController.putProspectStatus)
    .delete(prospectStatusController.deleteProspectStatus);

//TTTTT IIIII PPPP   OOO   SSSS
//  T     I   P   P O   O S
//  T     I   PPPP  O   O  SSS
//  T     I   P     O   O     S
//  T   IIIII P      OOO  SSSS

router.route('/catalogs/prospect/types')
    .get(prospectTypeController.getProspectTypes);

router.route('/catalogs/prospectt/ype')
    .get(prospectTypeController.getProspectType)
    .post(prospectTypeController.postProspectType)
    .put(prospectTypeController.putProspectType)
    .delete(prospectTypeController.deleteProspectType);

router.route('/catalogs/salesEvent/types')
    .get(salesEventTypeController.getSalesEventTypes);

router.route('/catalogs/salesEvent/type')
    .get(salesEventTypeController.getSalesEventType)
    .post(salesEventTypeController.postSalesEventType)
    .put(salesEventTypeController.putSalesEventType)
    .delete(salesEventTypeController.deleteSalesEventType);
    
export default router;