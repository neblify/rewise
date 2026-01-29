import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Hero } from './_components/landing/Hero';
import { Features } from './_components/landing/Features';
import { RoleInfo } from './_components/landing/RoleInfo';

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main id="main-content" className="min-h-screen bg-white">
        <Hero />
        <Features />
        <RoleInfo />
      </main>
    );
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = user.publicMetadata.role as string | undefined;

  console.log('Root Page: Role found:', role);

  if (!role) {
    redirect('/onboarding');
  }

  if (role === 'teacher') {
    redirect('/teacher');
  }

  if (role === 'student') {
    redirect('/student');
  }

  if (role === 'parent') {
    redirect('/parent');
  }

  return <div>Unknown Role</div>;
}
