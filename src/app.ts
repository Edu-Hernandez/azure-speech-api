import express from 'express';
import dotenv from 'dotenv';
import AzureSpeechConfig from './config/azureSpeechConfig.js';
import { AzureSpeechService } from './services/azureSpeechService.js';
import { AssessPronunciationUseCase } from './application/use-cases/assessPronunciationUseCase.js';
import { PronunciationController } from './controllers/pronunciationController.js';
import { pronunciationRoutes } from './routes/pronunciationRoutes.js';
import type { Request, Response, NextFunction } from 'express';

dotenv.config();

const app = express();
app.use(express.json());

const config = new AzureSpeechConfig(process.env);
const speechService = new AzureSpeechService(config);
const assessPronunciationUseCase = new AssessPronunciationUseCase(speechService);
const pronunciationController = new PronunciationController(assessPronunciationUseCase);

app.use('/pronunciation', pronunciationRoutes(pronunciationController));

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: err.message ?? 'Error interno', success: false });
});

export default app;