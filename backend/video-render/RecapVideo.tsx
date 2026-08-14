import React from 'react';
import { AbsoluteFill } from 'remotion';
import { PanelSequence } from './PanelSequence';
import { resolveEntryTimings } from '../src/recap/duration.util';

export interface RecapVideoEntryInput {
  panelId: string;
  imageUrl: string;
  narrationText: string;
  audioUrl?: string;
  durationMs?: number;
}

export type RecapVideoProps = Record<string, unknown> & {
  entries: RecapVideoEntryInput[];
  includeCaptions: boolean;
};

export function RecapVideo({ entries, includeCaptions }: RecapVideoProps) {
  const timings = resolveEntryTimings(entries);

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {entries.map((entry, index) => (
        <PanelSequence
          key={entry.panelId}
          panelId={entry.panelId}
          imageUrl={entry.imageUrl}
          narrationText={entry.narrationText}
          audioUrl={entry.audioUrl}
          includeCaptions={includeCaptions}
          from={timings[index].from}
          durationInFrames={timings[index].durationInFrames}
        />
      ))}
    </AbsoluteFill>
  );
}
