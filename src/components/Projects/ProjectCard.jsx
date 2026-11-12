import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { resolveSkillNames } from '../../lib/publicData.js'
import { cn } from '../../utils/cn.js'
import { Icon } from '../ui/Icon.jsx'
import { Button } from '../ui/Button.jsx'
import { Tag } from '../ui/Tag.jsx'
import { ProjectVisual } from './ProjectVisual.jsx'
import { useSkillFocus } from '../../hooks/useSkillFocus.jsx'
import { fadeUp, staggerContainer, staggerItem } from '../../animations/variants.js'
import { viewport } from '../../animations/transitions.js'

/**
 * Featured project card — a condensed case study rather than a thumbnail.
 *
 * Alternates side on desktop, stacks on mobile. Highlights itself when the
 * technology selected in the Skills section is one this project uses.
 */
export function FeaturedProjectCard({ project, index }) {
  const { focusedSkill } = useSkillFocus()
  const highlighted = focusedSkill ? project.technologies.includes(focusedSkill.id) : false
  const reversed = index % 2 === 1

  const stack = resolveSkillNames(project.technologies)
  const visibleStack = stack.slice(0, 7)
  const overflow = stack.length - visibleStack.length

  return (
    <motion.article
      id={`project-${project.slug}`}
      variants={staggerContainer(0.08)}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      className={cn(
        'group relative scroll-mt-28 overflow-hidden rounded-panel border bg-surface transition-[border-color,box-shadow] duration-300',
        highlighted ? 'border-accent-line shadow-glow' : 'border-line hover:border-line-strong',
      )}
    >
      {/* Highlight ribbon driven by the Skills selection. */}
      {highlighted ? (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 border-b border-accent-line bg-accent-soft px-4 py-2"
        >
          <Icon name="zap" className="size-3.5 text-accent" />
          <span className="mono-label text-accent">Uses {focusedSkill.name}</span>
        </motion.div>
      ) : null}

      <div
        className={cn(
          'grid grid-cols-1 min-w-0 gap-0 lg:grid-cols-2',
          reversed && 'lg:[&>*:first-child]:order-2',
        )}
      >
        {/* Visual */}
        <motion.div variants={fadeUp(18)} className="relative min-w-0 p-4 sm:p-6 lg:p-7">
          {/* The diagram carries visible labels, so it must not sit inside the
              link's accessible name. The link is a stretched overlay instead:
              it keeps a meaningful name and the diagram stays plain text. */}
          <div className="block overflow-hidden rounded-panel transition-transform duration-500 ease-out-quint group-hover:scale-[1.012]">
            <ProjectVisual project={project} />
          </div>
          <Link
            to={`/projects/${project.slug}`}
            aria-label={`Open the ${project.title} case study`}
            className="absolute inset-0"
          />
        </motion.div>

        {/* Content */}
        <div className="flex min-w-0 flex-col p-5 pt-0 sm:p-6 sm:pt-0 lg:py-8 lg:pl-2 lg:pr-8">
          <motion.div variants={staggerItem} className="flex flex-wrap items-center gap-2.5">
            <span className="mono-label tnum text-accent">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span aria-hidden="true" className="h-px w-4 bg-line-strong" />
            <span className="mono-label">{project.category}</span>
            {project.year ? <span className="mono-label">· {project.year}</span> : null}
          </motion.div>

          <motion.h3 variants={staggerItem} className="mt-3.5 text-2xl sm:text-[1.75rem]">
            <Link
              to={`/projects/${project.slug}`}
              className="transition-colors duration-200 hover:text-accent"
            >
              {project.title}
            </Link>
          </motion.h3>

          <motion.p variants={staggerItem} className="mt-1 font-display text-[0.9375rem] text-muted">
            {project.subtitle}
          </motion.p>

          <motion.p
            variants={staggerItem}
            className="mt-4 text-pretty text-[0.9375rem] leading-relaxed text-muted"
          >
            {project.summary}
          </motion.p>

          {/* Plain-language outcome — what this means for a non-technical reader */}
          {project.outcome?.length ? (
            <motion.p
              variants={staggerItem}
              className="mt-4 flex items-start gap-2 text-[0.8125rem] leading-relaxed text-muted"
            >
              <Icon name="trends" className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>
                <span className="font-medium text-fg">Result: </span>
                {project.outcome[0]}
              </span>
            </motion.p>
          ) : null}

          {/* Headline features */}
          {project.features.length ? (
            <motion.ul variants={staggerItem} className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {project.features.slice(0, 4).map((feature) => (
                <li key={feature.title} className="flex items-start gap-2 text-[0.8125rem] text-muted">
                  <Icon name="checkCircle" className="mt-0.5 size-3.5 shrink-0 text-accent/70" />
                  <span className="min-w-0">{feature.title}</span>
                </li>
              ))}
            </motion.ul>
          ) : null}

          {/* Lead challenge — the part that makes it a case study. */}
          {project.challenges.length ? (
            <motion.div
              variants={staggerItem}
              className="mt-5 rounded-inset border border-line bg-sunken p-3.5"
            >
              <p className="mono-label mb-2 flex items-center gap-1.5">
                <Icon name="warning" className="size-3" />
                Key challenge
              </p>
              <p className="text-[0.8125rem] font-medium text-fg">{project.challenges[0].title}</p>
              <p className="mt-1.5 line-clamp-3 text-[0.78125rem] leading-relaxed text-subtle">
                {project.challenges[0].detail}
              </p>
            </motion.div>
          ) : null}

          {/* Stack */}
          <motion.div variants={staggerItem} className="mt-5 flex flex-wrap gap-1.5">
            {visibleStack.map((name) => (
              <Tag key={name} tone={highlighted ? 'accent' : 'neutral'}>
                {name}
              </Tag>
            ))}
            {overflow > 0 ? <Tag tone="ghost">+{overflow}</Tag> : null}
          </motion.div>

          {/* Actions */}
          <motion.div variants={staggerItem} className="mt-6 flex flex-wrap items-center gap-2.5">
            <Button to={`/projects/${project.slug}`} size="sm" iconRight="arrowRight">
              Read case study
            </Button>

            {project.liveDemo ? (
              <Button href={project.liveDemo} size="sm" variant="secondary" iconRight="arrowUpRight">
                Live demo
              </Button>
            ) : null}

            {project.github ? (
              <Button href={project.github} size="sm" variant="ghost" icon="git">
                Source
              </Button>
            ) : (
              <span className="mono-label" title="Add the repository URL in src/data/projects.js">
                Repo link pending
              </span>
            )}
          </motion.div>
        </div>
      </div>
    </motion.article>
  )
}

/** Compact card for non-featured projects. Consistent with FeaturedProjectCard:
 *  title + visual link to the case study, separate Source / Live demo actions.
 *  Deliberately NOT a whole-card <Link> — that pattern disagrees with the
 *  featured layout and collapses the card's text into one giant link. */
export function ProjectCard({ project }) {
  const { focusedSkill } = useSkillFocus()
  const highlighted = focusedSkill ? project.technologies.includes(focusedSkill.id) : false
  const stack = resolveSkillNames(project.technologies).slice(0, 4)

  return (
    <motion.article
      id={`project-${project.slug}`}
      variants={staggerItem}
      className={cn(
        'group flex h-full scroll-mt-28 flex-col overflow-hidden rounded-panel border bg-surface transition-all duration-300 ease-out-quint',
        highlighted
          ? 'border-accent-line shadow-glow'
          : 'border-line hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift',
      )}
    >
      {/* Stretched overlay link — the diagram's visible labels must not end up
          inside the link's accessible name. */}
      <div className="relative p-3.5 pb-0">
        <div className="overflow-hidden rounded-panel transition-transform duration-500 ease-out-quint group-hover:scale-[1.012]">
          <ProjectVisual project={project} aspect="aspect-[16/10]" />
        </div>
        <Link
          to={`/projects/${project.slug}`}
          aria-label={`Open the ${project.title} case study`}
          className="absolute inset-0"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <span className="mono-label">{project.category}</span>
          {project.year ? <span className="mono-label">· {project.year}</span> : null}
        </div>

        <h3 className="mt-2 font-display text-lg">
          <Link
            to={`/projects/${project.slug}`}
            className="text-fg transition-colors duration-200 hover:text-accent"
          >
            {project.title}
          </Link>
        </h3>

        <p className="mt-2 flex-1 text-[0.8125rem] leading-relaxed text-muted">
          {project.summary}
        </p>

        {project.outcome?.length ? (
          <p className="mt-3 flex items-start gap-1.5 text-[0.75rem] leading-relaxed text-muted">
            <Icon name="trends" className="mt-0.5 size-3.5 shrink-0 text-accent" />
            <span>
              <span className="font-medium text-fg">Result: </span>
              {project.outcome[0]}
            </span>
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {stack.map((name) => (
            <Tag key={name} tone={highlighted ? 'accent' : 'neutral'}>
              {name}
            </Tag>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3.5">
          <Button to={`/projects/${project.slug}`} size="sm" variant="ghost" iconRight="arrowRight" className="px-2 text-[0.8125rem]">
            Read case study
          </Button>
          {project.liveDemo ? (
            <a
              href={project.liveDemo}
              className="inline-flex items-center gap-1 px-2 py-1 text-[0.8125rem] text-muted transition-colors duration-200 hover:text-fg"
            >
              Live demo
              <Icon name="arrowUpRight" className="size-3.5" />
            </a>
          ) : null}
          {project.github ? (
            <a
              href={project.github}
              className="inline-flex items-center gap-1 px-2 py-1 text-[0.8125rem] text-muted transition-colors duration-200 hover:text-fg"
            >
              Source
              <Icon name="arrowUpRight" className="size-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </motion.article>
  )
}

/** Placeholder slot — states plainly that it is a slot, and how to fill it. */
export function ProjectPlaceholderCard({ project }) {
  return (
    <motion.div
      variants={staggerItem}
      className="flex h-full flex-col items-start justify-center gap-3 rounded-panel border border-dashed border-line bg-sunken p-6"
    >
      <span className="flex size-10 items-center justify-center rounded-lg border border-line bg-elevated text-subtle">
        <Icon name="boxes" className="size-4" />
      </span>
      <div>
        <p className="font-display text-base text-muted">{project.title}</p>
        <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-subtle">{project.summary}</p>
      </div>
      <span className="mono-label mt-1">src/data/projects.js</span>
    </motion.div>
  )
}
