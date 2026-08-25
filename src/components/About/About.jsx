import { motion } from 'framer-motion'
import { aboutIntro, focusAreas } from '../../data/about.js'
import { Section, SectionHeader } from '../ui/Section.jsx'
import { Panel } from '../ui/Panel.jsx'
import { Icon } from '../ui/Icon.jsx'
import { Reveal } from '../ui/Reveal.jsx'
import { Lifecycle } from './Lifecycle.jsx'
import { staggerContainer, staggerItem } from '../../animations/variants.js'
import { viewport } from '../../animations/transitions.js'

export function About() {
  return (
    <Section id="about">
      <SectionHeader
        index="01"
        eyebrow="About"
        title="I work from the data outward."
        description="Schema first, then the API, then the interface. When I get that order wrong I feel it later — usually as a component holding state the server should have owned."
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
        {/* Narrative */}
        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="min-w-0"
        >
          {aboutIntro.map((paragraph, index) => (
            <motion.p
              key={index}
              variants={staggerItem}
              className={index === 0
                ? 'text-pretty text-[1.0625rem] leading-relaxed text-fg sm:text-[1.125rem]'
                : 'mt-5 text-pretty text-[0.9375rem] leading-relaxed text-muted sm:text-base'}
            >
              {paragraph}
            </motion.p>
          ))}
        </motion.div>

        {/* Focus areas */}
        <motion.ul
          variants={staggerContainer(0.07)}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="grid grid-cols-1 min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-1"
        >
          {focusAreas.map((area) => (
            <motion.li key={area.id} variants={staggerItem}>
              <Panel className="group h-full p-4 transition-colors duration-300 hover:border-line-strong">
                <div className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border border-line bg-sunken text-subtle transition-colors duration-300 group-hover:border-accent-line group-hover:text-accent">
                    <Icon name={area.icon} className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-[0.9375rem] text-fg">{area.label}</h3>
                    <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">
                      {area.detail}
                    </p>
                  </div>
                </div>
              </Panel>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      {/* Lifecycle */}
      <Reveal className="mt-12 sm:mt-16">
        <Lifecycle />
      </Reveal>
    </Section>
  )
}

export default About
