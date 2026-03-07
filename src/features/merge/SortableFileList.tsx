import type { FC } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PdfFileItem } from "../../types/pdf";
import FileInfo from "../../components/FileInfo";

interface SortableFileListProps {
  files: PdfFileItem[];
  onReorder: (from: number, to: number) => void;
  onRemove: (id: string) => void;
}

interface SortableItemProps {
  file: PdfFileItem;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: (id: string) => void;
}

const SortableItem: FC<SortableItemProps> = ({
  file,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3"
    >
      {/* Drag handle */}
      <button
        type="button"
        className="cursor-grab touch-none text-gray-400 hover:text-gray-600"
        {...attributes}
        {...listeners}
      >
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
            d="M8 6h.01M12 6h.01M8 12h.01M12 12h.01M8 18h.01M12 18h.01"
          />
        </svg>
      </button>

      {/* Move up / down buttons */}
      <div className="flex flex-col">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="text-gray-400 hover:text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed"
          aria-label="Move up"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="text-gray-400 hover:text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed"
          aria-label="Move down"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <FileInfo name={file.name} size={file.size} pageCount={file.pageCount} />
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(file.id)}
        className="text-gray-400 hover:text-red-500 transition-colors"
        aria-label={`Remove ${file.name}`}
      >
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

const SortableFileList: FC<SortableFileListProps> = ({
  files,
  onReorder,
  onRemove,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = files.findIndex((f) => f.id === active.id);
    const newIndex = files.findIndex((f) => f.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={files.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
          {files.map((file, index) => (
            <SortableItem
              key={file.id}
              file={file}
              index={index}
              total={files.length}
              onMoveUp={() => onReorder(index, index - 1)}
              onMoveDown={() => onReorder(index, index + 1)}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SortableFileList;
