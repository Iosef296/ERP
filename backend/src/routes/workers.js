import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

router.get('/', async (req, res, next) => {
  try {
    res.json(await prisma.worker.findMany({ include: { role: true, sede: true } }))
  } catch (e) { next(e) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { id: Number(req.params.id) },
      include: { role: true, sede: true }
    })
    if (!worker) return res.status(404).json({ error: 'Worker no encontrado' })
    res.json(worker)
  } catch (e) { next(e) }
})

function cleanWorkerBody(body) {
  const data = {}
  const strFields = ['nombre','dni','email','telefono','genero','direccion','cargo','tipoContrato','estado','observaciones']
  const dateFields = ['fechaNacimiento','fechaIngreso']
  strFields.forEach(k => { if (body[k] != null && body[k] !== '') data[k] = String(body[k]) })
  dateFields.forEach(k => { if (body[k]) data[k] = new Date(body[k]) })
  if (body.salario != null && body.salario !== '') data.salario = Number(body.salario)
  if (body.roleId != null && body.roleId !== '' && body.roleId !== 0) data.roleId = Number(body.roleId)
  if (body.sedeId != null && body.sedeId !== '' && body.sedeId !== 0) data.sedeId = Number(body.sedeId)
  return data
}

router.post('/', async (req, res, next) => {
  try {
    const worker = await prisma.worker.create({ data: cleanWorkerBody(req.body) })
    res.status(201).json(worker)
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'DNI o email duplicado' })
    next(e)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const worker = await prisma.worker.update({
      where: { id: Number(req.params.id) },
      data: cleanWorkerBody(req.body)
    })
    res.json(worker)
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'DNI o email duplicado' })
    next(e)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.worker.delete({ where: { id: Number(req.params.id) } })
    res.status(204).send()
  } catch (e) { next(e) }
})

export default router
