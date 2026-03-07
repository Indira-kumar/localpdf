import { useCallback } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import DropZone from '../../components/DropZone';
import PdfThumbnailGrid from '../../components/PdfThumbnailGrid';
import DownloadButton from '../../components/DownloadButton';
import Button from '../../components/ui/Button';
import RotateControls from './RotateControls';
import { useRotate } from './useRotate';
import { usePdfDocument } from '../../hooks/usePdfDocument';
import { useFileUpload } from '../../hooks/useFileUpload';
import { MAX_PDF_SIZE_MB, ACCEPTED_PDF_TYPES } from '../../lib/constants';
import type { RotationAngle } from '../../types/pdf';

const ANGLE_CYCLE: RotationAngle[] = [0, 90, 180, 270];

function nextAngle(current: RotationAngle): RotationAngle {
  const idx = ANGLE_CYCLE.indexOf(current);
  return ANGLE_CYCLE[(idx + 1) % ANGLE_CYCLE.length]!;
}

export default function RotatePage() {
  const {
    file,
    rotations,
    result,
    isProcessing,
    error,
    setFile,
    rotatePage,
    rotateAll,
    resetRotations,
    save,
    reset,
  } = useRotate();

  const { files, addFiles } = useFileUpload({
    multiple: false,
    maxSizeMB: MAX_PDF_SIZE_MB,
  });

  const uploadedFile = files[0] ?? null;

  // When a file is uploaded, set it in the rotate hook
  const handleFiles = useCallback(
    async (fileList: File[]) => {
      await addFiles(fileList);
    },
    [addFiles]
  );

  // Sync uploaded file to useRotate
  if (uploadedFile && uploadedFile !== file) {
    setFile(uploadedFile);
  }

  const { document, pageCount } = usePdfDocument(file?.arrayBuffer ?? null);

  const hasRotations = Object.keys(rotations).length > 0;

  const handlePageRotate = useCallback(
    (pageIndex: number) => {
      const current = (rotations[pageIndex] ?? 0) as RotationAngle;
      rotatePage(pageIndex, nextAngle(current));
    },
    [rotations, rotatePage]
  );

  const renderOverlay = useCallback(
    (pageIndex: number) => {
      const angle = (rotations[pageIndex] ?? 0) as RotationAngle;
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePageRotate(pageIndex);
          }}
          className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white hover:bg-black/80 transition-colors"
        >
          {angle === 0 ? '0\u00B0' : `${angle}\u00B0`}
        </button>
      );
    },
    [rotations, handlePageRotate]
  );

  return (
    <PageLayout title="Rotate PDF" description="Rotate individual or all pages">
      <div className="mt-6 space-y-6">
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* No file: show DropZone */}
        {!file && (
          <DropZone
            accept={ACCEPTED_PDF_TYPES}
            multiple={false}
            maxSizeMB={MAX_PDF_SIZE_MB}
            onFiles={handleFiles}
          />
        )}

        {/* File loaded, no result yet */}
        {file && !result && document && (
          <>
            <RotateControls
              onRotateAllCW={() => rotateAll(90)}
              onRotateAllCCW={() => rotateAll(270)}
              onReset={resetRotations}
              disabled={isProcessing}
            />

            <PdfThumbnailGrid
              document={document}
              pageCount={pageCount}
              mode="view"
              rotations={rotations}
              onPageClick={handlePageRotate}
              renderOverlay={renderOverlay}
            />

            <Button
              variant="primary"
              onClick={save}
              disabled={!hasRotations || isProcessing}
              loading={isProcessing}
            >
              Save Rotated PDF
            </Button>
          </>
        )}

        {/* Result ready */}
        {result && (
          <div className="space-y-4">
            <DownloadButton
              data={result}
              filename={file ? `rotated-${file.name}` : 'rotated.pdf'}
            />
            <Button variant="secondary" onClick={reset}>
              Process Another
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
