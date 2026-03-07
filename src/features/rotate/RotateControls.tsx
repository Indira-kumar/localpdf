import type { FC } from 'react';
import Button from '../../components/ui/Button';

interface RotateControlsProps {
  onRotateAllCW: () => void;
  onRotateAllCCW: () => void;
  onReset: () => void;
  disabled: boolean;
}

const RotateControls: FC<RotateControlsProps> = ({
  onRotateAllCW,
  onRotateAllCCW,
  onReset,
  disabled,
}) => {
  return (
    <div className="flex gap-2">
      <Button variant="secondary" onClick={onRotateAllCW} disabled={disabled}>
        Rotate All CW
      </Button>
      <Button variant="secondary" onClick={onRotateAllCCW} disabled={disabled}>
        Rotate All CCW
      </Button>
      <Button variant="ghost" onClick={onReset} disabled={disabled}>
        Reset All
      </Button>
    </div>
  );
};

export default RotateControls;
