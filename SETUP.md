# Kidoria — Guide d'installation MVP

## Prérequis

- Node.js 18+
- npm ou pnpm
- Un compte [Supabase](https://supabase.com) (gratuit)
- Un compte [Stripe](https://stripe.com)

---

## 1. Installation des dépendances

```bash
cd kidoria
npm install
```

---

## 2. Configuration des variables d'environnement

```bash
cp .env.example .env
```

Ouvrez `.env` et remplissez chaque variable (voir étapes ci-dessous).

---

## 3. Configuration Supabase

### 3.1 Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com) → **New project**
2. Notez votre `Project URL` et `anon key` (Settings → API)
3. Renseignez-les dans `.env` :
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

### 3.2 Exécuter la migration SQL

1. Dashboard Supabase → **SQL Editor**
2. Copiez-collez le contenu de `supabase/migrations/001_initial_schema.sql`
3. Cliquez **Run**

### 3.3 Configurer l'authentification

1. Dashboard → **Authentication → Providers**
2. **Email** : activé par défaut. Assurez-vous que "Confirm email" est activé.
3. **Google OAuth** :
   - Créez des credentials OAuth 2.0 dans la [Google Cloud Console](https://console.cloud.google.com)
   - URI de redirection autorisé : `https://xxxx.supabase.co/auth/v1/callback`
   - Renseignez Client ID et Client Secret dans Supabase → Auth → Providers → Google

### 3.4 URL de redirection

Dashboard → **Authentication → URL Configuration** :
- Site URL : `http://localhost:3000` (dev) ou votre domaine (prod)
- Redirect URLs : ajoutez `http://localhost:3000/**`

---

## 4. Configuration Stripe

### 4.1 Créer le produit

1. [Dashboard Stripe](https://dashboard.stripe.com) → **Products → Add product**
2. Nom : `Livre Kidoria`
3. Prix : `5,00 €` — paiement unique
4. Copiez le **Price ID** (`price_xxx`) → `.env` → `STRIPE_PRICE_ID`

### 4.2 Clés API

Dashboard Stripe → **Developers → API keys** :
```
STRIPE_SECRET_KEY=sk_live_...   (ou sk_test_... en dev)
```

---

## 5. Déployer les Edge Functions

Installez la CLI Supabase :
```bash
npm install -g supabase
supabase login
supabase link --project-ref VOTRE_PROJECT_REF
```

Déployez les fonctions :
```bash
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy generate-book
supabase functions deploy delete-account
```

Ajoutez les secrets aux fonctions :
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set STRIPE_PRICE_ID=price_...
supabase secrets set SITE_URL=https://votre-domaine.com
```

---

## 6. Configurer le webhook Stripe

1. Dashboard Stripe → **Developers → Webhooks → Add endpoint**
2. URL : `https://VOTRE_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
3. Événements à écouter : `checkout.session.completed`
4. Copiez le **Signing secret** (`whsec_...`) → `.env` → `STRIPE_WEBHOOK_SECRET`

**En développement** (avec Stripe CLI) :
```bash
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
```

---

## 7. Lancer en développement

```bash
npm run dev
```

L'app sera disponible sur [http://localhost:3000](http://localhost:3000).

---

## 8. Build de production

```bash
npm run build
```

Les fichiers statiques sont dans `dist/`. Déployez sur Vercel, Netlify ou tout hébergeur statique.

---

## Architecture des Edge Functions

| Fonction | Rôle |
|----------|------|
| `create-checkout` | Crée la session Stripe Checkout et retourne l'URL de paiement |
| `stripe-webhook` | Reçoit les événements Stripe, confirme le paiement, déclenche la génération |
| `generate-book` | Génère le contenu du livre (mock → remplacer par IA) |
| `delete-account` | Supprime toutes les données utilisateur (RGPD) |

---

## Flux utilisateur

```
Accueil → Formulaire → [si non connecté → Inscription/Connexion]
→ Paiement Stripe (5€) → Stripe Checkout
→ Webhook Stripe reçu → statut "paid" → génération lancée
→ Page "Génération en cours" (polling toutes les 3s)
→ statut "completed" → Liseuse intégrée
```

---

## Remplacer le mock de génération par l'IA

Dans `supabase/functions/generate-book/index.ts`, remplacez la fonction `generatePages()` par vos appels IA :

1. **Texte** : OpenAI GPT-4 / Claude claude-sonnet-4-6
2. **Images** : DALL-E 3 / Stable Diffusion / Midjourney API
3. Uploadez les images dans Supabase Storage et stockez les URLs dans `book_pages.image_url`

---

## Checklist avant mise en production

- [ ] Variables d'environnement en production configurées
- [ ] SQL migration exécutée
- [ ] Edge Functions déployées avec leurs secrets
- [ ] Webhook Stripe configuré et testé
- [ ] Google OAuth configuré avec l'URL de production
- [ ] Stripe en mode Live (pas Test)
- [ ] Pages légales complétées avec vos vraies informations
- [ ] HTTPS activé sur votre domaine
