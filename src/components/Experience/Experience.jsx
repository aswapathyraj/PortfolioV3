import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  getExperience,
  getEducation,
  getExperienceNote,
  getProjectBySlug,
  resolveSkillNames,
} from '../../lib/publicData.js'
import { usePublicData } from '../../lib/usePublicData.js'
import { Section, SectionHeader } from '../ui/Section.jsx'
import { Icon } from '../ui/Icon.jsx'
import { Tag, StatusDot } from '../ui/Tag.jsx'
import { EmptyState } from '../ui/EmptyState.jsx'
import { staggerContainer, staggerItem } from '../../animations/variants.js'
import { viewport } from '../../animations/transitions.js'

/**
 * Experience timeline.
 *
 * Describes what was built rather than time served, and links each entry to the
 * projects that back it up. No employers, titles, or dates are invented — an
 * empty education list simply renders nothing.
 */
export function Experience() {
  usePublicData()
  const experience = getExperience()
  const education = getEducation()
  const experienceNote = getExperienceNote()

  return (
    <Section id="experience">
      <SectionHeader
        index="10"
        eyebrow="Experience"
        title="What I have actually built."
        description={experienceNote}
      />

      {experience.length === 0 ? (
        <EmptyState
          icon="terminal"
          title="No entries yet"
          description="Add an entry to src/data/experience.js to populate the timeline."
        />
      ) : (
        <motion.ol
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="relative"
        >
          {/* Timeline spine */}
          <span
            aria-hidden="true"
            className="absolute left-[0.9375rem] top-2 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-accent/40 via-line to-transparent sm:left-[1.1875rem]"
          />

          {experience.map((entry) => (
            <motion.li key={entry.id} variants={staggerItem} className="relative pb-8 pl-11 last:pb-0 sm:pl-14">
              {/* Node */}
              <span className="absolute left-0 top-1 flex size-8 items-center justify-center rounded-lg border border-line bg-surface text-accent sm:size-10">
                <Icon name={entry.icon} className="size-4" />
              </span>

              <div className="rounded-panel border border-line bg-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display text-xl text-fg">{entry.role}</h3>
                    <p className="mt-1 text-[0.875rem] text-muted">{entry.org}</p>
                  </div>

                  <span className="flex shrink-0 items-center gap-2 rounded-lg border border-line bg-sunken px-2.5 py-1.5">
                    {entry.current ? <StatusDot /> : null}
                    <span className="mono-label">{entry.period}</span>
                  </span>
                </div>

                <p className="mt-4 text-pretty text-[0.9375rem] leading-relaxed text-muted">
                  {entry.summary}
                </p>

                {entry.highlights?.length ? (
                  <ul className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {entry.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-2.5">
                        <Icon name="checkCircle" className="mt-0.5 size-3.5 shrink-0 text-accent/70" />
                        <span className="text-[0.8125rem] leading-relaxed text-muted">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {entry.stack?.length ? (
                  <div className="mt-5 border-t border-line pt-4">
                    <p className="mono-label mb-2.5">Core stack</p>
                    <div className="flex flex-wrap gap-1.5">
                      {resolveSkillNames(entry.stack).map((name) => (
                        <Tag key={name}>{name}</Tag>
                      ))}
                    </div>
                  </div>
                ) : null}

                {entry.projects?.length ? (
                  <div className="mt-4">
                    <p className="mono-label mb-2.5">Projects</p>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.projects.map((slug) => {
                        const project = getProjectBySlug(slug)
                        if (!project) return null
                        return (
                          <Link
                            key={slug}
                            to={`/projects/${slug}`}
                            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-sunken px-2.5 py-1.5 text-[0.75rem] text-muted transition-colors duration-200 hover:border-accent-line hover:text-fg"
                          >
                            {project.title}
                            <Icon name="arrowUpRight" className="size-3" />
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.li>
          ))}
        </motion.ol>
      )}

      {/* Education renders only when there is something to show. */}
      {education.length > 0 ? (
        <div className="mt-8">
          <p className="mono-label mb-3">Education & certifications</p>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {education.map((item) => (
              <li key={item.id} className="rounded-panel border border-line bg-surface p-4">
                <p className="font-display text-base text-fg">{item.credential}</p>
                <p className="mt-1 text-[0.8125rem] text-muted">{item.org}</p>
                <p className="mono-label mt-2">{item.period}</p>
                {item.note ? (
                  <p className="mt-2 text-[0.78125rem] leading-relaxed text-subtle">{item.note}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Section>
  )
}

export default Experience
