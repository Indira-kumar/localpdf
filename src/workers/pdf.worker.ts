/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */
import { mergePdfs, splitPdf, compressPdf, rotatePdf, signPdf } from '../lib/pdf-utils';
import type { WorkerRequest, WorkerResponse } from '../types/worker';

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const request = e.data;
  try {
    let result: Uint8Array;
    switch (request.type) {
      case 'merge':
        result = await mergePdfs(request.payloads);
        break;
      case 'split':
        result = await splitPdf(request.payload, request.pageIndices);
        break;
      case 'compress':
        result = await compressPdf(request.payload);
        break;
      case 'rotate':
        result = await rotatePdf(request.payload, request.rotations);
        break;
      case 'sign':
        result = await signPdf(request.payload, request.signature, request.signatureType, request.placement);
        break;
    }
    const response: WorkerResponse = { id: request.id, type: 'success', result: result! };
    self.postMessage(response, [result!.buffer] as unknown as StructuredSerializeOptions[]);
  } catch (err) {
    const response: WorkerResponse = { id: request.id, type: 'error', message: err instanceof Error ? err.message : 'Unknown error' };
    self.postMessage(response);
  }
};
