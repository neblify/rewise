'use client';

import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';

interface NavbarProps {
  variant?: 'student' | 'teacher' | 'parent' | 'admin';
}

export default function Navbar({ variant = 'student' }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b-2 border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="ReWise"
                width={240}
                height={80}
                className="h-20 w-auto"
                priority
              />
            </Link>
            <div className="hidden md:flex items-center gap-4">
              {variant === 'student' ? (
                <>
                  <NavLink href="/student">Dashboard</NavLink>
                  <NavLink href="/student/results">My Results</NavLink>
                  <NavLink href="/student/profile">Profile</NavLink>
                </>
              ) : variant === 'teacher' ? (
                <>
                  <NavLink href="/dashboard">Dashboard</NavLink>
                  <NavLink href="/teacher">All Tests</NavLink>
                  <NavLink href="/teacher/questions">Question Bank</NavLink>
                  <NavLink href="/teacher/create-test">Create Test</NavLink>
                </>
              ) : (
                <>
                  <NavLink href={variant === 'parent' ? '/parent' : '/admin'}>
                    {variant === 'parent' ? 'Dashboard' : 'Overview'}
                  </NavLink>
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

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="relative text-sm font-semibold text-muted-foreground hover:text-primary transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
    >
      {children}
    </Link>
  );
}
