// app/components/admin/AdminProductForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/app/(types)'; // Import Product type
import { authFetch } from '@/app/utils/authFetch'; // Import authFetch

// Giả sử có kiểu Category (cần định nghĩa nếu chưa có)
interface Category {
  id: number;
  name: string;
}

interface AdminProductFormProps {
  initialData?: Product | null; // Dữ liệu sản phẩm ban đầu để chỉnh sửa
  isEditing?: boolean; // Cờ xác định là form sửa hay thêm mới
}

export default function AdminProductForm({ initialData = null, isEditing = false }: AdminProductFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]); // State để lưu danh mục
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Load categories khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // API này cần được tạo ở backend (trong ProductsController hoặc CategoryController)
        // Endpoint này không cần xác thực admin
        const res = await fetch('/api/products?pageSize=1000'); // Tạm lấy products để lấy categories, CẦN API RIÊNG
        if (!res.ok) throw new Error('Không thể tải danh mục');
        const data = await res.json();
        // Trích xuất categories duy nhất từ products (cách tạm)
        const uniqueCategories = data.products.reduce((acc: Category[], product: Product & { category: Category }) => {
            if (product.category && !acc.some(cat => cat.id === product.category.id)) {
                acc.push(product.category);
            }
            return acc;
        }, []);
        setCategories(uniqueCategories);
        // Set category mặc định nếu là form thêm mới và có danh mục
        if (!isEditing && uniqueCategories.length > 0) {
            setCategoryId(String(uniqueCategories[0].id));
        }
      } catch (err) {
        console.error("Lỗi tải danh mục:", err);
        // Có thể set lỗi ở đây
      }
    };
    fetchCategories();
  }, [isEditing]); // Chạy lại nếu isEditing thay đổi (mặc dù không cần thiết lắm)

  // Điền dữ liệu ban đầu nếu là form chỉnh sửa
  useEffect(() => {
    if (isEditing && initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setPrice(String(initialData.price || ''));
      setStock(String(initialData.stock || ''));
      setImageUrl(initialData.imageUrl || '');
      setCategoryId(String(initialData.categoryId || ''));
    }
  }, [isEditing, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const productData = {
      name,
      description,
      price: parseFloat(price), // Chuyển đổi sang số
      stock: parseInt(stock, 10), // Chuyển đổi sang số nguyên
      imageUrl,
      categoryId: parseInt(categoryId, 10), // Chuyển đổi sang số nguyên
    };

    // Kiểm tra dữ liệu cơ bản
    if (isNaN(productData.price) || isNaN(productData.stock) || isNaN(productData.categoryId)) {
        setError('Giá, Tồn kho và Danh mục phải là số hợp lệ.');
        setIsLoading(false);
        return;
    }

    try {
      const url = isEditing ? `/api/admin/products/${initialData?.id}` : '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await authFetch(url, {
        method: method,
        body: JSON.stringify(productData),
      }, router);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (isEditing ? 'Cập nhật' : 'Thêm mới') + ' sản phẩm thất bại.');
      }

      alert(`Sản phẩm đã được ${isEditing ? 'cập nhật' : 'thêm mới'} thành công!`);
      router.push('/admin/products'); // Chuyển về trang danh sách
      router.refresh(); // Yêu cầu Next.js làm mới dữ liệu trang danh sách

    } catch (err: unknown) {
       if ((err as Error).message !== 'Unauthorized') {
         setError((err as Error).message);
       }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">{isEditing ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h2>

      {error && <p className="text-sm text-red-500 bg-red-100 p-3 rounded">{error}</p>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên Sản phẩm</label>
        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500" />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả</label>
        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500"></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Giá (VNĐ)</label>
          <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="1000" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500" />
        </div>
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Số lượng tồn kho</label>
          <input type="number" id="stock" value={stock} onChange={e => setStock(e.target.value)} required min="0" step="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500" />
        </div>
      </div>

       <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Danh mục</label>
          <select
             id="categoryId"
             value={categoryId}
             onChange={e => setCategoryId(e.target.value)}
             required
             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500 py-2 px-3"
          >
             <option value="" disabled>-- Chọn danh mục --</option>
             {categories.map(cat => (
               <option key={cat.id} value={cat.id}>{cat.name}</option>
             ))}
          </select>
        </div>

      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">URL Hình ảnh</label>
        <input type="url" id="imageUrl" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500" />
        {/* TODO: Tích hợp upload ảnh */}
      </div>

      <div className="flex justify-end space-x-3">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
          Hủy bỏ
        </button>
        <button type="submit" disabled={isLoading} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 disabled:opacity-50">
          {isLoading ? 'Đang lưu...' : (isEditing ? 'Lưu Thay Đổi' : 'Thêm Sản Phẩm')}
        </button>
      </div>
    </form>
  );
}