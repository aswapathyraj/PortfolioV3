import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api.js'
import { PageHeader, Card, Badge, Alert, EmptyState, Skeleton } from '../components/ui.jsx'
import { AdminButton, IconButton } from '../components/Button.jsx'
import { Field, Input, Select } from '../components/fields.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

const ROLE_TONE = { owner: 'accent', admin: 'success', editor: 'neutral' }

function UserModal({ onClose, onSaved }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('editor')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    setSaving(true)
    setError(null)
    try {
      await onSaved({ name, email, password, role })
      onClose()
    } catch (err) {
      setError(err.message ?? 'Failed to create user.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-scrim p-4 pt-[12vh]" onClick={onClose}>
      <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-fg">Invite a user</h3>
            <IconButton label="Close" icon="close" onClick={onClose} />
          </div>
          {error ? <Alert tone="danger" className="mb-4">{error}</Alert> : null}
          <div className="space-y-4">
            <Field label="Name" required><Input value={name} onChange={(e) => setName(e.target.value)} required /></Field>
            <Field label="Email" required><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
            <Field label="Role">
              <Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="editor">Editor — manage content</option>
                <option value="admin">Admin — manage content + users</option>
                <option value="owner">Owner — everything</option>
              </Select>
            </Field>
            <Field label="Password" description="Minimum 10 characters." required>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Field>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <AdminButton variant="ghost" onClick={onClose}>Cancel</AdminButton>
            <AdminButton loading={saving} onClick={submit}>Create user</AdminButton>
          </div>
        </Card>
      </div>
    </div>
  )
}

export function UsersPage() {
  const qc = useQueryClient()
  const { admin: me, isOwner } = useAuth()
  const [modal, setModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then((j) => j),
  })
  const users = data?.data ?? []

  const createUser = useMutation({
    mutationFn: (body) => api.post('/admin/users', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const roleChange = useMutation({
    mutationFn: ({ id, role }) => api.patch(`/admin/users/${id}`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const removeUser = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  return (
    <div>
      <PageHeader
        eyebrow="System"
        title="Users & Access"
        description="Who can sign in to the Control Center and what they can do."
        actions={isOwner ? <AdminButton icon="plus" onClick={() => setModal(true)}>Invite user</AdminButton> : null}
      />

      {!isOwner ? (
        <Alert tone="warn" className="mb-4">Only the owner can invite users or change roles. You have read control here.</Alert>
      ) : null}

      {isLoading ? (
        <Card className="p-0"><div className="space-y-2 p-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div></Card>
      ) : users.length ? (
        <Card className="p-0">
          <div className="divide-y divide-line">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-elevated text-sm font-semibold text-fg">
                  {(u.name ?? u.email).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate-safe text-sm font-medium text-fg">{u.name ?? u.email}</p>
                    {u.id === me?.id ? <span className="mono-label text-[0.6rem] text-accent">YOU</span> : null}
                  </div>
                  <p className="truncate-safe text-[0.72rem] text-muted">{u.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={ROLE_TONE[u.role] ?? 'neutral'}>{u.role}</Badge>
                  {isOwner && u.id !== me.id ? (
                    <>
                      <Select
                        value={u.role}
                        onChange={(e) => roleChange.mutate({ id: u.id, role: e.target.value })}
                        className="h-8 w-28 text-xs"
                      >
                        <option value="editor">editor</option>
                        <option value="admin">admin</option>
                        <option value="owner">owner</option>
                      </Select>
                      <IconButton
                        label="Remove"
                        icon="trash"
                        onClick={() => { if (window.confirm(`Remove ${u.email}?`)) removeUser.mutate(u.id) }}
                        className="hover:text-danger"
                      />
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <EmptyState icon="users" title="No users" description="Invite someone to collaborate." />
      )}

      {modal ? <UserModal onClose={() => setModal(false)} onSaved={(b) => createUser.mutateAsync(b)} /> : null}
    </div>
  )
}