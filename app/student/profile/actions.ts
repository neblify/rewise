'use server';

import { clerkClient } from '@clerk/nextjs/server';
import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const { userId } = await currentAuth();
  if (!userId) return { success: false, message: 'Unauthorized' };

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
        { board, grade },
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
      await User.create({
        clerkId: userId,
        email,
        role,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        board,
        grade,
      });
    }

    revalidatePath('/student');
    revalidatePath('/student/profile');
    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: 'Failed to update profile' };
  }
}
