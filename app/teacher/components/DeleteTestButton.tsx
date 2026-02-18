'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { checkTestResults, deleteTest } from '../actions';
import { useRouter } from 'next/navigation';

interface DeleteTestButtonProps {
  testId: string;
  testTitle: string;
  createdBy: string;
  currentUserId: string;
}

export default function DeleteTestButton({
  testId,
  testTitle,
  createdBy,
  currentUserId,
}: DeleteTestButtonProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [resultCount, setResultCount] = useState(0);
  const [deleteResults, setDeleteResults] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isCheckingResults, setIsCheckingResults] = useState(false);

  // Only show delete button if current user is the creator
  if (createdBy !== currentUserId) {
    return null;
  }

  const handleDeleteClick = async () => {
    setError(null);
    setIsCheckingResults(true);

    // Check if test has results
    const response = await checkTestResults(testId);
    setIsCheckingResults(false);

    if (!response.success) {
      setError(response.message || 'Failed to check test results');
      return;
    }

    setHasResults(response.hasResults);
    setResultCount(response.resultCount);
    setDeleteResults(response.hasResults); // Default to checked if results exist
    setShowDialog(true);
  };

  const handleConfirmDelete = () => {
    startTransition(async () => {
      const response = await deleteTest(testId, deleteResults);

      if (response.success) {
        setShowDialog(false);
        // Refresh the page to show updated list
        router.refresh();
      } else {
        setError(response.message);
      }
    });
  };

  return (
    <>
      <Button
        onClick={handleDeleteClick}
        disabled={isCheckingResults || isPending}
        variant="ghost"
        size="sm"
        className="text-red-600 hover:text-red-900 hover:bg-red-50 font-medium"
      >
        {isCheckingResults ? (
          'Checking...'
        ) : (
          <>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </>
        )}
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm">
                <div className="text-muted-foreground">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-foreground">
                    &quot;{testTitle}&quot;
                  </span>
                  ?
                </div>
                <div className="text-red-700 font-semibold bg-red-50 p-3 rounded-md border border-red-200">
                  ⚠️ This action cannot be undone. The test and all associated
                  questions will be permanently deleted.
                </div>

                {hasResults && (
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 space-y-3">
                    <div className="text-yellow-900 font-semibold">
                      ⚠️ This test has {resultCount} student{' '}
                      {resultCount === 1 ? 'result' : 'results'}
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="delete-results"
                        checked={deleteResults}
                        onCheckedChange={(checked: boolean) => {
                          setDeleteResults(checked);
                        }}
                        className="mt-1"
                      />
                      <label
                        htmlFor="delete-results"
                        className="text-sm text-yellow-900 cursor-pointer leading-relaxed"
                      >
                        Also delete all student results for this test
                        <span className="block text-xs text-yellow-800 mt-1 font-medium">
                          Recommended to maintain data integrity
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isPending ? 'Deleting...' : 'Delete Test'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
