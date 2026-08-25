import { siteConfig, isConfigured } from '../../config.js'
import { Section, SectionHeader } from '../ui/Section.jsx'
import { Reveal } from '../ui/Reveal.jsx'
import { Icon } from '../ui/Icon.jsx'
import { Button } from '../ui/Button.jsx'
import { StatusDot } from '../ui/Tag.jsx'
import { SocialTextLinks, ResumeButton } from '../ui/SocialLinks.jsx'
import { ConfigHint } from '../ui/EmptyState.jsx'
import { ContactForm } from './ContactForm.jsx'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.js'

/** Email row with a copy affordance — faster than selecting the text. */
function EmailRow() {
  const { copy, copied } = useCopyToClipboard()

  if (!isConfigured(siteConfig.email)) {
    return (
      <div className="rounded-panel border border-dashed border-line bg-sunken p-4">
        <p className="flex items-center gap-2 text-[0.875rem] text-muted">
          <Icon name="mail" className="size-4 shrink-0 text-subtle" />
          No email address configured
        </p>
        <ConfigHint field="email" className="mt-2" />
      </div>
    )
  }

  return (
    <div className="rounded-panel border border-line bg-sunken p-4">
      <p className="mono-label mb-2.5">Direct</p>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={`mailto:${siteConfig.email}`}
          className="min-w-0 truncate-safe font-mono text-[0.875rem] text-fg transition-colors duration-200 hover:text-accent"
        >
          {siteConfig.email}
        </a>
        <Button
          as="button"
          size="sm"
          variant="ghost"
          icon={copied ? 'check' : 'copy'}
          onClick={() => copy(siteConfig.email)}
          className={copied ? 'text-accent' : undefined}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  )
}

export function Contact() {
  const { availability } = siteConfig

  return (
    <Section id="contact" className="pb-24 sm:pb-28">
      <SectionHeader
        index="12"
        eyebrow="Contact"
        title="Let's Build Something."
        description="I'm open to interesting projects, collaborations, internships, freelance work, and software development roles."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-6">
        {/* Form */}
        <Reveal className="min-w-0">
          <div className="rounded-panel border border-line bg-surface p-5 sm:p-6">
            <ContactForm />
          </div>
        </Reveal>

        {/* Side column */}
        <Reveal delay={0.08} className="flex min-w-0 flex-col gap-4">
          <div className="rounded-panel border border-line bg-surface p-5">
            <div className="flex items-center gap-2.5">
              <StatusDot
                tone={availability.available ? 'accent' : 'warn'}
                pulse={availability.available}
              />
              <p className="text-[0.875rem] font-medium text-fg">
                {availability.available ? availability.label : availability.unavailableLabel}
              </p>
            </div>

            {(isConfigured(siteConfig.location) || isConfigured(siteConfig.timezone)) && (
              <p className="mono-label mt-3 flex items-center gap-1.5">
                <Icon name="location" className="size-3" />
                {[siteConfig.location, siteConfig.timezone].filter(Boolean).join(' · ')}
              </p>
            )}

            <div className="mt-5 border-t border-line pt-4">
              <p className="mono-label mb-3">Elsewhere</p>
              <SocialTextLinks />
            </div>

            <div className="mt-5 border-t border-line pt-4">
              <ResumeButton size="sm" variant="secondary" className="w-full" />
            </div>
          </div>

          <EmailRow />

          <p className="flex items-start gap-2 rounded-inset border border-line bg-sunken px-3.5 py-3 text-[0.75rem] leading-relaxed text-subtle">
            <Icon name="info" className="mt-0.5 size-3.5 shrink-0" />
            The form validates your message client-side and server-side using the same module. Where
            it goes next depends on which provider is configured — right now, nothing is sent
            silently.
          </p>
        </Reveal>
      </div>
    </Section>
  )
}

export default Contact
