import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getEngineeringSteps, getProjectBySlug } from '../../lib/publicData.js'
import { usePublicData } from '../../lib/usePublicData.js'
import { Section, SectionHeader } from '../ui/Section.jsx'
import { Icon } from '../ui/Icon.jsx'
import { Tag } from '../ui/Tag.jsx'
import { cn } from '../../utils/cn.js'
import { useRovingIndex } from '../../hooks/useRovingIndex.js'
import { swap } from '../../animations/variants.js'

/**
 * "How I Build" — the nine-step lifecycle, inspectable.
 *
 * Each step's example links to the project it came from, so the process claims
 * are checkable against a case study rather than being generic process copy.
 */
export function Engineering() {
  usePublicData()
  const engineeringSteps = getEngineeringSteps()
  const [selected, setSelected] = useState(0)
  const step = engineeringSteps[selected]
  const exampleProject = step.example ? getProjectBySlug(step.example.project) : null

  const { getItemProps } = useRovingIndex({
    count: engineeringSteps.length,
    selected,
    onSelect: setSelected,
  })

  return (
    <Section id="engineering">
      <SectionHeader
        index="04"
        eyebrow="Engineering"
        title="How I Build"
        description="The path from an idea to something deployed. Select a step to see what happens there, what it is built with, why it matters, and where it showed up in real work."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:gap-6">
        {/* Step rail */}
        <div
          role="tablist"
          aria-label="Development lifecycle steps"
          aria-orientation="vertical"
          className="flex flex-col gap-1 rounded-panel border border-line bg-surface p-2"
        >
          {engineeringSteps.map((item, index) => {
            const active = selected === index

            return (
              <button
                key={item.id}
                {...getItemProps(index)}
                id={`engineering-tab-${item.id}`}
                aria-controls="engineering-panel"
                onClick={() => setSelected(index)}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-200',
                  active ? 'text-fg' : 'text-muted hover:bg-elevated hover:text-fg',
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="engineering-active"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                    className="absolute inset-0 rounded-lg border border-accent-line bg-accent-soft"
                  />
                ) : null}

                <span
                  className={cn(
                    'relative z-10 font-mono text-[0.6875rem] tabular-nums transition-colors duration-200',
                    active ? 'text-accent' : 'text-subtle',
                  )}
                >
                  {item.number}
                </span>

                <span
                  className={cn(
                    'relative z-10 flex size-7 shrink-0 items-center justify-center rounded-md border transition-colors duration-200',
                    active
                      ? 'border-accent-line bg-surface text-accent'
                      : 'border-line bg-sunken text-subtle group-hover:text-fg',
                  )}
                >
                  <Icon name={item.icon} className="size-3.5" />
                </span>

                <span className="relative z-10 min-w-0 flex-1 truncate-safe font-display text-[0.875rem]">
                  {item.title}
                </span>

                <Icon
                  name="chevronRight"
                  className={cn(
                    'relative z-10 size-3.5 shrink-0 transition-all duration-200',
                    active ? 'text-accent' : 'text-line-strong group-hover:translate-x-0.5',
                  )}
                />
              </button>
            )
          })}
        </div>

        {/* Detail */}
        <div
          id="engineering-panel"
          role="tabpanel"
          aria-labelledby={`engineering-tab-${step.id}`}
          className="min-w-0 rounded-panel border border-line bg-surface"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step.id} variants={swap} initial="hidden" animate="visible" exit="exit">
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-accent-line bg-accent-soft text-accent">
                    <Icon name={step.icon} className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate-safe font-display text-lg text-fg">{step.title}</h3>
                    <p className="mono-label mt-0.5">Step {step.number}</p>
                  </div>
                </div>
                <span className="mono-label tnum hidden shrink-0 sm:inline">
                  {step.number} / {engineeringSteps[engineeringSteps.length - 1].number}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:gap-6">
                <div>
                  <p className="mono-label mb-2.5">What happens</p>
                  <p className="text-pretty text-[0.875rem] leading-relaxed text-muted">{step.what}</p>
                </div>

                <div>
                  <p className="mono-label mb-2.5">Why it matters</p>
                  <p className="text-pretty text-[0.875rem] leading-relaxed text-muted">{step.why}</p>
                </div>

                <div className="sm:col-span-2">
                  <p className="mono-label mb-2.5">Technologies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {step.tech.map((tech) => (
                      <Tag key={tech}>{tech}</Tag>
                    ))}
                  </div>
                </div>
              </div>

              {/* Example from real work */}
              {step.example && exampleProject ? (
                <div className="border-t border-line bg-sunken px-5 py-4">
                  <p className="mono-label mb-2.5 flex items-center gap-1.5">
                    <Icon name="boxes" className="size-3" />
                    From {exampleProject.title}
                  </p>
                  <p className="text-pretty text-[0.875rem] leading-relaxed text-fg">
                    {step.example.note}
                  </p>
                  <Link
                    to={`/projects/${exampleProject.slug}`}
                    className="group mt-3 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-accent"
                  >
                    Open the case study
                    <Icon
                      name="arrowRight"
                      className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  )
}

export default Engineering
