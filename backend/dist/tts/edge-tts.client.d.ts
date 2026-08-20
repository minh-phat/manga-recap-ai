import { ProsodyOptions } from 'msedge-tts';
export declare class EdgeTtsClient {
    private readonly logger;
    synthesize(text: string, voiceName: string, prosody?: ProsodyOptions): Promise<Buffer>;
    private synthesizeOnce;
}
