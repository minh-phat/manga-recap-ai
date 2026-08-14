export type KenBurnsEffect = 'panLeft' | 'panRight' | 'panUp' | 'panDown' | 'zoomIn' | 'zoomOut';
export declare function pickKenBurnsEffect(seed: string): KenBurnsEffect;
export interface KenBurnsFrame {
    scale: number;
    translateXPercent: number;
    translateYPercent: number;
}
export declare function kenBurnsFrameAt(effect: KenBurnsEffect, progress: number): KenBurnsFrame;
