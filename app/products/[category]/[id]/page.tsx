// Fix for: lvcu04/ecommerce-website/ecommerce-website-f1ee64a7e55e72b83449b939107f70e01a0e999d/app/products/[category]/[id]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product, Review } from '@/app/(types)';
import { authFetch } from '@/app/utils/authFetch';
import starIcon from '@/app/assets/icon/star.png'; // Import ảnh sao

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

// Removed unused 'rating' prop from destructuring
const StarRating = ({ rating }: { rating: number }) => {
  // Determine the number of full stars
  const fullStars = Math.floor(rating);
  // Determine if there is a half star (optional, depending on how you want to handle non-integers)
  // const hasHalfStar = rating % 1 !== 0; // Uncomment if you want half stars

  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        let starType = 'empty'; // Default to empty
        if (starValue <= fullStars) {
          starType = 'full';
        }
        // Add logic for half stars if needed
        // else if (hasHalfStar && starValue === fullStars + 1) {
        //   starType = 'half';
        // }

        return (
          <Image
            key={index}
            src={starIcon} // Assuming starIcon is the full star
            alt={`${starType} star`}
            width={16}
            height={16}
            className={starType === 'full' ? 'opacity-100' : 'opacity-30'} // Example: Dim empty stars
            // Add different images or styles for half/empty stars if desired
          />
        );
      })}
    </div>
  );
};

const ProductNestedDetailPage = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
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
        setProduct(null); // Set product to null if ID is invalid
        return;
    }

    async function fetchProduct() {
      setIsLoading(true);
      setProduct(null); // Reset product state on new fetch
      setMainImage(null); // Reset main image
      try {
        const token = getToken();
        const url = `/api/products/${productId}`;
        const headers: HeadersInit = { 'Content-Type': 'application/json' };

        // No need for Authorization header if GET /api/products/:id is public

        const res = await fetch(url, { headers }); // Removed Authorization header if not needed

        if (!res.ok) {
            if (res.status === 404) {
                // Product not found, state already null
                return;
            }
            throw new Error(`Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        setProduct(data);

        // --- Initialize main image ---
        if (data.imageUrl) {
            setMainImage(data.imageUrl);
        } else {
            // Fallback if no image
            setMainImage('https://placehold.co/600x400/EEE/31343C?text=No+Image');
        }
        // ----------------------------------------

      } catch (error) {
        console.error('Fetch error:', error);
        // Product state remains null
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [productId]); // Removed router from dependencies if not needed for public fetch


  // Logic Thêm vào Giỏ Hàng
  const handleAddToCart = useCallback(async () => {
    if (!product || quantity <= 0) return;
    if (!selectedSize) {
      setAddToCartMessage('Vui lòng chọn Kích thước.');
      setTimeout(() => setAddToCartMessage(''), 2000); // Clear message after 2s
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setAddToCartMessage('Vui lòng đăng nhập để thêm vào giỏ hàng.');
      setTimeout(() => { // Give time to read message before redirect
        setAddToCartMessage('');
        router.push('/login');
      }, 1500);
      return;
    }

    setAddToCartMessage('Đang thêm...');

    try {
      const response = await authFetch(
        '/api/cart/add',
        {
          method: 'POST',
          body: JSON.stringify({
            productId: product.id,
            quantity: quantity,
            // size: selectedSize, // Include size if backend expects it
          }),
        },
        router // Pass router
      );

      // No need to check response.ok here, authFetch throws 'Unauthorized'
      // if (response && !response.ok) { // Check if response exists before accessing ok
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Thêm vào giỏ hàng thất bại.');
      // }

      if(response) { // Only proceed if authFetch didn't throw/redirect
          setAddToCartMessage(`Đã thêm ${quantity} sản phẩm ${selectedSize ? `(Size: ${selectedSize})` : ''} vào giỏ hàng!`);
          setTimeout(() => setAddToCartMessage(''), 2000);
          // Optionally refresh cart data or show a cart preview
      }

    } catch (error: unknown) {
      const errorMessage = (error as Error).message;
      if (errorMessage !== 'Unauthorized') { // Don't show error if already handled
        setAddToCartMessage(`Lỗi: ${errorMessage}`);
        setTimeout(() => setAddToCartMessage(''), 3000); // Show error longer
      } else {
         setAddToCartMessage(''); // Clear "Đang thêm..." if unauthorized
      }
    }
  }, [product, quantity, router, selectedSize]);

// useEffect mới để fetch reviews
  useEffect(() => {
    if (isNaN(productId)) return; // Check if productId is valid number

    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews/product/${productId}`);
        if (!res.ok) throw new Error('Không thể tải đánh giá');
        const data = await res.json();
        setReviews(data);
      } catch (error) {
        console.error('Fetch reviews error:', error);
        setReviews([]); // Set to empty array on error
      }
    };

    fetchReviews();
  }, [productId]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    if (!selectedSize) {
      setAddToCartMessage('Vui lòng chọn Kích thước.');
       setTimeout(() => setAddToCartMessage(''), 2000);
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login?redirect=/checkout?productId=' + product.id + '&quantity=' + quantity + '&size=' + selectedSize); // Redirect with target
      return;
    }

    // Chuyển hướng đến trang checkout với thông tin sản phẩm
    router.push(`/checkout?productId=${product.id}&quantity=${quantity}&size=${selectedSize}`);
  }, [product, quantity, selectedSize, router]);


  // Cập nhật hàm xử lý tăng/giảm số lượng
  const handleQuantityChange = (type: 'increment' | 'decrement') => { // highlight-start
    const newQuantity = type === 'increment' ? quantity + 1 : quantity - 1;
    // Ensure quantity doesn't go below 1 or exceed stock
    if (newQuantity >= 1 && newQuantity <= (product?.stock ?? 1)) {
      setQuantity(newQuantity);
    }
  }; // highlight-end

  // --- Render UI ---

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải chi tiết sản phẩm...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold mb-4">404 - Không tìm thấy Sản phẩm.</h1>
        <p className="text-gray-600">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <button onClick={() => router.back()} className="mt-6 bg-lime-600 text-white px-6 py-2 rounded hover:bg-lime-700">
            Quay lại
        </button>
      </div>
    );
  }

  const currentStock = product.stock ?? 0;
  const isOutOfStock = currentStock <= 0;

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-1/2">

        {/* Ảnh Chính */}
        <div className="relative h-96 md:h-[500px] overflow-hidden mb-4 bg-gray-100 rounded">
            {mainImage ? (
                <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain transition-opacity duration-300"
                    priority
                    onError={() => setMainImage('https://placehold.co/600x400/EEE/31343C?text=Image+Error')} // Handle image load error
                />
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500">Loading image...</div>
            )}
        </div>

        {/* Ảnh nhỏ Gallery */}
        <div className="flex justify-start gap-2 overflow-x-auto pb-2">
            {[product.imageUrl, ...GALLERY_IMAGES.filter(src => src !== product.imageUrl)]
             .filter((src): src is string => typeof src === 'string' && src.trim() !== '') // Ensure only valid strings
             .map((src, index) => (
                <div
                    key={index}
                    onClick={() => setMainImage(src)}
                    className={`
                        relative w-20 h-20 min-w-[80px] cursor-pointer border-2 rounded-md overflow-hidden transition-all duration-200 bg-gray-100
                        ${mainImage === src ? 'border-lime-600' : 'border-gray-200 hover:border-gray-400'}
                    `}
                >
                    <Image
                        src={src}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                         onError={(e) => (e.currentTarget.style.display = 'none')} // Hide thumbnail on error
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
                  {size} {/* Simplified display */}
                </button>
              ))}
            </div>
            {/* Link hướng dẫn chọn size */}
            <div className="flex justify-end mt-3"> {/* Added margin-top */}
              <a
                href="#" // Replace with actual link
                className="flex items-center gap-1 text-sm text-lime-600 hover:underline transition-colors"
                target="_blank" // Open in new tab if external link
                rel="noopener noreferrer"
              >
                <Image
                  src="https://cdn.kiwisizing.com/customIcons/supersports-vietnam-1719475595888.png"
                  alt="Hướng dẫn kích thước icon"
                  width={16}
                  height={16}
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
                className="w-10 h-10 flex items-center justify-center text-xl font-bold text-gray-700 disabled:opacity-50 rounded-l-md hover:bg-gray-100"
                aria-label="Giảm số lượng"
              >
                -
              </button>
              <input
                type="number" // Use type="number" for better semantics/mobile keyboards
                value={quantity}
                min="1"
                max={currentStock > 0 ? currentStock : 1} // Prevent exceeding stock
                disabled={isOutOfStock}
                 onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    const maxStock = product?.stock ?? 0;
                    if (isNaN(value) || value < 1) {
                        setQuantity(1); // Reset to 1 if invalid or less than 1
                    } else if (value > maxStock && maxStock > 0) {
                        setQuantity(maxStock); // Set to max stock if exceeded
                    } else {
                        setQuantity(value);
                    }
                }}
                className="w-16 h-10 text-center border-y border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-lime-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" // Hide number arrows
                 aria-label="Số lượng sản phẩm"
                />
              <button
                onClick={() => handleQuantityChange('increment')}
                disabled={isOutOfStock || quantity >= currentStock}
                className="w-10 h-10 flex items-center justify-center text-xl font-bold text-gray-700 disabled:opacity-50 rounded-r-md hover:bg-gray-100"
                 aria-label="Tăng số lượng"
              >
                +
              </button>
            </div>

            {/* Nút Mua Ngay và Thêm vào Giỏ */}
            <div className='flex-1 flex flex-col sm:flex-row gap-4'>
                <button
                  disabled={isOutOfStock || !selectedSize}
                  className="flex-1 bg-[#001A2D] text-white py-3 px-6 rounded-full font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleBuyNow}
                >
                  MUA NGAY
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || !selectedSize}
                  className="flex-1 border border-lime-600 text-lime-600 py-3 px-6 rounded-full font-semibold hover:bg-lime-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  THÊM VÀO GIỎ HÀNG
                </button>
            </div>
          </div>

          {addToCartMessage && (
            <p className={`mt-4 text-sm font-medium ${addToCartMessage.startsWith('Lỗi') || addToCartMessage.includes('Vui lòng') ? 'text-red-500' : 'text-green-500'}`}>
              {addToCartMessage}
            </p>
          )}

          {/* Vận chuyển và ưu đãi */}
          <div className='mt-6 text-sm space-y-3 border-t pt-6'>
              <p>📦 Miễn phí giao hàng đơn từ 699k <a href="#" className='text-lime-600 hover:underline cursor-pointer'>Xem chi tiết</a></p>
              <p>🔄 Đổi trả miễn phí đến 30 ngày <a href="#" className='text-lime-600 hover:underline cursor-pointer'>Xem chi tiết</a></p>
              <p>💳 Trả góp 0% lãi suất từ 3.000.000 VNĐ <a href="#" className='text-lime-600 hover:underline cursor-pointer'>Xem chi tiết</a></p>
              <p>✅ Thanh toán trực tuyến nhanh chóng và an toàn.</p>
              <p>💯 Sản phẩm chính hãng 100%.</p>
          </div>
        </div>
      </div>
      {/* Phần đánh giá sản phẩm */}
      <div className="mt-12 border-t pt-10">
        <h2 className="text-2xl font-bold mb-6">Đánh giá sản phẩm</h2>

        {/* Form để lại đánh giá (TODO: Add logic) */}
        {/* <div className="mb-8 p-6 bg-gray-50 rounded-lg"> ... </div> */}

        {/* Danh sách các đánh giá */}
        <div className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-center mb-2">
                  <StarRating rating={review.rating} />
                  <p className="ml-4 font-bold">{review.user?.name || 'Người dùng ẩn danh'}</p> {/* Added optional chaining */}
                </div>
                {review.comment && <p className="text-gray-600">{review.comment}</p>} {/* Only render if comment exists */}
                <p className="text-xs text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductNestedDetailPage;