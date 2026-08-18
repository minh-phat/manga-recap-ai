export type KenBurnsEffect = 'panLeft' | 'panRight' | 'panUp' | 'panDown' | 'zoomIn' | 'zoomOut';
export type KenBurnsFit = 'width' | 'height' | 'cover';
export interface KenBurnsPlan {
    effect: KenBurnsEffect;
    fit: KenBurnsFit;
    amplitudePercent: number;
}
export declare function planKenBurnsEffect(seed: string, aspectRatio: number | undefined): KenBurnsPlan;
export interface KenBurnsFrame {
    scale: number;
    translateXPercent: number;
    translateYPercent: number;
}
export declare function kenBurnsFrameAt(plan: KenBurnsPlan, progress: number): KenBurnsFrame;
