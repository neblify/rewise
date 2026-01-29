'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl pb-16 pt-20 sm:pb-24 sm:pt-24 lg:pb-32 lg:pt-32">
        <div className="relative mx-auto max-w-7xl px-4 sm:static sm:px-6 lg:px-8">
          <div className="sm:max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-600 w-fit mb-4">
                🚀 Smart Prep for NIOS Exams
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Master Your Exams with AI-Powered Intelligence
              </h1>
              <p className="mt-4 text-xl text-gray-500">
                Personalized learning for Students, smart tools for Teachers,
                and insights for Parents. The all-in-one platform for NIOS
                success.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 gap-4 flex flex-col sm:flex-row"
            >
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Start Learning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 md:py-4 md:text-lg hover:border-gray-300 transition-all"
              >
                Welcome Back
              </Link>
            </motion.div>
          </div>
          <div className="mt-10 md:mt-0 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="relative h-full w-full lg:h-full"
            >
              {/* Abstract decorative shapes */}
              <div
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-3xl opacity-50"
              />
              <div
                aria-hidden="true"
                className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-50"
              />

              <div className="relative flex justify-center items-center h-full">
                {/* Placeholder for a hero image or illustration - using a constructed UI mockup for now */}
                <div className="relative bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full mx-4">
                  <div className="flex items-center border-b border-gray-100 pb-4 mb-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-semibold text-gray-900">
                        Psychology Test
                      </div>
                      <div className="text-xs text-gray-500">
                        AI Analysis in progress...
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-gray-100 rounded-full w-3/4"></div>
                    <div className="h-2 bg-gray-100 rounded-full w-full"></div>
                    <div className="h-2 bg-gray-100 rounded-full w-5/6"></div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <div className="flex-1 bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-green-600">A</div>
                      <div className="text-xs text-green-700">Grade</div>
                    </div>
                    <div className="flex-1 bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-blue-600">92%</div>
                      <div className="text-xs text-blue-700">Accuracy</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
