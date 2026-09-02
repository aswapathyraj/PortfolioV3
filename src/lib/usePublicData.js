import { useSyncExternalStore } from 'react'
import {
  getPublicDataVersion,
  subscribePublicData,
  getSite,
  getSiteSeo,
} from './publicData.js'

/**
 * Subscribes the calling component to the public data store. The version bumps
 * whenever the live API data is hydrated, which triggers a re-render so the
 * section re-reads the (mutated) collections through the accessors.
 *
 * Usage: call this at the top of any section component, then read data through
 * the getX() accessors from src/lib/publicData.js.
 */
export function usePublicData() {
  return useSyncExternalStore(
    subscribePublicData,
    getPublicDataVersion,
    // Server/static snapshot is the version before any hydration (0), so the
    // initial static data always renders on first paint.
    () => 0,
  )
}

/**
 * Live site identity + SEO, merged over the static config. Re-renders when the
 * profile or seo API data hydrates. Reads through the store so header, footer,
 * and the <Seo/> tag reflect admin changes instead of the frozen import.
 */
export function useSite() {
  usePublicData()
  const site = getSite()
  const seo = { ...(site.seo ?? {}), ...(getSiteSeo() ?? {}) }
  return { site, seo }
}