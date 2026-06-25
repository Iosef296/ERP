import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

const wrap = fn => async (req, res, next) => { try { await fn(req, res, next) } catch (e) { next(e) } }

router.get('/', wrap(async (req, res) => {
  res.json(await prisma.cotizacionCabecera.findMany({
    include: { cliente: true, detalles: { include: { producto: true } } }
  }))
}))

router.get('/:id', wrap(async (req, res) => {
  const c = await prisma.cotizacionCabecera.findUnique({
    where: { id: Number(req.params.id) },
    include: { cliente: true, detalles: { include: { producto: true } } }
  })
  if (!c) return res.status(404).json({ error: 'Cotización no encontrada' })
  res.json(c)
}))

router.post('/', wrap(async (req, res) => {
  const { clienteId, fechaVencimiento, detalles } = req.body
  if (!clienteId) return res.status(400).json({ error: 'Se requiere un cliente' })
  if (!detalles?.length) return res.status(400).json({ error: 'Se requiere al menos un producto' })

  const total = detalles.reduce((sum, d) => sum + (Number(d.cantidad) * Number(d.precioUnitario ?? 0)), 0)

  const cotizacion = await prisma.cotizacionCabecera.create({
    data: {
      clienteId: Number(clienteId),
      fechaVencimiento: new Date(fechaVencimiento),
      totalEstimado: total,
      detalles: {
        create: detalles.map(d => ({
          productoId: Number(d.productoId),
          cantidad: Number(d.cantidad),
          especificacionesTecnicas: d.especificacionesTecnicas ?? null,
        }))
      }
    },
    include: { detalles: true }
  })
  res.status(201).json(cotizacion)
}))

router.patch('/:id/estado', wrap(async (req, res) => {
  const c = await prisma.cotizacionCabecera.update({
    where: { id: Number(req.params.id) },
    data: { estado: req.body.estado }
  })
  res.json(c)
}))

export default router
