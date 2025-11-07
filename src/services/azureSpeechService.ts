import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import type { IPronunciationResult, IPronunciationStatistics, IWordStatistics } from '../interfaces/pronunciationResult.interface.js';
import type AzureSpeechConfig from '../config/azureSpeechConfig.js';


export class AzureSpeechService {
  constructor(private readonly config: AzureSpeechConfig) {}

  async assessPronunciation(sentence: string, audioBuffer: Buffer, language?: string): Promise<IPronunciationResult> {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      this.config.subscriptionKey,
      this.config.region
    );

    speechConfig.speechRecognitionLanguage = language ?? this.config.language;

    const audioConfig = sdk.AudioConfig.fromWavFileInput(audioBuffer);

    const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
      sentence,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      true
    );
    pronunciationConfig.enableProsodyAssessment = true;

    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    pronunciationConfig.applyTo(recognizer);

    try {
      const result = await this.recognizeOnce(recognizer);
      return this.processRecognitionResult(result);
    } finally {
      recognizer.close();
    }
  }

  private recognizeOnce(recognizer: sdk.SpeechRecognizer): Promise<sdk.SpeechRecognitionResult> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout: El reconocimiento tardó demasiado (30s)'));
      }, 30000);

      recognizer.recognizeOnceAsync(
        (result) => {
          clearTimeout(timeout);

          if (result.reason === sdk.ResultReason.RecognizedSpeech) {
            resolve(result);
          } else if (result.reason === sdk.ResultReason.NoMatch) {
            reject(new Error('No se detectó voz o no coincide con la frase esperada'));
          } else if (result.reason === sdk.ResultReason.Canceled) {
            const cancellation = sdk.CancellationDetails.fromResult(result);
            reject(new Error(`Cancelado: ${cancellation.reason} - ${cancellation.errorDetails}`));
          } else {
            reject(new Error(`No se pudo reconocer el audio. Reason: ${result.reason}`));
          }
        },
        (error) => {
          clearTimeout(timeout);
          reject(new Error(`Error al procesar el audio: ${error}`));
        }
      );
    });
  }

  private processRecognitionResult(result: sdk.SpeechRecognitionResult): IPronunciationResult {
    const pronunciationResult = sdk.PronunciationAssessmentResult.fromResult(result);

    const statistics: IPronunciationStatistics = {
      accuracy_score: pronunciationResult.accuracyScore,
      pronunciation_score: pronunciationResult.pronunciationScore,
      completeness_score: pronunciationResult.completenessScore,
      fluency_score: pronunciationResult.fluencyScore,
      prosody_score: pronunciationResult.prosodyScore,
    };

    const words: IWordStatistics[] =
      pronunciationResult.detailResult.Words?.map((word: any, idx: number) => {
        const syllables = (word.Syllables ?? []).map((syllable: any, sIdx: number) => ({
          index: sIdx + 1,
          syllable: syllable.Syllable,
          accuracyScore: syllable.PronunciationAssessment?.AccuracyScore ?? 0,
          errorType: syllable.PronunciationAssessment?.ErrorType ?? 'None',
          offsetMs: (syllable.Offset ?? 0) / 10000,
          durationMs: (syllable.Duration ?? 0) / 10000,
        }));

        const phonemes = (word.Phonemes ?? []).map((phoneme: any, pIdx: number) => ({
          index: pIdx + 1,
          phoneme: phoneme.Phoneme,
          accuracyScore: phoneme.PronunciationAssessment?.AccuracyScore ?? 0,
          errorType: phoneme.PronunciationAssessment?.ErrorType ?? 'None',
          offsetMs: (phoneme.Offset ?? 0) / 10000,
          durationMs: (phoneme.Duration ?? 0) / 10000,
        }));

        return {
          index: idx + 1,
          word: word.Word,
          pronunciation: word.PronunciationAssessment.AccuracyScore,
          pronunciationAssessment: word.PronunciationAssessment.ErrorType,
          syllables,
          phonemes,
        };
      }) ?? [];

    return {
      statistics_sentence: statistics,
      words,
      recognized_text: result.text,
    };
  }
}