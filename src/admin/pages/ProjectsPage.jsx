import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { PageHeader, Card, Badge, StatusDot, EmptyState, Skeleton } from '../components/ui.jsx'
import { AdminLink } from '../components/Button.jsx'
import { Input, Select } from '../components/fields.jsx'
import { Icon } from '../../components/ui/Icon.jsx'

function ProjectRow({ project, onTogglePublish }) {
  const [busy, setBusy] = useState(null)

  const run = async (action) => {
    setBusy(action)
    try {
      await onTogglePublish(project.id, action)
    } finally {
      setBusy(null)
    }
  }

  const featuredImage = project.featuredImage || project.image

  return (
    <div className="flex items-center gap-4 rounded-lg border border-line bg-sunken/40 p-3 hover:bg-sunken/70">
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-elevated">
        {featuredImage ? (
          <img src={featuredImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <Icon name="boxes" className="size-5 text-muted" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate-safe text-sm font-medium text-fg">{project.title}</p>
          {project.featured ? <Badge tone="accent">Featured</Badge> : null}
        </div>
        <p className="mono-label mt-0.5">{project.slug}</p>
      </div>
      <div className="hidden items-center gap-1.5 sm:flex">
        <span className="tnum text-[0.72rem] text-muted">{project.technologyCount ?? 0} tech</span>
        <span className="tnum text-[0.72rem] text-muted">v{project.versionCount ?? 0}</span>
      </div>
      <StatusDot status={project.status} />
      <div className="flex items-center gap-1">
        {project.status !== 'published' ? (
          <button
            onClick={() => run('publish')}
            disabled={busy !== null}
            title="Publish"
            className="rounded-md p-1.5 text-muted hover:bg-elevated hover:text-accent disabled:opacity-40"
          >
            <Icon name="rocket" className="size-4" />
          </button>
        ) : (
          <button
            onClick={() => run('unpublish')}
            disabled={busy !== null}
            title="Unpublish"
            className="rounded-md p-1.5 text-muted hover:bg-elevated hover:text-warn disabled:opacity-40"
          >
            <Icon name="eye" className="size-4" />
          </button>
        )}
        <Link to={`/admin/projects/${project.id}`} title="Edit" className="rounded-md p-1.5 text-muted hover:bg-elevated hover:text-fg">
          <Icon name="edit" className="size-4" />
        </Link>
      </div>
    </div>
  )
}

export function ProjectsPage() {
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [debounced, setDebounced] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['projects', debounced, status],
    queryFn: () => api.get(`/admin/projects?q=${encodeURIComponent(debounced)}&status=${status}`).then((j) => j),
  })

  // Debounce search input.
  const onSearch = (value) => {
    setQ(value)
    clearTimeout(onSearch._t)
    onSearch._t = setTimeout(() => setDebounced(value), 300)
  }

  const togglePublish = useMutation({
    mutationFn: ({ id, action }) => api.post(`/admin/projects/${id}/${action}`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })

  const projects = data?.data ?? []

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="Projects"
        description="Manage your portfolio case studies. Drafts only appear once published."
        actions={<AdminLink to="/admin/projects/new" icon="plus">New project</AdminLink>}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full max-w-xs">
          <Input
            placeholder="Search title or slug…"
            value={q}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-36">
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <Card className="p-0">
          <div className="space-y-2 p-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
        </Card>
      ) : projects.length ? (
        <div className="space-y-2">
          {projects.map((p) => (
            <ProjectRow key={p.id} project={p} onTogglePublish={(id, action) => togglePublish.mutateAsync({ id, action })} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="boxes"
          title="No projects found"
          description={q || status !== 'all' ? 'Try adjusting your filters.' : 'Create your first project to get started.'}
          action={<AdminLink to="/admin/projects/new" icon="plus">New project</AdminLink>}
        />
      )}

      {data?.total > (data?.data?.length ?? 0) ? (
        <p className="mt-4 text-center text-xs text-muted">
          Showing {data.data.length} of {data.total} — refine your search for more.
        </p>
      ) : null}
    </div>
  )
}