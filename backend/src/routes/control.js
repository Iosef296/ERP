import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

const numericOpt = (body, key) => {
  if (body[key] != null && body[key] !== '') body[key] = Number(body[key])
  else delete body[key]
}

// Indicadores KPI
router.get('/indicadores', async (req, res, next) => {
  try {
    res.json(await prisma.indicador.findMany({ include: { sede: true } }))
  } catch (e) { next(e) }
})
router.post('/indicadores', async (req, res, next) => {
  try {
    const body = { ...req.body }
    if (body.porcentajeCumplimiento != null) body.porcentajeCumplimiento = Number(body.porcentajeCumplimiento)
    numericOpt(body, 'sedeId')
    res.status(201).json(await prisma.indicador.create({ data: body }))
  } catch (e) { next(e) }
})
router.put('/indicadores/:id', async (req, res, next) => {
  try {
    const body = { ...req.body }
    if (body.porcentajeCumplimiento != null) body.porcentajeCumplimiento = Number(body.porcentajeCumplimiento)
    numericOpt(body, 'sedeId')
    res.json(await prisma.indicador.update({ where: { id: Number(req.params.id) }, data: body }))
  } catch (e) { next(e) }
})

// Plan estratégico
router.get('/planes', async (req, res, next) => {
  try {
    res.json(await prisma.planEstrategico.findMany({ include: { justificaciones: true } }))
  } catch (e) { next(e) }
})
router.post('/planes', async (req, res, next) => {
  try {
    res.status(201).json(await prisma.planEstrategico.create({ data: req.body }))
  } catch (e) { next(e) }
})

// Auditorías
router.get('/auditorias', async (req, res, next) => {
  try {
    res.json(await prisma.auditoria.findMany({ include: { sede: true } }))
  } catch (e) { next(e) }
})
router.post('/auditorias', async (req, res, next) => {
  try {
    const body = { ...req.body }
    numericOpt(body, 'sedeId')
    res.status(201).json(await prisma.auditoria.create({ data: body }))
  } catch (e) { next(e) }
})

// Control de calidad
router.get('/calidad', async (req, res, next) => {
  try {
    res.json(await prisma.controlCalidad.findMany({ include: { sede: true } }))
  } catch (e) { next(e) }
})
router.post('/calidad', async (req, res, next) => {
  try {
    const body = { ...req.body }
    numericOpt(body, 'sedeId')
    res.status(201).json(await prisma.controlCalidad.create({ data: body }))
  } catch (e) { next(e) }
})

// Gastos operativos
router.get('/gastos', async (req, res, next) => {
  try {
    res.json(await prisma.gastoOperativo.findMany({ include: { sede: true } }))
  } catch (e) { next(e) }
})
router.post('/gastos', async (req, res, next) => {
  try {
    const body = { ...req.body }
    if (body.desembolso != null) body.desembolso = Number(body.desembolso)
    numericOpt(body, 'sedeId')
    res.status(201).json(await prisma.gastoOperativo.create({ data: body }))
  } catch (e) { next(e) }
})

export default router
