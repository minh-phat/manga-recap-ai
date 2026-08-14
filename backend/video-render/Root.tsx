import React from 'react';
import { Composition } from 'remotion';
import { RecapVideo, RecapVideoProps } from './RecapVideo';
import {
  computeTotalDurationInFrames,
  resolveEntryTimings,
  VIDEO_FPS,
} from '../src/recap/duration.util';

export const RECAP_VIDEO_COMPOSITION_ID = 'RecapVideo';

const defaultProps: RecapVideoProps = {
  entries: [],
  includeCaptions: true,
};

export function RemotionRoot() {
  return (
    <Composition<any, RecapVideoProps>
      id={RECAP_VIDEO_COMPOSITION_ID}
      component={RecapVideo}
      durationInFrames={VIDEO_FPS * 3}
      fps={VIDEO_FPS}
      width={1280}
      height={720}
      defaultProps={defaultProps}
      calculateMetadata={async ({ props }) => {
        const timings = resolveEntryTimings(props.entries, VIDEO_FPS);
        return {
          durationInFrames: Math.max(1, computeTotalDurationInFrames(timings)),
        };
      }}
    />
  );
}
