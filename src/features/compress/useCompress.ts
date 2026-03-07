import { useState, useCallback } from 'react';
import { usePdfWorker } from '../../hooks/usePdfWorker';
import type { PdfFileItem } from '../../types/pdf';

export function useCompress() {
  const { execute, isProcessing } = usePdfWorker();
  const [file, setFile] = useState<PdfFileItem | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);

  const originalSize = file?.size ?? 0;

  const compress = useCallback(async () => {
    if (!file) return;
    setError(null);
    setResult(null);
    setCompressedSize(null);

    try {
      const output = await execute({
        type: 'compress',
        payload: file.arrayBuffer,
      } as Omit<Extract<import('../../types/worker').WorkerRequest, { type: 'compress' }>, 'id'>);
      setResult(output);
      setCompressedSize(output.byteLength);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compression failed.');
    }
  }, [file, execute]);

  const reset = useCallback(() => {
    setFile(null);
    setResult(null);
    setCompressedSize(null);
    setError(null);
  }, []);

  return {
    file,
    originalSize,
    compressedSize,
    result,
    isProcessing,
    error,
    setFile,
    compress,
    reset,
  };
}
