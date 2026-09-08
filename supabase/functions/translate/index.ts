import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { texts, source, target } = await req.json() as {
      texts: string[]
      source: string
      target: string
    }

    if (!texts?.length || !source || !target) {
      return new Response(JSON.stringify({ error: 'missing params' }), { status: 400, headers: corsHeaders })
    }

    if (source === target) {
      return new Response(JSON.stringify({ translated: texts }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    async function myMemory(text: string, src: string, tgt: string): Promise<string> {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${src}|${tgt}`
      const res = await fetch(url)
      const data = await res.json()
      const result = data?.responseData?.translatedText
      if (!result || result === text) return text
      return result
    }

    // MyMemory only works well with English as pivot
    // So we translate fr→en→target (or src→en→target)
    const useEnPivot = source !== 'en' && target !== 'en'

    const translated = await Promise.all(texts.map(async (text) => {
      if (!text?.trim()) return text
      try {
        if (useEnPivot) {
          const enText = await myMemory(text, source, 'en')
          return await myMemory(enText, 'en', target)
        }
        return await myMemory(text, source, target)
      } catch {
        return text
      }
    }))

    return new Response(JSON.stringify({ translated }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders })
  }
})
