/** Small formatting helpers shared across sections. */

/** 1234 → "1.2k". Leaves values under 1000 untouched. */
export function compactNumber(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  if (Math.abs(n) < 1000) return String(n)
  if (Math.abs(n) < 1_000_000) {
    return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
  }
  return `${(n / 1_000_000).toFixed(1)}M`
}

/** ISO timestamp → "12 Aug 2026". Returns '' for anything unparseable. */
export function formatDate(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** ISO timestamp → "3 days ago". */
export function relativeTime(iso) {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''

  const seconds = Math.round((Date.now() - then) / 1000)
  const units = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3600],
    ['minute', 60],
  ]

  for (const [unit, secondsPerUnit] of units) {
    const amount = Math.floor(seconds / secondsPerUnit)
    if (amount >= 1) {
      return `${amount} ${unit}${amount === 1 ? '' : 's'} ago`
    }
  }
  return 'just now'
}

/** Stable JSON for the API explorer's response pane. */
export function prettyJson(value) {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return '/* value could not be serialised */'
  }
}

/** Truncates without cutting mid-word. */
export function truncate(text = '', max = 140) {
  if (text.length <= max) return text
  const clipped = text.slice(0, max)
  const lastSpace = clipped.lastIndexOf(' ')
  return `${clipped.slice(0, lastSpace > max * 0.6 ? lastSpace : max).trimEnd()}…`
}
