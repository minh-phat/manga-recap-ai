export declare const VIDEO_FPS = 30;
export declare function estimateEntryDurationMs(narrationText: string): number;
export interface EntryTiming {
    from: number;
    durationInFrames: number;
}
export declare function computeEntryTimings(narrationTexts: string[], fps?: number): EntryTiming[];
export declare function computeTotalDurationInFrames(timings: EntryTiming[]): number;
export declare function computeEntryTimingsFromDurations(durationsMs: number[], fps?: number): EntryTiming[];
export interface TimedEntry {
    narrationText: string;
    durationMs?: number;
}
export declare function resolveEntryTimings(entries: TimedEntry[], fps?: number): EntryTiming[];
