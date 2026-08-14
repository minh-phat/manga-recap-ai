import {
  computeEntryTimings,
  computeTotalDurationInFrames,
  estimateEntryDurationMs,
} from './duration.util';

describe('estimateEntryDurationMs', () => {
  it('clamps empty text to the minimum duration', () => {
    expect(estimateEntryDurationMs('')).toBe(3000);
  });

  it('clamps very long text to the maximum duration', () => {
    const longText = new Array(100).fill('word').join(' ');
    expect(estimateEntryDurationMs(longText)).toBe(8000);
  });

  it('scales with word count between the bounds', () => {
    const text = new Array(10).fill('word').join(' ');
    expect(estimateEntryDurationMs(text)).toBe(4000);
  });
});

describe('computeEntryTimings', () => {
  it('lays out sequential, non-overlapping timings', () => {
    const tenWords = new Array(10).fill('word').join(' ');
    const timings = computeEntryTimings([tenWords, ''], 30);
    expect(timings).toEqual([
      { from: 0, durationInFrames: 120 },
      { from: 120, durationInFrames: 90 },
    ]);
  });

  it('sums to the total duration in frames', () => {
    const timings = computeEntryTimings(['a', 'b', 'c'], 30);
    expect(computeTotalDurationInFrames(timings)).toBe(
      timings.reduce((sum, t) => sum + t.durationInFrames, 0),
    );
  });
});
