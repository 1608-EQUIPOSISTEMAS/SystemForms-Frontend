<template>
  <div class="date-range">
    <!-- Presets (opcional) -->
    <div v-if="showPresets" class="date-range__presets">
      <button
        v-for="p in presets"
        :key="p.key"
        type="button"
        class="dr-btn"
        @click="applyPreset(p)"
      >
        {{ p.label }}
      </button>
    </div>

    <!-- Inputs -->
    <div class="date-range__inputs">
      <div class="date-field">
        <label v-if="labelFrom" class="dr-label">{{ labelFrom }}</label>
        <input
          type="date"
          class="form-control"
          v-model="innerStart"
          @change="emitChange"
        />
      </div>

      <span class="date-range__sep">→</span>

      <div class="date-field">
        <label v-if="labelTo" class="dr-label">{{ labelTo }}</label>
        <input
          type="date"
          class="form-control"
          v-model="innerEnd"
          @change="emitChange"
          :min="innerStart || undefined"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, toRefs } from 'vue'

const props = defineProps({
  /** v-model value: { start: '2025-10-30', end: '2025-11-02' } */
  modelValue: {
    type: Object,
    default: () => ({ start: '', end: '' }),
  },
  labelFrom: {
    type: String,
    default: 'Desde',
  },
  labelTo: {
    type: String,
    default: 'Hasta',
  },
  showPresets: {
    type: Boolean,
    default: true,
  },
  presets: {
    type: Array,
    default: () => {
      const today = new Date()
      const yyyy = today.getFullYear()
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const dd = String(today.getDate()).padStart(2, '0')
      const todayStr = `${yyyy}-${mm}-${dd}`

      // helper para restar días
      const toDateStr = (d) => {
        const dt = new Date(today)
        dt.setDate(dt.getDate() - d)
        const y = dt.getFullYear()
        const m = String(dt.getMonth() + 1).padStart(2, '0')
        const da = String(dt.getDate()).padStart(2, '0')
        return `${y}-${m}-${da}`
      }

      // inicio de mes actual
      const monthStart = `${yyyy}-${mm}-01`

      return [
        { key: 'today', label: 'Hoy', start: todayStr, end: todayStr },
        { key: 'yesterday', label: 'Ayer', start: toDateStr(1), end: toDateStr(1) },
        { key: 'last7', label: 'Últimos 7 días', start: toDateStr(6), end: todayStr },
        { key: 'thisMonth', label: 'Este mes', start: monthStart, end: todayStr },
      ]
    },
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const innerStart = computed({
  get: () => props.modelValue?.start || '',
  set: (val) => {
    emit('update:modelValue', { ...props.modelValue, start: val })
  },
})

const innerEnd = computed({
  get: () => props.modelValue?.end || '',
  set: (val) => {
    emit('update:modelValue', { ...props.modelValue, end: val })
  },
})

function emitChange() {
  emit('change', { start: innerStart.value, end: innerEnd.value })
}

function applyPreset(preset) {
  emit('update:modelValue', {
    start: preset.start,
    end: preset.end,
  })
  emit('change', {
    start: preset.start,
    end: preset.end,
  })
}
</script>

<style scoped>
.date-range {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.date-range__presets {
  display: flex;
  flex-wrap: wrap;
  gap: .35rem;
}

.dr-btn {
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: .375rem;
  font-size: .7rem;
  padding: .25rem .5rem;
  cursor: pointer;
  color: #374151;
}
.dr-btn:hover {
  background: #f3f4f6;
}

.date-range__inputs {
  display: flex;
  align-items: flex-end;
  gap: .5rem;
}
.date-field {
  display: flex;
  flex-direction: column;
  gap: .25rem;
}
.dr-label {
  font-size: .7rem;
  font-weight: 500;
  color: #374151;
}
.date-range__sep {
  font-size: .9rem;
  color: #6b7280;
}

.form-control {
  border: 1px solid #d1d5db;
  border-radius: .375rem;
  padding: .35rem .5rem;
  font-size: .8rem;
}
</style>
