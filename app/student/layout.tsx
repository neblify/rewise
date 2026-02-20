import Navbar from '@/app/_components/dashboard/Navbar';
import TutorBot from './_components/tutor/TutorBot';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="student" />
      <main className="py-8">{children}</main>
      <TutorBot />
    </div>
  );
}
