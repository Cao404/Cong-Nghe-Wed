import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed data...');

  // Tạo admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shop.vn' },
    update: {
      name: 'Admin',
      password: hashedPassword,
      role: 'admin',
      phone: '0901234567'
    },
    create: {
      email: 'admin@shop.vn',
      name: 'Admin',
      password: hashedPassword,
      role: 'admin',
      phone: '0901234567'
    }
  });
  console.log('✅ Tạo admin user:', admin.email);

  // Tạo user thường
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@shop.vn' },
    update: {
      name: 'Nguyen Van A',
      password: userPassword,
      role: 'user',
      phone: '0912345678'
    },
    create: {
      email: 'user@shop.vn',
      name: 'Nguyen Van A',
      password: userPassword,
      role: 'user',
      phone: '0912345678'
    }
  });
  console.log('✅ Tạo user:', user.email);

  // Tạo categories
  const categories = [
    { name: 'Laptop', description: 'Máy tính xách tay', productCount: 6, parentCategory: 'Điện tử', status: 'active' },
    { name: 'Điện thoại', description: 'Điện thoại thông minh', productCount: 6, parentCategory: 'Điện tử', status: 'active' },
    { name: 'Máy tính bảng', description: 'Tablet các loại', productCount: 5, parentCategory: 'Điện tử', status: 'active' },
    { name: 'Phụ kiện', description: 'Phụ kiện điện tử', productCount: 7, parentCategory: 'Điện tử', status: 'active' }
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
    });
  }
  console.log('✅ Tạo categories');

  // Tạo products
  const products = [
    // Laptop
    { name: 'Laptop Dell XPS 13', price: 25000000, stock: 15, category: 'Laptop', image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=150', sku: 'SKU-0001', sold: 45, description: 'Laptop cao cấp Dell XPS 13' },
    { name: 'MacBook Pro M3', price: 45000000, stock: 5, category: 'Laptop', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=150', sku: 'SKU-0004', sold: 34, description: 'MacBook Pro chip M3 mới nhất' },
    { name: 'Laptop HP Pavilion 15', price: 18000000, stock: 20, category: 'Laptop', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=150', sku: 'SKU-0007', sold: 67, description: 'Laptop HP Pavilion 15' },
    { name: 'Laptop Asus ROG Strix', price: 35000000, stock: 8, category: 'Laptop', image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=150', sku: 'SKU-0008', sold: 28, description: 'Laptop gaming Asus ROG' },
    { name: 'Laptop Lenovo ThinkPad X1', price: 32000000, stock: 12, category: 'Laptop', image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=150', sku: 'SKU-0009', sold: 41, description: 'Lenovo ThinkPad X1' },
    { name: 'Laptop Acer Swift 3', price: 16000000, stock: 18, category: 'Laptop', image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=150', sku: 'SKU-0010', sold: 52, description: 'Acer Swift 3' },
    
    // Điện thoại
    { name: 'iPhone 15 Pro', price: 30000000, stock: 8, category: 'Điện thoại', image: 'https://images.unsplash.com/photo-1592286927505-4a9d1b4b0b8d?w=150', sku: 'SKU-0002', sold: 89, description: 'iPhone 15 Pro chính hãng' },
    { name: 'Samsung Galaxy S24', price: 22000000, stock: 12, category: 'Điện thoại', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=150', sku: 'SKU-0003', sold: 67, description: 'Samsung Galaxy S24' },
    { name: 'iPhone 14 Pro Max', price: 28000000, stock: 10, category: 'Điện thoại', image: 'https://images.unsplash.com/photo-1678652197950-91e3f0a3a0e4?w=150', sku: 'SKU-0011', sold: 95, description: 'iPhone 14 Pro Max' },
    { name: 'Samsung Galaxy Z Fold 5', price: 42000000, stock: 6, category: 'Điện thoại', image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=150', sku: 'SKU-0012', sold: 38, description: 'Galaxy Z Fold 5' },
    { name: 'Xiaomi 13 Pro', price: 18000000, stock: 15, category: 'Điện thoại', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=150', sku: 'SKU-0013', sold: 72, description: 'Xiaomi 13 Pro' },
    { name: 'OPPO Find X6 Pro', price: 24000000, stock: 11, category: 'Điện thoại', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150', sku: 'SKU-0014', sold: 54, description: 'OPPO Find X6 Pro' },
    
    // Máy tính bảng
    { name: 'iPad Pro', price: 28000000, stock: 10, category: 'Máy tính bảng', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=150', sku: 'SKU-0005', sold: 56, description: 'iPad Pro' },
    { name: 'iPad Air M2', price: 18000000, stock: 14, category: 'Máy tính bảng', image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=150', sku: 'SKU-0015', sold: 63, description: 'iPad Air M2' },
    { name: 'Samsung Galaxy Tab S9', price: 22000000, stock: 9, category: 'Máy tính bảng', image: 'https://images.unsplash.com/photo-1585790050230-5dd28404f1e4?w=150', sku: 'SKU-0016', sold: 47, description: 'Galaxy Tab S9' },
    { name: 'iPad Mini 6', price: 15000000, stock: 16, category: 'Máy tính bảng', image: 'https://images.unsplash.com/photo-1544244015-9c72fd9c866d?w=150', sku: 'SKU-0017', sold: 71, description: 'iPad Mini 6' },
    { name: 'Xiaomi Pad 6', price: 9000000, stock: 20, category: 'Máy tính bảng', image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=150', sku: 'SKU-0018', sold: 85, description: 'Xiaomi Pad 6' },
    
    // Phụ kiện
    { name: 'AirPods Pro', price: 6000000, stock: 25, category: 'Phụ kiện', image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=150', sku: 'SKU-0006', sold: 123, description: 'AirPods Pro' },
    { name: 'Apple Watch Series 9', price: 12000000, stock: 18, category: 'Phụ kiện', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=150', sku: 'SKU-0019', sold: 92, description: 'Apple Watch Series 9' },
    { name: 'Samsung Galaxy Buds Pro', price: 4500000, stock: 30, category: 'Phụ kiện', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=150', sku: 'SKU-0020', sold: 108, description: 'Galaxy Buds Pro' },
    { name: 'Magic Keyboard cho iPad', price: 8000000, stock: 12, category: 'Phụ kiện', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=150', sku: 'SKU-0021', sold: 45, description: 'Magic Keyboard' },
    { name: 'Apple Pencil 2', price: 3500000, stock: 22, category: 'Phụ kiện', image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=150', sku: 'SKU-0022', sold: 87, description: 'Apple Pencil 2' },
    { name: 'Sạc dự phòng Anker 20000mAh', price: 1200000, stock: 35, category: 'Phụ kiện', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=150', sku: 'SKU-0023', sold: 156, description: 'Sạc dự phòng Anker' },
    { name: 'Ốp lưng iPhone 15 Pro', price: 500000, stock: 50, category: 'Phụ kiện', image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=150', sku: 'SKU-0024', sold: 203, description: 'Ốp lưng iPhone' }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product
    });
  }
  console.log('✅ Tạo 24 sản phẩm');

  console.log('🎉 Seed data hoàn tất!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi seed data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
