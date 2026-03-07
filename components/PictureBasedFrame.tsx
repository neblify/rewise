'use client';

import React from 'react';

/** 2×2 inch frame for Picture Based question images. Optional onClick makes it clickable (e.g. open larger preview). */
export function PictureBasedFrame({
  src,
  alt = 'Question image',
  className = '',
  onClick,
}: {
  src: string;
  alt?: string;
  className?: string;
  onClick?: () => void;
}) {
  const frameClass =
    'inline-block overflow-hidden rounded-lg border border-border bg-muted/50 ' +
    (onClick ? 'cursor-pointer hover:ring-2 hover:ring-primary/50 transition-shadow ' : '') +
    className;
  const style = { width: '2in', height: '2in', minWidth: '2in', minHeight: '2in' as const };

  const content = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-contain"
        style={{ width: '2in', height: '2in' }}
      />
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={frameClass}
        style={style}
        aria-label="View larger image"
      >
        {content}
      </button>
    );
  }
  return (
    <span className={frameClass} style={style}>
      {content}
    </span>
  );
}
