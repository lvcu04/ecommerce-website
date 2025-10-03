"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import Search from '../ui/Search';

const announcementMessages = [
  "Miễn phí vận chuyển cho đơn hàng trên 500k!",
  "Giảm giá 30% cho bộ sưu tập Hè mới nhất",
  "Đăng ký thành viên để nhận ưu đãi độc quyền"
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter(); // Khởi tạo router

  // Kiểm tra trạng thái đăng nhập khi component được tải
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Chạy hiệu ứng cho thanh thông báo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % announcementMessages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('accessToken'); // Xóa token
    setIsLoggedIn(false); // Cập nhật trạng thái
    router.push('/login'); // Chuyển hướng về trang đăng nhập
  };

  return (
    <header className="border-b border-[#001A2D] sticky top-0 bg-[#001A2D] z-20">
      {/* Thanh thông báo */}
      <div className="h-8 text-sm text-[#001A2D] bg-lime-500 flex items-center justify-center overflow-hidden">
        <p key={currentMessageIndex} className="animate-slide-up">
          {announcementMessages[currentMessageIndex]}
        </p>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="font-semibold text-l half-text">
            SuperSports
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-white font-semibold hover:text-lime-500">Trang chủ</Link>
          <Link href="/products/men" className="text-white font-semibold hover:text-lime-500">Nam</Link>
          <Link href="/products/women" className="text-white font-semibold hover:text-lime-500">Nữ</Link>
          <Link href="/products/kids" className="text-white font-semibold hover:text-lime-500">Trẻ em</Link>
          <Link href="/products/accessories" className="text-white font-semibold hover:text-lime-500">Phụ kiện</Link>
        </nav>
        <Search />

        {/* Icons and Auth Buttons */}
        <div className="flex items-center space-x-4">
          <Link href="/cart" className="text-white hover:opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </Link>

          {/* Hiển thị nút Đăng xuất hoặc Đăng nhập */}
          <div className="hidden md:block">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="text-white hover:opacity-80">
                Đăng xuất
              </button>
            ) : (
              <Link href="/login" className="text-white hover:opacity-80">
                Đăng nhập
              </Link>
            )}
          </div>
          
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-white hover:opacity-80"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="md:hidden bg-[#001A2D] border-t border-[#001A2D]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/products?category=men" className="block px-3 py-2 rounded-md text-base text-white hover:bg-lime-500">Nam</Link>
            <Link href="/products?category=women" className="block px-3 py-2 rounded-md text-base text-white hover:bg-lime-500">Nữ</Link>
            <Link href="/products?category=kids" className="block px-3 py-2 rounded-md text-base text-white hover:bg-lime-500">Trẻ em</Link>
            <Link href="/products?category=accessories" className="block px-3 py-2 rounded-md text-base text-white hover:bg-lime-500">Phụ kiện</Link>
            
            {/* Hiển thị nút Đăng xuất hoặc Đăng nhập cho mobile */}
            {isLoggedIn ? (
               <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base text-white hover:bg-lime-500">
                 Đăng xuất
               </button>
            ) : (
               <Link href="/login" className="block px-3 py-2 rounded-md text-base text-white hover:bg-lime-500">
                 Đăng nhập
               </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
