'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/app/components/products/ProductCard';
import { Product } from '@/app/(types)';

function SearchResults() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    async function fetchSearchResults() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Failed to fetch results');
        const data = await res.json();
        setProducts(data.products);
      } catch (error) {
        console.error(error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSearchResults();
  }, [query]);

  if (isLoading) {
    return <p className="text-center text-gray-500">Đang tìm kiếm...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-10">
        {/* SỬA LỖI Ở ĐÂY */}
        Kết quả tìm kiếm cho: <span className="text-lime-600">&ldquo;{query}&rdquo;</span>
      </h1>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map(product => (
            // Giả sử categorySlug là 'product' cho các sản phẩm tìm kiếm
            <ProductCard key={product.id} product={product} categorySlug="product" />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">Không tìm thấy sản phẩm nào phù hợp.</p>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center p-12">Đang tải trang...</div>}>
      <SearchResults />
    </Suspense>
  );
}