'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Product } from '@/app/(types)';
import { authFetch } from '@/app/utils/authFetch'; // Sử dụng lại authFetch

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter(); // Khởi tạo router

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Gọi API admin đã tạo
        const res = await authFetch('/api/admin/products?pageSize=100', {}, router); // Lấy nhiều hơn để test
        if (!res.ok) {
          throw new Error('Không thể tải danh sách sản phẩm.');
        }
        const data = await res.json();
        setProducts(data.products || []); // API trả về { products: [], ... }
      } catch (err: unknown) {
         if ((err as Error).message !== 'Unauthorized') {
             setError((err as Error).message);
         }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [router]); // Thêm router vào dependency array

  const handleDelete = async (productId: number) => {
      if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm #${productId}?`)) return;

      try {
          const res = await authFetch(`/api/admin/products/${productId}`, { method: 'DELETE' }, router);
          if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.message || 'Xóa sản phẩm thất bại.');
          }
          // Xóa thành công, cập nhật lại danh sách
          setProducts(prev => prev.filter(p => p.id !== productId));
          alert('Xóa sản phẩm thành công!');
      } catch (err: unknown) {
          if ((err as Error).message !== 'Unauthorized') {
              alert(`Lỗi: ${(err as Error).message}`);
          }
      }
  }

  if (isLoading) return <p>Đang tải sản phẩm...</p>;
  if (error) return <p className="text-red-500">Lỗi: {error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Sản phẩm</h1>
        <Link href="/admin/products/new" className="bg-lime-600 text-white px-4 py-2 rounded hover:bg-lime-700">
          Thêm Sản phẩm mới
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ảnh</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Sản phẩm</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn kho</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src={product.imageUrl || '/placeholder.png'} alt={product.name} className="h-10 w-10 object-cover rounded"/>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPrice(product.price)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link href={`/admin/products/edit/${product.id}`} className="text-indigo-600 hover:text-indigo-900">Sửa</Link>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">Xóa</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">Không có sản phẩm nào.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}