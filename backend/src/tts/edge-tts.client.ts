import { Injectable } from '@nestjs/common';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

@Injectable()
export class EdgeTtsClient {
  async synthesize(text: string, voiceName: string): Promise<Buffer> {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(
      voiceName,
      OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
    );
    const { audioStream } = tts.toStream(text);

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      audioStream.on('data', (chunk: Buffer) => chunks.push(chunk));
      audioStream.on('close', () => resolve());
      audioStream.on('error', (error: Error) => reject(error));
    });
    tts.close();

    return Buffer.concat(chunks);
  }
}
