import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { sendOrderConfirmationToCustomer, sendNewOrderNotificationToAdmin } from "@/lib/email";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const supabase = await createClient();
      await supabase.from("orders").update({ payment_status: "paid" }).eq("id", orderId);

      const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
      const { data: items } = await supabase.from("order_items").select("*, product:products(name)").eq("order_id", orderId);

      if (order && items) {
        const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "My Store";
        const emailData = {
          orderId,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          customerPhone: order.customer_phone,
          shippingAddress: order.shipping_address,
          total: order.total,
          notes: order.notes,
          storeName,
          items: items.map((item: any) => ({
            name: item.product?.name || "Unknown",
            quantity: item.quantity,
            unitPrice: item.unit_price,
          })),
        };
        sendOrderConfirmationToCustomer(emailData);
        sendNewOrderNotificationToAdmin(emailData);
      }
    }
  }

  return NextResponse.json({ received: true });
}
