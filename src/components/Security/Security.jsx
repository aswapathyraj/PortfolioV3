import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  getSecurityControls,
  getSecurityLevels,
  getSecurityNote,
  getProjectBySlug,
} from '../../lib/publicData.js'
import { usePublicData } from '../../lib/usePublicData.js'
import { Section, SectionHeader } from '../ui/Section.jsx'
import { Icon } from '../ui/Icon.jsx'
import { cn } from '../../utils/cn.js'
import { disclosure, staggerContainer, staggerItem } from '../../animations/variants.js'
import { viewport } from '../../animations/transitions.js'

/**
 * Security section, presented as a status board.
 *
 * The two-level split — implemented vs studied — is the whole point. A board
 * that marks everything green is not a security section, it is a claim. Each
 * implemented control links to the project it runs in.
 */

const getSecurityLevelsRef = getSecurityLevels

function ControlCard({ control, expanded, onToggle }) {
  const level = getSecurityLevelsRef()[control.level]
  const isImplemented = control.level === 'implemented'
  const panelId = `security-panel-${control.id}`

  return (
    <motion.li variants={staggerItem} className="min-w-0">
      <div
        className={cn(
          'h-full overflow-hidden rounded-panel border transition-all duration-300',
          expanded ? 'border-line-strong bg-surface shadow-panel' : 'border-line bg-surface',
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="flex w-full items-start gap-3.5 p-4 text-left"
        >
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-md border transition-colors duration-200',
              isImplemented
                ? 'border-accent-line bg-accent-soft text-accent'
                : 'border-line bg-sunken text-subtle',
            )}
          >
            <Icon name={control.icon} className="size-4" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="mono-label block">{control.label}</span>

            <span className="mt-1.5 flex items-center gap-2">
              <Icon
                name={isImplemented ? 'checkCircle' : 'info'}
                className={cn('size-3.5 shrink-0', isImplemented ? 'text-accent' : 'text-subtle')}
              />
              <span className="truncate-safe font-display text-[0.9375rem] text-fg">{control.value}</span>
            </span>

            <span className="mt-2 block text-[0.78125rem] leading-relaxed text-muted">
              {control.summary}
            </span>
          </span>

          <Icon
            name="chevronDown"
            className={cn(
              'mt-1 size-4 shrink-0 text-subtle transition-transform duration-300',
              expanded && 'rotate-180',
            )}
          />
        </button>

        {/* Level chip */}
        <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 font-mono text-[0.5625rem] uppercase tracking-wider',
              isImplemented
                ? 'border-accent-line bg-accent-soft text-accent'
                : 'border-line bg-sunken text-subtle',
            )}
          >
            <span
              className={cn('size-1 rounded-full', isImplemented ? 'bg-accent' : 'bg-subtle')}
              aria-hidden="true"
            />
            {level.label}
          </span>

          {control.projects.length ? (
            <span className="mono-label truncate-safe">
              {control.projects.length} project{control.projects.length === 1 ? '' : 's'}
            </span>
          ) : null}
        </div>

        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.div
              id={panelId}
              variants={disclosure}
              initial="collapsed"
              animate="open"
              exit="collapsed"
              className="overflow-hidden border-t border-line bg-sunken"
            >
              <div className="p-4">
                <p className="text-pretty text-[0.8125rem] leading-relaxed text-muted">
                  {control.detail}
                </p>

                {control.projects.length ? (
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {control.projects.map((slug) => {
                      const project = getProjectBySlug(slug)
                      if (!project) return null
                      return (
                        <Link
                          key={slug}
                          to={`/projects/${slug}`}
                          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[0.75rem] text-muted transition-colors duration-200 hover:border-accent-line hover:text-fg"
                        >
                          {project.title}
                          <Icon name="arrowUpRight" className="size-3" />
                        </Link>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.li>
  )
}

export function Security() {
  usePublicData()
  const securityControls = getSecurityControls()
  const securityLevels = getSecurityLevels()
  const securityNote = getSecurityNote()
  const [expandedId, setExpandedId] = useState(securityControls[0].id)

  const implemented = securityControls.filter((control) => control.level === 'implemented')
  const studied = securityControls.filter((control) => control.level === 'studied')

  return (
    <Section id="security">
      <SectionHeader
        index="08"
        eyebrow="Security"
        title="Security By Design"
        description="Split honestly between what is running in these projects and what I understand but have not shipped. Expand any control for the reasoning behind it."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-lg border border-accent-line bg-accent-soft px-3 py-2">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              <span className="mono-label text-accent">{implemented.length} implemented</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
              <span className="size-1.5 rounded-full bg-subtle" aria-hidden="true" />
              <span className="mono-label">{studied.length} studied</span>
            </span>
          </div>
        }
      />

      <motion.ul
        variants={staggerContainer(0.05)}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {securityControls.map((control) => (
          <ControlCard
            key={control.id}
            control={control}
            expanded={expandedId === control.id}
            onToggle={() => setExpandedId(expandedId === control.id ? null : control.id)}
          />
        ))}
      </motion.ul>

      {/* Honesty note — deliberately prominent rather than fine print. */}
      <div className="mt-5 flex items-start gap-3 rounded-panel border border-line bg-sunken px-4 py-3.5">
        <Icon name="info" className="mt-0.5 size-4 shrink-0 text-subtle" />
        <div>
          <p className="text-[0.8125rem] leading-relaxed text-muted">{securityNote}</p>
          <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Object.entries(securityLevels).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <dt
                  className={cn(
                    'shrink-0 font-mono text-[0.5625rem] uppercase tracking-wider',
                    value.tone === 'accent' ? 'text-accent' : 'text-subtle',
                  )}
                >
                  {value.label}
                </dt>
                <dd className="text-[0.75rem] text-subtle">— {value.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  )
}

export default Security
