/**
 * Bounding box in normalized fractional coordinates (0..1), relative to the
 * image's own width/height — NOT absolute pixels. Vision models frequently
 * downscale images internally before "seeing" them, so pixel coordinates
 * they return are unreliable relative to the original resolution. Normalized
 * coordinates avoid that mismatch: we scale them against the real image
 * dimensions (read locally via sharp) when cropping.
 */
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

export interface NarrationPanelInput {
  imageBuffer: Buffer;
  mimeType: string;
}

export interface GenerateNarrationInput {
  panels: NarrationPanelInput[];
  storySoFar: string;
  pageIndex: number;
}

export interface TranslateTextsInput {
  texts: string[];
  targetLanguage: string;
}

export interface AiProviderStrategy {
  detectPanels(input: DetectPanelsInput): Promise<PanelBox[]>;
  generateNarration(input: GenerateNarrationInput): Promise<string[]>;
  translateTexts(input: TranslateTextsInput): Promise<string[]>;
}
