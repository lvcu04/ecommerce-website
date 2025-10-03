// Ví dụ một component trang quản trị để tạo sản phẩm
"use client";

import { useState } from 'react';

export default function CreateProductPage() {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  // 1. Xử lý khi người dùng chọn file
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // 2. Hàm xử lý upload ảnh lên backend -> Cloudinary
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Vui lòng chọn một file ảnh!');
      return;
    }

    setIsUploading(true);
    setMessage('Đang tải ảnh lên...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Giả sử bạn lưu token trong localStorage
      const token = localStorage.getItem('accessToken'); 

      const response = await fetch('http://localhost:3000/upload', { // URL endpoint upload của bạn
        method: 'POST',
        headers: {
          // Gửi token để xác thực quyền Admin
          'Authorization': `Bearer ${token}`, 
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Tải ảnh lên thất bại');
      }

      const data = await response.json();
      setImageUrl(data.url); // Lưu lại URL ảnh từ Cloudinary
      setMessage('Tải ảnh thành công! URL: ' + data.url);
    } catch (error) {
      console.error(error);
      setMessage('Có lỗi xảy ra khi tải ảnh.');
    } finally {
      setIsUploading(false);
    }
  };

  // 3. Hàm xử lý tạo sản phẩm (sau khi đã có URL ảnh)
  const handleCreateProduct = async () => {
    if (!imageUrl) {
      alert('Vui lòng tải ảnh lên trước khi tạo sản phẩm!');
      return;
    }
    
    setMessage('Đang tạo sản phẩm...');
    const token = localStorage.getItem('accessToken');
    
    try {
        const response = await fetch('http://localhost:3001/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: productName,
                price: Number(productPrice),
                imageUrl: imageUrl, // Sử dụng URL từ Cloudinary
                //... các trường dữ liệu khác
            }),
        });

        if (!response.ok) throw new Error('Tạo sản phẩm thất bại');

        const newProduct = await response.json();
        setMessage(`Tạo sản phẩm "${newProduct.name}" thành công!`);
        // Reset form
        setProductName('');
        setProductPrice(0);
        setImageUrl(null);
        setSelectedFile(null);

    } catch (error) {
        console.error(error);
        setMessage('Có lỗi xảy ra khi tạo sản phẩm.');
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px' }}>
      <h1>Tạo sản phẩm mới</h1>
      
      <input 
        type="text" 
        placeholder="Tên sản phẩm" 
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
      />
      <input 
        type="number" 
        placeholder="Giá sản phẩm" 
        value={productPrice}
        onChange={(e) => setProductPrice(Number(e.target.value))}
      />

      <div>
        <label>Ảnh sản phẩm:</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={isUploading || !selectedFile}>
          {isUploading ? 'Đang tải...' : '1. Tải ảnh lên'}
        </button>
      </div>

      {imageUrl && <img src={imageUrl} alt="Preview" width="100" />}
      
      <button onClick={handleCreateProduct} disabled={!imageUrl}>
        2. Tạo sản phẩm
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}