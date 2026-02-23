'use client';

import { motion, useScroll, useTransform, useInView } from 'motion/react';
import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { GradientButton, GradientText } from '@/components/playful';

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 };

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, -80]);

  return (
    <motion.section
      ref={sectionRef}
      style={{ y }}
      className="relative overflow-hidden gradient-navy text-white"
    >
      <div className="mx-auto max-w-7xl pb-16 pt-8 sm:pb-24 sm:pt-12 lg:pb-32 lg:pt-16">
        <div className="relative mx-auto max-w-7xl px-4 sm:static sm:px-6 lg:px-8">
          <div className="sm:max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ ...spring, delay: 0 }}
            >
              <div className="relative mb-6 inline-block">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -m-12 -translate-y-[18%]"
                >
                  <div
                    className="absolute inset-0 rounded-full opacity-90 blur-3xl"
                    style={{
                      background:
                        'radial-gradient(ellipse 80% 70% at 50% 50%, var(--sky) 0%, var(--coral) 45%, transparent 70%)',
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-full opacity-75 blur-[40px]"
                    style={{
                      background:
                        'radial-gradient(circle at 50% 50%, var(--sky-light) 0%, transparent 65%)',
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-full opacity-95 blur-xl"
                    style={{
                      background:
                        'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.9) 0%, var(--sky-light) 25%, transparent 50%)',
                    }}
                  />
                </div>
                <div className="relative">
                  <Image
                    src="/logo.png"
                    alt="ReWise"
                    width={240}
                    height={240}
                    priority
                    className="h-60 w-auto"
                  />
                </div>
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ ...spring, delay: 0.08 }}
                className="text-4xl font-bold tracking-tight sm:text-6xl"
              >
                Master Your Exams with{' '}
                <GradientText
                  as="span"
                  className="text-4xl sm:text-6xl font-bold"
                >
                  AI-Powered Intelligence
                </GradientText>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ ...spring, delay: 0.16 }}
                className="mt-6 text-xl text-white/70"
              >
                Personalized learning for Students, smart tools for Teachers,
                and insights for Parents. The all-in-one platform for exam
                success.
              </motion.p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ ...spring, delay: 0.24 }}
              className="mt-10 gap-4 flex flex-col sm:flex-row"
            >
              <GradientButton
                asChild
                size="xl"
                className="px-8 py-6 text-base font-bold md:text-lg"
              >
                <Link href="/sign-up">
                  Start Learning Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </GradientButton>
              <GradientButton
                asChild
                size="xl"
                className="px-8 py-6 text-base font-bold md:text-lg bg-white/10 hover:bg-white/20 border border-white/20 shadow-none hover:shadow-none [background-image:none] hover:brightness-100"
              >
                <Link href="/sign-in">Welcome Back</Link>
              </GradientButton>
            </motion.div>
          </div>
          <div className="mt-10 md:mt-0 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ ...spring, delay: 0.2 }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="relative h-full w-full lg:h-full flex justify-center items-center cursor-default"
            >
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 1, -1, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative"
              >
                <Image
                  src="/ReWise_Mascot.gif"
                  alt="ReWise mascot"
                  width={384}
                  height={384}
                  unoptimized
                  className="h-64 w-auto object-contain md:h-80 lg:h-96 drop-shadow-2xl"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
