import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: body.name,
      description: body.description || "",
      price: body.price,
      category: body.category,
      stock: body.stock,
      image_url: body.image_url,
      active: true,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: data.id });
}
