import { useRef, useState, useCallback, useEffect, type FC } from 'react';
import Button from '../../components/ui/Button';
import { useSignatureContext } from './SignatureProvider';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 150;
const LINE_WIDTH = 2.5;
const STROKE_COLOR = '#000000';

const SignatureDraw: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setSignature } = useSignatureContext();
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);

  // Set up canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = LINE_WIDTH;
    ctx.strokeStyle = STROKE_COLOR;
  }, []);

  const getPos = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    setIsDrawing(true);
    canvas.setPointerCapture(e.pointerId);

    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [getPos]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasStrokes(true);
  }, [isDrawing, getPos]);

  const handlePointerUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Reset context properties after clear
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = LINE_WIDTH;
    ctx.strokeStyle = STROKE_COLOR;
    setHasStrokes(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Export canvas as PNG blob
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png')
    );
    if (!blob) return;

    const arrayBuffer = await blob.arrayBuffer();
    const preview = canvas.toDataURL('image/png');

    setSignature({
      type: 'draw',
      imageData: arrayBuffer,
      mimeType: 'image/png',
      preview,
    });
  }, [setSignature]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-lg border-2 border-gray-300 bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block cursor-crosshair touch-none"
          style={{ maxWidth: '100%', height: 'auto' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>
      <p className="text-xs text-gray-400">Draw your signature above</p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={handleClear} disabled={!hasStrokes}>
          Clear
        </Button>
        <Button variant="primary" onClick={handleConfirm} disabled={!hasStrokes}>
          Use This Signature
        </Button>
      </div>
    </div>
  );
};

export default SignatureDraw;
