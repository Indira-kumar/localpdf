import { useState, useCallback } from 'react';
import { usePdfWorker } from '../../hooks/usePdfWorker';
import type { PdfFileItem, SignatureSource, SignaturePlacement } from '../../types/pdf';

export function useSign() {
  const { execute, isProcessing } = usePdfWorker();

  const [file, setFile] = useState<PdfFileItem | null>(null);
  const [signature, setSignature] = useState<SignatureSource | null>(null);
  const [selectedPage, setSelectedPageRaw] = useState<number>(0);
  const [pageSelected, setPageSelected] = useState(false);
  const [placement, setPlacement] = useState<SignaturePlacement | null>(null);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback(async () => {
    if (!file || !signature || !placement) {
      setError('Missing file, signature, or placement.');
      return;
    }

    setError(null);

    try {
      const signatureType: 'png' | 'jpg' =
        signature.mimeType === 'image/png' ? 'png' : 'jpg';

      const output = await execute({
        type: 'sign',
        payload: file.arrayBuffer,
        signature: signature.imageData,
        signatureType,
        placement,
      } as Omit<Extract<import('../../types/worker').WorkerRequest, { type: 'sign' }>, 'id'>);

      setResult(output);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign PDF';
      setError(message);
    }
  }, [file, signature, placement, execute]);

  const reset = useCallback(() => {
    setFile(null);
    setSignature(null);
    setSelectedPageRaw(0);
    setPageSelected(false);
    setPlacement(null);
    setResult(null);
    setError(null);
  }, []);

  return {
    file,
    signature,
    selectedPage,
    placement,
    result,
    isProcessing,
    error,
    pageSelected,
    setFile,
    setSignature,
    setSelectedPage: (index: number) => {
      setSelectedPageRaw(index);
      setPageSelected(true);
    },
    setPlacement,
    apply,
    reset,
  };
}
