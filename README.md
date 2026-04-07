# OpenShop

An open-source one-click store builder. Launch a mobile-first online store in minutes — no coding required.

## Features

- **Mobile-first storefront** — Product listing, detail pages, cart, and checkout optimized for phones
- **Stripe payments** — Apple Pay, Google Pay, and card payments via Stripe Checkout
- **Admin dashboard** — Manage products, orders, and store settings from your phone
- **Setup wizard** — Guided setup for non-technical shop owners, deploy with one click
- **Customizable** — Choose your store name, language, logo, and theme color
- **Multi-language** — Config-driven single language (English, Chinese, or add your own)

## Tech Stack

- [Next.js 16](https://nextjs.org/) — App Router, Server Components
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) — Database, Auth, Storage
- [Stripe](https://stripe.com/) — Payments
- [Resend](https://resend.com/) — Email notifications
- [Vercel](https://vercel.com/) — Hosting

## Quick Start

### Option 1: Setup Wizard (Recommended)

Open `wizard/index.html` in your browser and follow the step-by-step guide.

### Option 2: Manual Setup

1. Create a [Supabase](https://supabase.com/) project
2. Run the SQL in `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor
3. Create a [Stripe](https://stripe.com/) account
4. Create a [Resend](https://resend.com/) account
5. Copy `.env.local.example` to `.env.local` and fill in your keys
6. Run locally:

```bash
npm install
npm run dev
```

7. Deploy to Vercel:

```bash
npx vercel
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | Sender email address |
| `ADMIN_EMAIL` | Admin notification email |
| `NEXT_PUBLIC_STORE_NAME` | Your store's name |
| `NEXT_PUBLIC_LOCALE` | Language (`en` or `zh`) |
| `NEXT_PUBLIC_THEME_COLOR` | Theme color preset |

## Adding a Language

1. Copy `src/messages/en.json` to `src/messages/{locale}.json`
2. Translate the values
3. Add the import to `src/lib/i18n.ts`
4. Set `NEXT_PUBLIC_LOCALE` to your new locale

## License

MIT
