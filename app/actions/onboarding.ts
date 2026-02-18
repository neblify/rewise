'use server';

import { clerkClient } from '@clerk/nextjs/server';
import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const onboardingSchema = z.object({
  role: z.enum(['student', 'teacher', 'parent']),
});

const schoolStepSchema = z.object({
  school: z.string().optional(),
});

export async function getOnboardingStep(): Promise<'school' | 'role' | null> {
  const { userId } = await currentAuth();
  if (!userId) return null;
  if (userId.startsWith('mock_')) {
    await dbConnect();
    const user = await User.findOne({ clerkId: userId }).select('onboardingStep role').lean();
    if (user?.role) return null;
    return (user?.onboardingStep as 'school' | 'role') ?? 'school';
  }
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  if (user.publicMetadata.role) return null;
  return (user.publicMetadata.onboardingStep as 'school' | 'role') ?? 'school';
}

export async function completeSchoolStep(prevState: unknown, formData: FormData) {
  const { userId } = await currentAuth();

  if (!userId) {
    return { message: 'No Logged In User' };
  }

  const school = formData.get('school') as string | null;
  const validated = schoolStepSchema.safeParse({ school: school ?? undefined });

  if (!validated.success) {
    return { message: 'Invalid school selection' };
  }

  try {
    await dbConnect();

    if (userId.startsWith('mock_')) {
      const existing = await User.findOne({ clerkId: userId });
      await User.findOneAndUpdate(
        { clerkId: userId },
        {
          clerkId: userId,
          email: existing?.email ?? `${userId}@example.com`,
          school: validated.data.school ?? undefined,
          role: 'pending',
          onboardingStep: 'role',
          firstName: existing?.firstName,
          lastName: existing?.lastName,
        },
        { upsert: true, new: true }
      );
    } else {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);

      await User.findOneAndUpdate(
        { clerkId: userId },
        {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
          school: validated.data.school ?? undefined,
          role: 'pending',
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
        },
        { upsert: true, new: true }
      );

      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...(clerkUser.publicMetadata as object),
          onboardingStep: 'role',
        },
      });
    }
  } catch (err) {
    console.error('Error in school step:', err);
    return { message: 'Failed to save school' };
  }

  redirect('/onboarding');
}

export async function completeOnboarding(
  prevState: unknown,
  formData: FormData
) {
  const { userId } = await currentAuth();

  if (!userId) {
    return { message: 'No Logged In User' };
  }

  const role = formData.get('role');

  const validatedFields = onboardingSchema.safeParse({
    role,
  });

  if (!validatedFields.success) {
    return { message: 'Invalid role selection' };
  }

  const selectedRole = validatedFields.data.role;

  try {
    await dbConnect();
    const existing = await User.findOne({ clerkId: userId });

    if (userId.startsWith('mock_')) {
      await User.findOneAndUpdate(
        { clerkId: userId },
        {
          role: selectedRole,
          ...(existing?.school != null && { school: existing.school }),
        },
        { new: true }
      );
    } else {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);

      await User.findOneAndUpdate(
        { clerkId: userId },
        {
          clerkId: userId,
          email: user.emailAddresses[0].emailAddress,
          role: selectedRole,
          firstName: user.firstName,
          lastName: user.lastName,
          ...(existing?.school != null && { school: existing.school }),
        },
        { upsert: true, new: true }
      );

      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: selectedRole,
        },
      });
    }
  } catch (err) {
    console.error('Error in onboarding:', err);
    return { message: 'Failed to update profile' };
  }

  return { message: 'Success', success: true };
}
