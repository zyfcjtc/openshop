import { ProductForm } from "@/components/admin/product-form";
import { t } from "@/lib/i18n";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">{t("admin.products.addProduct")}</h1>
      <ProductForm />
    </div>
  );
}
