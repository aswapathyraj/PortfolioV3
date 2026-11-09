import { useState } from 'react'
import { cn } from '../../utils/cn.js'
import { Icon } from '../ui/Icon.jsx'

/**
 * Project visual.
 *
 * When a project has a screenshot it is rendered lazily, with a decode hint and
 * a real error path — a broken file falls back rather than leaving a gap.
 *
 * When there is no screenshot yet, this draws a miniature of the project's own
 * architecture from its data instead of a stock mockup. It is honest about being
 * a diagram, and it still tells the reader something about the system.
 */

const kindDot = {
  client: 'bg-subtle',
  edge: 'bg-accent',
  api: 'bg-accent',
  service: 'bg-accent2',
  data: 'bg-warn',
  infra: 'bg-subtle',
}

function ArchitectureMiniature({ project }) {
  const rows = project.architecture?.rows ?? []

  return (
    <div className="relative flex h-full flex-col">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-line bg-elevated/60 px-3 py-1.5 sm:py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-line-strong" />
          <span className="size-2 rounded-full bg-line-strong" />
          <span className="size-2 rounded-full bg-line-strong" />
        </span>
        <span className="truncate-safe font-mono text-[0.625rem] text-subtle">
          {project.slug}/architecture
        </span>
      </div>

      <div className="grid-field-sm relative flex min-h-0 flex-1 flex-col justify-center gap-1 overflow-hidden p-2.5 sm:gap-1.5 sm:p-3.5">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-col items-stretch gap-1">
            <div className="flex items-stretch justify-center gap-1.5 sm:gap-2">
              {row.map((node) => (
                <div
                  key={node.id}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-line bg-surface/90 px-2 py-1 backdrop-blur-sm sm:px-2.5 sm:py-1.5"
                >
                  <span
                    className={cn('size-1.5 shrink-0 rounded-full', kindDot[node.kind] ?? 'bg-subtle')}
                    aria-hidden="true"
                  />
                  {/* min-w-0 is load-bearing: a truncating flex item defaults to
                      min-width:auto, which would let the nowrap label set a floor
                      wide enough to push the whole card past a 320px viewport. */}
                  <span className="min-w-0 truncate-safe font-mono text-[0.5625rem] leading-tight text-muted sm:text-[0.625rem]">
                    {node.label}
                  </span>
                </div>
              ))}
            </div>

            {rowIndex < rows.length - 1 ? (
              <div className="flex justify-center" aria-hidden="true">
                <span className="h-1.5 w-px bg-line-strong" />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line bg-elevated/60 px-3 py-1">
        <span className="mono-label text-[0.5625rem]">Architecture preview</span>
        <span className="mono-label text-[0.5625rem]">{rows.length} layers</span>
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
