import type { Metadata } from 'next';
import Navbar from '@/app/_components/dashboard/Navbar';

export const metadata: Metadata = {
  title: 'Parent Dashboard | ReWise',
};

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="parent" />
      <main className="py-8">{children}</main>
    </div>
  );
}
