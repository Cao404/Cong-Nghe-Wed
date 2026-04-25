import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { isPrismaNotFound, parseId, sendNotFound, sendValidationError } from '../utils/api.js';


const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách người dùng (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách người dùng
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 */
// Get all users (Admin only)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true,
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Lấy thông tin người dùng
 *     tags: [Users]
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
 *         description: Thông tin người dùng (User chỉ xem được của mình)
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền xem
 *       404:
 *         description: Không tìm thấy người dùng
 */
// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return sendValidationError(res, 'Invalid user id');
    }

    // Users can only view their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            orderCode: true,
            total: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Cập nhật thông tin người dùng
 *     tags: [Users]
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
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 description: Chỉ admin mới đổi được role
 *     responses:
 *       200:
 *         description: Cập nhật thành công (User chỉ sửa được của mình)
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền
 */
// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const { name, phone, role } = req.body;

    if (!id) {
      return sendValidationError(res, 'Invalid user id');
    }

    // Users can only update their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Only admin can change role
    if (role && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can change user role' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(role && req.user.role === 'admin' && { role })
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);

    if (isPrismaNotFound(error)) {
      return sendNotFound(res, 'User not found');
    }

    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Xóa người dùng (Admin only)
 *     tags: [Users]
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
 *       400:
 *         description: Không thể xóa chính mình
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 */
// Delete user (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return sendValidationError(res, 'Invalid user id');
    }

    // Cannot delete yourself
    if (req.user.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);

    if (isPrismaNotFound(error)) {
      return sendNotFound(res, 'User not found');
    }

    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
