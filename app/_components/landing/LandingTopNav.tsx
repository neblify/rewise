'use client';

import Link from 'next/link';

export function LandingTopNav() {
  return (
    <nav
      className="fixed left-0 right-0 top-0 z-50 flex min-h-[calc(30px+0.5in)] items-center justify-end bg-transparent pt-[0.5in] pb-3"
      aria-label="Landing navigation"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-end gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/#features"
          className="text-sm text-white/90 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 rounded"
        >
          Features
        </Link>
        <Link
          href="/#testimonials"
          className="text-sm text-white/90 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 rounded"
        >
          Testimonials
        </Link>
        <Link
          href="/about"
          className="text-sm text-white/90 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 rounded"
        >
          About Us
        </Link>
        <Link
          href="/contact"
          className="text-sm text-white/90 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 rounded"
        >
          Contact
        </Link>
      </div>
    </nav>
  );
}
