import { Section, SectionHeader } from '../ui/Section.jsx'
import { Reveal } from '../ui/Reveal.jsx'
import { Button } from '../ui/Button.jsx'
import { Icon } from '../ui/Icon.jsx'
import { CornerTicks } from '../ui/Panel.jsx'

/**
 * PixelSync Studio — the founder's company, not an employer.
 *
 * Copy stays factual: no invented clients, case-study counts, or availability
 * claims. Where the studio's work overlaps this portfolio (same stack, same
 * standards) it is stated, not implied.
 */
const process = [
  {
    id: 'design',
    icon: 'penTool',
    step: '01',
    title: 'Design',
    detail:
      'Interface work from sketch to system — hierarchy, responsive layouts, and every state (empty, loading, error) decided before a build starts.',
  },
  {
    id: 'build',
    icon: 'code',
    step: '02',
    title: 'Build',
    detail:
      'Full-stack implementation — React on the front, REST APIs and relational databases behind them, with authentication and deployment included.',
  },
  {
    id: 'ship',
    icon: 'rocket',
    step: '03',
    title: 'Ship',
    detail:
      'One point of contact from brief to launch. PixelSync projects ship the same way this site was — nothing on our side is a demo.',
  },
]

export function Studio() {
  return (
    <Section id="studio">
      <SectionHeader
        index="04"
        eyebrow="Studio"
        title="PixelSync Studio — my company."
        description="A two-person web design and full-stack development studio I run with Sharat S Unnithan. We design, build and ship modern websites, web apps and digital experiences — from interface to deployment."
      />

      <Reveal>
        <div className="relative overflow-hidden rounded-panel border border-line bg-surface">
          <CornerTicks />

          <div
            aria-hidden="true"
            className="dot-field pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_left,black,transparent_60%)]"
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10">
            {/* Identity + CTAs */}
            <div className="flex flex-col justify-center gap-6 border-b border-line p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
              <span className="flex size-12 items-center justify-center rounded-panel border border-accent-line bg-accent-soft text-accent">
                <Icon name="sparkles" className="size-6" />
              </span>

              <div>
                <p className="mono-label mb-3">ASWAPATHY RAJ + SHARAT S UNNITHAN</p>
                <h3 className="font-display text-2xl leading-snug text-fg sm:text-3xl">
                  PixelSync <span className="text-accent">Studio</span>
                </h3>
                <p className="mt-3 max-w-md text-pretty text-[0.9375rem] leading-relaxed text-muted">
                  Modern websites, web apps and digital experiences — designed with intent and
                  built to last. The same care that goes into this portfolio goes into anything we
                  ship for a client.
                </p>
              </div>

              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {['Web Design', 'UI/UX', 'Full-Stack Development'].map((tag) => (
                  <li key={tag} className="flex items-center gap-2 text-[0.8125rem] text-muted">
                    <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
                    {tag}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2.5">
                <Button href="https://pixelsyncstudio.vercel.app/" size="md" iconRight="external">
                  Visit PixelSync Studio
                </Button>
                <Button
                  href="https://github.com/aswapathyraj/pixelsyncstudio"
                  variant="secondary"
                  size="md"
                  icon="git"
                >
                  Studio repo
                </Button>
              </div>
            </div>

            {/* How it works together */}
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="mono-label mb-5 flex items-center gap-2">
                <Icon name="layers" className="size-3.5" />
                How it works together
              </p>

              <ol className="flex flex-col">
                {process.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-4 border-b border-line/60 py-4 first:pt-0 last:border-b-0 last:pb-0"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-sunken text-accent">
                      <Icon name={item.icon} className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-baseline gap-2">
                        <span className="mono-label tnum text-subtle">{item.step}</span>
                        <span className="font-display text-[1.0625rem] text-fg">{item.title}</span>
                      </p>
                      <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">
                        {item.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}

export default Studio
