"use client";

import { useState, useRef, useCallback } from "react";
import { Product } from "@/lib/types";
import { compareByRecommended } from "@/lib/sort";
import { StockAdjuster } from "./stock-adjuster";
import { ActiveToggle } from "@/app/admin/products/active-toggle";
import Link from "next/link";
import { t } from "@/lib/i18n";

type Props = {
  products: Product[];
};

export function DraggableProductList({ products }: Props) {
  const [items, setItems] = useState(() =>
    [...products].sort(compareByRecommended)
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const touchDragIndex = useRef<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const saveOrder = useCallback(async (newItems: Product[]) => {
    setSaving(true);
    await Promise.all(
      newItems.map((item, i) =>
        fetch(`/api/admin/products/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: i + 1 }),
        })
      )
    );
    setItems(newItems.map((item, i) => ({ ...item, sort_order: i + 1 })));
    setSaving(false);
  }, []);

  function reorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return null;
    const newItems = [...items];
    const [moved] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, moved);
    setItems(newItems);
    return newItems;
  }

  function handleDragStart(e: React.DragEvent, index: number) {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    const el = e.currentTarget as HTMLDivElement;
    setTimeout(() => { el.style.opacity = "0.4"; }, 0);
  }

  function handleDragEnd(e: React.DragEvent) {
    (e.currentTarget as HTMLDivElement).style.opacity = "1";
    setDragIndex(null);
    setOverIndex(null);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (index !== overIndex) setOverIndex(index);
  }

  async function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault();
    if (dragIndex === null) return;
    const newItems = reorder(dragIndex, dropIndex);
    setDragIndex(null);
    setOverIndex(null);
    (e.currentTarget as HTMLDivElement).style.opacity = "1";
    if (newItems) await saveOrder(newItems);
  }

  function getIndexFromTouch(touch: React.Touch | Touch): number | null {
    for (let i = 0; i < itemRefs.current.length; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        return i;
      }
    }
    return null;
  }

  function handleTouchStart(index: number) {
    touchDragIndex.current = index;
    setDragIndex(index);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchDragIndex.current === null) return;
    e.preventDefault();
    const touch = e.touches[0];
    const idx = getIndexFromTouch(touch);
    if (idx !== null) setOverIndex(idx);
  }

  async function handleTouchEnd() {
    const from = touchDragIndex.current;
    const to = overIndex;
    touchDragIndex.current = null;
    setDragIndex(null);
    setOverIndex(null);
    if (from === null || to === null) return;
    const newItems = reorder(from, to);
    if (newItems) await saveOrder(newItems);
  }

  return (
    <div>
      {/* Column headers */}
      <div className="flex items-center gap-3 px-3 pb-1 text-xs text-gray-400">
        <span className="w-6" />
        <div className="flex-1" />
        <span className="w-[88px] text-center">{t("admin.products.stock")}</span>
        <span className="w-[30px] text-center">#</span>
        <span className="w-10" />
      </div>

      {saving && (
        <div className="text-xs text-amber-600 text-center py-1">Saving order...</div>
      )}

      <div ref={listRef} className="space-y-2">
        {items.map((product, index) => (
          <div
            key={product.id}
            ref={(el) => { itemRefs.current[index] = el; }}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`bg-white rounded-lg p-3 shadow-sm transition-all select-none ${
              !product.active ? "opacity-50" : ""
            } ${
              dragIndex === index ? "opacity-40" : ""
            } ${
              overIndex === index && dragIndex !== null && dragIndex !== index
                ? "border-2 border-amber-400"
                : "border-2 border-transparent"
            }`}
          >
            <div className="flex gap-3 items-center">
              <div
                className="w-6 flex-shrink-0 text-gray-400 select-none text-center text-lg cursor-grab active:cursor-grabbing touch-none"
                onTouchStart={() => handleTouchStart(index)}
              >
                ⠿
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    img
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="font-medium text-sm hover:text-(--color-brand-600) line-clamp-1"
                >
                  {product.name}
                </Link>
                <p className="text-xs text-gray-500">
                  ${product.price.toFixed(2)} · {product.category}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StockAdjuster
                  productId={product.id}
                  stock={product.stock}
                />
                <span className="w-[30px] text-center text-xs font-bold text-amber-700">
                  {product.sort_order || "–"}
                </span>
                <ActiveToggle
                  productId={product.id}
                  active={product.active}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
