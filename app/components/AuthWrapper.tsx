// lvcu04/ecommerce-website/ecommerce-website-00324e89d06c51b533ee0b8d5c991011da91ce99/app/components/AuthWrapper.tsx
'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

// Định nghĩa kiểu cho token đã giải mã (giống trong AdminLayout)
interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Hàm giải mã token và kiểm tra hạn sử dụng
const decodeToken = (token: string): DecodedToken | null => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    // Kiểm tra xem token đã hết hạn chưa
    if (decoded.exp < currentTime) {
      console.warn("Token đã hết hạn.");
      // Bạn có thể tùy chọn xóa token ở đây nếu muốn, nhưng cẩn thận
      // localStorage.removeItem('accessToken');
      return null; // Trả về null nếu hết hạn
    }
    return decoded; // Trả về thông tin nếu hợp lệ
  } catch (error) {
    console.error("Lỗi giải mã token:", error);
    // Bạn có thể tùy chọn xóa token lỗi ở đây
    // localStorage.removeItem('accessToken');
    return null; // Trả về null nếu lỗi
  }
};

// Component bao bọc xử lý chuyển hướng
export default function AuthWrapper({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); // Lấy đường dẫn hiện tại

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    // Các đường dẫn mà admin VẪN được phép truy cập (ngoài /admin)
    // Ví dụ: trang đăng nhập/đăng ký nếu họ chưa đăng nhập, hoặc không cần loại trừ gì cả
    const allowedNonAdminPaths: string[] = []; // Để trống nếu muốn chặn hết trừ /admin

    if (token) {
      const decoded = decodeToken(token);

      // Kiểm tra nếu người dùng là admin
      if (decoded && decoded.role === 'admin') {
        // Nếu admin đang ở một trang KHÔNG BẮT ĐẦU bằng '/admin'
        // và đường dẫn đó KHÔNG nằm trong danh sách được phép (allowedNonAdminPaths)
        if (!pathname.startsWith('/admin') && !allowedNonAdminPaths.includes(pathname)) {
          console.log(`Admin đang ở trang (${pathname}). Chuyển hướng đến /admin.`);
          // Chuyển hướng admin về trang dashboard admin
          router.replace('/admin'); // Dùng replace để không thêm vào lịch sử trình duyệt
        }
      }
      // Nếu không phải admin (hoặc token không hợp lệ), không làm gì ở đây
      // Việc chặn người dùng thường vào /admin đã được xử lý bởi AdminLayout
    }
    // Nếu không có token, không cần xử lý gì thêm ở đây

  }, [pathname, router]); // Chạy lại effect này mỗi khi đường dẫn thay đổi

  // Hiển thị nội dung con bình thường
  return <>{children}</>;
}