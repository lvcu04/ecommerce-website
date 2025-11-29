'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { authFetch } from '@/app/utils/authFetch';
import Link from 'next/link';

// Định nghĩa lại các interface cho chi tiết đơn hàng admin
interface Product {
  id: number;
  name: string;
  imageUrl: string | null;
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: Product;
}

interface OrderDetail {
  id: number;
  totalPrice: number;
  status: string;
  address: string;
  createdAt: string;
  user: {
    id: number;
    email: string;
    name: string | null;
  };
  orderItems: OrderItem[];
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN');
};

export default function AdminOrderDetailPage() {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const res = await authFetch(`/api/admin/orders/${id}`, {}, router);
        if (!res.ok) {
           if (res.status === 404) throw new Error('Không tìm thấy đơn hàng.');
           throw new Error('Lỗi khi tải đơn hàng.');
        }
        const data = await res.json();
        setOrder(data);
      } catch (err: unknown) {
         if ((err as Error).message !== 'Unauthorized') {
             setError((err as Error).message);
         }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id, router]);

  if (isLoading) return <div className="p-8 text-center">Đang tải chi tiết đơn hàng...</div>;
  if (error) return <div className="p-8 text-red-500">Lỗi: {error}</div>;
  if (!order) return <div className="p-8">Không tìm thấy dữ liệu.</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Chi tiết đơn hàng #{order.id}</h1>
        <Link href="/admin/orders" className="text-blue-600 hover:underline">
          &larr; Quay lại danh sách
        </Link>
      </div>

      {/* Thông tin chung */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Thông tin khách hàng</h2>
          <p><span className="font-medium">Tên:</span> {order.user.name || 'Chưa cập nhật'}</p>
          <p><span className="font-medium">Email:</span> {order.user.email}</p>
          <p><span className="font-medium">Ngày đặt:</span> {formatDate(order.createdAt)}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Thông tin giao hàng</h2>
          <p><span className="font-medium">Địa chỉ & SĐT:</span></p>
          <p className="bg-gray-50 p-3 rounded border border-gray-200 mt-1 text-gray-800 whitespace-pre-wrap">
            {order.address}
          </p>
          <div className="mt-4">
             <span className="font-medium">Trạng thái hiện tại: </span>
             <span className={`px-2 py-1 rounded text-sm font-bold capitalize ${
                 order.status === 'completed' ? 'bg-green-100 text-green-800' :
                 order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
             }`}>
               {order.status}
             </span>
          </div>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Sản phẩm đã đặt</h2>
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {order.orderItems.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 relative">
                      <Image 
                        src={item.product.imageUrl || 'https://placehold.co/40x40'} 
                        alt={item.product.name} 
                        fill 
                        className="rounded object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                      <div className="text-sm text-gray-500">ID: {item.product.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatPrice(item.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                  x{item.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                  {formatPrice(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
             <tr>
               <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-700">Tổng cộng:</td>
               <td className="px-6 py-4 text-right font-bold text-xl text-lime-600">{formatPrice(order.totalPrice)}</td>
             </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}