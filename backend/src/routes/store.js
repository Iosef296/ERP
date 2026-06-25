import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

const wrap = fn => async (req, res, next) => { try { await fn(req, res, next) } catch (e) { next(e) } }

// Stores
router.get('/', wrap(async (req, res) => res.json(await prisma.store.findMany())))
router.post('/', wrap(async (req, res) => res.status(201).json(await prisma.store.create({ data: req.body }))))

// Personnel
router.get('/:storeId/personnel', wrap(async (req, res) => {
  res.json(await prisma.storePersonnel.findMany({
    where: { storeId: Number(req.params.storeId) },
    include: { roles: { include: { role: true } } }
  }))
}))
router.post('/:storeId/personnel', wrap(async (req, res) => {
  const { firstName, lastName, email, phone, hireDate } = req.body
  const data = { firstName, lastName, storeId: Number(req.params.storeId) }
  if (email) data.email = email
  if (phone) data.phone = phone
  if (hireDate) data.hireDate = new Date(hireDate)
  res.status(201).json(await prisma.storePersonnel.create({ data }))
}))

// Attendance
router.get('/:storeId/attendance', wrap(async (req, res) => {
  res.json(await prisma.storeAttendance.findMany({
    where: { storeId: Number(req.params.storeId) },
    include: { personnel: true }
  }))
}))
router.post('/:storeId/attendance', wrap(async (req, res) => {
  const { storePersonnelId, date, checkIn, checkOut, status, notes } = req.body
  const data = {
    storeId: Number(req.params.storeId),
    storePersonnelId: Number(storePersonnelId),
    date: new Date(date),
    status: status ?? 'present'
  }
  if (checkIn) data.checkIn = checkIn
  if (checkOut) data.checkOut = checkOut
  if (notes) data.notes = notes
  res.status(201).json(await prisma.storeAttendance.create({ data }))
}))

// Machines
router.get('/:storeId/machines', wrap(async (req, res) => {
  res.json(await prisma.storeMachine.findMany({ where: { storeId: Number(req.params.storeId) } }))
}))
router.post('/:storeId/machines', wrap(async (req, res) => {
  const { name, serialNumber, status, lastMaintenance, nextMaintenance } = req.body
  const data = { storeId: Number(req.params.storeId), name, status: status ?? 'operational' }
  if (serialNumber) data.serialNumber = serialNumber
  if (lastMaintenance) data.lastMaintenance = new Date(lastMaintenance)
  if (nextMaintenance) data.nextMaintenance = new Date(nextMaintenance)
  res.status(201).json(await prisma.storeMachine.create({ data }))
}))

// Incidents
router.get('/:storeId/incidents', wrap(async (req, res) => {
  res.json(await prisma.storeIncident.findMany({ where: { storeId: Number(req.params.storeId) } }))
}))
router.post('/:storeId/incidents', wrap(async (req, res) => {
  const { title, description, occurredAt, severity, status } = req.body
  const data = {
    storeId: Number(req.params.storeId),
    title,
    description,
    occurredAt: new Date(occurredAt),
    severity: severity ?? 'medium',
    status: status ?? 'open'
  }
  res.status(201).json(await prisma.storeIncident.create({ data }))
}))

// Requests
router.get('/:storeId/requests', wrap(async (req, res) => {
  res.json(await prisma.storeRequest.findMany({
    where: { storeId: Number(req.params.storeId) },
    include: { requester: true }
  }))
}))
router.post('/:storeId/requests', wrap(async (req, res) => {
  const { requesterId, type, details } = req.body
  res.status(201).json(await prisma.storeRequest.create({
    data: { storeId: Number(req.params.storeId), requesterId: Number(requesterId), type, details }
  }))
}))

// Notices
router.get('/:storeId/notices', wrap(async (req, res) => {
  res.json(await prisma.storeNotice.findMany({ where: { storeId: Number(req.params.storeId) } }))
}))
router.post('/:storeId/notices', wrap(async (req, res) => {
  const { title, content, priority, expiresAt } = req.body
  const data = {
    storeId: Number(req.params.storeId),
    title,
    content,
    priority: priority ?? 'normal'
  }
  if (expiresAt) data.expiresAt = new Date(expiresAt)
  res.status(201).json(await prisma.storeNotice.create({ data }))
}))

// Access logs
router.get('/:storeId/access-logs', wrap(async (req, res) => {
  res.json(await prisma.storeAccessLog.findMany({ where: { storeId: Number(req.params.storeId) } }))
}))

export default router
