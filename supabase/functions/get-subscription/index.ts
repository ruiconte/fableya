import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getPlanByPriceId } from '../_shared/plans.ts'

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

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!sub) {
      return new Response(JSON.stringify({ subscription: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const plan = sub.stripe_price_id ? getPlanByPriceId(sub.stripe_price_id) : null
    const booksRemaining = Math.max(0, sub.plan_book_limit - sub.books_used_this_period)
    const isActive = ['active', 'trialing'].includes(sub.status)

    // If period dates are missing, fetch them live from Stripe and backfill the DB
    let currentPeriodEnd = sub.current_period_end
    let currentPeriodStart = sub.current_period_start
    let cancelAtPeriodEnd = sub.cancel_at_period_end ?? false

    if (!currentPeriodEnd) {
      try {
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
        if (stripeKey) {
          let stripeSub: { current_period_start?: number; current_period_end?: number; cancel_at_period_end?: boolean; id?: string } | null = null

          if (sub.stripe_subscription_id) {
            // Fetch by subscription ID
            const res = await fetch(
              `https://api.stripe.com/v1/subscriptions/${sub.stripe_subscription_id}`,
              { headers: { 'Authorization': `Bearer ${stripeKey}` } }
            )
            if (res.ok) stripeSub = await res.json()
          } else if (sub.stripe_customer_id) {
            // Fallback: list active subscriptions for the customer
            const res = await fetch(
              `https://api.stripe.com/v1/subscriptions?customer=${sub.stripe_customer_id}&status=active&limit=1`,
              { headers: { 'Authorization': `Bearer ${stripeKey}` } }
            )
            if (res.ok) {
              const list = await res.json() as { data?: typeof stripeSub[] }
              stripeSub = list.data?.[0] ?? null
            }
          }

          if (stripeSub?.current_period_end) {
            currentPeriodEnd = new Date(stripeSub.current_period_end * 1000).toISOString()
            currentPeriodStart = stripeSub.current_period_start
              ? new Date(stripeSub.current_period_start * 1000).toISOString()
              : currentPeriodStart
            cancelAtPeriodEnd = stripeSub.cancel_at_period_end ?? false
            // Backfill DB so next call is fast
            const updatePayload: Record<string, string | boolean | null> = {
              current_period_start: currentPeriodStart,
              current_period_end: currentPeriodEnd,
              cancel_at_period_end: cancelAtPeriodEnd,
            }
            if (!sub.stripe_subscription_id && stripeSub.id) {
              updatePayload.stripe_subscription_id = stripeSub.id
            }
            await supabase.from('subscriptions').update(updatePayload).eq('user_id', user.id)
          }
        }
      } catch (_e) {
        // Non-fatal
      }
    }

    return new Response(JSON.stringify({
      subscription: {
        status: sub.status,
        isActive,
        planName: plan?.name ?? 'Fableya Plus',
        planBookLimit: sub.plan_book_limit,
        booksUsed: sub.books_used_this_period,
        booksRemaining,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd,
      }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error(err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
