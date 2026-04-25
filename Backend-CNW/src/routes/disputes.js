import express from 'express'
import { authenticateToken, isAdmin } from '../middleware/auth.js'
import { prisma } from '../lib/prisma.js'
import { parseId, sendNotFound, sendValidationError, isPrismaNotFound, isPrismaUniqueConstraint } from '../utils/api.js'

const router = express.Router()

router.get('/', authenticateToken, async (_req, res) => {
  try {
    const disputes = await prisma.dispute.findMany({ orderBy: { createdDate: 'desc' } })
    res.json(disputes)
  } catch (error) {
    console.error('Get disputes error:', error)
    res.status(500).json({ error: 'Failed to fetch disputes' })
  }
})

router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { disputeCode, orderCode, customer, shop, type, reason, amount, status, priority, createdDate } = req.body
    if (!disputeCode || !orderCode || !customer || !shop || !type || !reason || amount === undefined) {
      return sendValidationError(res, 'Missing required fields')
    }

    const dispute = await prisma.dispute.create({
      data: {
        disputeCode: String(disputeCode).toUpperCase(),
        orderCode,
        customer,
        shop,
        type,
        reason,
        amount: Number(amount),
        status: status || 'pending',
        priority: priority || 'medium',
        createdDate: createdDate ? new Date(createdDate) : new Date(),
      },
    })

    res.status(201).json(dispute)
  } catch (error) {
    console.error('Create dispute error:', error)
    if (isPrismaUniqueConstraint(error)) return sendValidationError(res, 'Dispute code already exists')
    res.status(500).json({ error: 'Failed to create dispute' })
  }
})

router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id)
    if (!id) return sendValidationError(res, 'Invalid dispute id')

    const { disputeCode, orderCode, customer, shop, type, reason, amount, status, priority, createdDate } = req.body
    const dispute = await prisma.dispute.update({
      where: { id },
      data: {
        ...(disputeCode && { disputeCode: String(disputeCode).toUpperCase() }),
        ...(orderCode && { orderCode }),
        ...(customer && { customer }),
        ...(shop && { shop }),
        ...(type && { type }),
        ...(reason && { reason }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(createdDate && { createdDate: new Date(createdDate) }),
      },
    })

    res.json(dispute)
  } catch (error) {
    console.error('Update dispute error:', error)
    if (isPrismaNotFound(error)) return sendNotFound(res, 'Dispute not found')
    if (isPrismaUniqueConstraint(error)) return sendValidationError(res, 'Dispute code already exists')
    res.status(500).json({ error: 'Failed to update dispute' })
  }
})

router.put('/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id)
    const { status } = req.body
    if (!id) return sendValidationError(res, 'Invalid dispute id')
    if (!status) return sendValidationError(res, 'Status is required')

    const dispute = await prisma.dispute.update({
      where: { id },
      data: { status },
    })

    res.json(dispute)
  } catch (error) {
    console.error('Update dispute status error:', error)
    if (isPrismaNotFound(error)) return sendNotFound(res, 'Dispute not found')
    res.status(500).json({ error: 'Failed to update dispute status' })
  }
})

router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id)
    if (!id) return sendValidationError(res, 'Invalid dispute id')

    await prisma.dispute.delete({ where: { id } })
    res.json({ message: 'Dispute deleted successfully' })
  } catch (error) {
    console.error('Delete dispute error:', error)
    if (isPrismaNotFound(error)) return sendNotFound(res, 'Dispute not found')
    res.status(500).json({ error: 'Failed to delete dispute' })
  }
})

export default router
