import { absoluteUrl } from '../../config.js'
import { useSite } from '../../lib/usePublicData.js'

/**
 * Document metadata, driven from the live site profile/seo when available and
 * src/config.js as the static fallback.
 *
 * React 19 hoists <title>, <meta>, and <link> rendered anywhere in the tree
 * into <head>, so route-level components can own their own SEO without a
 * third-party head manager.
 */
export function Seo({ title, description, path = '/', type = 'website', noindex = false }) {
  const { site, seo } = useSite()

  const resolvedTitle = title
    ? seo.titleTemplate.replace('%s', title)
    : seo.defaultTitle

  const resolvedDescription = description || seo.description
  const url = seo.canonicalUrl || absoluteUrl(path)
  const image = absoluteUrl(seo.ogImage)

  return (
    <>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <link rel="canonical" href={url} />
      {noindex ? <meta name="robots" content="noindex,nofollow" /> : null}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={`${site.name} — ${site.title}`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={image} />
      {seo.twitterHandle ? (
        <meta name="twitter:creator" content={seo.twitterHandle} />
      ) : null}
    </>
  )
}

export default Seo
