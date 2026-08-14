export declare const VIDEO_FPS = 30;
export declare function estimateEntryDurationMs(narrationText: string): number;
export interface EntryTiming {
    from: number;
    durationInFrames: number;
}
export declare function computeEntryTimings(narrationTexts: string[], fps?: number): EntryTiming[];
export declare function computeTotalDurationInFrames(timings: EntryTiming[]): number;
