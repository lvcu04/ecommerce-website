const Footer = () => {
  return (
    <footer className="border-t border-gray-200 mt-12 bg-white text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-5 gap-8 text-gray-700">
        
        {/* Thông tin công ty */}
        <div className="space-y-2">
          <h3 className="font-bold">CÔNG TY TNHH MTV THƯƠNG MẠI THỜI TRANG TỔNG HỢP (GTF)</h3>
          <p><span className="font-semibold">Văn phòng:</span> Số 163, Phan Đăng Lưu, Phường Cầu Kiệu, Thành phố Hồ Chí Minh, Việt Nam</p>
          <p><span className="font-semibold">Địa chỉ kho:</span> 14 Đường Phan Đăng Lưu, Khu phố 7, Phường Long Bình, TP. Biên Hòa, Tỉnh Đồng Nai</p>
          <p><span className="font-semibold">Tổng đài:</span> 1900 63 64 01</p>
          <p><span className="font-semibold">Mã số Doanh Nghiệp:</span> 0314635071, đăng ký thay đổi ngày 20 tháng 04 năm 2020</p>
        </div>

        {/* Về Supersports */}
        <div className="space-y-2">
          <h3 className="font-bold">VỀ SUPERSORTS</h3>
          <ul className="space-y-1">
            <li>Giới thiệu</li>
            <li>Hệ thống cửa hàng</li>
            <li>Thông tin liên hệ</li>
            <li>Các điều khoản và điều kiện</li>
            <li>Hợp tác cùng chúng tôi</li>
          </ul>
        </div>

        {/* Hỗ trợ khách hàng */}
        <div className="space-y-2">
          <h3 className="font-bold">Hỗ trợ khách hàng</h3>
          <ul className="space-y-1">
            <li>Chính sách giao hàng</li>
            <li>Chính sách đổi trả hàng - Bảo hành</li>
            <li>Chính sách trả góp</li>
            <li>Chính sách bảo mật</li>
            <li>Hỗ trợ và giải đáp thắc mắc</li>
            <li>Hướng dẫn mua hàng</li>
            <li>Hướng dẫn chọn size</li>
            <li>Tra cứu đơn hàng</li>
          </ul>
        </div>

        {/* Group Business */}
        <div className="space-y-2">
          <h3 className="font-bold">Group Business</h3>
          <ul className="space-y-1">
            <li>Nguyễn Kim</li>
            <li>Big C</li>
          </ul>
        </div>

        {/* Phương thức thanh toán */}
        <div className="space-y-3">
          <h3 className="font-bold">PHƯƠNG THỨC THANH TOÁN</h3>
          <div className="flex flex-wrap gap-2">
            <img src="https://cdn.shopify.com/s/files/1/0456/5070/6581/files/ICON_PAYMENT_VN.png?v=1713840527" width="100%" height="30px" alt="supersports-payment-method" loading="lazy"></img>
          </div>
          <div className="flex flex-col gap-2">
            <img src="https://cdn.shopify.com/s/files/1/0670/3484/1376/files/image_41_487e5803-f4d0-489f-ac14-7b301b6cbb92.png?v=1683197427" alt="certificate" width="150px" height="50px" loading="lazy"></img>
            <img className="w-25" src="https://images.dmca.com/Badges/DMCA_logo-grn-btn100w.png?ID=82a9b6db-8bb5-4f59-b809-e909e4e33dda" alt="DMCA.com Protection Status"></img>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-200 py-4 text-center text-gray-500 text-xs">
        &copy; {new Date().getFullYear()} SUPERSORTS. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
