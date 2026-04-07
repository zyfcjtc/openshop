import { Product } from "./types";

export function compareByRecommended(a: Product, b: Product): number {
  if (a.sort_order === 0 && b.sort_order === 0)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  if (a.sort_order === 0) return 1;
  if (b.sort_order === 0) return -1;
  return a.sort_order - b.sort_order;
}
