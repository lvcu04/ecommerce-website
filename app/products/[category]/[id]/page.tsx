'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product } from '@/app/(types)'; 

// Định dạng giá tiền
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Dữ liệu giả định cho Kích thước (Size)
const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
// Ảnh gallery giả định
const GALLERY_IMAGES = [
  'https://supersports.com.vn/cdn/shop/files/432997-107-3.jpg?v=1757327038',
  'https://supersports.com.vn/cdn/shop/files/432997-107-2.jpg?v=1757327039',
  'https://supersports.com.vn/cdn/shop/files/432997-107-4.jpg?v=1757327039',
  'https://supersports.com.vn/cdn/shop/files/432997-107-5.jpg?v=1757327038',
  'https://supersports.com.vn/cdn/shop/files/432997-107-6.jpg?v=1757327038',
  'https://supersports.com.vn/cdn/shop/files/432997-107-7.jpg?v=1757327039',
  'https://supersports.com.vn/cdn/shop/files/432997-107-8.jpg?v=1757327039&width=1000',
];
const ProductNestedDetailPage = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null); // State mới cho size // highlight-line
  const [addToCartMessage, setAddToCartMessage] = useState('');
  const [mainImage, setMainImage] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  
  const { id } = params as { category: string, id: string };
  const productId = Number(id);

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    useEffect(() => {
    if (isNaN(productId)) {
        setIsLoading(false);
        return;
    }
    
    async function fetchProduct() {
      setIsLoading(true);
      try {
        const token = getToken();
        const url = `http://localhost/products/${productId}`;
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(url, { headers });
        
        if (!res.ok) {
            // ... (xử lý lỗi giữ nguyên)
            
            if (res.status === 401) {
                router.push('/login');
                return; 
            }
            if (res.status === 404) {
                setProduct(null);
                return;
            }
            throw new Error(`Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        setProduct(data);
        
        // --- ĐIỂM CHỈNH SỬA: Khởi tạo ảnh chính ---
        if (data.imageUrl) {
            setMainImage(data.imageUrl);
        } else {
            // Fallback nếu không có ảnh
            setMainImage('https://placehold.co/600x400/EEE/31343C?text=No+Image'); 
        }
        // ----------------------------------------
        
      } catch (error) {
        console.error('Fetch error:', error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [productId, router]);


  // Logic Thêm vào Giỏ Hàng (thêm kiểm tra size và truyền size vào payload)
  const handleAddToCart = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setAddToCartMessage('Vui lòng đăng nhập để thêm vào giỏ hàng.');
      router.push('/login');
      return;
    }

    if (!product || quantity <= 0) return;

    if (!selectedSize) { // highlight-line
      setAddToCartMessage('Vui lòng chọn Kích thước.'); // highlight-line
      return; // highlight-line
    }

    setAddToCartMessage('Đang thêm...');

    try {
      // Endpoint: /cart/add
      const response = await fetch('http://localhost:3001/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
            productId: product.id, 
            quantity: quantity,
            // Thêm size vào payload (Mặc dù backend hiện tại không dùng, nhưng đây là cách chuẩn bị)
            size: selectedSize, 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Thêm vào giỏ hàng thất bại.');
      }

      setAddToCartMessage(`Đã thêm ${quantity} sản phẩm (Size: ${selectedSize}) vào giỏ hàng!`);
      setTimeout(() => setAddToCartMessage(''), 2000);

    } catch (error: unknown) { // Sửa lỗi 'any' bằng 'unknown'
      setAddToCartMessage(`Lỗi: ${(error as Error).message}`);
    }
  }, [product, quantity, router, selectedSize]); // Thêm selectedSize vào dependency array // highlight-line


  // Cập nhật hàm xử lý tăng/giảm số lượng
  const handleQuantityChange = (type: 'increment' | 'decrement') => { // highlight-start
    const newQuantity = type === 'increment' ? quantity + 1 : quantity - 1;
    if (newQuantity > 0 && newQuantity <= (product?.stock ?? 0)) {
      setQuantity(newQuantity);
    }
  }; // highlight-end

  // --- Render UI ---

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải chi tiết sản phẩm...</div>;
  }
  
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-3xl font-bold">404 - Không tìm thấy Sản phẩm.</h1>
      </div>
    );
  }

  const currentStock = product.stock ?? 0;
  const isOutOfStock = currentStock <= 0;

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-1/2"> 
        
        {/* Ảnh Chính - Bỏ rounded-md và shadow-2xl để trông "full" hơn */}
        <div className="relative h-96 md:h-[500px] overflow-hidden mb-4"> 
            {/* Giữ nguyên mb-4 để tạo khoảng cách với gallery ảnh nhỏ */}
            {mainImage && (
                <Image
                    src={mainImage} 
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain transition-opacity duration-300" // Dùng object-contain để ảnh không bị cắt (nếu cần)
                    priority
                />
            )}
        </div> 

        {/* Ảnh nhỏ Gallery - Trải dài hết chiều rộng ảnh chính */}
        <div className="flex justify-start gap-2 overflow-x-auto pb-2">
            {[product.imageUrl, ...GALLERY_IMAGES.filter(src => src !== product.imageUrl)].filter(Boolean).map((src, index) => (
                <div 
                    key={index} 
                    onClick={() => setMainImage(src as string)}
                    className={`
                        relative w-20 h-20 min-w-[80px] cursor-pointer border-2 rounded-md overflow-hidden transition-all duration-200
                        ${mainImage === src ? 'border-lime-600' : 'border-gray-200 hover:border-gray-400'}
                    `}
                >
                    <Image
                        src={src as string}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                    />
                </div>
            ))}
        </div>
    </div> 
        

        {/* Cột Thông tin chi tiết */}
        <div className="lg:w-1/2">
          <h1 className="text-4xl font-bold text-gray-900  mb-4">{product.name}</h1>
          
          <p className="text-3xl font-extrabold text-lime-600 mb-6">
            {formatPrice(product.price)}
          </p>
          
          {/* Form chọn Kích thước */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Kích Thước</h2>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`
                    px-4 py-2 border rounded-md text-sm font-medium transition-colors
                    ${selectedSize === size 
                      ? 'bg-lime-600 border-lime-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-700 hover:border-lime-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-lime-500'}
                    ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  disabled={isOutOfStock}
                >
                  {size.replace('US ', 'US ')}
                </button>
              ))}
            </div>
            {/* Link hướng dẫn chọn size hoặc kiểm tra cửa hàng (nếu muốn, tham khảo ảnh) */}
            <div className="flex justify-end mb-3">
              <a 
                href="#" 
                // Căn giữa icon và text, thêm gap, và áp dụng hover:underline
                className="flex items-center gap-1 text-sm text-lime-600 hover:underline transition-colors"
              >
                <Image 
                  src="https://cdn.kiwisizing.com/customIcons/supersports-vietnam-1719475595888.png" 
                  alt="Hướng dẫn kích thước icon" 
                  width={16} 
                  height={16} 
                  // Bỏ className="inline-block" vì flex container đã xử lý
                />
                <span>Hướng dẫn chọn kích thước</span>
              </a>
            </div>
          </div>


          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Mô tả sản phẩm</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
            </p>
          </div>

          <div className="mb-6">
            <p className={`font-semibold ${isOutOfStock ? 'text-red-500' : 'text-green-500'}`}>
              Tình trạng: {isOutOfStock ? 'Hết hàng' : `Còn hàng (${currentStock} sản phẩm)`}
            </p>
          </div>

          {/* Form Số lượng và Thêm vào Giỏ hàng */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 border-t pt-6">
            
            {/* Control Số lượng */}
            <div className="flex items-center space-x-0 border border-gray-300 dark:border-gray-700 rounded-md">
              <button
                onClick={() => handleQuantityChange('decrement')}
                disabled={isOutOfStock || quantity <= 1}
                className="w-10 h-10 flex items-center justify-center text-xl font-bold text-gray-700 disabled:opacity-50"
              >
                -
              </button>
              <input
                type="text" 
                max={currentStock}
                value={quantity}
                disabled={isOutOfStock}
                onChange={(e) => { 
                    const value = e.target.value;
                    const numValue = Number(value);
                    const maxStock = product?.stock ?? 0;

                    if (value === '') {
                        setQuantity(0); 
                    } else if (!isNaN(numValue) && numValue >= 1) {
                        if (numValue <= maxStock) {
                            setQuantity(numValue);
                        } else {
                            setQuantity(maxStock);
                        }
                    } else if (numValue < 1) {
                        setQuantity(1);
                    }
                }}
                className="w-16 h-10 text-center border-l border-r border-gray-300 dark:border-gray-700 focus:outline-none"
                />
              <button
                onClick={() => handleQuantityChange('increment')}
                disabled={isOutOfStock || quantity >= currentStock}
                className="w-10 h-10 flex items-center justify-center text-xl font-bold text-gray-700 disabled:opacity-50"
              >
                +
              </button>
            </div>

            {/* Nút Mua Ngay và Thêm vào Giỏ */}
            <div className='flex-1 flex gap-4'>
                <button
                  disabled={isOutOfStock || !selectedSize}
                  className="w-1/2 bg-[#001A2D] text-white py-3 px-6 rounded-full font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  // Giả lập nút "Mua Ngay" - hiện tại giống với Thêm vào Giỏ
                  onClick={handleAddToCart} 
                >
                  MUA NGAY
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || !selectedSize}
                  className="w-1/2 border border-lime-600 text-lime-600 py-3 px-6 rounded-full font-semibold hover:bg-lime-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  THÊM VÀO GIỎ HÀNG
                </button>
            </div>
          </div>
          
          {addToCartMessage && (
            <p className={`mt-4 text-sm font-medium ${addToCartMessage.startsWith('Lỗi') ? 'text-red-500' : 'text-green-500'}`}>
              {addToCartMessage}
            </p>
          )}
          
          {/* Vận chuyển và ưu đãi (tham khảo ảnh) */}
          <div className='mt-6 text-sm space-y-3'>
              <p>📦 Miễn phí giao hàng đơn từ 699k <span className='text-lime-600 hover:underline cursor-pointer'>Xem chi tiết</span></p>
              <p>🔄 Đổi trả miễn phí đến 30 ngày <span className='text-lime-600 hover:underline cursor-pointer'>Xem chi tiết</span></p>
              <p>💳 Trả góp 0% lãi suất từ 3.000.000 VNĐ <span className='text-lime-600 hover:underline cursor-pointer'>Xem chi tiết</span></p>
              <p>✅ Thanh toán trực tuyến nhanh chóng và an toàn.</p>
              <p>💯 Sản phẩm chính hãng 100%.</p>
          </div>
        </div>
      </div>
    </div>

  );
};

export default ProductNestedDetailPage;