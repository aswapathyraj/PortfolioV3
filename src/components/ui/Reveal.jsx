import { motion } from 'framer-motion'
import { cn } from '../../utils/cn.js'
import { fadeUp } from '../../animations/variants.js'
import { viewport } from '../../animations/transitions.js'

/**
 * Scroll-reveal wrapper.
 *
 * One place to change how the whole site enters. Movement is stripped
 * automatically under `prefers-reduced-motion` by the global MotionConfig, so
 * this leaves a plain fade rather than nothing at all.
 */
export function Reveal({
  as = 'div',
  distance = 16,
  delay = 0,
  className,
  children,
  once = true,
  ...rest
}) {
  const Component = motion[as] ?? motion.div

  return (
    <Component
      variants={fadeUp(distance, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...viewport, once }}
      className={cn(className)}
      {...rest}
    >
      {children}
    </Component>
  )
}

export default Reveal
