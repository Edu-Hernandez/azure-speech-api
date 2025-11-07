import { Router } from 'express';
import multer from 'multer';
import type { PronunciationController } from '../controllers/pronunciationController.js';
import { validateBody } from '../middlewares/validateBody.js';
import { ensureFile } from '../middlewares/ensureFile.js';
import { AssessPronunciationDto } from '../application/dtos/assessPronunciationDto.js';

export const pronunciationRoutes = (controller: PronunciationController): Router => {
  const router = Router();
  const upload = multer();

  router.post(
    '/assess',
    upload.single('file'),
    ensureFile('file'),
    validateBody(AssessPronunciationDto),
    controller.assess,
  );

  return router;
};