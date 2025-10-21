'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authFetch } from '@/app/utils/authFetch'; // Dùng lại hàm fetch tiện ích của chúng ta
import { Product } from '@/app/(types)';

// Kiểu dữ liệu cho CartItem từ API
interface CartItem {
  id: number;
  quantity: number;
  product: Product;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // State cho form thông tin giao hàng
  const [address, setAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');

  // Lấy thông tin giỏ hàng để hiển thị tóm tắt
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await authFetch('/api/cart', {}, router);
        if (!res.ok) throw new Error('Không thể tải giỏ hàng.');
        const data = await res.json();
        if (data.length === 0) {
            alert('Giỏ hàng trống, bạn sẽ được chuyển về trang chủ.');
            router.push('/');
        }
        setCartItems(data);
      } catch (err) {
        if ((err as Error).message !== 'Unauthorized') {
            setError((err as Error).message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();
  }, [router]);

  // Tính tổng tiền
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity * item.product.price, 0);
  }, [cartItems]);

  // Xử lý khi nhấn nút Đặt hàng
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !customerName || !phone) {
      setError('Vui lòng điền đầy đủ thông tin giao hàng.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const response = await authFetch(
        '/api/orders/create',
        {
          method: 'POST',
          body: JSON.stringify({
            // Backend chỉ yêu cầu address, nhưng bạn có thể mở rộng sau
            address: `${customerName}, ${phone}, ${address}`, 
          }),
        },
        router
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đặt hàng thất bại.');
      }
      
      alert('Đặt hàng thành công!');
      // Chuyển hướng đến trang lịch sử đơn hàng hoặc trang chủ
      router.push('/orders/history'); 

    } catch (err) {
      if ((err as Error).message !== 'Unauthorized') {
          setError((err as Error).message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen text-center py-10">Đang tải...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-10">Thanh Toán</h1>
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Form thông tin */}
        <div className="lg:w-7/12">
          <form onSubmit={handlePlaceOrder} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Thông tin giao hàng</h2>
            {/* Các trường input cho tên, sđt, địa chỉ */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Họ và tên</label>
              <input type="text" id="name" value={customerName} onChange={e => setCustomerName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500" />
            </div>
             <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
              <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500" />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Địa chỉ</label>
              <textarea id="address" value={address} onChange={e => setAddress(e.target.value)} required rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500"></textarea>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            
            <button type="submit" disabled={isLoading} className="w-full bg-lime-600 text-white py-3 rounded-full font-semibold hover:bg-lime-700 transition-colors disabled:opacity-50">
              {isLoading ? 'Đang xử lý...' : 'Hoàn tất Đặt Hàng'}
            </button>
          </form>
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className="lg:w-5/12">
           <div className="bg-gray-50 p-6 rounded-lg shadow-lg sticky top-24">
            <h2 className="text-2xl font-bold mb-4">Đơn hàng của bạn</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {cartItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Image src={item.product.imageUrl || ''} alt={item.product.name} width={64} height={64} className="rounded-md object-cover"/>
                            <div>
                                <p className="font-semibold">{item.product.name}</p>
                                <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                            </div>
                        </div>
                        <p className="font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                ))}
            </div>
            <div className="mt-6 pt-6 border-t space-y-2">
                 <div className="flex justify-between font-semibold">
                    <span>Tạm tính</span>
                    <span>{formatPrice(cartTotal)}</span>
                 </div>
                 <div className="flex justify-between text-2xl font-bold text-lime-600">
                    <span>Tổng cộng</span>
                    <span>{formatPrice(cartTotal)}</span>
                 </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}