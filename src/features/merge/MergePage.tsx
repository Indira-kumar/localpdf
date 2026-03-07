import { useCallback, useState } from "react";
import { PDFDocument } from "pdf-lib";
import PageLayout from "../../components/layout/PageLayout";
import DropZone from "../../components/DropZone";
import DownloadButton from "../../components/DownloadButton";
import Button from "../../components/ui/Button";
import SortableFileList from "./SortableFileList";
import { useMerge } from "./useMerge";
import { readFileAsArrayBuffer } from "../../lib/file-helpers";
import { MAX_PDF_SIZE_MB, ACCEPTED_PDF_TYPES } from "../../lib/constants";
import type { PdfFileItem } from "../../types/pdf";

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

  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDrop = useCallback(
    async (droppedFiles: File[]) => {
      setUploadError(null);

      // Read all files into ArrayBuffers in parallel upfront,
      // before any async processing that could cause re-renders.
      const reads = await Promise.all(
        droppedFiles.map(async (file) => {
          try {
            const arrayBuffer = await readFileAsArrayBuffer(file);
            return { file, arrayBuffer } as const;
          } catch {
            return { file, arrayBuffer: null } as const;
          }
        })
      );

      const newItems: PdfFileItem[] = [];
      for (const { file, arrayBuffer } of reads) {
        if (!arrayBuffer) {
          setUploadError(`Failed to read "${file.name}". The file may be corrupted.`);
          continue;
        }
        try {
          const pdfDoc = await PDFDocument.load(arrayBuffer, {
            ignoreEncryption: true,
          });
          newItems.push({
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            arrayBuffer,
            pageCount: pdfDoc.getPageCount(),
          });
        } catch {
          setUploadError(`Failed to read "${file.name}". The file may be corrupted.`);
        }
      }

      if (newItems.length > 0) {
        addMergeFiles(newItems);
      }
    },
    [addMergeFiles]
  );

  const error = mergeError || uploadError;

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
