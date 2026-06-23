import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

router.get('/', async (_, res) => res.json(await prisma.sede.findMany()))
router.get('/:id', async (req, res) => {
  const sede = await prisma.sede.findUnique({ where: { id: Number(req.params.id) } })
  if (!sede) return res.status(404).json({ error: 'Sede no encontrada' })
  res.json(sede)
})
router.post('/', async (req, res) => {
  try {
    res.status(201).json(await prisma.sede.create({ data: req.body }))
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Código duplicado' })
    res.status(500).json({ error: 'Error interno' })
  }
})
router.put('/:id', async (req, res) => {
  res.json(await prisma.sede.update({ where: { id: Number(req.params.id) }, data: req.body }))
})
router.delete('/:id', async (req, res) => {
  await prisma.sede.delete({ where: { id: Number(req.params.id) } })
  res.status(204).send()
})

export default router
