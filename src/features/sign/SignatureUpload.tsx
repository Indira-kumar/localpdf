import { useCallback, useState } from 'react';
import DropZone from '../../components/DropZone';
import Button from '../../components/ui/Button';
import SignatureDraw from './SignatureDraw';
import { useSignatureContext } from './SignatureProvider';
import { readFileAsArrayBuffer } from '../../lib/file-helpers';
import { ACCEPTED_IMAGE_TYPES, MAX_SIGNATURE_SIZE_MB } from '../../lib/constants';

type Tab = 'draw' | 'upload';

export default function SignatureUpload() {
  const { signature, setSignature, clearSignature } = useSignatureContext();
  const [activeTab, setActiveTab] = useState<Tab>('draw');

  const handleFiles = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      try {
        const arrayBuffer = await readFileAsArrayBuffer(file);

        const blob = new Blob([arrayBuffer], { type: file.type });
        const preview = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(blob);
        });

        setSignature({
          type: 'upload',
          imageData: arrayBuffer,
          mimeType: file.type as 'image/png' | 'image/jpeg',
          preview,
        });
      } catch {
        // DropZone handles validation errors
      }
    },
    [setSignature],
  );

  // Show preview if signature is already set
  if (signature) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm font-medium text-gray-700">Signature Preview</p>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <img
            src={signature.preview}
            alt="Signature preview"
            className="max-h-24 max-w-xs object-contain"
          />
        </div>
        <Button variant="secondary" onClick={clearSignature}>
          Clear &amp; Choose Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="mb-4 flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('draw')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'draw'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Draw
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'upload'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Upload Image
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'draw' && <SignatureDraw />}

      {activeTab === 'upload' && (
        <div>
          <p className="mb-3 text-sm text-gray-600">
            Upload a signature image (PNG or JPEG)
          </p>
          <DropZone
            accept={ACCEPTED_IMAGE_TYPES}
            multiple={false}
            maxSizeMB={MAX_SIGNATURE_SIZE_MB}
            onFiles={handleFiles}
          />
        </div>
      )}
    </div>
  );
}
