import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { skillCategories, allSkills } from '../../data/skills.js'
import { Section, SectionHeader } from '../ui/Section.jsx'
import { Icon } from '../ui/Icon.jsx'
import { Button } from '../ui/Button.jsx'
import { Tag } from '../ui/Tag.jsx'
import { cn } from '../../utils/cn.js'
import { scrollToSection } from '../../utils/scroll.js'
import { useRovingIndex } from '../../hooks/useRovingIndex.js'
import { useSkillFocus } from '../../hooks/useSkillFocus.jsx'
import { staggerContainer, staggerItem, swap } from '../../animations/variants.js'
import { viewport } from '../../animations/transitions.js'

/**
 * Interactive technology explorer.
 *
 * Deliberately not a logo grid. Selecting a technology shows what it is used
 * for here and which real projects it appears in — the cross-reference is
 * derived from src/data/projects.js, so it cannot claim a project that does not
 * list it. The selection is also published to the Projects section, which marks
 * the matching cards.
 */
export function Skills() {
  const [categoryIndex, setCategoryIndex] = useState(0)
  const category = skillCategories[categoryIndex]

  const [selectedId, setSelectedId] = useState(category.skills[0].id)
  const { focusSkill, clearFocus } = useSkillFocus()

  /**
   * Derived rather than synced: when the category changes, the previously
   * selected skill may not be in it, so fall back to that category's first
   * skill during render instead of correcting it in an effect afterwards.
   */
  const activeId = category.skills.some((skill) => skill.id === selectedId)
    ? selectedId
    : category.skills[0].id

  const selected = useMemo(() => allSkills.find((skill) => skill.id === activeId), [activeId])

  // Publish the selection so Projects can highlight matching cards, and clear it
  // when this section unmounts so no stale highlight is left behind.
  useEffect(() => {
    if (selected) focusSkill({ id: selected.id, name: selected.name })
    return () => clearFocus()
  }, [selected, focusSkill, clearFocus])

  const { getItemProps } = useRovingIndex({
    count: skillCategories.length,
    selected: categoryIndex,
    onSelect: setCategoryIndex,
    orientation: 'horizontal',
  })

  return (
    <Section id="skills">
      <SectionHeader
        index="02"
        eyebrow="Tech Stack"
        title="The stack, and what I actually did with it."
        description="Select a technology to see how it is used and which projects it appears in. Every cross-reference is derived from the project data — nothing is listed here that is not used somewhere real."
      />

      {/* Category tabs */}
      <div
        role="tablist"
        aria-label="Skill categories"
        aria-orientation="horizontal"
        className="scrollbar-thin -mx-5 mb-6 flex gap-1.5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0"
      >
        {skillCategories.map((item, index) => {
          const active = categoryIndex === index
          return (
            <button
              key={item.id}
              {...getItemProps(index)}
              id={`skills-tab-${item.id}`}
              aria-controls="skills-panel"
              onClick={() => setCategoryIndex(index)}
              className={cn(
                'relative flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2.5 text-[0.8125rem] font-medium transition-colors duration-200',
                active
                  ? 'border-accent-line bg-accent-soft text-accent'
                  : 'border-line bg-surface text-muted hover:border-line-strong hover:text-fg',
              )}
            >
              <Icon name={item.icon} className="size-4" />
              {item.label}
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 font-mono text-[0.625rem] tabular-nums',
                  active ? 'bg-accent/15 text-accent' : 'bg-elevated text-subtle',
                )}
              >
                {item.skills.length}
              </span>
            </button>
          )
        })}
      </div>

      <div
        id="skills-panel"
        role="tabpanel"
        aria-labelledby={`skills-tab-${category.id}`}
        className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-6"
      >
        {/* Skill grid */}
        <div className="min-w-0">
          <p className="mb-4 text-sm text-muted">{category.blurb}</p>

          <AnimatePresence mode="wait" initial={false}>
            <motion.ul
              key={category.id}
              variants={staggerContainer(0.04)}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3"
            >
              {category.skills.map((skill) => {
                const active = activeId === skill.id
                const usedIn = allSkills.find((entry) => entry.id === skill.id)?.projects ?? []

                return (
                  <motion.li key={skill.id} variants={staggerItem}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(skill.id)}
                      aria-pressed={active}
                      className={cn(
                        'group relative flex w-full items-center gap-3 rounded-panel border p-3.5 text-left transition-all duration-200 ease-out-quint',
                        active
                          ? 'border-accent-line bg-accent-soft'
                          : 'border-line bg-surface hover:-translate-y-0.5 hover:border-line-strong hover:shadow-panel',
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-9 shrink-0 items-center justify-center rounded-md border transition-colors duration-200',
                          active
                            ? 'border-accent-line bg-surface text-accent'
                            : 'border-line bg-sunken text-subtle group-hover:text-fg',
                        )}
                      >
                        <Icon name={skill.icon} className="size-[1.05rem]" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'block truncate-safe text-[0.875rem] font-medium transition-colors duration-200',
                            active ? 'text-fg' : 'text-muted group-hover:text-fg',
                          )}
                        >
                          {skill.name}
                        </span>
                        <span className="mono-label mt-1 block">
                          {usedIn.length > 0
                            ? `${usedIn.length} project${usedIn.length === 1 ? '' : 's'}`
                            : 'supporting'}
                        </span>
                      </span>

                      {active ? (
                        <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                      ) : null}
                    </button>
                  </motion.li>
                )
              })}
            </motion.ul>
          </AnimatePresence>
        </div>

        {/* Detail panel */}
        <motion.aside
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={staggerContainer(0.06)}
          className="min-w-0 lg:sticky lg:top-28 lg:self-start"
          aria-live="polite"
        >
          <div className="overflow-hidden rounded-panel border border-line bg-surface">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <span className="mono-label">Selected</span>
              <span className="mono-label">{selected?.categoryLabel}</span>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selected?.id}
                variants={swap}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="p-4 sm:p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-lg border border-accent-line bg-accent-soft text-accent">
                    <Icon name={selected?.icon} className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate-safe font-display text-lg text-fg">{selected?.name}</h3>
                    <p className="mono-label mt-1">{selected?.categoryLabel}</p>
                  </div>
                </div>

                <p className="mt-4 text-pretty text-[0.8125rem] leading-relaxed text-muted">
                  {selected?.description}
                </p>

                <div className="mt-5 border-t border-line pt-4">
                  <p className="mono-label mb-3">Used in</p>

                  {selected?.projects.length ? (
                    <ul className="flex flex-col gap-1.5">
                      {selected.projects.map((project) => (
                        <li key={project.slug}>
                          <Link
                            to={`/projects/${project.slug}`}
                            className="group flex items-center justify-between gap-2 rounded-md border border-line bg-sunken px-3 py-2.5 transition-colors duration-200 hover:border-accent-line hover:bg-accent-soft"
                          >
                            <span className="truncate-safe text-[0.8125rem] font-medium text-fg">
                              {project.title}
                            </span>
                            <Icon
                              name="arrowUpRight"
                              className="size-3.5 shrink-0 text-subtle transition-colors duration-200 group-hover:text-accent"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="rounded-md border border-dashed border-line bg-sunken px-3 py-3 text-[0.78125rem] leading-relaxed text-subtle">
                      Supporting knowledge — not used as a headline technology in the projects
                      documented here.
                    </p>
                  )}

                  {selected?.projects.length ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      iconRight="arrowRight"
                      onClick={() => scrollToSection('projects')}
                      className="mt-3 -ml-2 text-[0.78125rem]"
                    >
                      Highlight in projects
                    </Button>
                  ) : null}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Tag tone="ghost">{allSkills.length} total</Tag>
            <Tag tone="ghost">{skillCategories.length} categories</Tag>
          </div>
        </motion.aside>
      </div>
    </Section>
  )
}

export default Skills
