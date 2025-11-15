// app/components/admin/AdminProductForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/app/(types)'; 
// Bỏ import authFetch vì chúng ta cần gọi fetch thủ công cho FormData
// import { authFetch } from '@/app/utils/authFetch'; 

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
  const [categories, setCategories] = useState<Category[]>([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // 🌟 --- THÊM STATE CHO VIỆC UPLOAD --- 🌟
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // 🌟 ------------------------------------ 🌟


  // Load categories khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Tạm lấy categories từ API products.
        // LƯU Ý: Tốt nhất là tạo một API /api/categories riêng
        const res = await fetch('/api/products?pageSize=1000'); 
        if (!res.ok) throw new Error('Không thể tải danh mục');
        const data = await res.json();
        
        const uniqueCategories = data.products.reduce((acc: Category[], product: Product & { category: Category }) => {
            if (product.category && !acc.some(cat => cat.id === product.category.id)) {
                acc.push(product.category);
            }
            return acc;
        }, []);
        
        setCategories(uniqueCategories);
        
        if (!isEditing && uniqueCategories.length > 0) {
            setCategoryId(String(uniqueCategories[0].id));
        }
      } catch (err) {
        console.error("Lỗi tải danh mục:", err);
      }
    };
    fetchCategories();
  }, [isEditing]);

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

  // 🌟 --- HÀM XỬ LÝ UPLOAD ẢNH --- 🌟
  const handleFileUpload = async () => {
    if (!file) {
        setError('Vui lòng chọn một tệp để tải lên.');
        return;
    }

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file); // 'file' phải khớp với FileInterceptor('file') ở backend

    // Lấy token thủ công
    const token = localStorage.getItem('accessToken');
    if (!token) {
        setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
        setIsUploading(false);
        router.push('/login');
        return;
    }

    try {
        // Gọi API /api/upload
        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                // KHÔNG set 'Content-Type', trình duyệt sẽ tự set
            },
            body: formData,
        });

        // Xử lý lỗi 401 (hết hạn token)
        if (res.status === 401) {
            localStorage.removeItem('accessToken');
            router.push('/login');
            throw new Error('Unauthorized');
        }

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Tải ảnh lên thất bại.');
        }

        const data = await res.json();
        
        // 🌟 Tự động điền URL vào state
        setImageUrl(data.url); 
        setFile(null); // Xóa tệp đã chọn
        alert('Tải ảnh lên thành công!');

    } catch (err: unknown) {
        if ((err as Error).message !== 'Unauthorized') {
            setError((err as Error).message);
        }
    } finally {
        setIsUploading(false);
    }
  };
  // 🌟 ------------------------------------ 🌟


  // Hàm submit chính (tạo/cập nhật sản phẩm)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Kiểm tra xem ảnh đã được upload chưa
    if (!imageUrl) {
        setError('Vui lòng tải lên một hình ảnh và đợi URL được điền.');
        setIsLoading(false);
        return;
    }

    const productData = {
      name,
      description,
      price: parseFloat(price), 
      stock: parseInt(stock, 10), 
      imageUrl, // Lấy URL từ state (đã được hàm upload điền vào)
      categoryId: parseInt(categoryId, 10), 
    };

    if (isNaN(productData.price) || isNaN(productData.stock) || isNaN(productData.categoryId)) {
        setError('Giá, Tồn kho và Danh mục phải là số hợp lệ.');
        setIsLoading(false);
        return;
    }

    try {
      const url = isEditing ? `/api/admin/products/${initialData?.id}` : '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      // Cần gọi fetch thủ công vì authFetch đã bị xóa
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        throw new Error('Unauthorized');
      }

      const response = await fetch(url, {
        method: method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json', // Lần này dùng JSON
        },
        body: JSON.stringify(productData),
      });

      if (response.status === 401) {
         localStorage.removeItem('accessToken');
         router.push('/login');
         throw new Error('Unauthorized');
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (isEditing ? 'Cập nhật' : 'Thêm mới') + ' sản phẩm thất bại.');
      }

      alert(`Sản phẩm đã được ${isEditing ? 'cập nhật' : 'thêm mới'} thành công!`);
      router.push('/admin/products'); 
      router.refresh(); 

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

      {/* Tên sản phẩm */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên Sản phẩm</label>
        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500" />
      </div>

      {/* Mô tả */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả</label>
        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500"></textarea>
      </div>

      {/* Giá và Tồn kho */}
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

      {/* Danh mục */}
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

      {/* 🌟 --- KHỐI UPLOAD ẢNH MỚI --- 🌟 */}
      <div>
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
            Tải ảnh lên (Tự động điền URL bên dưới)
        </label>
        <div className="mt-1 flex items-center gap-4">
            <input 
                id="file-upload"
                type="file" 
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                accept="image/*" // Chỉ chấp nhận tệp ảnh
                className="flex-1 block w-full text-sm text-gray-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-md file:border-0
                           file:text-sm file:font-semibold
                           file:bg-lime-50 file:text-lime-700
                           hover:file:bg-lime-100"
            />
            <button 
                type="button" // Quan trọng: đổi type="button" để không submit form
                onClick={handleFileUpload}
                disabled={!file || isUploading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 disabled:opacity-50"
            >
                {isUploading ? 'Đang tải...' : 'Tải lên'}
            </button>
        </div>
      </div>
      
      {/* Ô URL Hình ảnh (bị vô hiệu hóa) */}
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">URL Hình ảnh</label>
        <input 
            type="url" 
            id="imageUrl" 
            value={imageUrl} 
            onChange={e => setImageUrl(e.target.value)} 
            placeholder="URL sẽ tự động điền sau khi tải ảnh lên" 
            // 🌟 Vô hiệu hóa ô này và đổi màu nền
            disabled 
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500 bg-gray-100" 
        />
        {/* Xem trước ảnh */}
        {imageUrl && (
            <img src={imageUrl} alt="Xem trước" className="mt-4 h-32 w-32 object-cover rounded-md border p-1" />
        )}
      </div>
      {/* 🌟 ------------------------------------ 🌟 */}


      {/* Nút Submit */}
      <div className="flex justify-end space-x-3">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
          Hủy bỏ
        </button>
        <button type="submit" disabled={isLoading || isUploading} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 disabled:opacity-50">
          {isLoading ? 'Đang lưu...' : (isEditing ? 'Lưu Thay Đổi' : 'Thêm Sản Phẩm')}
        </button>
      </div>
    </form>
  );
}