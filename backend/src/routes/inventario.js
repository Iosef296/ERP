import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

router.get('/products', async (_, res) => {
  res.json(await prisma.product.findMany({ include: { category: true } }))
})
router.post('/products', async (req, res) => {
  try {
    res.status(201).json(await prisma.product.create({ data: req.body }))
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'SKU duplicado' })
    res.status(500).json({ error: 'Error interno' })
  }
})
router.put('/products/:id', async (req, res) => {
  res.json(await prisma.product.update({ where: { id: Number(req.params.id) }, data: req.body }))
})
router.delete('/products/:id', async (req, res) => {
  await prisma.product.delete({ where: { id: Number(req.params.id) } })
  res.status(204).send()
})

router.get('/categories', async (_, res) => res.json(await prisma.category.findMany()))
router.post('/categories', async (req, res) => {
  res.status(201).json(await prisma.category.create({ data: req.body }))
})

export default router
