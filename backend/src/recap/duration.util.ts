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

export function computeEntryTimingsFromDurations(
  durationsMs: number[],
  fps: number = VIDEO_FPS,
): EntryTiming[] {
  let from = 0;
  return durationsMs.map((durationMs) => {
    const clampedMs = Math.min(
      MAX_ENTRY_DURATION_MS,
      Math.max(MIN_ENTRY_DURATION_MS, durationMs),
    );
    const durationInFrames = Math.round((clampedMs / 1000) * fps);
    const timing: EntryTiming = { from, durationInFrames };
    from += durationInFrames;
    return timing;
  });
}

export interface TimedEntry {
  narrationText: string;
  durationMs?: number;
}

export function resolveEntryTimings(
  entries: TimedEntry[],
  fps: number = VIDEO_FPS,
): EntryTiming[] {
  if (entries.length > 0 && entries.every((e) => typeof e.durationMs === 'number')) {
    return computeEntryTimingsFromDurations(
      entries.map((e) => e.durationMs as number),
      fps,
    );
  }
  return computeEntryTimings(
    entries.map((e) => e.narrationText),
    fps,
  );
}
