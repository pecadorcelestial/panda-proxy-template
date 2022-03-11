import { Router } from 'express';
import { FileController } from '../controllers/files';

const router = Router();

let fileController: FileController = new FileController();

// AAA  RRRR   CCCC H   H IIIII V   V  OOO   SSSS
//A   A R   R C     H   H   I   V   V O   O S
//AAAAA RRRR  C     HHHHH   I   V   V O   O  SSS
//A   A R   R C     H   H   I    V V  O   O     S
//A   A R   R  CCCC H   H IIIII   V    OOO  SSSS

router.use('/uploads', fileController.getFile);
    
export default router;