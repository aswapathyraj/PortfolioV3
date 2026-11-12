import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getRealProjects } from '../../lib/publicData.js'
import { usePublicData } from '../../lib/usePublicData.js'
import { Section, SectionHeader } from '../ui/Section.jsx'
import { Icon } from '../ui/Icon.jsx'
import { CodeBlock } from '../ui/CodeBlock.jsx'
import { EmptyState } from '../ui/EmptyState.jsx'
import { SchemaDiagram } from './SchemaDiagram.jsx'
import { cn } from '../../utils/cn.js'
import { swap } from '../../animations/variants.js'

/**
 * Database design section.
 *
 * Shows the schema shape of each project that has one. These are design
 * illustrations — column types are simplified for readability, and no
 * credentials, connection strings, or real data appear anywhere.
 */

/** Illustrative query per project — the kind of join the schema is built for. */
const exampleQueries = {
  phlox: `-- Highest bid per open auction, with the artwork and its artist.
SELECT
  a.id             AS auction_id,
  aw.title         AS artwork,
  u.name           AS artist,
  a.starting_price,
  MAX(b.amount)    AS highest_bid,
  COUNT(b.id)      AS bid_count
FROM auctions a
JOIN artworks aw ON aw.id = a.artwork_id
JOIN users    u  ON u.id  = aw.user_id
LEFT JOIN bids b ON b.auction_id = a.id
WHERE a.ends_at > CURRENT_TIMESTAMP
GROUP BY a.id
ORDER BY highest_bid DESC;`,

  'qr-food-ordering': `-- Revenue by day, using the price captured at order time.
SELECT
  DATE(o.created_at)              AS day,
  COUNT(DISTINCT o.id)            AS orders,
  SUM(oi.quantity * oi.unit_price) AS revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = 'served'
GROUP BY day
ORDER BY day DESC;`,
}

export function Database() {
  usePublicData()
  const withSchema = getRealProjects().filter((project) => project.database?.tables?.length)
  const [projectIndex, setProjectIndex] = useState(0)
  const [selectedTable, setSelectedTable] = useState(null)

  if (withSchema.length === 0) {
    return (
      <Section id="database">
        <SectionHeader index="07" eyebrow="Database" title="Database Design" />
        <EmptyState
          icon="database"
          title="No schemas documented yet"
          description="Add a `database` block to a project in src/data/projects.js to have its schema rendered here."
        />
      </Section>
    )
  }

  const project = withSchema[projectIndex]
  const query = exampleQueries[project.slug]

  const handleProjectChange = (index) => {
    setProjectIndex(index)
    setSelectedTable(null)
  }

  return (
    <Section id="database">
      <SectionHeader
        index="07"
        eyebrow="Database Design"
        title="Schemas, not just tables."
        description="Select a table to see what it relates to. These are design illustrations of real project schemas — simplified types, no data, no credentials."
        actions={
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Project schemas">
            {withSchema.map((item, index) => (
              <button
                key={item.slug}
                role="tab"
                aria-selected={projectIndex === index}
                onClick={() => handleProjectChange(index)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-[0.8125rem] font-medium transition-colors duration-200',
                  projectIndex === index
                    ? 'border-accent-line bg-accent-soft text-accent'
                    : 'border-line bg-surface text-muted hover:border-line-strong hover:text-fg',
                )}
              >
                {item.title}
              </button>
            ))}
          </div>
        }
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={project.slug} variants={swap} initial="hidden" animate="visible" exit="exit">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-6">
            {/* Schema */}
            <div className="min-w-0">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="mono-label flex items-center gap-1.5">
                  <Icon name="database" className="size-3.5" />
                  {project.title} schema
                </span>
                <span className="mono-label tabular-nums">
                  {project.database.tables.length} tables
                </span>
              </div>

              <SchemaDiagram
                tables={project.database.tables}
                selectedTable={selectedTable}
                onSelectTable={setSelectedTable}
                note={project.database.note}
              />
            </div>

            {/* Query + design notes */}
            <aside className="flex min-w-0 flex-col gap-4">
              {query ? (
                <div>
                  <p className="mono-label mb-3 flex items-center gap-1.5">
                    <Icon name="sql" className="size-3.5" />
                    Example query
                  </p>
                  <CodeBlock code={query} language="sql" filename={`${project.slug}.sql`} maxHeight="20rem" />
                </div>
              ) : null}

              <div className="rounded-panel border border-line bg-surface p-4">
                <p className="mono-label mb-3">Design decisions</p>
                <ul className="flex flex-col gap-3">
                  {project.learnings.slice(0, 3).map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Icon name="checkCircle" className="mt-0.5 size-3.5 shrink-0 text-accent/70" />
                      <span className="text-[0.8125rem] leading-relaxed text-muted">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="flex items-start gap-2 rounded-inset border border-line bg-sunken px-3.5 py-3 text-[0.75rem] leading-relaxed text-subtle">
                <Icon name="info" className="mt-0.5 size-3.5 shrink-0" />
                Illustrative schema for demonstration. No production data, connection details, or
                credentials are represented here.
              </p>
            </aside>
          </div>
        </motion.div>
      </AnimatePresence>
    </Section>
  )
}

export default Database
