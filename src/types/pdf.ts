export interface PdfFileItem {
  id: string;                    // crypto.randomUUID()
  name: string;                  // original filename
  size: number;                  // bytes
  arrayBuffer: ArrayBuffer;      // raw file content
  pageCount: number;             // extracted via pdf-lib
}

export type RotationAngle = 0 | 90 | 180 | 270;

export interface PageRange {
  start: number;                 // 1-indexed
  end: number;                   // 1-indexed, inclusive
}

export interface SignatureSource {
  type: 'upload' | 'draw' | 'typed';
  imageData: ArrayBuffer;
  mimeType: 'image/png' | 'image/jpeg';
  preview: string;               // data URL for UI display
}

export interface SignaturePlacement {
  pageIndex: number;             // 0-indexed
  x: number;                     // PDF points from left
  y: number;                     // PDF points from bottom
  width: number;                 // PDF points
  height: number;                // PDF points
}
