"use client";

import { useState, type FormEvent } from "react";
import { Product } from "@/lib/types";
import { ImageUpload } from "./image-upload";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";

type Props = {
  product?: Product;
};

export function ProductForm({ product }: Props) {
  const [imageUrl, setImageUrl] = useState(product?.image_url || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const body = {
      name: form.get("name") as string,
      description: form.get("description") as string,
      price: parseFloat(form.get("price") as string),
      category: form.get("category") as string,
      stock: parseInt(form.get("stock") as string, 10),
      image_url: imageUrl || null,
    };

    const url = product
      ? `/api/admin/products/${product.id}`
      : "/api/admin/products";
    const method = product ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save");
      setSaving(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ImageUpload currentUrl={product?.image_url} onUpload={setImageUrl} />

      <div>
        <label className="block text-sm font-medium mb-1">
          {t("admin.products.name")}
        </label>
        <input
          name="name"
          required
          defaultValue={product?.name}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t("admin.products.description")}
        </label>
        <textarea
          name="description"
          rows={3}
          defaultValue={product?.description}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("admin.products.price")}
          </label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product?.price}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("admin.products.stock")}
          </label>
          <input
            name="stock"
            type="number"
            min="0"
            required
            defaultValue={product?.stock ?? 0}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t("admin.products.category")}
        </label>
        <input
          name="category"
          required
          defaultValue={product?.category}
          placeholder="e.g. feather, nylon, accessories"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-(--color-brand-600) text-white py-3 rounded-lg font-semibold hover:bg-(--color-brand-700) disabled:opacity-50 transition-colors"
      >
        {saving ? t("admin.products.saving") : t("admin.products.save")}
      </button>
    </form>
  );
}
