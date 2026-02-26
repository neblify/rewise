import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { clerkClient } from '@clerk/nextjs/server';
import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import OpenChallengeClient from './OpenChallengeClient';

export const metadata: Metadata = {
  title: 'Open Challenge | ReWise',
  description:
    'Generate an assessment on any topic, take it, and invite friends to beat your score.',
};

function getDashboardHref(role: string): string {
  if (role === 'teacher') return '/dashboard';
  if (role === 'parent') return '/parent';
  return '/student';
}

async function getRole(userId: string): Promise<string> {
  if (userId.startsWith('mock_')) {
    await dbConnect();
    const dbUser = await User.findOne({ clerkId: userId })
      .select('role')
      .lean();
    return dbUser?.role ?? 'student';
  }
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return (user.publicMetadata?.role as string) ?? 'student';
}

export default async function OpenChallengePage() {
  const { userId } = await currentAuth();

  if (!userId) {
    redirect('/sign-up');
  }

  const role = await getRole(userId);
  const dashboardHref = getDashboardHref(role);

  return <OpenChallengeClient dashboardHref={dashboardHref} />;
}
