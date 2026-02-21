import Navbar from '@/app/_components/dashboard/Navbar';
import { DashboardFooter } from '@/app/_components/dashboard/DashboardFooter';
import TutorBot from './_components/tutor/TutorBot';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar variant="student" />
      <main className="py-8">{children}</main>
      <DashboardFooter />
      <TutorBot />
    </div>
  );
}
