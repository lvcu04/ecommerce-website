// utils/authFetch.ts
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Hàm xử lý đăng xuất, xóa token và chuyển hướng
 * @param router Thể hiện của useRouter từ Next.js
 */
const handleUnauthorized = (router: AppRouterInstance) => {
  // Xóa token đã hết hạn hoặc không hợp lệ
  localStorage.removeItem('accessToken');
  
  // Thông báo cho người dùng (bạn có thể dùng thư viện toast như react-hot-toast để đẹp hơn)
  alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  
  // Chuyển hướng về trang đăng nhập
  router.push('/login');
};

/**
 * Hàm fetch được "bọc" lại để tự động thêm token và xử lý lỗi 401
 * @param url Đường dẫn API (ví dụ: '/api/cart/add')
 * @param options Các tùy chọn của fetch (method, body,...)
 * @param router Thể hiện của useRouter từ Next.js
 */
export const authFetch = async (url: string, options: RequestInit, router: AppRouterInstance) => {
  const token = localStorage.getItem('accessToken');

  // Tự động thêm header Authorization
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, { ...options, headers });

  // Xử lý lỗi 401 một cách tập trung
  if (response.status === 401) {
    handleUnauthorized(router);
    // Ném lỗi để ngăn code ở nơi gọi tiếp tục chạy
    throw new Error('Unauthorized');
  }

  return response;
};