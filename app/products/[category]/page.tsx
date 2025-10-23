// lvcu04/ecommerce-website/ecommerce-website-8699e455164d40ef3d8bd27acef9741e5b99de32/app/products/[category]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
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
  const [totalPages, setTotalPages] = useState(0);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams(); // Dùng để lấy query param 'page'

  const categorySlug = params.category as string;
  const categoryName = categoryMap[categorySlug];
  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    if (!categoryName) {
      setIsLoading(false);
      return;
    }

    async function fetchProducts() {
      setIsLoading(true);
      try {
        const url = `/api/products?category=${encodeURIComponent(categoryName)}&page=${currentPage}`;
        const res = await fetch(url);
        
        if (!res.ok) {
          throw new Error('Failed to fetch');
        }

        const data = await res.json();
        setProducts(data.products);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [categoryName, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    router.push(`/products/${categorySlug}?page=${newPage}`);
  };

  if (isLoading) {
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} categorySlug={categorySlug} />
            ))}
          </div>
          
          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-12 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Trước
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 border rounded-md ${currentPage === page ? 'bg-lime-600 text-white' : ''}`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">Không có sản phẩm nào trong danh mục này.</p>
      )}
    </div>
  );
}