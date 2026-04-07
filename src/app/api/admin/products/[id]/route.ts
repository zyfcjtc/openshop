import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: Props) {
  const { id } = await params;
  const body = await request.json();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("products")
    .update(body)
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("products")
    .update({ active: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to deactivate product" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
