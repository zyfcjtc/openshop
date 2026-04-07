"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";

type Props = {
  orderId: string;
  status: string;
};

export function OrderStatusActions({ orderId, status }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function updateStatus(newStatus: string) {
    setLoading(true);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
    setLoading(false);
  }

  if (loading) return <p className="text-sm text-gray-400">...</p>;

  return (
    <div className="flex gap-2 flex-wrap">
      {status === "pending" && (
        <>
          <button
            onClick={() => updateStatus("confirmed")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            {t("admin.orders.confirm")}
          </button>
          <button
            onClick={() => updateStatus("cancelled")}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
          >
            {t("admin.orders.cancel")}
          </button>
        </>
      )}
      {status === "confirmed" && (
        <>
          <button
            onClick={() => updateStatus("completed")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
          >
            {t("admin.orders.complete")}
          </button>
          <button
            onClick={() => updateStatus("cancelled")}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
          >
            {t("admin.orders.cancel")}
          </button>
        </>
      )}
    </div>
  );
}
