import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Copy-to-clipboard with a self-resetting "copied" flag and a fallback for
 * insecure contexts where navigator.clipboard is unavailable.
 */
export function useCopyToClipboard(resetAfter = 1800) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = useCallback(
    async (text) => {
      clearTimeout(timer.current)
      setError(null)

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text)
        } else {
          // http:// or an older browser — the deprecated path still works here.
          const area = document.createElement('textarea')
          area.value = text
          area.setAttribute('readonly', '')
          area.style.position = 'fixed'
          area.style.opacity = '0'
          document.body.appendChild(area)
          area.select()
          document.execCommand('copy')
          document.body.removeChild(area)
        }

        setCopied(true)
        timer.current = setTimeout(() => setCopied(false), resetAfter)
        return true
      } catch {
        setError('Copy failed — select the text and copy manually.')
        return false
      }
    },
    [resetAfter],
  )

  return { copy, copied, error }
}
