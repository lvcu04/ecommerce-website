// app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/app/utils/authFetch';
import Link from 'next/link';

// Định nghĩa kiểu dữ liệu cho stats
interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await authFetch('/api/admin/dashboard/stats', {}, router);
        if (!res) return; // authFetch handled redirect
        
        if (!res.ok) {
          throw new Error('Không thể tải dữ liệu thống kê.');
        }
        const data = await res.json();
        setStats(data);
      } catch (err: unknown) {
        if ((err as Error).message !== 'Unauthorized') {
             setError((err as Error).message);
         }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (isLoading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-8 text-red-500">Lỗi: {error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Widget Tổng Doanh Thu */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 font-medium">Tổng Doanh Thu</h3>
                <span className="p-2 bg-green-100 text-green-600 rounded-full">💰</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatPrice(stats?.totalRevenue || 0)}</p>
            <p className="text-xs text-gray-400 mt-1">Đơn hàng đã hoàn thành</p>
          </div>

          {/* Widget Đơn Hàng Mới */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 font-medium">Đơn Hàng Mới</h3>
                <span className="p-2 bg-yellow-100 text-yellow-600 rounded-full">🆕</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.pendingOrders}</p>
            <Link href="/admin/orders?status=pending" className="text-xs text-blue-500 hover:underline mt-1 block">
                Xem đơn hàng cần xử lý &rarr;
            </Link>
          </div>

          {/* Widget Tổng Sản Phẩm */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 font-medium">Tổng Sản Phẩm</h3>
                <span className="p-2 bg-blue-100 text-blue-600 rounded-full">fw</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts}</p>
            <Link href="/admin/products" className="text-xs text-blue-500 hover:underline mt-1 block">
                Quản lý sản phẩm &rarr;
            </Link>
          </div>

           {/* Widget Tổng Người Dùng */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 font-medium">Người Dùng</h3>
                <span className="p-2 bg-purple-100 text-purple-600 rounded-full">👥</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers}</p>
            <p className="text-xs text-gray-400 mt-1">Tổng tài khoản đã đăng ký</p>
          </div>
       </div>

       {/* Khu vực mở rộng sau này: Biểu đồ hoặc Bảng đơn hàng gần đây */}
       <div className="mt-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h2 className="text-xl font-bold mb-4">Thống kê nhanh</h2>
           <p className="text-gray-500">
               Hệ thống đang ghi nhận tổng cộng <span className="font-semibold text-black">{stats?.totalOrders}</span> đơn hàng trong lịch sử.
           </p>
       </div>
    </div>
  );
}