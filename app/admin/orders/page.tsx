// Fix for: lvcu04/ecommerce-website/ecommerce-website-f1ee64a7e55e72b83449b939107f70e01a0e999d/app/admin/orders/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react'; // <-- Added useCallback
import { useRouter } from 'next/navigation';
import { Order } from '@/app/(types)'; // Import Order type (cần định nghĩa nếu chưa có)
import { authFetch } from '@/app/utils/authFetch';
import Link from 'next/link';
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN');
};

// Định nghĩa lại Order nếu cần, thêm thông tin user
interface AdminOrder extends Order {
    user: {
        id: number;
        email: string;
        name?: string | null;
    }
}


export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Hàm fetch đơn hàng - wrapped in useCallback
  const fetchOrders = useCallback(async () => { // <-- Wrapped in useCallback
      setIsLoading(true);
      setError('');
      try {
        // Gọi API admin/orders (cần đảm bảo backend đã implement findAllForAdmin)
        const res = await authFetch('/api/admin/orders?pageSize=50', {}, router);
        if (!res) return; // authFetch handled redirect
        if (!res.ok) {
          throw new Error('Không thể tải danh sách đơn hàng.');
        }
        const data = await res.json();
        setOrders(data.orders || []); // API trả về { orders: [], ... }
      } catch (err: unknown) {
         if ((err as Error).message !== 'Unauthorized') {
             setError((err as Error).message);
         }
      } finally {
        setIsLoading(false);
      }
    }, [router]); // <-- Added router dependency

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]); // <-- Use fetchOrders in dependency array

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
      // Xác nhận trước khi đổi (quan trọng!)
      if (!confirm(`Bạn có chắc muốn đổi trạng thái đơn #${orderId} thành "${newStatus}"?`)) {
          return;
      }

      setError('');
      try {
           const res = await authFetch(`/api/admin/orders/${orderId}/status`, {
               method: 'PATCH',
               body: JSON.stringify({ status: newStatus }),
           }, router);

           if (!res) return; // authFetch handled redirect
           if (!res.ok) {
               const errData = await res.json();
               throw new Error(errData.message || 'Cập nhật trạng thái thất bại.');
           }

           // Cập nhật trạng thái trong state để UI thay đổi ngay
           setOrders(prevOrders => prevOrders.map(order =>
               order.id === orderId ? { ...order, status: newStatus } : order
           ));
           alert('Cập nhật trạng thái thành công!');

      } catch (err: unknown) {
           if ((err as Error).message !== 'Unauthorized') {
               setError(`Lỗi cập nhật trạng thái: ${(err as Error).message}`);
           }
      }
      // Không cần setIsLoading ở đây vì cập nhật là hành động nhanh
  }


  if (isLoading) return <p>Đang tải đơn hàng...</p>;
  if (error) return <p className="text-red-500">Lỗi: {error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý Đơn hàng</h1>

      {/* TODO: Thêm bộ lọc theo trạng thái, tìm kiếm theo mã đơn, user */}

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã ĐH</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.user?.name || order.user?.email || 'N/A'}
                </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{formatPrice(order.totalPrice)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   {/* Hiển thị trạng thái với màu sắc */}
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                       order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                       order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                       order.status === 'completed' ? 'bg-green-100 text-green-800' :
                       order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                       'bg-gray-100 text-gray-800'
                   }`}>
                       {order.status}
                   </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link 
                    href={`/admin/orders/${order.id}`} 
                    className="text-blue-600 hover:text-blue-900 border border-blue-600 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                  >
                    Xem
                  </Link>
                   {/* Tạm thời dùng Select để đổi trạng thái */}
                   <select
                       value={order.status}
                       onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                       className="text-xs border border-gray-300 rounded p-1"
                       disabled={order.status === 'completed' || order.status === 'cancelled'} // Không cho đổi nếu đã hoàn thành/hủy
                   >
                       <option value="pending">Pending</option>
                       <option value="processing">Processing</option>
                       <option value="shipped">Shipped</option>
                       <option value="completed">Completed</option>
                       <option value="cancelled">Cancelled</option>
                   </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">Không có đơn hàng nào.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
       {/* TODO: Thêm phân trang nếu cần */}
    </div>
  );
}