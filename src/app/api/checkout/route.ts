import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

type CheckoutInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress?: string;
  notes?: string;
  items: { productId: string; quantity: number }[];
};

export async function POST(request: NextRequest) {
  const body: CheckoutInput = await request.json();

  if (!body.customerName || !body.customerEmail || !body.customerPhone || !body.items?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = await createClient();

  const productIds = body.items.map((i) => i.productId);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, stock, active, image_url")
    .in("id", productIds);

  if (productsError || !products) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  for (const item of body.items) {
    const product = productMap.get(item.productId);
    if (!product || !product.active) {
      return NextResponse.json({ error: `Product not available: ${item.productId}` }, { status: 400 });
    }
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
    }
  }

  const subtotal = body.items.reduce((sum, item) => {
    const product = productMap.get(item.productId)!;
    return sum + product.price * item.quantity;
  }, 0);

  const orderId = randomUUID();
  const { error: orderError } = await supabase.from("orders").insert({
    id: orderId,
    customer_name: body.customerName,
    customer_email: body.customerEmail,
    customer_phone: body.customerPhone,
    shipping_address: body.shippingAddress || null,
    status: "pending",
    payment_status: "unpaid",
    subtotal,
    shipping_fee: 0,
    total: subtotal,
    notes: body.notes || null,
  });

  if (orderError) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  const orderItems = body.items.map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: productMap.get(item.productId)!.price,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) {
    return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
  }

  const origin = request.headers.get("origin") || request.nextUrl.origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: body.customerEmail,
    line_items: body.items.map((item) => {
      const product = productMap.get(item.productId)!;
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            ...(product.image_url ? { images: [product.image_url] } : {}),
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      };
    }),
    metadata: { orderId },
    success_url: `${origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout`,
  });

  await supabase.from("orders").update({ stripe_session_id: session.id }).eq("id", orderId);

  return NextResponse.json({ url: session.url });
}
