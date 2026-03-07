import type { FC } from "react";
import { downloadBlob } from "../lib/file-helpers";
import Button from "./ui/Button";

interface DownloadButtonProps {
  data: Uint8Array;
  filename: string;
  label?: string;
}

const DownloadButton: FC<DownloadButtonProps> = ({
  data,
  filename,
  label = "Download",
}) => {
  const handleClick = () => {
    downloadBlob(data, filename);
  };

  return (
    <Button variant="primary" onClick={handleClick} className="w-full">
      {/* Download icon */}
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
          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4"
        />
      </svg>
      {label}
    </Button>
  );
};

export default DownloadButton;
