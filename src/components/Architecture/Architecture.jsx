import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { systemArchitecture, nodeKinds } from '../../data/architecture.js'
import { Section, SectionHeader } from '../ui/Section.jsx'
import { Icon } from '../ui/Icon.jsx'
import { Tag } from '../ui/Tag.jsx'
import { FlowDiagram, FlowLegend } from './FlowDiagram.jsx'
import { swap } from '../../animations/variants.js'

/**
 * System architecture section.
 *
 * Selecting a layer shows what it owns and what breaks without it — the point
 * being that a diagram is only useful if each box has a defined
 * responsibility.
 */
export function Architecture() {
  const nodes = useMemo(() => systemArchitecture.rows.flat(), [])
  const [selectedId, setSelectedId] = useState(nodes[1]?.id ?? nodes[0].id)

  const selected = nodes.find((node) => node.id === selectedId) ?? nodes[0]
  const kindLabel = nodeKinds[selected.kind]?.label ?? selected.kind

  return (
    <Section id="architecture">
      <SectionHeader
        index="05"
        eyebrow="System Architecture"
        title="Every box has a job it owns."
        description="The shape both full-stack projects share. Select a layer to see its responsibility, what it is built with, and the failure mode when that boundary is not respected."
        actions={<FlowLegend />}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-6">
        <div className="min-w-0 overflow-hidden rounded-panel border border-line bg-surface">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
            <span className="mono-label">{systemArchitecture.title}</span>
            <span className="mono-label hidden sm:inline">
              {nodes.length} layers · request flows down
            </span>
          </div>

          <FlowDiagram
            rows={systemArchitecture.rows}
            selectedId={selectedId}
            onSelect={(node) => setSelectedId(node.id)}
          />

          <p className="border-t border-line px-4 py-3 text-[0.78125rem] text-subtle sm:px-5">
            {systemArchitecture.note}
          </p>
        </div>

        {/* Layer detail */}
        <aside
          className="min-w-0 lg:sticky lg:top-28 lg:self-start"
          aria-live="polite"
        >
          <div className="overflow-hidden rounded-panel border border-line bg-surface">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <span className="mono-label">Layer detail</span>
              <Tag tone="ghost">{kindLabel}</Tag>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selected.id}
                variants={swap}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="p-4 sm:p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg border border-accent-line bg-accent-soft text-accent">
                    <Icon name={selected.icon} className="size-[1.15rem]" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate-safe font-display text-lg text-fg">{selected.label}</h3>
                    <p className="mono-label mt-0.5 truncate-safe">{selected.sub}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mono-label mb-2">Owns</p>
                  <p className="text-pretty text-[0.8125rem] leading-relaxed text-muted">
                    {selected.responsibility}
                  </p>
                </div>

                {selected.tech?.length ? (
                  <div className="mt-4">
                    <p className="mono-label mb-2">Built with</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.tech.map((item) => (
                        <Tag key={item}>{item}</Tag>
                      ))}
                    </div>
                  </div>
                ) : null}

                {selected.risk ? (
                  <div className="mt-5 rounded-inset border border-warn/25 bg-warn/[0.06] p-3.5">
                    <p className="mono-label mb-1.5 flex items-center gap-1.5 text-warn">
                      <Icon name="warning" className="size-3" />
                      If this boundary slips
                    </p>
                    <p className="text-[0.78125rem] leading-relaxed text-muted">{selected.risk}</p>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </Section>
  )
}

export default Architecture
