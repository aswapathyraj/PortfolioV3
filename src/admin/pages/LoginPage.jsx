import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '../../components/ui/Icon.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { AdminButton } from '../components/Button.jsx'
import { Field, Input } from '../components/fields.jsx'
import { Alert } from '../components/ui.jsx'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const from = location.state?.from ?? '/admin'

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message ?? 'Sign in failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid-field flex min-h-screen items-center justify-center bg-void px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-accent text-on-accent shadow-glow">
            <Icon name="command" className="size-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-fg">Portfolio Control Center</h1>
            <p className="mono-label mt-1">SIGN IN TO MANAGE CONTENT</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="rounded-xl border border-line bg-surface p-6 shadow-panel">
          {error ? <Alert tone="danger" className="mb-4">{error}</Alert> : null}

          <div className="space-y-4">
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="admin@aswapathyraj.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field label="Password" htmlFor="password">
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
          </div>

          <AdminButton type="submit" loading={loading} className="mt-5 w-full">
            Sign in
          </AdminButton>
        </form>

        <p className="mt-5 text-center text-xs text-muted">
          Secured access — sessions are rotated and audited.
        </p>
      </div>
    </div>
  )
}