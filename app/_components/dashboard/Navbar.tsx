'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  variant?: 'student' | 'teacher' | 'parent' | 'admin';
}

const STUDENT_NAV_LINKS: { href: string; label: string }[] = [
  { href: '/student', label: 'Dashboard' },
  { href: '/open-challenge', label: 'Open Challenge' },
  { href: '/student/study-material', label: 'Study Material' },
  { href: '/student/results', label: 'My Results' },
  { href: '/student/profile', label: 'Profile' },
];

const TEACHER_NAV_LINKS: { href: string; label: string }[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/open-challenge', label: 'Open Challenge' },
  { href: '/teacher', label: 'All Tests' },
  { href: '/teacher/questions', label: 'Question Bank' },
  { href: '/teacher/create-test/choose', label: 'Create Test' },
];

const ADMIN_NAV_LINKS: { href: string; label: string }[] = [
  { href: '/admin', label: 'Overview' },
  { href: '/open-challenge', label: 'Open Challenge' },
  { href: '/admin/course-material', label: 'Course Material' },
];

const PARENT_NAV_LINKS: { href: string; label: string }[] = [
  { href: '/parent', label: 'Dashboard' },
  { href: '/open-challenge', label: 'Open Challenge' },
];

function getNavLinks(
  variant: 'student' | 'teacher' | 'parent' | 'admin'
): { href: string; label: string }[] {
  switch (variant) {
    case 'teacher':
      return TEACHER_NAV_LINKS;
    case 'admin':
      return ADMIN_NAV_LINKS;
    case 'parent':
      return PARENT_NAV_LINKS;
    default:
      return STUDENT_NAV_LINKS;
  }
}

export default function Navbar({ variant = 'student' }: NavbarProps) {
  const { isSignedIn } = useUser();
  const links = getNavLinks(variant);
  const linkContent = (
    <>
      {links.map(({ href, label }) => (
        <NavLink key={href} href={href}>
          {label}
        </NavLink>
      ))}
    </>
  );

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
              {linkContent}
            </div>
            <div className="flex md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4 mt-6">{linkContent}</nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'h-10 w-10',
                  },
                }}
              />
            ) : (
              <span className="text-xs bg-violet-light text-primary px-2 py-1 rounded font-medium">
                Mock Session
              </span>
            )}
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
