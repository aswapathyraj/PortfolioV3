import { siteConfig, absoluteUrl } from '../../config.js'

/**
 * Document metadata, driven from src/config.js.
 *
 * React 19 hoists <title>, <meta>, and <link> rendered anywhere in the tree
 * into <head>, so route-level components can own their own SEO without a
 * third-party head manager.
 */
export function Seo({ title, description, path = '/', type = 'website', noindex = false }) {
  const { seo } = siteConfig

  const resolvedTitle = title
    ? seo.titleTemplate.replace('%s', title)
    : seo.defaultTitle

  const resolvedDescription = description || seo.description
  const url = absoluteUrl(path)
  const image = absoluteUrl(seo.ogImage)

  return (
    <>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <link rel="canonical" href={url} />
      {noindex ? <meta name="robots" content="noindex,nofollow" /> : null}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={`${siteConfig.name} — ${siteConfig.title}`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={image} />
      {siteConfig.seo.twitterHandle ? (
        <meta name="twitter:creator" content={siteConfig.seo.twitterHandle} />
      ) : null}
    </>
  )
}

export default Seo
