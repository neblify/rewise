import type { Metadata } from 'next';
import { currentAuth } from '@/lib/auth-wrapper';
import { redirect } from 'next/navigation';
import FriendsListClient from './FriendsListClient';
import { listFriends } from '../actions';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Open Challenge Friends | ReWise',
  description: 'View and update your invited friends for Open Challenge.',
};

export default async function OpenChallengeFriendsPage() {
  const { userId } = await currentAuth();
  if (!userId) redirect('/sign-in');

  const { friends } = await listFriends();
  const friendList = friends ?? [];

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/open-challenge"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Open Challenge
            </Link>
            <h1 className="text-2xl font-bold text-foreground mt-1">Friends</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              People you invited to beat your score. You or they can update optional details below.
            </p>
          </div>
        </div>
        <FriendsListClient initialFriends={friendList} />
      </div>
    </div>
  );
}
