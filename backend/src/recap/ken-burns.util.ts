export type KenBurnsEffect =
  | 'panLeft'
  | 'panRight'
  | 'panUp'
  | 'panDown'
  | 'zoomIn'
  | 'zoomOut';

export type KenBurnsFit = 'width' | 'height' | 'cover';

/** Must match Root.tsx Composition width/height (1280x720). */
const FRAME_ASPECT_RATIO = 1280 / 720;

const MIN_PAN_OVERFLOW_PERCENT = 15;
const MAX_PAN_OVERFLOW_PERCENT = 70;
const ZOOM_SCALE_DELTA = 0.18;

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export interface KenBurnsPlan {
  effect: KenBurnsEffect;
  fit: KenBurnsFit;
  /**
   * Only meaningful when fit !== 'cover'. Percent of the rendered image's own
   * matching dimension (its height for fit='width', its width for
   * fit='height') that overflows the frame and can be panned into view.
   */
  amplitudePercent: number;
}

/**
 * One-time, seed-driven decision of which Ken Burns treatment a panel gets.
 * Depends only on panelId and the panel's own aspect ratio - safe to compute
 * once per panel (e.g. via useMemo) and reuse across every per-frame render.
 */
export function planKenBurnsEffect(
  seed: string,
  aspectRatio: number | undefined,
): KenBurnsPlan {
  const goingForward = hashSeed(seed) % 2 === 0;
  const ri = aspectRatio && aspectRatio > 0 ? aspectRatio : FRAME_ASPECT_RATIO;

  const verticalOverflow = (1 - ri / FRAME_ASPECT_RATIO) * 100;
  const horizontalOverflow = (1 - FRAME_ASPECT_RATIO / ri) * 100;

  if (verticalOverflow >= MIN_PAN_OVERFLOW_PERCENT) {
    return {
      effect: goingForward ? 'panDown' : 'panUp',
      fit: 'width',
      amplitudePercent: Math.min(verticalOverflow, MAX_PAN_OVERFLOW_PERCENT),
    };
  }
  if (horizontalOverflow >= MIN_PAN_OVERFLOW_PERCENT) {
    return {
      effect: goingForward ? 'panRight' : 'panLeft',
      fit: 'height',
      amplitudePercent: Math.min(horizontalOverflow, MAX_PAN_OVERFLOW_PERCENT),
    };
  }
  return {
    effect: goingForward ? 'zoomIn' : 'zoomOut',
    fit: 'cover',
    amplitudePercent: 0,
  };
}

export interface KenBurnsFrame {
  scale: number;
  translateXPercent: number;
  translateYPercent: number;
}

/**
 * Cheap per-frame interpolation. Called every frame via useCurrentFrame;
 * takes the already-computed plan rather than re-deriving it.
 */
export function kenBurnsFrameAt(
  plan: KenBurnsPlan,
  progress: number,
): KenBurnsFrame {
  const t = Math.min(1, Math.max(0, progress));
  const { effect, amplitudePercent } = plan;

  switch (effect) {
    case 'panDown':
      return {
        scale: 1,
        translateXPercent: 0,
        translateYPercent: -amplitudePercent * t,
      };
    case 'panUp':
      return {
        scale: 1,
        translateXPercent: 0,
        translateYPercent: -amplitudePercent * (1 - t),
      };
    case 'panRight':
      return {
        scale: 1,
        translateXPercent: -amplitudePercent * t,
        translateYPercent: 0,
      };
    case 'panLeft':
      return {
        scale: 1,
        translateXPercent: -amplitudePercent * (1 - t),
        translateYPercent: 0,
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
