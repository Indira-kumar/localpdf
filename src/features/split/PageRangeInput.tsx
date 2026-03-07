import type { FC } from 'react';

interface PageRangeInputProps {
  value: string;
  onChange: (val: string) => void;
  error: string | null;
}

const PageRangeInput: FC<PageRangeInputProps> = ({ value, onChange, error }) => {
  return (
    <div>
      <label htmlFor="page-range" className="block text-sm font-medium text-gray-700">
        Page range
      </label>
      <input
        id="page-range"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. 1-3, 5, 7-10"
        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default PageRangeInput;
