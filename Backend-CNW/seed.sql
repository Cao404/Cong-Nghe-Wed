-- Seed data cho ShopDB
USE ShopDB;
GO

-- Xóa data cũ (nếu có)
DELETE FROM [Order];
DELETE FROM Product;
DELETE FROM Category;
DELETE FROM [User];
GO

-- Tạo users
-- Password mẫu:
--   admin@shop.vn / admin123
--   user@shop.vn / user123
INSERT INTO [User] (email, name, password, role, phone, createdAt, updatedAt) VALUES
('admin@shop.vn', 'Admin', '$2a$10$p9Fkv152YB8JJRAxjM.hMOjfE9Aju/MQV98Uk/QMGeIQp2NBx.iTC', 'admin', '0901234567', GETDATE(), GETDATE()),
('user@shop.vn', 'Nguyen Van A', '$2a$10$XTSG5ctwgR4PJVmcFSXKfO/ONPFig2N0A2KQTV6e54G2gSGi4zx0q', 'user', '0912345678', GETDATE(), GETDATE());
GO

-- Tạo categories
INSERT INTO Category (name, description, productCount, parentCategory, status, createdAt, updatedAt) VALUES
(N'Laptop', N'Máy tính xách tay', 6, N'Điện tử', 'active', GETDATE(), GETDATE()),
(N'Điện thoại', N'Điện thoại thông minh', 6, N'Điện tử', 'active', GETDATE(), GETDATE()),
(N'Máy tính bảng', N'Tablet các loại', 5, N'Điện tử', 'active', GETDATE(), GETDATE()),
(N'Phụ kiện', N'Phụ kiện điện tử', 7, N'Điện tử', 'active', GETDATE(), GETDATE());
GO

-- Tạo products
INSERT INTO Product (name, price, stock, category, image, sku, sold, description, createdAt, updatedAt) VALUES
-- Laptop
(N'Laptop Dell XPS 13', 25000000, 15, N'Laptop', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=150', 'SKU-0001', 45, N'Laptop cao cấp Dell XPS 13', GETDATE(), GETDATE()),
(N'MacBook Pro M3', 45000000, 5, N'Laptop', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=150', 'SKU-0004', 34, N'MacBook Pro chip M3 mới nhất', GETDATE(), GETDATE()),
(N'Laptop HP Pavilion 15', 18000000, 20, N'Laptop', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=150', 'SKU-0007', 67, N'Laptop HP Pavilion 15', GETDATE(), GETDATE()),
(N'Laptop Asus ROG Strix', 35000000, 8, N'Laptop', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=150', 'SKU-0008', 28, N'Laptop gaming Asus ROG', GETDATE(), GETDATE()),
(N'Laptop Lenovo ThinkPad X1', 32000000, 12, N'Laptop', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=150', 'SKU-0009', 41, N'Lenovo ThinkPad X1', GETDATE(), GETDATE()),
(N'Laptop Acer Swift 3', 16000000, 18, N'Laptop', 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=150', 'SKU-0010', 52, N'Acer Swift 3', GETDATE(), GETDATE()),

-- Điện thoại
(N'iPhone 15 Pro', 30000000, 8, N'Điện thoại', 'https://images.unsplash.com/photo-1592286927505-4a9d1b4b0b8d?w=150', 'SKU-0002', 89, N'iPhone 15 Pro chính hãng', GETDATE(), GETDATE()),
(N'Samsung Galaxy S24', 22000000, 12, N'Điện thoại', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=150', 'SKU-0003', 67, N'Samsung Galaxy S24', GETDATE(), GETDATE()),
(N'iPhone 14 Pro Max', 28000000, 10, N'Điện thoại', 'https://images.unsplash.com/photo-1678652197950-91e3f0a3a0e4?w=150', 'SKU-0011', 95, N'iPhone 14 Pro Max', GETDATE(), GETDATE()),
(N'Samsung Galaxy Z Fold 5', 42000000, 6, N'Điện thoại', 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=150', 'SKU-0012', 38, N'Galaxy Z Fold 5', GETDATE(), GETDATE()),
(N'Xiaomi 13 Pro', 18000000, 15, N'Điện thoại', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=150', 'SKU-0013', 72, N'Xiaomi 13 Pro', GETDATE(), GETDATE()),
(N'OPPO Find X6 Pro', 24000000, 11, N'Điện thoại', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150', 'SKU-0014', 54, N'OPPO Find X6 Pro', GETDATE(), GETDATE()),

-- Máy tính bảng
(N'iPad Pro', 28000000, 10, N'Máy tính bảng', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=150', 'SKU-0005', 56, N'iPad Pro', GETDATE(), GETDATE()),
(N'iPad Air M2', 18000000, 14, N'Máy tính bảng', 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=150', 'SKU-0015', 63, N'iPad Air M2', GETDATE(), GETDATE()),
(N'Samsung Galaxy Tab S9', 22000000, 9, N'Máy tính bảng', 'https://images.unsplash.com/photo-1585790050230-5dd28404f1e4?w=150', 'SKU-0016', 47, N'Galaxy Tab S9', GETDATE(), GETDATE()),
(N'iPad Mini 6', 15000000, 16, N'Máy tính bảng', 'https://images.unsplash.com/photo-1544244015-9c72fd9c866d?w=150', 'SKU-0017', 71, N'iPad Mini 6', GETDATE(), GETDATE()),
(N'Xiaomi Pad 6', 9000000, 20, N'Máy tính bảng', 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=150', 'SKU-0018', 85, N'Xiaomi Pad 6', GETDATE(), GETDATE()),

-- Phụ kiện
(N'AirPods Pro', 6000000, 25, N'Phụ kiện', 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=150', 'SKU-0006', 123, N'AirPods Pro', GETDATE(), GETDATE()),
(N'Apple Watch Series 9', 12000000, 18, N'Phụ kiện', 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=150', 'SKU-0019', 92, N'Apple Watch Series 9', GETDATE(), GETDATE()),
(N'Samsung Galaxy Buds Pro', 4500000, 30, N'Phụ kiện', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=150', 'SKU-0020', 108, N'Galaxy Buds Pro', GETDATE(), GETDATE()),
(N'Magic Keyboard cho iPad', 8000000, 12, N'Phụ kiện', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=150', 'SKU-0021', 45, N'Magic Keyboard', GETDATE(), GETDATE()),
(N'Apple Pencil 2', 3500000, 22, N'Phụ kiện', 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=150', 'SKU-0022', 87, N'Apple Pencil 2', GETDATE(), GETDATE()),
(N'Sạc dự phòng Anker 20000mAh', 1200000, 35, N'Phụ kiện', 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=150', 'SKU-0023', 156, N'Sạc dự phòng Anker', GETDATE(), GETDATE()),
(N'Ốp lưng iPhone 15 Pro', 500000, 50, N'Phụ kiện', 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=150', 'SKU-0024', 203, N'Ốp lưng iPhone', GETDATE(), GETDATE());
GO

PRINT '✅ Seed data hoàn tất!';
PRINT '✅ Đã tạo 2 users (admin@shop.vn / user@shop.vn)';
PRINT '✅ Đã tạo 4 categories';
PRINT '✅ Đã tạo 24 products';
PRINT '';
PRINT '📝 Thông tin đăng nhập:';
PRINT 'Admin: admin@shop.vn / admin123';
PRINT 'User: user@shop.vn / user123';
