import { AiProviderStrategy, DetectPanelsInput, GenerateNarrationInput, PanelBox, TranslateTextsInput } from './ai-provider.interface';
export declare class LocalAiClient implements AiProviderStrategy {
    private readonly modelId;
    private readonly baseUrl;
    constructor(modelId: string, baseUrl: string);
    private chat;
    detectPanels({ imageBuffer, mimeType, }: DetectPanelsInput): Promise<PanelBox[]>;
    generateNarration({ panels, storySoFar, pageIndex, language, }: GenerateNarrationInput): Promise<string[]>;
    translateTexts({ texts, targetLanguage, }: TranslateTextsInput): Promise<string[]>;
}
