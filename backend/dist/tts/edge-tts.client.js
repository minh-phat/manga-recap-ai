"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdgeTtsClient = void 0;
const common_1 = require("@nestjs/common");
const msedge_tts_1 = require("msedge-tts");
let EdgeTtsClient = class EdgeTtsClient {
    async synthesize(text, voiceName) {
        const tts = new msedge_tts_1.MsEdgeTTS();
        await tts.setMetadata(voiceName, msedge_tts_1.OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
        const { audioStream } = tts.toStream(text);
        const chunks = [];
        await new Promise((resolve, reject) => {
            audioStream.on('data', (chunk) => chunks.push(chunk));
            audioStream.on('close', () => resolve());
            audioStream.on('error', (error) => reject(error));
        });
        tts.close();
        return Buffer.concat(chunks);
    }
};
exports.EdgeTtsClient = EdgeTtsClient;
exports.EdgeTtsClient = EdgeTtsClient = __decorate([
    (0, common_1.Injectable)()
], EdgeTtsClient);
//# sourceMappingURL=edge-tts.client.js.map