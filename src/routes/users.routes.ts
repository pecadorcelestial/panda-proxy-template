import { Router } from 'express';
import { UserController, ClientUserController } from '../controllers/users';
import { DepartmentController } from '../controllers/catalogs/departments';
import { ModuleController } from '../controllers/catalogs/modules';
import { RoleController } from '../controllers/catalogs/roles';
import { UserStatusController } from '../controllers/catalogs/userStatuses';

const router = Router();

//U   U  SSSS U   U  AAA  RRRR  IIIII  OOO   SSSS
//U   U S     U   U A   A R   R   I   O   O S
//U   U  SSS  U   U AAAAA RRRR    I   O   O  SSS
//U   U     S U   U A   A R   R   I   O   O     S
// UUU  SSSS   UUU  A   A R   R IIIII  OOO  SSSS

let userController: UserController = new UserController();

router.route('/users')
    .get(userController.getUsers);

router.route('/user')
    .get(userController.getUser)
    .post(userController.postUser)
    .put(userController.putUser)
    .delete(userController.deleteUser);

router.route('/user/permissions')
    .get(userController.getUserPermissions);

//DDDD  EEEEE PPPP   AAA  RRRR  TTTTT  AAA  M   M EEEEE N   N TTTTT  OOO   SSSS
//D   D E     P   P A   A R   R   T   A   A MM MM E     NN  N   T   O   O S
//D   D EEE   PPPP  AAAAA RRRR    T   AAAAA M M M EEE   N N N   T   O   O  SSS
//D   D E     P     A   A R   R   T   A   A M   M E     N  NN   T   O   O     S
//DDDD  EEEEE P     A   A R   R   T   A   A M   M EEEEE N   N   T    OOO  SSSS

let departmentController: DepartmentController = new DepartmentController();

router.route('/catalogs/departments')
    .get(departmentController.getDepartments);

router.route('/catalogs/department')
    .get(departmentController.getDepartment)
    .post(departmentController.postDepartment)
    .put(departmentController.putDepartment)
    .delete(departmentController.deleteDepartment);

//M   M  OOO  DDDD  U   U L      OOO   SSSS
//MM MM O   O D   D U   U L     O   O S
//M M M O   O D   D U   U L     O   O  SSS
//M   M O   O D   D U   U L     O   O     S
//M   M  OOO  DDDD   UUU  LLLLL  OOO  SSSS

let moduleController: ModuleController = new ModuleController();

router.route('/catalogs/modules')
    .get(moduleController.getModules);

router.route('/catalogs/module')
    .get(moduleController.getModule)
    .post(moduleController.postModule)
    .put(moduleController.putModule)
    .delete(moduleController.deleteModule);

//RRRR   OOO  L     EEEEE  SSSS
//R   R O   O L     E     S
//RRRR  O   O L     EEE    SSS
//R   R O   O L     E         S
//R   R  OOO  LLLLL EEEEE SSSS

let roleController: RoleController = new RoleController();

router.route('/catalogs/roles')
    .get(roleController.getRoles);

router.route('/catalogs/role')
    .get(roleController.getRole)
    .post(roleController.postRole)
    .put(roleController.putRole)
    .delete(roleController.deleteRole);

// CCCC L     IIIII EEEEE N   N TTTTT EEEEE  SSSS
//C     L       I   E     NN  N   T   E     S
//C     L       I   EEE   N N N   T   EEE    SSS
//C     L       I   E     N  NN   T   E         S
// CCCC LLLLL IIIII EEEEE N   N   T   EEEEE SSSS

let clientUserController: ClientUserController = new ClientUserController();

router.route('/users/clients')
    .get(clientUserController.getUsers);
    // .post(clientUserController.postUsers);

router.route('/users/clients/sendCredentials')
    .get(clientUserController.sendUserCredentials);

router.route('/user/client')
    .get(clientUserController.getUser)
    .post(clientUserController.postUser)
    .put(clientUserController.putUser)
    .delete(clientUserController.deleteUser);

router.route('/user/client/validate')
    .post(clientUserController.validatePassword);

//EEEEE  SSSS TTTTT  AAA  TTTTT U   U  SSSS
//E     S       T   A   A   T   U   U S
//EEE    SSS    T   AAAAA   T   U   U  SSS
//E         S   T   A   A   T   U   U     S
//EEEEE SSSS    T   A   A   T    UUU  SSSS

let userStatusController: UserStatusController = new UserStatusController();

router.route('/catalogs/user/statuses')
    .get(userStatusController.getUserStatuses);

router.route('/catalogs/user/status')
    .get(userStatusController.getUserStatus)
    .post(userStatusController.postUserStatus)
    .put(userStatusController.putUserStatus)
    .delete(userStatusController.deleteUserStatus);

export default router;