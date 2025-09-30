import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Banner Section */}
      {/* <section className="relative h-[60vh] md:h-[80vh] bg-gray-900 text-white flex items-center justify-center">
        <Image
          src="/placeholder-banner.jpg" // Thay bằng ảnh banner của bạn
          alt="New Collection Banner"
          layout="fill"
          objectFit="cover"
          className="opacity-50"
        />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">New Collection</h1>
          <p className="mb-8">Discover the latest trends in fashion.</p>
          <Link href="/products" className="bg-white text-black px-8 py-3 font-semibold">
            Shop Now
          </Link>
        </div>
      </section> */}

      {/* Categories Section */}
      {/* <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['men', 'women', 'kids', 'accessories'].map((category) => (
            <Link key={category} href={`/products?category=${category}`} className="relative group">
              <Image
                src={`/placeholder-${category}.jpg`} // Thay bằng ảnh danh mục
                alt={category}
                width={400}
                height={500}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold capitalize">{category}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section> */}
    </div>
  );
}