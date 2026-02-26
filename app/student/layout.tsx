import { redirect } from 'next/navigation';
import { currentAuth } from '@/lib/auth-wrapper';
import { getRole, getRoleAsNavbarVariant } from '@/lib/role';
import Navbar from '@/app/_components/dashboard/Navbar';
import { DashboardFooter } from '@/app/_components/dashboard/DashboardFooter';
import TutorBot from './_components/tutor/TutorBot';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await currentAuth();
  if (!userId) redirect('/sign-up');

  const role = await getRole(userId);
  const variant = getRoleAsNavbarVariant(role);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar variant={variant} />
      <main className="py-8">{children}</main>
      <DashboardFooter />
      <TutorBot />
    </div>
  );
}
