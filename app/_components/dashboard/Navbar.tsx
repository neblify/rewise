'use client';

import { useClerk, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  variant?: 'student' | 'teacher' | 'parent' | 'admin';
}

function roleLabel(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function Navbar({ variant = 'student' }: NavbarProps) {
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const displayName =
    user?.fullName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.primaryEmailAddress?.emailAddress ||
    '—';

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Button
              variant="ghost"
              className="flex items-center gap-2 p-0 h-auto text-xl font-bold text-indigo-600 hover:text-indigo-700 hover:bg-transparent"
              onClick={() => setLogoutOpen(true)}
            >
              NIOS Prep
            </Button>
            <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Log out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Do you want to log out? You will be taken to the sign-in page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => signOut({ redirectUrl: '/sign-in' })}
                  >
                    Yes
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
              ) : variant === 'teacher' ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/teacher"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    All Tests
                  </Link>
                  <Link
                    href="/teacher/create-test"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Create Test
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={variant === 'parent' ? '/parent' : '/admin'}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    {variant === 'parent' ? 'Dashboard' : 'Overview'}
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0 ml-auto">
            {isLoaded && (
              <div className="hidden sm:flex flex-col items-end gap-0.5 text-right">
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                  {displayName}
                </span>
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                  {roleLabel(variant)}
                </span>
              </div>
            )}
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
