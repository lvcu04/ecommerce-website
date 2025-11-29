'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/app/utils/authFetch';

interface Category {
  id: number;
  name: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories'); // Public API
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const res = await authFetch('/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newName }),
      }, router);

      if (res.ok) {
        setNewName('');
        fetchCategories();
        alert('Thêm danh mục thành công');
      }
    } catch (error) {
      alert('Lỗi thêm danh mục');
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;
    try {
      const res = await authFetch(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editingName }),
      }, router);

      if (res.ok) {
        setEditingId(null);
        fetchCategories();
      }
    } catch (error) {
      alert('Lỗi cập nhật');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      const res = await authFetch(`/api/categories/${id}`, {
        method: 'DELETE',
      }, router);

      if (res.ok) {
        fetchCategories();
      } else {
        alert('Xóa thất bại');
      }
    } catch (error) {
      alert('Lỗi xóa danh mục');
    }
  };

  if (isLoading) return <p className="p-8">Đang tải...</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Quản lý Danh mục</h1>

      {/* Form thêm mới */}
      <form onSubmit={handleCreate} className="flex gap-4 mb-8 p-4 bg-gray-50 rounded">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Tên danh mục mới..."
          className="flex-1 p-2 border rounded focus:border-lime-500 outline-none"
          required
        />
        <button type="submit" className="bg-lime-600 text-white px-6 py-2 rounded hover:bg-lime-700">
          Thêm
        </button>
      </form>

      {/* Danh sách */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between p-4 border rounded hover:shadow-sm transition">
            {editingId === cat.id ? (
              <div className="flex flex-1 gap-2">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 p-1 border rounded"
                />
                <button onClick={() => handleUpdate(cat.id)} className="text-green-600 font-medium px-2">Lưu</button>
                <button onClick={() => setEditingId(null)} className="text-gray-500 px-2">Hủy</button>
              </div>
            ) : (
              <>
                <span className="font-medium text-lg text-gray-800">{cat.name}</span>
                <div className="flex gap-3">
                  <button 
                    onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }} 
                    className="text-blue-600 hover:underline"
                  >
                    Sửa
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)} 
                    className="text-red-600 hover:underline"
                  >
                    Xóa
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {categories.length === 0 && <p className="text-gray-500 text-center">Chưa có danh mục nào.</p>}
      </div>
    </div>
  );
}