'use client';

import Banner from '@/app/components/ui/Banner';

export default function HomePage() {
  const brandLogos = [
    "//supersports.com.vn/cdn/shop/files/SP_BR_DAS_29f333f3-037a-4340-b15c-91e290153a20.jpg?v=1715040392",
    "//supersports.com.vn/cdn/shop/files/SP_BR_NIKE_c3a940f1-9d42-47a2-bec3-04a47aa62e04.jpg?v=1715040392",
    "//supersports.com.vn/cdn/shop/files/SP_BR_FILA_c6af7494-e276-45e0-b10f-74f7a940d3ea.jpg?v=1716639784",
    "//supersports.com.vn/cdn/shop/files/SP_BR_TEVA.jpg?v=1740730793",
    "//supersports.com.vn/cdn/shop/files/SP_BR_UA_971a481e-3d35-4376-b5a3-332e2d34165d.jpg?v=1715040392",
    "//supersports.com.vn/cdn/shop/files/SP_BR_SPEEDO_ece13004-e7a2-4c37-bf0e-16302121e99a.jpg?v=1716639784",
    "//supersports.com.vn/cdn/shop/files/SP_BR_HOKA_34d18cdd-46df-43a3-87a6-4a8a46ff6cfd.jpg?v=1716639784",
    "//supersports.com.vn/cdn/shop/files/SP_BR_COLUM_0a5dd1e4-d410-4efb-b381-fda52ccb6e68.jpg?v=1716639784",
    "//supersports.com.vn/cdn/shop/files/SP_BR_SKECHER_6dca3273-3ddf-4210-b165-62562fa59ef6.jpg?v=1716639784",
    "//supersports.com.vn/cdn/shop/files/ON_black.jpg?v=1730194141",
    "//supersports.com.vn/cdn/shop/files/SP_BR_CROCS_b77b8613-50d1-43b5-a7fa-0b46546a9734.jpg?v=1716639784",
    "//supersports.com.vn/cdn/shop/files/30_THUONG_HIEU.jpg?v=1715861063",
  ];

  const favoriteBrands = [
    {
      alt: "Nike",
      href: "https://supersports.com.vn/collections/mid-of-season-sale?thuong_hieu=NIKE#filter-anchor",
      src: "https://cdn.shopify.com/s/files/1/0456/5070/6581/files/HP_MOSS_NIKE_VN.jpg?v=1758104689&width=2048",
    },
    {
      alt: "Adidas",
      href: "https://supersports.com.vn/collections/mid-of-season-sale?thuong_hieu=ADIDAS#filter-anchor",
      src: "https://cdn.shopify.com/s/files/1/0456/5070/6581/files/HP_MOSS_DAS_VN.jpg?v=1758104688&width=2048",
    },
    {
      alt: "Under Armour",
      href: "https://supersports.com.vn/collections/mid-of-season-sale?thuong_hieu=UNDER+ARMOUR#filter-anchor",
      src: "https://cdn.shopify.com/s/files/1/0456/5070/6581/files/HP_MOSS_UA_VN.jpg?v=1758104736&width=2048",
    },
    {
      alt: "Hoka",
      href: "https://supersports.com.vn/collections/mid-of-season-sale?thuong_hieu=HOKA#filter-anchor",
      src: "https://cdn.shopify.com/s/files/1/0456/5070/6581/files/HP_MOSS_HOKA_VN.jpg?v=1758104689&width=2048",
    },
    {
      alt: "Columbia",
      href: "https://supersports.com.vn/collections/mid-of-season-sale?thuong_hieu=COLUMBIA#filter-anchor",
      src: "https://cdn.shopify.com/s/files/1/0456/5070/6581/files/HP_MOSS_COLUM_VN.jpg?v=1758104688&width=2048",
    },
  ];

  return (
    <>
      <Banner />

      <div className="container mx-auto mt-10">
        {/* Thương hiệu nổi bật */}
        <h1 className="text-3xl font-bold mt-40 mb-10 text-center">
          THƯƠNG HIỆU NỔI BẬT
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {brandLogos.map((src, i) => (
            <div key={i} className="flex items-center justify-center">
              <img
                src={src}
                alt={`brand-${i}`}
                className="w-full h-auto object-contain"
                draggable="false"
              />
            </div>
          ))}
        </div>

        {/* Banner giữa */}
        <div className="mt-20 mb-10">
          <img
            src="//supersports.com.vn/cdn/shop/files/MOSS_1909_0510_1545_500_V.jpg?v=1758277386&width=2400"
            alt="mid-sale-banner"
            className="w-full h-auto object-cover rounded-xl"
          />
        </div>

        {/* Thương hiệu được yêu thích */}
        <h1 className="text-2xl font-bold text-center mb-10">
          THƯƠNG HIỆU ĐƯỢC YÊU THÍCH NHẤT
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-20">
          {favoriteBrands.map((brand, i) => (
            <a
              key={i}
              href={brand.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
            >
              <img
                src={brand.src}
                alt={brand.alt}
                className="w-full h-auto object-cover"
              />
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
