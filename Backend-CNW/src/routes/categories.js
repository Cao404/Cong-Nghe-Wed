import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { isPrismaNotFound, isPrismaUniqueConstraint, parseId, sendNotFound, sendValidationError } from '../utils/api.js';


const router = express.Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lấy danh sách danh mục
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Danh sách danh mục
 */
// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Tạo danh mục mới (Admin only)
 *     tags: [Categories]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Laptop
 *               description:
 *                 type: string
 *                 example: Máy tính xách tay
 *               parentCategory:
 *                 type: string
 *                 example: Điện tử
 *     responses:
 *       201:
 *         description: Tạo danh mục thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 */
// Create category (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, description, parentCategory } = req.body;

    if (!name) {
      return sendValidationError(res, 'Category name is required');
    }

    const category = await prisma.category.create({
      data: {
        name,
        description: description || '',
        parentCategory: parentCategory || null,
        productCount: 0,
        status: 'active'
      }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);

    if (isPrismaUniqueConstraint(error)) {
      return sendValidationError(res, 'Category name already exists');
    }

    res.status(500).json({ error: 'Failed to create category' });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Cập nhật danh mục (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               parentCategory:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 */
// Update category (Admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const { name, description, status, parentCategory } = req.body;

    if (!id) {
      return sendValidationError(res, 'Invalid category id');
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(parentCategory !== undefined && { parentCategory })
      }
    });

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);

    if (isPrismaNotFound(error)) {
      return sendNotFound(res, 'Category not found');
    }

    if (isPrismaUniqueConstraint(error)) {
      return sendValidationError(res, 'Category name already exists');
    }

    res.status(500).json({ error: 'Failed to update category' });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Xóa danh mục (Admin only)
 *     tags: [Categories]
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
 */
// Delete category (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return sendValidationError(res, 'Invalid category id');
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);

    if (isPrismaNotFound(error)) {
      return sendNotFound(res, 'Category not found');
    }

    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
