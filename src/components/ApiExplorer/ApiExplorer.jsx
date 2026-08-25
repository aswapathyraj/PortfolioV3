import { useState } from 'react'
import { apiEndpoints, apiMeta, methodTones } from '../../data/api.js'
import { Section, SectionHeader } from '../ui/Section.jsx'
import { Tag } from '../ui/Tag.jsx'
import { Icon } from '../ui/Icon.jsx'
import { ApiConsole } from './ApiConsole.jsx'
import { cn } from '../../utils/cn.js'
import { useRovingIndex } from '../../hooks/useRovingIndex.js'

/**
 * API Explorer.
 *
 * Endpoint list on the left, an editable request console on the right. Framed
 * explicitly as a documented mock — the honest version of this demo is more
 * convincing than one that fakes a deployed backend.
 */
export function ApiExplorer() {
  const [selected, setSelected] = useState(0)
  const endpoint = apiEndpoints[selected]

  const { getItemProps } = useRovingIndex({
    count: apiEndpoints.length,
    selected,
    onSelect: setSelected,
  })

  return (
    <Section id="api">
      <SectionHeader
        index="08"
        eyebrow="API Explorer"
        title="The API layer, inspectable."
        description="Edit the request and run it. Responses are generated in the browser from this site's own data layer — the payloads and status codes are real, the network call is not."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone="ghost" icon="network">
              {apiEndpoints.length} endpoints
            </Tag>
            <Tag tone="warn" icon="info">
              Mock · no network
            </Tag>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-6">
        {/* Endpoint list */}
        <div className="min-w-0">
          <div className="overflow-hidden rounded-panel border border-line bg-surface">
            <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
              <span className="mono-label">Endpoints</span>
              <span className="mono-label">{apiMeta.version}</span>
            </div>

            <div role="tablist" aria-label="API endpoints" aria-orientation="vertical" className="p-2">
              {apiEndpoints.map((item, index) => {
                const active = selected === index

                return (
                  <button
                    key={item.id}
                    {...getItemProps(index)}
                    id={`api-tab-${item.id}`}
                    aria-controls="api-panel"
                    onClick={() => setSelected(index)}
                    className={cn(
                      'group flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2.5 text-left transition-colors duration-200',
                      active
                        ? 'border-accent-line bg-accent-soft'
                        : 'border-transparent hover:bg-elevated',
                    )}
                  >
                    <Tag
                      tone={methodTones[item.method] ?? 'neutral'}
                      className="shrink-0 px-1.5 py-0.5 text-[0.5625rem] font-semibold"
                    >
                      {item.method}
                    </Tag>

                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block truncate-safe font-mono text-[0.75rem] transition-colors duration-200',
                          active ? 'text-fg' : 'text-muted group-hover:text-fg',
                        )}
                      >
                        {item.path}
                      </span>
                      <span className="mt-0.5 block truncate-safe text-[0.6875rem] text-subtle">
                        {item.summary}
                      </span>
                    </span>

                    {active ? (
                      <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    ) : null}
                  </button>
                )
              })}
            </div>

            <div className="border-t border-line px-4 py-3">
              <p className="mono-label mb-1.5">Base URL</p>
              <code className="font-mono text-[0.75rem] text-muted">{apiMeta.baseUrl}</code>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-inset border border-line bg-sunken px-3.5 py-3">
            <Icon name="info" className="mt-0.5 size-3.5 shrink-0 text-subtle" />
            <p className="text-[0.75rem] leading-relaxed text-subtle">
              <strong className="font-medium text-muted">POST /api/contact</strong> runs the exact
              validation module the live contact form uses, so its 422 responses are genuine.
            </p>
          </div>
        </div>

        {/* Console */}
        <div
          id="api-panel"
          role="tabpanel"
          aria-labelledby={`api-tab-${endpoint.id}`}
          className="min-w-0"
        >
          <ApiConsole key={endpoint.id} endpoint={endpoint} />
        </div>
      </div>
    </Section>
  )
}

export default ApiExplorer
