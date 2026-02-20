'use client';

import { useUser, useSession } from '@clerk/nextjs';
import { completeOnboarding } from '@/app/actions/onboarding';
import { useRouter } from 'next/navigation';
import { useLayoutEffect, useActionState, useState } from 'react';
import { motion } from 'framer-motion';
import { GradientButton, GradientText } from '@/components/playful';

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
      <div className="flex min-h-screen items-center justify-center gradient-navy text-white">
        <div className="text-white/70 font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden gradient-navy text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        className="w-full max-w-md space-y-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl p-8"
      >
        <div className="text-center">
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-white">
            Welcome to <GradientText as="span" className="text-4xl font-bold">ReWise</GradientText>
          </h2>
          <p className="mt-2 text-base text-white/70">
            Tell us who you are to get started
          </p>
        </div>

        <form action={action} className="mt-8 space-y-6">
          <div className="space-y-4">
            {['student', 'teacher', 'parent'].map(role => (
              <label
                key={role}
                className={`relative flex cursor-pointer rounded-xl border p-4 focus:outline-none transition-colors ${
                  selectedRole === role
                    ? 'border-[var(--sky)] ring-2 ring-[var(--sky)] bg-white/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role}
                  className="sr-only"
                  required
                  checked={selectedRole === role}
                  onChange={() => setSelectedRole(role)}
                />
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <span className="block text-sm font-semibold text-white capitalize">
                      {role}
                    </span>
                    <span className="mt-1 text-sm text-white/70">
                      I am a {role}
                    </span>
                  </span>
                </span>
                <svg
                  className={`h-5 w-5 shrink-0 text-[var(--sky)] ${selectedRole === role ? 'block' : 'hidden'}`}
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
            <GradientButton
              type="submit"
              className="w-full rounded-xl font-bold text-base py-6"
            >
              Get Started
            </GradientButton>
          </div>
          {state?.message && (
            <p className="text-center text-red-400 text-sm mt-2">
              {state.message}
            </p>
          )}
        </form>
      </motion.div>
    </div>
  );
}
