export interface PanelBox {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface DetectPanelsInput {
    imageBuffer: Buffer;
    mimeType: string;
}
export interface RedetectPanelBoxInput {
    imageBuffer: Buffer;
    mimeType: string;
    previousBox: PanelBox;
    order: number;
    totalPanels: number;
}
export interface NarrationPanelInput {
    imageBuffer: Buffer;
    mimeType: string;
}
export interface GenerateNarrationInput {
    panels: NarrationPanelInput[];
    storySoFar: string;
    pageIndex: number;
    language: string;
}
export interface TranslateTextsInput {
    texts: string[];
    targetLanguage: string;
}
export interface AiProviderStrategy {
    detectPanels(input: DetectPanelsInput): Promise<PanelBox[]>;
    redetectPanelBox(input: RedetectPanelBoxInput): Promise<PanelBox>;
    generateNarration(input: GenerateNarrationInput): Promise<string[]>;
    translateTexts(input: TranslateTextsInput): Promise<string[]>;
}
