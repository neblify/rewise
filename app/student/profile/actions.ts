'use server';

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
    await User.findOneAndUpdate(
      { clerkId: userId },
      { board, grade },
      { upsert: true, new: true }
    );

    revalidatePath('/student');
    revalidatePath('/student/profile');
    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: 'Failed to update profile' };
  }
}
