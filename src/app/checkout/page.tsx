"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useCart } from "@/components/cart-provider";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/lib/types";
import { t } from "@/lib/i18n";

export default function CheckoutPage() {
  const { items } = useCart();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const subtotal = items.reduce((sum, item) => {
    const product = products[item.productId];
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.get("name"),
          customerEmail: form.get("email"),
          customerPhone: form.get("phone"),
          shippingAddress: form.get("address") || undefined,
          notes: form.get("notes") || undefined,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create checkout"); setSubmitting(false); return; }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="py-4">
      <h1 className="text-xl font-bold mb-4">{t("checkout.title")}</h1>
      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        {items.map((item) => {
          const product = products[item.productId];
          if (!product) return null;
          return (
            <div key={item.productId} className="flex justify-between text-sm py-1">
              <span>{product.name} &times; {item.quantity}</span>
              <span>${(product.price * item.quantity).toFixed(2)}</span>
            </div>
          );
        })}
        <div className="border-t mt-2 pt-2 flex justify-between font-bold">
          <span>{t("checkout.total")}</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">{t("checkout.contactInfo")}</label>
          <div className="space-y-2">
            <input name="name" required placeholder={t("checkout.name")} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            <input name="email" type="email" required placeholder={t("checkout.email")} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            <input name="phone" type="tel" required placeholder={t("checkout.phone")} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">{t("checkout.shippingAddress")}</label>
          <textarea name="address" placeholder={t("checkout.shippingAddress")} rows={2} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
        </div>
        <textarea name="notes" placeholder={t("checkout.notes")} rows={2} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={submitting || items.length === 0} className="w-full bg-(--color-brand-600) text-white py-3 rounded-lg font-semibold hover:bg-(--color-brand-700) disabled:opacity-50 transition-colors">
          {submitting ? "..." : t("checkout.payNow")}
        </button>
      </form>
    </div>
  );
}
