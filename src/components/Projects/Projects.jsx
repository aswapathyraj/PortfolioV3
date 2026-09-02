import { AnimatePresence, motion } from 'framer-motion'
import { getProjects, getFeaturedProjects } from '../../lib/publicData.js'
import { usePublicData } from '../../lib/usePublicData.js'
import { Section, SectionHeader } from '../ui/Section.jsx'
import { Button } from '../ui/Button.jsx'
import { Icon } from '../ui/Icon.jsx'
import { EmptyState } from '../ui/EmptyState.jsx'
import {
  FeaturedProjectCard,
  ProjectCard,
  ProjectPlaceholderCard,
} from './ProjectCard.jsx'
import { useSkillFocus } from '../../hooks/useSkillFocus.jsx'
import { staggerContainer } from '../../animations/variants.js'
import { viewport } from '../../animations/transitions.js'

/**
 * Projects section.
 *
 * Featured projects get the full alternating case-study treatment; everything
 * else uses the compact card. Placeholder entries render as explicit empty slots
 * rather than being hidden, so the data file's shape is visible.
 */
export function Projects() {
  const { focusedSkill, clearFocus } = useSkillFocus()
  usePublicData()
  const projects = getProjects()
  const featuredProjects = getFeaturedProjects()

  const secondary = projects.filter((project) => !project.featured)
  const matchCount = focusedSkill
    ? projects.filter(
        (project) =>
          project.status !== 'placeholder' && project.technologies.includes(focusedSkill.id),
      ).length
    : 0

  const hasProjects = projects.some((project) => project.status !== 'placeholder')

  return (
    <Section id="projects">
      <SectionHeader
        index="03"
        eyebrow="Selected Work"
        title="Two platforms, chosen for what they force you to solve."
        description="Each one is documented as a case study: the problem, the schema, the architecture, the parts that were genuinely hard, and what I would keep doing next time."
        actions={
          <span className="mono-label flex items-center gap-2">
            <Icon name="layers" className="size-3.5" />
            {projects.filter((p) => p.status !== 'placeholder').length} documented
          </span>
        }
      />

      {/* Active cross-reference from the Skills section. */}
      <AnimatePresence>
        {focusedSkill && matchCount > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-panel border border-accent-line bg-accent-soft px-4 py-3">
              <p className="flex items-center gap-2.5 text-[0.8125rem] text-fg">
                <Icon name="zap" className="size-4 shrink-0 text-accent" />
                Highlighting{' '}
                <strong className="font-semibold text-accent">{matchCount}</strong>{' '}
                project{matchCount === 1 ? '' : 's'} using{' '}
                <strong className="font-semibold text-accent">{focusedSkill.name}</strong>
              </p>
              <Button size="sm" variant="ghost" icon="close" onClick={clearFocus}>
                Clear
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!hasProjects ? (
        <EmptyState
          icon="boxes"
          title="No projects yet"
          description="Add an entry to src/data/projects.js and it will appear here with a full case-study page."
        />
      ) : (
        <>
          {/* Featured */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {featuredProjects.map((project, index) => (
              <FeaturedProjectCard key={project.slug} project={project} index={index} />
            ))}
          </div>

          {/* Secondary + placeholders */}
          {secondary.length ? (
            <motion.div
              variants={staggerContainer(0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-8 lg:grid-cols-3"
            >
              {secondary.map((project) =>
                project.status === 'placeholder' ? (
                  <ProjectPlaceholderCard key={project.slug} project={project} />
                ) : (
                  <ProjectCard key={project.slug} project={project} />
                ),
              )}
            </motion.div>
          ) : null}
        </>
      )}
    </Section>
  )
}

export default Projects
