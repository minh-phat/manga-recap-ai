import { AiProviderStrategy, DetectPanelsInput, GenerateNarrationInput, PanelBox, RedetectPanelBoxInput, TranslateTextsInput } from './ai-provider.interface';
export declare class OpenRouterClient implements AiProviderStrategy {
    private readonly apiKey;
    private readonly modelId;
    constructor(apiKey: string, modelId: string);
    private chat;
    detectPanels({ imageBuffer, mimeType, }: DetectPanelsInput): Promise<PanelBox[]>;
    redetectPanelBox({ imageBuffer, mimeType, previousBox, order, totalPanels, }: RedetectPanelBoxInput): Promise<PanelBox>;
    generateNarration({ panels, storySoFar, pageIndex, language, }: GenerateNarrationInput): Promise<string[]>;
    translateTexts({ texts, targetLanguage, }: TranslateTextsInput): Promise<string[]>;
}
