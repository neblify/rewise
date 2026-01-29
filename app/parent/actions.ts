'use server';

import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import Result from '@/lib/db/models/Result';
import Test from '@/lib/db/models/Test';

export async function getStudentResults(email: string) {
  const { userId } = await auth();
  if (!userId) return { error: 'Unauthorized' };

  await dbConnect();

  // Find student by email
  const student = await User.findOne({ email });
  if (!student) {
    return { error: 'Student not found with this email.' };
  }

  // Fetch results
  // @ts-ignore
  const results = await Result.find({ studentId: student.clerkId })
    .populate('testId')
    .sort({ createdAt: -1 });

  // Serialize
  return { data: JSON.parse(JSON.stringify(results)) };
}
