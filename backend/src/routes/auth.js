import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { name, email, password: hashed } })
    res.status(201).json({ id: user.id, name: user.name, email: user.email })
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Email ya registrado' })
    res.status(500).json({ error: 'Error interno' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '8h' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch {
    res.status(500).json({ error: 'Error interno' })
  }
})

export default router
