import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

router.get('/products', async (req, res, next) => {
  try {
    res.json(await prisma.product.findMany({ include: { category: true } }))
  } catch (e) { next(e) }
})
router.post('/products', async (req, res, next) => {
  try {
    const { name, sku, price, stock, categoryId } = req.body
    const data = { name, sku, price: Number(price), stock: Number(stock ?? 0) }
    if (categoryId) data.categoryId = Number(categoryId)
    res.status(201).json(await prisma.product.create({ data }))
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'SKU duplicado' })
    next(e)
  }
})
router.put('/products/:id', async (req, res, next) => {
  try {
    const { name, sku, price, stock, categoryId } = req.body
    const data = {}
    if (name != null) data.name = name
    if (sku != null) data.sku = sku
    if (price != null) data.price = Number(price)
    if (stock != null) data.stock = Number(stock)
    if (categoryId != null && categoryId !== '') data.categoryId = Number(categoryId)
    else if (categoryId === '' || categoryId === null) data.categoryId = null
    res.json(await prisma.product.update({ where: { id: Number(req.params.id) }, data }))
  } catch (e) { next(e) }
})
router.delete('/products/:id', async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } })
    res.status(204).send()
  } catch (e) { next(e) }
})

router.get('/categories', async (req, res, next) => {
  try {
    res.json(await prisma.category.findMany())
  } catch (e) { next(e) }
})
router.post('/categories', async (req, res, next) => {
  try {
    res.status(201).json(await prisma.category.create({ data: { name: req.body.name } }))
  } catch (e) { next(e) }
})

export default router
