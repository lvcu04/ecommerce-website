// Đã chỉnh sửa: Loại bỏ Stripe, chỉ dùng COD
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { authFetch } from '../utils/authFetch';
import { Product } from '../(types)';

interface CheckoutItem {
  id: number;
  quantity: number;
  product: Product;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// --- Nội dung trang Checkout ---
function CheckoutPageContent() {
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // State cho nút đặt hàng

  // State cho form thông tin giao hàng
  const [address, setAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  const productId = searchParams.get('productId');
  const quantity = searchParams.get('quantity');

  // useEffect này chỉ dùng để tải thông tin sản phẩm (từ giỏ hàng hoặc từ "Mua ngay")
  useEffect(() => {
    const isBuyNow = !!productId;
    setIsLoading(true);
    setError(null);

    const fetchItems = async () => {
      let fetchedItems: CheckoutItem[] = [];
      try {
        // 1. Fetch items (giỏ hàng hoặc sản phẩm mua ngay)
        if (isBuyNow && productId) {
          const res = await fetch(`/api/products/${productId}`);
          if (!res.ok) throw new Error('Không thể tải sản phẩm.');
          const productData = await res.json();
          if (productData && typeof productData === 'object' && 'id' in productData) {
            fetchedItems = [{ product: productData, quantity: Number(quantity || 1), id: productData.id }];
          } else {
            throw new Error('Dữ liệu sản phẩm không hợp lệ.');
          }
        } else {
          // Lấy từ giỏ hàng
          const res = await authFetch('/api/cart', {}, router);
          if (!res) return; // authFetch đã xử lý chuyển hướng 401
          if (!res.ok && res.status !== 401) throw new Error('Không thể tải giỏ hàng.');
          if (res.status === 401) return;

          const data = await res.json();
          if (!Array.isArray(data)) {
            throw new Error('Dữ liệu giỏ hàng không hợp lệ.');
          }
          if (data.length === 0) {
            alert('Giỏ hàng trống, bạn sẽ được chuyển về trang chủ.');
            router.push('/');
            return;
          }
          fetchedItems = data;
        }
        setItems(fetchedItems);
      } catch (err: unknown) {
        if ((err as Error).message !== 'Unauthorized') setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [router, productId, quantity]);

  // Tính tổng tiền
  const cartTotal = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity * item.product.price, 0);
  }, [items]);

  // --- Hàm Submit cho COD ---
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!address || !customerName || !phone) {
      setError('Vui lòng điền đầy đủ thông tin giao hàng.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    // Gộp thông tin giao hàng thành một chuỗi
    const fullAddress = `${customerName}, ${phone}, ${address}`;

    try {
      const isBuyNow = !!productId;
      let response;

      if (isBuyNow) {
        // Gọi API "Mua ngay" (create-single)
        response = await authFetch('/api/orders/create-single', {
          method: 'POST',
          body: JSON.stringify({
            productId: Number(productId),
            quantity: Number(quantity || 1),
            address: fullAddress, // Gửi địa chỉ đã gộp
          }),
        }, router);
      } else {
        // Gọi API "Tạo đơn từ giỏ hàng" (create-from-cart)
        response = await authFetch('/api/orders/create-from-cart', {
          method: 'POST',
          body: JSON.stringify({ address: fullAddress }), // Gửi địa chỉ đã gộp
        }, router);
      }

      if (!response) return; // authFetch đã xử lý 401

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đặt hàng thất bại.');
      }

      // Thành công!
      alert('Đặt hàng thành công! (Thanh toán khi nhận hàng)');
      router.push('/orders/history'); // Chuyển đến trang lịch sử đơn hàng

    } catch (err: unknown) {
      if ((err as Error).message !== 'Unauthorized') {
        setError((err as Error).message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Render UI ---

  if (isLoading) {
    return <div className="min-h-screen text-center py-10">Đang tải thông tin đơn hàng...</div>;
  }

  if (error) {
    return <div className="min-h-screen text-center py-10 text-red-500">Lỗi: {error}</div>;
  }

  if (items.length === 0) {
    return <div className="min-h-screen text-center py-10">Không có sản phẩm để thanh toán.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-10">Thanh Toán</h1>
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Cột trái: Form thông tin */}
        <div className="lg:w-7/12">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Thông tin giao hàng</h2>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Họ và tên</label>
              <input type="text" id="name" value={customerName} onChange={e => setCustomerName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
              <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500" />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Địa chỉ chi tiết</label>
              <textarea id="address" value={address} onChange={e => setAddress(e.target.value)} required rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500" placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."></textarea>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold">Phương thức thanh toán</h3>
              <div className="mt-2 p-3 border rounded-md bg-gray-50">
                <p className="font-medium">Thanh toán khi nhận hàng (COD)</p>
                <p className="text-sm text-gray-600">Bạn sẽ thanh toán bằng tiền mặt cho nhân viên giao hàng.</p>
              </div>
            </div>

            {error && <div className="text-sm text-red-500">{error}</div>}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-lime-600 text-white py-3 rounded-full font-semibold hover:bg-lime-700 disabled:opacity-50"
            >
              {isProcessing ? 'Đang xử lý...' : `Đặt hàng (COD) - ${formatPrice(cartTotal)}`}
            </button>
          </form>
        </div>

        {/* Cột phải: Tóm tắt đơn hàng */}
        <div className="lg:w-5/12">
          <div className="bg-gray-50 p-6 rounded-lg shadow-lg sticky top-24">
            <h2 className="text-2xl font-bold mb-4">Đơn hàng của bạn</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {item.product.imageUrl && (
                      <Image src={item.product.imageUrl} alt={item.product.name} width={64} height={64} className="rounded-md object-cover" />
                    )}
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

// --- Component export default (giữ nguyên) ---
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen text-center py-10">Đang tải trang thanh toán...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}