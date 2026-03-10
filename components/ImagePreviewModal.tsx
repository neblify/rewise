'use client';

import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export function ImagePreviewModal({
  src,
  onClose,
  alt = 'Preview',
}: {
  src: string | null;
  onClose: () => void;
  alt?: string;
}) {
  const open = !!src;
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-[90vw] max-h-[90vh] w-auto border bg-card p-2"
        onPointerDownOutside={onClose}
        onEscapeKeyDown={onClose}
      >
        <div className="flex items-center justify-center min-h-[200px]">
          {src ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded"
            />
          ) : null}
        </div>
        <DialogTitle className="sr-only">{alt}</DialogTitle>
      </DialogContent>
    </Dialog>
  );
}
