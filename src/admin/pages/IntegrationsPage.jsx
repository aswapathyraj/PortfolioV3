import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api.js'
import { PageHeader, Card, Badge, EmptyState, Skeleton, Alert } from '../components/ui.jsx'
import { AdminButton } from '../components/Button.jsx'
import { Icon } from '../../components/ui/Icon.jsx'

function GithubStats({ d }) {
  const stats = [
    { label: 'Repos', value: d?.publicRepos },
    { label: 'Stars', value: d?.stars },
    { label: 'Forks', value: d?.forks },
    { label: 'Followers', value: d?.followers },
    { label: 'Commits (30d)', value: d?.commits },
    { label: 'Contributions', value: d?.contributions ?? '—' },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-lg border border-line bg-sunken/40 p-3">
          <p className="mono-label">{s.label}</p>
          <p className="tnum mt-1 text-xl font-semibold text-fg">{s.value ?? '—'}</p>
        </div>
      ))}
    </div>
  )
}

export function IntegrationsPage() {
  const qc = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['github'],
    queryFn: () => api.get('/admin/github').then((j) => j),
  })

  const sync = useMutation({
    mutationFn: () => api.post('/admin/github/sync', {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['github'] }),
    onError: (err) => {
      // failed sync still refreshes cache status
      qc.invalidateQueries({ queryKey: ['github'] })
      void err
    },
  })

  if (isLoading) {
    return (
      <div>
        <PageHeader eyebrow="Analyze" title="Integrations" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  const connected = data?.connected
  const d = data?.data

  return (
    <div>
      <PageHeader
        eyebrow="Analyze"
        title="Integrations"
        description="External services the site reads from."
      />

      {isError ? <Alert tone="danger" className="mb-4">Could not reach the integrations API.</Alert> : null}

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {d?.avatar ? (
              <img src={d.avatar} alt="" className="size-12 rounded-full border border-line" />
            ) : (
              <div className="flex size-12 items-center justify-center rounded-full border border-line bg-elevated">
                <Icon name="github" className="size-6 text-muted" />
              </div>
            )}
            <div>
              <h3 className="flex items-center gap-2 text-base font-semibold text-fg">
                GitHub
                {connected ? <Badge tone="success">connected</Badge> : <Badge tone="warn">not connected</Badge>}
              </h3>
              <p className="text-sm text-muted">{d?.name ?? d?.username ?? '—'}</p>
              {data?.degraded ? (
                <p className="mt-1 text-xs text-warn">{data.message}</p>
              ) : null}
            </div>
          </div>
          {connected ? (
            <AdminButton variant="secondary" loading={sync.isPending} onClick={() => sync.mutate()} icon="retry">
              Sync
            </AdminButton>
          ) : null}
        </div>

        <div className="mt-6">
          {!connected ? (
            <EmptyState
              icon="unplug"
              title={d ? 'GitHub is temporarily unavailable' : 'GitHub not enabled'}
              description={
                data?.degraded
                  ? 'We are showing cached data while the API recovers.'
                  : 'Set GITHUB_USERNAME in the server environment to connect.'
              }
              action={data?.degraded ? <AdminButton variant="outline" icon="retry" onClick={() => sync.mutate()}>Retry sync</AdminButton> : null}
            />
          ) : (
            <GithubStats d={d} />
          )}
        </div>
      </Card>
    </div>
  )
}