import { useRef, useEffect, useState, useCallback, type FC } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { renderPageToCanvas, getPageDimensions } from '../../lib/pdf-renderer';
import type { SignaturePlacement } from '../../types/pdf';

interface SignaturePlacerProps {
  document: PDFDocumentProxy;
  pageIndex: number;
  onPlacement: (p: SignaturePlacement) => void;
  signaturePreview: string;
}

const INITIAL_SIG_WIDTH = 150;
const INITIAL_SIG_HEIGHT = 50;
const RENDER_SCALE = 1.5;
const MIN_SIZE = 20;

const SignaturePlacer: FC<SignaturePlacerProps> = ({
  document,
  pageIndex,
  onPlacement,
  signaturePreview,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [pdfDims, setPdfDims] = useState({ width: 0, height: 0 });

  const [sigPos, setSigPos] = useState({ x: 0, y: 0 });
  const [sigSize, setSigSize] = useState({ width: INITIAL_SIG_WIDTH, height: INITIAL_SIG_HEIGHT });

  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // Render the PDF page
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !document) return;

    const pageNum = pageIndex + 1; // 1-indexed

    let cancelled = false;

    (async () => {
      const page = await document.getPage(pageNum);
      const dims = getPageDimensions(page);
      setPdfDims(dims);

      if (cancelled) return;

      await renderPageToCanvas(document, pageNum, canvas, RENDER_SCALE);

      if (cancelled) return;

      setCanvasSize({ width: canvas.width, height: canvas.height });

      // Center the signature initially
      setSigPos({
        x: (canvas.width - INITIAL_SIG_WIDTH) / 2,
        y: (canvas.height - INITIAL_SIG_HEIGHT) / 2,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [document, pageIndex]);

  const emitPlacement = useCallback(
    (screenX: number, screenY: number, screenW: number, screenH: number) => {
      if (canvasSize.width === 0 || canvasSize.height === 0) return;

      const pdfX = (screenX / canvasSize.width) * pdfDims.width;
      const pdfY =
        pdfDims.height -
        ((screenY + screenH) / canvasSize.height) * pdfDims.height;
      const pdfWidth = (screenW / canvasSize.width) * pdfDims.width;
      const pdfHeight = (screenH / canvasSize.height) * pdfDims.height;

      onPlacement({
        pageIndex,
        x: pdfX,
        y: pdfY,
        width: pdfWidth,
        height: pdfHeight,
      });
    },
    [canvasSize, pdfDims, pageIndex, onPlacement],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isDragging.current = true;
      dragOffset.current = {
        x: e.clientX - sigPos.x,
        y: e.clientY - sigPos.y,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [sigPos],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isDragging.current) {
        const newX = Math.max(0, Math.min(e.clientX - dragOffset.current.x, canvasSize.width - sigSize.width));
        const newY = Math.max(0, Math.min(e.clientY - dragOffset.current.y, canvasSize.height - sigSize.height));
        setSigPos({ x: newX, y: newY });
      }
      if (isResizing.current) {
        const dx = e.clientX - resizeStart.current.x;
        const dy = e.clientY - resizeStart.current.y;
        const newW = Math.max(MIN_SIZE, Math.min(resizeStart.current.w + dx, canvasSize.width - sigPos.x));
        const newH = Math.max(MIN_SIZE, Math.min(resizeStart.current.h + dy, canvasSize.height - sigPos.y));
        setSigSize({ width: newW, height: newH });
      }
    },
    [canvasSize, sigSize, sigPos],
  );

  const handlePointerUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      emitPlacement(sigPos.x, sigPos.y, sigSize.width, sigSize.height);
    }
    if (isResizing.current) {
      isResizing.current = false;
      emitPlacement(sigPos.x, sigPos.y, sigSize.width, sigSize.height);
    }
  }, [sigPos, sigSize, emitPlacement]);

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isResizing.current = true;
      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        w: sigSize.width,
        h: sigSize.height,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [sigSize],
  );

  // Emit initial placement once canvas is rendered
  useEffect(() => {
    if (canvasSize.width > 0 && canvasSize.height > 0) {
      emitPlacement(sigPos.x, sigPos.y, sigSize.width, sigSize.height);
    }
    // Only run on initial canvas render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize.width, canvasSize.height]);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-gray-600">
        Drag the signature to position it. Use the corner handle to resize.
      </p>
      <div
        ref={containerRef}
        className="relative inline-block border border-gray-300 rounded shadow-sm"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <canvas ref={canvasRef} className="block" />

        {canvasSize.width > 0 && (
          <div
            style={{
              position: 'absolute',
              left: sigPos.x,
              top: sigPos.y,
              width: sigSize.width,
              height: sigSize.height,
              cursor: 'move',
              border: '2px dashed rgba(59, 130, 246, 0.7)',
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
            }}
            onPointerDown={handlePointerDown}
          >
            <img
              src={signaturePreview}
              alt="Signature"
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
            {/* Resize handle */}
            <div
              style={{
                position: 'absolute',
                right: -4,
                bottom: -4,
                width: 12,
                height: 12,
                backgroundColor: '#3b82f6',
                borderRadius: 2,
                cursor: 'nwse-resize',
              }}
              onPointerDown={handleResizePointerDown}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SignaturePlacer;
