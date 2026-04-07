import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { Product } from "@/lib/types";
import { t } from "@/lib/i18n";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">{t("admin.products.editProduct")}</h1>
      <ProductForm product={product as Product} />
    </div>
  );
}
