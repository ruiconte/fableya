import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useAdmin() {
  const { user, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { setIsAdmin(false); setLoading(false); return }

    supabase.from('profiles').select('role').eq('id', user.id).single()
      .then(({ data }) => {
        setIsAdmin(data?.role === 'admin')
        setLoading(false)
      })
  }, [user, authLoading])

  return { isAdmin, loading }
}

export async function adminCall(session: { access_token: string } | null, method: 'GET' | 'POST', params: Record<string, string>, body?: unknown) {
  if (!session) throw new Error('Not authenticated')

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const url = new URL(`${supabaseUrl}/functions/v1/admin-api`)
  if (method === 'GET') {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Admin API error')
  return data
}
