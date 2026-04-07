"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Props = {
  productId: string;
  stock: number;
};

export function StockAdjuster({ productId, stock }: Props) {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(stock));
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function setStock(newStock: number) {
    if (newStock < 0) newStock = 0;
    setLoading(true);
    await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: newStock }),
    });
    router.refresh();
    setLoading(false);
  }

  function startEditing() {
    setInputValue(String(stock));
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitEdit() {
    setEditing(false);
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed) && parsed !== stock) {
      setStock(parsed);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setStock(stock - 1)}
        disabled={loading || stock <= 0}
        className="w-7 h-7 rounded bg-gray-100 text-sm hover:bg-gray-200 disabled:opacity-30"
      >
        −
      </button>
      {editing ? (
        <input
          ref={inputRef}
          type="number"
          min="0"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="w-12 text-center text-sm font-bold border border-gray-400 rounded px-1 py-0.5 outline-none"
        />
      ) : (
        <button
          onClick={startEditing}
          className={`w-8 text-center text-sm font-bold cursor-text hover:bg-gray-100 rounded ${
            stock < 5 ? "text-orange-600" : ""
          }`}
        >
          {stock}
        </button>
      )}
      <button
        onClick={() => setStock(stock + 1)}
        disabled={loading}
        className="w-7 h-7 rounded bg-gray-100 text-sm hover:bg-gray-200 disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}
