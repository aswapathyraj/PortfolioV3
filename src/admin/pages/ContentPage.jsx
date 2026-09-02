import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import { api } from '../lib/api.js'
import { PageHeader, Card, Badge, EmptyState, Skeleton } from '../components/ui.jsx'
import { AdminButton, IconButton } from '../components/Button.jsx'
import { Field, Input, Textarea, Select } from '../components/fields.jsx'
import { Icon } from '../../components/ui/Icon.jsx'
import { cn } from '../../utils/cn.js'

/* Resource definitions — one per content section, keyed by the admin path. */

export const RESOURCES = {
  skills: {
    label: 'Skills',
    singular: 'skill',
    api: '/admin/skills',
    columns: ['name', 'category'],
    fields: [
      { key: 'id', label: 'Id', type: 'input', hint: 'Unique, slug-style', required: true },
      { key: 'name', label: 'Name', type: 'input', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['frontend', 'backend', 'database', 'security', 'tools', 'other'] },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
    summary: (item) => item.name,
  },
  experience: {
    label: 'Experience',
    singular: 'role',
    api: '/admin/experience',
    columns: ['role', 'org'],
    fields: [
      { key: 'role', label: 'Role', type: 'input', required: true },
      { key: 'org', label: 'Organisation', type: 'input', required: true },
      { key: 'startDate', label: 'Start', type: 'input' },
      { key: 'endDate', label: 'End', type: 'input' },
      { key: 'icon', label: 'Icon', type: 'input' },
      { key: 'summary', label: 'Summary', type: 'textarea' },
    ],
    summary: (item) => `${item.role} — ${item.org}`,
  },
  security: {
    label: 'Security & Trust',
    singular: 'item',
    api: '/admin/security',
    columns: ['label', 'level'],
    fields: [
      { key: 'label', label: 'Label', type: 'input', required: true },
      { key: 'value', label: 'Value', type: 'input' },
      { key: 'level', label: 'Level', type: 'select', options: ['implemented', 'studied'] },
      { key: 'summary', label: 'Summary', type: 'textarea' },
      { key: 'detail', label: 'Detail', type: 'textarea' },
    ],
    summary: (item) => item.label,
  },
  engineering: {
    label: 'Engineering',
    singular: 'step',
    api: '/admin/engineering',
    columns: ['title'],
    fields: [
      { key: 'number', label: 'Number', type: 'input' },
      { key: 'title', label: 'Title', type: 'input', required: true },
      { key: 'icon', label: 'Icon', type: 'input' },
      { key: 'what', label: 'What', type: 'textarea' },
      { key: 'why', label: 'Why', type: 'textarea' },
    ],
    summary: (item) => item.title,
  },
  api: {
    label: 'API Docs',
    singular: 'endpoint',
    api: '/admin/api-endpoints',
    columns: ['method', 'path'],
    fields: [
      { key: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
      { key: 'path', label: 'Path', type: 'input', required: true },
      { key: 'summary', label: 'Summary', type: 'input', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
    summary: (item) => `${item.method} ${item.path}`,
  },
}

const METHOD_TONE = { GET: 'accent', POST: 'success', PUT: 'warn', PATCH: 'warn', DELETE: 'danger' }

function ResourceForm({ resource, item, close }) {
  const qc = useQueryClient()
  const [form, setForm] = useState(item ?? {})
  const [error, setError] = useState(null)

  const mutation = useMutation({
    mutationFn: () => {
      if (item?.id) return api.put(`${resource.api}/${item.id}`, form)
      return api.post(resource.api, form)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [resource.api] })
      close()
    },
    onError: (err) => setError(err.message ?? 'Save failed.'),
  })

  const isEdit = Boolean(item?.id)

  return (
    <div className="space-y-4">
      {error ? <div className="rounded-lg border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div> : null}
      {resource.fields.map((f) => {
        const value = form[f.key] ?? ''
        const set = (v) => setForm((cur) => ({ ...cur, [f.key]: v }))
        return (
          <Field key={f.key} label={f.label} required={f.required} description={f.hint}>
            {f.type === 'select' ? (
              <Select value={value} onChange={(e) => set(e.target.value)}>
                <option value="">Select…</option>
                {f.options.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </Select>
            ) : f.type === 'textarea' ? (
              <Textarea value={value} onChange={(e) => set(e.target.value)} />
            ) : (
              <Input value={value} onChange={(e) => set(e.target.value)} />
            )}
          </Field>
        )
      })}
      <div className="flex items-center justify-end gap-2 pt-1">
        <AdminButton variant="ghost" onClick={close}>Cancel</AdminButton>
        <AdminButton loading={mutation.isPending} onClick={() => mutation.mutate()}>
          {isEdit ? 'Save' : 'Create'}
        </AdminButton>
      </div>
    </div>
  )
}

function ResourceModal({ resource, item, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-scrim pt-[10vh] p-4" onClick={onClose}>
      <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-fg">
              {item?.id || item?.role || item?.label || item?.title || item?.path ? 'Edit' : 'New'} {resource.singular}
            </h3>
            <IconButton label="Close" icon="close" onClick={onClose} />
          </div>
          <ResourceForm resource={resource} item={item} close={onClose} />
        </Card>
      </div>
    </div>
  )
}

function RowValue({ meta }) {
  const method = meta.col === 'method'
  const icon = meta.col === 'icon'
  const value = meta.value
  if (icon) {
    return <Icon name={value || 'boxes'} className="size-4 text-muted" />
  }
  if (method) {
    return (
      <span className={cn(
        'rounded border px-1.5 py-0.5 text-[0.65rem] font-semibold',
        METHOD_TONE[value] === 'accent' && 'border-accent-line text-accent',
        METHOD_TONE[value] === 'success' && 'border-success/40 text-success',
        METHOD_TONE[value] === 'warn' && 'border-warn/40 text-warn',
        METHOD_TONE[value] === 'danger' && 'border-danger/40 text-danger',
      )}>
        {value}
      </span>
    )
  }
  if (meta.col === 'level') {
    return <Badge tone={value === 'implemented' ? 'success' : 'warn'}>{value}</Badge>
  }
  if (meta.col === 'category') {
    return <span className="text-xs text-muted">{value || '—'}</span>
  }
  return <span className="truncate-safe text-sm text-fg">{value || '—'}</span>
}

export function ContentPage() {
  const location = useLocation()
  const qc = useQueryClient()
  const section = location.pathname.split('/').pop()
  const resource = RESOURCES[section] ?? RESOURCES.skills

  const [modal, setModal] = useState(null) // null | { edit: false, item? }
  const { data, isLoading } = useQuery({
    queryKey: [resource.api],
    queryFn: () => api.get(resource.api).then((j) => j),
  })
  const items = data?.data ?? []

  const remove = useMutation({
    mutationFn: (id) => api.delete(`${resource.api}/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resource.api] }),
  })

  const onDelete = (item) => {
    if (window.confirm(`Delete this ${resource.singular}? This cannot be undone.`)) {
      remove.mutate(item.id)
    }
  }

  const showCols = resource.columns.slice(0, 2)

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title={resource.label}
        description="Add and refine the items that power this section of the site."
        actions={<AdminButton icon="plus" onClick={() => setModal({ edit: false })}>New {resource.singular}</AdminButton>}
      />

      {isLoading ? (
        <Card className="p-0"><div className="space-y-2 p-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-11" />)}</div></Card>
      ) : items.length ? (
        <Card className="p-0">
          <div className="divide-y divide-line">
            {items.map((item) => {
              return (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  {/* Drag handle (decorative — reorder is a future enhancement) */}
                  <Icon name="drag" className="size-3.5 shrink-0 text-subtle" />
                  <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
                    {showCols.map((col) => (
                      <RowValue key={col} meta={{ col, value: item[col] }} />
                    ))}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <IconButton label="Edit" icon="edit" onClick={() => setModal({ edit: true, item })} />
                    <IconButton
                      label="Delete"
                      icon="trash"
                      variant="ghost"
                      onClick={() => onDelete(item)}
                      className="hover:text-danger"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      ) : (
        <EmptyState
          icon="boxes"
          title={`No ${resource.singular}s`}
          description={`Add your first ${resource.singular} to populate this section.`}
          action={<AdminButton icon="plus" onClick={() => setModal({ edit: false })}>New {resource.singular}</AdminButton>}
        />
      )}

      {modal ? (
        <ResourceModal
          resource={resource}
          item={modal.edit ? modal.item : null}
          onClose={() => setModal(null)}
        />
      ) : null}
    </div>
  )
}