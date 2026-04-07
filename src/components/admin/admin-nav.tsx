"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { t } from "@/lib/i18n";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/admin", label: t("admin.nav.dashboard") },
    { href: "/admin/orders", label: t("admin.nav.orders") },
    { href: "/admin/products", label: t("admin.nav.products") },
    { href: "/admin/settings", label: t("admin.nav.settings") },
  ];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav className="flex items-center gap-1 overflow-x-auto pb-2 mb-4 border-b border-gray-200">
      {links.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/admin" && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? "bg-(--color-brand-50) text-(--color-brand-700)"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <button
        onClick={handleLogout}
        className="ml-auto text-sm text-gray-500 hover:text-red-500 whitespace-nowrap px-3 py-2"
      >
        {t("admin.nav.logout")}
      </button>
    </nav>
  );
}
