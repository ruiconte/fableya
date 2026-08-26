import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PLANS } from '../_shared/plans.ts'

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
          if (typeof item === 'object') flatten(item as Record<string, unknown>, `${key}[${i}]`)
          else params.append(`${key}[${i}]`, String(item))
        })
      } else {
        params.append(key, String(v))
      }
    }
  }
  flatten(body)
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${secretKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Stripe error')
  return data
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

    // Check not already subscribed
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .single()

    if (existing && ['active', 'trialing'].includes(existing.status)) {
      throw new Error('Already subscribed')
    }

    const secretKey = Deno.env.get('STRIPE_SECRET_KEY')!
    const siteUrl = Deno.env.get('SITE_URL')!
    const plan = PLANS.plus

    if (!plan.stripePriceId) throw new Error('Subscription price not configured')

    // Get or create Stripe customer
    let stripeCustomerId: string | null = existing?.stripe_customer_id ?? null

    if (!stripeCustomerId) {
      const customer = await stripePost('customers', secretKey, {
        email: user.email!,
        'metadata[user_id]': user.id,
      })
      stripeCustomerId = customer.id
    }

    const session = await stripePost('checkout/sessions', secretKey, {
      mode: 'subscription',
      customer: stripeCustomerId,
      'line_items[0][price]': plan.stripePriceId,
      'line_items[0][quantity]': 1,
      'payment_method_types[0]': 'card',
      'subscription_data[metadata][user_id]': user.id,
      'metadata[user_id]': user.id,
      success_url: `${siteUrl}/mes-livres?subscription=success`,
      cancel_url: `${siteUrl}/mes-livres`,
    })

    // Upsert subscription row with customer id (subscription_id comes via webhook)
    await supabase.from('subscriptions').upsert({
      user_id: user.id,
      stripe_customer_id: stripeCustomerId,
      status: existing?.status ?? 'incomplete',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

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
