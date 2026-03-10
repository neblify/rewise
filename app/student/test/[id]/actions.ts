'use server';

import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import Test from '@/lib/db/models/Test';
import Question from '@/lib/db/models/Question';
import Result from '@/lib/db/models/Result';
import { gradeTestWithAI } from '@/lib/ai/grader';

type SimpleStudentAnswer = string | number[] | undefined;

interface SimpleGradingItem {
  questionId: string;
  isCorrect: boolean;
  marksObtained: number;
  feedback: string;
}

interface SimpleGradingResult {
  results: SimpleGradingItem[];
  totalMarksObtained: number;
  maxMarks: number;
  weakAreas: string[];
  overallFeedback: string;
}

function normalizeStringAnswer(value: unknown): string {
  if (value == null) return '';
  return String(value).trim().toLowerCase();
}

function gradeDeterministically(
  test: typeof Test.schema['paths'] extends never ? never : InstanceType<typeof Test>,
  answers: Record<string, SimpleStudentAnswer>
): SimpleGradingResult {
  const results: SimpleGradingItem[] = [];
  let totalMarksObtained = 0;
  let maxMarks = 0;
  const weakAreasSet = new Set<string>();

  const pushResult = (
    questionId: string,
    isCorrect: boolean,
    marks: number,
    feedback: string
  ) => {
    results.push({
      questionId,
      isCorrect,
      marksObtained: isCorrect ? marks : 0,
      feedback,
    });
    maxMarks += marks;
    if (isCorrect) {
      totalMarksObtained += marks;
    }
  };

  if (Array.isArray((test as unknown as { sections?: unknown[] }).sections)) {
    const sections = (test as unknown as {
      sections?: { title?: string; questions?: unknown[] }[];
    }).sections;
    sections?.forEach((section, sIndex) => {
      const sectionTitle = section.title || 'Section';
      const questions = (section.questions || []) as {
        text?: string;
        type?: string;
        correctAnswer?: unknown;
        marks?: number;
      }[];
      questions.forEach((q, qIndex) => {
        const id = `${sIndex}-${qIndex}`;
        const type = q.type || 'mcq';
        const marks = q.marks ?? 1;
        const studentAnswer = answers[id];
        const correctAnswer = q.correctAnswer;

        if (
          type === 'mcq' ||
          type === 'true_false' ||
          type === 'fill_in_blanks' ||
          type === 'single_word' ||
          type === 'one_sentence'
        ) {
          const studentNorm = normalizeStringAnswer(studentAnswer);
          const correctNorm = normalizeStringAnswer(correctAnswer);
          const isCorrect = !!studentNorm && studentNorm === correctNorm;
          if (!isCorrect) weakAreasSet.add(sectionTitle);
          pushResult(
            id,
            isCorrect,
            marks,
            isCorrect
              ? 'Correct.'
              : `Expected: ${correctAnswer != null ? String(correctAnswer) : 'N/A'}.`
          );
        } else {
          const hasAnswer =
            studentAnswer != null &&
            (!(Array.isArray(studentAnswer)) || studentAnswer.length > 0);
          const isCorrect = false;
          if (!hasAnswer) weakAreasSet.add(sectionTitle);
          pushResult(
            id,
            isCorrect,
            marks,
            hasAnswer
              ? 'Answer recorded. Manual review recommended.'
              : 'No answer provided.'
          );
        }
      });
    });
  }

  const weakAreas = Array.from(weakAreasSet);
  const overallFeedback =
    maxMarks > 0
      ? `Scored ${totalMarksObtained} out of ${maxMarks} marks without AI grading.`
      : 'No questions to grade.';

  return {
    results,
    totalMarksObtained,
    maxMarks,
    weakAreas,
    overallFeedback,
  };
}

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

  let aiResult;
  try {
    aiResult = await gradeTestWithAI(test, answers);
  } catch (error) {
    if (error instanceof RangeError) {
      aiResult = gradeDeterministically(test, answers);
    } else {
      throw error;
    }
  }

  if (!aiResult) {
    aiResult = gradeDeterministically(test, answers);
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
