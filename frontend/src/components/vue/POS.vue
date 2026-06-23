<template>
  <div style="display:grid;grid-template-columns:1fr 380px;gap:1.5rem;height:calc(100vh - 4rem);">
    <!-- Productos -->
    <div style="background:#fff;border-radius:10px;padding:1.5rem;overflow-y:auto;box-shadow:0 1px 4px rgba(0,0,0,.1);">
      <h2 style="margin-bottom:1rem;">Productos</h2>
      <input v-model="search" placeholder="Buscar producto..." style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;margin-bottom:1rem;" />
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.75rem;">
        <div v-for="p in filteredProducts" :key="p.id" @click="addToCart(p)"
          style="border:1px solid #e2e8f0;border-radius:8px;padding:1rem;cursor:pointer;transition:box-shadow .2s;"
          onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,.1)'"
          onmouseout="this.style.boxShadow='none'">
          <div style="font-weight:600;font-size:.9rem;">{{ p.name }}</div>
          <div style="color:#6b7280;font-size:.8rem;">{{ p.sku }}</div>
          <div style="margin-top:.5rem;font-weight:700;color:#2563eb;">S/ {{ p.price }}</div>
          <div style="font-size:.75rem;color:#9ca3af;">Stock: {{ p.stockQuantity }} {{ p.unitOfMeasure }}</div>
        </div>
      </div>
    </div>

    <!-- Carrito -->
    <div style="background:#fff;border-radius:10px;padding:1.5rem;display:flex;flex-direction:column;box-shadow:0 1px 4px rgba(0,0,0,.1);">
      <h2 style="margin-bottom:.5rem;">Orden actual</h2>

      <div style="margin-bottom:.75rem;">
        <label style="font-size:.85rem;">Cliente</label>
        <select v-model="clienteId" style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;margin-top:.25rem;">
          <option value="">Sin cliente</option>
          <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <div style="flex:1;overflow-y:auto;">
        <div v-if="cart.length === 0" style="color:#9ca3af;text-align:center;padding:2rem;">
          Agrega productos al carrito
        </div>
        <div v-for="item in cart" :key="item.id" style="display:flex;align-items:center;gap:.5rem;padding:.5rem 0;border-bottom:1px solid #f1f5f9;">
          <div style="flex:1;font-size:.85rem;">{{ item.name }}</div>
          <input type="number" v-model.number="item.qty" min="1" @change="updateSubtotal(item)"
            style="width:60px;padding:.25rem;border:1px solid #ddd;border-radius:4px;text-align:center;" />
          <div style="width:70px;text-align:right;font-weight:600;">S/ {{ item.subtotal }}</div>
          <button @click="removeFromCart(item.id)" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:1rem;">✕</button>
        </div>
      </div>

      <div style="border-top:2px solid #e2e8f0;padding-top:1rem;margin-top:1rem;">
        <div style="display:flex;justify-content:space-between;font-size:1.2rem;font-weight:700;margin-bottom:1rem;">
          <span>Total</span><span>S/ {{ total.toFixed(2) }}</span>
        </div>

        <div style="margin-bottom:.75rem;">
          <label style="font-size:.85rem;">Método de pago</label>
          <select v-model="metodoPago" style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;margin-top:.25rem;">
            <option>Efectivo</option>
            <option>Tarjeta</option>
            <option>Transferencia</option>
            <option>Yape/Plin</option>
          </select>
        </div>

        <button @click="procesarVenta" :disabled="cart.length === 0 || procesando"
          style="width:100%;padding:.75rem;background:#10b981;color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;opacity:1;"
          :style="{ opacity: cart.length === 0 ? '.5' : '1' }">
          {{ procesando ? 'Procesando...' : 'Cobrar' }}
        </button>

        <div v-if="mensaje" style="margin-top:.75rem;padding:.5rem;border-radius:6px;" :style="{ background: exito ? '#d1fae5' : '#fee2e2', color: exito ? '#065f46' : '#991b1b' }">
          {{ mensaje }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const API = import.meta.env.PUBLIC_API_URL
const token = () => localStorage.getItem('token')

const productos = ref([])
const clientes = ref([])
const cart = ref([])
const clienteId = ref('')
const metodoPago = ref('Efectivo')
const search = ref('')
const procesando = ref(false)
const mensaje = ref('')
const exito = ref(false)

const filteredProducts = computed(() =>
  productos.value.filter(p => p.name.toLowerCase().includes(search.value.toLowerCase()) || p.sku.includes(search.value))
)

const total = computed(() => cart.value.reduce((s, i) => s + i.subtotal, 0))

function addToCart(p) {
  const existing = cart.value.find(i => i.id === p.id)
  if (existing) { existing.qty++; existing.subtotal = +(existing.qty * existing.price).toFixed(2); return }
  cart.value.push({ id: p.id, name: p.name, price: +p.price, qty: 1, subtotal: +p.price })
}

function updateSubtotal(item) {
  item.subtotal = +(item.qty * item.price).toFixed(2)
}

function removeFromCart(id) {
  cart.value = cart.value.filter(i => i.id !== id)
}

async function procesarVenta() {
  procesando.value = true
  mensaje.value = ''
  try {
    const res = await fetch(`${API}/api/ventas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({
        clienteId: clienteId.value || null,
        detalles: cart.value.map(i => ({ productoId: i.id, cantidad: i.qty, precioUnitario: i.price, subtotal: i.subtotal })),
        pagos: [{ monto: total.value, metodoPago: metodoPago.value }]
      })
    })
    if (res.ok) {
      exito.value = true
      mensaje.value = `Venta registrada correctamente`
      cart.value = []
      clienteId.value = ''
    } else {
      exito.value = false
      mensaje.value = 'Error al procesar la venta'
    }
  } catch {
    exito.value = false
    mensaje.value = 'Error de conexión'
  }
  procesando.value = false
}

onMounted(async () => {
  const [pRes, cRes] = await Promise.all([
    fetch(`${API}/api/productos`, { headers: { Authorization: `Bearer ${token()}` } }),
    fetch(`${API}/api/clientes`, { headers: { Authorization: `Bearer ${token()}` } })
  ])
  productos.value = await pRes.json()
  clientes.value = await cRes.json()
})
</script>
