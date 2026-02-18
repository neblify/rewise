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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { deleteQuestion } from '../actions';
import { useRouter } from 'next/navigation';

interface DeleteQuestionButtonProps {
  questionId: string;
  questionText: string;
  canDelete: boolean;
}

export default function DeleteQuestionButton({
  questionId,
  questionText,
  canDelete,
}: DeleteQuestionButtonProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!canDelete) {
    return null;
  }

  const handleConfirmDelete = () => {
    startTransition(async () => {
      const response = await deleteQuestion(questionId);

      if (response.success) {
        setShowDialog(false);
        router.refresh();
      } else {
        setError(response.message);
      }
    });
  };

  return (
    <>
      <Button
        onClick={() => {
          setError(null);
          setShowDialog(true);
        }}
        disabled={isPending}
        variant="ghost"
        size="sm"
        className="text-red-600 hover:text-red-900 hover:bg-red-50 font-medium"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm">
                <div className="text-muted-foreground">
                  Are you sure you want to delete this question?
                </div>
                <div className="bg-background p-3 rounded-md border border-border text-foreground">
                  &quot;
                  {questionText.length > 120
                    ? questionText.slice(0, 120) + '...'
                    : questionText}
                  &quot;
                </div>
                <div className="text-red-700 font-semibold bg-red-50 p-3 rounded-md border border-red-200">
                  This action cannot be undone. The question will be permanently
                  deleted.
                </div>

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
              {isPending ? 'Deleting...' : 'Delete Question'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
