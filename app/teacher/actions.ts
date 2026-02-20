'use server';

import { currentAuth } from '@/lib/auth-wrapper';
import dbConnect from '@/lib/db/connect';
import Test from '@/lib/db/models/Test';
import Question from '@/lib/db/models/Question';
import Result from '@/lib/db/models/Result';
import { revalidatePath } from 'next/cache';

interface DeleteTestResult {
  success: boolean;
  message: string;
  deletedCounts?: {
    results: number;
    questions: number;
  };
}

interface CheckResultsResponse {
  success: boolean;
  hasResults: boolean;
  resultCount: number;
  message?: string;
}

/**
 * Check if a test has associated results
 * Only the test creator can check this
 */
export async function checkTestResults(
  testId: string
): Promise<CheckResultsResponse> {
  try {
    const { userId } = await currentAuth();

    if (!userId) {
      return {
        success: false,
        hasResults: false,
        resultCount: 0,
        message: 'Unauthorized',
      };
    }

    await dbConnect();

    // Verify test exists and user owns it
    const test = await Test.findOne({ _id: testId, createdBy: userId });

    if (!test) {
      return {
        success: false,
        hasResults: false,
        resultCount: 0,
        message: 'Test not found or you do not have permission to access it',
      };
    }

    // Count results for this test
    const resultCount = await Result.countDocuments({ testId });

    return {
      success: true,
      hasResults: resultCount > 0,
      resultCount,
    };
  } catch (error) {
    console.error('Error checking test results:', error);
    return {
      success: false,
      hasResults: false,
      resultCount: 0,
      message: 'Failed to check test results',
    };
  }
}

/**
 * Delete a test and optionally its associated results and questions
 * Only the test creator can delete their test
 */
export async function deleteTest(
  testId: string,
  deleteResults: boolean = true
): Promise<DeleteTestResult> {
  try {
    const { userId } = await currentAuth();

    if (!userId) {
      return {
        success: false,
        message: 'Unauthorized',
      };
    }

    await dbConnect();

    // Verify test exists and user owns it
    const test = await Test.findOne({ _id: testId, createdBy: userId });

    if (!test) {
      return {
        success: false,
        message: 'Test not found or you do not have permission to delete it',
      };
    }

    const deletedCounts = {
      results: 0,
      questions: 0,
    };

    // Step 1: Delete results if requested (fail early if this fails)
    if (deleteResults) {
      const resultDeleteResult = await Result.deleteMany({ testId });
      deletedCounts.results = resultDeleteResult.deletedCount || 0;
    }

    // Step 2: Extract and delete associated questions
    const questionIds: string[] = [];

    // Collect question IDs from sections
    if (test.sections && test.sections.length > 0) {
      test.sections.forEach((section: { questions?: unknown[] }) => {
        if (section.questions && Array.isArray(section.questions)) {
          section.questions.forEach((qId: unknown) => {
            questionIds.push(String(qId));
          });
        }
      });
    }

    // Delete questions if any exist
    if (questionIds.length > 0) {
      const questionDeleteResult = await Question.deleteMany({
        _id: { $in: questionIds },
      });
      deletedCounts.questions = questionDeleteResult.deletedCount || 0;
    }

    // Step 3: Delete the test itself
    await Test.deleteOne({ _id: testId });

    // Revalidate the teacher dashboard
    revalidatePath('/teacher');

    return {
      success: true,
      message: 'Test deleted successfully',
      deletedCounts,
    };
  } catch (error) {
    console.error('Error deleting test:', error);
    return {
      success: false,
      message: 'Failed to delete test. Please try again.',
    };
  }
}
