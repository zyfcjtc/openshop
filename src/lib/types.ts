export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  stock: number;
  category: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  payment_status: "unpaid" | "paid" | "refunded";
  stripe_session_id: string | null;
  subtotal: number;
  shipping_fee: number;
  total: number;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
};

export type OrderWithItems = Order & {
  order_items: (OrderItem & { product: Pick<Product, "name" | "image_url"> })[];
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type StoreSettings = {
  id: number;
  logo_url: string | null;
  theme_color: string;
  updated_at: string;
};
