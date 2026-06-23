import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

// Órdenes de producción
router.get('/ordenes', async (_, res) => {
  res.json(await prisma.ordenProduccion.findMany({ include: { role: true, materias: true } }))
})
router.post('/ordenes', async (req, res) => {
  res.status(201).json(await prisma.ordenProduccion.create({ data: req.body }))
})
router.put('/ordenes/:id', async (req, res) => {
  res.json(await prisma.ordenProduccion.update({ where: { id: Number(req.params.id) }, data: req.body }))
})
router.delete('/ordenes/:id', async (req, res) => {
  await prisma.ordenProduccion.delete({ where: { id: Number(req.params.id) } })
  res.status(204).send()
})

// Materia prima
router.get('/materias', async (_, res) => {
  res.json(await prisma.materiaPrima.findMany({ include: { proveedores: true } }))
})
router.post('/materias', async (req, res) => {
  res.status(201).json(await prisma.materiaPrima.create({ data: req.body }))
})
router.put('/materias/:id', async (req, res) => {
  res.json(await prisma.materiaPrima.update({ where: { id: Number(req.params.id) }, data: req.body }))
})

// Proveedores
router.get('/proveedores', async (_, res) => {
  res.json(await prisma.proveedor.findMany({ include: { materia: true } }))
})
router.post('/proveedores', async (req, res) => {
  res.status(201).json(await prisma.proveedor.create({ data: req.body }))
})
router.put('/proveedores/:id', async (req, res) => {
  res.json(await prisma.proveedor.update({ where: { id: Number(req.params.id) }, data: req.body }))
})

// Proyecciones
router.get('/proyecciones', async (_, res) => res.json(await prisma.proyeccion.findMany()))
router.post('/proyecciones', async (req, res) => {
  res.status(201).json(await prisma.proyeccion.create({ data: req.body }))
})

export default router
