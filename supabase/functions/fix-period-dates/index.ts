import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!

  // Get all subscriptions missing period end
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('user_id, stripe_subscription_id, stripe_customer_id')
    .is('current_period_end', null)

  const results = []

  for (const sub of (subs ?? [])) {
    let stripeSubId = sub.stripe_subscription_id
    let stripeData: Record<string, unknown> | null = null
    let stripeStatus = 0
    let stripeBody = ''

    if (stripeSubId) {
      const res = await fetch(
        `https://api.stripe.com/v1/subscriptions/${stripeSubId}`,
        { headers: { Authorization: `Bearer ${stripeKey}` } }
      )
      stripeStatus = res.status
      stripeBody = await res.text()
      if (res.ok) stripeData = JSON.parse(stripeBody)
      // If 404, sub belongs to another Stripe account — fall through to customer lookup
    }
    if (!stripeData && sub.stripe_customer_id) {
      const res = await fetch(
        `https://api.stripe.com/v1/subscriptions?customer=${sub.stripe_customer_id}&status=active&limit=1`,
        { headers: { Authorization: `Bearer ${stripeKey}` } }
      )
      stripeStatus = res.status
      stripeBody = await res.text()
      if (res.ok) {
        const list = JSON.parse(stripeBody)
        stripeData = list.data?.[0] ?? null
        stripeSubId = stripeData?.id as string ?? null
      }
    }

    if (stripeData?.current_period_end) {
      const periodEnd = new Date((stripeData.current_period_end as number) * 1000).toISOString()
      const periodStart = stripeData.current_period_start
        ? new Date((stripeData.current_period_start as number) * 1000).toISOString()
        : null

      await supabase.from('subscriptions').update({
        current_period_end: periodEnd,
        current_period_start: periodStart,
        cancel_at_period_end: stripeData.cancel_at_period_end ?? false,
        ...(stripeSubId ? { stripe_subscription_id: stripeSubId } : {}),
      }).eq('user_id', sub.user_id)

      results.push({ user_id: sub.user_id, fixed: true, period_end: periodEnd })
    } else {
      results.push({ user_id: sub.user_id, fixed: false, stripe_status: stripeStatus, stripe_error: stripeBody.slice(0, 300) })
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
