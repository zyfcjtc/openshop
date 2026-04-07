import Link from "next/link";
import { Product } from "@/lib/types";
import { t } from "@/lib/i18n";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-gray-100 relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
            ?
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {t("product.outOfStock")}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5 capitalize">
          {product.category}
        </p>
        <p className="text-(--color-brand-600) font-bold mt-1">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}
