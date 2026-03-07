import PageLayout from '../../components/layout/PageLayout';
import DropZone from '../../components/DropZone';
import FileInfo from '../../components/FileInfo';
import DownloadButton from '../../components/DownloadButton';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import CompressionResult from './CompressionResult';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useCompress } from './useCompress';
import { MAX_PDF_SIZE_MB, ACCEPTED_PDF_TYPES } from '../../lib/constants';

export default function CompressPage() {
  const { files, addFiles, error: uploadError } = useFileUpload({
    multiple: false,
    maxSizeMB: MAX_PDF_SIZE_MB,
  });

  const {
    file,
    originalSize,
    compressedSize,
    result,
    isProcessing,
    error: compressError,
    setFile,
    compress,
    reset,
  } = useCompress();

  const handleFiles = async (fileList: File[]) => {
    await addFiles(fileList);
  };

  // When useFileUpload produces a file and it's different from the current one, set it
  const uploadedFile = files[0] ?? null;
  if (uploadedFile && uploadedFile !== file) {
    setFile(uploadedFile);
  }

  const error = uploadError ?? compressError;
  const hasResult = result !== null && compressedSize !== null;

  const outputFilename = file
    ? file.name.replace(/\.pdf$/i, '-compressed.pdf')
    : 'compressed.pdf';

  return (
    <PageLayout
      title="Compress PDF"
      description="Reduce PDF file size by optimizing file structure"
    >
      <div className="mt-6 space-y-6">
        {!file && (
          <DropZone
            accept={ACCEPTED_PDF_TYPES}
            multiple={false}
            maxSizeMB={MAX_PDF_SIZE_MB}
            onFiles={handleFiles}
          />
        )}

        {file && !hasResult && !isProcessing && (
          <div className="space-y-4">
            <FileInfo
              name={file.name}
              size={file.size}
              pageCount={file.pageCount}
            />
            <p className="text-sm text-gray-500">
              Optimizes file structure and removes metadata
            </p>
            <Button variant="primary" onClick={compress}>
              Compress PDF
            </Button>
          </div>
        )}

        {isProcessing && (
          <div className="flex flex-col items-center gap-3 py-12">
            <Spinner size="lg" />
            <p className="text-sm text-gray-600">Compressing PDF...</p>
          </div>
        )}

        {hasResult && result && (
          <div className="space-y-4">
            <CompressionResult
              originalSize={originalSize}
              compressedSize={compressedSize!}
            />
            <DownloadButton
              data={result}
              filename={outputFilename}
              label="Download Compressed PDF"
            />
            <Button variant="secondary" onClick={reset}>
              Process Another
            </Button>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </PageLayout>
  );
}
