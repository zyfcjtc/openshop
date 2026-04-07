# OpenShop Design Spec

An open-source one-click store builder. Non-technical shop owners complete a guided wizard in their browser, paste three sets of API keys, and get a live mobile-first online store deployed to Vercel.

Based on the [birdie-supply](../../../) codebase (shuttlecock-shop), generalized into a reusable template.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 App Router |
| Styling | Tailwind CSS v4 |
| Database / Auth / Storage | Supabase (free tier) |
| Payments | Stripe Checkout (Apple Pay / Google Pay) |
| Hosting | Vercel (free tier) |
| Image optimization | Vercel Image Optimization |

## Product Structure

Single Next.js project with three concerns:

### 1. Storefront (public, mobile-first)

The customer-facing shop. No account required to browse or purchase.

**Pages:**

- `/` — Product listing with optional category filter. Categories are free-text (set by admin), not hardcoded.
- `/product/[id]` — Product detail with image, description, price, stock status, add-to-cart.
- `/cart` — Cart contents, quantity adjustment, proceed to checkout.
- `/checkout` — Contact info form (name, email, phone, shipping address) → redirects to Stripe Checkout Session.
- `/order-confirmation` — Post-payment success page with order summary.

**Behavior:**

- Cart is stored in localStorage via a React context provider (carried from birdie-supply).
- Checkout creates a Stripe Checkout Session server-side, then redirects the customer to Stripe's hosted payment page. Apple Pay and Google Pay are enabled automatically by Stripe when the customer's device supports them.
- After payment, Stripe redirects back to `/order-confirmation?session_id={id}`. The page fetches order details to display.
- A Stripe webhook (`/api/webhooks/stripe`) listens for `checkout.session.completed` to mark the order as paid and trigger email notifications via Resend.

**Emails (via Resend):**

- **Order confirmation to customer** — sent after successful payment. Contains order summary, items, total.
- **New order notification to admin** — sent at the same time. Contains order details so admin can begin fulfillment.
- Emails are plain HTML, mobile-friendly, branded with store name and theme color.
- Sender address: configured via `RESEND_FROM_EMAIL` env var (e.g. `orders@yourdomain.com` or Resend's default).

**Language:**

- Config-driven single language. No runtime language switching.
- A `/messages` folder contains pre-built locale files: `en.json`, `zh.json` (carried from birdie-supply), with community contributing more over time.
- `NEXT_PUBLIC_LOCALE` env var selects which file to load. Defaults to `en`.
- A lightweight `t(key)` helper reads from the selected locale's JSON at build time. No `next-intl`, no `[locale]` route segments, no language toggle.

**Theming:**

- Store name from `NEXT_PUBLIC_STORE_NAME`, displayed in header.
- Owner can upload a logo via admin dashboard (stored in Supabase Storage). Falls back to store name as text.
- Theme color selected from a preset palette during setup, stored as `NEXT_PUBLIC_THEME_COLOR`. Applied via a CSS custom property that Tailwind v4 references. Preset options: emerald, blue, rose, amber, violet, slate, teal, orange.
- Owner can change logo and theme color post-deploy in admin settings.

### 2. Admin Dashboard (`/admin`, protected)

Single admin account authenticated via Supabase Auth (email/password). Protected by proxy-level redirect.

**Pages:**

- `/admin` — Dashboard overview (order count, recent orders).
- `/admin/login` — Login form.
- `/admin/products` — Product list with drag-to-reorder, active/inactive toggle.
- `/admin/products/new` — Create product form with image upload.
- `/admin/products/[id]` — Edit product form.
- `/admin/orders` — Order list with status filter.
- `/admin/orders/[id]` — Order detail with status actions, admin notes.
- `/admin/settings` — Store settings: upload/change logo, change theme color.

**Product management (carried from birdie-supply):**

- Create/edit/delete products with name, description, price, category (free-text), stock, image.
- Image upload to Supabase Storage (`product-images` bucket).
- Drag-to-reorder via `sort_order` column.
- Toggle product active/inactive.
- Stock adjustment (increment/decrement).

**Order management (carried from birdie-supply, extended):**

- View orders with status filter (pending, confirmed, completed, cancelled).
- Update order status.
- Admin notes per order.
- View payment status (from Stripe webhook data).

### 3. Setup Wizard

A standalone guided experience that takes a non-technical owner from zero to a live store. Hosted as a separate Vercel project (static page) or as a dedicated route in the OpenShop repo.

**Steps:**

1. **Welcome** — Explain what OpenShop is, what the owner will need (Supabase account, Stripe account, Vercel account). Estimated time: 10 minutes.

2. **Create Supabase project** — Step-by-step with screenshots:
   - Go to supabase.com, sign up, create a new project.
   - Copy the project URL, anon key, and service role key.
   - Paste all three into the wizard form.
   - Wizard validates the keys by calling Supabase's API.
   - **Wizard automatically runs the migration SQL** against the Supabase project using the service role key. This creates all tables, RLS policies, storage bucket, and functions. The owner never touches SQL.

3. **Create Resend account** — Step-by-step:
   - Go to resend.com, sign up, create an API key.
   - Paste API key into wizard.
   - Enter sender email (or use Resend's default `onboarding@resend.dev` to start).
   - Enter admin email (where new order notifications go).

4. **Create Stripe account** — Step-by-step with screenshots:
   - Go to stripe.com, sign up.
   - Copy publishable key and secret key from the Stripe dashboard.
   - Paste into the wizard form.
   - Wizard validates the keys.
   - Note: `STRIPE_WEBHOOK_SECRET` will be configured after deploy (Stripe needs the deploy URL to create a webhook endpoint). The wizard explains this as a post-deploy step, or automates it via Stripe API if possible.

5. **Customize your store** — In the wizard form:
   - Store name (text input).
   - Language (dropdown: English, Chinese, etc.).
   - Theme color (visual palette picker from presets).

6. **Deploy** — Wizard constructs a Vercel "Deploy" button URL with all env vars pre-filled as query parameters:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_STORE_NAME`
   - `NEXT_PUBLIC_LOCALE`
   - `NEXT_PUBLIC_THEME_COLOR`
   - Owner clicks the button → taken to Vercel's deploy flow → fork + deploy.
   - After deploy, owner returns to wizard for the final step.

7. **Post-deploy: Stripe Webhook** — Guide owner to:
   - Go to Stripe dashboard → Webhooks → Add endpoint.
   - Paste their store URL + `/api/webhooks/stripe`.
   - Copy the webhook signing secret → add it as `STRIPE_WEBHOOK_SECRET` env var in Vercel dashboard.
   - (Or automate this via Stripe API if we can obtain the deploy URL.)

8. **Done** — Show the live store URL. Link to `/admin` for first login. Prompt to create admin account via Supabase Auth.

## Database Schema

Based on birdie-supply's schema with modifications:

### `products`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, auto-generated |
| name | text | NOT NULL |
| description | text | NOT NULL, default '' |
| price | decimal(10,2) | NOT NULL |
| image_url | text | Nullable |
| stock | integer | NOT NULL, default 0 |
| category | text | NOT NULL, free-text (no check constraint) |
| active | boolean | NOT NULL, default true |
| sort_order | integer | NOT NULL, default 0 |
| created_at | timestamptz | auto |
| updated_at | timestamptz | auto via trigger |

### `orders`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, auto-generated |
| customer_name | text | NOT NULL |
| customer_email | text | NOT NULL |
| customer_phone | text | NOT NULL |
| shipping_address | text | Nullable |
| status | text | 'pending' / 'confirmed' / 'completed' / 'cancelled' |
| payment_status | text | 'unpaid' / 'paid' / 'refunded', default 'unpaid' |
| stripe_session_id | text | Nullable, for payment tracking |
| subtotal | decimal(10,2) | NOT NULL |
| shipping_fee | decimal(10,2) | NOT NULL, default 0 |
| total | decimal(10,2) | NOT NULL |
| notes | text | Customer notes, nullable |
| admin_notes | text | Admin-only notes, nullable |
| created_at | timestamptz | auto |

### `order_items`

Unchanged from birdie-supply.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| order_id | uuid | FK → orders |
| product_id | uuid | FK → products |
| quantity | integer | > 0 |
| unit_price | decimal(10,2) | NOT NULL |

### `store_settings`

New table for runtime-editable settings (logo, theme color).

| Column | Type | Notes |
|--------|------|-------|
| id | integer | PK, always 1 (singleton row) |
| logo_url | text | Nullable, Supabase Storage URL |
| theme_color | text | Preset name, e.g. 'emerald' |
| updated_at | timestamptz | auto |

RLS: public read, authenticated (admin) write.

Note: `NEXT_PUBLIC_THEME_COLOR` and `NEXT_PUBLIC_STORE_NAME` set initial values at deploy time. Once the store is running, the admin can override theme color and logo via the `store_settings` table in the admin settings page. The app reads from `store_settings` first, falling back to env vars.

### Storage

- `product-images` bucket (public read, admin write) — carried from birdie-supply.
- `store-assets` bucket (public read, admin write) — for logo uploads.

### RLS Policies

Same pattern as birdie-supply:
- Products: public can read active products, admin can manage all.
- Orders: public can insert (place order), admin can read/update.
- Order items: public can insert, admin can read.
- Store settings: public can read, admin can write.

## Changes From birdie-supply

### Remove
- `next-intl` package and all locale routing (`[locale]` segments, `i18n/` directory, language toggle component).
- Hardcoded category check constraint (`feather` / `nylon`).
- Pickup/delivery logic and free delivery minimum.
- E-transfer payment references.
- Contact card component (domain-specific).

### Add
- Stripe Checkout integration: `/api/checkout` route handler to create Stripe Checkout Sessions.
- Stripe webhook: `/api/webhooks/stripe` to handle `checkout.session.completed`.
- `payment_status` and `stripe_session_id` on orders.
- `store_settings` table + admin settings page.
- Lightweight `t()` translation helper (replaces `next-intl`).
- CSS custom property theming with preset color palette.
- Logo upload and display.
- Setup wizard (standalone page/project).

### Generalize
- Category: free-text instead of enum.
- Delivery: simplified to optional shipping address (no pickup/delivery toggle).
- Store identity: configurable name, logo, color instead of hardcoded branding.

## Env Vars

| Variable | Source | Public |
|----------|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard | No |
| `STRIPE_SECRET_KEY` | Stripe dashboard | No |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe dashboard | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook setup | No |
| `NEXT_PUBLIC_STORE_NAME` | Wizard input | Yes |
| `NEXT_PUBLIC_LOCALE` | Wizard dropdown | Yes |
| `NEXT_PUBLIC_THEME_COLOR` | Wizard palette picker | Yes |
| `RESEND_API_KEY` | Resend dashboard | No |
| `RESEND_FROM_EMAIL` | Wizard input | No |
| `ADMIN_EMAIL` | Wizard input | No |

## Out of Scope (MVP)

- User accounts / customer login
- Inventory concurrency control
- Domestic Chinese payments (WeChat Pay / Alipay)
- Rich HTML email templates (MVP uses simple inline HTML)
- Complex shipping/logistics
- Multi-admin support
- Product variants / options
- Discount codes / coupons
