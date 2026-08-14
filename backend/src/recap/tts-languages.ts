export interface TtsLanguage {
  code: string;
  label: string;
  edgeVoice: string;
}

export const SUPPORTED_LANGUAGES: TtsLanguage[] = [
  { code: 'vi-VN', label: 'Tiếng Việt', edgeVoice: 'vi-VN-HoaiMyNeural' },
  { code: 'en-US', label: 'English', edgeVoice: 'en-US-AriaNeural' },
  { code: 'ja-JP', label: '日本語', edgeVoice: 'ja-JP-NanamiNeural' },
  { code: 'ko-KR', label: '한국어', edgeVoice: 'ko-KR-SunHiNeural' },
  { code: 'zh-CN', label: '中文', edgeVoice: 'zh-CN-XiaoxiaoNeural' },
  { code: 'fr-FR', label: 'Français', edgeVoice: 'fr-FR-DeniseNeural' },
  { code: 'es-ES', label: 'Español', edgeVoice: 'es-ES-ElviraNeural' },
];

export const SUPPORTED_LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);

export function resolveEdgeVoice(languageCode: string): string {
  const match = SUPPORTED_LANGUAGES.find((l) => l.code === languageCode);
  if (!match) {
    throw new Error(`Unsupported TTS language: ${languageCode}`);
  }
  return match.edgeVoice;
}

export function resolveLanguageLabel(languageCode: string): string {
  return (
    SUPPORTED_LANGUAGES.find((l) => l.code === languageCode)?.label ??
    languageCode
  );
}
