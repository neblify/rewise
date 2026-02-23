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
            <Image
              src="/logo.png"
              alt="ReWise"
              width={160}
              height={56}
              className="h-14 w-auto"
            />
            <p className="text-center text-xs leading-5 text-white/60">
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
