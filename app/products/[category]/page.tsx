
'use client';

import { useEffect, useState, Suspense } from 'react'; // Thêm Suspense
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import ProductCard from '@/app/components/products/ProductCard';
import { Product } from '@/app/(types)';
import Skeleton from '@/app/components/ui/Skeleton';

const categoryMap: { [key: string]: string } = {
  'men': 'Nam',
  'women': 'Nữ',
  'kids': 'Trẻ em',
  'accessories': 'Phụ kiện',
};

// Tách component nội dung ra để dùng Suspense (Best practice Next.js)
function ProductListContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  
  // --- STATE MỚI CHO BỘ LỌC ---
  const [sort, setSort] = useState('newest');
  const [tempMinPrice, setTempMinPrice] = useState(''); // State tạm cho input
  const [tempMaxPrice, setTempMaxPrice] = useState(''); // State tạm cho input

  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const categorySlug = params.category as string;
  const categoryName = categoryMap[categorySlug];
  
  // Lấy giá trị từ URL (để giữ bộ lọc khi reload trang)
  const currentPage = Number(searchParams.get('page')) || 1;
  const currentSort = searchParams.get('sort') || 'newest';
  const currentMin = searchParams.get('minPrice') || '';
  const currentMax = searchParams.get('maxPrice') || '';

  // Đồng bộ URL vào State tạm khi load trang
  useEffect(() => {
    setSort(currentSort);
    setTempMinPrice(currentMin);
    setTempMaxPrice(currentMax);
  }, [currentSort, currentMin, currentMax]);

  // --- HÀM FETCH API ĐÃ CẬP NHẬT ---
  useEffect(() => {
    if (!categoryName) {
      setIsLoading(false);
      return;
    }

    async function fetchProducts() {
      setIsLoading(true);
      try {
        // Xây dựng URL với các tham số lọc
        const queryParams = new URLSearchParams({
          category: categoryName,
          page: currentPage.toString(),
          pageSize: '12',
          // Chỉ thêm nếu có giá trị
          ...(currentSort && { sort: currentSort }),
          ...(currentMin && { minPrice: currentMin }),
          ...(currentMax && { maxPrice: currentMax }),
        });

        const url = `/api/products?${queryParams.toString()}`;
        const res = await fetch(url);
        
        if (!res.ok) throw new Error('Failed to fetch');

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
  }, [categoryName, currentPage, currentSort, currentMin, currentMax]); // Fetch lại khi URL params thay đổi

  // --- XỬ LÝ KHI NGƯỜI DÙNG BẤM LỌC/SẮP XẾP ---
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset về trang 1 khi lọc
    params.set('page', '1'); 
    
    if (sort) params.set('sort', sort);
    else params.delete('sort');

    if (tempMinPrice) params.set('minPrice', tempMinPrice);
    else params.delete('minPrice');

    if (tempMaxPrice) params.set('maxPrice', tempMaxPrice);
    else params.delete('maxPrice');

    // Đẩy URL mới -> Trigger useEffect ở trên
    router.push(`/products/${categorySlug}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/products/${categorySlug}?${params.toString()}`);
  };

  if (!categoryName) return <div className="text-center py-20 text-2xl">404 - Không tìm thấy danh mục</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        Sản phẩm {categoryName}
      </h1>

      {/* --- THANH CÔNG CỤ LỌC & SẮP XẾP (UI MỚI) --- */}
      <div className="p-4 rounded-lg mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-md bg-white">
        
        {/* Bộ lọc khoảng giá */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">Giá từ:</span>
          <input 
            type="number" 
            placeholder="0" 
            value={tempMinPrice}
            onChange={(e) => setTempMinPrice(e.target.value)}
            className="w-24 p-2 border rounded text-sm"
          />
          <span className="text-sm font-medium">-</span>
          <input 
            type="number" 
            placeholder="Đến..." 
            value={tempMaxPrice}
            onChange={(e) => setTempMaxPrice(e.target.value)}
            className="w-28 p-2 border rounded text-sm"
          />
        </div>

        {/* Sắp xếp & Nút áp dụng */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap">Sắp xếp:</span>
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value)}
              className="p-2 border rounded text-sm bg-white "
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="name_asc">Tên A-Z</option>
            </select>
          </div>

          <button 
            onClick={applyFilters}
            className="bg-lime-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-lime-700 transition-colors shadow-md"
          >
            Áp dụng
          </button>
        </div>
      </div>

      {/* --- DANH SÁCH SẢN PHẨM & LOADING --- */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} categorySlug={categorySlug} />
            ))}
          </div>
          
          {/* Pagination */}
          <div className="flex justify-center items-center mt-12 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100"
            >
              Trước
            </button>
            <span className="px-4 py-2 font-semibold text-lime-600">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100"
            >
              Sau
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500 mb-4">Không tìm thấy sản phẩm nào phù hợp.</p>
          <button 
            onClick={() => {
              setTempMinPrice(''); setTempMaxPrice(''); setSort('newest');
              router.push(`/products/${categorySlug}`); // Reset URL
            }}
            className="text-lime-600 underline hover:text-lime-700"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}

// Component chính export default
export default function ProductPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Đang tải trang...</div>}>
      <ProductListContent />
    </Suspense>
  );
}