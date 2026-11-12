import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getProjects } from '../lib/publicData.js'
import { usePublicData } from '../lib/usePublicData.js'
import { Seo } from '../components/ui/Seo.jsx'
import { Container } from '../components/ui/Section.jsx'
import { FeaturedProjectCard, ProjectCard } from '../components/Projects/ProjectCard.jsx'
import { Icon } from '../components/ui/Icon.jsx'
import { staggerContainer } from '../animations/variants.js'

/**
 * All projects — a dedicated index for everything built so far.
 *
 * The home page shows the two flagship case studies; this page lists them all,
 * including the frontend work that is not a full-stack build. Everything
 * renders from the same data layer as the rest of the site.
 */
export function AllProjectsPage() {
  usePublicData()
  const all = getProjects().filter((project) => project.status !== 'placeholder')
  const featured = all.filter((project) => project.featured)
  const rest = all.filter((project) => !project.featured)

  return (
    <>
      <Seo
        title="All projects"
        path="/projects"
        description="Every project Aswapathy Raj built end to end — full-stack applications, interactive experiences and this portfolio."
      />

      <Container className="py-16 sm:py-24">
        <div className="mb-12 max-w-2xl sm:mb-16">
          <div className="mb-4 flex items-center gap-3">
            <span className="mono-label tnum text-accent">INDEX</span>
            <span className="h-px w-6 bg-line-strong" aria-hidden="true" />
            <span className="mono-label">All projects</span>
          </div>
          <h1 className="text-balance text-4xl leading-[1.08] sm:text-5xl lg:text-[3rem]">
            Everything I&rsquo;ve built.
          </h1>
          <p className="mt-5 text-pretty text-base leading-relaxed text-muted sm:text-[1.0625rem]">
            Full loop means schema to deploy — interface, API, database and the pull request that
            put it in front of someone. {all.length} project{all.length === 1 ? '' : 's'} documented
            below, each with its own case study.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {all.map((project) => (
              <a
                key={project.slug}
                href={`#project-${project.slug}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-[0.75rem] text-muted transition-colors duration-200 hover:border-line-strong hover:text-fg"
              >
                {project.title}
                <Icon name="chevronDown" className="size-3.5" />
              </a>
            ))}
          </div>
        </div>

        {/* Featured projects */}
        {featured.length ? (
          <div className="flex flex-col gap-6 lg:gap-8">
            {featured.map((project, index) => (
              <FeaturedProjectCard key={project.slug} project={project} index={index} />
            ))}
          </div>
        ) : null}

        {/* Everything else */}
        {rest.length ? (
          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            animate="visible"
            className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-8 lg:grid-cols-3"
          >
            {rest.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </motion.div>
        ) : null}

        <p className="mt-14 border-t border-line pt-6 text-[0.8125rem] text-subtle">
          The next case study is in the oven. Until it ships, this page lists everything that
          exists.
          <Link to="/#contact" className="ml-1.5 text-accent transition-colors duration-200 hover:text-accent-hover">
            Get in touch →
          </Link>
        </p>
      </Container>
    </>
  )
}

export default AllProjectsPage
