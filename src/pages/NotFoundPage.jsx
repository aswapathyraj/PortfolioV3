import { Link } from 'react-router-dom'
import { getRealProjects } from '../lib/publicData.js'
import { usePublicData } from '../lib/usePublicData.js'
import { Container } from '../components/ui/Section.jsx'
import { Seo } from '../components/ui/Seo.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Icon } from '../components/ui/Icon.jsx'
import { Reveal } from '../components/ui/Reveal.jsx'

/**
 * 404 / unknown project.
 *
 * A dead end is still a page: it explains what was not found and offers the real
 * projects as the way out, rather than dropping the visitor at a bare message.
 */
export function NotFoundPage({ reason = 'route', slug }) {
  const isProject = reason === 'project'
  usePublicData()
  const realProjects = getRealProjects()

  return (
    <>
      <Seo
        title={isProject ? 'Project not found' : 'Page not found'}
        description="That page does not exist on this site."
        path="/404"
        noindex
      />

      <main className="flex min-h-[100svh] items-center py-28">
        <Container>
          <Reveal className="max-w-2xl">
            <span className="mono-label tnum text-accent">404</span>

            <h1 className="mt-4 text-[2.25rem] leading-tight sm:text-[3rem]">
              {isProject ? 'No case study here.' : 'This page does not exist.'}
            </h1>

            <p className="mt-5 text-pretty text-[1.0625rem] leading-relaxed text-muted">
              {isProject ? (
                <>
                  Nothing is documented under{' '}
                  <code className="rounded border border-line bg-sunken px-1.5 py-0.5 font-mono text-[0.9375rem] text-fg">
                    /projects/{slug}
                  </code>
                  . The projects below are the ones with full write-ups.
                </>
              ) : (
                'The link may be out of date, or the address may have a typo in it.'
              )}
            </p>

            <div className="mt-8 flex flex-wrap gap-2.5">
              <Button to="/" icon="arrowLeft">
                Back to the portfolio
              </Button>
              <Button to="/#projects" variant="secondary" iconRight="arrowRight">
                See all projects
              </Button>
            </div>

            {realProjects.length ? (
              <div className="mt-12 border-t border-line pt-8">
                <p className="mono-label mb-4">Documented case studies</p>
                <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {realProjects.map((project) => (
                    <li key={project.slug}>
                      <Link
                        to={`/projects/${project.slug}`}
                        className="group flex items-center justify-between gap-3 rounded-panel border border-line bg-surface p-4 transition-all duration-300 hover:border-line-strong hover:shadow-panel"
                      >
                        <span className="min-w-0">
                          <span className="block truncate-safe font-display text-[0.9375rem] text-fg transition-colors duration-200 group-hover:text-accent">
                            {project.title}
                          </span>
                          <span className="mono-label mt-1 block truncate-safe">{project.category}</span>
                        </span>
                        <Icon
                          name="arrowRight"
                          className="size-4 shrink-0 text-subtle transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Reveal>
        </Container>
      </main>
    </>
  )
}

export default NotFoundPage
