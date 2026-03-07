import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { validatePdfFile, readFileAsArrayBuffer } from "../lib/file-helpers";
import type { PdfFileItem } from "../types/pdf";

interface UseFileUploadOptions {
  multiple: boolean;
  maxSizeMB: number;
}

interface UseFileUploadReturn {
  files: PdfFileItem[];
  addFiles: (fileList: File[]) => Promise<void>;
  removeFile: (id: string) => void;
  reorderFiles: (fromIndex: number, toIndex: number) => void;
  clearFiles: () => void;
  error: string | null;
  clearError: () => void;
}

export function useFileUpload(options: UseFileUploadOptions): UseFileUploadReturn {
  const { multiple, maxSizeMB } = options;
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback(
    async (fileList: File[]) => {
      setError(null);
      const toProcess = multiple ? fileList : fileList.slice(0, 1);
      const newItems: PdfFileItem[] = [];

      for (const file of toProcess) {
        const validation = validatePdfFile(file, maxSizeMB);
        if (!validation.valid) {
          setError(validation.error ?? "Invalid file.");
          continue;
        }

        try {
          const arrayBuffer = await readFileAsArrayBuffer(file);
          const pdfDoc = await PDFDocument.load(arrayBuffer, {
            ignoreEncryption: true,
          });
          const pageCount = pdfDoc.getPageCount();

          newItems.push({
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            arrayBuffer,
            pageCount,
          });
        } catch {
          setError(`Failed to read "${file.name}". The file may be corrupted.`);
        }
      }

      if (newItems.length > 0) {
        setFiles((prev) => (multiple ? [...prev, ...newItems] : newItems));
      }
    },
    [multiple, maxSizeMB]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
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

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    files,
    addFiles,
    removeFile,
    reorderFiles,
    clearFiles,
    error,
    clearError,
  };
}
