import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, useCurrentFrame, interpolate } from 'remotion';
import {
  kenBurnsFrameAt,
  planKenBurnsEffect,
  KenBurnsPlan,
} from '../src/recap/ken-burns.util';

export interface PanelSequenceProps {
  panelId: string;
  imageUrl: string;
  narrationText: string;
  audioUrl?: string;
  aspectRatio?: number;
  includeCaptions: boolean;
  from: number;
  durationInFrames: number;
}

function kenBurnsImageStyle(
  plan: KenBurnsPlan,
  scale: number,
  translateXPercent: number,
  translateYPercent: number,
): React.CSSProperties {
  const base: React.CSSProperties = { position: 'absolute', top: 0, left: 0 };

  if (plan.fit === 'width') {
    return {
      ...base,
      width: '100%',
      height: 'auto',
      transform: `translateY(${translateYPercent}%)`,
    };
  }
  if (plan.fit === 'height') {
    return {
      ...base,
      width: 'auto',
      height: '100%',
      transform: `translateX(${translateXPercent}%)`,
    };
  }
  return {
    ...base,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: `scale(${scale})`,
  };
}

function PanelFrame({
  panelId,
  imageUrl,
  narrationText,
  audioUrl,
  aspectRatio,
  includeCaptions,
  durationInFrames,
}: Omit<PanelSequenceProps, 'from'>) {
  const frame = useCurrentFrame();
  const plan = React.useMemo(
    () => planKenBurnsEffect(panelId, aspectRatio),
    [panelId, aspectRatio],
  );
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const { scale, translateXPercent, translateYPercent } = kenBurnsFrameAt(
    plan,
    progress,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: 'black', overflow: 'hidden' }}>
      {audioUrl ? <Audio src={audioUrl} /> : null}
      <Img
        src={imageUrl}
        style={kenBurnsImageStyle(plan, scale, translateXPercent, translateYPercent)}
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
