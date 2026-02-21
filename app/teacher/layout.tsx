import Navbar from '@/app/_components/dashboard/Navbar';
import { DashboardFooter } from '@/app/_components/dashboard/DashboardFooter';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar variant="teacher" />
      <main className="py-8">{children}</main>
      <DashboardFooter />
    </div>
  );
}
