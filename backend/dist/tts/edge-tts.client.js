"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EdgeTtsClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdgeTtsClient = void 0;
const common_1 = require("@nestjs/common");
const msedge_tts_1 = require("msedge-tts");
const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 500;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
let EdgeTtsClient = EdgeTtsClient_1 = class EdgeTtsClient {
    logger = new common_1.Logger(EdgeTtsClient_1.name);
    async synthesize(text, voiceName, prosody) {
        let lastError;
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
            try {
                return await this.synthesizeOnce(text, voiceName, prosody);
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                if (attempt < MAX_ATTEMPTS) {
                    const delay = BASE_DELAY_MS * 2 ** (attempt - 1) + Math.random() * 250;
                    this.logger.warn(`Edge TTS synthesis attempt ${attempt}/${MAX_ATTEMPTS} failed (${lastError.message}), retrying in ${Math.round(delay)}ms`);
                    await sleep(delay);
                }
            }
        }
        throw lastError;
    }
    async synthesizeOnce(text, voiceName, prosody) {
        const tts = new msedge_tts_1.MsEdgeTTS();
        await tts.setMetadata(voiceName, msedge_tts_1.OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
        const { audioStream } = tts.toStream(text, prosody);
        try {
            const chunks = [];
            await new Promise((resolve, reject) => {
                audioStream.on('data', (chunk) => chunks.push(chunk));
                audioStream.on('close', () => resolve());
                audioStream.on('error', (error) => reject(error));
            });
            return Buffer.concat(chunks);
        }
        finally {
            tts.close();
        }
    }
};
exports.EdgeTtsClient = EdgeTtsClient;
exports.EdgeTtsClient = EdgeTtsClient = EdgeTtsClient_1 = __decorate([
    (0, common_1.Injectable)()
], EdgeTtsClient);
//# sourceMappingURL=edge-tts.client.js.map