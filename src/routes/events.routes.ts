import { Router } from 'express';
import { EventController } from '../controllers/events';
import { EventTypeController } from '../controllers/catalogs/eventTypes';

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

//EEEEE V   V EEEEE N   N TTTTT  OOO   SSSS
//E     V   V E     NN  N   T   O   O S
//EEE   V   V EEE   N N N   T   O   O  SSS
//E      V V  E     N  NN   T   O   O     S
//EEEEE   V   EEEEE N   N   T    OOO  SSSS

let eventController: EventController = new EventController();
let eventTypeController: EventTypeController = new EventTypeController();

router.route('/events')
    .get(eventController.getEvents)
    .post(upload.single('file'), eventController.postEvents);

router.route('/event')
    .get(eventController.getEvent)
    .post(eventController.postEvent)
    .put(eventController.putEvent)
    .delete(eventController.deleteEvent);

//TTTTT IIIII PPPP   OOO   SSSS      DDDD  EEEEE      EEEEE V   V EEEEE N   N TTTTT  OOO   SSSS
//  T     I   P   P O   O S          D   D E          E     V   V E     NN  N   T   O   O S
//  T     I   PPPP  O   O  SSS       D   D EEE        EEE   V   V EEE   N N N   T   O   O  SSS
//  T     I   P     O   O     S      D   D E          E      V V  E     N  NN   T   O   O     S
//  T   IIIII P      OOO  SSSS       DDDD  EEEEE      EEEEE   V   EEEEE N   N   T    OOO  SSSS

router.route('/catalogs/event/types')
    .get(eventTypeController.getEventTypes);
        
router.route('/catalogs/event/type')
    .get(eventTypeController.getEventType)
    .post(eventTypeController.postEventType)
    .put(eventTypeController.putEventType)
    .delete(eventTypeController.deleteEventType);

export default router;