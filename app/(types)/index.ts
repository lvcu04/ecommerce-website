// Định nghĩa cấu trúc dữ liệu cho một sản phẩm
export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  categoryId?: number | null;
  createdAt: string;
}