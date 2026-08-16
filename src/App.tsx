import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AuthProvider } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })))
const Login = lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })))
const Register = lazy(() => import('./pages/auth/Register').then(m => ({ default: m.Register })))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword').then(m => ({ default: m.ResetPassword })))
const AuthCallback = lazy(() => import('./pages/auth/AuthCallback').then(m => ({ default: m.AuthCallback })))
const CreateBook = lazy(() => import('./pages/CreateBook').then(m => ({ default: m.CreateBook })))
const GeneratingBook = lazy(() => import('./pages/GeneratingBook').then(m => ({ default: m.GeneratingBook })))
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess').then(m => ({ default: m.PaymentSuccess })))
const Library = lazy(() => import('./pages/Library').then(m => ({ default: m.Library })))
const ReadBook = lazy(() => import('./pages/ReadBook').then(m => ({ default: m.ReadBook })))
const SampleBook = lazy(() => import('./pages/SampleBook').then(m => ({ default: m.SampleBook })))
const PublicBook = lazy(() => import('./pages/PublicBook').then(m => ({ default: m.PublicBook })))
const PreviewBook = lazy(() => import('./pages/PreviewBook').then(m => ({ default: m.PreviewBook })))
const Account = lazy(() => import('./pages/Account').then(m => ({ default: m.Account })))
const CGU = lazy(() => import('./pages/legal/CGU').then(m => ({ default: m.CGU })))
const Privacy = lazy(() => import('./pages/legal/Privacy').then(m => ({ default: m.Privacy })))
const Mentions = lazy(() => import('./pages/legal/Mentions').then(m => ({ default: m.Mentions })))
const Contact = lazy(() => import('./pages/legal/Contact').then(m => ({ default: m.Contact })))
const CadeauNaissance = lazy(() => import('./pages/landing/CadeauNaissance').then(m => ({ default: m.CadeauNaissance })))
const LivrePrenom = lazy(() => import('./pages/landing/LivrePrenom').then(m => ({ default: m.LivrePrenom })))
const CadeauAnniversaire = lazy(() => import('./pages/landing/CadeauAnniversaire').then(m => ({ default: m.CadeauAnniversaire })))
const CadeauNoel = lazy(() => import('./pages/landing/CadeauNoel').then(m => ({ default: m.CadeauNoel })))
const GenerateurHistoire = lazy(() => import('./pages/landing/GenerateurHistoire').then(m => ({ default: m.GenerateurHistoire })))

function HtmlLangSync() {
  const { i18n } = useTranslation()
  useEffect(() => {
    document.documentElement.lang = i18n.language
  }, [i18n.language])
  return null
}

function App() {
  const { t } = useTranslation()

  return (
    <BrowserRouter>
      <AuthProvider>
        <HtmlLangSync />
        <Suspense fallback={<div className="min-h-screen" />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/connexion" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/inscription" element={<Register />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
            <Route path="/nouveau-mot-de-passe" element={<ResetPassword />} />
            <Route path="/cgu" element={<CGU />} />
            <Route path="/confidentialite" element={<Privacy />} />
            <Route path="/mentions-legales" element={<Mentions />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cadeau-naissance" element={<CadeauNaissance />} />
            <Route path="/livre-prenom-enfant" element={<LivrePrenom />} />
            <Route path="/cadeau-anniversaire-enfant" element={<CadeauAnniversaire />} />
            <Route path="/idee-cadeau-noel-enfant" element={<CadeauNoel />} />
            <Route path="/generateur-histoire-enfant-ia" element={<GenerateurHistoire />} />

            <Route path="/creer" element={<ProtectedRoute><CreateBook /></ProtectedRoute>} />
            <Route path="/paiement-confirme" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
            <Route path="/generation" element={<ProtectedRoute><GeneratingBook /></ProtectedRoute>} />
            <Route path="/bibliotheque" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/livre/:id" element={<ProtectedRoute><ReadBook /></ProtectedRoute>} />
            <Route path="/apercu" element={<SampleBook />} />
            <Route path="/exemple/:id" element={<PublicBook />} />
            <Route path="/preview/:id" element={<ProtectedRoute><PreviewBook /></ProtectedRoute>} />
            <Route path="/compte" element={<ProtectedRoute><Account /></ProtectedRoute>} />

            <Route path="*" element={
              <div className="page-container text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h1 className="text-3xl font-black mb-3">{t('notFound.title')}</h1>
                <a href="/" className="btn-primary inline-flex">{t('notFound.back')}</a>
              </div>
            } />
          </Route>
        </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
