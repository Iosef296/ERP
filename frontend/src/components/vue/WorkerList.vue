<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
      <h1>Trabajadores</h1>
      <button @click="showForm = true" style="background:#2563eb;color:#fff;padding:.5rem 1rem;border:none;border-radius:6px;cursor:pointer;">
        + Nuevo trabajador
      </button>
    </div>

    <div v-if="loading">Cargando...</div>

    <table v-else style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.1);">
      <thead style="background:#f1f5f9;">
        <tr>
          <th style="padding:.75rem 1rem;text-align:left;">Nombre</th>
          <th style="padding:.75rem 1rem;text-align:left;">DNI</th>
          <th style="padding:.75rem 1rem;text-align:left;">Cargo</th>
          <th style="padding:.75rem 1rem;text-align:left;">Estado</th>
          <th style="padding:.75rem 1rem;text-align:left;">Rol</th>
          <th style="padding:.75rem 1rem;text-align:left;">Sede</th>
          <th style="padding:.75rem 1rem;"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="w in workers" :key="w.id" style="border-top:1px solid #e2e8f0;">
          <td style="padding:.75rem 1rem;">{{ w.nombre }}</td>
          <td style="padding:.75rem 1rem;">{{ w.dni }}</td>
          <td style="padding:.75rem 1rem;">{{ w.cargo }}</td>
          <td style="padding:.75rem 1rem;">
            <span :style="{ background: w.estado === 'activo' ? '#d1fae5' : '#fee2e2', color: w.estado === 'activo' ? '#065f46' : '#991b1b', padding: '2px 8px', borderRadius: '12px', fontSize: '.8rem' }">
              {{ w.estado }}
            </span>
          </td>
          <td style="padding:.75rem 1rem;">{{ w.role?.nombre ?? '—' }}</td>
          <td style="padding:.75rem 1rem;">{{ w.sede?.nombre ?? '—' }}</td>
          <td style="padding:.75rem 1rem;">
            <button @click="deleteWorker(w.id)" style="background:#fee2e2;color:#991b1b;border:none;padding:.25rem .5rem;border-radius:4px;cursor:pointer;">
              Eliminar
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal form -->
    <div v-if="showForm" style="position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:50;">
      <div style="background:#fff;padding:2rem;border-radius:12px;width:500px;max-height:90vh;overflow-y:auto;">
        <h2 style="margin-bottom:1rem;">Nuevo trabajador</h2>
        <form @submit.prevent="createWorker">
          <div v-for="field in fields" :key="field.key" style="margin-bottom:.75rem;">
            <label style="display:block;font-size:.85rem;margin-bottom:.25rem;">{{ field.label }}</label>
            <input v-model="form[field.key]" :type="field.type ?? 'text'" :required="field.required"
              style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;" />
          </div>
          <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:1rem;">
            <button type="button" @click="showForm = false" style="padding:.5rem 1rem;border:1px solid #ddd;border-radius:6px;cursor:pointer;">Cancelar</button>
            <button type="submit" style="background:#2563eb;color:#fff;padding:.5rem 1rem;border:none;border-radius:6px;cursor:pointer;">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const API = import.meta.env.PUBLIC_API_URL
const token = () => localStorage.getItem('token')

const workers = ref([])
const loading = ref(true)
const showForm = ref(false)
const form = ref({})

const fields = [
  { key: 'nombre', label: 'Nombre completo', required: true },
  { key: 'dni', label: 'DNI', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'telefono', label: 'Teléfono', required: true },
  { key: 'fechaNacimiento', label: 'Fecha nacimiento', type: 'date', required: true },
  { key: 'genero', label: 'Género', required: true },
  { key: 'cargo', label: 'Cargo', required: true },
  { key: 'fechaIngreso', label: 'Fecha ingreso', type: 'date', required: true },
  { key: 'salario', label: 'Salario', type: 'number', required: true },
  { key: 'tipoContrato', label: 'Tipo contrato', required: true },
]

async function fetchWorkers() {
  const res = await fetch(`${API}/api/workers`, { headers: { Authorization: `Bearer ${token()}` } })
  workers.value = await res.json()
  loading.value = false
}

async function createWorker() {
  await fetch(`${API}/api/workers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify(form.value)
  })
  form.value = {}
  showForm.value = false
  fetchWorkers()
}

async function deleteWorker(id) {
  if (!confirm('¿Eliminar trabajador?')) return
  await fetch(`${API}/api/workers/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } })
  fetchWorkers()
}

onMounted(fetchWorkers)
</script>
