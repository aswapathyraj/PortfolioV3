# Aswapathy Raj | Full-Stack Developer Portfolio

A data-driven developer portfolio built to make the work inspectable. Instead of
only listing technologies, the site demonstrates them through interactive case
studies, architecture and database diagrams, a mock API explorer, responsive UI,
and a configurable contact flow.

React 19 · Vite 8 · Tailwind CSS v4 · Framer Motion · React Router 7

## Live project links

- [Are You A Girl?](https://are-you-a-girl.vercel.app) — interactive frontend prank quiz
- [QR Food Ordering System](https://github.com/aswapathyraj/food-ordering-app) — full-stack restaurant ordering platform
- [CameraPort](https://github.com/aswapathyraj/Cameraport) — camera repair and service management system

The portfolio itself is designed to be deployed as a static site. Add its public
URL to `siteUrl` in `src/config.js` before publishing so canonical metadata and
the sitemap are correct.

---

## Features

- Responsive single-page portfolio with deep-linkable project case studies
- Four documented projects rendered from `src/data/projects.js`
- Interactive skills explorer with project cross-references
- Architecture and schema diagrams generated from project data
- Browser-based API explorer with realistic payloads, status codes, validation, and simulated latency
- Light and dark themes driven by shared CSS/Tailwind tokens
- Reduced-motion support through Framer Motion's user preference handling
- Keyboard-friendly navigation, focus management, semantic labels, and error boundaries
- Public GitHub activity panel using the unauthenticated GitHub API
- SEO metadata, Open Graph image, robots file, and generated sitemap
- Route-level code splitting for project detail and not-found pages

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # generates sitemap, then builds to dist/
npm run preview    # serve the production build
npm run lint       # oxlint
```

---

## Before you publish — fill in `src/config.js`

Nothing personal is hardcoded in a component. Every link, address, and flag lives
in `src/config.js`, and anything left as an empty string is treated as *not
configured yet*: the UI hides or disables that affordance instead of rendering a
dead link. `npm run dev` prints a checklist of what is still empty.

These fields should be reviewed before publishing:

| Field            | What it does                                                     |
| ---------------- | ---------------------------------------------------------------- |
| `email`          | Contact panel, footer, and the mailto fallback on the form        |
| `github`         | Navbar, hero, footer links                                       |
| `linkedin`       | Navbar, hero, footer links                                       |
| `resume`         | Resume buttons. Put the PDF in `public/` and use `/resume.pdf`    |
| `githubUsername` | Powers the live Developer Activity section                        |
| `siteUrl`        | Canonical URL, Open Graph tags, and the generated sitemap         |

Optional: `location`, `timezone`, `availability`, `seo.twitterHandle`, and the
`features` flags (custom cursor, theme toggle, GitHub activity, progress bar).

The current repository includes `public/resume.pdf`, but `siteUrl` and
`linkedin` are still empty. In development, the app prints any empty required
configuration fields to the browser console.

## Contact form

The form always validates input in the browser. Delivery depends on
`siteConfig.contactForm.provider`:

| Provider | Behavior |
| --- | --- |
| `none` | Validates and offers a prefilled `mailto:` fallback; sends nothing automatically |
| `mailto` | Opens the visitor's email client with the message prefilled |
| `endpoint` | Sends JSON to the configured `endpoint` |
| `web3forms` | Sends to Web3Forms using a public access key |

For Web3Forms, add the provider and access key in `src/config.js`. The API
explorer's `POST /api/contact` is intentionally validation-only and never
delivers a message.

### Contact form delivery

The form submits through [Web3Forms](https://web3forms.com) — no backend, no keys
to keep secret. Get a free access key by entering your email at web3forms.com,
confirm it from the verification mail, and paste the key into `src/config.js`:

```js
contactForm: {
  provider: 'web3forms',
  web3formsAccessKey: 'your-access-key',
  fromName: 'Portfolio Contact Form',
}
```

Submissions arrive in the inbox that owns the key. The access key is public by
design — it ships in the browser bundle and only permits sends to your own
address — so committing it is fine. A hidden `botcheck` honeypot field is
included, which Web3Forms uses to drop bot submissions.

The other providers:

```js
contactForm: { provider: 'endpoint', endpoint: 'https://…' }  // POSTs JSON
contactForm: { provider: 'mailto' }                           // opens mail client
contactForm: { provider: 'none' }                             // validate only
```

If the selected provider is missing what it needs (no access key, no endpoint),
the form validates and then tells the visitor plainly that nothing was sent,
offering a prefilled mailto — rather than showing a false success.

---

## Adding content

Everything renders from `src/data/`. No component changes are needed.

- **A project** — append an object to `src/data/projects.js`. It appears in the
  Projects section, gets a full case-study route at `/projects/<slug>`, is added
  to the sitemap, and shows up in the mock `/api/projects` payload. Copy an
  existing entry for the field shapes; `technologies` holds skill ids from
  `skills.js`, which is what drives the skill→project cross-referencing.
- **A skill** — add it to the right category in `src/data/skills.js`. Which
  projects use it is derived from `projects.js`, never typed twice.
- **Screenshots** — drop images in `public/` and add them to a project's
  `screenshots` array. Until then each project renders a miniature of its own
  architecture rather than a stock mockup.
- **Experience, security controls, engineering steps, problems, API endpoints** —
  one file each in `src/data/`.

### Current projects

| Project | Type | Status |
| --- | --- | --- |
| QR Food Ordering System | Full-stack application | Shipped |
| Developer Portfolio | Frontend engineering | Shipped |
| Are You A Girl? | Interactive web experience | Shipped |
| CameraPort | Full-stack application | Shipped |

`next-project` is a deliberately excluded placeholder for the next case study.

---

## Architecture

```
src/
├── config.js            single source for identity, links, SEO, feature flags
├── index.css            design tokens + base layer + custom utilities
├── data/                all content: projects, skills, security, api, …
├── animations/          shared Framer variants and easing curves
├── hooks/               scroll-spy, theme, focus trap, roving tabindex, GitHub
├── utils/               cn, validation, formatting, the mock API, scrolling
├── components/
│   ├── ui/              primitives: Button, Panel, Section, Icon, CodeBlock, …
│   └── <Section>/       one folder per page section
└── pages/               HomePage, ProjectDetailPage, NotFoundPage
```

**Theming.** The Tailwind theme is declared `inline`, so utilities compile to
`var(--p-…)` rather than a baked hex value. Light mode is therefore a second
block of variable declarations under `[data-theme='light']` — not a `dark:`
variant on every element. No component carries theme-specific classes.

**Motion.** `<MotionConfig reducedMotion="user">` in `App.jsx` is the single
switch that makes every animation respect `prefers-reduced-motion`: transforms
and layout animation are dropped, opacity is kept. That is why no variant in
`src/animations/` needs a second reduced-motion definition.

**Honesty by construction.** The hero stats are computed from `projects.js` and
`skills.js` so they cannot drift. The security section separates `implemented`
from `studied` and renders them differently. The GitHub panel ships no token, so
a rate-limited response is a designed state rather than a hidden failure. The API
explorer is labelled a mock and its latency constant is surfaced as "simulated".

---

## Two gotchas worth knowing

Both were real bugs found while testing at 320px, and both are the kind that
come back if you do not know about them:

1. **`truncate` on a flex item needs `min-width: 0`.** Without it the item's
   automatic minimum keeps its un-wrapped text at full width, the ellipsis never
   engages, and the container is pushed past the viewport. Use the
   `truncate-safe` utility in `index.css`, which pairs the two.
2. **Grids need an explicit base column template.** Tailwind's `grid-cols-N`
   compiles to `minmax(0, 1fr)`, but a grid that only declares `sm:grid-cols-2`
   has *no* template at mobile widths, so the implicit `auto` track floors at
   min-content and overflows. Always include a base `grid-cols-1`.

---

## Deployment

Static output in `dist/` — any static host works.

```bash
npm run build
```

The app uses client-side routing, so the host must rewrite unknown paths to
`index.html` or `/projects/<slug>` will 404 on a hard refresh. On Vercel this is
the default for SPAs; elsewhere add the equivalent rewrite.

Set `siteUrl` in `src/config.js` before building — the sitemap and canonical tags
use it.
