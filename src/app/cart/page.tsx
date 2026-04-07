"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/lib/types";
import { QuantityPicker } from "@/components/quantity-picker";
import { t } from "@/lib/i18n";

export default function CartPage() {
  const { items, updateItem, removeItem } = useCart();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      if (items.length === 0) { setLoading(false); return; }
      const supabase = createClient();
      const { data } = await supabase.from("products").select("*").in("id", items.map((i) => i.productId));
      if (data) {
        const map: Record<string, Product> = {};
        data.forEach((p) => (map[p.id] = p as Product));
        setProducts(map);
      }
      setLoading(false);
    }
    fetchProducts();
  }, [items]);

  if (loading) return <div className="py-12 text-center text-gray-500">...</div>;

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 mb-4">{t("cart.empty")}</p>
        <Link href="/" className="text-(--color-brand-600) font-medium hover:underline">{t("cart.continueShopping")}</Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => {
    const product = products[item.productId];
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  return (
    <div className="py-4">
      <h1 className="text-xl font-bold mb-4">{t("cart.title")}</h1>
      <div className="space-y-3">
        {items.map((item) => {
          const product = products[item.productId];
          if (!product) return null;
          return (
            <div key={item.productId} className="bg-white rounded-lg p-4 shadow-sm flex gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">?</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                <p className="text-(--color-brand-600) font-bold text-sm mt-0.5">${product.price.toFixed(2)}</p>
                <div className="flex items-center justify-between mt-2">
                  <QuantityPicker value={item.quantity} onChange={(q) => updateItem(item.productId, q)} max={product.stock} />
                  <button onClick={() => removeItem(item.productId)} className="text-red-500 text-xs hover:underline">{t("cart.remove")}</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
        <div className="flex justify-between font-bold text-lg">
          <span>{t("cart.subtotal")}</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <Link href="/checkout" className="block mt-4 bg-(--color-brand-600) text-white text-center py-3 rounded-lg font-semibold hover:bg-(--color-brand-700) transition-colors">
          {t("cart.checkout")}
        </Link>
      </div>
    </div>
  );
}
