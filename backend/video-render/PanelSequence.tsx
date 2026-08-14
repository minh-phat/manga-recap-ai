import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, useCurrentFrame, interpolate } from 'remotion';
import {
  kenBurnsFrameAt,
  pickKenBurnsEffect,
} from '../src/recap/ken-burns.util';

export interface PanelSequenceProps {
  panelId: string;
  imageUrl: string;
  narrationText: string;
  audioUrl?: string;
  includeCaptions: boolean;
  from: number;
  durationInFrames: number;
}

function PanelFrame({
  panelId,
  imageUrl,
  narrationText,
  audioUrl,
  includeCaptions,
  durationInFrames,
}: Omit<PanelSequenceProps, 'from'>) {
  const frame = useCurrentFrame();
  const effect = pickKenBurnsEffect(panelId);
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const { scale, translateXPercent, translateYPercent } = kenBurnsFrameAt(
    effect,
    progress,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: 'black', overflow: 'hidden' }}>
      {audioUrl ? <Audio src={audioUrl} /> : null}
      <Img
        src={imageUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translate(${translateXPercent}%, ${translateYPercent}%)`,
        }}
      />
      {includeCaptions && narrationText ? (
        <AbsoluteFill
          style={{
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '0 48px 56px',
          }}
        >
          <div
            style={{
              maxWidth: '90%',
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              color: 'white',
              fontSize: 34,
              lineHeight: 1.4,
              padding: '16px 24px',
              borderRadius: 12,
              textAlign: 'center',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            {narrationText}
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
}

export function PanelSequence(props: PanelSequenceProps) {
  const { from, durationInFrames, ...rest } = props;
  return (
    <Sequence from={from} durationInFrames={durationInFrames}>
      <PanelFrame {...rest} durationInFrames={durationInFrames} />
    </Sequence>
  );
}
