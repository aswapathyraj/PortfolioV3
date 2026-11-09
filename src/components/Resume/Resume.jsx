import { siteConfig, isConfigured } from '../../config.js'
import { Container } from '../ui/Section.jsx'
import { Reveal } from '../ui/Reveal.jsx'
import { Button } from '../ui/Button.jsx'
import { Icon } from '../ui/Icon.jsx'
import { ConfigHint } from '../ui/EmptyState.jsx'
import { CornerTicks } from '../ui/Panel.jsx'

/**
 * Resume call to action.
 *
 * The file path is configurable and the buttons reflect reality: with nothing
 * configured they explain that instead of linking to a 404.
 */
export function Resume() {
  const configured = isConfigured(siteConfig.resume)
  const isExternal = configured && /^https?:/i.test(siteConfig.resume)

  return (
    <section id="resume" aria-labelledby="resume-heading" className="py-8 sm:py-12">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-panel border border-line bg-surface">
            <CornerTicks />

            {/* Single restrained accent wash — the only gradient in this section. */}
            <div
              aria-hidden="true"
              className="dot-field pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_right,black,transparent_70%)]"
            />

            <div className="relative flex flex-col items-start gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:p-10">
              <div className="max-w-xl">
                <p className="mono-label mb-3 flex items-center gap-2">
                  <Icon name="resume" className="size-3.5" />
                  Resume
                </p>
                <h2 id="resume-heading" className="text-2xl sm:text-3xl">
                  Want the complete picture?
                </h2>
                <p className="mt-3 text-pretty text-[0.9375rem] leading-relaxed text-muted">
                  The case studies here go deeper than a CV can. The document is there for the
                  version you can forward.
                </p>
                {!configured ? <ConfigHint field="resume" className="mt-4" /> : null}
              </div>

              <div className="flex w-full shrink-0 flex-wrap gap-2.5 lg:w-auto">
                {configured ? (
                  <>
                    <Button
                      href={siteConfig.resume}
                      external={isExternal}
                      size="lg"
                      icon="download"
                      {...(isExternal ? {} : { download: '' })}
                    >
                      Download Resume
                    </Button>
                    <Button
                      href={siteConfig.resume}
                      external
                      size="lg"
                      variant="secondary"
                      icon="eye"
                    >
                      View Resume
                    </Button>
                  </>
                ) : (
                  <div className="rounded-panel border border-dashed border-line bg-sunken px-5 py-4">
                    <p className="flex items-center gap-2 text-[0.875rem] font-medium text-muted">
                      <Icon name="info" className="size-4 shrink-0 text-subtle" />
                      Resume not uploaded yet
                    </p>
                    <p className="mt-1.5 max-w-xs text-[0.78125rem] leading-relaxed text-subtle">
                      Drop the PDF into <code className="font-mono text-muted">public/</code> and
                      point <code className="font-mono text-muted">resume</code> at it in the config.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

export default Resume
