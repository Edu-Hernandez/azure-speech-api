class AzureSpeechConfig {
    constructor(private readonly config: NodeJS.ProcessEnv) {}

    get subscriptionKey(): string {
        const key = this.config.AZURE_SPEECH_KEY;
        if (!key) {
            throw new Error('AZURE_SPEECH_KEY no está configurado');
        }
        return key;
    }

    get region(): string {
        const region = this.config.AZURE_SPEECH_REGION;
        if (!region) {
            throw new Error('AZURE_SPEECH_REGION no está configurado');
        }
        return region;
    }

    get language(): string {
        const language = this.config.AZURE_SPEECH_LANGUAGE;
        if (!language) {
            throw new Error('AZURE_SPEECH_LANGUAGE no está configurado');
        }
        return language;
    }
}

export default AzureSpeechConfig;