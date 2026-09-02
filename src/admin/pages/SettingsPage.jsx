import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api.js'
import { cn } from '../../utils/cn.js'
import { PageHeader, Card, CardHeader, Alert, Skeleton } from '../components/ui.jsx'
import { AdminButton } from '../components/Button.jsx'
import { Field, Input, Textarea, Toggle } from '../components/fields.jsx'
import { Icon } from '../../components/ui/Icon.jsx'

function SectionCard({ children }) {
  return <Card>{children}</Card>
}

export function SettingsPage() {
  const location = useLocation()
  const qc = useQueryClient()
  const mode = location.pathname.split('/').pop() // settings | seo | appearance

  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  const endpoint =
    mode === 'seo' ? '/admin/seo' : mode === 'appearance' ? '/admin/appearance' : '/admin/settings'

  const { data, isLoading } = useQuery({
    queryKey: [endpoint],
    queryFn: () => api.get(endpoint).then((j) => j),
  })

  // For the general settings page we edit the whole object; for seo/appearance
  // we edit that sub-object directly.
  useEffect(() => {
    if (data?.data && !form) setForm(data.data)
  }, [data, form])

  const save = useMutation({
    mutationFn: () => {
      // Settings PUT expects top-level section keys; the form holds the whole
      // settings object, so send only the `site` section being edited.
      const body = mode === 'settings' ? { site: form ? form.site : null } : form
      return api.put(endpoint, body)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [endpoint] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
    onError: (err) => setError(err.message ?? 'Save failed.'),
  })

  const uploadResume = useMutation({
    mutationFn: (file) => {
      const fd = new FormData()
      fd.append('kind', 'resume')
      fd.append('subdir', 'resume')
      fd.append('file', file)
      return api.post('/admin/uploads', fd)
    },
    onSuccess: (json) => {
      const url = json?.data?.url
      if (!url) throw new Error('Upload returned no file URL.')
      setForm({ ...form, site: { ...(form?.site ?? {}), resume: url } })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
    onError: (err) => setError(err?.message ?? 'Upload failed.'),
  })

  const [locating, setLocating] = useState(false)
  const useMyLocation = () => {
    if (locating) return
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported in this browser.')
      return
    }
    setLocating(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const build = {}
        // Timezone needs no network — derive it straight from the browser.
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (tz) build.timezone = tz
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=en`,
          )
          if (res.ok) {
            const geo = await res.json()
            const place = geo?.address
            const parts = []
            if (place?.city) parts.push(place.city)
            if (place?.state) parts.push(place.state)
            if (place?.country && place.country !== place?.state) parts.push(place.country)
            if (parts.length) build.location = parts.join(', ')
          }
        } catch {
          /* reverse-geocode is best-effort; timezone still fills */
        }
        setForm({ ...form, site: { ...(form?.site ?? {}), ...build } })
        setLocating(false)
      },
      (err) => {
        setLocating(false)
        setError(
          err?.code === err?.PERMISSION_DENIED
            ? 'Location permission denied.'
            : 'Could not determine your location.',
        )
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 },
    )
  }

  if (isLoading || (!form && data)) {
    return (
      <div>
        <PageHeader eyebrow="System" title={mode === 'seo' ? 'SEO' : mode === 'appearance' ? 'Appearance' : 'Settings'} />
        <Card className="space-y-3"><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" /></Card>
      </div>
    )
  }

  const f = form ?? {}

  return (
    <div>
      <PageHeader
        eyebrow="System"
        title={mode === 'seo' ? 'SEO' : mode === 'appearance' ? 'Appearance' : 'Settings'}
        description={
          mode === 'seo'
            ? 'How search engines and social platforms describe your site.'
            : mode === 'appearance'
              ? 'Visual and interaction preferences for the public site.'
              : 'Core portfolio identity and global preferences.'
        }
      />

      {saved ? <Alert tone="success" className="mb-4">Saved.</Alert> : null}
      {error ? <Alert tone="danger" className="mb-4">{error}</Alert> : null}

      {mode === 'seo' ? (
        /* ---- SEO : landscape layout --------------------------------- */
        <SectionCard>
          <CardHeader
            title="Search & social"
            description="Fields flow horizontally so titles, descriptions and links are edited in a single wide view."
          />
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Field label="Default title" description='Shown when no specific page title exists.'>
                <Input value={f.defaultTitle ?? ''} onChange={(e) => setForm({ ...f, defaultTitle: e.target.value })} />
              </Field>
              <Field label="Title template" description='Example: "%s — Aswapathy Raj".'>
                <Input value={f.titleTemplate ?? ''} onChange={(e) => setForm({ ...f, titleTemplate: e.target.value })} />
              </Field>
              <Field label="Description" description="Meta description used by search engines.">
                <Textarea value={f.description ?? ''} onChange={(e) => setForm({ ...f, description: e.target.value })} className="min-h-[70px]" />
              </Field>
              <Field label="Keywords" description="Comma-separated. Used for SEO meta tags.">
                <Textarea
                  value={Array.isArray(f.keywords) ? f.keywords.join(', ') : (f.keywords ?? '')}
                  onChange={(e) =>
                    setForm({
                      ...f,
                      keywords: e.target.value
                        .split(',')
                        .map((k) => k.trim())
                        .filter(Boolean),
                    })
                  }
                  className="min-h-[70px]"
                />
              </Field>
              <Field label="OG image" description="Opengraph share image path or URL.">
                <Input value={f.ogImage ?? ''} onChange={(e) => setForm({ ...f, ogImage: e.target.value })} />
              </Field>
              <Field label="Twitter handle" description='"@handle" shown in twitter:creator.'>
                <Input value={f.twitterHandle ?? ''} onChange={(e) => setForm({ ...f, twitterHandle: e.target.value })} />
              </Field>
            </div>

            <div className="flex justify-end border-t border-line pt-4">
              <AdminButton icon="save" loading={save.isPending} onClick={() => save.mutate()}>
                Save changes
              </AdminButton>
            </div>
          </div>
        </SectionCard>
      ) : mode === 'settings' ? (
        /* ---- Settings : landscape layout ---------------------------- */
        <SectionCard>
          <CardHeader
            title="Site identity"
            description="Global portfolio identity — identity, links and social fields laid out horizontally for quick editing."
          />
          <div className="space-y-5">
            <p className="mono-label text-subtle">Identity</p>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Field label="Name"><Input value={f.site?.name ?? ''} onChange={(e) => setForm({ ...form, site: { ...(form?.site ?? {}), name: e.target.value } })} /></Field>
              <Field label="Initials"><Input value={f.site?.initials ?? ''} onChange={(e) => setForm({ ...form, site: { ...(form?.site ?? {}), initials: e.target.value } })} /></Field>
              <Field label="Title" description="Role line, e.g. Full-Stack Developer.">
                <Input value={f.site?.title ?? ''} onChange={(e) => setForm({ ...form, site: { ...(form?.site ?? {}), title: e.target.value } })} />
              </Field>
              <Field label="Headline" description="The one-line summary shown in the hero.">
                <Input value={f.site?.headline ?? ''} onChange={(e) => setForm({ ...form, site: { ...(form?.site ?? {}), headline: e.target.value } })} />
              </Field>
              <Field label="Site URL" description="Canonical origin, no trailing slash.">
                <Input value={f.site?.siteUrl ?? ''} onChange={(e) => setForm({ ...form, site: { ...(form?.site ?? {}), siteUrl: e.target.value } })} />
              </Field>
              <Field label="Email"><Input value={f.site?.email ?? ''} onChange={(e) => setForm({ ...form, site: { ...(form?.site ?? {}), email: e.target.value } })} /></Field>
              <Field label="Location"><Input value={f.site?.location ?? ''} onChange={(e) => setForm({ ...form, site: { ...(form?.site ?? {}), location: e.target.value } })} /></Field>
              <Field label="Timezone"><Input value={f.site?.timezone ?? ''} onChange={(e) => setForm({ ...form, site: { ...(form?.site ?? {}), timezone: e.target.value } })} /></Field>
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={useMyLocation}
                  disabled={locating}
                  className="flex items-center gap-2 rounded-lg border border-line bg-sunken/60 px-3 py-2 text-sm text-fg transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon name={locating ? 'spinner' : 'globe'} className={cn(locating && 'animate-spin', 'size-4 text-muted')} />
                  {locating ? 'Detecting…' : 'Use my current location'}
                </button>
              </div>
            </div>

            <p className="mono-label pt-2 text-subtle">Links</p>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Field label="GitHub" description="Profile URL.">
                <Input value={f.site?.github ?? ''} onChange={(e) => setForm({ ...form, site: { ...(form?.site ?? {}), github: e.target.value } })} />
              </Field>
              <Field label="GitHub username" description="Used to fetch developer activity.">
                <Input value={f.site?.githubUsername ?? ''} onChange={(e) => setForm({ ...form, site: { ...(form?.site ?? {}), githubUsername: e.target.value } })} />
              </Field>
              <Field label="LinkedIn" description="Profile URL.">
                <Input value={f.site?.linkedin ?? ''} onChange={(e) => setForm({ ...form, site: { ...(form?.site ?? {}), linkedin: e.target.value } })} />
              </Field>
              <Field label="Resume" description="PDF upload. Replaces the resume the buttons link to.">
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-line bg-sunken/40 px-3 py-3 transition-colors hover:border-accent">
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      disabled={uploadResume.isPending}
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) uploadResume.mutate(file)
                      }}
                    />
                    <span className="flex items-center gap-2 text-sm text-fg">
                      <Icon name="upload" className="size-4" />
                      {uploadResume.isPending ? 'Uploading…' : 'Upload PDF'}
                    </span>
                  </label>
                  {f.site?.resume ? (
                    <div className="flex flex-wrap items-center gap-2 text-[0.78rem]">
                      <Icon name="download" className="size-3.5 text-muted" />
                      <a href={f.site.resume} target="_blank" rel="noreferrer" className="text-accent underline-offset-2 hover:underline">
                        {f.site.resume}
                      </a>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, site: { ...(form?.site ?? {}), resume: '' } })}
                        className="text-muted underline-offset-2 hover:text-danger"
                      >
                        remove
                      </button>
                    </div>
                  ) : null}
                </div>
              </Field>
            </div>

            <div className="flex justify-end border-t border-line pt-4">
              <AdminButton icon="save" loading={save.isPending} onClick={() => save.mutate()}>
                Save changes
              </AdminButton>
            </div>
          </div>
        </SectionCard>
      ) : (
        /* ---- Appearance : toggle stack ------------------------------ */
        <div className="grid gap-6 lg:grid-cols-3">
          <SectionCard>
            <CardHeader title="Theme & motion" />
            <div className="space-y-4">
              <Toggle checked={f.animations ?? true} onChange={(v) => setForm({ ...f, animations: v })} label="Animations" description="Enable motion on the public site." />
              <Toggle checked={f.customCursor ?? false} onChange={(v) => setForm({ ...f, customCursor: v })} label="Custom cursor" />
              <Toggle checked={f.githubActivity ?? false} onChange={(v) => setForm({ ...f, githubActivity: v })} label="GitHub activity" />
              <Toggle checked={f.progressBar ?? false} onChange={(v) => setForm({ ...f, progressBar: v })} label="Scroll progress bar" />

              <div className="flex justify-end pt-1">
                <AdminButton icon="save" loading={save.isPending} onClick={() => save.mutate()}>
                  Save changes
                </AdminButton>
              </div>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  )
}