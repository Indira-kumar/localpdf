import type { FC } from 'react';
import { formatFileSize } from '../../lib/file-helpers';
import Badge from '../../components/ui/Badge';

interface CompressionResultProps {
  originalSize: number;
  compressedSize: number;
}

const CompressionResult: FC<CompressionResultProps> = ({
  originalSize,
  compressedSize,
}) => {
  const reduction = originalSize > 0
    ? Math.round((1 - compressedSize / originalSize) * 100)
    : 0;
  const isReduced = compressedSize < originalSize;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-sm font-semibold text-gray-900">Compression Result</h3>
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">Original</span>
          <span className="text-sm font-medium text-gray-900">
            {formatFileSize(originalSize)}
          </span>
        </div>
        <div className="text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">Compressed</span>
          <span className="text-sm font-medium text-gray-900">
            {formatFileSize(compressedSize)}
          </span>
        </div>
        <Badge variant={isReduced ? 'success' : 'warning'}>
          {isReduced ? `${reduction}% smaller` : 'No reduction'}
        </Badge>
      </div>
    </div>
  );
};

export default CompressionResult;
