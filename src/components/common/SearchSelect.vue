<template>
  <div class="position-relative searchselect-root" ref="wrapperEl">
    <!-- Control -->
    <div
      class="form-control d-flex align-items-center position-relative searchselect-control"
      :class="[{ 'is-locked': isLocked }, validationClass]"
      style="cursor: text; min-height: 2.5rem;"
      @mousedown.prevent="onControlMouseDown"
    >
      <!-- Chips (multiple) -->
      <template v-if="isMultiple && selectedList.length">
        <span
          v-for="tag in selectedList"
          :key="tag.value"
          class="ss-chip"
          :title="String(tag.label)"
        >
          <span class="ss-chip__label">{{ tag.label }}</span>
          <button type="button" class="ss-chip__x" @click.stop="removeChip(tag.value)">×</button>
        </span>
      </template>

      <!-- Label bloqueado (single con valor) -->
      <span
        v-if="isLocked && !isMultiple"
        class="ss-locked-label"
        :title="selectedList[0]?.label || ''"
      >
        {{ selectedList[0]?.label || '' }}
      </span>

      <!-- Input (cuando no está bloqueado o es multiple) -->
      <input
        v-else
        autocomplete="off"
        type="text"
        class="border-0 p-0 bg-transparent searchselect-input"
        :placeholder="placeholder"
        v-model="searchText"
        :disabled="isLocked && !isMultiple"
        @focus="openDropdown"
        @input="onInputChange"
        :aria-invalid="required && !isLocked"
        style="outline: none; box-shadow: none;"
      />


      <!-- Spinner (absoluto) -->
      <span
        v-if="showSpinner"
        class="spinner searchselect-affordance"
        aria-hidden="true"
      ></span>

      <!-- Botón limpiar (single) -->
      <button
        v-if="!isMultiple && isLocked"
        type="button"
        class="btn-clear searchselect-affordance"
        @click.stop="clearSelection"
        aria-label="Borrar selección"
        title="Borrar"
      >
        ×
      </button>

      <!-- Botón limpiar todo (multiple) -->
      <button
        v-if="isMultiple && selectedList.length"
        type="button"
        class="btn-clear-all searchselect-affordance"
        @click.stop="clearAll"
        aria-label="Borrar todas"
        title="Borrar todas"
      >
        ×
      </button>
    </div>

    <!-- Dropdown -->
    <div
      v-if="dropdownOpen && (!isLocked || isMultiple)"
      class="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
      :class="validationClass"
      :style="{ zIndex: 2000, maxHeight: dropdownMaxHeight + 'px', overflowY: 'auto' }"
      role="listbox"
    >
      <div v-if="isRemote && searchTextTrim.length < minChars" class="px-3 py-2 text-muted small">
        Escribe al menos {{ minChars }} caracteres…
      </div>

      <div v-else-if="isRemote && loading" class="px-3 py-2 small d-flex align-items-center gap-2">
        <span class="spinner"></span>
        Cargando…
      </div>

      <div v-else-if="listItems.length === 0" class="px-3 py-2 text-muted small">
        No se encontraron resultados
      </div>

      <button v-if="!loading"
        v-for="opt in listItems"
        :key="opt[valueField]"
        type="button"
        class="w-100 text-start px-3 py-2 dropdown-item-option"
        @click="selectOption(opt)"
        role="option"
      >
        <div class="fw-semibold" style="font-size: .8rem;">
          {{ opt[labelField] }}
        </div>
        <div v-if="showSubValue" class="text-muted" style="font-size: .7rem;">
          {{ opt[valueField] }}
        </div>
      </button>
    </div>

    <div v-if="hint" class="form-text text-muted" style="font-size: .75rem;">
      {{ hint }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  labelField: { type: String, required: true },
  valueField: { type: String, required: true },
  modelValue: { default: null },                // single: value | null, multiple: Array<value>
  placeholder: { type: String, default: 'Seleccionar / Buscar...' },
  hint: { type: String, default: '' },
  showSubValue: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },

  mode: { type: String, default: 'local' },     // 'local' | 'remote'
  fetcher: { type: Function, default: null },   // async (q) => Promise<Array>
  debounceMs: { type: Number, default: 300 },
  minChars: { type: Number, default: 2 },
  cache: { type: Boolean, default: true },
  cacheNs: { type: [String, Number], default: '' },
  maxVisibleItems: { type: Number, default: 5 }, // cantidad visible antes del scroll
  itemHeightPx: { type: Number, default: 36 },   // alto estimado por opción (px)
})
const emit = defineEmits(['update:modelValue', 'change', 'search'])

const dropdownOpen = ref(false)
const searchText = ref('')
const wrapperEl = ref(null)

const isMultiple = computed(() => !!props.multiple)
const isRemote = computed(() => props.mode === 'remote')
const searchTextTrim = computed(() => (searchText.value || '').trim())

const loading = ref(false)
const remoteItems = ref([])
const cacheMap = ref(new Map())
let debounceTimer = null
let requestId = 0

const safeItems = computed(() => Array.isArray(props.items) ? props.items : [])
const selectedList = ref([])

const isLocked = computed(() =>
  !isMultiple.value && props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== ''
)

const validationClass = computed(() => {
  if (!props.required) return ''
  if (isMultiple.value) return selectedList.value.length > 0 ? 'has-success' : 'has-error'
  return isLocked.value ? 'has-success' : 'has-error'
})

const showSpinner = computed(() => isRemote.value && loading.value && (!isLocked.value || isMultiple.value))

const listItems = computed(() => {
  if (!dropdownOpen.value) return []
  const base = isRemote.value ? remoteItems.value : safeItems.value
  const filtered = isMultiple.value
    ? base.filter(i => !selectedList.value.some(s => s.value === i[props.valueField]))
    : base
  if (!isRemote.value) {
    const t = searchTextTrim.value.toLowerCase()
    if (!t) return filtered
    return filtered.filter(item =>
      String(item[props.labelField] ?? '').toLowerCase().includes(t)
    )
  }
  return filtered
})

watch(
  () => props.modelValue,
  (val) => {
    const toTag = (o) => ({ value: o?.[props.valueField], label: o?.[props.labelField], raw: o })
    if (isMultiple.value) {
      const values = Array.isArray(val) ? val : []
      const source = isRemote.value ? remoteItems.value.concat(safeItems.value) : safeItems.value
      selectedList.value = values.map(v => {
        const match = source.find(o => o?.[props.valueField] === v)
        return match ? toTag(match) : { value: v, label: String(v), raw: null }
      })
      searchText.value = ''
    } else {
      if (val === null || val === undefined || val === '') {
        selectedList.value = []; searchText.value = ''; return
      }
      const source = isRemote.value ? remoteItems.value.concat(safeItems.value) : safeItems.value
      const match = source.find(o => o?.[props.valueField] === val)
      selectedList.value = match ? [toTag(match)] : [{ value: val, label: String(val), raw: null }]
      searchText.value = selectedList.value[0]?.label ?? ''
    }
  },
  { immediate: true }
)

function handleClickOutside(e) {
  if (!wrapperEl.value) return
  if (!wrapperEl.value.contains(e.target)) dropdownOpen.value = false
}
onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))

function openDropdown() {
  if (isLocked.value && !isMultiple.value) return
  dropdownOpen.value = true
  if (isRemote.value) queueRemoteSearch()
}
function onControlMouseDown(e) {
  if (isLocked.value && !isMultiple.value) { e.preventDefault(); return }
  e.preventDefault()
  nextTick(() => {
    wrapperEl.value?.querySelector('.searchselect-input')?.focus()
    dropdownOpen.value = true
  })
}
function onInputChange() {
  if (isLocked.value && !isMultiple.value) return
  dropdownOpen.value = true
  if (isRemote.value) queueRemoteSearch()
}

function queueRemoteSearch() {
  const q = searchTextTrim.value
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => doRemoteSearch(q), props.debounceMs)
}
async function doRemoteSearch(q) {
  if (!props.fetcher || q.length < props.minChars) {
    remoteItems.value = []; loading.value = false; return
  }
  emit('search', q)

  const key = `${props.cacheNs}::${q}`
  if (props.cache && cacheMap.value.has(key)) {
    remoteItems.value = cacheMap.value.get(key) || []; return
  }

  const myReq = ++requestId
  loading.value = true
  try {
    const res = await props.fetcher(q)
    if (myReq !== requestId) return
    const arr = Array.isArray(res) ? res : []
    remoteItems.value = arr
    if (props.cache) cacheMap.value.set(key, arr)
  } catch (e) {
    console.error('SearchSelect fetcher error:', e)
    remoteItems.value = []
  } finally {
    if (myReq === requestId) loading.value = false
  }
}

function selectOption(option) {
  const tag = { value: option[props.valueField], label: option[props.labelField], raw: option }
  if (isMultiple.value) {
    if (!selectedList.value.some(s => s.value === tag.value)) {
      const next = [...selectedList.value, tag]
      selectedList.value = next
      emit('update:modelValue', next.map(s => s.value))
      emit('change', { type: 'add', option })
    }
    searchText.value = ''
    if (isRemote.value) queueRemoteSearch()
    dropdownOpen.value = true
  } else {
    selectedList.value = [tag]
    searchText.value = tag.label
    emit('update:modelValue', tag.value)
    emit('change', option)
    dropdownOpen.value = false
  }
}
const dropdownMaxHeight = computed(() => props.maxVisibleItems * props.itemHeightPx)

function removeChip(value) {
  if (!isMultiple.value) return
  const next = selectedList.value.filter(s => s.value !== value)
  selectedList.value = next
  emit('update:modelValue', next.map(s => s.value))
  emit('change', { type: 'remove', value })
}
function clearSelection() {
  if (isMultiple.value) return
  selectedList.value = []
  emit('update:modelValue', null)
  emit('change', null)
  searchText.value = ''
  dropdownOpen.value = false
  nextTick(() => wrapperEl.value?.querySelector('.searchselect-input')?.focus())
}
function clearAll() {
  if (!isMultiple.value) return
  selectedList.value = []
  emit('update:modelValue', [])
  emit('change', { type: 'clear' })
  nextTick(() => wrapperEl.value?.querySelector('.searchselect-input')?.focus())
}
</script>

<style scoped>
/* Ya tienes esto, solo asegúrate de que tenga max-width */
.searchselect-control {
  position: relative;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding-right: 2.25rem;
  overflow: hidden;           /* aquí sí, para que no se desborde el texto */
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: .35rem;
  min-width: 0;          /* 👈 también importante aquí */
}


/* Label bloqueado (single) */
.ss-locked-label{
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Chips */
.ss-chip {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  max-width: 100%;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #374151;
  border-radius: 999px;
  padding: .2rem .5rem;
  font-size: .78rem;
  line-height: 1;
}
.ss-chip__label{   flex: 1 1 auto;
  min-width: 0;
  width: 100%;
  min-height: 1.6rem;
  white-space: nowrap;
  text-overflow: ellipsis;}
.ss-chip__x{ border:0; background:transparent; cursor:pointer; color:#6b7280; font-size:1rem; line-height:1; }
.ss-chip__x:hover{ color:#dc2626; }

/* Input */
/* Input: que se adapte y recorte con … */
.searchselect-input {
  flex: 1 1 auto;
  min-width: 0;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.searchselect-input[disabled]{ background-color:transparent; color:#111827; cursor:default; }
.is-locked{ cursor: default !important; }

/* Affordances a la derecha */
.searchselect-affordance{ position:absolute; right:.5rem; top:50%; transform:translateY(-50%); }

/* Botones clear */
.btn-clear,.btn-clear-all{
  border:0; background:transparent; width:1.5rem; height:1.5rem; border-radius:999px;
  display:inline-flex; align-items:center; justify-content:center;
  color:#6b7280; font-size:1rem; line-height:1; cursor:pointer;
}
.btn-clear:hover,.btn-clear-all:hover{ color:#dc2626; }

/* Dropdown */
.dropdown-item-option{ border:0; background:#fff; font-size:.8rem; line-height:1.3; width:100%; text-align:left; }
.dropdown-item-option:hover{ background-color:#f3f4f6; }

/* Validación */
.has-error.searchselect-control{ border-color:#ef4444!important; box-shadow:0 0 0 .2rem rgba(239,68,68,.15); }
.has-success.searchselect-control{ border-color:#10b981!important; box-shadow:0 0 0 .2rem rgba(16,185,129,.15); }
.has-error{ border-color:#fecaca; } .has-success{ border-color:#bbf7d0; }

/* Spinner */
.spinner, .spinner::after{ box-sizing:border-box; }
.spinner{ width:16px; height:16px; border:2px solid #e5e7eb; border-top-color:#6b7280; border-radius:50%; animation:spin .8s linear infinite; }
@keyframes spin{ to{ transform: rotate(360deg); } }
/* El wrapper nunca será más ancho que su contenedor */
.searchselect-root {
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;   /* si el padre es flex, que pueda crecer/encoger */
  min-width: 0;     /* 👈 CLAVE para que no desborde en layouts flex */
}
</style>
