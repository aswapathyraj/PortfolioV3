import { siteConfig, isConfigured } from '../../config.js'
import { cn } from '../../utils/cn.js'
import { Button, IconButton } from './Button.jsx'
import { Icon } from './Icon.jsx'
import { GithubIcon, LinkedinIcon } from './BrandIcons.jsx'

/**
 * The one place that decides how a configured-vs-unconfigured personal link
 * renders. Reused by the navbar, hero, contact panel, and footer, so an unset
 * value degrades identically everywhere instead of shipping a dead link.
 */

/** Declared at module scope so its identity is stable across renders. */
const MailGlyph = ({ className }) => <Icon name="mail" className={className} />

export const socialLinks = () => [
  {
    id: 'github',
    label: 'GitHub',
    href: siteConfig.github,
    configured: isConfigured(siteConfig.github),
    Component: GithubIcon,
    configKey: 'github',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: siteConfig.linkedin,
    configured: isConfigured(siteConfig.linkedin),
    Component: LinkedinIcon,
    configKey: 'linkedin',
  },
  {
    id: 'email',
    label: 'Email',
    href: isConfigured(siteConfig.email) ? `mailto:${siteConfig.email}` : '',
    configured: isConfigured(siteConfig.email),
    Component: MailGlyph,
    configKey: 'email',
  },
]

/** Row of icon-only social links. Unset entries are omitted, not disabled. */
export function SocialIconRow({ items = socialLinks(), className, size = 'icon-sm' }) {
  const available = items.filter((item) => item.configured)
  if (available.length === 0) return null

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {available.map(({ id, label, href, Component }) => (
        <IconButton
          key={id}
          href={href}
          label={label}
          size={size}
          variant="ghost"
          className="text-muted hover:text-fg"
        >
          <Component className="size-[1.05rem]" />
        </IconButton>
      ))}
    </div>
  )
}

/** Text links with icons, for the footer and contact column. */
export function SocialTextLinks({ className }) {
  const available = socialLinks().filter((item) => item.configured)
  if (available.length === 0) return null

  return (
    <ul className={cn('flex flex-col gap-2.5', className)}>
      {available.map(({ id, label, href, Component }) => (
        <li key={id}>
          <a
            href={href}
            {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
            className="group inline-flex items-center gap-2.5 text-sm text-muted transition-colors duration-200 hover:text-fg"
          >
            <Component className="size-4 text-subtle transition-colors duration-200 group-hover:text-accent" />
            {label}
            <Icon
              name="arrowUpRight"
              className="size-3 opacity-0 transition-all duration-200 group-hover:opacity-100"
            />
          </a>
        </li>
      ))}
    </ul>
  )
}

/**
 * Resume affordance.
 *
 * With no file configured it renders a disabled control that says so, rather
 * than a button that 404s. `variant` and `size` pass through to Button.
 */
export function ResumeButton({ variant = 'secondary', size = 'md', className, label = 'Resume', icon = 'resume' }) {
  const configured = isConfigured(siteConfig.resume)

  if (!configured) {
    return (
      <Button
        as="button"
        variant={variant}
        size={size}
        icon={icon}
        disabled
        aria-disabled="true"
        title="No resume file is configured yet"
        className={cn('cursor-not-allowed', className)}
      >
        {label}
      </Button>
    )
  }

  const isExternal = /^https?:/i.test(siteConfig.resume)

  return (
    <Button
      href={siteConfig.resume}
      external={isExternal}
      variant={variant}
      size={size}
      icon={icon}
      className={className}
      {...(isExternal ? {} : { target: '_blank', rel: 'noreferrer' })}
    >
      {label}
    </Button>
  )
}
