'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { authFetch } from '@/app/utils/authFetch';
import { Product } from '@/app/(types)';

interface CheckoutItem {
  id: number;
  quantity: number;
  product: Product;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

function CheckoutPageContent() {
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [address, setAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  
  const productId = searchParams.get('productId');
  const quantity = searchParams.get('quantity');
  
  useEffect(() => {
    const isBuyNow = !!productId;
    setIsLoading(true);

    if (isBuyNow) {
      const fetchSingleProduct = async () => {
        try {
          const res = await fetch(`/api/products/${productId}`);
          if (!res.ok) throw new Error('Không thể tải sản phẩm.');
          const productData = await res.json();
          setItems([{ product: productData, quantity: Number(quantity || 1), id: productData.id }]);
        } catch (err: unknown) {
           setError((err as Error).message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSingleProduct();
    } else {
      const fetchCart = async () => {
        try {
          const res = await authFetch('/api/cart', {}, router);
          if (!res.ok) throw new Error('Không thể tải giỏ hàng.');
          const data = await res.json();
          if (data.length === 0) {
            alert('Giỏ hàng trống, bạn sẽ được chuyển về trang chủ.');
            router.push('/');
            return;
          }
          setItems(data);
        } catch (err: unknown) {
          if ((err as Error).message !== 'Unauthorized') setError((err as Error).message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCart();
    }
  }, [router, productId, quantity]);

  const cartTotal = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity * item.product.price, 0);
  }, [items]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !customerName || !phone) {
      setError('Vui lòng điền đầy đủ thông tin giao hàng.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const isBuyNow = !!productId;
      const url = isBuyNow ? '/api/orders/create-single' : '/api/orders/create-from-cart';
      
      // SỬA LỖI Ở ĐÂY: Dùng const và định nghĩa kiểu rõ ràng
      const body: { address: string; productId?: number; quantity?: number } = { 
        address: `${customerName}, ${phone}, ${address}` 
      };

      if (isBuyNow) {
        body.productId = Number(productId);
        body.quantity = Number(quantity);
      }

      const response = await authFetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
      }, router);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đặt hàng thất bại.');
      }
      
      alert('Đặt hàng thành công!');
      router.push('/'); 

    } catch (err: unknown) {
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
        <div className="lg:w-7/12">
          <form onSubmit={handlePlaceOrder} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
             <h2 className="text-2xl font-semibold mb-4">Thông tin giao hàng</h2>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Họ và tên</label>
              <input type="text" id="name" value={customerName} onChange={e => setCustomerName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
              <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Địa chỉ</label>
              <textarea id="address" value={address} onChange={e => setAddress(e.target.value)} required rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={isLoading || items.length === 0} className="w-full bg-lime-600 text-white py-3 rounded-full font-semibold hover:bg-lime-700 disabled:opacity-50">
              {isLoading ? 'Đang xử lý...' : 'Hoàn tất Đặt Hàng'}
            </button>
          </form>
        </div>
        <div className="lg:w-5/12">
           <div className="bg-gray-50 p-6 rounded-lg shadow-lg sticky top-24">
            <h2 className="text-2xl font-bold mb-4">Đơn hàng của bạn</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {items.map(item => (
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen text-center py-10">Đang tải trang thanh toán...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}