import { useState, useCallback } from 'react';
import { usePdfWorker } from '../../hooks/usePdfWorker';
import type { PdfFileItem, RotationAngle } from '../../types/pdf';

interface UseRotateReturn {
  file: PdfFileItem | null;
  rotations: Record<number, RotationAngle>;
  result: Uint8Array | null;
  isProcessing: boolean;
  error: string | null;
  setFile: (item: PdfFileItem) => void;
  rotatePage: (pageIndex: number, angle: RotationAngle) => void;
  rotateAll: (angle: RotationAngle) => void;
  resetRotations: () => void;
  save: () => Promise<void>;
  reset: () => void;
}

export function useRotate(): UseRotateReturn {
  const [file, setFileState] = useState<PdfFileItem | null>(null);
  const [rotations, setRotations] = useState<Record<number, RotationAngle>>({});
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { execute, isProcessing } = usePdfWorker();

  const setFile = useCallback((item: PdfFileItem) => {
    setFileState(item);
    setRotations({});
    setResult(null);
    setError(null);
  }, []);

  const rotatePage = useCallback((pageIndex: number, angle: RotationAngle) => {
    setRotations((prev) => {
      if (angle === 0) {
        const next = { ...prev };
        delete next[pageIndex];
        return next;
      }
      return { ...prev, [pageIndex]: angle };
    });
  }, []);

  const rotateAll = useCallback(
    (angle: RotationAngle) => {
      if (!file) return;
      const next: Record<number, RotationAngle> = {};
      for (let i = 0; i < file.pageCount; i++) {
        if (angle !== 0) {
          next[i] = angle;
        }
      }
      setRotations(next);
    },
    [file]
  );

  const resetRotations = useCallback(() => {
    setRotations({});
  }, []);

  const save = useCallback(async () => {
    if (!file) return;
    setError(null);

    // Only include pages with non-zero rotation
    const nonZeroRotations: Record<number, number> = {};
    for (const [key, value] of Object.entries(rotations)) {
      if (value !== 0) {
        nonZeroRotations[Number(key)] = value;
      }
    }

    if (Object.keys(nonZeroRotations).length === 0) return;

    try {
      const output = await execute({
        type: 'rotate',
        payload: file.arrayBuffer,
        rotations: nonZeroRotations,
      } as Omit<Extract<import('../../types/worker').WorkerRequest, { type: 'rotate' }>, 'id'>);
      setResult(output);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to rotate PDF';
      setError(message);
    }
  }, [file, rotations, execute]);

  const reset = useCallback(() => {
    setFileState(null);
    setRotations({});
    setResult(null);
    setError(null);
  }, []);

  return {
    file,
    rotations,
    result,
    isProcessing,
    error,
    setFile,
    rotatePage,
    rotateAll,
    resetRotations,
    save,
    reset,
  };
}
