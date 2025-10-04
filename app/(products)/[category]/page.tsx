'use client'; // Chuyển thành Client Component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from '@/app/components/products/ProductCard';
import { Product } from '@/app/(types)';

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    // Điều hướng: Nếu không có token, chuyển về trang login
    if (!token) {
      router.push('/login');
      return; // Dừng thực thi để chờ chuyển hướng
    }

    // Nếu đã đăng nhập, lấy dữ liệu sản phẩm
    async function fetchProducts() {
      try {
        const res = await fetch('http://localhost:3001/products');
        if (!res.ok) {
          throw new Error('Failed to fetch');
        }
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [router]);

  // Hiển thị màn hình loading trong khi kiểm tra và lấy dữ liệu
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }
  
  // Nếu đã đăng nhập, hiển thị danh sách sản phẩm
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white">Sản phẩm mới nhất</h1>
      
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">Không có sản phẩm nào để hiển thị.</p>
      )}
    </div>
  );
}

