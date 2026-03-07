import type { SignaturePlacement } from './pdf';

export type WorkerRequest =
  | { id: string; type: 'merge'; payloads: ArrayBuffer[] }
  | { id: string; type: 'split'; payload: ArrayBuffer; pageIndices: number[] }
  | { id: string; type: 'compress'; payload: ArrayBuffer }
  | { id: string; type: 'rotate'; payload: ArrayBuffer; rotations: Record<number, number> }
  | { id: string; type: 'sign'; payload: ArrayBuffer;
      signature: ArrayBuffer; signatureType: 'png' | 'jpg';
      placement: SignaturePlacement };

export type WorkerResponse =
  | { id: string; type: 'success'; result: Uint8Array }
  | { id: string; type: 'error'; message: string };
