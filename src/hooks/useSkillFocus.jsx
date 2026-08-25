import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const SkillFocusContext = createContext(null)

/**
 * Cross-section skill focus.
 *
 * Selecting a technology in the tech explorer is not just a local tab change —
 * the Projects section reads the same value and marks the cards that actually
 * use it. Keeping it in context is what makes "click a skill, see the work" a
 * real link between two sections rather than two separate lists.
 */
export function SkillFocusProvider({ children }) {
  const [focusedSkill, setFocusedSkill] = useState(null)

  const focusSkill = useCallback((skill) => setFocusedSkill(skill ?? null), [])
  const clearFocus = useCallback(() => setFocusedSkill(null), [])

  const value = useMemo(
    () => ({ focusedSkill, focusSkill, clearFocus }),
    [focusedSkill, focusSkill, clearFocus],
  )

  return <SkillFocusContext.Provider value={value}>{children}</SkillFocusContext.Provider>
}

/** Safe outside the provider — returns a no-op shape so components stay usable. */
export function useSkillFocus() {
  return (
    useContext(SkillFocusContext) ?? {
      focusedSkill: null,
      focusSkill: () => {},
      clearFocus: () => {},
    }
  )
}
