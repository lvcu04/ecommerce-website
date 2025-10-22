// lvcu04/ecommerce-website/ecommerce-website-91dfbbe559002d36a31d8c3ddfd76504a9b35ae4/app/cart/page.tsx

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaTrashAlt } from 'react-icons/fa';
import { Product } from '@/app/(types)';

// Định nghĩa kiểu dữ liệu cho CartItem (chú ý: đây là CartItem từ backend, có thêm Product)
interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  addedAt: string;
  product: Product;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};



export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Helper function để lấy token và headers
  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      router.push('/login');
      return null;
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }, [router]);

  // Hàm Fetch Cart
  const fetchCart = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cart', { headers });
      
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      
      if (!res.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data: CartItem[] = await res.json();
      setCart(data);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tải giỏ hàng. Vui lòng thử lại.');
      setCart([]);
    } finally {
      setIsLoading(false);
    }
  }, [router , getAuthHeaders]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Tính tổng tiền
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity * item.product.price, 0);
  }, [cart]);

  // Xử lý thay đổi số lượng
  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    const headers = getAuthHeaders();
    if (!headers) return;
    
    // Tối ưu UI: Cập nhật state ngay lập tức
    setCart(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));

    try {
      const res = await fetch(`/api/cart/${itemId}/quantity`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!res.ok) {
        // Nếu lỗi, rollback lại và báo lỗi
        fetchCart(); 
        throw new Error('Failed to update quantity');
      }
      // Nếu thành công, dữ liệu đã được cập nhật chính xác (hoặc có thể refetch)
      // Hiện tại, ta dựa vào optimistic update và chỉ refetch khi có lỗi.

    } catch (err) {
      console.error(err);
      setError('Lỗi cập nhật số lượng. Đang tải lại giỏ hàng...');
      fetchCart(); // Refetch nếu có lỗi
    }
  };
  
  // Xử lý xóa item
  const handleRemoveItem = async (itemId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) return;
    
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) {
        throw new Error('Failed to remove item');
      }

      // Xóa khỏi state ngay lập tức (optimistic update)
      setCart(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error(err);
      setError('Lỗi xóa sản phẩm. Đang tải lại giỏ hàng...');
      fetchCart();
    }
  };
  
  // Xử lý xóa toàn bộ giỏ hàng
  const handleClearCart = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa TẤT CẢ sản phẩm khỏi giỏ hàng?')) return;

    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const res = await fetch('/api/cart/clear', {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) {
        throw new Error('Failed to clear cart');
      }

      setCart([]);
    } catch (err) {
      console.error(err);
      setError('Lỗi xóa giỏ hàng.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 text-center min-h-[60vh]">
        <p className="text-gray-500">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="container mx-auto py-12 text-center min-h-[60vh]">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto py-20 text-center min-h-[60vh]">
        <h1 className="text-3xl font-bold mb-4">Giỏ hàng của bạn đang trống</h1>
        <p className="text-gray-600 mb-6">Hãy quay lại trang sản phẩm để tìm kiếm những món đồ yêu thích!</p>
        <Link href="/" className="bg-lime-600 text-white px-6 py-3 rounded-full hover:bg-lime-700 transition-colors">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-4xl font-bold mb-10 text-gray-900 dark:text-white text-center">Giỏ Hàng Của Tôi ({cart.length})</h1>
      
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Cột trái: Danh sách sản phẩm */}
        <div className="lg:w-8/12 space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center border border-gray-200 rounded-lg p-4 shadow-sm transition-shadow hover:shadow-md">
              
              {/* Hình ảnh */}
              <div className="w-20 h-20 flex-shrink-0 relative mr-4">
                <Image
                  src={item.product.imageUrl || 'https://placehold.co/80x80/EEE/31343C?text=No+Image'}
                  alt={item.product.name}
                  fill
                  sizes="80px"
                  className="object-cover rounded-md"
                />
              </div>

              {/* Chi tiết sản phẩm */}
              <div className="flex-1 min-w-0">
                <Link href={`/products/men/${item.product.id}`} className="text-lg font-semibold text-gray-900 hover:text-lime-600 truncate">
                  {item.product.name}
                </Link>
                <p className="text-lime-600 font-bold mt-1">
                  {formatPrice(item.product.price)}
                </p>
                {/* Có thể thêm Size/Color ở đây nếu backend có lưu */}
              </div>

              {/* Số lượng */}
              <div className="flex items-center mx-4">
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-8 h-8 flex items-center justify-center text-xl font-bold text-gray-700 disabled:opacity-50 border border-gray-300 rounded-l-md hover:bg-gray-100 transition-colors"
                >
                  -
                </button>
                <input
                  type="text"
                  value={item.quantity}
                  min="1"
                  max={item.product.stock}
                  onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                  className="w-12 h-8 text-center border-y border-gray-300 focus:outline-none"
                />
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stock}
                  className="w-8 h-8 flex items-center justify-center text-xl font-bold text-gray-700 disabled:opacity-50 border border-gray-300 rounded-r-md hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>

              {/* Thành tiền và Xóa */}
              <div className="flex flex-col items-end min-w-[120px]">
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
                <button 
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-500 hover:text-red-700 transition-colors flex items-center"
                >
                  <FaTrashAlt className="mr-1" size={14} /> Xóa
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-4 border-t border-gray-200">
             <button
                onClick={handleClearCart}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
                Xóa toàn bộ giỏ hàng
            </button>
          </div>
        </div>

        {/* Cột phải: Tổng kết đơn hàng */}
        <div className="lg:w-4/12">
          <div className="bg-gray-50 p-6 rounded-lg shadow-lg sticky top-24">
            <h2 className="text-2xl font-bold mb-6 border-b pb-3">Tóm Tắt Đơn Hàng</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-gray-700">
                <span>Tạm tính ({cart.length} sản phẩm):</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              
              <div className="flex justify-between text-gray-700">
                <span>Phí vận chuyển:</span>
                <span className="text-green-600">Miễn phí</span>
              </div>
              
              <div className="flex justify-between text-xl font-bold pt-4 border-t border-gray-200">
                <span>Tổng cộng:</span>
                <span className="text-lime-600">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')} // Chuyển hướng đến trang checkout (bước tiếp theo)
              disabled={cart.length === 0}
              className="mt-6 w-full bg-lime-600 text-white py-3 rounded-full font-semibold hover:bg-lime-700 transition-colors disabled:bg-gray-400"
            >
              TIẾN HÀNH ĐẶT HÀNG
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}

// Cần tạo file app/checkout/page.tsx và cập nhật Auth token trong API_URL
// để hoàn thành chức năng này.