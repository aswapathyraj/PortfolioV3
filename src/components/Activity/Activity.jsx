import { motion } from 'framer-motion'
import { useGithubData, GITHUB_STATUS } from '../../hooks/useGithubData.js'
import { useSite } from '../../lib/usePublicData.js'
import { Section, SectionHeader } from '../ui/Section.jsx'
import { Icon } from '../ui/Icon.jsx'
import { Button } from '../ui/Button.jsx'
import { EmptyState, ConfigHint } from '../ui/EmptyState.jsx'
import { Tag } from '../ui/Tag.jsx'
import { GithubIcon } from '../ui/BrandIcons.jsx'
import { compactNumber, relativeTime, truncate } from '../../utils/format.js'
import { cn } from '../../utils/cn.js'
import { staggerContainer, staggerItem } from '../../animations/variants.js'
import { viewport } from '../../animations/transitions.js'

/**
 * Developer activity.
 *
 * Reads the public GitHub API with no token — which means a rate-limited
 * response is a normal outcome, and each failure mode gets its own honest state.
 * No figure on this panel is ever synthesised: if the request does not succeed,
 * nothing is shown in place of the data.
 */

function StatTile({ label, value, icon }) {
  return (
    <div className="rounded-panel border border-line bg-surface p-4">
      <div className="mono-label mb-2.5 flex items-center gap-1.5">
        <Icon name={icon} className="size-3" />
        {label}
      </div>
      <p className="tnum font-display text-2xl leading-none text-fg">{value}</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading GitHub activity…</span>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-[5.5rem] animate-pulse rounded-panel border border-line bg-elevated/50" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-28 animate-pulse rounded-panel border border-line bg-elevated/50" />
          ))}
        </div>
      </div>

      <div className="h-64 animate-pulse rounded-panel border border-line bg-elevated/50" />
    </div>
  )
}

export function Activity() {
  const { site } = useSite()
  const { status, data, message, retry, username } = useGithubData()

  const header = (
    <SectionHeader
      index="10"
      eyebrow="Developer Activity"
      title="Public GitHub, live."
      description="Pulled straight from the public GitHub API when the page loads — repositories, languages, and recent pushes. Nothing here is hand-written, which also means it is subject to GitHub's unauthenticated rate limit."
      actions={
        status === GITHUB_STATUS.READY && data ? (
          <Button href={data.profile.url} size="sm" variant="secondary" iconRight="arrowUpRight">
            <GithubIcon className="size-4" />
            @{data.profile.login}
          </Button>
        ) : null
      }
    />
  )

  // ---- Not configured -----------------------------------------------------
  if (status === GITHUB_STATUS.UNCONFIGURED) {
    return (
      <Section id="activity">
        {header}
        <EmptyState
          icon="git"
          title="GitHub integration not configured"
          description="Set `githubUsername` in src/config.js and this panel will populate itself from the public GitHub API — repositories, language breakdown, and recent commits."
        >
          <ConfigHint field="githubUsername" className="mt-1" />
        </EmptyState>
      </Section>
    )
  }

  // ---- Loading ------------------------------------------------------------
  if (status === GITHUB_STATUS.LOADING) {
    return (
      <Section id="activity">
        {header}
        <LoadingSkeleton />
      </Section>
    )
  }

  // ---- Rate limited / not found / error ----------------------------------
  if (status !== GITHUB_STATUS.READY || !data) {
    const config = {
      [GITHUB_STATUS.RATE_LIMITED]: {
        icon: 'timer',
        tone: 'warn',
        title: 'GitHub rate limit reached',
        description:
          message ||
          'The public API allows 60 requests per hour per IP without a token. This panel deliberately ships no token, so the limit applies.',
      },
      [GITHUB_STATUS.NOT_FOUND]: {
        icon: 'blocked',
        tone: 'warn',
        title: 'GitHub user not found',
        description: message || `No public GitHub account matches "${username}".`,
      },
      [GITHUB_STATUS.ERROR]: {
        icon: 'error',
        tone: 'danger',
        title: 'Could not load GitHub activity',
        description: message || 'The request to the GitHub API did not complete.',
      },
    }[status] ?? {
      icon: 'error',
      tone: 'danger',
      title: 'Could not load GitHub activity',
      description: message,
    }

    return (
      <Section id="activity">
        {header}
        <EmptyState {...config}>
          <Button size="sm" variant="secondary" icon="retry" onClick={retry} className="mt-2">
            Try again
          </Button>
        </EmptyState>
      </Section>
    )
  }

  // ---- Ready --------------------------------------------------------------
  const { profile, totals, repos, commits } = data

  return (
    <Section id="activity">
      {header}

      <motion.div
        variants={staggerContainer(0.06)}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-6"
      >
        <div className="flex min-w-0 flex-col gap-4">
          {/* Totals */}
          <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatTile label="Public repos" value={compactNumber(totals.repos)} icon="boxes" />
            <StatTile label="Stars received" value={compactNumber(totals.stars)} icon="star" />
            <StatTile
              label="Followers"
              value={compactNumber(profile.followers)}
              icon="users"
            />
          </motion.div>

          {/* Repositories */}
          <motion.div variants={staggerItem}>
            <p className="mono-label mb-3 flex items-center gap-1.5">
              <Icon name="boxes" className="size-3" />
              Recently updated
            </p>

            {repos.length ? (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {repos.map((repo) => (
                  <li key={repo.id}>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group flex h-full flex-col rounded-panel border border-line bg-surface p-4 transition-all duration-300 ease-out-quint hover:-translate-y-0.5 hover:border-line-strong hover:shadow-panel"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="min-w-0 truncate-safe font-mono text-[0.8125rem] font-medium text-fg transition-colors duration-200 group-hover:text-accent">
                          {repo.name}
                        </span>
                        <Icon
                          name="arrowUpRight"
                          className="size-3.5 shrink-0 text-subtle transition-colors duration-200 group-hover:text-accent"
                        />
                      </div>

                      <p className="mt-2 flex-1 text-[0.78125rem] leading-relaxed text-muted">
                        {repo.description ? truncate(repo.description, 110) : 'No description set.'}
                      </p>

                      <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        {repo.language ? (
                          <span className="flex items-center gap-1.5 font-mono text-[0.625rem] text-muted">
                            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
                            {repo.language}
                          </span>
                        ) : null}
                        {repo.stars > 0 ? (
                          <span className="flex items-center gap-1 font-mono text-[0.625rem] text-subtle">
                            <Icon name="star" className="size-3" />
                            {repo.stars}
                          </span>
                        ) : null}
                        {repo.forks > 0 ? (
                          <span className="flex items-center gap-1 font-mono text-[0.625rem] text-subtle">
                            <Icon name="fork" className="size-3" />
                            {repo.forks}
                          </span>
                        ) : null}
                        <span className="ml-auto font-mono text-[0.625rem] text-subtle">
                          {relativeTime(repo.updatedAt)}
                        </span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon="boxes"
                title="No public repositories"
                description="This account has no public, non-forked repositories to show."
              />
            )}
          </motion.div>
        </div>

        {/* Languages + commits */}
        <motion.aside variants={staggerItem} className="flex min-w-0 flex-col gap-4">
          <div className="rounded-panel border border-line bg-surface p-4">
            <p className="mono-label mb-3.5">Languages by repository</p>

            {totals.languages.length ? (
              <ul className="flex flex-col gap-3">
                {totals.languages.map((language, index) => (
                  <li key={language.name}>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="truncate-safe text-[0.8125rem] text-fg">{language.name}</span>
                      <span className="mono-label tnum shrink-0">{language.share}%</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-sunken">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${language.share}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                        className={cn('h-full rounded-full', index === 0 ? 'bg-accent' : 'bg-accent2/70')}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[0.8125rem] text-subtle">
                No language data available for these repositories.
              </p>
            )}
          </div>

          {commits.length ? (
            <div className="rounded-panel border border-line bg-surface p-4">
              <p className="mono-label mb-3.5 flex items-center gap-1.5">
                <Icon name="commit" className="size-3" />
                Recent public commits
              </p>

              <ul className="flex flex-col gap-3">
                {commits.map((commit, index) => (
                  <li key={`${commit.sha}-${index}`} className="flex gap-2.5">
                    <code className="mt-0.5 shrink-0 rounded border border-line bg-sunken px-1.5 py-0.5 font-mono text-[0.625rem] text-accent">
                      {commit.sha}
                    </code>
                    <div className="min-w-0">
                      <p className="truncate-safe text-[0.78125rem] text-fg" title={commit.message}>
                        {commit.message}
                      </p>
                      <p className="mono-label mt-1 truncate-safe">
                        {commit.repo} · {relativeTime(commit.at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="flex items-start gap-2 rounded-inset border border-line bg-sunken px-3.5 py-3 text-[0.75rem] leading-relaxed text-subtle">
            <Icon name="info" className="mt-0.5 size-3.5 shrink-0" />
            Unauthenticated public API. Language shares are counted per repository, not per line, and
            contribution graphs are not exposed by the API without a token.
          </p>

          {site.features.githubActivity ? (
            <Tag tone="ghost" className="self-start">
              live · fetched on load
            </Tag>
          ) : null}
        </motion.aside>
      </motion.div>
    </Section>
  )
}

export default Activity
