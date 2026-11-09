import { useState } from 'react'
import { nodeKinds } from '../../data/architecture.js'
import { cn } from '../../utils/cn.js'
import { Icon } from '../ui/Icon.jsx'

/**
 * Project visual.
 *
 * When a project has a screenshot it is rendered lazily, with a decode hint and
 * a real error path — a broken file falls back rather than leaving a gap.
 *
 * When there is no screenshot yet, this draws a miniature of the project's own
 * architecture from its data instead of a stock mockup. The miniature borrows
 * the System Architecture section's visual language (layered nodes, accent
 * edge bars, dotted canvas, connector lines) inside the browser frame from the
 * case-study page. It is honest about being a diagram, and it still tells the
 * reader something about the system.
 */

const toneStyles = {
  neutral: {
    border: 'border-line',
    bg: 'bg-surface',
    icon: 'text-subtle',
    dot: 'bg-subtle',
  },
  accent: {
    border: 'border-line',
    bg: 'bg-surface',
    icon: 'text-accent',
    dot: 'bg-accent',
  },
  accent2: {
    border: 'border-line',
    bg: 'bg-surface',
    icon: 'text-accent2',
    dot: 'bg-accent2',
  },
  warn: {
    border: 'border-line',
    bg: 'bg-surface',
    icon: 'text-warn',
    dot: 'bg-warn',
  },
}

const toneFor = (kind) => toneStyles[nodeKinds[kind]?.tone ?? 'neutral'] ?? toneStyles.neutral

/** Compact static connector between two rows — vertical line or fan-out branch. */
function Connector({ branching = false }) {
  if (branching) {
    return (
      <svg
        viewBox="0 0 200 8"
        preserveAspectRatio="none"
        className="h-1.5 w-full @[26rem]:h-3"
        aria-hidden="true"
      >
        <path
          d="M100 0 V4.5 M22 8 V6.5 Q22 4.5 100 4.5 Q178 4.5 178 6.5 V8"
          fill="none"
          stroke="var(--p-line-strong)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 2 12" preserveAspectRatio="none" className="h-1.5 w-px @[26rem]:h-3" aria-hidden="true">
      <path d="M1 0 V12" fill="none" stroke="var(--p-line-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <circle cx="1" cy="10" r="1.1" fill="var(--p-accent)" opacity="0.8" />
    </svg>
  )
}

/** Compact static node, visually matched to the System Architecture nodes. */
function MiniNode({ node }) {
  const tone = toneFor(node.kind)

  return (
    <div
      className={cn(
        'relative min-w-0 flex-1 overflow-hidden rounded-lg border px-1.5 py-1 sm:px-2 sm:py-1.5',
        tone.bg,
        tone.border,
      )}
    >
      <span
        className={cn('absolute left-0 top-1.5 h-[calc(100%-0.75rem)] w-0.5 rounded-r-full opacity-40', tone.dot)}
        aria-hidden="true"
      />
      <div className="flex items-center gap-1.5 pl-1 sm:gap-2">
        <span
          className={cn(
            'flex size-4 shrink-0 items-center justify-center rounded border border-line bg-sunken @[26rem]:size-6',
            tone.icon,
          )}
        >
          <Icon name={node.icon} className="size-2 @[26rem]:size-3" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate-safe font-display text-[0.5625rem] leading-tight text-fg/90 @[26rem]:text-[0.6875rem]">
            {node.label}
          </span>
          {node.sub ? (
            <span className="mt-0.5 hidden truncate-safe font-mono text-[0.4375rem] text-subtle @[26rem]:block">
              {node.sub}
            </span>
          ) : null}
        </span>
      </div>
    </div>
  )
}

function ArchitectureMiniature({ project }) {
  const rows = project.architecture?.rows ?? []
  const layerCount = rows.length
  const ariaLabel = `${project.title} architecture: ${rows
    .flat()
    .map((node) => node.label)
    .join(' → ')}`

  return (
    <div className="relative flex h-full flex-col" role="img" aria-label={ariaLabel}>
      {/* Browser chrome: traffic lights + address bar with the case-study path */}
      <div className="flex items-center gap-2 border-b border-line bg-elevated/60 px-2.5 py-1.5 sm:gap-2.5 sm:px-3 sm:py-2">
        <span className="flex shrink-0 gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-[#ff5f57]/80" />
          <span className="size-2 rounded-full bg-[#febc2e]/80" />
          <span className="size-2 rounded-full bg-[#28c840]/80" />
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-line bg-sunken px-2 py-1">
          <Icon name="shieldCheck" className="size-3 shrink-0 text-accent" />
          <span className="truncate-safe font-mono text-[0.5625rem] text-subtle sm:text-[0.625rem]">
            /projects/{project.slug}/architecture
          </span>
        </span>
        <span
          aria-hidden="true"
          className="flex size-4 shrink-0 items-center justify-center rounded-[3px] bg-accent font-mono text-[0.5625rem] font-bold text-on-accent"
        >
          {project.slug?.[0]?.toUpperCase() ?? '?'}
        </span>
      </div>

      {/* Layered node diagram — Static render of the reference pattern */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="grid-field-sm pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-center p-2 sm:p-3">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="contents">
              <div className="flex flex-row gap-1.5 sm:gap-2">
                {row.map((node) => (
                  <MiniNode key={node.id} node={node} />
                ))}
              </div>
              {rowIndex < rows.length - 1 ? (
                <Connector branching={rows[rowIndex + 1].length > 1} />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Browser status bar */}
      <div className="flex items-center justify-between gap-2 border-t border-line bg-elevated/60 px-2.5 py-1 sm:px-3">
        <span className="mono-label flex items-center gap-1.5 text-[0.5rem] sm:text-[0.5625rem]">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
          Architecture preview
        </span>
        <span className="mono-label text-[0.5rem] text-subtle sm:text-[0.5625rem]">{layerCount} layers</span>
      </div>
    </div>
  )
}

export function ProjectVisual({ project, className, aspect = 'aspect-[16/11]' }) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(project.image) && !imageFailed

  return (
    <div
      className={cn(
        '@container relative overflow-hidden rounded-panel border border-line bg-sunken',
        aspect,
        className,
      )}
    >
      {showImage ? (
        <img
          src={project.image}
          alt={`${project.title} — interface screenshot`}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          className="size-full object-cover"
        />
      ) : project.architecture ? (
        <ArchitectureMiniature project={project} />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-subtle">
          <Icon name="empty" className="size-6" />
          <span className="mono-label">No preview yet</span>
        </div>
      )}

      {imageFailed && import.meta.env.DEV ? (
        <span className="absolute inset-x-0 bottom-0 bg-warn/15 px-3 py-1.5 text-center font-mono text-[0.625rem] text-warn">
          dev · image failed to load: {project.image}
        </span>
      ) : null}
    </div>
  )
}

export default ProjectVisual
