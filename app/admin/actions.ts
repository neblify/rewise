'use server';

import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import Test from '@/lib/db/models/Test';
import Question from '@/lib/db/models/Question';
import Result from '@/lib/db/models/Result';

export async function getAdminStats() {
  await dbConnect();

  const [teachers, students, parents, tests, questions, results] =
    await Promise.all([
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'parent' }),
      Test.countDocuments(),
      Question.countDocuments(),
      Result.countDocuments(),
    ]);

  return {
    teachers,
    students,
    parents,
    tests,
    questions,
    results,
  };
}

export async function getUsers(role?: string) {
  await dbConnect();
  const query = role ? { role } : {};
  const users = await User.find(query).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(users));
}

export async function getTests() {
  await dbConnect();
  // Populate createdBy to get teacher name if needed, assuming createdBy is just an ID string currently
  // If createdBy was a ref, we would populate. Since it's a clerkId string, we might need to fetch user separately or just show the ID.
  const tests = await Test.find({}).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(tests));
}

export async function getQuestions() {
  await dbConnect();
  const questions = await Question.find({}).sort({ createdAt: -1 }).limit(100); // Limit to 100 for now to avoid performance issues
  return JSON.parse(JSON.stringify(questions));
}
