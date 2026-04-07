import { createClient } from "@/lib/supabase/server";
import { Order } from "@/lib/types";
import Link from "next/link";
import { t } from "@/lib/i18n";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: pendingCount },
    { data: lowStock },
    { data: recentOrders },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("products")
      .select("id, name, stock")
      .lt("stock", 5)
      .eq("active", true)
      .order("stock"),
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">{t("admin.dashboard.title")}</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-3xl font-bold text-(--color-brand-600)">
            {pendingCount ?? 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {t("admin.dashboard.pendingOrders")}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-3xl font-bold text-orange-500">
            {lowStock?.length ?? 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {t("admin.dashboard.lowStock")}
          </p>
        </div>
      </div>

      {/* Low stock alerts */}
      {lowStock && lowStock.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-sm text-orange-600 mb-2">
            ⚠️ {t("admin.dashboard.lowStock")}
          </h2>
          <div className="bg-orange-50 rounded-lg p-3 space-y-1">
            {lowStock.map((p) => (
              <div key={p.id} className="flex justify-between text-sm">
                <span>{p.name}</span>
                <span className="font-bold text-orange-600">
                  {p.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <h2 className="font-semibold text-sm mb-2">
        {t("admin.dashboard.recentOrders")}
      </h2>
      <div className="space-y-2">
        {(recentOrders as Order[])?.map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="block bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">{order.customer_name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">${order.total.toFixed(2)}</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : order.status === "confirmed"
                      ? "bg-blue-100 text-blue-700"
                      : order.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
