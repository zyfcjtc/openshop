"use client";

import { useRouter, usePathname } from "next/navigation";
import { t } from "@/lib/i18n";

const statuses = ["all", "pending", "confirmed", "completed", "cancelled"] as const;

type Props = {
  selected: string;
};

export function OrdersFilter({ selected }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(status: string) {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex gap-1 overflow-x-auto">
      {statuses.map((s) => (
        <button
          key={s}
          onClick={() => handleChange(s)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            selected === s
              ? "bg-(--color-brand-600) text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t(`admin.orders.${s}`)}
        </button>
      ))}
    </div>
  );
}
