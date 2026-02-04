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

  // Link student to parent if not already linked
  // userId from auth() is the Clerk ID of the parent
  // We need to find the parent User document to update children
  await User.findOneAndUpdate(
    { clerkId: userId },
    { $addToSet: { children: student.clerkId } },
    { upsert: true } // Create parent record if it doesn't exist (though it should on login usually)
  );

  // Fetch results
  // @ts-ignore
  const results = await Result.find({ studentId: student.clerkId })
    .populate({ path: 'testId', model: Test })
    .sort({ createdAt: -1 });

  // Serialize
  return { data: JSON.parse(JSON.stringify(results)) };
}

export async function getLinkedStudents() {
  const { userId } = await auth();
  if (!userId) return { error: 'Unauthorized' };

  await dbConnect();

  const parent = await User.findOne({ clerkId: userId });
  if (!parent || !parent.children || parent.children.length === 0) {
    return { data: [] };
  }

  // Fetch student details
  const students = await User.find({
    clerkId: { $in: parent.children },
  }).select('firstName lastName email clerkId');

  return { data: JSON.parse(JSON.stringify(students)) };
}
