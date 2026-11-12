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
 * Without one, this draws a schematic of the project's own architecture from
 * its data: a dotted rail with one dot per layer, hairline-separated rows, and
 * the layer's name in display type with its kind in muted mono on the right —
 * the same visual language as the Database section's schema tables, not a fake
 * application window.
 */

const toneStyles = {
  neutral: { dot: 'bg-subtle' },
  accent: { dot: 'bg-accent' },
  accent2: { dot: 'bg-accent2' },
  warn: { dot: 'bg-warn' },
}

const toneFor = (kind) => toneStyles[nodeKinds[kind]?.tone ?? 'neutral'] ?? toneStyles.neutral

function ArchitectureMiniature({ project }) {
  const rows = project.architecture?.rows ?? []
  const layerCount = rows.length

  return (
    // Decorative: the project title and summary sit right next to this diagram.
    // Hiding it from the accessibility tree also keeps the wrapping link's
    // accessible name free of the layer labels (label-in-name mismatch).
    <div className="relative flex h-full flex-col" aria-hidden="true">
      {/* Schematic body */}
      <div className="flex min-h-0 flex-1 flex-col justify-center border-y border-line px-5 py-3 sm:px-6">
        <div className="relative">
          {/* Dotted rail */}
          <span
            aria-hidden="true"
            className="absolute bottom-2 left-[3px] top-2 border-l border-dotted border-line-strong"
          />

          {rows.map((row, rowIndex) => {
            const firstKind = row[0]?.kind
            const tone = toneFor(firstKind)
            const kindLabel = nodeKinds[firstKind]?.label ?? firstKind
            const names = row.map((node) => node.label).join(' · ')

            return (
              <div
                key={rowIndex}
                className="relative flex items-center gap-3 border-b border-line/50 py-1.5 pl-4 last:border-b-0 sm:gap-4 sm:py-2"
              >
                <span
                  className={cn(
                    'absolute left-0 top-1/2 size-[7px] -translate-y-1/2 rounded-full',
                    tone.dot,
                    rowIndex === 0 && 'bg-accent',
                  )}
                  aria-hidden="true"
                />
                <span className="mono-label tnum w-6 shrink-0 text-[0.625rem] text-subtle">
                  0{rowIndex + 1}
                </span>
                <span className="min-w-0 flex-1 truncate-safe font-display text-[0.75rem] text-fg sm:text-[0.8125rem] lg:text-[0.875rem]">
                  {names}
                </span>
                <span className="mono-label shrink-0 text-[0.4375rem] text-subtle sm:text-[0.5rem]">
                  {kindLabel}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Caption strip */}
      <div className="flex items-center justify-between gap-3 px-5 py-2 sm:px-6">
        <span className="shrink-0 font-mono text-[0.4375rem] uppercase tracking-[0.14em] text-subtle">
          Project architecture
        </span>
        <span className="shrink-0 font-mono text-[0.4375rem] uppercase tracking-[0.14em] text-subtle">
          {layerCount} layers · request flows down
        </span>
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
        'relative overflow-hidden rounded-panel border border-line bg-sunken',
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
