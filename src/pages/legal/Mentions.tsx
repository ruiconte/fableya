import { PageSEO } from '../../components/PageSEO'

export function Mentions() {
  return (
    <div className="page-container max-w-3xl">
      <PageSEO title="Mentions légales" canonical="/mentions-legales" />
      <h1 className="text-3xl font-black mb-8">Mentions légales</h1>

      <div className="card space-y-6 text-kidoria-muted leading-relaxed">
        <section>
          <h2 className="font-black text-xl text-kidoria-text mb-3">Éditeur du site</h2>
          <p>
            <strong>[Nom de l'entreprise]</strong><br />
            [Forme juridique] au capital de [X] €<br />
            [Adresse complète]<br />
            SIRET : [XXXXXXXXXXX]<br />
            Email : <a href="mailto:contact@kidoria.com" className="text-kidoria-rose">contact@kidoria.com</a>
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl text-kidoria-text mb-3">Directeur de la publication</h2>
          <p>[Nom du directeur de publication]</p>
        </section>

        <section>
          <h2 className="font-black text-xl text-kidoria-text mb-3">Hébergement</h2>
          <p>
            <strong>Supabase Inc.</strong><br />
            970 Toa Payoh North, #07-04<br />
            Singapore 318992
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl text-kidoria-text mb-3">Propriété intellectuelle</h2>
          <p>
            L'ensemble du contenu de ce site (textes, graphismes, logos, images) est la propriété exclusive de [Nom de l'entreprise] et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
          </p>
        </section>

        <section>
          <h2 className="font-black text-xl text-kidoria-text mb-3">Cookies</h2>
          <p>
            Ce site utilise des cookies techniques strictement nécessaires au fonctionnement du service (authentification, session). Aucun cookie publicitaire ou de traçage n'est utilisé.
          </p>
        </section>
      </div>
    </div>
  )
}
