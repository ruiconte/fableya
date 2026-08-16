import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://fableya.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const N8N_WEBHOOK_URL = 'https://n8n.srv1608234.hstgr.cloud/webhook/bf8f6868-2bdd-47c0-86c9-8ed5b186cd6d'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  let book_id: string | undefined

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

    // Rate limit: max 5 generations per user per hour
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('books')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['generating', 'complete', 'failed'])
      .gte('created_at', since)
    if ((count ?? 0) >= 5) {
      return new Response(JSON.stringify({ error: 'Rate limit: max 5 générations par heure' }), { status: 429, headers: corsHeaders })
    }

    const body = await req.json()
    book_id = body.book_id
    if (!book_id) throw new Error('Missing book_id')

    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', book_id)
      .single()

    if (bookError || !book) throw new Error('Book not found')

    // Update status to generating
    await supabase
      .from('books')
      .update({ status: 'generating' })
      .eq('id', book_id)

    // Send to n8n and wait for acknowledgement
    const n8nRes = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        book_id,
        form_data: book.form_data,
      }),
    })

    console.log('n8n response status:', n8nRes.status)

    return new Response(
      JSON.stringify({ success: true, message: 'Generation started' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('generate-book error:', err)
    if (book_id) {
      await supabase.from('books').update({ status: 'failed' }).eq('id', book_id)
    }
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Generation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
