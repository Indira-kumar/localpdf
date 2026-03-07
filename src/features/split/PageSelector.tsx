import type { FC } from 'react';
import Button from '../../components/ui/Button';

interface PageSelectorProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const PageSelector: FC<PageSelectorProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
}) => {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-700">
        {selectedCount} of {totalCount} pages selected
      </span>
      <Button variant="secondary" size="sm" onClick={onSelectAll}>
        Select All
      </Button>
      <Button variant="secondary" size="sm" onClick={onDeselectAll}>
        Deselect All
      </Button>
    </div>
  );
};

export default PageSelector;
