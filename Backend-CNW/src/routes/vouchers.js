import express from 'express'
import { authenticateToken, isAdmin } from '../middleware/auth.js'
import { prisma } from '../lib/prisma.js'
import { parseId, sendNotFound, sendValidationError, isPrismaNotFound, isPrismaUniqueConstraint } from '../utils/api.js'

const router = express.Router()

function toDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

router.get('/', authenticateToken, async (_req, res) => {
  try {
    const vouchers = await prisma.voucher.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(vouchers)
  } catch (error) {
    console.error('Get vouchers error:', error)
    res.status(500).json({ error: 'Failed to fetch vouchers' })
  }
})

router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { code, name, type, value, minOrder, maxDiscount, quantity, startDate, endDate, status } = req.body
    if (!code || !name || !type || value === undefined || !quantity || !startDate || !endDate) {
      return sendValidationError(res, 'Missing required fields')
    }

    const voucher = await prisma.voucher.create({
      data: {
        code: String(code).toUpperCase(),
        name,
        type,
        value: Number(value),
        minOrder: minOrder ? Number(minOrder) : 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : 0,
        quantity: Number(quantity),
        used: 0,
        startDate: toDate(startDate),
        endDate: toDate(endDate),
        status: status || 'active',
      },
    })

    res.status(201).json(voucher)
  } catch (error) {
    console.error('Create voucher error:', error)
    if (isPrismaUniqueConstraint(error)) {
      return sendValidationError(res, 'Voucher code already exists')
    }
    res.status(500).json({ error: 'Failed to create voucher' })
  }
})

router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id)
    if (!id) return sendValidationError(res, 'Invalid voucher id')

    const { code, name, type, value, minOrder, maxDiscount, quantity, startDate, endDate, status } = req.body

    const voucher = await prisma.voucher.update({
      where: { id },
      data: {
        ...(code && { code: String(code).toUpperCase() }),
        ...(name && { name }),
        ...(type && { type }),
        ...(value !== undefined && { value: Number(value) }),
        ...(minOrder !== undefined && { minOrder: Number(minOrder) }),
        ...(maxDiscount !== undefined && { maxDiscount: Number(maxDiscount) }),
        ...(quantity !== undefined && { quantity: Number(quantity) }),
        ...(startDate && { startDate: toDate(startDate) }),
        ...(endDate && { endDate: toDate(endDate) }),
        ...(status && { status }),
      },
    })

    res.json(voucher)
  } catch (error) {
    console.error('Update voucher error:', error)
    if (isPrismaNotFound(error)) return sendNotFound(res, 'Voucher not found')
    if (isPrismaUniqueConstraint(error)) return sendValidationError(res, 'Voucher code already exists')
    res.status(500).json({ error: 'Failed to update voucher' })
  }
})

router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id)
    if (!id) return sendValidationError(res, 'Invalid voucher id')

    await prisma.voucher.delete({ where: { id } })
    res.json({ message: 'Voucher deleted successfully' })
  } catch (error) {
    console.error('Delete voucher error:', error)
    if (isPrismaNotFound(error)) return sendNotFound(res, 'Voucher not found')
    res.status(500).json({ error: 'Failed to delete voucher' })
  }
})

export default router
