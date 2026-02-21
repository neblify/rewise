'use client';

import Image from 'next/image';
import Link from 'next/link';
import { WaveDivider } from '@/components/playful';

export function Footer() {
  return (
    <>
      <WaveDivider color="var(--navy)" flip />
      <footer className="gradient-navy text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="mt-8 md:order-1 md:mt-0 flex items-center gap-2">
            <div className="relative inline-block shrink-0">
              {/* Halo scaled to footer logo (h-28 vs hero h-60 ≈ 0.47); same ratio: -m-6, -translate-y-[18%] */}
              <div
                aria-hidden
                className="absolute inset-0 -m-6 -translate-y-[18%]"
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
                  width={320}
                  height={112}
                  className="h-28 w-auto"
                />
              </div>
            </div>
            <p className="ml-8 shrink-0 text-center text-xs leading-5 text-white/60">
              &copy; {new Date().getFullYear()} ReWise. All rights reserved.
            </p>
          </div>
          <div className="flex justify-center space-x-6 md:order-2">
            <Link
              href="/privacy"
              className="text-white/70 hover:text-white text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-white/70 hover:text-white text-sm transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/contact"
              className="text-white/70 hover:text-white text-sm transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
