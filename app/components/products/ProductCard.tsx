import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/app/(types)'; // Đường dẫn import đã được chuẩn hóa

/**
 * Định dạng một số thành chuỗi tiền tệ Việt Nam (VND).
 * @param price - Số tiền cần định dạng.
 * @returns Chuỗi đã được định dạng (VD: "3.003.400 ₫").
 */
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

/**
 * Component hiển thị thông tin cơ bản của một sản phẩm trong danh sách.
 * Bao gồm hình ảnh, tên, và giá.
 * @param product - Object sản phẩm chứa thông tin cần hiển thị.
 */
const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Link 
      href={`/product/${product.id}`} 
      className="group relative block overflow-hidden rounded-lg border border-gray-200/80 dark:border-gray-800/80 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={product.imageUrl || 'https://placehold.co/600x400/EEE/31343C?text=SuperSports'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-4 bg-white dark:bg-gray-900/50">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate group-hover:text-lime-600 transition-colors">
          {product.name}
        </h3>
        <p className="mt-2 text-xl font-bold text-lime-600 dark:text-lime-500">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
