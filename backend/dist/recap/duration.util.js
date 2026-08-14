"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VIDEO_FPS = void 0;
exports.estimateEntryDurationMs = estimateEntryDurationMs;
exports.computeEntryTimings = computeEntryTimings;
exports.computeTotalDurationInFrames = computeTotalDurationInFrames;
exports.computeEntryTimingsFromDurations = computeEntryTimingsFromDurations;
exports.resolveEntryTimings = resolveEntryTimings;
exports.VIDEO_FPS = 30;
const MIN_ENTRY_DURATION_MS = 3000;
const MAX_ENTRY_DURATION_MS = 8000;
const READING_SPEED_MS_PER_WORD = 400;
function estimateEntryDurationMs(narrationText) {
    const wordCount = narrationText.trim().length
        ? narrationText.trim().split(/\s+/).length
        : 0;
    const estimated = wordCount * READING_SPEED_MS_PER_WORD;
    return Math.min(MAX_ENTRY_DURATION_MS, Math.max(MIN_ENTRY_DURATION_MS, estimated));
}
function computeEntryTimings(narrationTexts, fps = exports.VIDEO_FPS) {
    let from = 0;
    return narrationTexts.map((text) => {
        const durationInFrames = Math.round((estimateEntryDurationMs(text) / 1000) * fps);
        const timing = { from, durationInFrames };
        from += durationInFrames;
        return timing;
    });
}
function computeTotalDurationInFrames(timings) {
    return timings.reduce((sum, timing) => sum + timing.durationInFrames, 0);
}
function computeEntryTimingsFromDurations(durationsMs, fps = exports.VIDEO_FPS) {
    let from = 0;
    return durationsMs.map((durationMs) => {
        const clampedMs = Math.min(MAX_ENTRY_DURATION_MS, Math.max(MIN_ENTRY_DURATION_MS, durationMs));
        const durationInFrames = Math.round((clampedMs / 1000) * fps);
        const timing = { from, durationInFrames };
        from += durationInFrames;
        return timing;
    });
}
function resolveEntryTimings(entries, fps = exports.VIDEO_FPS) {
    if (entries.length > 0 && entries.every((e) => typeof e.durationMs === 'number')) {
        return computeEntryTimingsFromDurations(entries.map((e) => e.durationMs), fps);
    }
    return computeEntryTimings(entries.map((e) => e.narrationText), fps);
}
//# sourceMappingURL=duration.util.js.map