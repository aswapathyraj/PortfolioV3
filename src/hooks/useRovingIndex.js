import { useCallback, useRef } from 'react'

/**
 * Roving-tabindex keyboard navigation for a list of options.
 *
 * Implements the ARIA tabs pattern once — arrow keys move selection, Home/End
 * jump to the ends — and is reused by the lifecycle strip, engineering steps,
 * architecture layers, and API endpoint list, so keyboard behaviour is identical
 * in all of them.
 *
 * @param count        number of options
 * @param selected     currently selected index
 * @param onSelect     called with the next index
 * @param orientation  'horizontal' | 'vertical' | 'both'
 */
export function useRovingIndex({ count, selected, onSelect, orientation = 'both', loop = true }) {
  const itemRefs = useRef([])

  const setItemRef = useCallback(
    (index) => (element) => {
      itemRefs.current[index] = element
    },
    [],
  )

  const focusIndex = useCallback((index) => {
    itemRefs.current[index]?.focus()
  }, [])

  const move = useCallback(
    (delta) => {
      let next = selected + delta

      if (next < 0) next = loop ? count - 1 : 0
      if (next > count - 1) next = loop ? 0 : count - 1

      onSelect(next)
      focusIndex(next)
    },
    [selected, count, loop, onSelect, focusIndex],
  )

  const onKeyDown = useCallback(
    (event) => {
      const horizontal = orientation === 'horizontal' || orientation === 'both'
      const vertical = orientation === 'vertical' || orientation === 'both'

      switch (event.key) {
        case 'ArrowRight':
          if (!horizontal) return
          event.preventDefault()
          move(1)
          break
        case 'ArrowLeft':
          if (!horizontal) return
          event.preventDefault()
          move(-1)
          break
        case 'ArrowDown':
          if (!vertical) return
          event.preventDefault()
          move(1)
          break
        case 'ArrowUp':
          if (!vertical) return
          event.preventDefault()
          move(-1)
          break
        case 'Home':
          event.preventDefault()
          onSelect(0)
          focusIndex(0)
          break
        case 'End':
          event.preventDefault()
          onSelect(count - 1)
          focusIndex(count - 1)
          break
        default:
          break
      }
    },
    [orientation, move, onSelect, focusIndex, count],
  )

  /** Spread onto each option element. */
  const getItemProps = useCallback(
    (index) => ({
      ref: setItemRef(index),
      role: 'tab',
      'aria-selected': selected === index,
      tabIndex: selected === index ? 0 : -1,
      onKeyDown,
    }),
    [setItemRef, selected, onKeyDown],
  )

  return { getItemProps, onKeyDown, focusIndex }
}
