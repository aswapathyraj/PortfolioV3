import { Component } from 'react'
import { Button } from './Button.jsx'
import { Icon } from './Icon.jsx'

/**
 * Error boundary.
 *
 * A render error in one section should not blank the page, and it should never
 * put a stack trace in front of a visitor. The trace goes to the console in
 * development; production gets a recoverable panel.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', this.props.label ?? 'section', error, info)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    if (this.props.silent) return null

    return (
      <div
        role="alert"
        className="mx-auto my-10 flex max-w-xl flex-col items-center gap-4 rounded-panel border border-dashed border-line bg-sunken px-6 py-10 text-center"
      >
        <span className="flex size-11 items-center justify-center rounded-full border border-line bg-elevated text-warn">
          <Icon name="warning" className="size-5" />
        </span>
        <div>
          <p className="font-display text-base text-fg">This section could not be displayed</p>
          <p className="mt-1.5 text-sm text-muted">
            The rest of the page is unaffected. Reloading usually clears it.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" icon="retry" onClick={this.handleReset}>
            Try again
          </Button>
          <Button size="sm" variant="ghost" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
