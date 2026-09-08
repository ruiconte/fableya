/**
 * RGPD-compliant account deletion.
 * Cancels any active Stripe subscription immediately, then deletes all user
 * data and the auth user.
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

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders })
  }

  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  )

  const { data: { user }, error: authError } = await supabaseUser.auth.getUser(
    authHeader.replace('Bearer ', '')
  )

  if (authError || !user) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  try {
    // Cancel Stripe subscription immediately if one exists
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_subscription_id, status')
      .eq('user_id', user.id)
      .single()

    if (sub?.stripe_subscription_id && ['active', 'trialing'].includes(sub.status)) {
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!
      const res = await fetch(`https://api.stripe.com/v1/subscriptions/${sub.stripe_subscription_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${stripeKey}` },
      })
      if (!res.ok) {
        const err = await res.json()
        // Log but don't block deletion — Stripe may already have cancelled it
        console.error('Stripe cancellation error:', err)
      } else {
        console.log('Stripe subscription cancelled:', sub.stripe_subscription_id)
      }
    }

    // Delete book pages (cascades via FK, but explicit for clarity)
    const { data: books } = await supabaseAdmin
      .from('books')
      .select('id')
      .eq('user_id', user.id)

    if (books && books.length > 0) {
      const bookIds = books.map(b => b.id)
      await supabaseAdmin.from('book_pages').delete().in('book_id', bookIds)
    }

    // Delete books
    await supabaseAdmin.from('books').delete().eq('user_id', user.id)

    // Delete the auth user (this cascades to profiles via trigger)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (deleteError) throw deleteError

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Delete account error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to delete account' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
