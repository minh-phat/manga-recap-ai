export interface TtsLanguage {
    code: string;
    label: string;
    edgeVoice: string;
}
export declare const SUPPORTED_LANGUAGES: TtsLanguage[];
export declare const SUPPORTED_LANGUAGE_CODES: string[];
export declare function resolveEdgeVoice(languageCode: string): string;
export declare function resolveLanguageLabel(languageCode: string): string;
