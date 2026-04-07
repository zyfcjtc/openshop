"use client";

import Link from "next/link";
import { useCart } from "./cart-provider";
import { t } from "@/lib/i18n";

export function CartBar() {
  const { totalItems } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="max-w-lg mx-auto px-4 pb-4">
        <Link
          href="/cart"
          className="flex items-center justify-between bg-(--color-brand-600) text-white px-4 py-3 rounded-lg shadow-lg hover:bg-(--color-brand-700) transition-colors"
        >
          <span className="font-semibold">
            {t("nav.cart")} ({totalItems} {t("cart.items")})
          </span>
          <span>&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
