import { Router } from 'express';
// Controladores.
import { MovementController } from '../controllers/inventory';
import { MovementStatusController } from '../controllers/catalogs/movementStatuses';
import { MovementTypeController } from '../controllers/catalogs/movementTypes';

const router = Router();

//M   M  OOO  V   V IIIII M   M IIIII EEEEE N   N TTTTT  OOO   SSSS
//MM MM O   O V   V   I   MM MM   I   E     NN  N   T   O   O S
//M M M O   O V   V   I   M M M   I   EEE   N N N   T   O   O  SSS
//M   M O   O  V V    I   M   M   I   E     N  NN   T   O   O     S
//M   M  OOO    V   IIIII M   M IIIII EEEEE N   N   T    OOO  SSSS

let movementController: MovementController = new MovementController();

router.route('/movements')
    .get(movementController.getMovements);

    router.route('/movement')
    .get(movementController.getMovement)
    .post(movementController.postMovement)
    .put(movementController.putMovement)
    .delete(movementController.deleteMovement);

//EEEEE  SSSS TTTTT  AAA  TTTTT U   U  SSSS
//E     S       T   A   A   T   U   U S
//EEE    SSS    T   AAAAA   T   U   U  SSS
//E         S   T   A   A   T   U   U     S
//EEEEE SSSS    T   A   A   T    UUU  SSSS

let movementStatusController: MovementStatusController = new MovementStatusController();
    
router.route('/catalogs/movement/statuses')
    .get(movementStatusController.getMovementStatuses);

router.route('/catalogs/movement/status')
    .get(movementStatusController.getMovementStatus)
    .post(movementStatusController.postMovementStatus)
    .put(movementStatusController.putMovementStatus)
    .delete(movementStatusController.deleteMovementStatus);

//TTTTT IIIII PPPP   OOO   SSSS
//  T     I   P   P O   O S
//  T     I   PPPP  O   O  SSS
//  T     I   P     O   O     S
//  T   IIIII P      OOO  SSSS

let movementTypeController: MovementTypeController = new MovementTypeController();
        
router.route('/catalogs/movement/types')
    .get(movementTypeController.getMovementTypes);

router.route('/catalogs/movement/type')
    .get(movementTypeController.getMovementType)
    .post(movementTypeController.postMovementType)
    .put(movementTypeController.putMovementType)
    .delete(movementTypeController.deleteMovementType);

export default router;