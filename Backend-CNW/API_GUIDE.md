# 📚 Hướng dẫn sử dụng API

## 🚀 Bước 1: Chạy seed data

Trước khi test API, bạn cần chạy file `seed.sql` trong SQL Server Management Studio:

1. Mở SQL Server Management Studio (SSMS)
2. Kết nối với server: `DESKTOP-PNZJJM2\MSSQLSERVER02`
3. Mở file `Backend-CNW/seed.sql`
4. Chạy toàn bộ script (F5)

✅ Script sẽ tạo:
- 2 users (admin và user)
- 4 categories
- 24 products

## 🔐 Bước 2: Đăng nhập để lấy token

### Tài khoản test:
- **Admin**: admin@shop.vn / admin123
- **User**: user@shop.vn / user123

### Cách lấy token:

1. Mở Swagger UI: http://localhost:3000/api-docs
2. Tìm endpoint `POST /api/auth/login`
3. Click "Try it out"
4. Nhập:
```json
{
  "email": "admin@shop.vn",
  "password": "admin123"
}
```
5. Click "Execute"
6. Copy token từ response

### Cách sử dụng token:

1. Click nút "Authorize" ở đầu trang Swagger
2. Nhập: `Bearer <token_của_bạn>`
3. Click "Authorize"

Giờ bạn có thể test tất cả các API cần authentication!

## 📋 Các API có sẵn

### 🔑 Authentication
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập

### 📦 Products
- `GET /api/products` - Lấy danh sách sản phẩm (có filter, search)
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm (Admin only)
- `PUT /api/products/:id` - Cập nhật sản phẩm (Admin only)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin only)

### 🛒 Orders
- `GET /api/orders` - Lấy danh sách đơn hàng
- `GET /api/orders/:id` - Lấy chi tiết đơn hàng
- `POST /api/orders` - Tạo đơn hàng mới
- `PUT /api/orders/:id/approve` - Duyệt đơn (Admin only)
- `PUT /api/orders/:id/reject` - Từ chối đơn (Admin only)
- `PUT /api/orders/:id/cancel` - Hủy đơn (trả trạng thái `cancelled`, user chỉ hủy được đơn pending của mình)

### 📂 Categories
- `GET /api/categories` - Lấy danh sách danh mục
- `POST /api/categories` - Tạo danh mục (Admin only)
- `PUT /api/categories/:id` - Cập nhật danh mục (Admin only)
- `DELETE /api/categories/:id` - Xóa danh mục (Admin only)

### 👥 Users
- `GET /api/users` - Lấy danh sách users (Admin only)
- `GET /api/users/:id` - Lấy thông tin user
- `PUT /api/users/:id` - Cập nhật thông tin user
- `DELETE /api/users/:id` - Xóa user (Admin only)

## 🧪 Test các tính năng

### Test 1: Lấy danh sách sản phẩm
```
GET /api/products
```

### Test 2: Tìm kiếm sản phẩm
```
GET /api/products?search=iPhone
GET /api/products?category=Laptop
```

### Test 3: Tạo đơn hàng (cần login)
```
POST /api/orders
{
  "customerName": "Nguyen Van A",
  "customerEmail": "user@shop.vn",
  "customerPhone": "0901234567",
  "address": "123 Nguyen Trai",
  "city": "Ho Chi Minh",
  "district": "Quan 1",
  "items": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "price": 30000000,
      "quantity": 1
    }
  ],
  "total": 30000000,
  "shippingFee": 30000,
  "paymentMethod": "cod"
}
```

### Test 4: Admin duyệt đơn hàng
```
PUT /api/orders/1/approve
```

### Test 5: User hủy đơn hàng pending
```
PUT /api/orders/1/cancel
```

## 🎯 Lưu ý quan trọng

1. **Admin vs User**:
   - Admin có thể làm mọi thứ
   - User chỉ xem được đơn hàng của mình
   - User chỉ hủy được đơn hàng pending của mình

2. **Token expiration**: Token có hiệu lực 7 ngày

3. **Password trong seed.sql**: 
   - Đã được hash bằng bcrypt
   - Password gốc: admin123 và user123

## 🔧 Troubleshooting

### Lỗi kết nối database:
- Kiểm tra SQL Server đang chạy
- Kiểm tra connection string trong `.env`
- Kiểm tra database `ShopDB` đã được tạo

### Lỗi 401 Unauthorized:
- Kiểm tra đã login và lấy token chưa
- Kiểm tra đã click "Authorize" trong Swagger chưa
- Token có đúng format: `Bearer <token>`

### Lỗi 403 Forbidden:
- Endpoint này cần quyền admin
- Đăng nhập bằng tài khoản admin@shop.vn

### Seed dữ liệu mẫu:
- Có thể chạy `node src/seed.js` để seed bằng Prisma với mật khẩu mẫu đúng
- Hoặc chạy `seed.sql` trong SQL Server để tạo dữ liệu test

## 📞 Liên hệ

Nếu có vấn đề, hãy kiểm tra console log của server để xem lỗi chi tiết!
