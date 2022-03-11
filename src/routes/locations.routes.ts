import { Router } from 'express';
import { LocationController } from '../controllers/locations';

const router = Router();

//U   U BBBB  IIIII  CCCC  AAA   CCCC IIIII  OOO  N   N EEEEE  SSSS
//U   U B   B   I   C     A   A C       I   O   O NN  N E     S
//U   U BBBB    I   C     AAAAA C       I   O   O N N N EEE    SSS
//U   U B   B   I   C     A   A C       I   O   O N  NN E         S
// UUU  BBBB  IIIII  CCCC A   A  CCCC IIIII  OOO  N   N EEEEE SSSS

let locationController: LocationController = new LocationController();

router.route('/zipCodes')
    .get(locationController.getZipCodes);

router.route('/updateZipCodes')
    .put(locationController.putUpdateZipCodes);

router.route('/catalogs/countries')
    .get(locationController.getCountries);

router.route('/catalogs/states')
    .get(locationController.getStates);

router.route('/catalogs/towns')
    .get(locationController.getTowns);

router.route('/catalogs/settlements')
    .get(locationController.getSettlements);

export default router;