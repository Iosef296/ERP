import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

// Indicadores KPI
router.get('/indicadores', async (_, res) => {
  res.json(await prisma.indicador.findMany({ include: { sede: true } }))
})
router.post('/indicadores', async (req, res) => {
  res.status(201).json(await prisma.indicador.create({ data: req.body }))
})
router.put('/indicadores/:id', async (req, res) => {
  res.json(await prisma.indicador.update({ where: { id: Number(req.params.id) }, data: req.body }))
})

// Plan estratégico
router.get('/planes', async (_, res) => {
  res.json(await prisma.planEstrategico.findMany({ include: { justificaciones: true } }))
})
router.post('/planes', async (req, res) => {
  res.status(201).json(await prisma.planEstrategico.create({ data: req.body }))
})

// Auditorías
router.get('/auditorias', async (_, res) => {
  res.json(await prisma.auditoria.findMany({ include: { sede: true } }))
})
router.post('/auditorias', async (req, res) => {
  res.status(201).json(await prisma.auditoria.create({ data: req.body }))
})

// Control de calidad
router.get('/calidad', async (_, res) => {
  res.json(await prisma.controlCalidad.findMany({ include: { sede: true } }))
})
router.post('/calidad', async (req, res) => {
  res.status(201).json(await prisma.controlCalidad.create({ data: req.body }))
})

// Gastos operativos
router.get('/gastos', async (_, res) => {
  res.json(await prisma.gastoOperativo.findMany({ include: { sede: true } }))
})
router.post('/gastos', async (req, res) => {
  res.status(201).json(await prisma.gastoOperativo.create({ data: req.body }))
})

export default router
