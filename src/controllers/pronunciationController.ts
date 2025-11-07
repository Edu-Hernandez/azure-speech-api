import type { Request, Response, NextFunction } from 'express';
import type { AssessPronunciationDtoProps } from '../application/dtos/assessPronunciationDto.js';
import type { AssessPronunciationUseCase } from '../application/use-cases/assessPronunciationUseCase.js';
import { convertAudioToWav } from '../utils/convertAudio.js';

export class PronunciationController {
  constructor(private readonly assessPronunciationUseCase: AssessPronunciationUseCase) {}

  assess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sentence, language } = req.body as AssessPronunciationDtoProps;
      const file = req.file as Express.Multer.File;

      const isMP3 = ['audio/mpeg', 'audio/mp3', 'mp3'].includes(file.mimetype);
      const audioBuffer = isMP3 ? await convertAudioToWav(file.buffer) : file.buffer;

      const dto: AssessPronunciationDtoProps = { sentence, language };
      const result = await this.assessPronunciationUseCase.execute(dto, audioBuffer);

      res.json({
        message: 'Pronunciación evaluada correctamente',
        result,
        success: true,
      });
    } catch (error) {
      next(error);
    }
  };
}