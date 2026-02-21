import type { Metadata } from 'next';
import Navbar from '@/app/_components/dashboard/Navbar';
import { DashboardFooter } from '@/app/_components/dashboard/DashboardFooter';

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
      <main className="py-8">{children}</main>
      <DashboardFooter />
    </div>
  );
}
