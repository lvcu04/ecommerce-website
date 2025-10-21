'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { authFetch } from '@/app/utils/authFetch';
import { Product } from '@/app/(types)';

// Định nghĩa kiểu dữ liệu cho Order và OrderItem
interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: Product;
}

interface Order {
  id: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  orderItems: OrderItem[];
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await authFetch('/api/orders', {}, router);

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data: Order[] = await response.json();
        setOrders(data);
      } catch (err) {
        if ((err as Error).message !== 'Unauthorized') {
          setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 text-center min-h-[60vh]">
        <p className="text-gray-500">Đang tải lịch sử đơn hàng...</p>
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

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-4xl font-bold mb-10 text-gray-900 dark:text-white text-center">Lịch Sử Đơn Hàng</h1>

      {orders.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>Bạn chưa có đơn hàng nào.</p>
          <Link href="/" className="mt-4 inline-block bg-lime-600 text-white px-6 py-2 rounded-full hover:bg-lime-700">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center border-b pb-4 mb-4 flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold">Đơn hàng #{order.id}</h2>
                  <p className="text-sm text-gray-500">Đặt ngày: {formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{formatPrice(order.totalPrice)}</p>
                  <p className="text-sm font-medium text-blue-600 capitalize">Trạng thái: {order.status}</p>
                </div>
              </div>

              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <Image
                      src={item.product.imageUrl || 'https://placehold.co/80x80'}
                      alt={item.product.name}
                      width={80}
                      height={80}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{item.product.name}</p>
                      <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}