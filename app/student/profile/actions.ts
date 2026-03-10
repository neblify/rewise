'use server';

import { clerkClient } from '@clerk/nextjs/server';
import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const { userId } = await currentAuth();
  if (!userId) return { success: false, message: 'Unauthorized' };

  const rawFirstName = (formData.get('firstName') as string | null) ?? '';
  const rawLastName = (formData.get('lastName') as string | null) ?? '';
  const firstName = rawFirstName.trim() || undefined;
  const lastName = rawLastName.trim() || undefined;
  const board = formData.get('board') as string;
  const grade = formData.get('grade') as string;

  if (!board || !grade) {
    return { success: false, message: 'All fields are required' };
  }

  await dbConnect();

  try {
    const existing = await User.findOne({ clerkId: userId }).lean();
    if (existing) {
      await User.findOneAndUpdate(
        { clerkId: userId },
        {
          board,
          grade,
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
        },
        { new: true }
      );
    } else {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      const role = clerkUser.publicMetadata?.role as string | undefined;
      // Do not default to student: preserve invitees (e.g. teacher/parent) who use student routes for Open Challenge
      if (!role || !['student', 'teacher', 'parent', 'admin'].includes(role)) {
        return {
          success: false,
          message: 'Please complete onboarding first to set your role.',
        };
      }
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';
      const effectiveFirstName = firstName ?? clerkUser.firstName;
      const effectiveLastName = lastName ?? clerkUser.lastName;
      await User.create({
        clerkId: userId,
        email,
        role,
        firstName: effectiveFirstName,
        lastName: effectiveLastName,
        board,
        grade,
      });
    }

    // Best-effort: keep Clerk profile name in sync when user provided one
    if (firstName !== undefined || lastName !== undefined) {
      try {
        const client = await clerkClient();
        await client.users.updateUser(userId, {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
        });
      } catch (err) {
        // Non-fatal: log and continue
        console.error('Error syncing name with Clerk:', err);
      }
    }

    revalidatePath('/student');
    revalidatePath('/student/profile');
    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: 'Failed to update profile' };
  }
}
