import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getPlanByPriceId } from '../_shared/plans.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://fableya.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

async function verifyStripeSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const parts = signature.split(',').reduce((acc: Record<string, string>, part) => {
    const [key, value] = part.split('=')
    acc[key] = value
    return acc
  }, {})

  const timestamp = parts['t']
  const expectedSig = parts['v1']
  if (!timestamp || !expectedSig) return false

  const signedPayload = `${timestamp}.${body}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signatureBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload))
  const computedSig = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return computedSig === expectedSig
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const signature = req.headers.get('stripe-signature')
  if (!signature) return new Response('Missing signature', { status: 400 })

  const body = await req.text()
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

  const valid = await verifyStripeSignature(body, signature, webhookSecret)
  if (!valid) {
    console.error('Invalid Stripe signature')
    return new Response('Invalid signature', { status: 400 })
  }

  const event = JSON.parse(body)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  console.log('Webhook event:', event.type)

  // ── Pay-per-book checkout ──────────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    // Pay-per-book: has book_id in metadata
    if (session.metadata?.book_id) {
      const { book_id, user_id } = session.metadata
      if (!book_id || !user_id) {
        console.error('Missing metadata in session', session.id)
        return new Response('Missing metadata', { status: 400 })
      }
      const { error } = await supabase
        .from('books')
        .update({ status: 'paid' })
        .eq('id', book_id)
        .eq('user_id', user_id)
        .in('status', ['pending_payment', 'preview_ready'])
      if (error) {
        console.error('Failed to update book status:', error)
        return new Response('DB error', { status: 500 })
      }
      console.log('Book marked as paid:', book_id)
    }

    // Subscription checkout: mode=subscription, no book_id
    if (session.mode === 'subscription' && session.subscription) {
      const userId = session.metadata?.user_id
      const customerId = session.customer
      if (!userId || !customerId) {
        console.error('Missing user_id or customer in subscription session')
        return new Response('Missing metadata', { status: 400 })
      }

      // Fetch the real subscription object from Stripe to get actual status
      const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!
      const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${session.subscription}`, {
        headers: { 'Authorization': `Bearer ${stripeSecretKey}` },
      })
      const stripeSubJson = await subRes.json()

      const plan = stripeSubJson.items?.data?.[0]?.price
        ? getPlanByPriceId(stripeSubJson.items.data[0].price.id)
        : null
      const periodStart = stripeSubJson.current_period_start
        ? new Date(stripeSubJson.current_period_start * 1000).toISOString()
        : null
      const periodEnd = stripeSubJson.current_period_end
        ? new Date(stripeSubJson.current_period_end * 1000).toISOString()
        : null

      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: session.subscription,
        stripe_price_id: stripeSubJson.items?.data?.[0]?.price?.id ?? null,
        status: stripeSubJson.status ?? 'incomplete',
        current_period_start: periodStart,
        current_period_end: periodEnd,
        cancel_at_period_end: stripeSubJson.cancel_at_period_end ?? false,
        plan_book_limit: plan?.monthlyBookLimit ?? 25,
        books_used_this_period: 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      console.log('Subscription checkout completed, status:', stripeSubJson.status, 'customer:', customerId)
    }
  }

  // ── Subscription lifecycle ─────────────────────────────────────────────────
  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const sub = event.data.object
    const userId = sub.metadata?.user_id

    if (!userId) {
      // Fallback: look up by stripe_subscription_id
      const { data: existing } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', sub.id)
        .single()
      if (!existing) {
        console.error('Cannot find user for subscription', sub.id)
        return new Response('ok') // acknowledge but skip
      }
    }

    const plan = sub.items?.data?.[0]?.price ? getPlanByPriceId(sub.items.data[0].price.id) : null
    const periodStart = new Date(sub.current_period_start * 1000).toISOString()
    const periodEnd = new Date(sub.current_period_end * 1000).toISOString()

    const { data: existing } = await supabase
      .from('subscriptions')
      .select('current_period_start, books_used_this_period')
      .eq('stripe_subscription_id', sub.id)
      .single()

    // Detect period renewal: reset usage if new period started
    const isNewPeriod = existing && existing.current_period_start &&
      new Date(existing.current_period_start).getTime() !== sub.current_period_start * 1000

    const updates: Record<string, unknown> = {
      stripe_subscription_id: sub.id,
      stripe_price_id: sub.items?.data?.[0]?.price?.id ?? null,
      status: sub.status,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
      plan_book_limit: plan?.monthlyBookLimit ?? 25,
      updated_at: new Date().toISOString(),
    }

    if (isNewPeriod) {
      updates.books_used_this_period = 0
      console.log('New billing period — resetting usage to 0')
    }

    if (userId) {
      await supabase.from('subscriptions').upsert(
        { user_id: userId, stripe_customer_id: sub.customer, ...updates },
        { onConflict: 'user_id' }
      )
    } else {
      await supabase.from('subscriptions').update(updates)
        .eq('stripe_subscription_id', sub.id)
    }

    console.log('Subscription synced:', sub.id, sub.status)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled', cancel_at_period_end: false, updated_at: new Date().toISOString() })
      .eq('stripe_subscription_id', sub.id)
    console.log('Subscription canceled:', sub.id)
  }

  // ── Invoice events ─────────────────────────────────────────────────────────
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object
    // Only act on subscription invoices (not one-time)
    if (!invoice.subscription) return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })

    const sub = invoice.subscription
    // Period reset is handled by customer.subscription.updated which fires alongside this
    console.log('Invoice payment succeeded for subscription:', sub)
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object
    if (!invoice.subscription) return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
    // Status (past_due/unpaid) already synced via customer.subscription.updated
    console.log('Invoice payment failed for subscription:', invoice.subscription)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
