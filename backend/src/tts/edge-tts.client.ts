import { Injectable, Logger } from '@nestjs/common';
import { MsEdgeTTS, OUTPUT_FORMAT, ProsodyOptions } from 'msedge-tts';

const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class EdgeTtsClient {
  private readonly logger = new Logger(EdgeTtsClient.name);

  async synthesize(
    text: string,
    voiceName: string,
    prosody?: ProsodyOptions,
  ): Promise<Buffer> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        return await this.synthesizeOnce(text, voiceName, prosody);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < MAX_ATTEMPTS) {
          const delay = BASE_DELAY_MS * 2 ** (attempt - 1) + Math.random() * 250;
          this.logger.warn(
            `Edge TTS synthesis attempt ${attempt}/${MAX_ATTEMPTS} failed (${lastError.message}), retrying in ${Math.round(delay)}ms`,
          );
          await sleep(delay);
        }
      }
    }

    throw lastError;
  }

  private async synthesizeOnce(
    text: string,
    voiceName: string,
    prosody?: ProsodyOptions,
  ): Promise<Buffer> {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(
      voiceName,
      OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
    );
    const { audioStream } = tts.toStream(text, prosody);

    try {
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        audioStream.on('data', (chunk: Buffer) => chunks.push(chunk));
        audioStream.on('close', () => resolve());
        audioStream.on('error', (error: Error) => reject(error));
      });
      return Buffer.concat(chunks);
    } finally {
      tts.close();
    }
  }
}
