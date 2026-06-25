import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

const wrap = fn => async (req, res, next) => { try { await fn(req, res, next) } catch (e) { next(e) } }

router.get('/', wrap(async (req, res) => {
  res.json(await prisma.cliente.findMany())
}))

router.get('/:id', wrap(async (req, res) => {
  const c = await prisma.cliente.findUnique({
    where: { id: Number(req.params.id) },
    include: { ventaCabeceras: true, cotizacionCabeceras: true }
  })
  if (!c) return res.status(404).json({ error: 'Cliente no encontrado' })
  res.json(c)
}))

router.post('/', wrap(async (req, res) => {
  const { nombre, email, telefono, documentoNumero, direccion } = req.body
  const data = {}
  if (nombre) data.nombre = String(nombre)
  if (email) data.email = String(email)
  if (telefono) data.telefono = String(telefono)
  if (documentoNumero) data.documentoNumero = String(documentoNumero)
  if (direccion) data.direccion = String(direccion)
  res.status(201).json(await prisma.cliente.create({ data }))
}))

router.put('/:id', wrap(async (req, res) => {
  const { nombre, email, telefono, documentoNumero, direccion } = req.body
  const data = {}
  if (nombre != null) data.nombre = String(nombre)
  if (email != null) data.email = String(email)
  if (telefono != null) data.telefono = String(telefono)
  if (documentoNumero != null) data.documentoNumero = String(documentoNumero)
  if (direccion != null) data.direccion = String(direccion)
  res.json(await prisma.cliente.update({ where: { id: Number(req.params.id) }, data }))
}))

router.delete('/:id', wrap(async (req, res) => {
  await prisma.cliente.delete({ where: { id: Number(req.params.id) } })
  res.status(204).send()
}))

export default router
