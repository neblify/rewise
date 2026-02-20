'use server';

import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import Test from '@/lib/db/models/Test';
import Question from '@/lib/db/models/Question';
import Result from '@/lib/db/models/Result';
import { gradeTestWithAI } from '@/lib/ai/grader';

export async function submitTest(
  testId: string,
  answers: Record<string, string | number[] | undefined>
) {
  const { userId } = await currentAuth();
  if (!userId) return { message: 'Unauthorized' };

  await dbConnect();
  const test = await Test.findById(testId)
    .populate({
      path: 'sections.questions',
      model: Question,
    })
    .populate({
      path: 'questions',
      model: Question,
    });
  if (!test) return { message: 'Test not found' };

  // Call AI Grader
  const aiResult = await gradeTestWithAI(test, answers);

  if (!aiResult) {
    return { message: 'Grading failed' };
  }

  // Map AI results back to our Schema format
  // Ensure we match the structure expected by Result Schema
  const answersToSave = aiResult.results.map(r => ({
    questionId: r.questionId, // This is now a string like "0-1" or "2"
    answer: answers[r.questionId],
    isCorrect: r.isCorrect,
    marksObtained: r.marksObtained,
    feedback: r.feedback,
  }));

  // Create Result
  const result = await Result.create({
    testId: test._id,
    studentId: userId,
    answers: answersToSave,
    totalScore: aiResult.totalMarksObtained,
    maxScore: aiResult.maxMarks,
    aiFeedback: aiResult.overallFeedback,
    weakAreas: aiResult.weakAreas,
  });

  return { success: true, resultId: result._id.toString() };
}
