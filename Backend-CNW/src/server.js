import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { specs, swaggerUi } from './swagger.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import categoryRoutes from './routes/categories.js';
import userRoutes from './routes/users.js';
import voucherRoutes from './routes/vouchers.js';
import shippingRoutes from './routes/shipping.js';
import disputeRoutes from './routes/disputes.js';
import { prisma } from './lib/prisma.js';
import { seedMarketingData } from './bootstrap.js';

const app = express();
const port = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/shipping-partners', shippingRoutes);
app.use('/api/disputes', disputeRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'E-commerce API Server',
    status: 'Running',
    version: '1.0.0',
    documentation: `http://localhost:${port}/api-docs`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start server
const server = app.listen(port, async () => {
  try {
    await prisma.$connect();
    await seedMarketingData();
    console.log(`Server is running at http://localhost:${port}`);
    console.log(`API Documentation: http://localhost:${port}/api-docs`);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Stop the old process or change PORT in .env.`);
    process.exit(1);
  }

  console.error('Server startup failed:', error.message);
  process.exit(1);
});
