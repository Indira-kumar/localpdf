import React from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import PdfThumbnail from './PdfThumbnail';

interface PdfThumbnailGridProps {
  document: PDFDocumentProxy;
  pageCount: number;
  mode: 'view' | 'selectable' | 'sortable';
  selectedPages?: Set<number>;
  rotations?: Record<number, number>;
  onPageClick?: (pageIndex: number) => void;
  renderOverlay?: (pageIndex: number) => React.ReactNode;
}

export default function PdfThumbnailGrid({
  document,
  pageCount,
  mode,
  selectedPages,
  rotations,
  onPageClick,
  renderOverlay,
}: PdfThumbnailGridProps) {
  const pages = Array.from({ length: pageCount }, (_, i) => i);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {pages.map((pageIndex) => (
        <PdfThumbnail
          key={pageIndex}
          document={document}
          pageIndex={pageIndex}
          selected={mode === 'selectable' ? selectedPages?.has(pageIndex) : false}
          rotation={rotations?.[pageIndex]}
          onClick={onPageClick ? () => onPageClick(pageIndex) : undefined}
          overlay={renderOverlay ? renderOverlay(pageIndex) : undefined}
        />
      ))}
    </div>
  );
}
