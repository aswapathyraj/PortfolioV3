/**
 * Central configuration.
 *
 * Everything personal lives here — no component hardcodes a name, link, or
 * email. Fields left as an empty string are treated as "not configured yet":
 * the UI hides or disables the corresponding affordance instead of rendering a
 * dead link, and `npm run dev` prints a checklist of what is still missing.
 */

export const siteConfig = {
  // ---- Identity ----------------------------------------------------------
  name: 'Aswapathy Raj',
  initials: 'AR',
  title: 'Full-Stack Developer',
  headline: 'I build modern, scalable web applications from interface to database and deployment.',

  /** Shown in the hero badge. Set `available: false` to switch the copy. */
  availability: {
    available: true,
    label: 'Available for opportunities',
    unavailableLabel: 'Currently heads-down on a project',
  },

  /** Optional. Rendered in the contact panel and footer when present. */
  location: '',
  timezone: '',

  // ---- Contact & links ---------------------------------------------------
  email: 'aswapathyraj@gmail.com',
  github: 'https://github.com/aswapathyraj',
  linkedin: '',

  /**
   * Contact form delivery.
   *
   *   provider: 'web3forms' → POST to Web3Forms with `web3formsAccessKey`
   *   provider: 'endpoint'  → POST JSON to `endpoint`
   *   provider: 'mailto'    → open the visitor's mail client, prefilled
   *   provider: 'none'      → validate only, then show the mailto fallback
   *
   * The Web3Forms access key is public by design — it ships in the browser
   * bundle and only authorises submissions to your own inbox. If the key is
   * missing, the form falls back to the mailto path rather than faking a send.
   */
  contactForm: {
    provider: 'web3forms',
    web3formsAccessKey: 'bce7bec7-5443-4817-a224-5f70d298879c',
    /** Sender label shown in the notification email. */
    fromName: 'Portfolio Contact Form',
    /** Only used when `provider` is 'endpoint'. */
    endpoint: '',
  },

  /**
   * Path or URL to your CV. A file at `public/resume.pdf` is served from
   * `/resume.pdf`. Leave empty until the file exists — the resume buttons
   * switch to a "not uploaded yet" state rather than 404ing.
   */
  resume: '/resume.pdf',

  /** Used by the Developer Activity section to call the public GitHub API. */
  githubUsername: 'aswapathyraj',

  // ---- Deployment --------------------------------------------------------
  /** Canonical origin, no trailing slash. Used for SEO tags + sitemap. */
  siteUrl: '',

  // ---- SEO ---------------------------------------------------------------
  seo: {
    titleTemplate: '%s — Aswapathy Raj',
    defaultTitle: 'Aswapathy Raj — Full-Stack Developer',
    description:
      'Portfolio of Aswapathy Raj, a full-stack developer building modern web applications with React, Node.js, APIs, and databases.',
    keywords: [
      'full-stack developer',
      'React developer',
      'Node.js',
      'Express',
      'REST API',
      'SQLite',
      'Tailwind CSS',
    ],
    ogImage: '/og-image.svg',
    twitterHandle: '',
  },

  // ---- Feature flags -----------------------------------------------------
  features: {
    /** Desktop-only custom cursor. Auto-disabled on touch + reduced motion. */
    customCursor: true,
    themeToggle: true,
    /** Fetches public GitHub data when `githubUsername` is set. */
    githubActivity: true,
    scrollProgressBar: true,
  },
}

/** True when a config value has actually been filled in. */
export const isConfigured = (value) =>
  typeof value === 'string' ? value.trim().length > 0 : Boolean(value)

/** Absolute URL helper for SEO tags. Falls back to a relative path. */
export const absoluteUrl = (path = '/') => {
  const base = siteConfig.siteUrl.replace(/\/+$/, '')
  const suffix = path.startsWith('/') ? path : `/${path}`
  return base ? `${base}${suffix}` : suffix
}

/** Fields that must be filled before this is ready to publish. */
export const requiredConfigKeys = [
  ['email', siteConfig.email],
  ['github', siteConfig.github],
  ['linkedin', siteConfig.linkedin],
  ['resume', siteConfig.resume],
  ['githubUsername', siteConfig.githubUsername],
  ['siteUrl', siteConfig.siteUrl],
]

export const missingConfigKeys = () =>
  requiredConfigKeys.filter(([, value]) => !isConfigured(value)).map(([key]) => key)
