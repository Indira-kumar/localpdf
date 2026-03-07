import { useCallback, useRef } from "react";
import PageLayout from "../../components/layout/PageLayout";
import DropZone from "../../components/DropZone";
import DownloadButton from "../../components/DownloadButton";
import Button from "../../components/ui/Button";
import SortableFileList from "./SortableFileList";
import { useMerge } from "./useMerge";
import { useFileUpload } from "../../hooks/useFileUpload";
import { MAX_PDF_SIZE_MB, ACCEPTED_PDF_TYPES } from "../../lib/constants";

export default function MergePage() {
  const {
    files,
    result,
    isProcessing,
    error: mergeError,
    addFiles: addMergeFiles,
    removeFile,
    reorderFiles,
    merge,
    reset,
  } = useMerge();

  const fileUpload = useFileUpload({
    multiple: true,
    maxSizeMB: MAX_PDF_SIZE_MB,
  });

  // Track previous file count to detect newly added files
  const prevFileCount = useRef(0);

  const handleDrop = useCallback(
    async (droppedFiles: File[]) => {
      await fileUpload.addFiles(droppedFiles);
    },
    [fileUpload]
  );

  // Sync: whenever fileUpload.files grows, pass new items to useMerge
  if (fileUpload.files.length > prevFileCount.current) {
    const newItems = fileUpload.files.slice(prevFileCount.current);
    prevFileCount.current = fileUpload.files.length;
    addMergeFiles(newItems);
  }

  const error = mergeError || fileUpload.error;

  return (
    <PageLayout
      title="Merge PDFs"
      description="Combine multiple PDFs into one document"
    >
      <div className="mt-6 space-y-6">
        {result ? (
          <div className="space-y-4">
            <DownloadButton
              data={result}
              filename="merged.pdf"
              label="Download Merged PDF"
            />
            <Button variant="secondary" onClick={reset} className="w-full">
              Start Over
            </Button>
          </div>
        ) : files.length === 0 ? (
          <DropZone
            accept={ACCEPTED_PDF_TYPES}
            multiple
            maxSizeMB={MAX_PDF_SIZE_MB}
            onFiles={handleDrop}
          />
        ) : (
          <div className="space-y-4">
            <SortableFileList
              files={files}
              onReorder={reorderFiles}
              onRemove={removeFile}
            />

            <DropZone
              accept={ACCEPTED_PDF_TYPES}
              multiple
              maxSizeMB={MAX_PDF_SIZE_MB}
              onFiles={handleDrop}
            />

            <Button
              variant="primary"
              onClick={merge}
              disabled={files.length < 2 || isProcessing}
              loading={isProcessing}
              className="w-full"
            >
              Merge {files.length} PDF{files.length !== 1 ? "s" : ""}
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </PageLayout>
  );
}
