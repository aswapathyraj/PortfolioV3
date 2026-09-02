import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api.js'
import { PageHeader, Card, Badge, EmptyState, Skeleton } from '../components/ui.jsx'
import { Select } from '../components/fields.jsx'
import { Icon } from '../../components/ui/Icon.jsx'

const ENTITY_TONE = {
  project: 'accent',
  settings: 'warn',
  auth: 'neutral',
  admin: 'neutral',
  analytics: 'accent',
  github: 'neutral',
}

export function ActivityPage() {
  const [entity, setEntity] = useState('all')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['activity', entity, page],
    queryFn: () => api.get(`/admin/activity?entity=${entity}&page=${page}`).then((j) => j),
  })
  const logs = data?.data ?? []
  const total = data?.total ?? 0
  const pageSize = 50
  const pages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div>
      <PageHeader
        eyebrow="System"
        title="Activity Log"
        description="An auditable trail of every important change in the Control Center."
      />

      <div className="mb-4 flex justify-end">
        <Select value={entity} onChange={(e) => { setEntity(e.target.value); setPage(1) }} className="w-44">
          <option value="all">All entities</option>
          <option value="project">Projects</option>
          <option value="settings">Settings</option>
          <option value="auth">Auth</option>
          <option value="admin">Users</option>
          <option value="analytics">Analytics</option>
          <option value="github">GitHub</option>
        </Select>
      </div>

      {isLoading ? (
        <Card className="p-0"><div className="space-y-2 p-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-11" />)}</div></Card>
      ) : logs.length ? (
        <Card className="p-0">
          <div className="divide-y divide-line">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-elevated">
                  <Icon name="activity" className="size-3.5 text-muted" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-fg">{log.actionLabel}</p>
                  {log.entityTitle ? <p className="truncate-safe text-[0.72rem] text-muted">{log.entityTitle}</p> : null}
                  <p className="mono-label mt-0.5 text-[0.6rem]">
                    {log.admin?.name ?? 'System'} · {log.ip ?? '—'}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Badge tone={ENTITY_TONE[log.entity] ?? 'neutral'}>{log.entity ?? '—'}</Badge>
                  <span className="text-[0.68rem] text-subtle">{timeAgo(log.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <EmptyState icon="activity" title="No activity logged" description="Changes you make will show up here." />
      )}

      {pages > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border border-line px-3 py-1.5 text-xs text-muted hover:text-fg disabled:opacity-40"
          >
            Previous
          </button>
          <span className="tnum text-xs text-muted">Page {page} / {pages}</span>
          <button
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-line px-3 py-1.5 text-xs text-muted hover:text-fg disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  )
}

function timeAgo(iso) {
  if (!iso) return ''
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000
  if (seconds < 60) return 'just now'
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}