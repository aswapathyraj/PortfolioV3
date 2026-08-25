import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn.js'
import { Icon } from '../ui/Icon.jsx'
import { viewport } from '../../animations/transitions.js'

/**
 * Schema diagram.
 *
 * Relationships are rendered as annotated foreign-key rows and cross-highlighted
 * table cards rather than drawn connector lines. That is a deliberate choice:
 * absolutely-positioned lines between grid cells break the moment the grid
 * reflows, and this has to stay readable at 320px. Selecting a table dims the
 * tables it has no relationship with, which conveys the same information as an
 * edge without the fragility.
 */

const keyTone = {
  PK: 'text-accent',
  FK: 'text-accent2',
  UNIQUE: 'text-warn',
}

const keyLabel = {
  PK: 'primary key',
  FK: 'foreign key',
  UNIQUE: 'unique',
}

/** Builds an adjacency map from the FK references declared on columns. */
function buildRelations(tables) {
  const edges = []

  for (const table of tables) {
    for (const column of table.columns) {
      if (column.key !== 'FK' || !column.ref) continue
      const [targetTable, targetColumn] = column.ref.split('.')
      edges.push({
        from: table.name,
        fromColumn: column.name,
        to: targetTable,
        toColumn: targetColumn,
      })
    }
  }

  return edges
}

export function SchemaDiagram({ tables = [], selectedTable, onSelectTable, note }) {
  const relations = useMemo(() => buildRelations(tables), [tables])

  /** Table names connected to `name` in either direction. */
  const relatedTo = useMemo(() => {
    if (!selectedTable) return null
    const set = new Set([selectedTable])
    for (const edge of relations) {
      if (edge.from === selectedTable) set.add(edge.to)
      if (edge.to === selectedTable) set.add(edge.from)
    }
    return set
  }, [selectedTable, relations])

  const selectable = typeof onSelectTable === 'function'

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-2">
        {tables.map((table, index) => {
          const isSelected = selectedTable === table.name
          const isRelated = relatedTo ? relatedTo.has(table.name) : true
          const outgoing = relations.filter((edge) => edge.from === table.name)
          const incoming = relations.filter((edge) => edge.to === table.name)

          return (
            /*
              Two elements on purpose. The outer one owns the scroll reveal,
              which Framer drives through an inline `opacity` style; the inner
              one owns the "unrelated table" dim. Putting both on one element
              means the inline style silently wins and the dim never appears.
            */
            <motion.div
              key={table.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.36, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="min-w-0"
            >
              <div
                className={cn(
                  'overflow-hidden rounded-panel border transition-all duration-300',
                  isSelected
                    ? 'border-accent-line bg-surface shadow-glow'
                    : 'border-line bg-surface',
                  relatedTo && !isRelated && 'opacity-40',
                )}
              >
              {/* Table header */}
              {selectable ? (
                <button
                  type="button"
                  onClick={() => onSelectTable(isSelected ? null : table.name)}
                  aria-pressed={isSelected}
                  className="flex w-full items-center justify-between gap-3 border-b border-line bg-elevated/60 px-3.5 py-2.5 text-left transition-colors duration-200 hover:bg-elevated"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Icon
                      name="sql"
                      className={cn('size-4 shrink-0', isSelected ? 'text-accent' : 'text-subtle')}
                    />
                    <span className="truncate-safe font-mono text-[0.8125rem] font-medium text-fg">
                      {table.name}
                    </span>
                  </span>
                  <span className="mono-label shrink-0 tabular-nums">
                    {table.columns.length} cols
                  </span>
                </button>
              ) : (
                <div className="flex items-center justify-between gap-3 border-b border-line bg-elevated/60 px-3.5 py-2.5">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Icon name="sql" className="size-4 shrink-0 text-subtle" />
                    <span className="truncate-safe font-mono text-[0.8125rem] font-medium text-fg">
                      {table.name}
                    </span>
                  </span>
                  <span className="mono-label shrink-0 tabular-nums">
                    {table.columns.length} cols
                  </span>
                </div>
              )}

              {/* Columns */}
              <ul className="divide-y divide-line/60">
                {table.columns.map((column) => (
                  <li
                    key={column.name}
                    className="flex items-center gap-2 px-3.5 py-2 font-mono text-[0.75rem]"
                  >
                    <span
                      className={cn(
                        'w-6 shrink-0 text-[0.5625rem] uppercase tracking-wider',
                        column.key ? keyTone[column.key] : 'text-transparent',
                      )}
                      title={column.key ? keyLabel[column.key] : undefined}
                    >
                      {column.key === 'UNIQUE' ? 'UQ' : column.key ?? '—'}
                    </span>

                    <span className="min-w-0 flex-1 truncate-safe text-fg/90">{column.name}</span>

                    <span className="shrink-0 text-[0.625rem] uppercase tracking-wide text-subtle">
                      {column.type}
                    </span>

                    {column.ref && selectable ? (
                      <button
                        type="button"
                        onClick={() => onSelectTable(column.ref.split('.')[0])}
                        className="shrink-0 rounded border border-accent2/30 bg-accent2-soft px-1.5 py-0.5 text-[0.5625rem] text-accent2 transition-colors duration-200 hover:border-accent2/60"
                        title={`References ${column.ref}`}
                      >
                        → {column.ref}
                      </button>
                    ) : column.ref ? (
                      <span className="shrink-0 rounded border border-accent2/30 bg-accent2-soft px-1.5 py-0.5 text-[0.5625rem] text-accent2">
                        → {column.ref}
                      </span>
                    ) : column.note ? (
                      <span className="hidden shrink-0 text-[0.5625rem] text-subtle sm:inline">
                        {column.note}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>

              {/* Relationship summary */}
              {isSelected && (outgoing.length > 0 || incoming.length > 0) ? (
                <div className="border-t border-line bg-sunken px-3.5 py-2.5">
                  <p className="mono-label mb-1.5">Relationships</p>
                  <ul className="flex flex-col gap-1">
                    {outgoing.map((edge) => (
                      <li key={`out-${edge.fromColumn}`} className="font-mono text-[0.6875rem] text-muted">
                        <span className="text-accent2">{edge.fromColumn}</span> →{' '}
                        {edge.to}.{edge.toColumn}
                      </li>
                    ))}
                    {incoming.map((edge) => (
                      <li key={`in-${edge.from}-${edge.fromColumn}`} className="font-mono text-[0.6875rem] text-muted">
                        {edge.from}.<span className="text-accent2">{edge.fromColumn}</span> → {edge.toColumn}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Key legend + note */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-inset border border-line bg-sunken px-3.5 py-2.5">
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {Object.entries(keyLabel).map(([key, label]) => (
            <li key={key} className="flex items-center gap-1.5">
              <span className={cn('font-mono text-[0.5625rem] uppercase', keyTone[key])}>
                {key === 'UNIQUE' ? 'UQ' : key}
              </span>
              <span className="mono-label">{label}</span>
            </li>
          ))}
        </ul>
        {note ? <p className="text-[0.6875rem] text-subtle">{note}</p> : null}
      </div>
    </div>
  )
}

export default SchemaDiagram
