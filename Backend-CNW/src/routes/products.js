import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { isPrismaNotFound, isPrismaUniqueConstraint, parseId, sendNotFound, sendValidationError } from '../utils/api.js';


const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lấy danh sách sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Lọc theo danh mục
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm
 */
// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    const where = {};
    if (category && category !== 'all') {
      where.category = category;
    }
    if (search) {
      where.name = { contains: search };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Lấy chi tiết sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết sản phẩm
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return sendValidationError(res, 'Invalid product id');
    }

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return sendNotFound(res, 'Product not found');
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Tạo sản phẩm mới (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock
 *               - category
 *               - sku
 *             properties:
 *               name:
 *                 type: string
 *                 example: iPhone 15 Pro
 *               price:
 *                 type: number
 *                 example: 30000000
 *               stock:
 *                 type: integer
 *                 example: 10
 *               category:
 *                 type: string
 *                 example: Điện thoại
 *               image:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *               sku:
 *                 type: string
 *                 example: SKU-001
 *               description:
 *                 type: string
 *                 example: Sản phẩm chính hãng
 *     responses:
 *       201:
 *         description: Tạo sản phẩm thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 */
// Create product (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, price, stock, category, image, sku, description } = req.body;

    if (!name || price === undefined || stock === undefined || !category || !sku) {
      return sendValidationError(res, 'Missing required fields');
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        image: image || 'https://via.placeholder.com/150',
        sku,
        description: description || '',
        sold: 0
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);

    if (isPrismaUniqueConstraint(error)) {
      return sendValidationError(res, 'SKU already exists');
    }

    res.status(500).json({ error: 'Failed to create product' });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Cập nhật sản phẩm (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               category:
 *                 type: string
 *               image:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
// Update product (Admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const { name, price, stock, category, image, sku, description } = req.body;

    if (!id) {
      return sendValidationError(res, 'Invalid product id');
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(price && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(category && { category }),
        ...(image && { image }),
        ...(sku && { sku }),
        ...(description !== undefined && { description })
      }
    });

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);

    if (isPrismaNotFound(error)) {
      return sendNotFound(res, 'Product not found');
    }

    if (isPrismaUniqueConstraint(error)) {
      return sendValidationError(res, 'SKU already exists');
    }

    res.status(500).json({ error: 'Failed to update product' });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Xóa sản phẩm (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
// Delete product (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return sendValidationError(res, 'Invalid product id');
    }

    await prisma.product.delete({
      where: { id }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);

    if (isPrismaNotFound(error)) {
      return sendNotFound(res, 'Product not found');
    }

    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
