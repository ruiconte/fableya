import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://fableya.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function stripePost(path: string, secretKey: string, body: Record<string, unknown>) {
  const params = new URLSearchParams()
  const flatten = (obj: Record<string, unknown>, prefix = '') => {
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}[${k}]` : k
      if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
        flatten(v as Record<string, unknown>, key)
      } else if (Array.isArray(v)) {
        v.forEach((item, i) => {
          if (typeof item === 'object') {
            flatten(item as Record<string, unknown>, `${key}[${i}]`)
          } else {
            params.append(`${key}[${i}]`, String(item))
          }
        })
      } else {
        params.append(key, String(v))
      }
    }
  }
  flatten(body)

  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Stripe error')
  return data
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Limit request size to 10KB
    const contentLength = req.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 10_000) throw new Error('Request too large')

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization header')

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) throw new Error('Unauthorized')

    const body = await req.json()
    const book_id = typeof body?.book_id === 'string' ? body.book_id.slice(0, 36) : null
    if (!book_id || !/^[0-9a-f-]{36}$/.test(book_id)) throw new Error('Invalid book_id')

    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id, title, status, user_id')
      .eq('id', book_id)
      .eq('user_id', user.id)
      .single()

    if (bookError || !book) throw new Error('Book not found')
    if (!['pending_payment', 'preview_ready'].includes(book.status)) throw new Error('Book not eligible for payment')

    const siteUrl = Deno.env.get('SITE_URL')!
    const secretKey = Deno.env.get('STRIPE_SECRET_KEY')!
    const priceId = Deno.env.get('STRIPE_PRICE_ID')!

    const session = await stripePost('checkout/sessions', secretKey, {
      mode: 'payment',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': 1,
      'payment_method_types[0]': 'card',
      'metadata[book_id]': book.id,
      'metadata[user_id]': user.id,
      customer_email: user.email,
      success_url: `${siteUrl}/paiement-confirme?book_id=${book.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/creer`,
    })

    await supabase
      .from('books')
      .update({ stripe_session_id: session.id })
      .eq('id', book.id)

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error(err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
