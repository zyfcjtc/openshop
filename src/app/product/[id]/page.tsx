import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { Product } from "@/lib/types";
import { notFound } from "next/navigation";
import { ProductDetail } from "./product-detail";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

const getProduct = cache(async (id: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .single();
  return data as Product | null;
});

const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "My Store";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) return {};

  const title = `${product.name} | ${storeName}`;
  const description = `Buy ${product.name} for $${product.price}. ${product.description.slice(0, 120)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.image_url ? [{ url: product.image_url, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
