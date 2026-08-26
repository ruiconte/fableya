import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface SubscriptionInfo {
  status: string
  isActive: boolean
  planName: string
  planBookLimit: number
  booksUsed: number
  booksRemaining: number
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

export function useSubscription(pollUntilActive = false) {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchSubscription = useCallback(async () => {
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setSubscription(null); setLoading(false); return }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-subscription`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch subscription')
      setSubscription(data.subscription)
      return data.subscription
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSubscription() }, [fetchSubscription])

  // Poll every 3 s until subscription becomes active (used after Stripe redirect)
  useEffect(() => {
    if (!pollUntilActive) return
    pollRef.current = setInterval(async () => {
      const sub = await fetchSubscription()
      if (sub?.isActive) {
        clearInterval(pollRef.current!)
        pollRef.current = null
      }
    }, 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [pollUntilActive, fetchSubscription])

  const subscribe = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-subscription-checkout`,
      { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` } }
    )
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else throw new Error(data.error || 'Failed to create checkout')
  }, [])

  const openPortal = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-portal`,
      { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` } }
    )
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else throw new Error(data.error || 'Failed to open portal')
  }, [])

  return { subscription, loading, error, refresh: fetchSubscription, subscribe, openPortal }
}
