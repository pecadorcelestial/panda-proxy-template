import { Router } from 'express';
import { ForcedTermController } from '../controllers/catalogs/forcedTerms';
import { PeriodicityController } from '../controllers/catalogs/periodicity';
import { QuotationController } from '../controllers/quotations';
import { QuotationStatusController } from '../controllers/catalogs/quotationStatuses';

const router = Router();

let forcedTermController: ForcedTermController = new ForcedTermController();
let periodicityController: PeriodicityController = new PeriodicityController();
let quotationController: QuotationController = new QuotationController();
let quotationStatusController: QuotationStatusController = new QuotationStatusController();

// CCCC  OOO  TTTTT IIIII ZZZZZ  AAA   CCCC IIIII  OOO  N   N EEEEE  SSSS
//C     O   O   T     I      Z  A   A C       I   O   O NN  N E     S
//C     O   O   T     I     Z   AAAAA C       I   O   O N N N EEE    SSS
//C     O   O   T     I    Z    A   A C       I   O   O N  NN E         S
// CCCC  OOO    T   IIIII ZZZZZ A   A  CCCC IIIII  OOO  N   N EEEEE SSSS

router.route('/quotations')
    .get(quotationController.getQuotations);

router.route('/quotation/items')
    .get(quotationController.getItems);

router.route('/quotation/item')
    .post(quotationController.postItem)
    .put(quotationController.putItem)
    .delete(quotationController.deleteItem);

router.route('/quotation')
    .get(quotationController.getQuotation)
    .post(quotationController.postQuotation)
    .put(quotationController.putQuotation)
    .delete(quotationController.deleteQuotation);

//EEEEE  SSSS TTTTT  AAA  TTTTT U   U  SSSS
//E     S       T   A   A   T   U   U S
//EEE    SSS    T   AAAAA   T   U   U  SSS
//E         S   T   A   A   T   U   U     S
//EEEEE SSSS    T   A   A   T    UUU  SSSS

router.route('/catalogs/quotation/statuses')
    .get(quotationStatusController.getQuotationStatuses);

router.route('/catalogs/quotation/status')
    .get(quotationStatusController.getQuotationStatus)
    .post(quotationStatusController.postQuotationStatus)
    .put(quotationStatusController.putQuotationStatus)
    .delete(quotationStatusController.deleteQuotationStatus);

//PPPP  EEEEE RRRR  IIIII  OOO  DDDD  IIIII  CCCC IIIII DDDD   AAA  DDDD
//P   P E     R   R   I   O   O D   D   I   C       I   D   D A   A D   D
//PPPP  EEE   RRRR    I   O   O D   D   I   C       I   D   D AAAAA D   D
//P     E     R   R   I   O   O D   D   I   C       I   D   D A   A D   D
//P     EEEEE R   R IIIII  OOO  DDDD  IIIII  CCCC IIIII DDDD  A   A DDDD

router.route('/catalogs/periodicities')
    .get(periodicityController.getPeriodicities);

router.route('/catalogs/periodicity')
    .get(periodicityController.getPeriodicity)
    .post(periodicityController.postPeriodicity)
    .put(periodicityController.putPeriodicity)
    .delete(periodicityController.deletePeriodicity);

//PPPP  L      AAA  ZZZZZ  OOO       FFFFF  OOO  RRRR  ZZZZZ  OOO   SSSS  OOO
//P   P L     A   A    Z  O   O      F     O   O R   R    Z  O   O S     O   O
//PPPP  L     AAAAA   Z   O   O      FFF   O   O RRRR    Z   O   O  SSS  O   O
//P     L     A   A  Z    O   O      F     O   O R   R  Z    O   O     S O   O
//P     LLLLL A   A ZZZZZ  OOO       F      OOO  R   R ZZZZZ  OOO  SSSS   OOO

router.route('/catalogs/forcedTerms')
    .get(forcedTermController.getForcedTerms);

router.route('/catalogs/forcedTerm')
    .get(forcedTermController.getForcedTerm)
    .post(forcedTermController.postForcedTerm)
    .put(forcedTermController.putForcedTerm)
    .delete(forcedTermController.deleteForcedTerm);

export default router;