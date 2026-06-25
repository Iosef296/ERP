<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
      <h1>Inventario</h1>
      <div style="display:flex;gap:.5rem;">
        <button @click="openCreate" style="background:#8b5cf6;color:#fff;padding:.5rem 1rem;border:none;border-radius:6px;cursor:pointer;">
          + Agregar producto
        </button>
      </div>
    </div>

    <div v-if="error" style="background:#fee2e2;color:#991b1b;padding:1rem;border-radius:8px;margin-bottom:1rem;">{{ error }}</div>

    <div style="display:flex;gap:1rem;margin-bottom:1rem;align-items:center;">
      <input v-model="search" placeholder="Buscar por nombre o SKU..." style="padding:.5rem;border:1px solid #ddd;border-radius:6px;width:280px;" />
      <span style="color:#6b7280;font-size:.85rem;">{{ filtered.length }} productos</span>
    </div>

    <div v-if="loading" style="padding:2rem;text-align:center;color:#6b7280;">Cargando inventario...</div>
    <div v-else-if="!products.length && !error" style="padding:2rem;text-align:center;color:#6b7280;">No hay productos registrados.</div>

    <table v-else style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.1);">
      <thead style="background:#f1f5f9;">
        <tr>
          <th style="padding:.75rem 1rem;text-align:left;">Nombre</th>
          <th style="padding:.75rem 1rem;text-align:left;">SKU</th>
          <th style="padding:.75rem 1rem;text-align:left;">Categoría</th>
          <th style="padding:.75rem 1rem;text-align:right;">Precio</th>
          <th style="padding:.75rem 1rem;text-align:right;">Stock</th>
          <th style="padding:.75rem 1rem;"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in filtered" :key="p.id" style="border-top:1px solid #e2e8f0;">
          <td style="padding:.75rem 1rem;font-weight:600;">{{ p.name }}</td>
          <td style="padding:.75rem 1rem;color:#6b7280;font-size:.85rem;">{{ p.sku }}</td>
          <td style="padding:.75rem 1rem;">{{ p.category?.name ?? '—' }}</td>
          <td style="padding:.75rem 1rem;text-align:right;font-weight:600;">S/ {{ Number(p.price).toFixed(2) }}</td>
          <td style="padding:.75rem 1rem;text-align:right;">
            <span :style="{ color: Number(p.stock) < 10 ? '#ef4444' : '#10b981', fontWeight: '600' }">{{ p.stock }}</span>
          </td>
          <td style="padding:.75rem 1rem;display:flex;gap:.25rem;">
            <button @click="openEdit(p)" style="background:#dbeafe;color:#1d4ed8;border:none;padding:.25rem .5rem;border-radius:4px;cursor:pointer;font-size:.8rem;">Editar</button>
            <button @click="deleteProduct(p.id)" style="background:#fee2e2;color:#991b1b;border:none;padding:.25rem .5rem;border-radius:4px;cursor:pointer;font-size:.8rem;">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
    <div v-if="showForm" style="position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:50;">
      <div style="background:#fff;padding:2rem;border-radius:12px;width:420px;">
        <h2 style="margin-bottom:1rem;">{{ editId ? 'Editar producto' : 'Nuevo producto' }}</h2>
        <div v-if="formError" style="background:#fee2e2;color:#991b1b;padding:.5rem .75rem;border-radius:6px;margin-bottom:.75rem;font-size:.85rem;">{{ formError }}</div>
        <form @submit.prevent="saveProduct">
          <div style="margin-bottom:.5rem;">
            <label style="display:block;font-size:.85rem;margin-bottom:.25rem;">Nombre</label>
            <input v-model="form.name" required style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;" />
          </div>
          <div style="margin-bottom:.5rem;">
            <label style="display:block;font-size:.85rem;margin-bottom:.25rem;">SKU</label>
            <input v-model="form.sku" required :disabled="!!editId" style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;" />
          </div>
          <div style="margin-bottom:.5rem;">
            <label style="display:block;font-size:.85rem;margin-bottom:.25rem;">Precio (S/)</label>
            <input v-model.number="form.price" type="number" step="0.01" min="0" required style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;" />
          </div>
          <div style="margin-bottom:.5rem;">
            <label style="display:block;font-size:.85rem;margin-bottom:.25rem;">Stock</label>
            <input v-model.number="form.stock" type="number" min="0" style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;" />
          </div>
          <div style="margin-bottom:1rem;">
            <label style="display:block;font-size:.85rem;margin-bottom:.25rem;">Categoría (opcional)</label>
            <select v-model="form.categoryId" style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;">
              <option :value="null">— Sin categoría —</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div style="display:flex;gap:.5rem;justify-content:flex-end;">
            <button type="button" @click="showForm = false; formError = ''" style="padding:.5rem 1rem;border:1px solid #ddd;border-radius:6px;cursor:pointer;">Cancelar</button>
            <button type="submit" :disabled="saving" style="background:#8b5cf6;color:#fff;padding:.5rem 1rem;border:none;border-radius:6px;cursor:pointer;">
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const API = import.meta.env.PUBLIC_API_URL
const token = () => localStorage.getItem('token')
const authH = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' })

const products = ref([])
const categories = ref([])
const search = ref('')
const showForm = ref(false)
const formError = ref('')
const error = ref('')
const loading = ref(true)
const saving = ref(false)
const editId = ref(null)
const form = ref({ name: '', sku: '', price: 0, stock: 0, categoryId: null })

const filtered = computed(() =>
  products.value.filter(p =>
    p.name.toLowerCase().includes(search.value.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.value.toLowerCase())
  )
)

async function fetchAll() {
  loading.value = true; error.value = ''
  try {
    const [pRes, cRes] = await Promise.all([
      fetch(`${API}/api/inventario/products`, { headers: authH() }),
      fetch(`${API}/api/inventario/categories`, { headers: authH() }),
    ])
    if (!pRes.ok) throw new Error('Error al cargar inventario')
    products.value = await pRes.json()
    categories.value = cRes.ok ? await cRes.json() : []
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editId.value = null
  form.value = { name: '', sku: '', price: 0, stock: 0, categoryId: null }
  formError.value = ''
  showForm.value = true
}

function openEdit(p) {
  editId.value = p.id
  form.value = { name: p.name, sku: p.sku, price: Number(p.price), stock: Number(p.stock), categoryId: p.categoryId ?? null }
  formError.value = ''
  showForm.value = true
}

async function saveProduct() {
  saving.value = true; formError.value = ''
  const body = { ...form.value }
  if (!body.categoryId) delete body.categoryId
  try {
    const url = editId.value ? `${API}/api/inventario/products/${editId.value}` : `${API}/api/inventario/products`
    const method = editId.value ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: authH(), body: JSON.stringify(body) })
    const data = await res.json()
    if (!res.ok) { formError.value = data.error ?? 'Error al guardar'; return }
    showForm.value = false
    fetchAll()
  } catch { formError.value = 'Error de conexión' }
  finally { saving.value = false }
}

async function deleteProduct(id) {
  if (!confirm('¿Eliminar este producto del inventario?')) return
  try {
    await fetch(`${API}/api/inventario/products/${id}`, { method: 'DELETE', headers: authH() })
    fetchAll()
  } catch { error.value = 'Error al eliminar' }
}

onMounted(fetchAll)
</script>
