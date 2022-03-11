import { Router } from 'express';
import GeneralSettingsController from '../controllers/generalSettings';
import TaxRegimeController from '../controllers/catalogs/taxRegimes';

import multer from 'multer';
let upload = multer();
let fields = [
    {
        name: 'logo',
        maxCount: 1
    },
    {
        name: 'csd',
        maxCount: 1
    },
    {
        name: 'key',
        maxCount: 1
    }
];

const router = Router();

let generalSettingsController: GeneralSettingsController = new GeneralSettingsController();
let taxRegimenController: TaxRegimeController = new TaxRegimeController();

// CCCC  OOO  N   N FFFFF IIIII  GGGG U   U RRRR   AAA   CCCC IIIII  OOO  N   N
//C     O   O NN  N F       I   G     U   U R   R A   A C       I   O   O NN  N
//C     O   O N N N FFF     I   G  GG U   U RRRR  AAAAA C       I   O   O N N N
//C     O   O N  NN F       I   G   G U   U R   R A   A C       I   O   O N  NN
// CCCC  OOO  N   N F     IIIII  GGGG  UUU  R   R A   A  CCCC IIIII  OOO  N   N

router.route('/generalSettings')
    .get(generalSettingsController.getGeneralSettings);

router.route('/generalSetting')
    .post(upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'csd', maxCount: 1 }, { name: 'key', maxCount: 1 }]), generalSettingsController.postGeneralSetting)
    .get(generalSettingsController.getGeneralSetting)
    .put(upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'csd', maxCount: 1 }, { name: 'key', maxCount: 1 }]), generalSettingsController.putGeneralSetting)
    .delete(generalSettingsController.deleteGeneralSetting);

//RRRR  EEEEE  GGGG IIIII M   M EEEEE N   N      FFFFF IIIII  SSSS  CCCC  AAA  L
//R   R E     G       I   MM MM E     NN  N      F       I   S     C     A   A L
//RRRR  EEE   G  GG   I   M M M EEE   N N N      FFF     I    SSS  C     AAAAA L
//R   R E     G   G   I   M   M E     N  NN      F       I       S C     A   A L
//R   R EEEEE  GGGG IIIII M   M EEEEE N   N      F     IIIII SSSS   CCCC A   A LLLLL

router.route('/catalogs/taxRegimes')
    .get(taxRegimenController.getTaxRegimes);

router.route('/catalogs/taxRegime')
    .get(taxRegimenController.getTaxRegime)
    .post(taxRegimenController.postTaxRegime)
    .put(taxRegimenController.putTaxRegime)
    .delete(taxRegimenController.deleteTaxRegime);

export default router;