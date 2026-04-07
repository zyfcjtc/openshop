import { createClient } from "@/lib/supabase/server";
import { Product } from "@/lib/types";
import { DraggableProductList } from "@/components/admin/draggable-product-list";
import Link from "next/link";
import { t } from "@/lib/i18n";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">{t("admin.products.title")}</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-(--color-brand-600) text-white rounded-lg text-sm font-medium hover:bg-(--color-brand-700)"
        >
          + {t("admin.products.addProduct")}
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          {t("admin.products.noProducts")}
        </p>
      ) : (
        <DraggableProductList products={products as Product[]} />
      )}
    </div>
  );
}
