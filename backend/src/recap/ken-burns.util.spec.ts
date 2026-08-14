import { kenBurnsFrameAt, pickKenBurnsEffect } from './ken-burns.util';

describe('pickKenBurnsEffect', () => {
  it('is deterministic for the same seed', () => {
    expect(pickKenBurnsEffect('panel-1')).toBe(pickKenBurnsEffect('panel-1'));
  });

  it('returns one of the six known effects', () => {
    const effects = ['panLeft', 'panRight', 'panUp', 'panDown', 'zoomIn', 'zoomOut'];
    expect(effects).toContain(pickKenBurnsEffect('panel-42'));
  });
});

describe('kenBurnsFrameAt', () => {
  it('clamps progress to [0, 1]', () => {
    const atStart = kenBurnsFrameAt('zoomIn', -1);
    const atZero = kenBurnsFrameAt('zoomIn', 0);
    expect(atStart).toEqual(atZero);

    const atEnd = kenBurnsFrameAt('zoomIn', 2);
    const atOne = kenBurnsFrameAt('zoomIn', 1);
    expect(atEnd).toEqual(atOne);
  });

  it('zoomIn scale increases with progress', () => {
    const start = kenBurnsFrameAt('zoomIn', 0);
    const end = kenBurnsFrameAt('zoomIn', 1);
    expect(end.scale).toBeGreaterThan(start.scale);
  });

  it('zoomOut scale decreases with progress', () => {
    const start = kenBurnsFrameAt('zoomOut', 0);
    const end = kenBurnsFrameAt('zoomOut', 1);
    expect(end.scale).toBeLessThan(start.scale);
  });
});
