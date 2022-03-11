import { Router } from 'express';
import { ContactController } from '../controllers/contacts';

import multer from 'multer';

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

// CCCC  OOO  N   N TTTTT  AAA   CCCC TTTTT  OOO   SSSS
//C     O   O NN  N   T   A   A C       T   O   O S
//C     O   O N N N   T   AAAAA C       T   O   O  SSS
//C     O   O N  NN   T   A   A C       T   O   O     S
// CCCC  OOO  N   N   T   A   A  CCCC   T    OOO  SSSS

let contactController: ContactController = new ContactController();

router.route('/contacts')
    .get(contactController.getContacts)
    .post(upload.single('file'), contactController.postContacts);

router.route('/contact')
    .get(contactController.getContact)
    .post(contactController.postContact)
    .put(contactController.putContact)
    .delete(contactController.deleteContact);

export default router;