import { required, jsonRequest } from './db.mjs';
import { outputText } from './content.mjs';

export function provider(db, jobId, env = process.env, fetcher = fetch) {
  return async function call(stage, instructions, input, schema) {
    const model = required('SEO_OPENAI_MODEL', env);
    const key = required('OPENAI_API_KEY', env);
    if (input.length > 60_000) throw new Error('Contexte trop long : réduire le brief ou les sources');
    const id = await db.rpc('seo_reserve_call', { p_job: jobId, p_stage: stage, p_model: model });
    try {
      const response = await jsonRequest('https://api.openai.com/v1/responses', {
        method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(240_000),
        body: JSON.stringify({ model, store: false, instructions, input, max_output_tokens: 9000,
          ...(schema ? { text: { format: { type:'json_schema', name:stage, strict:true, schema } } } : {
            tools: [{ type:'web_search', search_context_size:'medium' }], tool_choice:'required', max_tool_calls:2,
          }),
        }),
      }, fetcher);
      await db.patch(`seo_usage?id=eq.${id}`, { status: response.status, response_id: response.id,
        input_tokens: response.usage?.input_tokens ?? null, output_tokens: response.usage?.output_tokens ?? null });
      const text = outputText(response);
      return { response, value: schema ? JSON.parse(text) : text };
    } catch (error) {
      await db.patch(`seo_usage?id=eq.${id}`, { status:'failed_or_unknown' }).catch(()=>{});
      // Do not auto-retry paid POSTs: the provider may already have processed a timed-out request.
      throw error;
    }
  };
}
