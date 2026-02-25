import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentAuth } from '@/lib/auth-wrapper';
import OpenChallengeClient from './OpenChallengeClient';

export const metadata: Metadata = {
  title: 'Open Challenge | ReWise',
  description:
    'Generate an assessment on any topic, take it, and invite friends to beat your score.',
};

export default async function OpenChallengePage() {
  const { userId } = await currentAuth();

  if (!userId) {
    redirect('/sign-up');
  }

  return <OpenChallengeClient />;
}
