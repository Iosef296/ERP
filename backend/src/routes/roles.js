import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

const wrap = fn => async (req, res, next) => { try { await fn(req, res, next) } catch (e) { next(e) } }

router.get('/', wrap(async (req, res) => {
  res.json(await prisma.role.findMany())
}))

router.get('/:id', wrap(async (req, res) => {
  const role = await prisma.role.findUnique({ where: { id: Number(req.params.id) } })
  if (!role) return res.status(404).json({ error: 'Role no encontrado' })
  res.json(role)
}))

router.post('/', wrap(async (req, res) => {
  try {
    res.status(201).json(await prisma.role.create({ data: req.body }))
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Código duplicado' })
    next(e)
  }
}))

router.put('/:id', wrap(async (req, res) => {
  res.json(await prisma.role.update({ where: { id: Number(req.params.id) }, data: req.body }))
}))

router.delete('/:id', wrap(async (req, res) => {
  await prisma.role.delete({ where: { id: Number(req.params.id) } })
  res.status(204).send()
}))

export default router
