import express from 'express'
import { authenticateToken, isAdmin } from '../middleware/auth.js'
import { prisma } from '../lib/prisma.js'
import { parseId, sendNotFound, sendValidationError, isPrismaNotFound, isPrismaUniqueConstraint } from '../utils/api.js'

const router = express.Router()

router.get('/', authenticateToken, async (_req, res) => {
  try {
    const partners = await prisma.shippingPartner.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(partners)
  } catch (error) {
    console.error('Get shipping partners error:', error)
    res.status(500).json({ error: 'Failed to fetch shipping partners' })
  }
})

router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, code, logo, type, fee, avgDeliveryTime, contact, status, totalOrders, successRate } = req.body
    if (!name || !code || !fee || !avgDeliveryTime || !contact) {
      return sendValidationError(res, 'Missing required fields')
    }

    const partner = await prisma.shippingPartner.create({
      data: {
        name,
        code: String(code).toUpperCase(),
        logo: logo || '🚚',
        type,
        fee: Number(fee),
        avgDeliveryTime: Number(avgDeliveryTime),
        contact,
        status: status || 'active',
        totalOrders: totalOrders ? Number(totalOrders) : 0,
        successRate: successRate ? Number(successRate) : 0,
      },
    })

    res.status(201).json(partner)
  } catch (error) {
    console.error('Create shipping partner error:', error)
    if (isPrismaUniqueConstraint(error)) return sendValidationError(res, 'Partner code already exists')
    res.status(500).json({ error: 'Failed to create shipping partner' })
  }
})

router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id)
    if (!id) return sendValidationError(res, 'Invalid partner id')

    const { name, code, logo, type, fee, avgDeliveryTime, contact, status, totalOrders, successRate } = req.body
    const partner = await prisma.shippingPartner.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code: String(code).toUpperCase() }),
        ...(logo && { logo }),
        ...(type && { type }),
        ...(fee !== undefined && { fee: Number(fee) }),
        ...(avgDeliveryTime !== undefined && { avgDeliveryTime: Number(avgDeliveryTime) }),
        ...(contact && { contact }),
        ...(status && { status }),
        ...(totalOrders !== undefined && { totalOrders: Number(totalOrders) }),
        ...(successRate !== undefined && { successRate: Number(successRate) }),
      },
    })

    res.json(partner)
  } catch (error) {
    console.error('Update shipping partner error:', error)
    if (isPrismaNotFound(error)) return sendNotFound(res, 'Shipping partner not found')
    if (isPrismaUniqueConstraint(error)) return sendValidationError(res, 'Partner code already exists')
    res.status(500).json({ error: 'Failed to update shipping partner' })
  }
})

router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const id = parseId(req.params.id)
    if (!id) return sendValidationError(res, 'Invalid partner id')

    await prisma.shippingPartner.delete({ where: { id } })
    res.json({ message: 'Shipping partner deleted successfully' })
  } catch (error) {
    console.error('Delete shipping partner error:', error)
    if (isPrismaNotFound(error)) return sendNotFound(res, 'Shipping partner not found')
    res.status(500).json({ error: 'Failed to delete shipping partner' })
  }
})

export default router
