import { CartProvider } from "@/components/cart-provider";
import { Header } from "@/components/header";
import { CartBar } from "@/components/cart-bar";
import { Footer } from "@/components/footer";
import { getThemeColor } from "@/lib/theme";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@/app/globals.css";

const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "My Store";
const locale = process.env.NEXT_PUBLIC_LOCALE || "en";

export const metadata: Metadata = {
  title: storeName,
  description: `Welcome to ${storeName}`,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeColor = getThemeColor();

  let logoUrl: string | null = null;
  let dbThemeColor: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("store_settings")
      .select("logo_url, theme_color")
      .eq("id", 1)
      .single();
    if (data) {
      logoUrl = data.logo_url;
      dbThemeColor = data.theme_color;
    }
  } catch {
    // Supabase not configured yet — use env defaults
  }

  const activeTheme = dbThemeColor || themeColor;

  return (
    <html lang={locale} data-theme={activeTheme}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased">
        <CartProvider>
          <Header storeName={storeName} logoUrl={logoUrl} />
          <main className="max-w-lg mx-auto px-4 pb-20">{children}</main>
          <Footer />
          <CartBar />
        </CartProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
