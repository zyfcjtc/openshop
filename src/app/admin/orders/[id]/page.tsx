import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrderStatusActions } from "@/components/admin/order-status-actions";
import { AdminNotes } from "@/components/admin/admin-notes";
import Link from "next/link";
import { t } from "@/lib/i18n";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("*, product:products(name, image_url)")
    .eq("order_id", id);

  const paymentStyles: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    unpaid: "bg-gray-100 text-gray-600",
    refunded: "bg-purple-100 text-purple-700",
  };

  return (
    <div>
      <Link
        href="/admin/orders"
        className="text-(--color-brand-600) text-sm mb-4 inline-block"
      >
        ← {t("admin.orders.title")}
      </Link>

      <h1 className="text-xl font-bold mb-1">{t("admin.orders.orderDetails")}</h1>
      <p className="text-sm text-gray-500 font-mono mb-4">
        {order.id.slice(0, 8)}
      </p>

      {/* Status */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold">{t("admin.orders.status")}</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <OrderStatusActions orderId={order.id} status={order.status} />
      </div>

      {/* Payment */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{t("admin.orders.payment")}</span>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              paymentStyles[order.payment_status] || "bg-gray-100 text-gray-600"
            }`}
          >
            {t(`admin.orders.${order.payment_status}`)}
          </span>
        </div>
      </div>

      {/* Customer */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <h2 className="text-sm font-semibold mb-2">{t("admin.orders.customer")}</h2>
        <p className="text-sm">{order.customer_name}</p>
        <p className="text-sm text-gray-500">{order.customer_email}</p>
        <p className="text-sm text-gray-500">{order.customer_phone}</p>
      </div>

      {/* Shipping */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <h2 className="text-sm font-semibold mb-2">{t("admin.orders.shipping")}</h2>
        {order.shipping_address ? (
          <p className="text-sm text-gray-500">{order.shipping_address}</p>
        ) : (
          <p className="text-sm text-gray-400">—</p>
        )}
        {order.notes && (
          <p className="text-sm text-gray-400 mt-1 italic">{order.notes}</p>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <h2 className="text-sm font-semibold mb-2">{t("admin.orders.items")}</h2>
        <div className="space-y-2">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {items?.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.product?.name ?? "Unknown"} × {item.quantity}
              </span>
              <span>${(item.unit_price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t mt-3 pt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              {order.shipping_fee === 0
                ? "Free"
                : `$${order.shipping_fee.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Admin Notes */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <h2 className="text-sm font-semibold mb-2">Admin Notes</h2>
        <AdminNotes orderId={order.id} notes={order.admin_notes} />
      </div>

      <p className="text-xs text-gray-400 text-center">
        {new Date(order.created_at).toLocaleString()}
      </p>
    </div>
  );
}
