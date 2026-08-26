import { useEffect, useState, useCallback } from 'react'
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

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscription = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setSubscription(null); return }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-subscription`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch subscription')
      setSubscription(data.subscription)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSubscription() }, [fetchSubscription])

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
