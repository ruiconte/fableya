/**
 * Called by n8n when the book PDF is ready.
 * Updates the book status to "completed" and stores the PDF URL.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://fableya.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  try {
    const { book_id, pdf_url, pages } = await req.json()

    if (!book_id) {
      return new Response(
        JSON.stringify({ error: 'Missing book_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const updateData: Record<string, unknown> = { status: 'completed' }
    if (pdf_url) updateData.pdf_url = pdf_url

    const { error } = await supabase
      .from('books')
      .update(updateData)
      .eq('id', book_id)

    if (error) throw error

    if (pages && Array.isArray(pages) && pages.length > 0) {
      const rows = pages.map((p: { scene_number: number; text: string; image_url?: string }) => ({
        book_id,
        page_number: p.scene_number,
        text: p.text,
        image_url: p.image_url ?? null,
      }))

      const { error: pagesError } = await supabase
        .from('book_pages')
        .upsert(rows, { onConflict: 'book_id,page_number' })

      if (pagesError) console.error('pages insert error:', pagesError)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('book-complete error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
