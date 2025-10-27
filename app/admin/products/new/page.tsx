// app/(admin)/admin/products/new/page.tsx
import AdminProductForm from '@/app/components/admin/AdminProductForm'; // Đường dẫn có thể thay đổi tùy cấu trúc

export default function AddProductPage() {
  return (
    <div>
      <AdminProductForm isEditing={false} />
    </div>
  );
}