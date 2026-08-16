import { PageSEO } from '../../components/PageSEO'

export function CGU() {
  return (
    <div className="page-container max-w-3xl prose prose-sm">
      <PageSEO title="Conditions Générales d'Utilisation" canonical="/cgu" />
      <h1 className="text-3xl font-black mb-2">Conditions Générales d'Utilisation</h1>
      <p className="text-kidoria-muted text-sm mb-8">Dernière mise à jour : juin 2025</p>

      <div className="card space-y-6 text-kidoria-muted leading-relaxed">
        <section>
          <h2 className="font-black text-xl text-kidoria-text mb-3">1. Présentation du service</h2>
          <p>Fableya est un service de génération de livres illustrés personnalisés pour enfants, accessible à l'adresse <strong>fableya.com</strong>. Le service est exploité par [Nom de l'entreprise], [Adresse], [SIRET].</p>
        </section>

        <section>
          <h2 className="font-black text-xl text-kidoria-text mb-3">2. Acceptation des conditions</h2>
          <p>En utilisant Fableya, vous acceptez les présentes CGU dans leur intégralité. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser ce service.</p>
        </section>

        <section>
          <h2 className="font-black text-xl text-kidoria-text mb-3">3. Tarifs et paiement</h2>
          <p>Le prix d'un livre personnalisé est de <strong>5 € TTC</strong>. Le paiement est effectué en une seule fois, sans abonnement ni frais récurrents. Le paiement est traité de manière sécurisée par Stripe.</p>
        </section>

        <section>
          <h2 className="font-black text-xl text-kidoria-text mb-3">4. Génération du livre</h2>
          <p>Après paiement confirmé, votre livre est généré automatiquement. Le livre est accessible depuis votre bibliothèque personnelle sur le site. Aucun remboursement ne sera accordé une fois le livre généré, sauf en cas de défaillance technique imputable à Fableya.</p>
        </section>

        <section>
          <h2 className="font-black text-xl text-kidoria-text mb-3">5. Propriété intellectuelle</h2>
          <p>Les livres générés sont destinés à un usage personnel et familial uniquement. Toute reproduction, distribution ou exploitation commerciale est interdite sans autorisation écrite préalable.</p>
        </section>

        <section>
          <h2 className="font-black text-xl text-kidoria-text mb-3">6. Droit de rétractation</h2>
          <p>Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux contenus numériques dont l'exécution a commencé avec votre accord préalable exprès. En acceptant le lancement de la génération, vous renoncez à votre droit de rétractation.</p>
        </section>

        <section>
          <h2 className="font-black text-xl text-kidoria-text mb-3">7. Limitation de responsabilité</h2>
          <p>Fableya s'efforce de fournir un service de qualité mais ne peut garantir la disponibilité permanente du service. En cas d'indisponibilité, la génération sera relancée sans frais supplémentaires.</p>
        </section>

        <section>
          <h2 className="font-black text-xl text-kidoria-text mb-3">8. Contact</h2>
          <p>Pour toute question : <a href="mailto:contact@kidoria.com" className="text-kidoria-rose">contact@kidoria.com</a></p>
        </section>
      </div>
    </div>
  )
}
