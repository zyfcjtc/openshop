"use client";

type Props = {
  categories: string[];
  selected: string;
  onChange: (category: string) => void;
};

export function CategoryFilter({ categories, selected, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      <button
        onClick={() => onChange("all")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
          selected === "all"
            ? "bg-(--color-brand-600) text-white"
            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors capitalize ${
            selected === cat
              ? "bg-(--color-brand-600) text-white"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
