import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const Banner = () => {
  const images = [
    "//supersports.com.vn/cdn/shop/files/1545_500_V_e2db2088-4927-407b-8c0f-94026f6b7d3e.jpg?v=1759390870&width=2400",
    "//supersports.com.vn/cdn/shop/files/1545x500_V.jpg?v=1759392392&width=2400",
    "//supersports.com.vn/cdn/shop/files/Nike_Vomero_18_1545x500_276a9e13-f03a-4eea-88dd-27146e1cd143.jpg?v=1758003366&width=2400",
  ];

  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      autoplay={{ delay: 4000 }}
      loop={true}
      pagination={{ clickable: true }}
      className="w-full h-64 md:h-[300px] lg:h-[430px] hover:scale-105 transition-transform duration-500"
    >
      {images.map((src, i) => (
        <SwiperSlide key={i}>
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default Banner;
