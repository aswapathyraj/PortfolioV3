import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { problems } from '../../data/problems.js'
import { Section, SectionHeader } from '../ui/Section.jsx'
import { Icon } from '../ui/Icon.jsx'
import { cn } from '../../utils/cn.js'
import { disclosure, staggerContainer, staggerItem } from '../../animations/variants.js'
import { viewport } from '../../animations/transitions.js'

/**
 * "Problems I Like Solving".
 *
 * Each card expands to the concrete version of the problem plus where it turned
 * up in real work — the point being that a list of interests is worth little
 * without an example attached.
 */
export function Problems() {
  const [openId, setOpenId] = useState(problems[0].id)

  return (
    <Section id="problems">
      <SectionHeader
        index="12"
        eyebrow="Problem Solving"
        title="Problems I Like Solving"
        description="The recurring ones. Expand any card for the concrete version and where it came up."
      />

      <motion.ul
        variants={staggerContainer(0.05)}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        className="grid grid-cols-1 gap-3 lg:grid-cols-2"
      >
        {problems.map((problem) => {
          const open = openId === problem.id
          const panelId = `problem-panel-${problem.id}`

          return (
            <motion.li key={problem.id} variants={staggerItem} className="min-w-0">
              <div
                className={cn(
                  'h-full overflow-hidden rounded-panel border transition-all duration-300',
                  open ? 'border-line-strong bg-surface shadow-panel' : 'border-line bg-surface',
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : problem.id)}
                  aria-expanded={open}
                  aria-controls={panelId}
                  className="group flex w-full items-start gap-3.5 p-4 text-left sm:p-5"
                >
                  <span
                    className={cn(
                      'mt-0.5 shrink-0 font-mono text-[0.6875rem] tabular-nums transition-colors duration-200',
                      open ? 'text-accent' : 'text-subtle',
                    )}
                  >
                    {problem.number}
                  </span>

                  <span
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-md border transition-colors duration-200',
                      open
                        ? 'border-accent-line bg-accent-soft text-accent'
                        : 'border-line bg-sunken text-subtle group-hover:text-fg',
                    )}
                  >
                    <Icon name={problem.icon} className="size-4" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[1.0625rem] leading-snug text-fg">
                      {problem.title}
                    </span>
                    <span className="mt-1.5 block text-[0.8125rem] leading-relaxed text-muted">
                      {problem.hook}
                    </span>
                  </span>

                  <Icon
                    name="chevronDown"
                    className={cn(
                      'mt-1 size-4 shrink-0 text-subtle transition-transform duration-300',
                      open && 'rotate-180',
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      id={panelId}
                      variants={disclosure}
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      className="overflow-hidden border-t border-line bg-sunken"
                    >
                      <div className="p-4 sm:p-5">
                        <p className="text-pretty text-[0.875rem] leading-relaxed text-muted">
                          {problem.detail}
                        </p>

                        {problem.example ? (
                          <p className="mt-4 flex items-start gap-2.5 border-l-2 border-accent/40 pl-3.5 text-[0.8125rem] leading-relaxed text-fg">
                            <span className="min-w-0">{problem.example}</span>
                          </p>
                        ) : null}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.li>
          )
        })}
      </motion.ul>
    </Section>
  )
}

export default Problems
