import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

router.get('/', async (_, res) => res.json(await prisma.cliente.findMany()))
router.get('/:id', async (req, res) => {
  const c = await prisma.cliente.findUnique({
    where: { id: Number(req.params.id) },
    include: { ventaCabeceras: true, cotizacionCabeceras: true }
  })
  if (!c) return res.status(404).json({ error: 'Cliente no encontrado' })
  res.json(c)
})
router.post('/', async (req, res) => {
  res.status(201).json(await prisma.cliente.create({ data: req.body }))
})
router.put('/:id', async (req, res) => {
  res.json(await prisma.cliente.update({ where: { id: Number(req.params.id) }, data: req.body }))
})
router.delete('/:id', async (req, res) => {
  await prisma.cliente.delete({ where: { id: Number(req.params.id) } })
  res.status(204).send()
})

export default router
