'use server';

import { clerkClient } from '@clerk/nextjs/server';
import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { z } from 'zod';

const onboardingSchema = z.object({
  role: z.enum(['student', 'teacher', 'parent']),
});

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
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const existingClerkRole = user.publicMetadata?.role as string | undefined;

    await dbConnect();

    const existingDbUser = await User.findOne({ clerkId: userId })
      .select('role')
      .lean();
    const existingDbRole = existingDbUser?.role;

    // Do not overwrite existing role (e.g. Teacher/Parent who followed Open Challenge invite)
    const roleToPersist =
      existingClerkRole ?? existingDbRole ?? selectedRole;

    // Create or Update User in MongoDB
    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        clerkId: userId,
        email: user.emailAddresses[0].emailAddress,
        role: roleToPersist,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      { upsert: true, new: true }
    );

    // Update Clerk Metadata only if we're not overwriting an existing role
    if (!existingClerkRole) {
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: roleToPersist,
        },
      });
    }
  } catch (err) {
    console.error('Error in onboarding:', err);
    return { message: 'Failed to update profile' };
  }

  return { message: 'Success', success: true };
}
