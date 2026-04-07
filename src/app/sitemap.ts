import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, updated_at")
    .eq("active", true);

  const productUrls = (products ?? []).map((p) => ({
    url: `/product/${p.id}`,
    lastModified: new Date(p.updated_at),
  }));

  return [
    { url: "/", lastModified: new Date() },
    ...productUrls,
  ];
}
