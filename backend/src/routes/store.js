import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

// Stores CRUD
router.get('/', async (_, res) => res.json(await prisma.store.findMany()))
router.post('/', async (req, res) => res.status(201).json(await prisma.store.create({ data: req.body })))

// Personnel
router.get('/:storeId/personnel', async (req, res) => {
  res.json(await prisma.storePersonnel.findMany({
    where: { storeId: Number(req.params.storeId) },
    include: { roles: { include: { role: true } } }
  }))
})
router.post('/:storeId/personnel', async (req, res) => {
  res.status(201).json(await prisma.storePersonnel.create({
    data: { ...req.body, storeId: Number(req.params.storeId) }
  }))
})

// Attendance
router.get('/:storeId/attendance', async (req, res) => {
  res.json(await prisma.storeAttendance.findMany({
    where: { storeId: Number(req.params.storeId) },
    include: { personnel: true }
  }))
})
router.post('/:storeId/attendance', async (req, res) => {
  res.status(201).json(await prisma.storeAttendance.create({
    data: { ...req.body, storeId: Number(req.params.storeId) }
  }))
})

// Machines
router.get('/:storeId/machines', async (req, res) => {
  res.json(await prisma.storeMachine.findMany({ where: { storeId: Number(req.params.storeId) } }))
})
router.post('/:storeId/machines', async (req, res) => {
  res.status(201).json(await prisma.storeMachine.create({
    data: { ...req.body, storeId: Number(req.params.storeId) }
  }))
})

// Incidents
router.get('/:storeId/incidents', async (req, res) => {
  res.json(await prisma.storeIncident.findMany({ where: { storeId: Number(req.params.storeId) } }))
})
router.post('/:storeId/incidents', async (req, res) => {
  res.status(201).json(await prisma.storeIncident.create({
    data: { ...req.body, storeId: Number(req.params.storeId) }
  }))
})

// Requests
router.get('/:storeId/requests', async (req, res) => {
  res.json(await prisma.storeRequest.findMany({
    where: { storeId: Number(req.params.storeId) },
    include: { requester: true }
  }))
})
router.post('/:storeId/requests', async (req, res) => {
  res.status(201).json(await prisma.storeRequest.create({
    data: { ...req.body, storeId: Number(req.params.storeId) }
  }))
})

// Notices / Communications
router.get('/:storeId/notices', async (req, res) => {
  res.json(await prisma.storeNotice.findMany({ where: { storeId: Number(req.params.storeId) } }))
})
router.post('/:storeId/notices', async (req, res) => {
  res.status(201).json(await prisma.storeNotice.create({
    data: { ...req.body, storeId: Number(req.params.storeId) }
  }))
})

// Access logs
router.get('/:storeId/access-logs', async (req, res) => {
  res.json(await prisma.storeAccessLog.findMany({ where: { storeId: Number(req.params.storeId) } }))
})

export default router
