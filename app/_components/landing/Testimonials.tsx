'use client';

import { motion } from 'motion/react';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote:
      'ReWise cut my grading time in half. The AI feedback is surprisingly nuanced and my students actually read it.',
    author: 'Sarah Chen',
    role: 'Math Teacher, Lincoln High',
  },
  {
    quote:
      'Finally an app that works on any device. My kids practice on the bus and I can see their progress at a glance.',
    author: 'James Okonkwo',
    role: 'Parent',
  },
];

export function Testimonials() {
  return (
    <section className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-base font-semibold leading-7 gradient-text">
            What people say
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Testimonials
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-14 overflow-x-auto overflow-y-hidden pb-4 scroll-smooth sm:mt-16 snap-x snap-mandatory"
        >
          <div className="flex w-max gap-6 px-1 sm:gap-8 sm:px-2">
            {testimonials.map((t, index) => (
              <motion.article
                key={t.author}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="min-w-[300px] shrink-0 snap-center rounded-2xl border border-border/50 bg-muted/30 p-8 shadow-sm sm:min-w-[360px] sm:p-10"
              >
                <Quote className="h-10 w-10 text-primary/50" aria-hidden />
                <blockquote className="mt-4 text-lg font-medium leading-relaxed text-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <footer className="mt-6">
                  <cite className="not-italic">
                    <span className="block font-semibold text-foreground">
                      {t.author}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {t.role}
                    </span>
                  </cite>
                </footer>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
