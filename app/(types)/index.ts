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
export interface User {
  id: number;
  name: string;
  email: string;
}
export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: Product;
}
export interface Order {
  id: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  orderItems: OrderItem[];
}