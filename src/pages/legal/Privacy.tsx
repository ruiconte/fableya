import { PageSEO } from '../../components/PageSEO'

export function Privacy() {
  return (
    <div className="page-container max-w-3xl">
      <PageSEO title="Politique de confidentialité" canonical="/confidentialite" />
      <h1 className="text-3xl font-black mb-2">Politique de confidentialité</h1>
      <p className="text-kidoria-muted text-sm mb-8">Dernière mise à jour : juin 2025</p>

      <div className="card space-y-6 text-kidoria-muted leading-relaxed">
        <section>
          <h2 className="font-black text-xl text-kidoria-text mb-3">1. Responsable du traitement</h2>
          <p>[Nom de l'entreprise], [Adresse], [Email de contact]</p>
        </section>

        <section>
          <h2 className="font-black text-xl text-kidoria-text mb-3">2. Données collectées</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Adresse email et nom d'affichage (inscription)</li>
            <li>Données de personnalisation du livre (prénom enfant, âge, préférences)</li>
            <li>Données de paiement (traitées exclusivement par Stripe — nous ne stockons pas vos coordonnées bancaires)</li>
            <li>Cookies techniques nécessaires au fonctionnement du service</li>
          </ul>
        </section>

        <section>
          <h2 className="font-black text-xl text-kidoria-text mb-3">3. Finalités du traitement</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Création et gestion de votre compte</li>
            <li>Génération de votre livre personnalisé</li>
            <li>Traitement du paiement</li>
            <li>Envoi d'emails transactionnels (confirmation, réinitialisation de mot de passe)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-black text-xl text-kidoria-text mb-3">4. Base légale</h2>
          <p>Le traitement est fondé sur l'exécution du contrat (fourniture du service) et votre consentement pour les communications marketing.</p>
        </section>

        <section>
          <h2 className="font-black text-xl text-kidoria-text mb-3">5. Conservation des données</h2>
          <p>Vos données sont conservées pendant la durée de vie de votre compte. En cas de suppression de compte, vos données personnelles sont supprimées ou anonymisées dans un délai de 30 jours.</p>
        </section>

        <section>
          <h2 className="font-black text-xl text-kidoria-text mb-3">6. Vos droits (RGPD)</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Droit d'accès à vos données</li>
            <li>Droit de rectification</li>
            <li>Droit à l'effacement (droit à l'oubli)</li>
            <li>Droit à la portabilité</li>
            <li>Droit d'opposition</li>
          </ul>
          <p className="mt-3">Pour exercer ces droits : <a href="mailto:contact@kidoria.com" className="text-kidoria-rose">contact@kidoria.com</a></p>
        </section>

        <section>
          <h2 className="font-black text-xl text-kidoria-text mb-3">7. Sous-traitants</h2>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Supabase</strong> — hébergement base de données et authentification (EU)</li>
            <li><strong>Stripe</strong> — traitement des paiements</li>
          </ul>
        </section>

        <section>
          <h2 className="font-black text-xl text-kidoria-text mb-3">8. Réclamation</h2>
          <p>Vous pouvez introduire une réclamation auprès de la CNIL : <a href="https://www.cnil.fr" className="text-kidoria-rose">www.cnil.fr</a></p>
        </section>
      </div>
    </div>
  )
}
