// Layout này sẽ áp dụng cho các trang con bên trong (auth) như login, register
// Giúp căn giữa form và có nền đồng nhất
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      {children}
    </div>
  );
}
