import { Router } from 'express';
import { AddressController } from '../controllers/addresses';

import multer from 'multer';
import { GoogleController } from '../controllers/google';
import { AddressTypeController } from '../controllers/catalogs/addressTypes';

const fileFilter = (request: Express.Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    if (!file.originalname.match(/\.(json)$/)) {
        let error: Error = { 
            message: 'El tipo de archivo no está permitido.' ,
            name: ''
        };
        return callback(error, false);
    }
    return callback(null, true);
};
let upload = multer({ fileFilter });

const router = Router();

//DDDD  IIIII RRRR  EEEEE  CCCC  CCCC IIIII  OOO  N   N EEEEE  SSSS
//D   D   I   R   R E     C     C       I   O   O NN  N E     S
//D   D   I   RRRR  EEE   C     C       I   O   O N N N EEE    SSS
//D   D   I   R   R E     C     C       I   O   O N  NN E         S
//DDDD  IIIII R   R EEEEE  CCCC  CCCC IIIII  OOO  N   N EEEEE SSSS

let addressController: AddressController = new AddressController();
let addressTypeController: AddressTypeController = new AddressTypeController();

router.route('/addresses')
    .get(addressController.getAddresses)
    .post(upload.single('file'), addressController.postAddresses);

router.route('/address')
    .get(addressController.getAddress)
    .post(addressController.postAddress)
    .put(addressController.putAddress)
    .delete(addressController.deleteAddress);

router.route('/catalogs/address/types')
    .get(addressTypeController.getAddressTypes);

router.route('/catalogs/address/type')
    .get(addressTypeController.getAddressType)
    .post(addressTypeController.postAddressType)
    .put(addressTypeController.putAddressType)
    .delete(addressTypeController.deleteAddressType);

// GGGG  OOO   OOO   GGGG L     EEEEE
//G     O   O O   O G     L     E
//G  GG O   O O   O G  GG L     EEE
//G   G O   O O   O G   G L     E
// GGGG  OOO   OOO   GGGG LLLLL EEEEE

let googleController: GoogleController = new GoogleController();

router.route('/google/coordinates2Address')
    .get(googleController.getAddressFromCoordinates);

export default router;