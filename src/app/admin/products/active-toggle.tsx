"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  productId: string;
  active: boolean;
};

export function ActiveToggle({ productId, active }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`w-10 h-6 rounded-full relative transition-colors ${
        active ? "bg-(--color-brand-500)" : "bg-gray-300"
      }`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          active ? "left-4" : "left-0.5"
        }`}
      />
    </button>
  );
}
