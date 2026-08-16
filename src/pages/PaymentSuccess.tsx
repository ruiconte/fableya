import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const bookId = searchParams.get('book_id')

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(bookId ? `/generation?book_id=${bookId}` : '/bibliotheque', { replace: true })
    }, 2500)
    return () => clearTimeout(timer)
  }, [bookId, navigate])

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h1 className="text-3xl font-black mb-3">{t('payment.successTitle')}</h1>
        <p className="text-kidoria-muted text-lg">{t('payment.successSub')}</p>
        <div className="mt-6 flex justify-center">
          <div className="w-8 h-8 border-4 border-kidoria-rose border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  )
}
