"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(t("admin.login.error"));
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-xl font-bold text-center mb-6">
          {t("admin.login.title")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            required
            placeholder={t("admin.login.email")}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
          />
          <input
            name="password"
            type="password"
            required
            placeholder={t("admin.login.password")}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-(--color-brand-600) text-white py-3 rounded-lg font-semibold hover:bg-(--color-brand-700) disabled:opacity-50 transition-colors"
          >
            {loading ? "..." : t("admin.login.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
