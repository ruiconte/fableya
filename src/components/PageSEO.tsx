import { Helmet } from 'react-helmet-async'

interface Props {
  title: string
  description?: string
  canonical?: string
}

export function PageSEO({ title, description, canonical }: Props) {
  const fullTitle = `${title} | Fableya`
  const url = canonical ? `https://fableya.com${canonical}` : undefined

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {url && <link rel="canonical" href={url} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
    </Helmet>
  )
}
