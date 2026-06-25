<template>
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
      <h1>Trabajadores</h1>
      <button @click="openCreate" style="background:#2563eb;color:#fff;padding:.5rem 1rem;border:none;border-radius:6px;cursor:pointer;">
        + Nuevo trabajador
      </button>
    </div>

    <div v-if="error" style="background:#fee2e2;color:#991b1b;padding:1rem;border-radius:8px;margin-bottom:1rem;">{{ error }}</div>
    <div v-if="loading" style="padding:2rem;text-align:center;color:#6b7280;">Cargando trabajadores...</div>
    <div v-else-if="!workers.length && !error" style="padding:2rem;text-align:center;color:#6b7280;">No hay trabajadores registrados.</div>

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
          <td style="padding:.75rem 1rem;display:flex;gap:.25rem;">
            <button @click="openEdit(w)" style="background:#dbeafe;color:#1d4ed8;border:none;padding:.25rem .5rem;border-radius:4px;cursor:pointer;font-size:.8rem;">
              Editar
            </button>
            <button @click="deleteWorker(w.id)" style="background:#fee2e2;color:#991b1b;border:none;padding:.25rem .5rem;border-radius:4px;cursor:pointer;font-size:.8rem;">
              Eliminar
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
    <div v-if="showForm" style="position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:50;">
      <div style="background:#fff;padding:2rem;border-radius:12px;width:540px;max-height:90vh;overflow-y:auto;">
        <h2 style="margin-bottom:1rem;">{{ editId ? 'Editar trabajador' : 'Nuevo trabajador' }}</h2>
        <div v-if="formError" style="background:#fee2e2;color:#991b1b;padding:.5rem .75rem;border-radius:6px;margin-bottom:.75rem;font-size:.85rem;">{{ formError }}</div>
        <form @submit.prevent="saveWorker">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;">
            <div>
              <label style="display:block;font-size:.85rem;margin-bottom:.25rem;">Nombre completo</label>
              <input v-model="form.nombre" required style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;">
            </div>
            <div>
              <label style="display:block;font-size:.85rem;margin-bottom:.25rem;">DNI</label>
              <input v-model="form.dni" required style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;">
            </div>
            <div>
              <label style="display:block;font-size:.85rem;margin-bottom:.25rem;">Email</label>
              <input v-model="form.email" type="email" required style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;">
            </div>
            <div>
              <label style="display:block;font-size:.85rem;margin-bottom:.25rem;">Teléfono</label>
              <input v-model="form.telefono" required style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;">
            </div>
            <div>
              <label style="display:block;font-size:.85rem;margin-bottom:.25rem;">Fecha nacimiento</label>
              <input v-model="form.fechaNacimiento" type="date" required style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;">
            </div>
            <div>
              <label style="display:block;font-size:.85rem;margin-bottom:.25rem;">Género</label>
              <select v-model="form.genero" required style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;">
                <option value="">— Selecciona —</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label style="display:block;font-size:.85rem;margin-bottom:.25rem;">Cargo</label>
              <input v-model="form.cargo" required style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;">
            </div>
            <div>
              <label style="display:block;font-size:.85rem;margin-bottom:.25rem;">Fecha ingreso</label>
              <input v-model="form.fechaIngreso" type="date" required style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;">
            </div>
            <div>
              <label style="display:block;font-size:.85rem;margin-bottom:.25rem;">Salario</label>
              <input v-model="form.salario" type="number" step="0.01" required style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;">
            </div>
            <div>
              <label style="display:block;font-size:.85rem;margin-bottom:.25rem;">Tipo contrato</label>
              <select v-model="form.tipoContrato" required style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;">
                <option value="">— Selecciona —</option>
                <option value="indefinido">Indefinido</option>
                <option value="temporal">Temporal</option>
                <option value="practicante">Practicante</option>
              </select>
            </div>
            <div>
              <label style="display:block;font-size:.85rem;margin-bottom:.25rem;">Rol</label>
              <select v-model="form.roleId" style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;">
                <option value="">— Sin rol —</option>
                <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.nombre }}</option>
              </select>
            </div>
            <div>
              <label style="display:block;font-size:.85rem;margin-bottom:.25rem;">Sede</label>
              <select v-model="form.sedeId" style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;">
                <option value="">— Sin sede —</option>
                <option v-for="s in sedes" :key="s.id" :value="s.id">{{ s.nombre }}</option>
              </select>
            </div>
            <div style="grid-column:1/-1;">
              <label style="display:block;font-size:.85rem;margin-bottom:.25rem;">Estado</label>
              <select v-model="form.estado" style="width:100%;padding:.5rem;border:1px solid #ddd;border-radius:6px;">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:1rem;">
            <button type="button" @click="showForm = false; formError = ''" style="padding:.5rem 1rem;border:1px solid #ddd;border-radius:6px;cursor:pointer;">Cancelar</button>
            <button type="submit" :disabled="saving" style="background:#2563eb;color:#fff;padding:.5rem 1rem;border:none;border-radius:6px;cursor:pointer;">
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
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
const authHeader = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' })

const workers = ref([])
const roles = ref([])
const sedes = ref([])
const loading = ref(true)
const error = ref('')
const showForm = ref(false)
const formError = ref('')
const saving = ref(false)
const editId = ref(null)
const form = ref({})

const blankForm = () => ({
  nombre: '', dni: '', email: '', telefono: '',
  fechaNacimiento: '', genero: '', cargo: '',
  fechaIngreso: '', salario: '', tipoContrato: '',
  roleId: '', sedeId: '', estado: 'activo'
})

async function fetchWorkers() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`${API}/api/workers`, { headers: authHeader() })
    if (!res.ok) throw new Error('Error al cargar trabajadores')
    workers.value = await res.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function fetchSupport() {
  const [r, s] = await Promise.all([
    fetch(`${API}/api/roles`, { headers: authHeader() }).then(r => r.json()).catch(() => []),
    fetch(`${API}/api/sedes`, { headers: authHeader() }).then(r => r.json()).catch(() => []),
  ])
  roles.value = r
  sedes.value = s
}

function openCreate() {
  editId.value = null
  form.value = blankForm()
  formError.value = ''
  showForm.value = true
}

function openEdit(w) {
  editId.value = w.id
  form.value = {
    nombre: w.nombre ?? '',
    dni: w.dni ?? '',
    email: w.email ?? '',
    telefono: w.telefono ?? '',
    fechaNacimiento: w.fechaNacimiento?.slice(0, 10) ?? '',
    genero: w.genero ?? '',
    cargo: w.cargo ?? '',
    fechaIngreso: w.fechaIngreso?.slice(0, 10) ?? '',
    salario: w.salario ?? '',
    tipoContrato: w.tipoContrato ?? '',
    roleId: w.roleId ?? '',
    sedeId: w.sedeId ?? '',
    estado: w.estado ?? 'activo',
  }
  formError.value = ''
  showForm.value = true
}

async function saveWorker() {
  saving.value = true
  formError.value = ''
  const body = { ...form.value }
  if (body.roleId === '' || body.roleId == null) delete body.roleId
  else body.roleId = Number(body.roleId)
  if (body.sedeId === '' || body.sedeId == null) delete body.sedeId
  else body.sedeId = Number(body.sedeId)
  if (body.salario) body.salario = Number(body.salario)

  try {
    const url = editId.value ? `${API}/api/workers/${editId.value}` : `${API}/api/workers`
    const method = editId.value ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: authHeader(),
      body: JSON.stringify(body)
    })
    const data = await res.json()
    if (!res.ok) { formError.value = data.error ?? 'Error al guardar'; return }
    showForm.value = false
    fetchWorkers()
  } catch {
    formError.value = 'Error de conexión'
  } finally {
    saving.value = false
  }
}

async function deleteWorker(id) {
  if (!confirm('¿Eliminar trabajador?')) return
  try {
    const res = await fetch(`${API}/api/workers/${id}`, { method: 'DELETE', headers: authHeader() })
    if (!res.ok) throw new Error('Error al eliminar')
    fetchWorkers()
  } catch (e) {
    error.value = e.message
  }
}

onMounted(() => { fetchSupport(); fetchWorkers() })
</script>
