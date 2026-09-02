import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from '../../hooks/useTheme.jsx'
import { useSite } from '../../lib/usePublicData.js'
import { Icon } from '../ui/Icon.jsx'
import { cn } from '../../utils/cn.js'

/**
 * Light / dark toggle.
 *
 * Flipping `data-theme` on <html> is the whole implementation — every colour in
 * the design system resolves through palette variables scoped to that
 * attribute, so no component needs theme-aware classes.
 */
export function ThemeToggle({ className }) {
  const { site } = useSite()
  const { theme, toggleTheme } = useTheme()

  if (!site.features.themeToggle) return null

  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={cn(
        'relative flex size-9 items-center justify-center overflow-hidden rounded-lg text-muted',
        'transition-colors duration-200 hover:bg-elevated hover:text-fg',
        className,
      )}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -60, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 60, scale: 0.7 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inline-flex"
        >
          <Icon name={theme === 'dark' ? 'moon' : 'sun'} className="size-[1.05rem]" />
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

export default ThemeToggle
