import { useCallback } from 'react';
import DropZone from '../../components/DropZone';
import Button from '../../components/ui/Button';
import { useSignatureContext } from './SignatureProvider';
import { readFileAsArrayBuffer } from '../../lib/file-helpers';
import { ACCEPTED_IMAGE_TYPES, MAX_SIGNATURE_SIZE_MB } from '../../lib/constants';

export default function SignatureUpload() {
  const { signature, setSignature, clearSignature } = useSignatureContext();

  const handleFiles = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      try {
        const arrayBuffer = await readFileAsArrayBuffer(file);

        // Create data URL for preview
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
          Clear
        </Button>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-gray-700">
        Upload your signature image (PNG or JPEG)
      </p>
      <DropZone
        accept={ACCEPTED_IMAGE_TYPES}
        multiple={false}
        maxSizeMB={MAX_SIGNATURE_SIZE_MB}
        onFiles={handleFiles}
      />
    </div>
  );
}
