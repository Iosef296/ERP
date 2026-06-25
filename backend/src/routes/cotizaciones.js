import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

router.get('/', async (_, res) => {
  res.json(await prisma.cotizacionCabecera.findMany({
    include: { cliente: true, detalles: { include: { producto: true } } }
  }))
})

router.get('/:id', async (req, res) => {
  const c = await prisma.cotizacionCabecera.findUnique({
    where: { id: Number(req.params.id) },
    include: { cliente: true, detalles: { include: { producto: true } } }
  })
  if (!c) return res.status(404).json({ error: 'Cotización no encontrada' })
  res.json(c)
})

router.post('/', async (req, res) => {
  const { clienteId, fechaVencimiento, detalles } = req.body
  const total = detalles.reduce((sum, d) => sum + (d.cantidad * (d.precioUnitario ?? 0)), 0)
  const cotizacion = await prisma.cotizacionCabecera.create({
    data: {
      clienteId,
      fechaVencimiento: new Date(fechaVencimiento),
      totalEstimado: total,
      detalles: {
        create: detalles.map(({ precioUnitario, ...d }) => d)
      }
    },
    include: { detalles: true }
  })
  res.status(201).json(cotizacion)
})

router.patch('/:id/estado', async (req, res) => {
  const c = await prisma.cotizacionCabecera.update({
    where: { id: Number(req.params.id) },
    data: { estado: req.body.estado }
  })
  res.json(c)
})

export default router
