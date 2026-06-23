<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
      <h1>Inventario</h1>
      <button @click="showForm = true" style="background:#8b5cf6;color:#fff;padding:.5rem 1rem;border:none;border-radius:6px;cursor:pointer;">
        + Agregar producto
      </button>
    </div>

    <input v-model="search" placeholder="Buscar..." style="padding:.5rem;border:1px solid #ddd;border-radius:6px;width:300px;margin-bottom:1rem;" />

    <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.1);">
      <thead style="background:#f1f5f9;">
        <tr>
          <th style="padding:.75rem 1rem;text-align:left;">Nombre</th>
          <th style="padding:.75rem 1rem;text-align:left;">SKU</th>
          <th style="padding:.75rem 1rem;text-align:left;">Categoría</th>
          <th style="padding:.75rem 1rem;text-align:right;">Precio</th>
          <th style="padding:.75rem 1rem;text-align:right;">Stock</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in filtered" :key="p.id" style="border-top:1px solid #e2e8f0;">
          <td style="padding:.75rem 1rem;">{{ p.name }}</td>
          <td style="padding:.75rem 1rem;color:#6b7280;font-size:.85rem;">{{ p.sku }}</td>
          <td style="padding:.75rem 1rem;">{{ p.category?.name ?? '—' }}</td>
          <td style="padding:.75rem 1rem;text-align:right;font-weight:600;">S/ {{ p.price }}</td>
          <td style="padding:.75rem 1rem;text-align:right;">
            <span :style="{ color: p.stock < 10 ? '#ef4444' : '#10b981', fontWeight: '600' }">{{ p.stock }}</span>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showForm" style="position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:50;">
      <div style="background:#fff;padding:2rem;border-radius:12px;width:420px;">
        <h2 style="margin-bottom:1rem;">Nuevo producto</h2>
        <form @submit.prevent="createProduct">
          <input v-model="form.name" placeholder="Nombre" required style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;margin-bottom:.5rem;" />
          <input v-model="form.sku" placeholder="SKU" required style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;margin-bottom:.5rem;" />
          <input v-model.number="form.price" placeholder="Precio" type="number" step="0.01" required style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;margin-bottom:.5rem;" />
          <input v-model.number="form.stock" placeholder="Stock inicial" type="number" style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;margin-bottom:1rem;" />
          <div style="display:flex;gap:.5rem;justify-content:flex-end;">
            <button type="button" @click="showForm = false" style="padding:.5rem 1rem;border:1px solid #ddd;border-radius:6px;cursor:pointer;">Cancelar</button>
            <button type="submit" style="background:#8b5cf6;color:#fff;padding:.5rem 1rem;border:none;border-radius:6px;cursor:pointer;">Guardar</button>
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

const products = ref([])
const search = ref('')
const showForm = ref(false)
const form = ref({})

const filtered = computed(() =>
  products.value.filter(p => p.name.toLowerCase().includes(search.value.toLowerCase()) || p.sku.includes(search.value))
)

async function fetchProducts() {
  const res = await fetch(`${API}/api/inventario/products`, { headers: { Authorization: `Bearer ${token()}` } })
  products.value = await res.json()
}

async function createProduct() {
  await fetch(`${API}/api/inventario/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify(form.value)
  })
  form.value = {}
  showForm.value = false
  fetchProducts()
}

onMounted(fetchProducts)
</script>
