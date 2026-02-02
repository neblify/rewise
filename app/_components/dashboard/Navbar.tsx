'use client';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

interface NavbarProps {
  variant?: 'student' | 'teacher';
}

export default function Navbar({ variant = 'student' }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-indigo-600">
                NIOS Prep
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-4">
              {variant === 'student' ? (
                <>
                  <Link
                    href="/student"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/student/results"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    My Results
                  </Link>
                  <Link
                    href="/student/profile"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/teacher"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/teacher/create-test"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Create Test
                  </Link>
                </>
              )}
            </div>
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
