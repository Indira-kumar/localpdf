import { useState, useCallback } from 'react';
import { usePdfWorker } from '../../hooks/usePdfWorker';
import type { PdfFileItem } from '../../types/pdf';
import type { WorkerRequest } from '../../types/worker';

interface UseSplitReturn {
  file: PdfFileItem | null;
  selectedPages: Set<number>;
  result: Uint8Array | null;
  isProcessing: boolean;
  error: string | null;
  setFile: (item: PdfFileItem) => void;
  togglePage: (pageIndex: number) => void;
  selectAll: () => void;
  deselectAll: () => void;
  setFromRangeString: (input: string) => void;
  extract: () => Promise<void>;
  reset: () => void;
}

export function useSplit(): UseSplitReturn {
  const [file, setFileState] = useState<PdfFileItem | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { execute, isProcessing } = usePdfWorker();

  const setFile = useCallback((item: PdfFileItem) => {
    setFileState(item);
    setSelectedPages(new Set());
    setResult(null);
    setError(null);
  }, []);

  const togglePage = useCallback((pageIndex: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageIndex)) {
        next.delete(pageIndex);
      } else {
        next.add(pageIndex);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (!file) return;
    const all = new Set<number>();
    for (let i = 0; i < file.pageCount; i++) {
      all.add(i);
    }
    setSelectedPages(all);
  }, [file]);

  const deselectAll = useCallback(() => {
    setSelectedPages(new Set());
  }, []);

  const setFromRangeString = useCallback(
    (input: string) => {
      if (!file) return;
      setError(null);

      const trimmed = input.trim();
      if (trimmed === '') {
        setSelectedPages(new Set());
        return;
      }

      const pages = new Set<number>();
      const parts = trimmed.split(',');

      for (const part of parts) {
        const rangePart = part.trim();
        if (rangePart === '') continue;

        const rangeMatch = rangePart.match(/^(\d+)\s*-\s*(\d+)$/);
        if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
          const start = parseInt(rangeMatch[1], 10);
          const end = parseInt(rangeMatch[2], 10);
          if (start < 1 || end < 1 || start > file.pageCount || end > file.pageCount) {
            setError(`Invalid range: ${rangePart}. Pages must be between 1 and ${file.pageCount}.`);
            return;
          }
          if (start > end) {
            setError(`Invalid range: ${rangePart}. Start must be less than or equal to end.`);
            return;
          }
          for (let i = start; i <= end; i++) {
            pages.add(i - 1);
          }
        } else {
          const num = parseInt(rangePart, 10);
          if (isNaN(num) || num < 1 || num > file.pageCount) {
            setError(`Invalid page number: ${rangePart}. Pages must be between 1 and ${file.pageCount}.`);
            return;
          }
          pages.add(num - 1);
        }
      }

      setSelectedPages(pages);
    },
    [file]
  );

  const extract = useCallback(async () => {
    if (!file || selectedPages.size === 0) return;
    setError(null);

    try {
      const sortedIndices = Array.from(selectedPages).sort((a, b) => a - b);
      const output = await execute({
        type: 'split',
        payload: file.arrayBuffer,
        pageIndices: sortedIndices,
      } as Omit<Extract<WorkerRequest, { type: 'split' }>, 'id'>);
      setResult(output);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to extract pages.';
      setError(message);
    }
  }, [file, selectedPages, execute]);

  const reset = useCallback(() => {
    setFileState(null);
    setSelectedPages(new Set());
    setResult(null);
    setError(null);
  }, []);

  return {
    file,
    selectedPages,
    result,
    isProcessing,
    error,
    setFile,
    togglePage,
    selectAll,
    deselectAll,
    setFromRangeString,
    extract,
    reset,
  };
}
