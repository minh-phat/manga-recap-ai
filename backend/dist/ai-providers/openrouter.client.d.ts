import { AiProviderStrategy, DetectPanelsInput, GenerateNarrationInput, PanelBox, TranslateTextsInput } from './ai-provider.interface';
export declare class OpenRouterClient implements AiProviderStrategy {
    private readonly apiKey;
    private readonly modelId;
    constructor(apiKey: string, modelId: string);
    private chat;
    detectPanels({ imageBuffer, mimeType, }: DetectPanelsInput): Promise<PanelBox[]>;
    generateNarration({ panels, storySoFar, pageIndex, }: GenerateNarrationInput): Promise<string[]>;
    translateTexts({ texts, targetLanguage, }: TranslateTextsInput): Promise<string[]>;
}
