import { BadGatewayException } from '@nestjs/common';
import {
  AiProviderStrategy,
  DetectPanelsInput,
  GenerateNarrationInput,
  PanelBox,
  TranslateTextsInput,
} from './ai-provider.interface';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function toDataUrl(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

export class OpenRouterClient implements AiProviderStrategy {
  constructor(
    private readonly apiKey: string,
    private readonly modelId: string,
  ) {}

  private async chat(messages: unknown[]): Promise<string> {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelId,
        messages,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new BadGatewayException(
        `OpenRouter request failed (${res.status}): ${body}`,
      );
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      throw new BadGatewayException(
        'OpenRouter response missing message content',
      );
    }
    return content;
  }

  async detectPanels({
    imageBuffer,
    mimeType,
  }: DetectPanelsInput): Promise<PanelBox[]> {
    const messages = [
      {
        role: 'system',
        content:
          'You are a manga page layout analyzer. Given a manga page image, detect every distinct story panel (khung truyện) ' +
          'and return their bounding boxes in reading order (top-to-bottom, right-to-left for typical manga). ' +
          'IMPORTANT: you may perceive this image at a downscaled resolution, so NEVER return absolute pixel coordinates. ' +
          "Instead return NORMALIZED fractional coordinates in the range 0.0 to 1.0, relative to the image's own width and height, " +
          'where x=0,y=0 is the top-left corner and x=1,y=1 is the bottom-right corner. ' +
          'Respond ONLY with JSON of the shape {"panels":[{"x":number,"y":number,"width":number,"height":number}]} ' +
          'where x,y is the top-left corner of the panel and width,height are its size, all as fractions between 0 and 1.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Detect all panels in this manga page and return their bounding boxes.',
          },
          {
            type: 'image_url',
            image_url: { url: toDataUrl(imageBuffer, mimeType) },
          },
        ],
      },
    ];

    const raw = await this.chat(messages);
    const parsed = JSON.parse(raw) as { panels?: PanelBox[] };
    if (!Array.isArray(parsed.panels)) {
      throw new BadGatewayException(
        'OpenRouter panel detection returned no panels array',
      );
    }
    return parsed.panels;
  }

  async generateNarration({
    panels,
    storySoFar,
    pageIndex,
  }: GenerateNarrationInput): Promise<string[]> {
    const content: unknown[] = [
      {
        type: 'text',
        text:
          `You are writing a continuous anime/manga recap narration script, like a YouTube recap video. ` +
          `Here is the story so far:\n\n${storySoFar || '(this is the beginning of the story)'}\n\n` +
          `Below are ${panels.length} manga panel images from page ${pageIndex}, in reading order. ` +
          `Write one short narration line per panel that continues naturally from the story so far and flows into the next panel. ` +
          `Respond ONLY with JSON of the shape {"narrations":["line for panel 1", "line for panel 2", ...]} ` +
          `with exactly ${panels.length} entries, in the same order as the panels below.`,
      },
      ...panels.map((panel) => ({
        type: 'image_url',
        image_url: { url: toDataUrl(panel.imageBuffer, panel.mimeType) },
      })),
    ];

    const messages = [
      {
        role: 'system',
        content:
          'You are an expert anime recap scriptwriter who keeps narration coherent and continuous across panels and pages.',
      },
      { role: 'user', content },
    ];

    const raw = await this.chat(messages);
    const parsed = JSON.parse(raw) as { narrations?: string[] };
    if (!Array.isArray(parsed.narrations)) {
      throw new BadGatewayException(
        'OpenRouter narration generation returned no narrations array',
      );
    }
    return parsed.narrations;
  }

  async translateTexts({
    texts,
    targetLanguage,
  }: TranslateTextsInput): Promise<string[]> {
    if (texts.length === 0) {
      return [];
    }

    const messages = [
      {
        role: 'system',
        content:
          'You are a professional translator. Translate each given line into the target language, ' +
          'preserving meaning, tone, and line order exactly. Do not add or remove lines.',
      },
      {
        role: 'user',
        content:
          `Translate the following ${texts.length} lines into "${targetLanguage}". ` +
          `Respond ONLY with JSON of the shape {"translations":["line 1", "line 2", ...]} ` +
          `with exactly ${texts.length} entries, in the same order as the input lines.\n\n` +
          texts.map((text, i) => `${i + 1}. ${text}`).join('\n'),
      },
    ];

    const raw = await this.chat(messages);
    const parsed = JSON.parse(raw) as { translations?: string[] };
    if (!Array.isArray(parsed.translations)) {
      throw new BadGatewayException(
        'OpenRouter translation returned no translations array',
      );
    }
    return parsed.translations;
  }
}
