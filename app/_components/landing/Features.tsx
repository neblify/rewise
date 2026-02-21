'use client';

import { motion } from 'framer-motion';
import {
  Brain,
  ShieldCheck,
  Zap,
  Layout,
  Users,
  BarChart3,
} from 'lucide-react';
import { WaveDivider } from '@/components/playful';

const featureColors = [
  'bg-violet-light text-primary',
  'bg-coral-light text-coral',
  'bg-sky-light text-[#0C7FA8]',
  'bg-mint-light text-mint',
  'bg-sunshine-light text-[#B8860B]',
  'bg-violet-light text-primary',
];

const features = [
  {
    name: 'AI-Powered Grading',
    description:
      'Instant evaluation for objective questions and smart AI analysis for subjective answers.',
    icon: Brain,
  },
  {
    name: 'Role-Based Access',
    description:
      'Tailored experiences for Students, Teachers, and Parents to ensure everyone gets exactly what they need.',
    icon: Users,
  },
  {
    name: 'Smart Analytics',
    description:
      'Deep insights into performance with detailed feedback on weak areas to help students improve faster.',
    icon: BarChart3,
  },
  {
    name: 'Secure & Reliable',
    description:
      'Enterprise-grade security to keep your data safe and accessible.',
    icon: ShieldCheck,
  },
  {
    name: 'Device-agnostic',
    description:
      'ReWise works with any device — desktop, tablet, or mobile — ensuring a seamless, device‑agnostic experience everywhere.',
    icon: Zap,
  },
  {
    name: 'Easy Management',
    description:
      'Teachers can easily create tests, manage assignments, and track class progress in one place.',
    icon: Layout,
  },
];

export function Features() {
  return (
    <>
      <WaveDivider color="var(--background)" />
      <div className="relative bg-background py-24 sm:py-32">
        <div className="section-grid absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 gradient-text">
              Why Choose ReWise?
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to excel in your exams
            </p>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              We combine cutting-edge technology with educational expertise to
              provide the best learning environment.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative pl-16"
                >
                  <dt className="text-base font-semibold leading-7 text-foreground">
                    <div
                      className={`absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-xl ${featureColors[index]}`}
                    >
                      <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-muted-foreground">
                    {feature.description}
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}
