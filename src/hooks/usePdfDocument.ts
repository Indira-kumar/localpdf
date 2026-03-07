import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { loadPdfDocument } from '../lib/pdf-renderer';

interface UsePdfDocumentResult {
  document: PDFDocumentProxy | null;
  pageCount: number;
  loading: boolean;
  error: string | null;
}

export function usePdfDocument(buffer: ArrayBuffer | null): UsePdfDocumentResult {
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const destroyRef = useRef(false);

  useEffect(() => {
    destroyRef.current = false;

    if (!buffer) {
      setDocument(null);
      setPageCount(0);
      setLoading(false);
      setError(null);
      return;
    }

    let doc: PDFDocumentProxy | null = null;

    setLoading(true);
    setError(null);

    loadPdfDocument(buffer)
      .then((loadedDoc) => {
        if (destroyRef.current) {
          void loadedDoc.destroy();
          return;
        }
        doc = loadedDoc;
        setDocument(loadedDoc);
        setPageCount(loadedDoc.numPages);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (destroyRef.current) return;
        const message = err instanceof Error ? err.message : 'Failed to load PDF';
        setError(message);
        setLoading(false);
      });

    return () => {
      destroyRef.current = true;
      if (doc) {
        void doc.destroy();
      }
    };
  }, [buffer]);

  return { document, pageCount, loading, error };
}
