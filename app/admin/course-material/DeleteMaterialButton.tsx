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
import { deleteCourseMaterial } from './actions';
import { useRouter } from 'next/navigation';

interface DeleteMaterialButtonProps {
  materialId: string;
  materialTitle: string;
  chunkCount: number;
}

export default function DeleteMaterialButton({
  materialId,
  materialTitle,
  chunkCount,
}: DeleteMaterialButtonProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirmDelete = () => {
    startTransition(async () => {
      const response = await deleteCourseMaterial(materialId);

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
            <AlertDialogTitle>Delete Course Material</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm">
                <div className="text-muted-foreground">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-foreground">
                    &quot;{materialTitle}&quot;
                  </span>
                  ?
                </div>
                <div className="text-red-700 font-semibold bg-red-50 p-3 rounded-md border border-red-200">
                  This will permanently delete the material and{' '}
                  {chunkCount > 0
                    ? `remove ${chunkCount} vector chunks from the database.`
                    : 'its associated data.'}
                </div>
                {error && (
                  <div className="text-red-600 bg-red-50 p-2 rounded text-sm">
                    {error}
                  </div>
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
              {isPending ? 'Deleting...' : 'Delete Material'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
