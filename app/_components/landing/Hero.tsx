'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { GradientButton, GradientText } from '@/components/playful';

export function Hero() {
  return (
    <div className="relative overflow-hidden gradient-navy text-white">
      <div className="mx-auto max-w-7xl pb-16 pt-8 sm:pb-24 sm:pt-12 lg:pb-32 lg:pt-16">
        <div className="relative mx-auto max-w-7xl px-4 sm:static sm:px-6 lg:px-8">
          <div className="sm:max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
            >
              <div className="relative mb-6 inline-block">
                {/* Light-compatible halo: whole glow shifted up above the bulb */}
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
                  {/* Bright center so the bulb looks lit */}
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
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                Master Your Exams with{' '}
                <GradientText
                  as="span"
                  className="text-4xl sm:text-6xl font-bold"
                >
                  AI-Powered Intelligence
                </GradientText>
              </h1>
              <p className="mt-6 text-xl text-white/70">
                Personalized learning for Students, smart tools for Teachers,
                and insights for Parents. The all-in-one platform for exam
                success.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.2,
                type: 'spring',
                stiffness: 100,
              }}
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
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, type: 'spring', stiffness: 80 }}
              className="relative h-full w-full lg:h-full"
            >
              <div className="relative flex justify-center items-center h-full">
                <Card className="relative bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-2xl border-white/10 max-w-md w-full mx-4">
                  <div className="flex items-center border-b border-white/10 pb-4 mb-4">
                    <div className="h-10 w-10 rounded-full bg-violet-light flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-semibold text-white">
                        Psychology Test
                      </div>
                      <div className="text-xs text-white/60">
                        AI Analysis in progress...
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-white/10 rounded-full w-3/4"></div>
                    <div className="h-2 bg-white/10 rounded-full w-full"></div>
                    <div className="h-2 bg-white/10 rounded-full w-5/6"></div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <div className="flex-1 bg-mint-light/20 rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-mint">A</div>
                      <div className="text-xs text-mint/80">Grade</div>
                    </div>
                    <div className="flex-1 bg-sky-light/20 rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-sky">92%</div>
                      <div className="text-xs text-sky/80">Accuracy</div>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
