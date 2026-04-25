import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { isPrismaNotFound, parseId, sendNotFound, sendValidationError } from '../utils/api.js';


const router = express.Router();

let ensureOrderAuditTablePromise = null;

function serializeOrder(order) {
  return {
    ...order,
    items: JSON.parse(order.items)
  };
}

async function ensureOrderAuditTable(client = prisma) {
  if (!ensureOrderAuditTablePromise) {
    ensureOrderAuditTablePromise = client.$executeRawUnsafe(`
      IF OBJECT_ID(N'dbo.OrderAuditLog', N'U') IS NULL
      BEGIN
        CREATE TABLE [dbo].[OrderAuditLog] (
          [id] INT IDENTITY(1,1) NOT NULL,
          [orderId] INT NOT NULL,
          [actorId] INT NULL,
          [actorName] NVARCHAR(255) NOT NULL,
          [actorRole] NVARCHAR(50) NULL,
          [action] NVARCHAR(50) NOT NULL,
          [fromStatus] NVARCHAR(50) NULL,
          [toStatus] NVARCHAR(50) NULL,
          [note] NVARCHAR(500) NULL,
          [createdAt] DATETIME2 NOT NULL CONSTRAINT [DF_OrderAuditLog_createdAt] DEFAULT SYSDATETIME(),
          CONSTRAINT [PK_OrderAuditLog] PRIMARY KEY ([id]),
          CONSTRAINT [FK_OrderAuditLog_Order] FOREIGN KEY ([orderId]) REFERENCES [dbo].[Order]([id]) ON DELETE CASCADE
        );

        CREATE INDEX [IX_OrderAuditLog_OrderId_CreatedAt] ON [dbo].[OrderAuditLog]([orderId], [createdAt]);
      END
    `);
  }

  return ensureOrderAuditTablePromise;
}

async function writeOrderAudit(tx, {
  orderId,
  actorId = null,
  actorName,
  actorRole = null,
  action,
  fromStatus = null,
  toStatus = null,
  note = null
}) {
  await ensureOrderAuditTable(tx);

  return tx.$executeRaw`
    INSERT INTO [dbo].[OrderAuditLog]
      ([orderId], [actorId], [actorName], [actorRole], [action], [fromStatus], [toStatus], [note])
    VALUES
      (${orderId}, ${actorId}, ${actorName}, ${actorRole}, ${action}, ${fromStatus}, ${toStatus}, ${note})
  `;
}

const ORDER_STATUS_TRANSITIONS = {
  pending: ['approved', 'rejected', 'cancelled'],
  approved: ['shipping'],
  shipping: ['delivered'],
  delivered: [],
  rejected: [],
  cancelled: [],
};

function canTransitionOrderStatus(currentStatus, nextStatus) {
  return (ORDER_STATUS_TRANSITIONS[currentStatus] || []).includes(nextStatus);
}

function getOrderStatusNote(status) {
  const notes = {
    approved: 'Duyệt đơn hàng',
    shipping: 'Đơn hàng đang giao',
    delivered: 'Đơn hàng đã giao',
    rejected: 'Từ chối đơn hàng',
    cancelled: 'Khách hàng hủy đơn',
  };

  return notes[status] || 'Cập nhật trạng thái đơn hàng';
}

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Lấy danh sách đơn hàng
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, pending, approved, rejected, cancelled]
 *         description: Lọc theo trạng thái
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng (Admin xem tất cả, User chỉ xem của mình)
 *       401:
 *         description: Chưa đăng nhập
 */
// Get all orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};

    // If user is not admin, only show their orders
    if (req.user.role !== 'admin') {
      where.userId = req.user.id;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Parse items JSON string
    const ordersWithParsedItems = orders.map(serializeOrder);

    res.json(ordersWithParsedItems);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Lấy chi tiết đơn hàng
 *     tags: [Orders]
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
 *         description: Chi tiết đơn hàng
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền xem đơn hàng này
 *       404:
 *         description: Không tìm thấy đơn hàng
 */
// Get order by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return sendValidationError(res, 'Invalid order id');
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    // Check if user owns this order or is admin
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(serializeOrder(order));
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Tạo đơn hàng mới
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - customerEmail
 *               - items
 *               - total
 *             properties:
 *               customerName:
 *                 type: string
 *                 example: Nguyen Van A
 *               customerEmail:
 *                 type: string
 *                 example: user@example.com
 *               customerPhone:
 *                 type: string
 *                 example: "0901234567"
 *               address:
 *                 type: string
 *                 example: 123 Nguyen Trai
 *               city:
 *                 type: string
 *                 example: Ho Chi Minh
 *               district:
 *                 type: string
 *                 example: Quan 1
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               total:
 *                 type: number
 *                 example: 30000000
 *               shippingFee:
 *                 type: number
 *                 example: 30000
 *               paymentMethod:
 *                 type: string
 *                 example: cod
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo đơn hàng thành công
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       401:
 *         description: Chưa đăng nhập
 */
// Create order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      address,
      city,
      district,
      items,
      total,
      shippingFee,
      paymentMethod,
      note
    } = req.body;

    if (!customerName || !customerEmail || !Array.isArray(items) || items.length === 0 || total === undefined) {
      return sendValidationError(res, 'Missing required fields');
    }

    // Generate order code
    const orderCode = 'ORD-' + Date.now();

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderCode,
          userId: req.user.id,
          customerName,
          customerEmail,
          customerPhone: customerPhone || null,
          address: address || null,
          city: city || null,
          district: district || null,
          items: JSON.stringify(items),
          total: parseFloat(total),
          shippingFee: shippingFee ? parseFloat(shippingFee) : 30000,
          paymentMethod: paymentMethod || 'cod',
          note: note || null,
          status: 'pending'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      await writeOrderAudit(tx, {
        orderId: createdOrder.id,
        actorId: req.user.id,
        actorName: req.user.name || customerName,
        actorRole: req.user.role || 'user',
        action: 'created',
        fromStatus: null,
        toStatus: 'pending',
        note: 'Tạo đơn hàng mới'
      });

      return createdOrder;
    });

    res.status(201).json(serializeOrder(order));
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

/**
 * @swagger
 * /api/orders/{id}/approve:
 *   put:
 *     summary: Duyệt đơn hàng (Admin only)
 *     tags: [Orders]
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
 *         description: Duyệt đơn hàng thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 */
// Approve order (Admin only)
router.put('/:id/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return sendValidationError(res, 'Invalid order id');
    }

    const order = await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { id }
      });

      if (!existingOrder) {
        return null;
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: 'approved' }
      });

      await writeOrderAudit(tx, {
        orderId: id,
        actorId: req.user.id,
        actorName: req.user.name || 'Admin',
        actorRole: req.user.role || 'admin',
        action: 'approved',
        fromStatus: existingOrder.status,
        toStatus: 'approved',
        note: 'Duyệt đơn hàng'
      });

      return updatedOrder;
    });

    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    res.json(serializeOrder(order));
  } catch (error) {
    console.error('Approve order error:', error);

    if (isPrismaNotFound(error)) {
      return sendNotFound(res, 'Order not found');
    }

    res.status(500).json({ error: 'Failed to approve order' });
  }
});

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái đơn hàng
 *     tags: [Orders]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, shipping, delivered, rejected, cancelled]
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 */
router.put('/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const { status } = req.body;

    if (!id) {
      return sendValidationError(res, 'Invalid order id');
    }

    if (!ORDER_STATUS_TRANSITIONS.pending.includes(status) && !ORDER_STATUS_TRANSITIONS.approved.includes(status) && !ORDER_STATUS_TRANSITIONS.shipping.includes(status)) {
      return sendValidationError(res, 'Invalid order status');
    }

    const order = await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { id }
      });

      if (!existingOrder) {
        return null;
      }

      if (!canTransitionOrderStatus(existingOrder.status, status)) {
        throw new Error('Invalid order status transition');
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status }
      });

      await writeOrderAudit(tx, {
        orderId: id,
        actorId: req.user.id,
        actorName: req.user.name || 'Admin',
        actorRole: req.user.role || 'admin',
        action: status,
        fromStatus: existingOrder.status,
        toStatus: status,
        note: getOrderStatusNote(status)
      });

      return updatedOrder;
    });

    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    res.json(serializeOrder(order));
  } catch (error) {
    console.error('Update order status error:', error);

    if (error.message === 'Invalid order status transition') {
      return sendValidationError(res, 'Invalid order status transition');
    }

    if (isPrismaNotFound(error)) {
      return sendNotFound(res, 'Order not found');
    }

    res.status(500).json({ error: 'Failed to update order status' });
  }
});

/**
 * @swagger
 * /api/orders/{id}/reject:
 *   put:
 *     summary: Từ chối đơn hàng (Admin only)
 *     tags: [Orders]
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
 *         description: Từ chối đơn hàng thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 */
// Reject order (Admin only)
router.put('/:id/reject', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return sendValidationError(res, 'Invalid order id');
    }

    const order = await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { id }
      });

      if (!existingOrder) {
        return null;
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: 'rejected' }
      });

      await writeOrderAudit(tx, {
        orderId: id,
        actorId: req.user.id,
        actorName: req.user.name || 'Admin',
        actorRole: req.user.role || 'admin',
        action: 'rejected',
        fromStatus: existingOrder.status,
        toStatus: 'rejected',
        note: 'Từ chối đơn hàng'
      });

      return updatedOrder;
    });

    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    res.json(serializeOrder(order));
  } catch (error) {
    console.error('Reject order error:', error);

    if (isPrismaNotFound(error)) {
      return sendNotFound(res, 'Order not found');
    }

    res.status(500).json({ error: 'Failed to reject order' });
  }
});

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   put:
 *     summary: Hủy đơn hàng (User chỉ hủy được đơn pending của mình)
 *     tags: [Orders]
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
 *         description: Hủy đơn hàng thành công
 *       400:
 *         description: Chỉ hủy được đơn hàng pending
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền hủy đơn hàng này
 *       404:
 *         description: Không tìm thấy đơn hàng
 */
// Cancel order (User can cancel their own pending orders)
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return sendValidationError(res, 'Invalid order id');
    }

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    // Check if user owns this order
    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Can only cancel pending orders
    if (order.status !== 'pending') {
      return sendValidationError(res, 'Can only cancel pending orders');
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const currentOrder = await tx.order.findUnique({
        where: { id }
      });

      if (!currentOrder) {
        return null;
      }

      const orderAfterCancel = await tx.order.update({
        where: { id },
        data: { status: 'cancelled' }
      });

      await writeOrderAudit(tx, {
        orderId: id,
        actorId: req.user.id,
        actorName: req.user.name || 'Customer',
        actorRole: req.user.role || 'user',
        action: 'cancelled',
        fromStatus: currentOrder.status,
        toStatus: 'cancelled',
        note: 'Khách hàng hủy đơn'
      });

      return orderAfterCancel;
    });

    if (!updatedOrder) {
      return sendNotFound(res, 'Order not found');
    }

    res.json(serializeOrder(updatedOrder));
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

/**
 * @swagger
 * /api/orders/{id}/history:
 *   get:
 *     summary: Lấy lịch sử xử lý đơn hàng
 *     tags: [Orders]
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
 *         description: Lịch sử đơn hàng
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền xem đơn hàng này
 *       404:
 *         description: Không tìm thấy đơn hàng
 */
router.get('/:id/history', authenticateToken, async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return sendValidationError(res, 'Invalid order id');
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true
      }
    });

    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await ensureOrderAuditTable(prisma);

    const history = await prisma.$queryRaw`
      SELECT
        [id],
        [orderId],
        [actorId],
        [actorName],
        [actorRole],
        [action],
        [fromStatus],
        [toStatus],
        [note],
        [createdAt]
      FROM [dbo].[OrderAuditLog]
      WHERE [orderId] = ${id}
      ORDER BY [createdAt] ASC
    `;

    res.json(history);
  } catch (error) {
    console.error('Get order history error:', error);
    res.status(500).json({ error: 'Failed to fetch order history' });
  }
});

export default router;
