import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://fableya.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization header')

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) throw new Error('Unauthorized')

    const body = await req.json()
    const book_id = typeof body?.book_id === 'string' ? body.book_id.slice(0, 36) : null
    const session_id = typeof body?.session_id === 'string' ? body.session_id.slice(0, 200) : null

    if (!book_id || !/^[0-9a-f-]{36}$/.test(book_id)) throw new Error('Invalid book_id')
    if (!session_id || !/^cs_[a-zA-Z0-9_]+$/.test(session_id)) throw new Error('Invalid session_id')

    // Verify ownership: the book must belong to the authenticated user
    const { data: book } = await supabase
      .from('books')
      .select('id, status, stripe_session_id, user_id')
      .eq('id', book_id)
      .eq('user_id', user.id)
      .single()

    if (!book) throw new Error('Book not found')

    // If already paid or further along, nothing to do
    if (!['pending_payment', 'preview_ready'].includes(book.status)) {
      return new Response(JSON.stringify({ ok: true, status: book.status }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify the session_id matches what we stored for this book
    if (book.stripe_session_id && book.stripe_session_id !== session_id) {
      throw new Error('Session ID mismatch')
    }

    // Fetch the Stripe session to confirm payment
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!
    const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session_id}`, {
      headers: { 'Authorization': `Bearer ${stripeKey}` },
    })

    if (!stripeRes.ok) {
      const err = await stripeRes.json()
      throw new Error(`Stripe error: ${err.error?.message ?? stripeRes.status}`)
    }

    const session = await stripeRes.json()

    // Confirm the session belongs to this book
    if (session.metadata?.book_id !== book_id || session.metadata?.user_id !== user.id) {
      throw new Error('Session metadata mismatch')
    }

    if (session.payment_status !== 'paid') {
      throw new Error(`Payment not complete: ${session.payment_status}`)
    }

    // Mark book as paid
    const { error: updateError } = await supabase
      .from('books')
      .update({ status: 'paid' })
      .eq('id', book_id)
      .eq('user_id', user.id)
      .in('status', ['pending_payment', 'preview_ready'])

    if (updateError) throw new Error('Failed to update book status')

    console.log('Book confirmed paid via fallback:', book_id, 'session:', session_id)

    return new Response(JSON.stringify({ ok: true, status: 'paid' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('confirm-payment error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
