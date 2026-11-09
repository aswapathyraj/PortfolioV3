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
 * architecture from its data instead of a stock mockup. The miniature is
 * framed as the project's case-study URL in a browser window, and the layers
 * are drawn as a node graph: SVG connectors between rows, HTML nodes on top.
 * It is honest about being a diagram, and it still tells the reader something
 * about the system.
 */

/** Icon + accent per node kind. Drives the graph's colour language. */
const KIND_META = {
  client: { icon: 'users', iconClass: 'text-subtle' },
  edge: { icon: 'monitor', iconClass: 'text-accent' },
  api: { icon: 'network', iconClass: 'text-accent' },
  service: { icon: 'server', iconClass: 'text-accent2' },
  data: { icon: 'database', iconClass: 'text-warn' },
  infra: { icon: 'rocket', iconClass: 'text-subtle' },
}

/** Node width per row density (keeps every layer on one line). */
const nodeWidth = (rowLength) =>
  rowLength >= 3 ? 'max-w-[30%]' : rowLength === 2 ? 'max-w-[40%]' : 'max-w-[48%]'

function ArchitectureMiniature({ project }) {
  const rows = project.architecture?.rows ?? []
  const layerCount = rows.length

  // Every child node connects to every parent node in the previous row.
  const edges = []
  rows.forEach((row, rowIndex) => {
    if (rowIndex === 0) return
    row.forEach((_, childIndex) => {
      rows[rowIndex - 1].forEach((__, parentIndex) => {
        edges.push({
          key: `${rowIndex}-${childIndex}-${parentIndex}`,
          from: {
            x: ((parentIndex + 0.5) / rows[rowIndex - 1].length) * 100,
            y: ((rowIndex - 0.5) / layerCount) * 100,
          },
          to: {
            x: ((childIndex + 0.5) / row.length) * 100,
            y: ((rowIndex + 0.5) / layerCount) * 100,
          },
        })
      })
    })
  })

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

      {/* Graph canvas */}
      <div className="grid-field-sm relative min-h-0 flex-1">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
          aria-hidden="true"
        >
          {edges.map((edge) => {
            const midY = (edge.from.y + edge.to.y) / 2
            return (
              <path
                key={edge.key}
                d={`M ${edge.from.x} ${edge.from.y} C ${edge.from.x} ${midY} ${edge.to.x} ${midY} ${edge.to.x} ${edge.to.y}`}
                fill="none"
                stroke="var(--p-line-strong)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            )
          })}
        </svg>

        {rows.map((row, rowIndex) =>
          row.map((node, nodeIndex) => {
            const meta = KIND_META[node.kind] ?? KIND_META.service
            const x = ((nodeIndex + 0.5) / row.length) * 100
            const y = ((rowIndex + 0.5) / layerCount) * 100
            return (
              <div
                key={node.id}
                style={{ left: `${x}%`, top: `${y}%` }}
                className={cn(
                  'absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-md border border-line-strong bg-elevated/90 px-1.5 py-1 shadow-panel backdrop-blur-sm sm:gap-2 sm:px-2 sm:py-1.5',
                  nodeWidth(row.length),
                )}
              >
                <Icon name={meta.icon} className={cn('size-3 shrink-0 sm:size-3.5', meta.iconClass)} />
                <span className="min-w-0 truncate-safe font-mono text-[0.5rem] leading-tight text-fg sm:text-[0.625rem]">
                  {node.label}
                </span>
              </div>
            )
          }),
        )}
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
