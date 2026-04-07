import { createClient } from "@/lib/supabase/server";
import { Product } from "@/lib/types";
import { HomeContent } from "./home-content";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  return <HomeContent products={(products as Product[]) ?? []} />;
}
