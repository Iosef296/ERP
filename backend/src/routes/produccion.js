import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

// Órdenes de producción
router.get('/ordenes', async (req, res, next) => {
  try {
    res.json(await prisma.ordenProduccion.findMany({ include: { role: true, materias: true } }))
  } catch (e) { next(e) }
})
router.post('/ordenes', async (req, res, next) => {
  try {
    const body = { ...req.body }
    if (body.rolId) body.rolId = Number(body.rolId)
    if (body.cantidad) body.cantidad = Number(body.cantidad)
    res.status(201).json(await prisma.ordenProduccion.create({ data: body }))
  } catch (e) { next(e) }
})
router.put('/ordenes/:id', async (req, res, next) => {
  try {
    const body = { ...req.body }
    if (body.rolId) body.rolId = Number(body.rolId)
    if (body.cantidad) body.cantidad = Number(body.cantidad)
    res.json(await prisma.ordenProduccion.update({ where: { id: Number(req.params.id) }, data: body }))
  } catch (e) { next(e) }
})
router.delete('/ordenes/:id', async (req, res, next) => {
  try {
    await prisma.ordenProduccion.delete({ where: { id: Number(req.params.id) } })
    res.status(204).send()
  } catch (e) { next(e) }
})

// Materia prima
router.get('/materias', async (req, res, next) => {
  try {
    res.json(await prisma.materiaPrima.findMany({ include: { proveedores: true } }))
  } catch (e) { next(e) }
})
router.post('/materias', async (req, res, next) => {
  try {
    const body = { ...req.body }
    if (body.stock != null) body.stock = Number(body.stock)
    if (body.ordenId) body.ordenId = Number(body.ordenId)
    res.status(201).json(await prisma.materiaPrima.create({ data: body }))
  } catch (e) { next(e) }
})
router.put('/materias/:id', async (req, res, next) => {
  try {
    const body = { ...req.body }
    if (body.stock != null) body.stock = Number(body.stock)
    if (body.ordenId) body.ordenId = Number(body.ordenId)
    res.json(await prisma.materiaPrima.update({ where: { id: Number(req.params.id) }, data: body }))
  } catch (e) { next(e) }
})

// Proveedores
router.get('/proveedores', async (req, res, next) => {
  try {
    res.json(await prisma.proveedor.findMany({ include: { materia: true } }))
  } catch (e) { next(e) }
})
router.post('/proveedores', async (req, res, next) => {
  try {
    const body = { ...req.body }
    if (body.materiaId) body.materiaId = Number(body.materiaId)
    else delete body.materiaId
    res.status(201).json(await prisma.proveedor.create({ data: body }))
  } catch (e) { next(e) }
})
router.put('/proveedores/:id', async (req, res, next) => {
  try {
    const body = { ...req.body }
    if (body.materiaId) body.materiaId = Number(body.materiaId)
    else delete body.materiaId
    res.json(await prisma.proveedor.update({ where: { id: Number(req.params.id) }, data: body }))
  } catch (e) { next(e) }
})

// Proyecciones
router.get('/proyecciones', async (req, res, next) => {
  try {
    res.json(await prisma.proyeccion.findMany())
  } catch (e) { next(e) }
})
router.post('/proyecciones', async (req, res, next) => {
  try {
    res.status(201).json(await prisma.proyeccion.create({ data: req.body }))
  } catch (e) { next(e) }
})

export default router
