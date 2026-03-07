import React, { useEffect, useRef } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { renderPageToCanvas } from '../lib/pdf-renderer';

interface PdfThumbnailProps {
  document: PDFDocumentProxy;
  pageIndex: number;             // 0-based
  scale?: number;                // default 0.3
  rotation?: number;             // CSS transform rotation (0, 90, 180, 270)
  selected?: boolean;
  onClick?: () => void;
  overlay?: React.ReactNode;
}

const PdfThumbnail = React.memo(function PdfThumbnail({
  document,
  pageIndex,
  scale = 0.3,
  rotation = 0,
  selected = false,
  onClick,
  overlay,
}: PdfThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    renderPageToCanvas(document, pageIndex + 1, canvas, scale).catch(() => {
      if (!cancelled) {
        // Silently handle render errors; canvas stays blank
      }
    });

    return () => {
      cancelled = true;
    };
  }, [document, pageIndex, scale]);

  return (
    <div
      className={`relative inline-flex flex-col items-center cursor-pointer ${
        selected ? 'ring-2 ring-blue-500 rounded' : ''
      }`}
      onClick={onClick}
    >
      <div className="relative">
        <canvas
          ref={canvasRef}
          style={{
            transform: rotation ? `rotate(${rotation}deg)` : undefined,
          }}
          className="bg-white shadow-sm"
        />
        {overlay && (
          <div className="absolute inset-0 flex items-center justify-center">
            {overlay}
          </div>
        )}
      </div>
      <span className="mt-1 text-xs text-gray-500">{pageIndex + 1}</span>
    </div>
  );
});

export default PdfThumbnail;
