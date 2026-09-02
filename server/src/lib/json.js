/**
 * JSON storage helpers.
 *
 * The relational schema stores structured content as JSON text so it stays
 * portable across SQLite and PostgreSQL. These two helpers keep every read and
 * write consistent and safe (never throw on corrupt data).
 */

/** Encode a value for storage. Arrays/objects become JSON text; null stays null. */
export function j(value) {
  if (value === undefined || value === null) return null
  return JSON.stringify(value)
}

/** Decode a stored value. Invalid text degrades to `fallback` instead of throwing. */
export function jparse(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback ?? null
  try {
    return JSON.parse(value)
  } catch {
    return fallback ?? null
  }
}