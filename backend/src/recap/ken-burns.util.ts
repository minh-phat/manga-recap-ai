export type KenBurnsEffect =
  | 'panLeft'
  | 'panRight'
  | 'panUp'
  | 'panDown'
  | 'zoomIn'
  | 'zoomOut';

const EFFECTS: KenBurnsEffect[] = [
  'panLeft',
  'panRight',
  'panUp',
  'panDown',
  'zoomIn',
  'zoomOut',
];

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function pickKenBurnsEffect(seed: string): KenBurnsEffect {
  return EFFECTS[hashSeed(seed) % EFFECTS.length];
}

const PAN_DISTANCE_PERCENT = 6;
const ZOOM_SCALE_DELTA = 0.18;
const BASE_SCALE = 1.12;

export interface KenBurnsFrame {
  scale: number;
  translateXPercent: number;
  translateYPercent: number;
}

export function kenBurnsFrameAt(
  effect: KenBurnsEffect,
  progress: number,
): KenBurnsFrame {
  const t = Math.min(1, Math.max(0, progress));

  switch (effect) {
    case 'panLeft':
      return {
        scale: BASE_SCALE,
        translateXPercent: PAN_DISTANCE_PERCENT * (0.5 - t),
        translateYPercent: 0,
      };
    case 'panRight':
      return {
        scale: BASE_SCALE,
        translateXPercent: PAN_DISTANCE_PERCENT * (t - 0.5),
        translateYPercent: 0,
      };
    case 'panUp':
      return {
        scale: BASE_SCALE,
        translateXPercent: 0,
        translateYPercent: PAN_DISTANCE_PERCENT * (0.5 - t),
      };
    case 'panDown':
      return {
        scale: BASE_SCALE,
        translateXPercent: 0,
        translateYPercent: PAN_DISTANCE_PERCENT * (t - 0.5),
      };
    case 'zoomIn':
      return {
        scale: 1 + ZOOM_SCALE_DELTA * t,
        translateXPercent: 0,
        translateYPercent: 0,
      };
    case 'zoomOut':
      return {
        scale: 1 + ZOOM_SCALE_DELTA * (1 - t),
        translateXPercent: 0,
        translateYPercent: 0,
      };
    default:
      return { scale: 1, translateXPercent: 0, translateYPercent: 0 };
  }
}
