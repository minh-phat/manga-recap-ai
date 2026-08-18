import { kenBurnsFrameAt, planKenBurnsEffect } from './ken-burns.util';

const FRAME_ASPECT_RATIO = 1280 / 720;

describe('planKenBurnsEffect', () => {
  it('is deterministic for the same seed and aspect ratio', () => {
    expect(planKenBurnsEffect('panel-1', 0.6)).toEqual(
      planKenBurnsEffect('panel-1', 0.6),
    );
  });

  it('picks a vertical pan for a tall image', () => {
    const plan = planKenBurnsEffect('panel-1', 0.6);
    expect(plan.fit).toBe('width');
    expect(['panUp', 'panDown']).toContain(plan.effect);
    expect(plan.amplitudePercent).toBeGreaterThan(0);
  });

  it('picks a horizontal pan for a wide image', () => {
    const plan = planKenBurnsEffect('panel-1', 3.5);
    expect(plan.fit).toBe('height');
    expect(['panLeft', 'panRight']).toContain(plan.effect);
    expect(plan.amplitudePercent).toBeGreaterThan(0);
  });

  it('picks zoom when the image already matches the frame ratio', () => {
    const plan = planKenBurnsEffect('panel-1', FRAME_ASPECT_RATIO);
    expect(plan.fit).toBe('cover');
    expect(['zoomIn', 'zoomOut']).toContain(plan.effect);
    expect(plan.amplitudePercent).toBe(0);
  });

  it('falls back to zoom when aspect ratio is missing or invalid', () => {
    expect(planKenBurnsEffect('panel-1', undefined).fit).toBe('cover');
    expect(planKenBurnsEffect('panel-1', 0).fit).toBe('cover');
    expect(planKenBurnsEffect('panel-1', -1).fit).toBe('cover');
  });

  it('caps pan amplitude at the maximum for extreme aspect ratios', () => {
    const plan = planKenBurnsEffect('panel-1', 0.1);
    expect(plan.fit).toBe('width');
    expect(plan.amplitudePercent).toBeLessThanOrEqual(70);
  });
});

describe('kenBurnsFrameAt', () => {
  it('clamps progress to [0, 1]', () => {
    const plan = planKenBurnsEffect('panel-1', FRAME_ASPECT_RATIO);
    const atStart = kenBurnsFrameAt(plan, -1);
    const atZero = kenBurnsFrameAt(plan, 0);
    expect(atStart).toEqual(atZero);

    const atEnd = kenBurnsFrameAt(plan, 2);
    const atOne = kenBurnsFrameAt(plan, 1);
    expect(atEnd).toEqual(atOne);
  });

  it('pans down from top to bottom of the overflowing image', () => {
    const plan = { effect: 'panDown' as const, fit: 'width' as const, amplitudePercent: 40 };
    expect(kenBurnsFrameAt(plan, 0).translateYPercent).toBeCloseTo(0);
    expect(kenBurnsFrameAt(plan, 1).translateYPercent).toBe(-40);
  });

  it('pans right from left to right of the overflowing image', () => {
    const plan = { effect: 'panRight' as const, fit: 'height' as const, amplitudePercent: 40 };
    expect(kenBurnsFrameAt(plan, 0).translateXPercent).toBeCloseTo(0);
    expect(kenBurnsFrameAt(plan, 1).translateXPercent).toBe(-40);
  });

  it('zoomIn scale increases with progress', () => {
    const plan = { effect: 'zoomIn' as const, fit: 'cover' as const, amplitudePercent: 0 };
    const start = kenBurnsFrameAt(plan, 0);
    const end = kenBurnsFrameAt(plan, 1);
    expect(end.scale).toBeGreaterThan(start.scale);
  });

  it('zoomOut scale decreases with progress', () => {
    const plan = { effect: 'zoomOut' as const, fit: 'cover' as const, amplitudePercent: 0 };
    const start = kenBurnsFrameAt(plan, 0);
    const end = kenBurnsFrameAt(plan, 1);
    expect(end.scale).toBeLessThan(start.scale);
  });
});
