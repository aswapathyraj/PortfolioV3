import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  getProjectBySlug,
  getRealProjects,
  resolveSkillNames,
  getSkillById,
} from '../lib/publicData.js'
import { usePublicData } from '../lib/usePublicData.js'
import { Container } from '../components/ui/Section.jsx'
import { Seo } from '../components/ui/Seo.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Icon } from '../components/ui/Icon.jsx'
import { Tag } from '../components/ui/Tag.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { Reveal } from '../components/ui/Reveal.jsx'
import { ProjectVisual } from '../components/Projects/ProjectVisual.jsx'
import { FlowDiagram, FlowLegend } from '../components/Architecture/FlowDiagram.jsx'
import { SchemaDiagram } from '../components/Database/SchemaDiagram.jsx'
import { NotFoundPage } from './NotFoundPage.jsx'
import { cn } from '../utils/cn.js'
import { staggerContainer, staggerItem, fadeUp } from '../animations/variants.js'
import { viewport } from '../animations/transitions.js'

/** Consistent case-study section: anchored heading + body. */
function CaseSection({ id, index, title, description, children, className }) {
  return (
    <section id={id} className={cn('scroll-mt-28', className)}>
      <Reveal>
        <div className="mb-5 flex items-baseline gap-3">
          <span className="mono-label tnum shrink-0 text-accent">{index}</span>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl">{title}</h2>
            {description ? (
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{description}</p>
            ) : null}
          </div>
        </div>
        {children}
      </Reveal>
    </section>
  )
}

export function ProjectDetailPage() {
  const { slug } = useParams()
  usePublicData()
  const project = getProjectBySlug(slug)

  // Start each case study at the top rather than mid-page.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [slug])

  const { previous, next } = useMemo(() => {
    const realProjects = getRealProjects()
    const index = realProjects.findIndex((item) => item.slug === slug)
    if (index === -1) return { previous: null, next: null }
    return {
      previous: index > 0 ? realProjects[index - 1] : realProjects[realProjects.length - 1],
      next: index < realProjects.length - 1 ? realProjects[index + 1] : realProjects[0],
    }
  }, [slug])

  if (!project || project.status === 'placeholder') {
    return <NotFoundPage reason="project" slug={slug} />
  }

  const stack = resolveSkillNames(project.technologies)

  const toc = [
    { id: 'overview', label: 'Overview' },
    project.problem && { id: 'problem', label: 'Problem' },
    project.solution && { id: 'solution', label: 'Solution' },
    project.features.length && { id: 'features', label: 'Features' },
    project.technologies.length && { id: 'technology', label: 'Technology' },
    project.architecture && { id: 'architecture', label: 'Architecture' },
    project.database && { id: 'database', label: 'Database' },
    project.auth?.length && { id: 'authentication', label: 'Authentication' },
    project.challenges.length && { id: 'challenges', label: 'Challenges' },
    project.learnings.length && { id: 'learnings', label: 'What I learned' },
    { id: 'screenshots', label: 'Screenshots' },
    { id: 'links', label: 'Links' },
  ].filter(Boolean)

  let step = 0
  const nextIndex = () => String(++step).padStart(2, '0')

  return (
    <>
      <Seo
        title={`${project.title} — ${project.subtitle}`}
        description={project.summary}
        path={`/projects/${project.slug}`}
        type="article"
      />

      <article className="pb-20 pt-28 sm:pt-32">
        {/* ---- Header ---- */}
        <Container>
          <motion.div variants={staggerContainer(0.07)} initial="hidden" animate="visible">
            <motion.div variants={fadeUp(10)}>
              <Link
                to="/#projects"
                className="group inline-flex items-center gap-2 text-[0.8125rem] text-muted transition-colors duration-200 hover:text-fg"
              >
                <Icon
                  name="arrowLeft"
                  className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
                />
                All projects
              </Link>
            </motion.div>

            <motion.div variants={fadeUp(12)} className="mt-7 flex flex-wrap items-center gap-2.5">
              <Tag tone="accent">{project.category}</Tag>
              {project.year ? <Tag tone="ghost">{project.year}</Tag> : null}
              <Tag tone="ghost">
                {project.status === 'shipped' || project.status === 'published' ? 'Shipped' : 'In progress'}
              </Tag>
            </motion.div>

            <motion.h1
              variants={fadeUp(18)}
              className="mt-5 text-[2.25rem] leading-[1.06] tracking-[-0.03em] sm:text-[3rem] lg:text-[3.5rem]"
            >
              {project.title}
            </motion.h1>

            <motion.p variants={fadeUp(14)} className="mt-3 font-display text-lg text-accent sm:text-xl">
              {project.subtitle}
            </motion.p>

            <motion.p
              variants={fadeUp(14)}
              className="mt-6 max-w-3xl text-pretty text-[1.0625rem] leading-relaxed text-muted"
            >
              {project.summary}
            </motion.p>

            <motion.div variants={fadeUp(14)} className="mt-8 flex flex-wrap items-center gap-2.5">
              {project.liveDemo ? (
                <Button href={project.liveDemo} size="md" iconRight="arrowUpRight">
                  Live demo
                </Button>
              ) : (
                <Button as="button" size="md" disabled title="No live demo URL configured yet">
                  Live demo pending
                </Button>
              )}

              {project.github ? (
                <Button href={project.github} size="md" variant="secondary" icon="git">
                  View source
                </Button>
              ) : (
                <span className="mono-label" title="Add `github` in src/data/projects.js">
                  Repository link pending
                </span>
              )}
            </motion.div>
          </motion.div>
        </Container>

        {/* ---- Visual ---- */}
        <Container className="mt-10">
          <Reveal>
            <ProjectVisual project={project} aspect="aspect-[16/9] sm:aspect-[2/1]" />
          </Reveal>
        </Container>

        {/* ---- Body ---- */}
        <Container className="mt-14">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-12">
            {/* Main column */}
            <div className="flex min-w-0 flex-col gap-14">
              <CaseSection id="overview" index={nextIndex()} title="Overview">
                <p className="text-pretty text-[0.9375rem] leading-relaxed text-muted sm:text-base">
                  {project.description}
                </p>
              </CaseSection>

              {project.problem ? (
                <CaseSection id="problem" index={nextIndex()} title="The problem">
                  <p className="text-pretty text-[0.9375rem] leading-relaxed text-muted sm:text-base">
                    {project.problem}
                  </p>
                </CaseSection>
              ) : null}

              {project.solution ? (
                <CaseSection id="solution" index={nextIndex()} title="The solution">
                  <p className="text-pretty text-[0.9375rem] leading-relaxed text-muted sm:text-base">
                    {project.solution}
                  </p>
                </CaseSection>
              ) : null}

              {project.features.length ? (
                <CaseSection
                  id="features"
                  index={nextIndex()}
                  title="Features"
                  description="What the product actually does."
                >
                  <motion.ul
                    variants={staggerContainer(0.04)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewport}
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                  >
                    {project.features.map((feature) => (
                      <motion.li
                        key={feature.title}
                        variants={staggerItem}
                        className="rounded-panel border border-line bg-surface p-4"
                      >
                        <p className="flex items-start gap-2.5 text-[0.875rem] font-medium text-fg">
                          <Icon name="checkCircle" className="mt-0.5 size-4 shrink-0 text-accent" />
                          {feature.title}
                        </p>
                        <p className="mt-2 pl-[1.625rem] text-[0.8125rem] leading-relaxed text-muted">
                          {feature.detail}
                        </p>
                      </motion.li>
                    ))}
                  </motion.ul>
                </CaseSection>
              ) : null}

              {project.technologies.length ? (
                <CaseSection
                  id="technology"
                  index={nextIndex()}
                  title="Technology"
                  description="Each entry links back to what it was used for in the stack section."
                >
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {project.technologies.map((id) => {
                      const skill = getSkillById(id)
                      if (!skill) return null
                      return (
                        <div
                          key={id}
                          className="flex items-start gap-3 rounded-panel border border-line bg-surface p-3.5"
                        >
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-line bg-sunken text-accent">
                            <Icon name={skill.icon} className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[0.875rem] font-medium text-fg">{skill.name}</p>
                            <p className="mono-label mt-1">{skill.categoryLabel}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CaseSection>
              ) : null}

              {project.architecture ? (
                <CaseSection
                  id="architecture"
                  index={nextIndex()}
                  title="Architecture"
                  description={project.architecture.note}
                >
                  <div className="overflow-hidden rounded-panel border border-line bg-surface">
                    <FlowDiagram rows={project.architecture.rows} />
                    <div className="border-t border-line px-4 py-3">
                      <FlowLegend />
                    </div>
                  </div>
                </CaseSection>
              ) : null}

              {project.database ? (
                <CaseSection
                  id="database"
                  index={nextIndex()}
                  title="Database"
                  description="Schema shape — simplified types, no data or credentials."
                >
                  <SchemaDiagram tables={project.database.tables} note={project.database.note} />
                </CaseSection>
              ) : null}

              {project.auth?.length ? (
                <CaseSection
                  id="authentication"
                  index={nextIndex()}
                  title="Authentication & access"
                  description="Who someone is, and what they are allowed to touch."
                >
                  <ul className="flex flex-col gap-2.5">
                    {project.auth.map((item) => (
                      <li
                        key={item.label}
                        className="flex items-start gap-3 rounded-panel border border-line bg-surface p-4"
                      >
                        <Icon name="shieldCheck" className="mt-0.5 size-4 shrink-0 text-accent" />
                        <div className="min-w-0">
                          <p className="text-[0.875rem] font-medium text-fg">{item.label}</p>
                          <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">
                            {item.detail}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CaseSection>
              ) : null}

              {project.challenges.length ? (
                <CaseSection
                  id="challenges"
                  index={nextIndex()}
                  title="Challenges"
                  description="The parts that were genuinely hard, and how they were resolved."
                >
                  <div className="flex flex-col gap-3">
                    {project.challenges.map((challenge, index) => (
                      <div
                        key={challenge.title}
                        className="rounded-panel border border-line bg-surface p-4 sm:p-5"
                      >
                        <div className="flex items-start gap-3">
                          <span className="mono-label tnum mt-1 shrink-0 text-warn">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-display text-[1.0625rem] leading-snug text-fg">
                              {challenge.title}
                            </h3>
                            <p className="mt-2.5 text-pretty text-[0.875rem] leading-relaxed text-muted">
                              {challenge.detail}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CaseSection>
              ) : null}

              {project.learnings.length ? (
                <CaseSection id="learnings" index={nextIndex()} title="What I learned">
                  <ul className="flex flex-col gap-3">
                    {project.learnings.map((learning) => (
                      <li key={learning} className="flex items-start gap-3">
                        <Icon name="sparkles" className="mt-1 size-3.5 shrink-0 text-accent" />
                        <span className="text-pretty text-[0.9375rem] leading-relaxed text-muted">
                          {learning}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CaseSection>
              ) : null}

              {project.outcome?.length ? (
                <CaseSection id="outcome" index={nextIndex()} title="Outcome">
                  <ul className="flex flex-col gap-2.5">
                    {project.outcome.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 rounded-panel border border-accent-line bg-accent-soft p-4"
                      >
                        <Icon name="checkCircle" className="mt-0.5 size-4 shrink-0 text-accent" />
                        <span className="text-[0.875rem] leading-relaxed text-fg">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CaseSection>
              ) : null}

              {/* Screenshots — honest empty state until files exist. */}
              <CaseSection id="screenshots" index={nextIndex()} title="Screenshots">
                {project.screenshots?.length ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {project.screenshots.map((shot) => (
                      <figure
                        key={shot.src}
                        className="overflow-hidden rounded-panel border border-line bg-sunken"
                      >
                        <img
                          src={shot.src}
                          alt={shot.alt}
                          loading="lazy"
                          decoding="async"
                          className="w-full object-cover"
                        />
                        {shot.caption ? (
                          <figcaption className="border-t border-line px-3.5 py-2.5 text-[0.75rem] text-subtle">
                            {shot.caption}
                          </figcaption>
                        ) : null}
                      </figure>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon="empty"
                    title="No screenshots added yet"
                    description="Drop images into public/ and add them to this project's `screenshots` array in src/data/projects.js. Until then the architecture preview above stands in."
                  />
                )}
              </CaseSection>

              {/* Links */}
              <CaseSection id="links" index={nextIndex()} title="Links">
                <div className="flex flex-wrap gap-2.5">
                  {project.liveDemo ? (
                    <Button href={project.liveDemo} variant="secondary" iconRight="arrowUpRight">
                      Live demo
                    </Button>
                  ) : null}
                  {project.github ? (
                    <Button href={project.github} variant="secondary" icon="git">
                      Repository
                    </Button>
                  ) : null}
                  <Button to="/#contact" variant="ghost" icon="mail">
                    Ask me about this project
                  </Button>
                </div>

                {!project.liveDemo && !project.github ? (
                  <p className="mt-3 text-[0.8125rem] text-subtle">
                    Demo and repository links are not configured for this project yet.
                  </p>
                ) : null}
              </CaseSection>
            </div>

            {/* ---- Sidebar ---- */}
            <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-panel border border-line bg-surface p-4">
                <p className="mono-label mb-3">On this page</p>
                <nav aria-label="Case study sections">
                  <ul className="flex flex-col gap-0.5">
                    {toc.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="block rounded-md px-2 py-1.5 text-[0.8125rem] text-muted transition-colors duration-200 hover:bg-elevated hover:text-fg"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              <div className="mt-4 rounded-panel border border-line bg-surface p-4">
                <p className="mono-label mb-3">Stack</p>
                <div className="flex flex-wrap gap-1.5">
                  {stack.map((name) => (
                    <Tag key={name}>{name}</Tag>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </Container>

        {/* ---- Prev / next ---- */}
        {previous && next ? (
          <Container className="mt-16">
            <div className="grid grid-cols-1 gap-3 border-t border-line pt-8 sm:grid-cols-2">
              <Link
                to={`/projects/${previous.slug}`}
                className="group rounded-panel border border-line bg-surface p-4 transition-all duration-300 hover:border-line-strong hover:shadow-panel"
              >
                <span className="mono-label flex items-center gap-1.5">
                  <Icon name="arrowLeft" className="size-3" />
                  Previous
                </span>
                <p className="mt-2 font-display text-lg text-fg transition-colors duration-200 group-hover:text-accent">
                  {previous.title}
                </p>
                <p className="mt-1 text-[0.8125rem] text-muted">{previous.subtitle}</p>
              </Link>

              <Link
                to={`/projects/${next.slug}`}
                className="group rounded-panel border border-line bg-surface p-4 text-right transition-all duration-300 hover:border-line-strong hover:shadow-panel"
              >
                <span className="mono-label flex items-center justify-end gap-1.5">
                  Next
                  <Icon name="arrowRight" className="size-3" />
                </span>
                <p className="mt-2 font-display text-lg text-fg transition-colors duration-200 group-hover:text-accent">
                  {next.title}
                </p>
                <p className="mt-1 text-[0.8125rem] text-muted">{next.subtitle}</p>
              </Link>
            </div>
          </Container>
        ) : null}
      </article>
    </>
  )
}

export default ProjectDetailPage
