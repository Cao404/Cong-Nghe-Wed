import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
      description: 'API cho hệ thống quản lý shop bán hàng',
      contact: {
        name: 'API Support',
        email: 'admin@shop.vn'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'API đăng nhập và đăng ký'
      },
      {
        name: 'Products',
        description: 'API quản lý sản phẩm'
      },
      {
        name: 'Orders',
        description: 'API quản lý đơn hàng'
      },
      {
        name: 'Categories',
        description: 'API quản lý danh mục'
      },
      {
        name: 'Users',
        description: 'API quản lý người dùng'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Nhập JWT token sau khi đăng nhập'
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
