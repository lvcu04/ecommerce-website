// app/(admin)/admin/page.tsx
'use client';

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Chào mừng đến với trang quản trị!</p>
      {/* Thêm các widget, thống kê nhanh ở đây */}
       <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">Tổng số Sản phẩm</h3>
            <p className="text-2xl">...</p> {/* TODO: Fetch data */}
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">Đơn hàng Mới</h3>
            <p className="text-2xl">...</p> {/* TODO: Fetch data */}
          </div>
           <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">Tổng số Người dùng</h3>
            <p className="text-2xl">...</p> {/* TODO: Fetch data */}
          </div>
       </div>
    </div>
  );
}