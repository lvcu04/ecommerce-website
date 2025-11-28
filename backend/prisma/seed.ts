import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Khởi tạo PrismaClient
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // 👇 Các dòng xóa dữ liệu cũ ĐÃ BỊ KHÓA (để bảo toàn dữ liệu)
  // await prisma.review.deleteMany();
  // await prisma.orderItem.deleteMany();
  // ...
  console.log('Skipped cleaning old data.');

  // --- 1. Tạo Categories (Dùng upsert không khả thi nếu name không unique, nên ta kiểm tra trước) ---
  // Cách đơn giản: Chỉ tạo nếu bảng Category đang trống
  const countCategories = await prisma.category.count();
  let category1, category2, category3, category4;

  if (countCategories === 0) {
      category1 = await prisma.category.create({ data: { name: 'Nam' } });
      category2 = await prisma.category.create({ data: { name: 'Nữ' } });
      category3 = await prisma.category.create({ data: { name: 'Trẻ em' } });
      category4 = await prisma.category.create({ data: { name: 'Phụ kiện' } });
      console.log('Created categories');
  } else {
      // Nếu đã có, lấy lại ID để dùng cho product
      const cats = await prisma.category.findMany();
      category1 = cats.find(c => c.name === 'Nam') || cats[0];
      console.log('Categories already exist. Skipped creation.');
  }

  // --- 2. Tạo Users (Dùng UPSERT để tránh lỗi trùng email) ---
  const hashedPasswordAdmin = await bcrypt.hash('admin@123', 10);
  const hashedPasswordUser = await bcrypt.hash('user@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {}, // Nếu tồn tại thì không làm gì cả
    create: {
      email: 'admin@gmail.com',
      name: 'Admin User',
      password: hashedPasswordAdmin,
      role: 'admin',
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'user@gmail.com' },
    update: {}, 
    create: {
      email: 'user@gmail.com',
      name: 'Normal User',
      password: hashedPasswordUser,
      role: 'user',
    },
  });

  console.log('Checked/Created users');

  // --- 3. Tạo Products ---
  // Chỉ tạo sản phẩm nếu chưa có sản phẩm nào (tránh trùng lặp vô hạn)
  const countProducts = await prisma.product.count();
  if (countProducts === 0 && category1) {
      await prisma.product.createMany({
        data: [
          {
            name: 'Giày Sneaker Nam Nike Killshot 2 Leather - Trắng',
            description: 'Chất liệu thoáng mát, co giãn tốt.',
            price: 3003400,
            stock: 100,
            imageUrl: 'https://res.cloudinary.com/dlwginyxy/image/upload/v1759336398/pdbsg0nqx4spwkjtbfwn.png',
            categoryId: category1.id,
          },
          {
            name: 'Giày Sneaker Nam Nike Terra Manta - Xanh Dương',
            description: 'Chất liệu thoáng mát, co giãn tốt.',
            price: 2749000,
            stock: 50,
            imageUrl: 'https://res.cloudinary.com/dlwginyxy/image/upload/v1759566220/zu85zxog8dkzcmxc3qls.webp',
            categoryId: category1.id,
          },
          {
            name: 'Giày Sneaker Nam Nike Big Low - Trắng',
            description: 'Chất liệu thoáng mát, co giãn tốt.',
            price: 3100000,
            stock: 50,
            imageUrl: 'https://res.cloudinary.com/dlwginyxy/image/upload/v1763365222/ictffeuvhhnp6o8ia5kt.webp',
            categoryId: category1.id,
          },
        ],
      });
      console.log('Created products');
  } else {
      console.log('Products already exist. Skipped creation.');
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });