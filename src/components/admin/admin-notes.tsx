"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  orderId: string;
  notes: string | null;
};

export function AdminNotes({ orderId, notes }: Props) {
  const [value, setValue] = useState(notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleSave() {
    if (value === (notes ?? "")) return;
    setSaving(true);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_notes: value || null }),
    });
    setSaving(false);
    setSaved(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add notes..."
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
      />
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1 bg-(--color-brand-600) text-white text-sm rounded-lg hover:bg-(--color-brand-700) disabled:opacity-50"
        >
          {saving ? "..." : "Save"}
        </button>
        {saved && <span className="text-xs text-(--color-brand-600)">Saved!</span>}
      </div>
    </div>
  );
}
