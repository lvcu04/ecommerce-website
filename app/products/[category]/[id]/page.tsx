'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product, Review } from '@/app/(types)';
import { authFetch } from '@/app/utils/authFetch';
import starIcon from '@/app/assets/icon/star.png';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useCartStore } from '@/app/store/useCartStore';

// Định dạng giá tiền
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Dữ liệu giả định
const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const GALLERY_IMAGES = [
  'https://supersports.com.vn/cdn/shop/files/432997-107-3.jpg?v=1757327038',
  'https://supersports.com.vn/cdn/shop/files/432997-107-2.jpg?v=1757327039',
  'https://supersports.com.vn/cdn/shop/files/432997-107-4.jpg?v=1757327039',
  'https://supersports.com.vn/cdn/shop/files/432997-107-5.jpg?v=1757327038',
  'https://supersports.com.vn/cdn/shop/files/432997-107-6.jpg?v=1757327038',
  'https://supersports.com.vn/cdn/shop/files/432997-107-7.jpg?v=1757327039',
  'https://supersports.com.vn/cdn/shop/files/432997-107-8.jpg?v=1757327039&width=1000',
];

// Component StarRating
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        const starType = starValue <= fullStars ? 'full' : 'empty';
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

// --- Component Form Đánh giá (Đã cập nhật Toast) ---
const ReviewForm = ({ productId, onReviewSubmitted }: { productId: number; onReviewSubmitted: () => void }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá.');
      return;
    }
    
    setIsSubmitting(true);
    const toastId = toast.loading('Đang gửi đánh giá...');

    try {
      const res = await authFetch('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          productId: productId,
          rating: rating,
          comment: comment,
        }),
      }, router);

      if (!res) return; // authFetch xử lý 401

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gửi đánh giá thất bại.');
      }

      toast.success('Cảm ơn bạn đã đánh giá sản phẩm!', { id: toastId });
      setRating(0);
      setComment('');
      onReviewSubmitted();

    } catch (err: unknown) {
      const msg = (err as Error).message;
      if (msg !== 'Unauthorized') {
        toast.error(msg, { id: toastId });
      } else {
        toast.dismiss(toastId);
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
                className="focus:outline-none transition-transform hover:scale-110"
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500 p-2"
            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="bg-lime-600 text-white py-2 px-5 rounded-full font-semibold hover:bg-lime-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </div>
      </form>
    </div>
  );
};

const ProductNestedDetailPage = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const params = useParams();
  const router = useRouter();
  // Lấy store để cập nhật giỏ hàng
  const { fetchCartCount } = useCartStore();

  const { id } = params as { category: string, id: string };
  const productId = Number(id);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    setIsLoggedIn(!!token);
  }, []);

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
        const url = `/api/products/${productId}`;
        const res = await fetch(url); 
        if (!res.ok) {
            if (res.status === 404) return;
            throw new Error(`Error: ${res.status}`);
        }
        const data = await res.json();
        setProduct(data);
        setMainImage(data.imageUrl || 'https://placehold.co/600x400/EEE/31343C?text=No+Image');
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [productId]); 

  // Logic Thêm vào Giỏ Hàng
  const handleAddToCart = useCallback(async () => {
    if (!product || quantity <= 0) return;
    if (!selectedSize) {
      toast.error('Vui lòng chọn Kích thước.');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Vui lòng đăng nhập để mua hàng.');
      setTimeout(() => router.push('/login'), 1500);
      return;
    }

    const loadingToast = toast.loading('Đang thêm vào giỏ...');

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
        router
      );

      if(response) { 
          toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ!`, { id: loadingToast });
          // Cập nhật số lượng trên Header ngay lập tức
          fetchCartCount(router);
      }

    } catch (error: unknown) {
      const errorMessage = (error as Error).message;
      if (errorMessage !== 'Unauthorized') { 
        toast.error(`Lỗi: ${errorMessage}`, { id: loadingToast });
      } else {
        toast.dismiss(loadingToast);
      }
    }
  }, [product, quantity, router, selectedSize, fetchCartCount]);

  // Fetch Reviews
  const fetchReviews = useCallback(async () => {
    if (isNaN(productId)) return; 
    try {
      const resReviews = await fetch(`/api/reviews/product/${productId}`);
      if (resReviews.ok) setReviews(await resReviews.json());

      const resStats = await fetch(`/api/reviews/stats/${productId}`);
      if (resStats.ok) setReviewStats(await resStats.json());

    } catch (error) {
      console.error('Fetch reviews error:', error);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    if (!selectedSize) {
      toast.error('Vui lòng chọn Kích thước.');
      return;
    }
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push(`/login?redirect=/checkout?productId=${product.id}&quantity=${quantity}`);
      return;
    }
    router.push(`/checkout?productId=${product.id}&quantity=${quantity}`);
  }, [product, quantity, selectedSize, router]);


  const handleQuantityChange = (type: 'increment' | 'decrement') => { 
    const newQuantity = type === 'increment' ? quantity + 1 : quantity - 1;
    const stock = product?.stock ?? 1;
    if (newQuantity >= 1 && newQuantity <= stock) {
      setQuantity(newQuantity);
    }
  }; 

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải chi tiết sản phẩm...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold mb-4">404 - Không tìm thấy Sản phẩm.</h1>
        <button onClick={() => router.back()} className="mt-4 bg-lime-600 text-white px-6 py-2 rounded hover:bg-lime-700">
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
        {/* Cột Ảnh */}
        <div className="lg:w-1/2">
            <div className="relative h-96 md:h-[500px] overflow-hidden mb-4 bg-gray-100 rounded-lg shadow-sm">
                {mainImage && (
                    <Image
                        src={mainImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-contain p-4"
                        priority
                    />
                )}
            </div>
            <div className="flex justify-start gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[product.imageUrl, ...GALLERY_IMAGES.filter(src => src !== product.imageUrl)]
                 .filter((src): src is string => !!src) 
                 .map((src, index) => (
                    <div
                        key={index}
                        onClick={() => setMainImage(src)}
                        className={`
                            relative w-20 h-20 min-w-[80px] cursor-pointer border-2 rounded-md overflow-hidden transition-all duration-200 bg-gray-50
                            ${mainImage === src ? 'border-lime-600 ring-2 ring-lime-100' : 'border-gray-200 hover:border-gray-400'}
                        `}
                    >
                        <Image src={src} alt={`thumb-${index}`} fill className="object-cover" />
                    </div>
                ))}
            </div>
        </div>

        {/* Cột Thông tin */}
        <div className="lg:w-1/2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-3xl font-extrabold text-lime-600 mb-6">{formatPrice(product.price)}</p>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-900">Kích Thước</h2>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`
                    px-4 py-2 border rounded-md text-sm font-medium transition-all
                    ${selectedSize === size
                      ? 'bg-lime-600 border-lime-600 text-white shadow-md'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-lime-500 hover:text-lime-600'}
                    ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  disabled={isOutOfStock}
                >
                  {size}
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-2">
               <a href="#" className="flex items-center gap-1 text-sm text-lime-600 hover:underline">
                 <Image src="https://cdn.kiwisizing.com/customIcons/supersports-vietnam-1719475595888.png" alt="ruler" width={16} height={16} />
                 Hướng dẫn chọn kích thước
               </a>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Mô tả</h2>
            <p className="text-gray-600 leading-relaxed">{product.description || 'Chưa có mô tả.'}</p>
          </div>

          <div className="mb-6">
             <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isOutOfStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {isOutOfStock ? 'Hết hàng' : `Còn hàng (${currentStock})`}
             </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 border-t pt-6">
             <div className="flex items-center border border-gray-300 rounded-md h-12 w-fit">
                <button onClick={() => handleQuantityChange('decrement')} disabled={isOutOfStock || quantity <= 1} className="px-4 text-xl text-gray-600 hover:bg-gray-100 h-full disabled:opacity-50">-</button>
                <input 
                    type="number" 
                    value={quantity} 
                    readOnly 
                    className="w-12 text-center border-x border-gray-300 h-full focus:outline-none" 
                />
                <button onClick={() => handleQuantityChange('increment')} disabled={isOutOfStock || quantity >= currentStock} className="px-4 text-xl text-gray-600 hover:bg-gray-100 h-full disabled:opacity-50">+</button>
             </div>
             
             <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 bg-[#001A2D] text-white h-12 rounded-full font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
             >
                MUA NGAY
             </button>
             <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 border-2 border-lime-600 text-lime-600 h-12 rounded-full font-bold hover:bg-lime-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
                THÊM VÀO GIỎ
             </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 border-t pt-10">
        <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold">Đánh giá sản phẩm</h2>
            {reviewStats.totalReviews > 0 && (
                <div className="flex items-center bg-lime-50 px-3 py-1 rounded-full border border-lime-200">
                    <span className="text-xl font-bold text-lime-700 mr-1">{reviewStats.averageRating.toFixed(1)}</span>
                    <Image src={starIcon} alt="star" width={16} height={16} />
                    <span className="text-sm text-gray-500 ml-2">({reviewStats.totalReviews} lượt)</span>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-1">
                {isLoggedIn ? (
                    <ReviewForm productId={productId} onReviewSubmitted={fetchReviews} />
                ) : (
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
                        <p className="text-gray-600 mb-4">Bạn cần đăng nhập để đánh giá sản phẩm này.</p>
                        <Link href={`/login?redirect=/products/${params.category}/${productId}`} className="inline-block bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium">
                            Đăng nhập ngay
                        </Link>
                    </div>
                )}
            </div>

            {/* List */}
            <div className="lg:col-span-2 space-y-6">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-0">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                                        {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{review.user?.name || 'Người dùng ẩn danh'}</p>
                                        <div className="flex items-center">
                                            <StarRating rating={review.rating} />
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <p className="text-gray-700 mt-2 bg-gray-50 p-3 rounded-lg">{review.comment}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductNestedDetailPage;