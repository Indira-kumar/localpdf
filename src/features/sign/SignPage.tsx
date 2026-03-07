import { useCallback, useEffect, useMemo } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import DropZone from '../../components/DropZone';
import PdfThumbnailGrid from '../../components/PdfThumbnailGrid';
import DownloadButton from '../../components/DownloadButton';
import Button from '../../components/ui/Button';
import { SignatureProvider, useSignatureContext } from './SignatureProvider';
import SignatureUpload from './SignatureUpload';
import SignaturePlacer from './SignaturePlacer';
import { useSign } from './useSign';
import { usePdfDocument } from '../../hooks/usePdfDocument';
import { useFileUpload } from '../../hooks/useFileUpload';
import { MAX_PDF_SIZE_MB, ACCEPTED_PDF_TYPES } from '../../lib/constants';

function SignPageContent() {
  const {
    file,
    signature,
    selectedPage,
    pageSelected,
    placement,
    result,
    isProcessing,
    error,
    setFile,
    setSignature,
    setSelectedPage,
    setPlacement,
    apply,
    reset,
  } = useSign();

  // Sync context signature to useSign state
  const { signature: ctxSignature } = useSignatureContext();
  useEffect(() => {
    if (ctxSignature) {
      setSignature(ctxSignature);
    }
  }, [ctxSignature, setSignature]);

  const { files, addFiles } = useFileUpload({ multiple: false, maxSizeMB: MAX_PDF_SIZE_MB });
  const pdfFile = files[0] ?? null;

  // Sync uploaded file to useSign
  const handlePdfFiles = useCallback(
    async (fileList: File[]) => {
      await addFiles(fileList);
    },
    [addFiles],
  );

  // When pdfFile changes, update useSign's file
  // We use useMemo to detect changes
  useMemo(() => {
    if (pdfFile && (!file || pdfFile.id !== file.id)) {
      setFile(pdfFile);
    }
  }, [pdfFile, file, setFile]);

  const buffer = file?.arrayBuffer ?? null;
  const { document, pageCount } = usePdfDocument(buffer);

  const selectedPages = useMemo(() => new Set([selectedPage]), [selectedPage]);

  const handlePageClick = useCallback(
    (pageIndex: number) => {
      setSelectedPage(pageIndex);
      setPlacement(null); // Reset placement when page changes
    },
    [setSelectedPage, setPlacement],
  );

  // Determine current step
  const currentStep = result
    ? 6
    : placement
      ? 5
      : pageSelected && document && signature
        ? 4
        : signature && file
          ? 3
          : file
            ? 2
            : 1;

  // For step calculation display (max 5 before result)
  const displayStep = Math.min(currentStep, 5);

  return (
    <PageLayout title="Sign PDF" description="Add your signature to a PDF">
      <div className="mt-6">
        {/* Step indicator */}
        {!result && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-500">
              Step {displayStep} of 5
            </p>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < displayStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Upload PDF */}
        {currentStep === 1 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-800">
              Upload a PDF
            </h2>
            <DropZone
              accept={ACCEPTED_PDF_TYPES}
              multiple={false}
              maxSizeMB={MAX_PDF_SIZE_MB}
              onFiles={handlePdfFiles}
            />
          </div>
        )}

        {/* Step 2: Upload signature */}
        {currentStep === 2 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-800">
              Upload Your Signature
            </h2>
            <SignatureUpload />
          </div>
        )}

        {/* Step 3: Select page */}
        {currentStep === 3 && document && (
          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-800">
              Select a Page
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Choose the page where you want to place your signature.
            </p>
            <PdfThumbnailGrid
              document={document}
              pageCount={pageCount}
              mode="selectable"
              selectedPages={selectedPages}
              onPageClick={handlePageClick}
            />
          </div>
        )}

        {/* Step 4: Position signature */}
        {currentStep === 4 && document && signature && (
          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-800">
              Position Your Signature
            </h2>
            <SignaturePlacer
              document={document}
              pageIndex={selectedPage}
              onPlacement={setPlacement}
              signaturePreview={signature.preview}
            />
          </div>
        )}

        {/* Step 5: Apply */}
        {currentStep === 5 && !result && (
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Apply Signature
            </h2>
            <p className="text-sm text-gray-600">
              Your signature is positioned. Click below to apply it to the PDF.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={apply}
              loading={isProcessing}
              disabled={isProcessing}
            >
              Apply Signature
            </Button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-lg font-semibold text-green-700">
              Signature Applied!
            </h2>
            <DownloadButton
              data={result}
              filename={file ? `signed_${file.name}` : 'signed.pdf'}
              label="Download Signed PDF"
            />
            <Button variant="secondary" onClick={reset}>
              Start Over
            </Button>
          </div>
        )}

        {/* Error display */}
        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}
      </div>
    </PageLayout>
  );
}

export default function SignPage() {
  return (
    <SignatureProvider>
      <SignPageContent />
    </SignatureProvider>
  );
}
