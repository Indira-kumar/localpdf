import { getDocument } from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

export async function loadPdfDocument(buffer: ArrayBuffer): Promise<PDFDocumentProxy> {
  const doc = await getDocument({ data: buffer }).promise;
  return doc;
}

export async function renderPageToCanvas(
  doc: PDFDocumentProxy,
  pageNum: number,
  canvas: HTMLCanvasElement,
  scale: number,
): Promise<void> {
  const page = await doc.getPage(pageNum); // 1-indexed
  const viewport = page.getViewport({ scale });

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Could not get 2D canvas context');
  }

  await page.render({ canvasContext: context, viewport }).promise;
}

export function getPageDimensions(page: PDFPageProxy): { width: number; height: number } {
  const viewport = page.getViewport({ scale: 1 });
  return { width: viewport.width, height: viewport.height };
}
