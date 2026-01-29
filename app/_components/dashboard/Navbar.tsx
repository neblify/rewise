'use client';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-indigo-600">
                NIOS Prep
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'h-10 w-10',
                },
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
