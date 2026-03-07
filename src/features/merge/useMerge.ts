import { useState, useCallback } from "react";
import { usePdfWorker } from "../../hooks/usePdfWorker";
import type { PdfFileItem } from "../../types/pdf";

export function useMerge() {
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { execute, isProcessing } = usePdfWorker();

  const addFiles = useCallback((items: PdfFileItem[]) => {
    setFiles((prev) => [...prev, ...items]);
    setResult(null);
    setError(null);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setResult(null);
    setError(null);
  }, []);

  const reorderFiles = useCallback((fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      const removed = updated.splice(fromIndex, 1);
      if (removed[0]) {
        updated.splice(toIndex, 0, removed[0]);
      }
      return updated;
    });
  }, []);

  const merge = useCallback(async () => {
    if (files.length < 2) return;
    setError(null);

    try {
      const payloads = files.map((f) => f.arrayBuffer);
      const merged = await execute({
        type: "merge",
        payloads,
      } as Parameters<typeof execute>[0]);
      setResult(merged);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Merge failed.");
    }
  }, [files, execute]);

  const reset = useCallback(() => {
    setFiles([]);
    setResult(null);
    setError(null);
  }, []);

  return {
    files,
    result,
    isProcessing,
    error,
    addFiles,
    removeFile,
    reorderFiles,
    merge,
    reset,
  };
}
