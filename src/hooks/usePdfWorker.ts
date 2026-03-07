import { useRef, useState, useCallback } from 'react';
import type { WorkerRequest, WorkerResponse } from '../types/worker';

export function usePdfWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('../workers/pdf.worker.ts', import.meta.url),
        { type: 'module' }
      );
    }
    return workerRef.current;
  }, []);

  const execute = useCallback((request: Omit<WorkerRequest, 'id'>): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const worker = getWorker();
      const id = crypto.randomUUID();
      setIsProcessing(true);

      const handler = (e: MessageEvent<WorkerResponse>) => {
        if (e.data.id !== id) return;
        worker.removeEventListener('message', handler);
        setIsProcessing(false);
        if (e.data.type === 'success') {
          resolve(e.data.result);
        } else {
          reject(new Error(e.data.message));
        }
      };

      worker.addEventListener('message', handler);
      worker.postMessage({ ...request, id });
    });
  }, [getWorker]);

  return { execute, isProcessing };
}
