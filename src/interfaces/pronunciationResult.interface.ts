export interface ISyllableStatistics {
    index: number;
    syllable: string;
    accuracyScore: number;
    errorType: string;
    offsetMs: number;
    durationMs: number;
}

export interface IPhonemeStatistics {
    index: number;
    phoneme: string;
    accuracyScore: number;
    errorType: string;
    offsetMs: number;
    durationMs: number;
}

export interface IWordStatistics {
    index: number;
    word: string;
    pronunciation: number;
    pronunciationAssessment: string;
    syllables: ISyllableStatistics[];
    phonemes: IPhonemeStatistics[];
}

export interface IPronunciationStatistics {
    accuracy_score: number;
    pronunciation_score: number;
    completeness_score: number;
    fluency_score: number;
    prosody_score: number;
}

export interface IPronunciationResult {
    statistics_sentence: IPronunciationStatistics;
    words: IWordStatistics[];
    recognized_text: string;
}