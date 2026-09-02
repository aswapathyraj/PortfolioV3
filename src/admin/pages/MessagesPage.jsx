import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api.js'
import { PageHeader, Card, Badge, EmptyState, Skeleton } from '../components/ui.jsx'
import { Select } from '../components/fields.jsx'
import { Icon } from '../../components/ui/Icon.jsx'
import { cn } from '../../utils/cn.js'

const STATUS_TONE = { unread: 'accent', read: 'neutral', archived: 'neutral', spam: 'danger' }

function MessageRow({ message, onSelect }) {
  return (
    <button
      onClick={() => onSelect(message)}
      className={cn(
        'w-full rounded-lg border px-4 py-3 text-left transition-colors',
        message.status === 'unread' ? 'border-accent-line bg-accent-soft/40' : 'border-line bg-sunken/40',
        'hover:bg-sunken/70',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate-safe text-sm font-medium text-fg">{message.name}</span>
            {message.status === 'unread' ? <span className="size-1.5 shrink-0 rounded-full bg-accent" /> : null}
          </div>
          <p className="truncate-safe text-[0.72rem] text-muted">{message.subject || 'no subject'} · <span className="mono-label">{message.email}</span></p>
        </div>
        <span className="shrink-0 text-[0.68rem] text-subtle">{timeAgo(message.createdAt)}</span>
      </div>
    </button>
  )
}

function MessageDetail({ message, onBack, onPatch }) {
  const [busy, setBusy] = useState(false)

  const act = async (updates) => {
    setBusy(true)
    await onPatch(message.id, updates)
    setBusy(false)
  }

  const statusTone = STATUS_TONE[message.status] ?? 'neutral'

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted hover:text-fg">
          <Icon name="arrowLeft" className="size-4" /> Inbox
        </button>
        <div className="flex items-center gap-1.5">
          {message.status !== 'spam' ? (
            <button onClick={() => act({ status: 'spam' })} disabled={busy} className="rounded-md border border-line px-2.5 py-1 text-xs text-muted hover:border-danger/50 hover:text-danger disabled:opacity-40">
              Spam
            </button>
          ) : null}
          {message.status === 'unread' ? (
            <button onClick={() => act({ status: 'read' })} disabled={busy} className="rounded-md border border-line px-2.5 py-1 text-xs text-muted hover:text-fg disabled:opacity-40">
              Mark read
            </button>
          ) : null}
          {message.status !== 'archived' ? (
            <button onClick={() => act({ status: 'archived' })} disabled={busy} className="rounded-md border border-line px-2.5 py-1 text-xs text-muted hover:text-fg disabled:opacity-40">
              Archive
            </button>
          ) : null}
        </div>
      </div>
      <div className="space-y-5 px-5 py-5">
        <div>
          <h3 className="text-lg font-semibold text-fg">{message.subject || 'No subject'}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">{message.name} &lt;{message.email}&gt;</span>
            <Badge tone={statusTone}>{message.status}</Badge>
            <span className="mono-label">{timeAgo(message.createdAt)}</span>
          </div>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg/90">{message.body}</p>
      </div>
    </Card>
  )
}

export function MessagesPage() {
  const qc = useQueryClient()
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['messages', status],
    queryFn: () => api.get(`/admin/messages?status=${status}`).then((j) => j),
  })
  const messages = data?.data ?? []

  const patch = useMutation({
    mutationFn: ({ id, body }) => api.patch(`/admin/messages/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] })
      qc.invalidateQueries({ queryKey: ['messages/meta'] })
    },
  })

  const current = selected ? messages.find((m) => m.id === selected) : null

  return (
    <div>
      <PageHeader
        eyebrow="Communication"
        title="Messages"
        description="Contact-form submissions land here. Set up delivery in the Contact Form settings."
      />

      <div className="mb-4 flex justify-end">
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setSelected(null) }} className="w-36">
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="archived">Archived</option>
          <option value="spam">Spam</option>
        </Select>
      </div>

      {isLoading ? (
        <Card className="p-0"><div className="space-y-2 p-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div></Card>
      ) : current ? (
        <MessageDetail
          message={current}
          onBack={() => setSelected(null)}
          onPatch={(id, body) => patch.mutateAsync({ id, body })}
        />
      ) : messages.length ? (
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {messages.map((m) => (
            <MessageRow key={m.id} message={m} onSelect={(msg) => setSelected(msg.id)} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="message"
          title="Inbox is empty"
          description="New submissions from the contact form will appear here."
        />
      )}
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
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}