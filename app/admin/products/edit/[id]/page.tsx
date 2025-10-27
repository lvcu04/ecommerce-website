// app/(admin)/admin/products/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminProductForm from '@/app/components/admin/AdminProductForm';
import { Product } from '@/app/(types)';
import { authFetch } from '@/app/utils/authFetch';

export default function EditProductPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string }; // Lấy id từ URL

  useEffect(() => {
    if (!id) return; // Không có id thì không làm gì

    const fetchProduct = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await authFetch(`/api/admin/products/${id}`, {}, router);
        if (!res.ok) {
           if (res.status === 404) throw new Error('Không tìm thấy sản phẩm.');
           throw new Error('Không thể tải dữ liệu sản phẩm.');
        }
        const data = await res.json();
        setProduct(data);
      } catch (err: unknown) {
         if ((err as Error).message !== 'Unauthorized') {
             setError((err as Error).message);
         }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, router]);

  if (isLoading) return <p>Đang tải dữ liệu sản phẩm...</p>;
  if (error) return <p className="text-red-500">Lỗi: {error}</p>;
  if (!product) return <p>Không tìm thấy sản phẩm để chỉnh sửa.</p>

  return (
    <div>
      <AdminProductForm isEditing={true} initialData={product} />
    </div>
  );
}