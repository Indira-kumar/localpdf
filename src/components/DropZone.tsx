import { type FC, type DragEvent, useCallback, useRef, useState } from "react";
import { validatePdfFile, validateImageFile } from "../lib/file-helpers";

interface DropZoneProps {
  accept: string[];
  multiple: boolean;
  maxSizeMB: number;
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

const DropZone: FC<DropZoneProps> = ({
  accept,
  multiple,
  maxSizeMB,
  onFiles,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      if (accept.includes("application/pdf")) {
        return validatePdfFile(file, maxSizeMB);
      }
      if (
        accept.includes("image/png") ||
        accept.includes("image/jpeg")
      ) {
        return validateImageFile(file, maxSizeMB);
      }
      return { valid: true };
    },
    [accept, maxSizeMB]
  );

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      setError(null);
      const files = Array.from(fileList);
      const selected = multiple ? files : files.slice(0, 1);

      const errors: string[] = [];
      const validFiles: File[] = [];

      for (const file of selected) {
        const result = validateFile(file);
        if (result.valid) {
          validFiles.push(file);
        } else {
          errors.push(`${file.name}: ${result.error}`);
        }
      }

      if (errors.length > 0) {
        setError(errors.join(" "));
      }

      if (validFiles.length > 0) {
        onFiles(validFiles);
      }
    },
    [multiple, validateFile, onFiles]
  );

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
    },
    []
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (!disabled && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [disabled, handleFiles]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
      // Reset so re-selecting the same file triggers change
      e.target.value = "";
    },
    [handleFiles]
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
          disabled
            ? "opacity-50 pointer-events-none border-gray-300 bg-gray-50"
            : isDragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-white hover:border-gray-400"
        }`}
      >
        {/* Upload icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16"
          />
        </svg>

        <p className="text-sm text-gray-600">
          Drag &amp; drop files here or click to browse
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={accept.join(",")}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default DropZone;
