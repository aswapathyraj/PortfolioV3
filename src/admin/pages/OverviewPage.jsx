import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts'
import { api } from '../lib/api.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { PageHeader, Card, CardHeader, Badge, EmptyState, Skeleton } from '../components/ui.jsx'
import { AdminLink } from '../components/Button.jsx'
import { Icon } from '../../components/ui/Icon.jsx'
import { cn } from '../../utils/cn.js'

function Kpi({ label, value, hint, icon, tone = 'accent' }) {
  return (
    <Card className="flex items-start justify-between">
      <div className="min-w-0">
        <p className="mono-label">{label}</p>
        <p className="tnum mt-2 text-2xl font-semibold text-fg">{value ?? '—'}</p>
        {hint ? <p className="mt-1 text-[0.75rem] text-muted">{hint}</p> : null}
      </div>
      <Icon name={icon} className={cn('size-4 shrink-0', tone === 'accent' ? 'text-accent' : 'text-muted')} />
    </Card>
  )
}

export function OverviewPage() {
  const { admin } = useAuth()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/admin/dashboard').then((j) => j),
  })

  const d = data?.data
  const health = d?.health

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${admin?.name?.split(' ')[0] ?? 'there'}`}
        description="A live snapshot of your portfolio — content, traffic and system health at a glance."
        actions={
          <>
            <AdminLink to="/admin/projects/new" icon="plus">New project</AdminLink>
          </>
        }
      />

      {/* KPIs */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Kpi label="Projects" value={d?.kpis?.projects} hint={`${d?.kpis?.published ?? 0} published`} icon="boxes" />
          <Kpi label="Skills" value={d?.kpis?.skills} hint="in your library" icon="zap" />
          <Kpi label="Messages" value={d?.kpis?.messages ?? 0} hint={`${d?.kpis?.messageUnread ?? 0} unread`} icon="message" />
          <Kpi label="Visitors" value={d?.kpis?.visitors ?? 0} hint="last 30 days" icon="trends" />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Traffic series */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Traffic"
            description={
              d?.analytics?.demo
                ? 'Showing demo data — the public site records live events.'
                : d?.analytics?.hasEvents
                  ? 'Live visits over the last 30 days.'
                  : 'No events yet — visit the site to begin recording.'
            }
            actions={d?.analytics?.demo ? <Badge tone="warn">demo</Badge> : null}
          />
          <div className="h-60">
            {isLoading ? (
              <Skeleton className="h-full" />
            ) : d?.series?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.series}>
                  <defs>
                    <linearGradient id="visitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00e5a0" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#00e5a0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--p-line)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: 'var(--p-subtle)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--p-subtle)', fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip
                    contentStyle={{ background: 'var(--p-elevated)', border: '1px solid var(--p-line)', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: 'var(--p-muted)' }}
                  />
                  <Area type="monotone" dataKey="visitors" stroke="#00e5a0" strokeWidth={2} fill="url(#visitors)" name="Visitors" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon="chart" title="No traffic yet" description="Once the site is visited, the series appears here." />
            )}
          </div>
        </Card>

        {/* System health */}
        <Card>
          <CardHeader title="System" description="Service status" />
          <div className="space-y-1">
            {health
              ? Object.entries(health).map(([key, item]) => <HealthRow key={key} label={key} item={item} />)
              : Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9" />)}
          </div>
        </Card>
      </div>

      {/* Popular projects + recent activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Popular projects"
            description="Ranked by views this month"
            actions={<Link to="/admin/projects" className="text-xs text-accent hover:underline">Manage</Link>}
          />
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : (d?.popularProjects?.length ?? 0) ? (
            <div className="space-y-1.5">
              {d.popularProjects.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-line bg-sunken/40 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate-safe text-sm font-medium text-fg">{p.title}</p>
                    <p className="mono-label text-[0.6rem]">{p.slug}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="tnum text-sm text-muted">{p.views ?? 0} views</span>
                    <Badge tone="neutral">{p.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="boxes" title="No projects" description="Publish a project to see it ranked here." />
          )}
        </Card>

        <Card>
          <CardHeader
            title="Recent activity"
            description="Latest actions across the console"
            actions={<Link to="/admin/activity" className="text-xs text-accent hover:underline">Log</Link>}
          />
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : (d?.recent?.length ?? 0) ? (
            <div className="space-y-1.5">
              {d.recent.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg border border-line bg-sunken/40 px-3 py-2">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-elevated">
                    <Icon name={a.kind === 'admin' ? 'lock' : 'activity'} className="size-4 text-muted" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate-safe text-sm text-fg">{a.title}</p>
                    <p className="truncate-safe text-[0.72rem] text-muted">{a.entity}</p>
                  </div>
                  <p className="shrink-0 text-[0.68rem] text-subtle">{timeAgo(a.timestamp)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="activity" title="No activity yet" description="Actions you take will be logged here." />
          )}
        </Card>
      </div>

      {/* isError fallback */}
      {isError ? (
        <div className="mt-4">
          <Badge tone="danger">Dashboard failed to load</Badge>
        </div>
      ) : null}
    </div>
  )
}

function HealthRow({ label, item }) {
  return (
    <div className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-sunken/40">
      <span className="mono-label">{label}</span>
      <span className="flex items-center gap-2">
        <span className={cn('size-1.5 rounded-full', item?.status === 'ok' ? 'bg-success' : item?.status === 'down' ? 'bg-danger' : 'bg-warn')} />
        <span className="text-[0.72rem] text-muted">{item?.detail ?? item?.status}</span>
      </span>
    </div>
  )
}

function timeAgo(iso) {
  if (!iso) return ''
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// Keep the line chart import referenced (used by future variants); no-op.
void LineChart
void Line