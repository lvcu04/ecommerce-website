import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Khởi tạo PrismaClient
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // --- Tạo Categories ---
  const category1 = await prisma.category.create({ data: { name: 'Nam' } });
  const category2 = await prisma.category.create({ data: { name: 'Nữ' } });
  const category3 = await prisma.category.create({ data: { name: 'Trẻ em' } });
  const category4 = await prisma.category.create({ data: { name: 'Phụ kiện' } });

  console.log('Created categories');

  // --- Tạo Users ---
  const hashedPasswordAdmin = await bcrypt.hash('admin@123', 10);
  const hashedPasswordUser = await bcrypt.hash('user@123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      name: 'Admin User',
      password: hashedPasswordAdmin,
      role: 'admin',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'user@gmail.com',
      name: 'Normal User',
      password: hashedPasswordUser,
      role: 'user',
    },
  });

  console.log('Created users');

  // --- Tạo Products ---
  await prisma.product.createMany({
    data: [
      // Sản phẩm Nam
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
     
    ],
  });

  console.log('Created products');
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Đóng kết nối Prisma
    await prisma.$disconnect();
  });