import { useCallback, useEffect, useState } from 'react'
import { isConfigured } from '../config.js'
import { useSite } from '../lib/usePublicData.js'

/**
 * Fetches public GitHub data for the configured username.
 *
 * Deliberately unauthenticated — no token ships to the browser. That means the
 * 60-requests-per-hour IP limit applies, so a rate-limited response is a normal
 * state to design for, not an error to hide. Nothing here is fabricated: if the
 * request fails, the hook reports why and the section renders a placeholder.
 */

const API = 'https://api.github.com'

const STATUS = {
  UNCONFIGURED: 'unconfigured',
  LOADING: 'loading',
  READY: 'ready',
  RATE_LIMITED: 'rate-limited',
  NOT_FOUND: 'not-found',
  ERROR: 'error',
}

/** Aggregates the language field across repos into a ranked share list. */
function summariseLanguages(repos) {
  const counts = new Map()

  for (const repo of repos) {
    if (!repo.language) continue
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1)
  }

  const total = [...counts.values()].reduce((sum, n) => sum + n, 0)
  if (!total) return []

  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      share: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
}

/** Push events → a flat list of the most recent commits. */
function extractCommits(events, limit = 6) {
  return events
    .filter((event) => event.type === 'PushEvent')
    .flatMap((event) =>
      (event.payload?.commits ?? []).map((commit) => ({
        sha: commit.sha?.slice(0, 7) ?? '',
        message: commit.message?.split('\n')[0] ?? '',
        repo: event.repo?.name?.split('/')[1] ?? event.repo?.name ?? '',
        repoFull: event.repo?.name ?? '',
        at: event.created_at,
      })),
    )
    .slice(0, limit)
}

export function useGithubData() {
  const { site } = useSite()
  const username = site.githubUsername
  const enabled = site.features.githubActivity && isConfigured(username)

  const [status, setStatus] = useState(enabled ? STATUS.LOADING : STATUS.UNCONFIGURED)
  const [data, setData] = useState(null)
  const [message, setMessage] = useState('')
  const [attempt, setAttempt] = useState(0)

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  useEffect(() => {
    if (!enabled) {
      setStatus(STATUS.UNCONFIGURED)
      return
    }

    const controller = new AbortController()
    let cancelled = false

    const load = async () => {
      setStatus(STATUS.LOADING)
      setMessage('')

      try {
        const headers = { Accept: 'application/vnd.github+json' }
        const options = { headers, signal: controller.signal }

        const [userRes, reposRes, eventsRes] = await Promise.all([
          fetch(`${API}/users/${username}`, options),
          fetch(`${API}/users/${username}/repos?per_page=100&sort=updated`, options),
          fetch(`${API}/users/${username}/events/public?per_page=30`, options),
        ])

        if (cancelled) return

        if (userRes.status === 404) {
          setStatus(STATUS.NOT_FOUND)
          setMessage(`GitHub has no public user named "${username}".`)
          return
        }

        // 403 with a zeroed remaining header, or 429, both mean throttled.
        const throttled = [userRes, reposRes, eventsRes].some(
          (res) =>
            res.status === 429 ||
            (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0'),
        )

        if (throttled) {
          const reset = userRes.headers.get('x-ratelimit-reset')
          const resetAt = reset ? new Date(Number(reset) * 1000) : null
          setStatus(STATUS.RATE_LIMITED)
          setMessage(
            resetAt
              ? `GitHub's unauthenticated rate limit was reached. It resets around ${resetAt.toLocaleTimeString()}.`
              : "GitHub's unauthenticated rate limit was reached.",
          )
          return
        }

        if (!userRes.ok) {
          setStatus(STATUS.ERROR)
          setMessage(`GitHub responded with ${userRes.status}.`)
          return
        }

        const user = await userRes.json()
        const repos = reposRes.ok ? await reposRes.json() : []
        const events = eventsRes.ok ? await eventsRes.json() : []

        if (cancelled) return

        const publicRepos = Array.isArray(repos) ? repos.filter((repo) => !repo.private) : []
        const stars = publicRepos.reduce((sum, repo) => sum + (repo.stargazers_count ?? 0), 0)

        setData({
          profile: {
            login: user.login,
            name: user.name,
            url: user.html_url,
            avatar: user.avatar_url,
            bio: user.bio,
            publicRepos: user.public_repos,
            followers: user.followers,
            createdAt: user.created_at,
          },
          totals: {
            repos: user.public_repos ?? publicRepos.length,
            stars,
            languages: summariseLanguages(publicRepos),
          },
          repos: publicRepos
            .filter((repo) => !repo.fork)
            .slice(0, 6)
            .map((repo) => ({
              id: repo.id,
              name: repo.name,
              description: repo.description,
              url: repo.html_url,
              language: repo.language,
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              updatedAt: repo.updated_at,
              topics: repo.topics ?? [],
            })),
          commits: Array.isArray(events) ? extractCommits(events) : [],
          /** Which slices actually came back, so the UI can hide empty panels. */
          partial: {
            repos: reposRes.ok,
            events: eventsRes.ok,
          },
        })
        setStatus(STATUS.READY)
      } catch (cause) {
        if (cancelled || cause?.name === 'AbortError') return
        setStatus(STATUS.ERROR)
        setMessage('Could not reach the GitHub API — this may be a network or CORS issue.')
      }
    }

    load()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [enabled, username, attempt])

  return { status, data, message, retry, username, STATUS }
}

export { STATUS as GITHUB_STATUS }
