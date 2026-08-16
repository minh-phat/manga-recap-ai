export declare class EdgeTtsClient {
    private readonly logger;
    synthesize(text: string, voiceName: string): Promise<Buffer>;
    private synthesizeOnce;
}
