import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Navbar from '@/app/_components/dashboard/Navbar';
import { ADMIN_EMAILS } from '@/lib/constants/admins';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const email = user.emailAddresses[0]?.emailAddress;
  const role = user.publicMetadata.role as string;

  // Access Control: Allow admin emails OR any user with 'admin' role
  if (!email || (!ADMIN_EMAILS.includes(email) && role !== 'admin')) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="admin" />
      <main className="py-8">{children}</main>
    </div>
  );
}
