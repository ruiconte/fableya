import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://fableya.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const N8N_WEBHOOK_URL = 'https://n8n.srv1608234.hstgr.cloud/webhook/bf8f6868-2bdd-47c0-86c9-8ed5b186cd6d'

const ACTIVE_SUB_STATUSES = ['active', 'trialing']

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  let book_id: string | undefined
  let subscriptionQuotaConsumed = false
  let usageRowId: string | undefined

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

    // Rate limit: max 5 generations per hour (covers both pay-per-book and subscription)
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('books')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['generating', 'completed', 'failed'])
      .gte('created_at', since)
    if ((count ?? 0) >= 5) {
      return new Response(JSON.stringify({ error: 'Rate limit: max 5 générations par heure' }), { status: 429, headers: corsHeaders })
    }

    const body = await req.json()
    book_id = typeof body.book_id === 'string' ? body.book_id.slice(0, 36) : undefined
    if (!book_id || !/^[0-9a-f-]{36}$/.test(book_id)) throw new Error('Missing or invalid book_id')

    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id, user_id, status, form_data')
      .eq('id', book_id)
      .eq('user_id', user.id)
      .single()

    if (bookError || !book) throw new Error('Book not found or access denied')

    // ── Authorization ────────────────────────────────────────────────────────
    if (book.status === 'paid') {
      // Pay-per-book path: Stripe webhook already set status=paid, allow through
      console.log('Pay-per-book generation authorized for book:', book_id)
    } else if (book.status === 'generating') {
      // Already in progress — don't double-charge or double-generate
      return new Response(JSON.stringify({ success: true, message: 'Already generating' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else {
      // Must have an active subscription to generate without paying per-book
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('id, status, books_used_this_period, plan_book_limit, current_period_end, stripe_subscription_id')
        .eq('user_id', user.id)
        .single()

      if (!sub || !ACTIVE_SUB_STATUSES.includes(sub.status)) {
        return new Response(JSON.stringify({
          error: 'payment_required',
          message: 'Un paiement est requis pour générer ce livre.'
        }), { status: 402, headers: corsHeaders })
      }

      if (sub.current_period_end && new Date(sub.current_period_end) < new Date()) {
        return new Response(JSON.stringify({
          error: 'subscription_expired',
          message: 'Votre abonnement a expiré. Veuillez le renouveler.'
        }), { status: 402, headers: corsHeaders })
      }

      if (sub.books_used_this_period >= sub.plan_book_limit) {
        return new Response(JSON.stringify({
          error: 'quota_exceeded',
          message: `Vous avez utilisé vos ${sub.plan_book_limit} livres du mois.`,
          renewsAt: sub.current_period_end,
        }), { status: 429, headers: corsHeaders })
      }

      // Atomically increment usage — prevents race conditions
      // UPDATE ... WHERE books_used_this_period < plan_book_limit returns 0 rows if quota hit concurrently
      const { data: updated } = await supabase.rpc('increment_book_usage', {
        p_user_id: user.id,
        p_limit: sub.plan_book_limit,
      })

      if (!updated || updated === 0) {
        return new Response(JSON.stringify({
          error: 'quota_exceeded',
          message: `Vous avez utilisé vos ${sub.plan_book_limit} livres du mois.`,
        }), { status: 429, headers: corsHeaders })
      }

      subscriptionQuotaConsumed = true

      // Insert audit record (status=pending until n8n confirms)
      const { data: usageRow } = await supabase
        .from('book_generation_usage')
        .insert({
          user_id: user.id,
          book_id: book_id,
          subscription_id: sub.id,
          billing_period_start: null,
          billing_period_end: sub.current_period_end,
          status: 'pending',
        })
        .select('id')
        .single()

      usageRowId = usageRow?.id
      console.log('Subscription quota consumed for user:', user.id, 'usage:', sub.books_used_this_period + 1, '/', sub.plan_book_limit)
    }

    // ── Launch generation ────────────────────────────────────────────────────
    await supabase
      .from('books')
      .update({ status: 'generating' })
      .eq('id', book_id)

    const n8nRes = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book_id, form_data: book.form_data }),
    })

    console.log('n8n response status:', n8nRes.status)

    // Mark usage as committed after n8n accepts the job
    if (usageRowId) {
      await supabase
        .from('book_generation_usage')
        .update({ status: 'committed' })
        .eq('id', usageRowId)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Generation started' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('generate-book error:', err)

    // Reverse quota consumption on system error (not on user/quota errors)
    if (subscriptionQuotaConsumed && book_id) {
      await supabase.rpc('decrement_book_usage', { p_user_id: user.id })
        .then(() => console.log('Quota reversed due to system error'))
        .catch((e: unknown) => console.error('Failed to reverse quota:', e))

      if (usageRowId) {
        await supabase
          .from('book_generation_usage')
          .update({ status: 'reversed_system_error' })
          .eq('id', usageRowId)
      }
    }

    if (book_id) {
      await supabase.from('books').update({ status: 'failed' }).eq('id', book_id)
    }

    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Generation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
