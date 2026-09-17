# Agent éditorial Fableya — installation et exploitation

Cette intégration utilise l’application existante : administration React, authentification et stockage Supabase, pages publiques rendues par Vercel, worker Node.js planifié par GitHub Actions. Aucun PC allumé en permanence n’est nécessaire avec ce mode d’exécution.

## Ce qui est livré

- `/admin/seo` : sujets, file de rédaction, calendrier, éditeur, sources, relecture, approbation, publication, actualisation, quotas et résultats Google.
- `/blog` et `/blog/:slug` : HTML complet rendu côté serveur, métadonnées, URL canonique, balisage Article, citations, FAQ et liens internes. Fonctionne sans JavaScript. FR/EN/JA, URL unique par article.
- `/blog-sitemap.xml` : sitemap dynamique des articles publiés ; déclaré dans `robots.txt` en plus du sitemap existant.
- Worker : choix de sujets à partir du brief, de l’historique et des requêtes Search Console disponibles ; recherche Web avec citations ; rédaction structurée ; contrôles techniques et seconde relecture IA.
- Les actualisations créent un nouveau brouillon. L’ancien article reste public jusqu’à approbation et publication de la nouvelle version, à la même URL.
- Search Console : clics, impressions, CTR, position par page/jour ; import sur 28 jours se terminant trois jours avant aujourd’hui. Les requêtes récentes alimentent le choix des sujets.
- Export Markdown avec sources, déclaration de l’éditeur et URL originale pour vos autres canaux ; publication d’extraits sur WordPress et DEV via leurs API officielles, après choix explicite.

Les données de recherche ne sont **pas** des volumes de mots-clés. Les citations proviennent des annotations de recherche du fournisseur, mais une relecture humaine des sources est requise : les modèles peuvent mal interpréter une source. Les contrôles structurels ne garantissent ni exactitude, ni classement, ni citation dans les réponses IA.

## 1. Migration Supabase

Appliquer `supabase/migrations/20260917000000_seo_editorial.sql` au projet Supabase existant **avant** d’utiliser l’administration. Les anciennes migrations du dépôt ont des formats de nom différents : ne pas rejouer aveuglément tout l’historique en production. Utiliser le SQL Editor pour cette migration précise ou réconcilier d’abord l’historique de la CLI.

La migration crée uniquement les tables éditoriales et leurs fonctions. Elle limite aussi les modifications de `profiles` par un utilisateur connecté à `display_name` et `avatar_url` : le rôle `admin` ne doit pas pouvoir être attribué en éditant son propre profil. Les écritures privilégiées du service restent possibles. Le compte déjà marqué admin dans la base conserve son rôle.

Sauvegarder la base avant toute migration de production. Tester d’abord sur un projet Supabase de préproduction. Les fonctions et tables éditoriales privées n’accordent aucun droit aux visiteurs ni aux utilisateurs ordinaires ; seul `blog_posts` autorise la lecture publique.

## 2. Variables Vercel

Dans le projet Vercel de Fableya, conserver les variables publiques existantes :

| Variable | Usage |
| --- | --- |
| `VITE_SUPABASE_URL` | Client React et fallback URL serveur |
| `VITE_SUPABASE_ANON_KEY` | Lecture publique du blog et authentification existante |
| `SUPABASE_URL` | URL du même projet Supabase côté serveur |
| `SUPABASE_SERVICE_ROLE_KEY` | API éditoriale réservée aux administrateurs |

**Ne jamais préfixer une clé de service ou d’IA par `VITE_`.** Aucune clé OpenAI n’est nécessaire sur Vercel : les générations longues tournent dans le worker. Les fonctions Vercel `api/blog.mjs` et `api/seo-admin.mjs` sont déployées avec le site. Conserver les règles de réécriture ajoutées dans `vercel.json`.

La lecture publique du blog utilise la clé anonyme et les règles RLS, pas la clé de service. Les brouillons n’existent pas dans la table publique. Les pages sont mises en cache 60 secondes au maximum.

## 3. Activer le worker GitHub Actions

GitHub → dépôt → Settings → Secrets and variables → Actions.

Secrets :

- `SUPABASE_URL` : même projet que Vercel.
- `SUPABASE_SERVICE_ROLE_KEY` : clé serveur uniquement.
- `OPENAI_API_KEY` : clé d’un projet API dédié, avec facturation configurée.
- `GSC_SERVICE_ACCOUNT_JSON` : facultatif, voir section suivante.

Variables :

- `SEO_OPENAI_MODEL` : identifiant d’un modèle accessible à votre compte, compatible avec Responses API, `web_search` et les sorties structurées. Aucun modèle n’est choisi silencieusement et aucun changement automatique de modèle n’est effectué. Vérifier la compatibilité et le prix du modèle avant activation.
- `SEO_WORKER_ENABLED=true` : autorise le workflow. Sans cette variable, le job est ignoré.
- `GSC_SITE_URL=sc-domain:fableya.com` : facultatif ; doit correspondre exactement à la propriété Google (ou `https://fableya.com/` pour une propriété URL).

Fusionner la branche et déployer le site après validation. Les workflows planifiés s’exécutent sur la branche par défaut. Le worker passe chaque heure à la minute 17, selon la disponibilité de GitHub Actions ; il peut être retardé. « Programmer à 10 h » signifie publier au premier passage après 10 h, pas une garantie à la seconde. Le bouton **Run workflow** permet une exécution manuelle.

Dans `/admin/seo`, les sujets manuels peuvent être mis en file dès que le worker est configuré. Pour de nouveaux sujets automatiques chaque jour, activer en plus **Créer automatiquement des brouillons chaque jour** dans les réglages. Renseigner les caractéristiques vérifiées de Fableya avant la première rédaction. Le système n’annonce pas arbitrairement les tarifs variables cités dans d’anciennes conversations.

La publication sur Fableya est réelle dès que vous cliquez « Publier », ou au passage du worker pour un brouillon approuvé et planifié. Aucun article n’est automatiquement approuvé. Les instructions trouvées sur le Web ne peuvent pas modifier la configuration, publier ou exécuter du code.

## 4. Connecter Google Search Console

1. Activer l’API Search Console dans un projet Google Cloud.
2. Créer un compte de service et sa clé JSON ; la conserver uniquement comme secret du worker.
3. Ajouter son `client_email` aux utilisateurs de la propriété Search Console concernée avec l’accès nécessaire à la lecture des performances.
4. Configurer `GSC_SERVICE_ACCOUNT_JSON` et `GSC_SITE_URL` puis lancer « Synchroniser Search Console » depuis l’administration.

Le scope OAuth est `webmasters.readonly`. L’application ne demande ni n’accélère l’indexation. Soumettre `/blog-sitemap.xml` une fois dans Search Console. L’absence de données peut signifier qu’elles ne sont pas encore disponibles, que la propriété est incorrecte ou que le blog n’a pas encore d’impressions.

Les impressions/clics ne mesurent pas les achats. Les liens vers `/creer` portent des paramètres UTM ; l’attribution des inscriptions et paiements doit être configurée séparément dans l’outil analytics déjà présent. Cette PR ne modifie pas Stripe.

## 5. Budget et erreurs

Valeurs initiales : 1 sujet/jour, 9 appels IA/jour, 90 appels IA/mois. Un sujet explicite utilise normalement 3 appels (recherche, rédaction, relecture), un sujet proposé automatiquement en utilise 4. Les valeurs initiales permettent donc environ 22 articles automatiques complets par mois, pas 30 : augmenter le quota uniquement si le budget le permet.

Chaque tentative est réservée atomiquement en base avant l’appel. Un timeout reste compté : le fournisseur peut avoir traité la requête. Les appels ne sont jamais relancés automatiquement. Par appel : entrée locale limitée à 60 000 caractères, sortie limitée à 9 000 tokens ; recherche Web limitée à 2 appels d’outil. Les limites sont en UTC et incluent tous les workers. Les tokens réellement retournés sont journalisés ; une requête interrompue peut rester sans consommation connue.

**Ce sont des plafonds de nombre d’appels, pas un plafond financier garanti.** La facture dépend du modèle, des tokens et des outils Web. Vérifier les tarifs et contrôles de facturation du fournisseur. Le dashboard affiche cette distinction.

Les tâches échouées apparaissent dans l’administration et font échouer le workflow. Après correction, créer une nouvelle tâche. Les tâches en cours ne sont pas récupérées automatiquement avant 30 minutes ; un worker périmé ne peut plus enregistrer son brouillon. Le workflow empêche deux exécutions de s’annuler mutuellement. Les verrous SQL protègent aussi la prise de tâches et les quotas si un second worker local est lancé.

Toute correction invalide l’approbation précédente. Deux éditeurs ne peuvent pas approuver une version périmée. Une actualisation ne peut pas écraser un article public plus récent. L’historique conserve les précédents brouillons, y compris ceux déjà publiés.

## 6. Autres plateformes

Deux connecteurs sont fournis, désactivés par défaut :

| Destination | Variables du worker | Comportement |
| --- | --- | --- |
| WordPress | `SEO_DESTINATIONS=wordpress`, `SEO_WORDPRESS_URL`, secrets `SEO_WORDPRESS_USER` et `SEO_WORDPRESS_APP_PASSWORD` | Publie un extrait déclaré avec lien vers l’original via `/wp-json/wp/v2/posts`. Mot de passe d’application et droit de publier requis. Aucune dépendance à un plugin SEO ; ne promet pas une balise canonical distante. |
| DEV | `SEO_DESTINATIONS=dev`, secret `SEO_DEV_API_KEY` | Publie un extrait via `/api/articles` avec `canonical_url` pointant sur Fableya. Réserver ce canal aux sujets réellement adaptés à sa communauté technique. |

Pour activer les deux, `SEO_DESTINATIONS=wordpress,dev`. Dans l’administration, sélectionner un article **déjà publié**, choisir la destination et confirmer la publication sur votre compte. Le worker conserve une copie de la version choisie et l’état de l’envoi. La contrainte `(article, version, destination)` empêche les doubles clics de créer plusieurs envois. Les envois WordPress refusent les redirections pour protéger les identifiants.

Un timeout ne signifie pas que la plateforme n’a rien publié : l’état devient « À vérifier ». Aucun renvoi automatique n’est effectué. Vérifier le compte distant avant toute nouvelle tentative ; une résolution manuelle de cet état en base doit être faite seulement après cette vérification. Un envoi annulé ou ambigu ne peut pas être recréé par double clic pour la même version. La file peut être annulée avant prise en charge.

Le bouton **Exporter en Markdown** reste disponible pour Medium, Substack et les autres services. Ces destinations n’ont pas de connecteur dans cette version. Aucun compte externe n’a été connecté ni aucun article publié pendant le développement.

## 7. Développement et tests

```bash
npm ci --ignore-scripts
npm run test:seo
npm run build
```

Les tests exécutent la migration dans un PostgreSQL embarqué (PGlite) et vérifient les permissions, les quotas, les workers, les versions, la validation, la publication et les conflits d’actualisation. Les tests HTTP utilisent des fournisseurs simulés et ne consomment pas de crédits API.

Pour exécuter le worker localement avec Node.js 22.9+ : copier `seo/.env.example` vers `seo/.env`, remplir les secrets, puis `npm run seo:worker`. Ce fichier est ignoré par Git. Une invocation traite jusqu’à quatre tâches et se termine ; la relancer ou utiliser cron pour un worker local.

Pour tester l’interface avec les fonctions Vercel : utiliser `vercel dev` avec les variables d’un projet de préproduction. `vite dev` seul ne sert pas les endpoints Vercel. Ne pas renseigner les secrets de production dans un test visuel.

### Vérification avant production

1. Déployer les fonctions sur une prévisualisation Vercel reliée à une base de préproduction migrée.
2. Vérifier qu’un visiteur reçoit 401 sur `/api/seo-admin` et qu’un utilisateur ordinaire reçoit 403.
3. Ajouter un sujet, lancer le worker, ouvrir le brouillon et vérifier deux sources.
4. Corriger puis approuver ; publier et vérifier le HTML initial, la canonique, la réponse 404 d’une URL absente et le sitemap.
5. Actualiser l’article : confirmer que l’ancienne version reste visible jusqu’à la nouvelle publication.
6. Configurer Search Console puis vérifier une importation réelle.

Les tests locaux ne valident pas les identifiants, la facturation, les API distantes ou l’infrastructure de production. Ces six vérifications nécessitent vos connexions effectives.

### Désactiver

Désactiver la création quotidienne dans l’administration arrête seulement l’ajout quotidien de nouveaux sujets. Pour arrêter aussi le traitement manuel et les publications planifiées, mettre `SEO_WORKER_ENABLED=false` et arrêter tout worker local. Annuler les tâches en attente ou archiver les brouillons planifiés si nécessaire. Les articles déjà publics restent accessibles.

## Références techniques

- [OpenAI — recherche Web](https://developers.openai.com/api/docs/guides/tools-web-search)
- [OpenAI — sorties structurées](https://developers.openai.com/api/docs/guides/structured-outputs)
- [Google — Search Analytics](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
- [Google — recommandations sur le contenu IA](https://developers.google.com/search/blog/2023/02/google-search-and-ai-content)
