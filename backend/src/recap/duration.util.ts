export const VIDEO_FPS = 30;

const MIN_ENTRY_DURATION_MS = 3000;
const MAX_ENTRY_DURATION_MS = 8000;
const READING_SPEED_MS_PER_WORD = 400;

export function estimateEntryDurationMs(narrationText: string): number {
  const wordCount = narrationText.trim().length
    ? narrationText.trim().split(/\s+/).length
    : 0;
  const estimated = wordCount * READING_SPEED_MS_PER_WORD;
  return Math.min(
    MAX_ENTRY_DURATION_MS,
    Math.max(MIN_ENTRY_DURATION_MS, estimated),
  );
}

export interface EntryTiming {
  from: number;
  durationInFrames: number;
}

export function computeEntryTimings(
  narrationTexts: string[],
  fps: number = VIDEO_FPS,
): EntryTiming[] {
  let from = 0;
  return narrationTexts.map((text) => {
    const durationInFrames = Math.round(
      (estimateEntryDurationMs(text) / 1000) * fps,
    );
    const timing: EntryTiming = { from, durationInFrames };
    from += durationInFrames;
    return timing;
  });
}

export function computeTotalDurationInFrames(timings: EntryTiming[]): number {
  return timings.reduce((sum, timing) => sum + timing.durationInFrames, 0);
}
