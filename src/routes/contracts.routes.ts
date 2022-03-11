import { Router } from 'express';
import { ContractController } from '../controllers/contracts';

const router = Router();

// CCCC  OOO  N   N TTTTT RRRR   AAA  TTTTT  OOO   SSSS
//C     O   O NN  N   T   R   R A   A   T   O   O S
//C     O   O N N N   T   RRRR  AAAAA   T   O   O  SSS
//C     O   O N  NN   T   R   R A   A   T   O   O     S
// CCCC  OOO  N   N   T   R   R A   A   T    OOO  SSSS

let contractController: ContractController = new ContractController();

router.route('/contracts')
    .get(contractController.getContracts);

router.route('/contract')
    .get(contractController.getContract)
    .post(contractController.postContract)
    .put(contractController.putContract)
    .delete(contractController.deleteContract);

export default router;