"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_LANGUAGE_CODES = exports.SUPPORTED_LANGUAGES = void 0;
exports.resolveEdgeVoice = resolveEdgeVoice;
exports.resolveLanguageLabel = resolveLanguageLabel;
exports.SUPPORTED_LANGUAGES = [
    { code: 'vi-VN', label: 'Tiếng Việt', edgeVoice: 'vi-VN-HoaiMyNeural' },
    { code: 'en-US', label: 'English', edgeVoice: 'en-US-AriaNeural' },
    { code: 'ja-JP', label: '日本語', edgeVoice: 'ja-JP-NanamiNeural' },
    { code: 'ko-KR', label: '한국어', edgeVoice: 'ko-KR-SunHiNeural' },
    { code: 'zh-CN', label: '中文', edgeVoice: 'zh-CN-XiaoxiaoNeural' },
    { code: 'fr-FR', label: 'Français', edgeVoice: 'fr-FR-DeniseNeural' },
    { code: 'es-ES', label: 'Español', edgeVoice: 'es-ES-ElviraNeural' },
];
exports.SUPPORTED_LANGUAGE_CODES = exports.SUPPORTED_LANGUAGES.map((l) => l.code);
function resolveEdgeVoice(languageCode) {
    const match = exports.SUPPORTED_LANGUAGES.find((l) => l.code === languageCode);
    if (!match) {
        throw new Error(`Unsupported TTS language: ${languageCode}`);
    }
    return match.edgeVoice;
}
function resolveLanguageLabel(languageCode) {
    return (exports.SUPPORTED_LANGUAGES.find((l) => l.code === languageCode)?.label ??
        languageCode);
}
//# sourceMappingURL=tts-languages.js.map