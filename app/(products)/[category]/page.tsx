// lvcu04/ecommerce-website/ecommerce-website-4aa712de464d3c3e54b59a353190ac2820039d81/app/(products)/[category]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProductCard from '@/app/components/products/ProductCard';
import { Product } from '@/app/(types)';

const categoryMap: { [key: string]: string } = {
  'men': 'Nam',
  'women': 'Nữ',
  'kids': 'Trẻ em',
  'accessories': 'Phụ kiện',
};

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false); // highlight-line
  const router = useRouter();
  const params = useParams();
  
  const categorySlug = params.category as string;
  const categoryName = categoryMap[categorySlug];

  // highlight-start
  useEffect(() => {
    setHasMounted(true); // Đánh dấu là component đã mount trên client
  }, []);
  // highlight-end

  useEffect(() => {
    // Chỉ chạy logic fetch dữ liệu sau khi component đã mount
    if (!hasMounted) return; // highlight-line

    const token = localStorage.getItem('accessToken');
    
    // if (!token) {
    //   router.push('/login');
    //   return;
    // }
    
    if (!categoryName) {
      setIsLoading(false);
      return;
    }

    async function fetchProducts() {
      setIsLoading(true); // Bắt đầu loading khi fetch
      try {
        const url = `http://localhost:3001/products?category=${encodeURIComponent(categoryName)}`;
        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        // if (!res.ok) {
        //   if (res.status === 401) {
        //     router.push('/login');
        //     return;
        //   }
        //   throw new Error('Failed to fetch');
        // }

        const data = await res.json();
        console.log("Fetched products:", data);
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [router, categoryName, hasMounted]); // Thêm hasMounted vào dependency array

  // highlight-start
  // Trong khi chưa mount, hoặc đang loading, hiển thị trạng thái tải
  if (!hasMounted || isLoading) {
  // highlight-end
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  if (!categoryName) {
    return (
      <div className="flex min-h-screen items-center justify-center text-center">
        <div>
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-gray-500 mt-2">Không tìm thấy danh mục sản phẩm này.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white">
        Sản phẩm {categoryName}
      </h1>
      
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">Không có sản phẩm nào trong danh mục này.</p>
      )}
    </div>
  );
}