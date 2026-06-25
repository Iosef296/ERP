import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

router.get('/', async (req, res, next) => {
  try {
    const ventas = await prisma.ventaCabecera.findMany({
      include: { cliente: true, detalles: { include: { producto: true } }, pagos: true }
    })
    res.json(ventas)
  } catch (e) { next(e) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const venta = await prisma.ventaCabecera.findUnique({
      where: { id: Number(req.params.id) },
      include: { cliente: true, detalles: { include: { producto: true } }, pagos: true }
    })
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' })
    res.json(venta)
  } catch (e) { next(e) }
})

router.post('/', async (req, res, next) => {
  try {
    const { clienteId, sede, detalles, pagos } = req.body
    if (!detalles?.length) return res.status(400).json({ error: 'Se requiere al menos un producto' })
    const total = detalles.reduce((sum, d) => sum + Number(d.subtotal), 0)

    const data = {
      userId: req.user.id,
      sede: sede ?? 'Main Branch',
      total,
      detalles: {
        create: detalles.map(d => ({
          productoId: Number(d.productoId),
          cantidad: Number(d.cantidad),
          precioUnitario: Number(d.precioUnitario),
          subtotal: Number(d.subtotal),
        }))
      },
      pagos: { create: (pagos ?? []).map(p => ({ monto: Number(p.monto), metodoPago: p.metodoPago })) }
    }

    if (clienteId) data.clienteId = Number(clienteId)
    else {
      // clienteId is NOT NULL in schema — require a client or use a default
      return res.status(400).json({ error: 'Se requiere seleccionar un cliente' })
    }

    const venta = await prisma.ventaCabecera.create({ data, include: { detalles: true, pagos: true } })
    res.status(201).json(venta)
  } catch (e) { next(e) }
})

export default router
