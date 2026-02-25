import { clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import Navbar from '@/app/_components/dashboard/Navbar';
import { DashboardFooter } from '@/app/_components/dashboard/DashboardFooter';

type NavbarVariant = 'student' | 'teacher' | 'parent' | 'admin';

async function getRole(userId: string): Promise<NavbarVariant> {
  if (userId.startsWith('mock_')) {
    await dbConnect();
    const dbUser = await User.findOne({ clerkId: userId }).select('role').lean();
    const r = dbUser?.role;
    if (r === 'teacher' || r === 'parent' || r === 'admin') return r;
    return 'student';
  }
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const r = user.publicMetadata?.role as string | undefined;
  if (r === 'teacher' || r === 'parent' || r === 'admin') return r;
  return 'student';
}

export default async function OpenChallengeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await currentAuth();
  if (!userId) redirect('/sign-up');

  const role = await getRole(userId);
  const variant: NavbarVariant =
    role === 'admin' ? 'admin' : role === 'teacher' ? 'teacher' : role === 'parent' ? 'parent' : 'student';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar variant={variant} />
      <main className="py-8 flex-1">{children}</main>
      <DashboardFooter />
    </div>
  );
}
