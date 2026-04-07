import { AdminNav } from "@/components/admin/admin-nav";

type Props = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <AdminNav />
      {children}
    </div>
  );
}
