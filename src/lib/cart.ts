import { CartItem } from "./types";

const CART_KEY = "openshop-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(productId: string, quantity: number): CartItem[] {
  const cart = getCart();
  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }
  saveCart(cart);
  return cart;
}

export function updateQuantity(productId: string, quantity: number): CartItem[] {
  let cart = getCart();
  if (quantity <= 0) {
    cart = cart.filter((item) => item.productId !== productId);
  } else {
    const existing = cart.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity = quantity;
    }
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(productId: string): CartItem[] {
  const cart = getCart().filter((item) => item.productId !== productId);
  saveCart(cart);
  return cart;
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
}
