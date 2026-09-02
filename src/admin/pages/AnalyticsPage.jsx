import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts'
import { api } from '../lib/api.js'
import { PageHeader, Card, CardHeader, EmptyState, Skeleton, Alert } from '../components/ui.jsx'
import { AdminButton } from '../components/Button.jsx'

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-sunken/40 p-4">
      <p className="mono-label">{label}</p>
      <p className="tnum mt-1 text-2xl font-semibold text-fg">{value ?? '—'}</p>
    </div>
  )
}

function Breakdown({ title, rows }) {
  return (
    <Card className="p-0">
      <div className="border-b border-line px-4 py-3">
        <h4 className="text-sm font-semibold text-fg">{title}</h4>
      </div>
      <div className="divide-y divide-line">
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-subtle">No data</p>
        ) : (
          rows.map((row) => (
            <div key={row.name} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="truncate-safe text-sm text-fg">{row.name || 'Unknown'}</span>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-sunken">
                  <div className="h-full bg-accent" style={{ width: `${Math.min(100, (row.count / (rows[0].count || 1)) * 100)}%` }} />
                </div>
                <span className="tnum w-8 text-right text-sm text-muted">{row.count}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

export function AnalyticsPage() {
  const qc = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.get('/admin/analytics').then((j) => j),
  })

  const seed = useMutation({
    mutationFn: () => api.post('/admin/analytics/seed-demo', {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['analytics'] }),
  })
  const clearDemo = useMutation({
    mutationFn: () => api.delete('/admin/analytics/demo'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['analytics'] }),
  })

  if (isLoading) {
    return (
      <div>
        <PageHeader eyebrow="Analyze" title="Analytics" />
        <div className="grid gap-4 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="mt-4 h-72" />
      </div>
    )
  }

  const connected = data?.connected
  const a = data?.data
  const stats = a?.stats
  const series = a?.series
  const breakdowns = a?.breakdowns

  return (
    <div>
      <PageHeader
        eyebrow="Analyze"
        title="Analytics"
        description="Visitor behaviour across the portfolio. Charts are privacy-preserving aggregates."
        actions={
          <>
            {data?.demo ? (
              <AdminButton variant="ghost" loading={clearDemo.isPending} onClick={() => clearDemo.mutate()}>
                Remove demo
              </AdminButton>
            ) : null}
            {!connected ? (
              <AdminButton variant="outline" loading={seed.isPending} onClick={() => seed.mutate()}>
                Seed demo data
              </AdminButton>
            ) : null}
          </>
        }
      />

      {isError ? <Alert tone="danger" className="mb-4">Analytics failed to load.</Alert> : null}

      {!connected ? (
        <EmptyState
          icon="chart"
          title="Analytics not connected"
          description={data?.message ?? 'No events recorded yet.'}
          action={<AdminButton variant="outline" loading={seed.isPending} onClick={() => seed.mutate()}>Seed demo data</AdminButton>}
        />
      ) : (
        <>
          {data?.source === 'demo' ? (
            <Alert tone="warn" className="mb-4">
              The current data is development/demo data seeded for testing, not real visitor traffic.
            </Alert>
          ) : null}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Visits" value={stats?.visitors} />
            <Stat label="Unique visitors" value={stats?.uniqueVisitors} />
            <Stat label="Project views" value={stats?.projectViews} />
            <Stat label="Contact" value={stats?.contacts} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="Visitors" description="Over the past 30 days" />
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series?.visitors ?? []}>
                    <defs><linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00e5a0" stopOpacity={0.3}/><stop offset="100%" stopColor="#00e5a0" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid stroke="var(--p-line)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: 'var(--p-subtle)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--p-subtle)', fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                    <Tooltip contentStyle={{ background: 'var(--p-elevated)', border: '1px solid var(--p-line)', borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="count" stroke="#00e5a0" strokeWidth={2} fill="url(#v)" name="Visitors" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader title="Top projects" description="Most viewed" />
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(breakdowns?.topProjects ?? []).map((p) => ({ name: p.name.split('/').pop(), count: p.count }))}>
                    <CartesianGrid stroke="var(--p-line)" vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--p-subtle)', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
                    <YAxis tick={{ fill: 'var(--p-subtle)', fontSize: 11 }} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: 'var(--p-elevated)', border: '1px solid var(--p-line)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill="var(--p-accent2)" radius={[4, 4, 0, 0]} name="Views" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <Breakdown title="Devices" rows={breakdowns?.devices ?? []} />
            <Breakdown title="Browsers" rows={breakdowns?.browsers ?? []} />
            <Breakdown title="Referrers" rows={breakdowns?.referrers ?? []} />
          </div>
        </>
      )}
    </div>
  )
}