import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

router.get('/', async (req, res) => {
  const workers = await prisma.worker.findMany({ include: { role: true, sede: true } })
  res.json(workers)
})

router.get('/:id', async (req, res) => {
  const worker = await prisma.worker.findUnique({
    where: { id: Number(req.params.id) },
    include: { role: true, sede: true }
  })
  if (!worker) return res.status(404).json({ error: 'Worker no encontrado' })
  res.json(worker)
})

router.post('/', async (req, res) => {
  try {
    const worker = await prisma.worker.create({ data: req.body })
    res.status(201).json(worker)
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'DNI o email duplicado' })
    res.status(500).json({ error: 'Error interno' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const worker = await prisma.worker.update({ where: { id: Number(req.params.id) }, data: req.body })
    res.json(worker)
  } catch {
    res.status(500).json({ error: 'Error interno' })
  }
})

router.delete('/:id', async (req, res) => {
  await prisma.worker.delete({ where: { id: Number(req.params.id) } })
  res.status(204).send()
})

export default router
