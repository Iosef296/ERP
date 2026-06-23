import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

router.get('/', async (_, res) => {
  const ventas = await prisma.ventaCabecera.findMany({
    include: { cliente: true, detalles: { include: { producto: true } }, pagos: true }
  })
  res.json(ventas)
})

router.get('/:id', async (req, res) => {
  const venta = await prisma.ventaCabecera.findUnique({
    where: { id: Number(req.params.id) },
    include: { cliente: true, detalles: { include: { producto: true } }, pagos: true }
  })
  if (!venta) return res.status(404).json({ error: 'Venta no encontrada' })
  res.json(venta)
})

router.post('/', async (req, res) => {
  const { clienteId, sede, detalles, pagos } = req.body
  const total = detalles.reduce((sum, d) => sum + d.subtotal, 0)

  const venta = await prisma.ventaCabecera.create({
    data: {
      clienteId,
      userId: req.user.id,
      sede: sede ?? 'Main Branch',
      total,
      detalles: { create: detalles },
      pagos: { create: pagos ?? [] }
    },
    include: { detalles: true, pagos: true }
  })
  res.status(201).json(venta)
})

export default router
