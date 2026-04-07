import { createClient } from "@/lib/supabase/server";
import { Order } from "@/lib/types";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrdersFilter } from "./orders-filter";
import Link from "next/link";
import { t } from "@/lib/i18n";

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: orders } = await query;

  const paymentStyles: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    unpaid: "bg-gray-100 text-gray-600",
    refunded: "bg-purple-100 text-purple-700",
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">{t("admin.orders.title")}</h1>

      <OrdersFilter selected={status || "all"} />

      <div className="space-y-2 mt-4">
        {(!orders || orders.length === 0) && (
          <p className="text-center text-gray-500 py-8">
            {t("admin.orders.noOrders")}
          </p>
        )}
        {(orders as Order[])?.map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="block bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">{order.customer_name}</p>
                <p className="text-xs text-gray-500">{order.customer_phone}</p>
                <p className="text-xs text-gray-400">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="font-bold text-sm">${order.total.toFixed(2)}</p>
                <OrderStatusBadge status={order.status} />
                <div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      paymentStyles[order.payment_status] ||
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {t(`admin.orders.${order.payment_status}`)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
