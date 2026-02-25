'use server';

import { clerkClient } from '@clerk/nextjs/server';
import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import Result from '@/lib/db/models/Result';
import Test from '@/lib/db/models/Test';

export async function getStudentResults(email: string) {
  const { userId } = await currentAuth();
  if (!userId) return { error: 'Unauthorized' };

  await dbConnect();

  // Find student by email
  const student = await User.findOne({ email });
  if (!student) {
    return { error: 'Student not found with this email.' };
  }

  // Link student to parent if not already linked; on upsert preserve caller's role (do not default to student)
  const existing = await User.findOne({ clerkId: userId }).select('role').lean();
  if (existing) {
    await User.findOneAndUpdate(
      { clerkId: userId },
      { $addToSet: { children: student.clerkId } }
    );
  } else {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const role = (clerkUser.publicMetadata?.role as string) || 'parent';
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';
    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $addToSet: { children: student.clerkId },
        $setOnInsert: {
          email,
          role,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
        },
      },
      { upsert: true }
    );
  }

  // Fetch results
  const results = await Result.find({ studentId: student.clerkId })
    .populate({ path: 'testId', model: Test })
    .sort({ createdAt: -1 });

  // Serialize
  return { data: JSON.parse(JSON.stringify(results)) };
}

export async function getLinkedStudents() {
  const { userId } = await currentAuth();
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
