"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { CartItem } from "@/lib/types";
import * as cartLib from "@/lib/cart";

type CartContextType = {
  items: CartItem[];
  addItem: (productId: string, quantity: number) => void;
  updateItem: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  totalItems: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(cartLib.getCart());
  }, []);

  const addItem = useCallback((productId: string, quantity: number) => {
    setItems(cartLib.addToCart(productId, quantity));
  }, []);

  const updateItem = useCallback((productId: string, quantity: number) => {
    setItems(cartLib.updateQuantity(productId, quantity));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(cartLib.removeFromCart(productId));
  }, []);

  const clear = useCallback(() => {
    cartLib.clearCart();
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext value={{ items, addItem, updateItem, removeItem, clear, totalItems }}>
      {children}
    </CartContext>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
