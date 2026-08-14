import React from 'react';
import { AbsoluteFill } from 'remotion';
import { PanelSequence } from './PanelSequence';
import { computeEntryTimings } from '../src/recap/duration.util';

export interface RecapVideoEntryInput {
  panelId: string;
  imageUrl: string;
  narrationText: string;
}

export type RecapVideoProps = Record<string, unknown> & {
  entries: RecapVideoEntryInput[];
  includeCaptions: boolean;
};

export function RecapVideo({ entries, includeCaptions }: RecapVideoProps) {
  const timings = computeEntryTimings(entries.map((e) => e.narrationText));

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {entries.map((entry, index) => (
        <PanelSequence
          key={entry.panelId}
          panelId={entry.panelId}
          imageUrl={entry.imageUrl}
          narrationText={entry.narrationText}
          includeCaptions={includeCaptions}
          from={timings[index].from}
          durationInFrames={timings[index].durationInFrames}
        />
      ))}
    </AbsoluteFill>
  );
}
