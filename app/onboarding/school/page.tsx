'use client';

import { useActionState, useState } from 'react';
import { completeSchoolStep } from '@/app/actions/onboarding';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const DEFAULT_SCHOOLS = [
  'AL - BARKAAT Malik Muhammad Islam English School',
];

export default function SelectSchoolPage() {
  const [state, action] = useActionState(completeSchoolStep, null);
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [schools] = useState<string[]>(DEFAULT_SCHOOLS);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            Select my School
          </h2>
        </div>

        <form action={action} className="mt-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="school">School (optional)</Label>
            <select
              id="school"
              name="school"
              className="flex h-9 w-full rounded-xl border-2 border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
            >
              <option value="">Select a school</option>
              {schools.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowAddSchool((v) => !v)}
              className="text-sm font-medium text-primary hover:underline"
            >
              Add a school
            </button>
            {showAddSchool && (
              <Input
                type="text"
                placeholder="Enter school name"
                disabled
                className="mt-1"
                aria-label="Add a school (disabled)"
              />
            )}
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent gradient-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Continue
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
