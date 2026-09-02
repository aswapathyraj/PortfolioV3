import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api.js'
import { PageHeader, Card, CardHeader, Alert, Skeleton } from '../components/ui.jsx'
import { AdminButton } from '../components/Button.jsx'
import { Field, Input, Select } from '../components/fields.jsx'
import { Icon } from '../../components/ui/Icon.jsx'

const DIAG_TONE = { ready: 'success', idle: 'neutral', incomplete: 'warn', invalid: 'danger', unknown: 'danger' }

export function ContactPage() {
  const qc = useQueryClient()
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['contact-settings'],
    queryFn: () => api.get('/admin/contact').then((j) => j),
  })

  useEffect(() => {
    if (data?.data && !form) setForm(data.data)
  }, [data, form])

  const save = useMutation({
    mutationFn: () => api.put('/admin/contact', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contact-settings'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  const diag = data?.diagnostics
  const provider = form?.provider ?? diag?.provider ?? 'none'

  if (isLoading || !data) {
    return (
      <div>
        <PageHeader eyebrow="Communication" title="Contact Form" />
        <Card className="space-y-3"><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" /></Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Communication"
        title="Contact Form"
        description="Choose how contact-form submissions are delivered to you. The message is always stored in the inbox."
      />

      {diag ? (
        <Alert tone={DIAG_TONE[diag.status] ?? 'neutral'} className="mb-5" title={`Delivery: ${diag.status}`}>
          {diag.note}
        </Alert>
      ) : null}
      {saved ? <Alert tone="success" className="mb-5">Contact settings saved.</Alert> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Delivery provider" description="Who handles the actual email send." />
          <div className="space-y-4">
            <Field label="Provider">
              <Select value={provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}>
                <option value="none">None — inbox only</option>
                <option value="mailto">Mailto link</option>
                <option value="endpoint">Custom endpoint</option>
                <option value="web3forms">Web3Forms</option>
              </Select>
            </Field>

            {provider === 'endpoint' ? (
              <Field label="Endpoint URL" description="Messages will be POSTed as JSON to this URL.">
                <Input value={form?.endpoint ?? ''} onChange={(e) => setForm({ ...form, endpoint: e.target.value })} placeholder="https://example.com/contact" />
              </Field>
            ) : null}

            {provider === 'web3forms' ? (
              <Field label="Web3Forms access key" description="From your Web3Forms dashboard.">
                <Input value={form?.web3formsAccessKey ?? ''} onChange={(e) => setForm({ ...form, web3formsAccessKey: e.target.value })} />
              </Field>
            ) : null}

            <Field label="From name" description="Recipient label used with endpoint delivery.">
              <Input value={form?.fromName ?? ''} onChange={(e) => setForm({ ...form, fromName: e.target.value })} />
            </Field>

            <div className="flex justify-end">
              <AdminButton icon="save" loading={save.isPending} onClick={() => save.mutate()}>
                Save settings
              </AdminButton>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="How it works" description="Status of the current setup." />
          <div className="space-y-1.5 text-[0.82rem] text-muted">
            <p className="flex items-center gap-2"><Icon name="checkCircle" className="size-4 text-accent" /> Always captured in the inbox</p>
            <p className="flex items-center gap-2"><Icon name="checkCircle" className="size-4 text-accent" /> Stored with visitor context</p>
            <p className="flex items-center gap-2"><Icon name="checkCircle" className="size-4 text-accent" /> Optional live delivery</p>
          </div>
        </Card>
      </div>
    </div>
  )
}