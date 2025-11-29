// app/(admin)/admin/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode'; // Import thư viện đã cài đặt

interface DecodedToken {
  sub: string; // User ID
  email: string;
  role: string;
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
}

// Hàm giải mã token sử dụng jwt-decode
const decodeToken = (token: string): DecodedToken | null => {
  try {
    // Kiểm tra xem token có hết hạn chưa (ví dụ)
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000; // Chia 1000 để đổi sang giây
    if (decoded.exp < currentTime) {
      console.warn("Token đã hết hạn.");
      localStorage.removeItem('accessToken'); // Xóa token hết hạn
      return null;
    }
    return decoded;
  } catch (error) {
    console.error("Lỗi giải mã token:", error);
    localStorage.removeItem('accessToken'); // Xóa token lỗi/không hợp lệ
    return null;
  }
};


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const decoded = decodeToken(token);
    // Kiểm tra token hợp lệ VÀ có role là 'admin'
    if (decoded && decoded.role === 'admin') {
      setIsAdmin(true);
    } else {
      // Nếu token không hợp lệ (null) hoặc không phải admin
      if (!decoded) { // Nếu token không hợp lệ (đã bị xóa bởi decodeToken)
           router.push('/login'); // Yêu cầu đăng nhập lại
      } else { // Đã đăng nhập nhưng không phải admin
           alert('Bạn không có quyền truy cập trang quản trị.');
           router.push('/');
      }
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Đang kiểm tra quyền truy cập...</div>;
  }

  if (!isAdmin) {
    // Đã chuyển hướng ở useEffect, return null
    return null;
  }

  // Nếu là admin, hiển thị layout admin
  return (
    <div className="flex min-h-screen">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col shadow-lg"> {/* Thêm shadow */}
        <h2 className="text-xl font-bold mb-6 border-b border-gray-700 pb-3">Admin Panel</h2>
        <nav className="flex flex-col space-y-2 flex-grow"> {/* Thêm flex-grow */}
          <Link href="/admin" className="hover:bg-gray-700 p-2 rounded transition-colors">Dashboard</Link>
          <Link href="/admin/products" className="hover:bg-gray-700 p-2 rounded transition-colors">Quản lý Sản phẩm</Link>
          <Link href="/admin/orders" className="hover:bg-gray-700 p-2 rounded transition-colors">Quản lý Đơn hàng</Link>
          <Link href="/admin/categories" className="hover:bg-gray-700 p-2 rounded transition-colors">Quản lý Danh mục</Link>
          {/* Thêm các link quản lý khác ở đây */}
        </nav>
        <div className="mt-auto pt-4 border-t border-gray-700"> {/* Thêm border top */}
           <Link href="/" className="hover:bg-gray-700 p-2 rounded block text-center border border-gray-600 transition-colors">Về trang chính</Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 md:p-10 bg-gray-100 overflow-y-auto"> {/* Tăng padding */}
        {children}
      </main>
    </div>
  );
}