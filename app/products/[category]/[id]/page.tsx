// Fix for: lvcu04/ecommerce-website/ecommerce-website-f1ee64a7e55e72b83449b939107f70e01a0e999d/app/products/[category]/[id]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product, Review } from '@/app/(types)';
import { authFetch } from '@/app/utils/authFetch';
import starIcon from '@/app/assets/icon/star.png'; // Import ảnh sao
import Link from 'next/link';

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

// Component StarRating (giữ nguyên)
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        let starType = 'empty';
        if (starValue <= fullStars) {
          starType = 'full';
        }
        return (
          <Image
            key={index}
            src={starIcon}
            alt={`${starType} star`}
            width={16}
            height={16}
            className={starType === 'full' ? 'opacity-100' : 'opacity-30'}
          />
        );
      })}
    </div>
  );
};

// --- START: Component Form Đánh giá ---
const ReviewForm = ({ productId, onReviewSubmitted }: { productId: number; onReviewSubmitted: () => void }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const res = await authFetch('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          productId: productId,
          rating: rating,
          comment: comment,
        }),
      }, router);

      if (!res) return; // authFetch đã xử lý 401

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gửi đánh giá thất bại.');
      }

      // Thành công!
      alert('Cảm ơn bạn đã đánh giá sản phẩm!');
      setRating(0);
      setComment('');
      onReviewSubmitted(); // Gọi hàm callback để tải lại danh sách đánh giá

    } catch (err: unknown) {
      if ((err as Error).message !== 'Unauthorized') {
        setError((err as Error).message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold mb-4">Để lại đánh giá của bạn</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá (*)</label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Image
                  src={starIcon}
                  alt={`${star} star`}
                  width={24}
                  height={24}
                  className={`cursor-pointer transition-opacity ${
                    (hoverRating || rating) >= star ? 'opacity-100' : 'opacity-30'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
            Bình luận (tùy chọn)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500"
            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div>
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="bg-lime-600 text-white py-2 px-5 rounded-full font-semibold hover:bg-lime-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </div>
      </form>
    </div>
  );
};
// --- END: Component Form Đánh giá ---


const ProductNestedDetailPage = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [addToCartMessage, setAddToCartMessage] = useState('');
  const [mainImage, setMainImage] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  const { id } = params as { category: string, id: string };
  const productId = Number(id);

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const isLoggedIn = !!getToken(); // <-- Thêm biến kiểm tra đăng nhập

    useEffect(() => {
    if (isNaN(productId)) {
        setIsLoading(false);
        setProduct(null); 
        return;
    }

    async function fetchProduct() {
      setIsLoading(true);
      setProduct(null); 
      setMainImage(null); 
      try {
        const token = getToken();
        const url = `/api/products/${productId}`;
        const headers: HeadersInit = { 'Content-Type': 'application/json' };

        const res = await fetch(url, { headers }); 

        if (!res.ok) {
            if (res.status === 404) {
                return;
            }
            throw new Error(`Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        setProduct(data);

        if (data.imageUrl) {
            setMainImage(data.imageUrl);
        } else {
            setMainImage('https://placehold.co/600x400/EEE/31343C?text=No+Image');
        }

      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [productId]); 


  // Logic Thêm vào Giỏ Hàng (giữ nguyên)
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
          }),
        },
        router // Pass router
      );

      if(response) { 
          setAddToCartMessage(`Đã thêm ${quantity} sản phẩm ${selectedSize ? `(Size: ${selectedSize})` : ''} vào giỏ hàng!`);
          setTimeout(() => setAddToCartMessage(''), 2000);
      }

    } catch (error: unknown) {
      const errorMessage = (error as Error).message;
      if (errorMessage !== 'Unauthorized') { 
        setAddToCartMessage(`Lỗi: ${errorMessage}`);
        setTimeout(() => setAddToCartMessage(''), 3000); 
      } else {
         setAddToCartMessage(''); 
      }
    }
  }, [product, quantity, router, selectedSize]);

// --- START: Hàm fetch reviews (tách riêng) ---
  const fetchReviews = useCallback(async () => {
    if (isNaN(productId)) return; 

    try {
      const res = await fetch(`/api/reviews/product/${productId}`);
      if (!res.ok) throw new Error('Không thể tải đánh giá');
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error('Fetch reviews error:', error);
      setReviews([]); 
    }
  }, [productId]); // <-- Chỉ phụ thuộc vào productId
// --- END: Hàm fetch reviews ---

  // useEffect để fetch reviews (chỉ chạy 1 lần)
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]); // <-- Sử dụng hàm fetchReviews

  // Logic Mua ngay (giữ nguyên)
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
    router.push(`/checkout?productId=${product.id}&quantity=${quantity}&size=${selectedSize}`);
  }, [product, quantity, selectedSize, router]);


  // Hàm xử lý tăng/giảm số lượng (giữ nguyên)
  const handleQuantityChange = (type: 'increment' | 'decrement') => { 
    const newQuantity = type === 'increment' ? quantity + 1 : quantity - 1;
    if (newQuantity >= 1 && newQuantity <= (product?.stock ?? 1)) {
      setQuantity(newQuantity);
    }
  }; 

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
        {/* Cột Ảnh (giữ nguyên) */}
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
                        onError={() => setMainImage('https://placehold.co/600x400/EEE/31343C?text=Image+Error')}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">Loading image...</div>
                )}
            </div>

            {/* Ảnh nhỏ Gallery */}
            <div className="flex justify-start gap-2 overflow-x-auto pb-2">
                {[product.imageUrl, ...GALLERY_IMAGES.filter(src => src !== product.imageUrl)]
                 .filter((src): src is string => typeof src === 'string' && src.trim() !== '') 
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
                             onError={(e) => (e.currentTarget.style.display = 'none')} 
                        />
                    </div>
                ))}
            </div>
        </div>

        {/* Cột Thông tin chi tiết (giữ nguyên) */}
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
                  {size}
                </button>
              ))}
            </div>
            {/* Link hướng dẫn chọn size */}
            <div className="flex justify-end mt-3">
              <a
                href="#" 
                className="flex items-center gap-1 text-sm text-lime-600 hover:underline transition-colors"
                target="_blank" 
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
                type="number"
                value={quantity}
                min="1"
                max={currentStock > 0 ? currentStock : 1}
                disabled={isOutOfStock}
                 onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    const maxStock = product?.stock ?? 0;
                    if (isNaN(value) || value < 1) {
                        setQuantity(1);
                    } else if (value > maxStock && maxStock > 0) {
                        setQuantity(maxStock);
                    } else {
                        setQuantity(value);
                    }
                }}
                className="w-16 h-10 text-center border-y border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-lime-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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

          {/* Vận chuyển và ưu đãi (giữ nguyên) */}
          <div className='mt-6 text-sm space-y-3 border-t pt-6'>
              <p>📦 Miễn phí giao hàng đơn từ 699k <a href="#" className='text-lime-600 hover:underline cursor-pointer'>Xem chi tiết</a></p>
              <p>🔄 Đổi trả miễn phí đến 30 ngày <a href="#" className='text-lime-600 hover:underline cursor-pointer'>Xem chi tiết</a></p>
              <p>💳 Trả góp 0% lãi suất từ 3.000.000 VNĐ <a href="#" className='text-lime-600 hover:underline cursor-pointer'>Xem chi tiết</a></p>
              <p>✅ Thanh toán trực tuyến nhanh chóng và an toàn.</p>
              <p>💯 Sản phẩm chính hãng 100%.</p>
          </div>
        </div>
      </div>

      {/* --- START: Phần đánh giá sản phẩm (CẬP NHẬT) --- */}
      <div className="mt-12 border-t pt-10">
        <h2 className="text-2xl font-bold mb-6">Đánh giá sản phẩm</h2>

        {/* Form để lại đánh giá (Chỉ hiển thị khi đã đăng nhập) */}
        {isLoggedIn ? (
          <ReviewForm productId={productId} onReviewSubmitted={fetchReviews} />
        ) : (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-600">
              Vui lòng <Link href={`/login?redirect=/products/${params.category}/${productId}`} className="text-lime-600 font-semibold hover:underline">đăng nhập</Link> để để lại đánh giá.
            </p>
          </div>
        )}

        {/* Danh sách các đánh giá (giữ nguyên) */}
        <div className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-center mb-2">
                  <StarRating rating={review.rating} />
                  <p className="ml-4 font-bold">{review.user?.name || 'Người dùng ẩn danh'}</p>
                </div>
                {review.comment && <p className="text-gray-600">{review.comment}</p>}
                <p className="text-xs text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
          )}
        </div>
      </div>
       {/* --- END: Phần đánh giá sản phẩm --- */}
    </div>
  );
};

export default ProductNestedDetailPage;