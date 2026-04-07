import { Resend } from "resend";

type OrderEmailData = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress?: string | null;
  total: number;
  items: { name: string; quantity: number; unitPrice: number }[];
  notes?: string | null;
  storeName: string;
};

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function buildItemsHtml(items: OrderEmailData["items"]): string {
  return items
    .map(
      (i) =>
        `<tr><td style="padding:4px 8px">${i.name}</td><td style="padding:4px 8px">x${i.quantity}</td><td style="padding:4px 8px;text-align:right">$${(i.unitPrice * i.quantity).toFixed(2)}</td></tr>`
    )
    .join("");
}

export async function sendOrderConfirmationToCustomer(data: OrderEmailData) {
  const resend = getResend();
  if (!resend) return;

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  try {
    await resend.emails.send({
      from: `${data.storeName} <${fromEmail}>`,
      to: data.customerEmail,
      subject: `Order Confirmed — #${data.orderId.slice(0, 8)}`,
      html: `
        <h2>Thank you for your order, ${data.customerName}!</h2>
        <p>Order #${data.orderId.slice(0, 8)}</p>
        <table style="border-collapse:collapse;width:100%">
          <thead><tr><th style="text-align:left;padding:4px 8px">Item</th><th style="padding:4px 8px">Qty</th><th style="text-align:right;padding:4px 8px">Price</th></tr></thead>
          <tbody>${buildItemsHtml(data.items)}</tbody>
        </table>
        <p style="font-weight:bold;margin-top:16px">Total: $${data.total.toFixed(2)}</p>
        ${data.shippingAddress ? `<p>Shipping to: ${data.shippingAddress}</p>` : ""}
        <p style="color:#666;font-size:14px">— ${data.storeName}</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send customer confirmation email:", error);
  }
}

export async function sendNewOrderNotificationToAdmin(data: OrderEmailData) {
  const resend = getResend();
  if (!resend) return;

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  const itemLines = data.items
    .map((i) => `  ${i.name} x ${i.quantity} — $${(i.unitPrice * i.quantity).toFixed(2)}`)
    .join("\n");

  try {
    await resend.emails.send({
      from: `${data.storeName} <${fromEmail}>`,
      to: adminEmail,
      subject: `New Order #${data.orderId.slice(0, 8)} — $${data.total.toFixed(2)}`,
      text: `New Order: ${data.orderId.slice(0, 8)}\n\nCustomer: ${data.customerName}\nEmail: ${data.customerEmail}\nPhone: ${data.customerPhone}\n${data.shippingAddress ? `Address: ${data.shippingAddress}` : "No shipping address"}\n${data.notes ? `Notes: ${data.notes}` : ""}\n\nItems:\n${itemLines}\n\nTotal: $${data.total.toFixed(2)}`,
    });
  } catch (error) {
    console.error("Failed to send admin notification email:", error);
  }
}
