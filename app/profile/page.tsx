'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User ,Product ,OrderItem , Order } from '@/app/(types)';
import { authFetch } from '@/app/utils/authFetch';
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'orders'
  const router = useRouter();

  // Fetch dữ liệu người dùng và đơn hàng
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch thông tin user
        const userRes = await authFetch('/api/users/me', {}, router);
        if (!userRes.ok) throw new Error('Không thể tải thông tin người dùng.');
        const userData = await userRes.json();
        setUser(userData);
        setName(userData.name || '');

        // Fetch lịch sử đơn hàng
        const ordersRes = await authFetch('/api/orders', {}, router);
        if (!ordersRes.ok) throw new Error('Không thể tải lịch sử đơn hàng.');
        const ordersData = await ordersRes.json();
        setOrders(ordersData);

      } catch (err) {
        if ((err as Error).message !== 'Unauthorized') {
          setError((err as Error).message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  // Xử lý cập nhật thông tin
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const res = await authFetch('/api/users/me', {
            method: 'PUT',
            body: JSON.stringify({ name }),
        }, router);
        if (!res.ok) throw new Error('Cập nhật thất bại.');
        alert('Cập nhật thông tin thành công!');
        const updatedUser = await res.json();
        setUser(updatedUser);
    } catch (err) {
        if ((err as Error).message !== 'Unauthorized') setError((err as Error).message);
    } finally {
        setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen text-center py-10">Đang tải...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-10">Tài Khoản Của Tôi</h1>
      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-bold text-lg mb-4">{user?.name}</h2>
            <nav className="space-y-2">
              <button onClick={() => setActiveTab('profile')} className={`w-full text-left px-4 py-2 rounded ${activeTab === 'profile' ? 'bg-lime-100 text-lime-700' : 'hover:bg-gray-100'}`}>
                Thông tin cá nhân
              </button>
              <button onClick={() => setActiveTab('orders')} className={`w-full text-left px-4 py-2 rounded ${activeTab === 'orders' ? 'bg-lime-100 text-lime-700' : 'hover:bg-gray-100'}`}>
                Lịch sử đơn hàng
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="md:w-3/4">
          {activeTab === 'profile' && (
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6">Thông tin cá nhân</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" id="email" value={user?.email || ''} disabled className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm" />
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Họ và tên</label>
                  <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500" />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button type="submit" disabled={isLoading} className="bg-lime-600 text-white px-6 py-2 rounded-md hover:bg-lime-700 disabled:opacity-50">
                  {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6">Lịch sử đơn hàng</h2>
              <div className="space-y-6">
                {orders.length > 0 ? (
                  orders.map(order => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4 pb-2 border-b">
                        <div>
                          <p className="font-bold">Mã đơn hàng: #{order.id}</p>
                          <p className="text-sm text-gray-500">Ngày đặt: {formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="font-bold text-lg text-lime-600">{formatPrice(order.totalPrice)}</p>
                          <p className="text-sm text-right capitalize">{order.status}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {order.orderItems.map(item => (
                            <div key={item.id} className="flex items-center gap-4">
                               <p className="font-semibold text-sm">{item.product.name} (x{item.quantity})</p>
                            </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Bạn chưa có đơn hàng nào.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}