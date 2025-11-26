"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import Search from '../ui/Search';
import { useCartStore } from '@/app/store/useCartStore';
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
  const { totalItems, fetchCartCount } = useCartStore();
  // Kiểm tra trạng thái đăng nhập khi component được tải
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchCartCount(router);
    }
  }, [isLoggedIn, router, fetchCartCount]);

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
          {isLoggedIn && (
            <Link href="/orders/history" className="text-white hover:opacity-80" title="Đơn hàng của tôi">
              <svg width="24" height="24" viewBox="0 0 340 340" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="path-1-outside-1_1464_35" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24" fill="black">
                <rect fill="white" width="24" height="24"></rect>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M69.7251 1.00327C67.7465 1.0568 65.867 1.83595 64.4822 3.17606L3.81409 60.6879L3.35555 61.1219C3.22988 61.2196 3.10751 61.3218 2.98867 61.4269C2.92621 61.4934 2.86516 61.5607 2.80534 61.6293C2.78474 61.6581 2.76439 61.6868 2.74423 61.7159C2.04651 62.5183 1.53933 63.4534 1.25711 64.458C0.974891 65.4626 0.924331 66.5138 1.10877 67.5386V297.962C1.10877 299.882 1.91386 301.724 3.34715 303.082C4.78044 304.44 6.72452 305.203 8.7515 305.203H204.587C193.666 302.199 183.628 297.228 174.93 290.72H16.3788V73.4762H16.3942H245.676V144.69C250.957 145.661 256.067 147.083 260.961 148.913V69.2323L306.818 25.7835V188.508C312.815 199.717 316.194 212.395 316.194 225.822C316.194 231.943 315.491 237.909 314.159 243.651H315.785L322.103 215.138V8.30307C322.095 6.38754 321.286 4.55348 319.854 3.2017C318.421 1.84992 316.482 1.09077 314.461 1.09078V1.06161H70.9632C70.5578 1.01135 70.1337 0.991564 69.7251 1.00327ZM73.0572 15.5445H296.011L250.155 58.9933H27.2008L73.0572 15.5445ZM31.6797 203.823V218.305H123.392V203.823H31.6797ZM31.6797 232.788V247.271H92.8215V232.788H31.6797Z"></path>
                </mask>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M69.7251 1.00327C67.7465 1.0568 65.867 1.83595 64.4822 3.17606L3.81409 60.6879L3.35555 61.1219C3.22988 61.2196 3.10751 61.3218 2.98867 61.4269C2.92621 61.4934 2.86516 61.5607 2.80534 61.6293C2.78474 61.6581 2.76439 61.6868 2.74423 61.7159C2.04651 62.5183 1.53933 63.4534 1.25711 64.458C0.974891 65.4626 0.924331 66.5138 1.10877 67.5386V297.962C1.10877 299.882 1.91386 301.724 3.34715 303.082C4.78044 304.44 6.72452 305.203 8.7515 305.203H204.587C193.666 302.199 183.628 297.228 174.93 290.72H16.3788V73.4762H16.3942H245.676V144.69C250.957 145.661 256.067 147.083 260.961 148.913V69.2323L306.818 25.7835V188.508C312.815 199.717 316.194 212.395 316.194 225.822C316.194 231.943 315.491 237.909 314.159 243.651H315.785L322.103 215.138V8.30307C322.095 6.38754 321.286 4.55348 319.854 3.2017C318.421 1.84992 316.482 1.09077 314.461 1.09078V1.06161H70.9632C70.5578 1.01135 70.1337 0.991564 69.7251 1.00327ZM73.0572 15.5445H296.011L250.155 58.9933H27.2008L73.0572 15.5445ZM31.6797 203.823V218.305H123.392V203.823H31.6797ZM31.6797 232.788V247.271H92.8215V232.788H31.6797Z" fill="white"></path>
                <path d="M64.4822 3.17606L64.551 3.24864L64.5517 3.24792L64.4822 3.17606ZM69.7251 1.00327L69.7278 1.10323L69.728 1.10323L69.7251 1.00327ZM3.81409 60.6879L3.88284 60.7605L3.88289 60.7605L3.81409 60.6879ZM3.35555 61.1219L3.4172 61.2012L3.42429 61.1945L3.35555 61.1219ZM2.98867 61.4269L2.92215 61.3516L2.91577 61.3584L2.98867 61.4269ZM2.80534 61.6293L2.7296 61.5633L2.72398 61.5712L2.80534 61.6293ZM2.74423 61.7159L2.82015 61.782L2.82644 61.7729L2.74423 61.7159ZM1.25711 64.458L1.35338 64.4851L1.35338 64.4851L1.25711 64.458ZM1.10877 67.5386H1.20877V67.5297L1.20719 67.5209L1.10877 67.5386ZM204.587 305.203V305.303L204.614 305.107L204.587 305.203ZM174.93 290.72L174.989 290.64L174.963 290.62H174.93V290.72ZM16.3788 290.72H16.2788V290.82H16.3788V290.72ZM16.3788 73.4762V73.3762H16.2788V73.4762H16.3788ZM245.676 73.4762H245.776V73.3762H245.676V73.4762ZM245.676 144.69H245.576V144.773L245.658 144.788L245.676 144.69ZM260.961 148.913L260.926 149.007L261.061 149.057V148.913H260.961ZM260.961 69.2323L260.893 69.1597L260.861 69.1893V69.2323H260.961ZM306.818 25.7835H306.918V25.551L306.749 25.7109L306.818 25.7835ZM306.818 188.508H306.718V188.533L306.73 188.555L306.818 188.508ZM314.159 243.651L314.061 243.628L314.033 243.751H314.159V243.651ZM315.785 243.651V243.751H315.865L315.882 243.673L315.785 243.651ZM322.103 215.138L322.201 215.159L322.203 215.149V215.138H322.103ZM322.103 8.30307L322.203 8.30307L322.203 8.30265L322.103 8.30307ZM319.854 3.2017L319.923 3.12897L319.923 3.12897L319.854 3.2017ZM314.461 1.09078H314.361V1.19078L314.461 1.19078L314.461 1.09078ZM314.461 1.06161H314.561V0.961612H314.461V1.06161ZM70.9632 1.06161L70.9508 1.16161H70.9632V1.06161ZM296.011 15.5445L296.08 15.6171L296.262 15.4445H296.011V15.5445ZM73.0572 15.5445V15.4445H73.0173L72.9884 15.4719L73.0572 15.5445ZM250.155 58.9933V59.0933H250.194L250.223 59.0659L250.155 58.9933ZM27.2008 58.9933L27.132 58.9207L26.9499 59.0933H27.2008V58.9933ZM31.6797 218.305H31.5797V218.405H31.6797V218.305ZM31.6797 203.823V203.723H31.5797V203.823H31.6797ZM123.392 218.305V218.405H123.492V218.305H123.392ZM123.392 203.823H123.492V203.723H123.392V203.823ZM31.6797 247.271H31.5797V247.371H31.6797V247.271ZM31.6797 232.788V232.688H31.5797V232.788H31.6797ZM92.8215 247.271V247.371H92.9215V247.271H92.8215ZM92.8215 232.788H92.9215V232.688H92.8215V232.788ZM64.5517 3.24792C65.918 1.92571 67.7735 1.15611 69.7278 1.10323L69.7224 0.903307C67.7196 0.957494 65.8159 1.74618 64.4126 3.1042L64.5517 3.24792ZM3.88289 60.7605L64.551 3.24864L64.4134 3.10349L3.7453 60.6153L3.88289 60.7605ZM3.42429 61.1945L3.88284 60.7605L3.74535 60.6153L3.28681 61.0493L3.42429 61.1945ZM3.0549 61.5018C3.17235 61.398 3.2931 61.2971 3.41691 61.2009L3.29419 61.043C3.16666 61.1421 3.04266 61.2457 2.92243 61.352L3.0549 61.5018ZM2.88073 61.695C2.93967 61.6274 2.99988 61.561 3.06156 61.4953L2.91577 61.3584C2.85254 61.4258 2.79065 61.4939 2.72995 61.5636L2.88073 61.695ZM2.82644 61.7729C2.8462 61.7443 2.86622 61.7161 2.8867 61.6875L2.72398 61.5712C2.70326 61.6002 2.68259 61.6293 2.66202 61.659L2.82644 61.7729ZM1.35338 64.4851C1.63153 63.4949 2.13148 62.573 2.81969 61.7816L2.66877 61.6503C1.96154 62.4636 1.44714 63.4118 1.16084 64.431L1.35338 64.4851ZM1.20719 67.5209C1.02543 66.511 1.07525 65.4751 1.35338 64.4851L1.16084 64.431C0.874534 65.4501 0.823228 66.5166 1.01035 67.5563L1.20719 67.5209ZM1.20877 297.962V67.5386H1.00877V297.962H1.20877ZM3.41593 303.01C2.00195 301.67 1.20877 299.854 1.20877 297.962H1.00877C1.00877 299.91 1.82578 301.779 3.27837 303.155L3.41593 303.01ZM8.7515 305.103C6.74934 305.103 4.8301 304.35 3.41593 303.01L3.27837 303.155C4.73079 304.531 6.6997 305.303 8.7515 305.303V305.103ZM204.587 305.103H8.7515V305.303H204.587V305.103ZM204.614 305.107C193.704 302.106 183.678 297.14 174.989 290.64L174.87 290.8C183.578 297.315 193.627 302.293 204.561 305.299L204.614 305.107ZM16.3788 290.82H174.93V290.62H16.3788V290.82ZM16.2788 73.4762V290.72H16.4788V73.4762H16.2788ZM16.3942 73.3762H16.3788V73.5762H16.3942V73.3762ZM245.676 73.3762H16.3942V73.5762H245.676V73.3762ZM245.776 144.69V73.4762H245.576V144.69H245.776ZM245.658 144.788C250.933 145.758 256.038 147.179 260.926 149.007L260.996 148.819C256.097 146.988 250.981 145.564 245.694 144.591L245.658 144.788ZM260.861 69.2323V148.913H261.061V69.2323H260.861ZM306.749 25.7109L260.893 69.1597L261.03 69.3049L306.887 25.8561L306.749 25.7109ZM306.918 188.508V25.7835H306.718V188.508H306.918ZM306.73 188.555C312.719 199.75 316.094 212.412 316.094 225.822H316.294C316.294 212.378 312.91 199.684 306.906 188.461L306.73 188.555ZM316.094 225.822C316.094 231.935 315.392 237.894 314.061 243.628L314.256 243.674C315.59 237.924 316.294 231.951 316.294 225.822H316.094ZM315.785 243.551H314.159V243.751H315.785V243.551ZM322.006 215.116L315.687 243.629L315.882 243.673L322.201 215.159L322.006 215.116ZM322.003 8.30307V215.138H322.203V8.30307H322.003ZM319.785 3.27443C321.198 4.60802 321.995 6.41621 322.003 8.3035L322.203 8.30265C322.195 6.35887 321.374 4.49894 319.923 3.12897L319.785 3.27443ZM314.461 1.19078C316.457 1.19077 318.372 1.94067 319.785 3.27443L319.923 3.12897C318.471 1.75917 316.507 0.990767 314.461 0.990783L314.461 1.19078ZM314.361 1.06161V1.09078H314.561V1.06161H314.361ZM70.9632 1.16161H314.461V0.961612H70.9632V1.16161ZM69.728 1.10323C70.1316 1.09167 70.5506 1.11122 70.9509 1.16085L70.9755 0.962372C70.5651 0.911477 70.1359 0.891462 69.7223 0.903311L69.728 1.10323ZM296.011 15.4445H73.0572V15.6445H296.011V15.4445ZM250.223 59.0659L296.08 15.6171L295.942 15.4719L250.086 58.9207L250.223 59.0659ZM27.2008 59.0933H250.155V58.8933H27.2008V59.0933ZM72.9884 15.4719L27.132 58.9207L27.2696 59.0659L73.1259 15.6171L72.9884 15.4719ZM31.7797 218.305V203.823H31.5797V218.305H31.7797ZM123.392 218.205H31.6797V218.405H123.392V218.205ZM123.292 203.823V218.305H123.492V203.823H123.292ZM31.6797 203.923H123.392V203.723H31.6797V203.923ZM31.7797 247.271V232.788H31.5797V247.271H31.7797ZM92.8215 247.171H31.6797V247.371H92.8215V247.171ZM92.7215 232.788V247.271H92.9215V232.788H92.7215ZM31.6797 232.888H92.8215V232.688H31.6797V232.888Z" fill="white" mask="url(#path-1-outside-1_1464_35)"></path>
                <path d="M306.067 229.175C306.067 271.651 271.634 306.085 229.158 306.085C186.682 306.085 152.249 271.651 152.249 229.175C152.249 186.699 186.682 152.266 229.158 152.266C271.634 152.266 306.067 186.699 306.067 229.175ZM229.158 322.176C280.521 322.176 322.159 280.538 322.159 229.175C322.159 177.812 280.521 136.174 229.158 136.174C177.795 136.174 136.157 177.812 136.157 229.175C136.157 280.538 177.795 322.176 229.158 322.176Z" fill="white" stroke="white" stroke-width="0.1"></path>
                <path d="M296.66 288.264L296.625 288.229L296.59 288.263L288.265 296.299L288.229 296.335L288.264 296.371L330.64 339.035L330.675 339.07L330.71 339.036L339.035 331L339.072 330.965L339.036 330.929L296.66 288.264Z" fill="white" stroke="white" stroke-width="0.1" stroke-linecap="square"></path>
                </svg>
            </Link>
          )}
          {isLoggedIn && (
            <Link href="/profile" className="text-white hover:opacity-80" title="Tài khoản của tôi">
              <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>
          )}
          <Link href="/cart" className="text-white hover:opacity-80 relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            {/* Badge hiển thị số lượng */}
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
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

      <div className="flex flex-wrap justify-center md:justify-between items-center gap-2 px-4 md:px-8 lg:px-16 bg-[#f4f2e9] text-[#515151] h-auto text-sm py-2">
        <p>Miễn phí giao hàng đơn từ 699k</p>
        <p>Miễn phí đổi trả đến 30 ngày</p>
        <p>Cam kết 100% chính hãng</p>
        <p>Đăng ký nhận ngay 150k</p>
      </div>

      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="md:hidden bg-[#001A2D] border-t border-[#001A2D]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/products/men" className="block px-3 py-2 rounded-md text-base text-white hover:bg-lime-500">Nam</Link>
            <Link href="/products/women" className="block px-3 py-2 rounded-md text-base text-white hover:bg-lime-500">Nữ</Link>
            <Link href="/products/kids" className="block px-3 py-2 rounded-md text-base text-white hover:bg-lime-500">Trẻ em</Link>
            <Link href="/products/accessories" className="block px-3 py-2 rounded-md text-base text-white hover:bg-lime-500">Phụ kiện</Link>
            
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
