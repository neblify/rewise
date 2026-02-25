'use client';

import { motion, useInView } from 'motion/react';
import { animate } from 'motion';
import { useRef, useEffect, useState } from 'react';
import { Users, School, Activity } from 'lucide-react';

const stats = [
  { value: 1000, suffix: '', label: 'Students', icon: Users },
  { value: 50, suffix: '', label: 'Schools', icon: School },
  { value: 99, suffix: '%', label: 'Uptime', icon: Activity },
];

const STAGGER_MS = 200;
const DURATION_S = 2;

function AnimatedStat({
  value,
  suffix,
  label,
  icon: Icon,
  index,
  inView,
}: {
  value: number;
  suffix: string;
  label: string;
  icon: React.ElementType;
  index: number;
  inView: boolean;
}) {
  const [display, setDisplay] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView) {
      hasAnimated.current = false;
      setDisplay(0);
      return;
    }
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    const delay = index * STAGGER_MS;
    const controls = animate(0, value, {
      duration: DURATION_S,
      delay: delay / 1000,
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, value, index]);

  return (
    <div className="flex flex-col items-center gap-2">
      <Icon className="h-8 w-8 text-primary" aria-hidden />
      <span className="text-3xl font-bold tabular-nums text-foreground sm:text-4xl">
        {display}
        {suffix}
      </span>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

export function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <section id="stats" ref={ref} className="bg-muted/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-base font-semibold leading-7 gradient-text">
            Trusted by educators
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            ReWise in numbers
          </p>
        </motion.div>
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col items-center rounded-2xl border border-border/50 bg-background/80 p-8 shadow-sm backdrop-blur sm:p-10"
            >
              <AnimatedStat
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                icon={stat.icon}
                index={index}
                inView={inView}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
