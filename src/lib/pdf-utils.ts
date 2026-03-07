import { PDFDocument, degrees } from 'pdf-lib';

export async function mergePdfs(buffers: ArrayBuffer[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  for (const buffer of buffers) {
    const doc = await PDFDocument.load(buffer);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach(page => merged.addPage(page));
  }
  return merged.save();
}

export async function splitPdf(buffer: ArrayBuffer, pageIndices: number[]): Promise<Uint8Array> {
  const source = await PDFDocument.load(buffer);
  const newDoc = await PDFDocument.create();
  const pages = await newDoc.copyPages(source, pageIndices);
  pages.forEach(page => newDoc.addPage(page));
  return newDoc.save();
}

export async function compressPdf(buffer: ArrayBuffer): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer);
  doc.setTitle('');
  doc.setAuthor('');
  doc.setSubject('');
  doc.setKeywords([]);
  doc.setProducer('');
  doc.setCreator('');
  return doc.save({ useObjectStreams: true });
}

export async function rotatePdf(
  buffer: ArrayBuffer, rotations: Record<number, number>
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer);
  for (const [pageIdx, angle] of Object.entries(rotations)) {
    const page = doc.getPage(Number(pageIdx));
    page.setRotation(degrees(angle));
  }
  return doc.save();
}

export async function signPdf(
  buffer: ArrayBuffer,
  signatureBytes: ArrayBuffer,
  signatureType: 'png' | 'jpg',
  placement: { pageIndex: number; x: number; y: number; width: number; height: number }
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer);
  const image = signatureType === 'png'
    ? await doc.embedPng(signatureBytes)
    : await doc.embedJpg(signatureBytes);
  const page = doc.getPage(placement.pageIndex);
  page.drawImage(image, {
    x: placement.x,
    y: placement.y,
    width: placement.width,
    height: placement.height,
  });
  return doc.save();
}
