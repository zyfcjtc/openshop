"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { THEME_COLORS, type ThemeColor } from "@/lib/theme";
import { t } from "@/lib/i18n";

const COLOR_SWATCHES: Record<ThemeColor, string> = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  violet: "bg-violet-500",
  slate: "bg-slate-500",
  teal: "bg-teal-500",
  orange: "bg-orange-500",
};

export default function AdminSettingsPage() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState<ThemeColor>("emerald");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.logo_url !== undefined) setLogoUrl(data.logo_url);
        if (data.theme_color) setThemeColor(data.theme_color as ThemeColor);
        setLoading(false);
      });
  }, []);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();

    const ext = file.name.split(".").pop();
    const path = `logo-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("store-assets")
      .upload(path, file, { upsert: true });

    if (!error) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("store-assets").getPublicUrl(path);
      setLogoUrl(publicUrl);
    }
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logo_url: logoUrl, theme_color: themeColor }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">{t("admin.settings.title")}</h1>

      {/* Logo */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <h2 className="text-sm font-semibold mb-3">{t("admin.settings.logo")}</h2>
        <div className="flex items-center gap-4">
          <div
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 overflow-hidden flex-shrink-0"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Store logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-gray-400 text-xs text-center px-1">
                {uploading ? "Uploading..." : t("admin.settings.uploadLogo")}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 bg-(--color-brand-600) text-white text-sm rounded-lg hover:bg-(--color-brand-700) disabled:opacity-50"
            >
              {uploading ? "Uploading..." : t("admin.settings.uploadLogo")}
            </button>
            {logoUrl && (
              <button
                onClick={() => setLogoUrl(null)}
                className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200"
              >
                {t("admin.settings.removeLogo")}
              </button>
            )}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="hidden"
        />
      </div>

      {/* Theme Color */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
        <h2 className="text-sm font-semibold mb-3">{t("admin.settings.themeColor")}</h2>
        <div className="flex flex-wrap gap-3">
          {THEME_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setThemeColor(color)}
              title={color}
              className={`w-9 h-9 rounded-full transition-transform ${COLOR_SWATCHES[color]} ${
                themeColor === color
                  ? "ring-2 ring-offset-2 ring-gray-700 scale-110"
                  : "hover:scale-105"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2 capitalize">
          Selected: {themeColor}
        </p>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-(--color-brand-600) text-white py-3 rounded-lg font-semibold hover:bg-(--color-brand-700) disabled:opacity-50 transition-colors"
      >
        {saving ? "..." : "Save"}
      </button>
      {saved && (
        <p className="text-center text-sm text-(--color-brand-600) mt-2">
          {t("admin.settings.saved")}
        </p>
      )}
    </div>
  );
}
