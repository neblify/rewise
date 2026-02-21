import type { Metadata } from 'next';
import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { redirect } from 'next/navigation';
import UpdateProfileForm from './UpdateProfileForm';

export const metadata: Metadata = {
  title: 'My Profile | ReWise',
};

export default async function ProfilePage() {
  const { userId } = await currentAuth();
  if (!userId) redirect('/sign-in');

  await dbConnect();
  const user = await User.findOne({ clerkId: userId });

  // If user doesn't exist in our DB yet (should exist upon sign-up, but safeguard),
  // we can create or handle it. For now assuming user exists.

  if (!user) {
    // Fallback or create logic if needed.
    // Usually webhook creates it.
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Update your academic details to see relevant tests.
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-8">
        <UpdateProfileForm
          initialBoard={user?.board || ''}
          initialGrade={user?.grade || ''}
        />
      </div>
    </div>
  );
}
