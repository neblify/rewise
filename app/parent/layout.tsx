import type { Metadata } from 'next';
import Navbar from '@/app/_components/dashboard/Navbar';
import { DashboardFooter } from '@/app/_components/dashboard/DashboardFooter';
import { InvitedToOpenChallengeCard } from '@/app/_components/dashboard/InvitedToOpenChallengeCard';

export const metadata: Metadata = {
  title: 'Parent Dashboard | ReWise',
};

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar variant="parent" />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-8 pb-4">
          <InvitedToOpenChallengeCard />
        </div>
        {children}
      </main>
      <DashboardFooter />
    </div>
  );
}
