import { required, jsonRequest } from './db.mjs';
import { outputText, sourcesFromResponse } from './content.mjs';

// Gemini API — same key as the book generator (GEMINI_API_KEY)
export function provider(db, jobId, env = process.env, fetcher = fetch) {
  return async function call(stage, instructions, input, schema) {
    const model = (env.SEO_GEMINI_MODEL ?? 'gemini-2.5-flash');
    const key = required('GEMINI_API_KEY', env);
    if (input.length > 60_000) throw new Error('Contexte trop long : réduire le brief ou les sources');
    const id = await db.rpc('seo_reserve_call', { p_job: jobId, p_stage: stage, p_model: model });
    try {
      const systemInstruction = { parts: [{ text: instructions }] };
      const contents = [{ role: 'user', parts: [{ text: input }] }];

      // Search stages use Google Search grounding; write/review/plan stages use JSON schema output
      const body = schema
        ? {
            systemInstruction,
            contents,
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: schema,
              maxOutputTokens: 9000,
            },
          }
        : {
            systemInstruction,
            contents,
            tools: [{ googleSearch: {} }],
            generationConfig: { maxOutputTokens: 9000 },
          };

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const response = await jsonRequest(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(240_000),
        body: JSON.stringify(body),
      }, fetcher);

      const candidate = response.candidates?.[0];
      const usage = response.usageMetadata;
      await db.patch(`seo_usage?id=eq.${id}`, {
        status: candidate ? 'completed' : 'failed',
        response_id: null,
        input_tokens: usage?.promptTokenCount ?? null,
        output_tokens: usage?.candidatesTokenCount ?? null,
      });

      const text = outputText(response);
      return { response, value: schema ? JSON.parse(text) : text };
    } catch (error) {
      await db.patch(`seo_usage?id=eq.${id}`, { status: 'failed_or_unknown' }).catch(() => {});
      // Do not auto-retry paid POSTs: the provider may already have processed a timed-out request.
      throw error;
    }
  };
}
