import type { FC } from "react";
import { formatFileSize } from "../lib/file-helpers";
import Badge from "./ui/Badge";

interface FileInfoProps {
  name: string;
  size: number;
  pageCount: number;
}

const FileInfo: FC<FileInfoProps> = ({ name, size, pageCount }) => {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="max-w-[200px] truncate font-medium text-gray-900" title={name}>
        {name}
      </span>
      <span className="text-gray-500">{formatFileSize(size)}</span>
      <Badge variant="info">
        {pageCount} {pageCount === 1 ? "page" : "pages"}
      </Badge>
    </div>
  );
};

export default FileInfo;
