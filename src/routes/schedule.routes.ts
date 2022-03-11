import { Router } from 'express';
import { ScheduleController } from '../controllers/schedule';

const router = Router();

// CCCC  OOO  N   N TTTTT  AAA   CCCC TTTTT  OOO   SSSS
//C     O   O NN  N   T   A   A C       T   O   O S
//C     O   O N N N   T   AAAAA C       T   O   O  SSS
//C     O   O N  NN   T   A   A C       T   O   O     S
// CCCC  OOO  N   N   T   A   A  CCCC   T    OOO  SSSS

let scheduleController: ScheduleController = new ScheduleController();

router.route('/schedules')
    .get(scheduleController.getSchedules);

router.route('/schedule')
    .get(scheduleController.getSchedule)
    .post(scheduleController.postSchedule)
    .put(scheduleController.putSchedule)
    .delete(scheduleController.deleteSchedule);

export default router;