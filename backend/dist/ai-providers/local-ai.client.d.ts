import { AiProviderStrategy, DetectPanelsInput, GenerateNarrationInput, PanelBox, RedetectPanelBoxInput, TranslateTextsInput } from './ai-provider.interface';
export declare class LocalAiClient implements AiProviderStrategy {
    private readonly modelId;
    private readonly baseUrl;
    constructor(modelId: string, baseUrl: string);
    private chat;
    detectPanels({ imageBuffer, mimeType, }: DetectPanelsInput): Promise<PanelBox[]>;
    redetectPanelBox({ imageBuffer, mimeType, previousBox, order, totalPanels, }: RedetectPanelBoxInput): Promise<PanelBox>;
    generateNarration({ panels, storySoFar, pageIndex, language, }: GenerateNarrationInput): Promise<string[]>;
    translateTexts({ texts, targetLanguage, }: TranslateTextsInput): Promise<string[]>;
}
