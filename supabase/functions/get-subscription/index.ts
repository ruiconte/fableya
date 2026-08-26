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

    return new Response(JSON.stringify({
      subscription: {
        status: sub.status,
        isActive,
        planName: plan?.name ?? 'Fableya Plus',
        planBookLimit: sub.plan_book_limit,
        booksUsed: sub.books_used_this_period,
        booksRemaining,
        currentPeriodStart: sub.current_period_start,
        currentPeriodEnd: sub.current_period_end,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
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
