import { useState, useCallback } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import DropZone from '../../components/DropZone';
import PdfThumbnailGrid from '../../components/PdfThumbnailGrid';
import DownloadButton from '../../components/DownloadButton';
import Button from '../../components/ui/Button';
import PageSelector from './PageSelector';
import PageRangeInput from './PageRangeInput';
import { useSplit } from './useSplit';
import { usePdfDocument } from '../../hooks/usePdfDocument';
import { useFileUpload } from '../../hooks/useFileUpload';
import { MAX_PDF_SIZE_MB, ACCEPTED_PDF_TYPES } from '../../lib/constants';

export default function SplitPage() {
  const {
    file,
    selectedPages,
    result,
    isProcessing,
    error,
    setFile,
    togglePage,
    selectAll,
    deselectAll,
    setFromRangeString,
    extract,
    reset,
  } = useSplit();

  const { files, addFiles } = useFileUpload({
    multiple: false,
    maxSizeMB: MAX_PDF_SIZE_MB,
  });

  const [rangeInput, setRangeInput] = useState('');

  const uploadedFile = files[0] ?? null;

  // Sync uploaded file to useSplit
  if (uploadedFile && uploadedFile !== file) {
    setFile(uploadedFile);
  }

  const { document, pageCount } = usePdfDocument(file?.arrayBuffer ?? null);

  const handleFiles = useCallback(
    async (fileList: File[]) => {
      await addFiles(fileList);
    },
    [addFiles]
  );

  const handleRangeChange = useCallback(
    (val: string) => {
      setRangeInput(val);
      setFromRangeString(val);
    },
    [setFromRangeString]
  );

  const handleReset = useCallback(() => {
    reset();
    setRangeInput('');
  }, [reset]);

  return (
    <PageLayout title="Split PDF" description="Extract specific pages from a PDF">
      <div className="mt-6 space-y-6">
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* No file: show DropZone */}
        {!file && !result && (
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
            <PageSelector
              selectedCount={selectedPages.size}
              totalCount={pageCount}
              onSelectAll={selectAll}
              onDeselectAll={deselectAll}
            />

            <PageRangeInput
              value={rangeInput}
              onChange={handleRangeChange}
              error={null}
            />

            <PdfThumbnailGrid
              document={document}
              pageCount={pageCount}
              mode="selectable"
              selectedPages={selectedPages}
              onPageClick={togglePage}
            />

            <Button
              variant="primary"
              onClick={extract}
              disabled={selectedPages.size === 0 || isProcessing}
              loading={isProcessing}
            >
              Extract Pages
            </Button>
          </>
        )}

        {/* Result ready */}
        {result && (
          <div className="space-y-4">
            <DownloadButton
              data={result}
              filename={file ? `split-${file.name}` : 'split.pdf'}
            />
            <Button variant="secondary" onClick={handleReset}>
              Process Another
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
