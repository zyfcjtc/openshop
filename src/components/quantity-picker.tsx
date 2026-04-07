"use client";

type Props = {
  value: number;
  onChange: (value: number) => void;
  max?: number;
};

export function QuantityPicker({ value, onChange, max }: Props) {
  return (
    <div className="flex items-center border border-gray-300 rounded-lg">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100"
      >
        -
      </button>
      <span className="px-3 py-1.5 text-sm font-medium min-w-[2rem] text-center">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(max ? Math.min(max, value + 1) : value + 1)}
        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100"
      >
        +
      </button>
    </div>
  );
}
