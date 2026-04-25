# E-commerce Backend API

Backend API cho hệ thống quản lý shop bán hàng.

## Công nghệ sử dụng

- Node.js + Express
- Prisma ORM
- SQL Server
- JWT Authentication
- bcryptjs

## Cài đặt

```bash
# Cài dependencies
npm install

# Copy file .env
cp .env.example .env

# Sửa thông tin SQL Server trong .env

# Khởi tạo database
npx prisma migrate dev

# Chạy server
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm (Admin)
- `PUT /api/products/:id` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin)

### Orders
- `GET /api/orders` - Lấy danh sách đơn hàng
- `GET /api/orders/:id` - Lấy chi tiết đơn hàng
- `POST /api/orders` - Tạo đơn hàng
- `PUT /api/orders/:id/approve` - Duyệt đơn (Admin)
- `PUT /api/orders/:id/reject` - Từ chối đơn (Admin)
- `PUT /api/orders/:id/cancel` - Hủy đơn (User)

### Categories
- `GET /api/categories` - Lấy danh sách danh mục
- `POST /api/categories` - Tạo danh mục (Admin)
- `PUT /api/categories/:id` - Cập nhật danh mục (Admin)
- `DELETE /api/categories/:id` - Xóa danh mục (Admin)

### Users
- `GET /api/users` - Lấy danh sách người dùng (Admin)
- `GET /api/users/:id` - Lấy thông tin người dùng
- `PUT /api/users/:id` - Cập nhật thông tin người dùng
- `DELETE /api/users/:id` - Xóa người dùng (Admin)

## Server chạy trên

http://localhost:3000
