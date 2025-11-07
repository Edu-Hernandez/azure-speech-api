import type { AssessPronunciationDtoProps } from "../dtos/assessPronunciationDto.js";
import type { IPronunciationResult } from "../../interfaces/pronunciationResult.interface.js";
import type { AzureSpeechService } from "../../services/azureSpeechService.js";


export class AssessPronunciationUseCase {
  constructor(private readonly speechService: AzureSpeechService) {}

  async execute(dto: AssessPronunciationDtoProps, audioBuffer: Buffer): Promise<IPronunciationResult> {
    return this.speechService.assessPronunciation(dto.sentence, audioBuffer, dto.language);
  }
}