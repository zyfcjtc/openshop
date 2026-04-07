import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function OrderConfirmationPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  let orderId: string | null = null;
  let total: string | null = null;

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      orderId = session.metadata?.orderId || null;
      total = session.amount_total ? (session.amount_total / 100).toFixed(2) : null;
    } catch {
      // Invalid session
    }
  }

  return (
    <div className="py-12 text-center">
      <div className="text-4xl mb-4">&#x2705;</div>
      <h1 className="text-2xl font-bold mb-2">{t("confirmation.title")}</h1>
      {orderId && (
        <p className="text-gray-500 mb-2">
          {t("confirmation.orderNumber")}: <span className="font-mono font-bold">{orderId.slice(0, 8)}</span>
        </p>
      )}
      {total && (
        <p className="text-gray-500 mb-4">
          {t("checkout.total")}: <span className="font-bold">${total}</span>
        </p>
      )}
      <p className="text-gray-500 mb-6">{t("confirmation.thankYou")}</p>
      <Link href="/" className="text-(--color-brand-600) font-medium hover:underline">
        {t("confirmation.backHome")}
      </Link>
    </div>
  );
}
