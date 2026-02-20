'use client';

import { useUser, useSession } from '@clerk/nextjs';
import { completeOnboarding } from '@/app/actions/onboarding';
import { useRouter } from 'next/navigation';
import { useLayoutEffect, useActionState, useState } from 'react';

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [state, action] = useActionState(completeOnboarding, null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const { session } = useSession();

  useLayoutEffect(() => {
    // After successful onboarding, reload session and go to role page
    if (state?.success && session) {
      session.reload().then(() => {
        const role = session.user?.publicMetadata?.role as string | undefined;
        router.push(role ? `/${role}` : '/');
      });
      return;
    }

    // If user already has a role (e.g. navigated here directly), redirect
    if (isLoaded && user?.publicMetadata?.role && !state?.success) {
      router.push(`/${user.publicMetadata.role}`);
    }
  }, [state?.success, session, router, isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            Welcome to ReWise
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us who you are to get started
          </p>
        </div>

        <form action={action} className="mt-8 space-y-6">
          <div className="space-y-4">
            {['student', 'teacher', 'parent'].map(role => (
              <label
                key={role}
                className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none hover:border-primary hover:ring-1 hover:ring-primary ${
                  selectedRole === role
                    ? 'border-primary ring-2 ring-primary'
                    : 'border-border'
                }`}
                onClick={() => {
                  setSelectedRole(role);
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value={role}
                  className="sr-only"
                  required
                  checked={selectedRole === role}
                  onChange={() => {
                    setSelectedRole(role);
                  }}
                />
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <span className="block text-sm font-medium text-foreground capitalize">
                      {role}
                    </span>
                    <span className="mt-1 flex items-center text-sm text-muted-foreground">
                      I am a {role}
                    </span>
                  </span>
                </span>
                <svg
                  className={`h-5 w-5 text-primary ${selectedRole === role ? 'block' : 'hidden'}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </label>
            ))}
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent gradient-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Get Started
            </button>
          </div>
          {state?.message && (
            <p className="text-center text-red-500 text-sm mt-2">
              {state.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
