import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.js'
import workerRoutes from './routes/workers.js'
import roleRoutes from './routes/roles.js'
import sedeRoutes from './routes/sedes.js'
import clienteRoutes from './routes/clientes.js'
import productoRoutes from './routes/productos.js'
import ventaRoutes from './routes/ventas.js'
import cotizacionRoutes from './routes/cotizaciones.js'
import inventarioRoutes from './routes/inventario.js'
import storeRoutes from './routes/store.js'
import produccionRoutes from './routes/produccion.js'
import controlRoutes from './routes/control.js'

const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/workers', workerRoutes)
app.use('/api/roles', roleRoutes)
app.use('/api/sedes', sedeRoutes)
app.use('/api/clientes', clienteRoutes)
app.use('/api/productos', productoRoutes)
app.use('/api/ventas', ventaRoutes)
app.use('/api/cotizaciones', cotizacionRoutes)
app.use('/api/inventario', inventarioRoutes)
app.use('/api/store', storeRoutes)
app.use('/api/produccion', produccionRoutes)
app.use('/api/control', controlRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Backend corriendo en http://localhost:${PORT}`))
