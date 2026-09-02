import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api.js'
import { PageHeader, Card, Alert, Skeleton } from '../components/ui.jsx'
import { AdminButton } from '../components/Button.jsx'
import { Field, Input, Textarea, Select, Toggle } from '../components/fields.jsx'
import { Icon } from '../../components/ui/Icon.jsx'
import { cn } from '../../utils/cn.js'

const emptyProject = () => ({
  title: '',
  slug: '',
  subtitle: '',
  category: '',
  year: '',
  status: 'draft',
  featured: false,
  accent: '',
  image: '',
  summary: '',
  github: '',
  liveDemo: '',
  description: '',
  problem: '',
  solution: '',
  features: [],
  architecture: null,
  database: null,
  auth: [],
  challenges: [],
  learnings: [],
  outcome: [],
  caseSections: [],
  seo: {},
  technologies: [],
})

/* ------------------------------------------------------------------ helpers */

function Section({ title, description, children, number }) {
  return (
    <Card>
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
          <span className="text-xs font-semibold">{number}</span>
        </span>
        <div>
          <h3 className="text-sm font-semibold text-fg">{title}</h3>
          {description ? <p className="text-[0.78rem] text-muted">{description}</p> : null}
        </div>
      </div>
      {children}
    </Card>
  )
}

function ListEditor({ label, items, onChange, placeholder, emptyLabel }) {
  const update = (idx, value) => onChange(items.map((v, i) => (i === idx ? value : v)))
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx))
  const add = () => onChange([...items, ''])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[0.8rem] font-medium text-fg">{label}</span>
        <button type="button" onClick={add} className="flex items-center gap-1 text-xs text-accent hover:underline">
          <Icon name="plus" className="size-3.5" /> Add
        </button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line px-3 py-2 text-xs text-subtle">{emptyLabel ?? 'Nothing yet.'}</p>
      ) : (
        items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <Input value={item ?? ''} placeholder={placeholder} onChange={(e) => update(i, e.target.value)} className="flex-1" />
            <button type="button" onClick={() => remove(i)} aria-label="Remove" className="mt-1 rounded-md p-1.5 text-muted hover:bg-elevated hover:text-danger">
              <Icon name="trash" className="size-4" />
            </button>
          </div>
        ))
      )}
    </div>
  )
}

function PairListEditor({ label, items, onChange, _keyLabel, keyPlaceholder, valPlaceholder, emptyLabel }) {
  const update = (idx, field, value) => onChange(items.map((v, i) => (i === idx ? { ...v, [field]: value } : v)))
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx))
  const add = () => onChange([...items, { title: '', detail: '' }])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[0.8rem] font-medium text-fg">{label}</span>
        <button type="button" onClick={add} className="flex items-center gap-1 text-xs text-accent hover:underline">
          <Icon name="plus" className="size-3.5" /> Add
        </button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line px-3 py-2 text-xs text-subtle">{emptyLabel ?? 'Nothing yet.'}</p>
      ) : (
        items.map((item, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-line bg-sunken/40 p-2.5">
            <div className="flex items-center gap-2">
              <Input value={item?.title ?? ''} placeholder={keyPlaceholder ?? 'Title'} onChange={(e) => update(i, 'title', e.target.value)} className="flex-1" />
              <button type="button" onClick={() => remove(i)} aria-label="Remove" className="rounded-md p-1.5 text-muted hover:bg-elevated hover:text-danger">
                <Icon name="trash" className="size-4" />
              </button>
            </div>
            <Textarea value={item?.detail ?? ''} placeholder={valPlaceholder ?? 'Detail'} onChange={(e) => update(i, 'detail', e.target.value)} className="min-h-[70px]" />
          </div>
        ))
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- component */

export function ProjectEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(emptyProject())
  const [fieldErrorsState, setFieldErrorsState] = useState({})
  const [saveMsg, setSaveMsg] = useState(null)

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get(`/admin/projects/${id}`).then((j) => j),
    enabled: isEdit,
  })

  useEffect(() => {
    if (isEdit && existing?.data) {
      setForm({ ...emptyProject(), ...normalize(existing.data) })
      setFieldErrorsState({})
    }
  }, [isEdit, existing])

  const set = useCallback((key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
  }, [])

  // Auto-slug from title on create.
  const onTitle = (value) => {
    set('title', value)
    if (!isEdit && !form.slug) {
      set('slug', slugify(value))
    }
  }

  const saveMutation = useMutation({
    mutationFn: (payload) => {
      const url = isEdit ? `/admin/projects/${id}` : '/admin/projects'
      const method = isEdit ? 'put' : 'post'
      return api[method](url, payload)
    },
    onSuccess: (json) => {
      setSaveMsg(isEdit ? 'Changes saved.' : 'Project created.')
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['project'] })
      setTimeout(() => setSaveMsg(null), 3000)
      if (!isEdit && json?.data?.id) {
        navigate(`/admin/projects/${json.data.id}`, { replace: true })
      }
    },
    onError: (err) => {
      setFieldErrorsState(typeof err.details === 'object' && err.details ? err.details : {})
      setSaveMsg(null)
    },
  })

  const publish = async () => {
    await api.post(`/admin/projects/${id}/publish`, {})
    qc.invalidateQueries({ queryKey: ['projects'] })
    setSaveMsg('Project published.')
    setTimeout(() => setSaveMsg(null), 3000)
  }

  if (isEdit && loadingExisting) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title={isEdit ? 'Edit project' : 'New project'}
        description="Published projects are served to the live site immediately."
        actions={
          <>
            {isEdit ? (
              <AdminButton variant="outline" icon="save" onClick={publish}>
                Publish
              </AdminButton>
            ) : null}
            <AdminButton icon="save" loading={saveMutation.isPending} onClick={() => saveMutation.mutate(form)}>
              {isEdit ? 'Save changes' : 'Create project'}
            </AdminButton>
          </>
        }
      />

      {saveMsg ? <Alert tone="success" className="mb-4">{saveMsg}</Alert> : null}

      <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form) }} className="grid gap-6 xl:grid-cols-3">
        {/* Left: main fields */}
        <div className="space-y-6 xl:col-span-2">
          <Section number="1" title="Basics" description="Title, slug and how the card appears.">
            <div className="space-y-4">
              <Field label="Title" required error={fieldErrorsState.title}>
                <Input value={form.title} onChange={(e) => onTitle(e.target.value)} required />
              </Field>
              <Field label="Slug" description="URL identifier — lowercase, hyphens." error={fieldErrorsState.slug}>
                <Input value={form.slug} onChange={(e) => set('slug', e.target.value)} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Subtitle">
                  <Input value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
                </Field>
                <Field label="Category">
                  <Input value={form.category} onChange={(e) => set('category', e.target.value)} />
                </Field>
                <Field label="Year">
                  <Input value={form.year} onChange={(e) => set('year', e.target.value)} />
                </Field>
                <Field label="Accent color">
                  <Input value={form.accent ?? ''} onChange={(e) => set('accent', e.target.value)} placeholder="#00e5a0" />
                </Field>
              </div>
              <Field label="Status">
                <Select value={form.status} onChange={(e) => set('status', e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </Select>
              </Field>
              <Toggle
                checked={form.featured}
                onChange={(v) => set('featured', v)}
                label="Featured"
                description="Show this project first and highlight the card."
              />
              <Field label="Summary" description="The one-liner shown on cards and listings." error={fieldErrorsState.summary}>
                <Textarea value={form.summary ?? ''} onChange={(e) => set('summary', e.target.value)} className="min-h-[70px]" />
              </Field>
            </div>
          </Section>

          <Section number="2" title="Links & media" description="Where people go and what they see.">
            <div className="space-y-4">
              <Field label="Card image URL">
                <Input value={form.image ?? ''} onChange={(e) => set('image', e.target.value)} placeholder="https://…" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="GitHub repository">
                  <Input value={form.github ?? ''} onChange={(e) => set('github', e.target.value)} placeholder="https://github.com/…" />
                </Field>
                <Field label="Live demo">
                  <Input value={form.liveDemo ?? ''} onChange={(e) => set('liveDemo', e.target.value)} placeholder="https://…" />
                </Field>
              </div>
            </div>
          </Section>

          <Section number="3" title="Case study" description="The detailed write-up. These shape the project page.">
            <div className="space-y-4">
              <Field label="Description" error={fieldErrorsState.description}>
                <Textarea value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Problem">
                  <Textarea value={form.problem ?? ''} onChange={(e) => set('problem', e.target.value)} />
                </Field>
                <Field label="Solution">
                  <Textarea value={form.solution ?? ''} onChange={(e) => set('solution', e.target.value)} />
                </Field>
              </div>
              <PairListEditor
                label="Features"
                items={form.features ?? []}
                onChange={(items) => set('features', items)}
                keyLabel="Feature Title"
                valLabel="Feature Detail"
                keyPlaceholder="Feature title"
                valPlaceholder="What it does"
              />
              <PairListEditor
                label="Authentication & permissions"
                items={form.auth ?? []}
                onChange={(items) => set('auth', items)}
                keyLabel="Auth"
                valLabel="Detail"
                keyPlaceholder="Mechanism"
                valPlaceholder="How it works"
              />
              <PairListEditor
                label="Challenges"
                items={form.challenges ?? []}
                onChange={(items) => set('challenges', items)}
                keyLabel="Challenge"
                valLabel="Resolution"
                keyPlaceholder="Challenge"
                valPlaceholder="How you solved it"
              />
              <ListEditor
                label="Learnings"
                items={form.learnings ?? []}
                onChange={(items) => set('learnings', items)}
                placeholder="What you learned"
              />
              <ListEditor
                label="Outcome"
                items={form.outcome ?? []}
                onChange={(items) => set('outcome', items)}
                placeholder="Result / impact"
              />
            </div>
          </Section>
        </div>

        {/* Right rail: meta + SEO */}
        <div className="space-y-6">
          <Section number="4" title="Technologies">
            <TechnologiesPicker
              value={form.technologies ?? []}
              onChange={(items) => set('technologies', items)}
            />
          </Section>

          <Section number="5" title="SEO" description="Meta for this project's page.">
            <div className="space-y-4">
              <Field label="SEO title">
                <Input value={form.seo?.seoTitle ?? ''} onChange={(e) => set('seo', { ...form.seo, seoTitle: e.target.value })} />
              </Field>
              <Field label="Meta description">
                <Textarea value={form.seo?.metaDescription ?? ''} onChange={(e) => set('seo', { ...form.seo, metaDescription: e.target.value })} className="min-h-[70px]" />
              </Field>
              <Field label="OG image">
                <Input value={form.seo?.ogImage ?? ''} onChange={(e) => set('seo', { ...form.seo, ogImage: e.target.value })} />
              </Field>
              <Field label="Canonical URL">
                <Input value={form.seo?.canonical ?? ''} onChange={(e) => set('seo', { ...form.seo, canonical: e.target.value })} />
              </Field>
            </div>
          </Section>

          {isEdit ? (
            <Section title="Versions" description="Every save is snapshotted for recovery.">
              <VersionsPanel projectId={id} />
            </Section>
          ) : null}
        </div>
      </form>
    </div>
  )
}

/* -------------------------------------------------------------- sub components */

function TechnologiesPicker({ value, onChange }) {
  const { data } = useQuery({
    queryKey: ['skills'],
    queryFn: () => api.get('/admin/skills').then((j) => j),
  })
  const skills = data?.data ?? []

  const toggle = (skillId) => {
    if (value.includes(skillId)) onChange(value.filter((s) => s !== skillId))
    else onChange([...value, skillId])
  }

  if (!skills.length) {
    return <p className="rounded-lg border border-dashed border-line px-3 py-2 text-xs text-subtle">Add skills first.</p>
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((s) => {
        const active = value.includes(s.id)
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => toggle(s.id)}
            className={cn(
              'rounded-md border px-2 py-1 text-xs transition-colors',
              active ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-sunken text-muted hover:text-fg',
            )}
          >
            {s.name}
          </button>
        )
      })}
    </div>
  )
}

function VersionsPanel({ projectId }) {
  const { data, refetch } = useQuery({
    queryKey: ['versions', projectId],
    queryFn: () => api.get(`/admin/projects/${projectId}/versions`).then((j) => j),
  })
  const versions = data?.data ?? []

  const restore = useMutation({
    mutationFn: (v) => api.post(`/admin/projects/${projectId}/versions/${v.id}/restore`, {}),
    onSuccess: () => refetch(),
  })

  return (
    <div className="space-y-1.5">
      {versions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line px-3 py-2 text-xs text-subtle">No snapshots yet.</p>
      ) : (
        versions.map((v) => (
          <div key={v.id} className="flex items-center justify-between rounded-lg border border-line bg-sunken/40 px-3 py-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-fg">v{v.version}</p>
              <p className="truncate-safe mono-label text-[0.6rem]">{v.note ?? 'Saved'}</p>
            </div>
            <button
              onClick={() => restore.mutate(v)}
              className={cn('text-[0.7rem] text-accent hover:underline', restore.isPending && 'opacity-50')}
            >
              Restore
            </button>
          </div>
        ))
      )}
    </div>
  )
}

function slugify(str) {
  return (str ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function normalize(project) {
  return {
    ...project,
    subtitle: project.subtitle ?? '',
    category: project.category ?? '',
    year: project.year ?? '',
    accent: project.accent ?? '',
    image: project.image ?? '',
    github: project.github ?? '',
    liveDemo: project.liveDemo ?? '',
    summary: project.summary ?? '',
    description: project.description ?? '',
    problem: project.problem ?? '',
    solution: project.solution ?? '',
    features: project.features ?? [],
    auth: project.auth ?? [],
    challenges: project.challenges ?? [],
    learnings: project.learnings ?? [],
    outcome: project.outcome ?? [],
    seo: project.seo ?? {},
  }
}
