import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export function AuthCallback() {
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    const errorParam = url.searchParams.get('error')
    const errorDesc = url.searchParams.get('error_description')

    if (errorParam) {
      setErrorMsg(`Erreur OAuth: ${errorParam} — ${errorDesc}`)
      return
    }

    if (code) {
      // PKCE flow
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (data.session) {
          navigate('/bibliotheque', { replace: true })
        } else {
          setErrorMsg(`Échec échange code: ${error?.message ?? 'inconnu'}`)
        }
      })
    } else {
      // Implicit flow — client already parsed the hash, just get the session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          navigate('/bibliotheque', { replace: true })
        } else {
          // Give it a moment in case the client is still processing the hash
          setTimeout(() => {
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (session) {
                navigate('/bibliotheque', { replace: true })
              } else {
                navigate('/connexion', { replace: true })
              }
            })
          }, 1500)
        }
      })
    }
  }, [navigate])

  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-red-500 font-bold text-lg">Erreur</div>
        <p className="text-red-500 font-bold text-center max-w-md">{errorMsg}</p>
        <button onClick={() => navigate('/connexion')} className="btn-primary">Retour connexion</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-kidoria-rose border-t-transparent rounded-full animate-spin" />
      <p className="text-kidoria-muted text-sm">Connexion en cours…</p>
    </div>
  )
}
