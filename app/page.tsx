import { auth, clerkClient } from '@clerk/nextjs/server';
import { currentAuth } from '@/lib/auth-wrapper';
import { redirect } from 'next/navigation';
import { Hero } from './_components/landing/Hero';
import { Features } from './_components/landing/Features';
import { RoleInfo } from './_components/landing/RoleInfo';

export default async function Home() {
  const { userId } = await currentAuth();

  if (!userId) {
    return (
      <main id="main-content" className="min-h-screen bg-background">
        <Hero />
        <Features />
        <RoleInfo />
      </main>
    );
  }

  let role: string | undefined;

  if (userId.startsWith('mock_')) {
    const { default: dbConnect } = await import('@/lib/db/connect');
    const { default: User } = await import('@/lib/db/models/User');
    await dbConnect();
    const dbUser = await User.findOne({ clerkId: userId });
    if (dbUser) {
      role = dbUser.role;
    }
    if (!role || role === 'pending') {
      if (role === 'pending') {
        redirect('/onboarding');
      }
      const step = dbUser?.onboardingStep;
      if (step === 'role') {
        redirect('/onboarding');
      }
      redirect('/onboarding/school');
    }
  } else {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    role = user.publicMetadata.role as string | undefined;
    if (!role) {
      const onboardingStep = user.publicMetadata.onboardingStep as string | undefined;
      if (onboardingStep === 'role') {
        redirect('/onboarding');
      }
      redirect('/onboarding/school');
    }
  }

  if (!role || role === 'pending') {
    redirect(role === 'pending' ? '/onboarding' : '/onboarding/school');
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
