import type { Analysis } from '@sesap/types';
import {
  AiBudgetError,
  AnalysisSchema,
  generateItemId,
  Logger,
  ProcessingError,
  runWithAiBudget,
  WORKERS_AI_MODELS,
} from '@sesap/shared';
import type { Env } from '../bindings';
import { buildAnalysisPrompt } from '../prompts/analysis-prompt';

const MODEL_NAME = WORKERS_AI_MODELS.llm;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

// Transcript length limits (conservative estimates for model context)
const MAX_TRANSCRIPT_CHARS = 50000; // ~12,500 tokens at 4 chars/token
const MAX_PROMPT_CHARS = 60000; // Total prompt should fit in context window

const logger = new Logger({ service: 'llm-service' });

function assignIds(interviewId: string, raw: Record<string, unknown>): Record<string, unknown> {
  const summaries = (raw.summaries as Array<Record<string, unknown>> | undefined) ?? [];
  const timeline = (raw.timeline as Array<Record<string, unknown>> | undefined) ?? [];
  const themes = (raw.themes as Array<Record<string, unknown>> | undefined) ?? [];
  const quotes = (raw.quotes as Array<Record<string, unknown>> | undefined) ?? [];
  const areasForImprovement =
    (raw.areasForImprovement as Array<Record<string, unknown>> | undefined) ?? [];
  const identities =
    (raw.identities as Array<Record<string, unknown>> | undefined) ?? [];

  const idSummaries = summaries.map((s, i) => ({
    ...s,
    id: generateItemId(interviewId, 'summary', i),
  }));

  const idTimeline = timeline.map((t, i) => ({
    ...t,
    id: generateItemId(interviewId, 'timeline', i),
  }));

  const idQuotes = quotes.map((q, i) => {
    const rawIdx = (q as { timelineEventIndex?: unknown }).timelineEventIndex;
    const idx =
      typeof rawIdx === 'number' && Number.isInteger(rawIdx) && rawIdx >= 0 && rawIdx < idTimeline.length
        ? rawIdx
        : null;
    const { timelineEventIndex: _drop, ...rest } = q as Record<string, unknown>;
    return {
      ...rest,
      id: generateItemId(interviewId, 'quote', i),
      themeIds: [] as string[],
      ...(idx !== null ? { timelineEventId: idTimeline[idx].id as string } : {}),
    };
  });

  const idThemes = themes.map((th, i) => ({
    ...th,
    id: generateItemId(interviewId, 'theme', i),
    relatedQuoteIds: [] as string[],
  }));

  // Link themes to quotes by matching tags/categories
  for (const theme of idThemes) {
    const themeCategory = ((theme as any).category as string).toLowerCase();
    for (const quote of idQuotes) {
      const tags = ((quote as any).tags as string[]) ?? [];
      const matchesTag = tags.some((t) => t.toLowerCase().includes(themeCategory));
      if (matchesTag) {
        (theme.relatedQuoteIds as string[]).push(quote.id as string);
        (quote.themeIds as string[]).push(theme.id as string);
      }
    }
  }

  const idAreas = areasForImprovement.map((a, i) => ({
    ...a,
    id: generateItemId(interviewId, 'area', i),
  }));

  return {
    interviewId,
    modelConfig: {
      model: MODEL_NAME,
      temperature: 0.3,
      maxTokens: 8192,
    },
    summaries: idSummaries,
    timeline: idTimeline,
    themes: idThemes,
    quotes: idQuotes,
    areasForImprovement: idAreas,
    identities,
    generatedAt: new Date().toISOString(),
  };
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Scan a string for the first balanced top-level JSON object and return it as a string,
// or null if no balanced object is found. Used to recover JSON from reasoning-model output
// when the structured `content` field is null.
function extractFirstJsonObject(input: string): string | null {
  const start = input.indexOf('{');
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < input.length; i++) {
    const ch = input[i];
    if (escape) { escape = false; continue; }
    if (inString) {
      if (ch === '\\') escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return input.slice(start, i + 1);
    }
  }
  return null;
}

export async function generateAnalysis(
  env: Env,
  interviewId: string,
  transcript: string,
): Promise<Analysis> {
  const transcriptLength = transcript.length;

  // Validate transcript length
  if (transcriptLength === 0) {
    throw new ProcessingError('Transcript is empty', { interviewId });
  }

  if (transcriptLength > MAX_TRANSCRIPT_CHARS) {
    logger.warn('Transcript exceeds maximum length, truncating', {
      interviewId,
      originalLength: transcriptLength,
      maxLength: MAX_TRANSCRIPT_CHARS,
    });

    // Truncate transcript but try to end at a sentence boundary
    const truncated = transcript.substring(0, MAX_TRANSCRIPT_CHARS);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastNewline = truncated.lastIndexOf('\n');
    const cutoff = Math.max(lastPeriod, lastNewline);

    transcript = cutoff > MAX_TRANSCRIPT_CHARS * 0.9
      ? truncated.substring(0, cutoff + 1)
      : truncated;
  }

  const prompt = buildAnalysisPrompt(transcript);
  const promptLength = prompt.length;

  if (promptLength > MAX_PROMPT_CHARS) {
    throw new ProcessingError('Prompt exceeds maximum length even after truncation', {
      interviewId,
      transcriptLength: transcript.length,
      promptLength,
      maxPromptLength: MAX_PROMPT_CHARS,
    });
  }

  let lastError: unknown;
  let lastErrorDetails: Record<string, unknown> = {};

  logger.info('Starting LLM analysis', {
    interviewId,
    transcriptLength: transcript.length,
    promptLength,
    model: MODEL_NAME,
  });

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.info('Calling LLM', { interviewId, attempt, model: MODEL_NAME });

      const input = {
        messages: [
          {
            role: 'system',
            content: 'You are a qualitative research analyst. Respond only with valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 8192,
        response_format: { type: 'json_object' },
      };

      const response = (await runWithAiBudget(
        env,
        {
          model: MODEL_NAME,
          estimate: {
            kind: 'llm',
            model: MODEL_NAME,
            messages: input.messages,
            maxTokens: input.max_tokens,
          },
          context: { worker: 'processing', operation: 'analysis', interviewId, attempt },
        },
        () => env.AI.run(MODEL_NAME as Parameters<Ai['run']>[0], input),
      )) as {
        response?: string;
        choices?: Array<{
          message?: { content?: string | null; reasoning_content?: string | null };
        }>;
      };

      // OpenAI-compatible models return choices[].message.content; Cloudflare native models
      // return `response` directly. Reasoning models (gpt-oss-*) sometimes spend their entire
      // token budget on reasoning, leaving content null — when that happens the JSON object is
      // embedded inside reasoning_content, so extract the first top-level JSON object as fallback.
      const rawContent =
        response.response ??
        response.choices?.[0]?.message?.content ??
        '';
      let text = rawContent;
      if (!text) {
        const reasoning = response.choices?.[0]?.message?.reasoning_content ?? '';
        const extracted = extractFirstJsonObject(reasoning);
        if (extracted) text = extracted;
      }

      logger.info('LLM response received', {
        interviewId,
        attempt,
        responseLength: text.length,
        hasResponse: !!text,
      });
      if (!text) {
        throw new ProcessingError('Empty response from LLM', {
          model: MODEL_NAME,
          attempt,
          responseObject: response,
        });
      }

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(text) as Record<string, unknown>;
      } catch (parseErr) {
        throw new ProcessingError('Invalid JSON from LLM', {
          model: MODEL_NAME,
          attempt,
          responsePreview: text.substring(0, 500),
          parseError: parseErr instanceof Error ? parseErr.message : String(parseErr),
        });
      }

      const withIds = assignIds(interviewId, parsed);

      let validated: Analysis;
      try {
        validated = AnalysisSchema.parse(withIds) as Analysis;
      } catch (validationErr) {
        throw new ProcessingError('Schema validation failed', {
          model: MODEL_NAME,
          attempt,
          validationError: validationErr instanceof Error ? validationErr.message : String(validationErr),
          receivedKeys: Object.keys(parsed),
        });
      }

      logger.info('Analysis generated successfully', {
        interviewId,
        summaryCount: validated.summaries.length,
        themeCount: validated.themes.length,
        quoteCount: validated.quotes.length,
        timelineCount: validated.timeline.length,
        areasCount: validated.areasForImprovement.length,
      });

      return validated;
    } catch (err) {
      if (err instanceof AiBudgetError) {
        throw err;
      }

      lastError = err;

      // Extract detailed error information
      if (err instanceof Error) {
        lastErrorDetails = {
          name: err.name,
          message: err.message,
          stack: err.stack?.split('\n').slice(0, 3).join('\n'),
        };

        if ('details' in err) {
          lastErrorDetails.errorDetails = (err as ProcessingError).details;
        }
      }

      logger.error('LLM attempt failed', {
        interviewId,
        attempt,
        error: err instanceof Error ? err.message : String(err),
        errorType: err instanceof Error ? err.constructor.name : typeof err,
        errorDetails: lastErrorDetails,
      });

      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        logger.info('Retrying after delay', { interviewId, attempt, delayMs: delay });
        await sleep(delay);
      }
    }
  }

  const errorMessage = `Failed to generate analysis after ${MAX_RETRIES} attempts`;
  const errorDetails = {
    interviewId,
    transcriptLength,
    promptLength,
    model: MODEL_NAME,
    lastError: lastError instanceof Error ? lastError.message : String(lastError),
    lastErrorDetails,
  };

  logger.error(errorMessage, errorDetails);

  throw new ProcessingError(errorMessage, errorDetails);
}
