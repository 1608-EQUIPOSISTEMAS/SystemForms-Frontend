<template>
  <div class="page">
    <!-- Topbar -->
    <!-- Topbar -->
    <header class="topbar">
      <!-- IZQUIERDA: logo + textos -->
      <div class="brand-left">
        <picture>
          <source srcset="/assets/images/logo.webp" type="image/webp" />
          <img src="/assets/images/logo.webp" width="55" alt="WE Educación Ejecutiva" />
        </picture>

        <div>
          <div class="brand-title">W|E Educación Ejecutiva</div>
          <div class="brand-sub">Ficha de certificación</div>
        </div>
      </div>
    </header>

    <!-- 🔹 NUEVO: banner full-width sin marco -->
    <div class="hero-banner hero-banner--plain">
      <picture>
        <source srcset="/assets/images/inicio.webp" type="image/webp" />
        <img src="/assets/images/primer.png" alt="Banner WE Educación Ejecutiva" class="hero-banner-img" />
      </picture>
    </div>


    <!-- Progress + Stepper -->
    <section class="progress-wrap">
      <div class="progress">
        <div class="bar" :style="{ width: progressPct + '%' }"></div>
      </div>
<!-- 
      <div class="stepper">
        <button
          v-for="s in sections"
          :key="s.step"
          class="step"
          :class="stepClass(s.step)"
          @click="goTo(s.step)"
          :disabled="!sectionReachable(s.step)"
        >
          <span class="idx">{{ s.step }}</span><span>{{ s.section }}</span>
        </button>
      </div> -->
    </section>

    <!-- Main grid -->
    <div class="grid no-preview">
      <div class="card form-card">
        <transition name="fade-slide" mode="out-in">
          <div :key="currentStep">
            <!-- STEP 1: BIENVENIDA -->
            <section v-if="currentStep === 1" class="form-section">
              <!-- <h3>Bienvenida</h3> -->
              <p class="muted">
                <strong>Bienvenido(a) a W|E Educación Ejecutiva💙</strong>
                <br><br>
                En W|E Educación Ejecutiva encontrarás los programas más demandados en el mercado actual que son dictados por Gerente Ejecutivos a nivel LATAM. Como parte del proceso de certificación WE En Vivo es necesario que completes esta ficha con tus datos correctamente escritos.
                <br><br>
                📍W|E no se hace responsable en caso haya algún error en la información brindada.
              </p>
            </section>

            <!-- STEP 2: CONTACTO -->
            <section v-else-if="currentStep === 2" class="form-section">
              <h3>Datos de contacto</h3>
              <div class="row">
                <div class="field col-4">
                  <label>Correo <span class="req">*</span></label>
                  <input autocomplete="new-password"
                    v-model.trim="form.email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    @blur="touch('email')"
                    :class="vClass('email')"
                  />
                  <small v-if="touched.email && !form.email" class="err">Requerido</small>
                </div>

                

                <div class="field col-4">
                  <label>Nro. de Documento <span class="req">*</span></label>
                  <input autocomplete="new-password"
                    v-model.trim="form.documento"
                    @blur="touch('documento')"
                    v-restrict="{ only: 'numbers', max: 20 }"
                    :class="vClass('documento')"
                  />
                  <small v-if="touched.documento && !form.documento" class="err">Requerido</small>
                </div>

                <div class="field col-3">
                  <label>Fecha de Nacimiento <span class="req">*</span></label>
                  <input autocomplete="new-password" v-model="form.born" type="date"
                    @blur="touch('born')"
                    :class="vClass('born')"/>
                  <small v-if="touched.born && !form.born" class="err">Requerido</small>
                </div>

                <div class="field col-4">
                  <label>Apellidos <span class="req">*</span></label>
                  <input autocomplete="new-password"
                    v-model.trim="form.apellidos"
                    placeholder="Apellidos"
                    @blur="touch('apellidos')"
                    v-restrict="{ only: 'letters', max: 80, transform:'upper' }"
                    :class="vClass('apellidos')"
                  />
                  <small v-if="touched.apellidos && !form.apellidos" class="err">Requerido</small>
                </div>

                <div class="field col-4">
                  <label>Nombres <span class="req">*</span></label>
                  <input autocomplete="new-password"
                    v-model.trim="form.nombres"
                    placeholder="Nombres"
                    v-restrict="{ only: 'letters', max: 80, transform:'upper' }"
                    @blur="touch('nombres')"
                    :class="vClass('nombres')"
                  />
                  <small v-if="touched.nombres && !form.nombres" class="err">Requerido</small>
                </div>
              </div>
            </section>

            <!-- STEP 3: PROGRAMA -->
            <section v-else-if="currentStep === 3" class="form-section">
              <h3>Programa a Certificarse</h3>
              <div class="row">
                <div class="field col-6">
                  <label>Categoría <span class="req">*</span></label>
                  <SearchSelect
                    v-model="form.categoriaPrograma"
                    :items="catalogo.categories"
                    label-field="label"
                    value-field="value"
                    placeholder="Selecciona categoría…"
                    @update:modelValue="touch('categoriaPrograma')"
                    @change="onChangeCategory($event)"
                    :max-visible-items="5"
                    :item-height-px="34"
                  />
                  <small v-if="touched.categoriaPrograma && !form.categoriaPrograma" class="err">
                    Requerido
                  </small>
                </div>
                <div class="field col-6" v-if="form.categoriaPrograma">
                  <label>Programa <span class="req">*</span></label>
                  <SearchSelect
                    v-model="form.programa"
                    :items="programList"
                    label-field="label"
                    value-field="value"
                    placeholder="Selecciona el programa…"
                    @update:modelValue="touch('programa')"
                    :max-visible-items="5"
                    :item-height-px="34"
                  />
                  <small v-if="touched.programa && !form.programa" class="err">Requerido</small>
                </div>
              </div>
            </section>

            <!-- STEP 4: PERFIL -->
            <section v-else-if="currentStep === 4" class="form-section">
              <h3>Perfil académico y profesional</h3>


              <!-- B. Formación -->
              <div class="row">
                <div class="field col-6">
                  <label>Carrera <span class="req">*</span></label>
                    <small class="assist">En caso de no encontrar tu <b>carrera</b> o <b>estudio</b>, elige “Otra”.</small>

                  <SearchSelect
                    v-model="form.carrera"
                    :items="catalogo.carreras"
                    label-field="label"
                    value-field="value"
                    placeholder="Ej: Ingeniería Industrial"
                  />
                </div>
                <div v-if="form.carrera === 'otra'" class="field col-6">
                  <label>Especifica la carrera</label>
                  <input autocomplete="new-password" v-model.trim="form.carreraOtra" placeholder="Describe tu carrera" />
                </div>

                <div v-if="form.carrera !=   'otra'" class="col-6"></div>

                <div class="field col-6">
                  <label>Universidad <span class="req">*</span></label>
                    <small class="assist">En caso de no encontrar tu <b>Universidad</b> o <b>Instituto</b>, elige “Otra”.</small>
                  <SearchSelect
                    v-model="form.universidad"
                    :items="catalogo.universidades"
                    label-field="label"
                    value-field="value"
                    placeholder="Selecciona…"
                  />
                </div>
                <div v-if="form.universidad === 'otra'" class="field col-6">
                  <label>Especifica la universidad</label>
                  <input autocomplete="new-password" v-model.trim="form.universidadOtra" placeholder="Nombre de la universidad" />
                </div>

                <div v-if="form.universidad != 'otra'" class="col-6"></div>

                <div class="field col-6">
                  <label>Grado académico <span class="req">*</span></label>
                  <SearchSelect
                    v-model="form.gradoAcademico"
                    :items="catalogo.grados"
                    label-field="label"
                    value-field="value"
                    placeholder="Selecciona…"
                    :max-visible-items="5"
                    :item-height-px="34"
                  />
                </div>
              </div>

              <h3>Ubicación</h3>
              <div class="row">
                <div class="field col-4">
                  <label>País <span class="req">*</span></label>
                  <SearchSelect
                    v-model="form.pais"
                    :items="catalogo.paises"
                    label-field="label"
                    value-field="value"
                    placeholder="Selecciona…"
                  />
                </div>
                <div class="field col-4" v-if="form.pais">
                  <label>Departamento / Región <span class="req">*</span></label>
                  <input v-restrict="{ max: 80, only:'letters'}"
                   autocomplete="new-password" v-model.trim="form.departamento" placeholder="Lima, Santiago, Buenos Aires etc." />
                </div>
              </div>
              
              <h3>Experiencia Laboral</h3>
              <!-- A. Situación primero -->
              <div class="row">
                <div class="field col-4"> 
                  <label>Situación actual <span class="req">*</span></label>
                  <SearchSelect
                    v-model="form.situacionActual"
                    :items="catalogo.situaciones"
                    label-field="label"
                    value-field="value"
                    placeholder="Estudiante / Trabaja"
                  />
                </div>
              </div>

              <!-- C. Experiencia laboral (solo si labura) -->
              <template v-if="isLaborando">
                <!--un tipo subtitulo con estilo que resalte-->
                <div class="form-section-subtitle">
                  <p class="muted">Cuéntanos sobre tu experiencia actual.</p>
                
                  <div class="row">
                    <div class="field col-6">
                      <label>Área actual <span class="req">*</span></label>
                      <SearchSelect
                        v-model="form.areaActual"
                        :items="catalogo.areasTrabajo"
                        label-field="label"
                        value-field="value"
                        placeholder="Selecciona…"
                      />
                    </div>
                    
                    <div v-if="form.areaActual === 'otra'" class="field col-6">
                      <label>Especifica: <span class="req">*</span></label>
                      <input autocomplete="new-password" v-model.trim="form.areaActualOtra" placeholder="Nombre de la universidad" />
                    </div>

                    <div v-if="form.areaActual != 'otra'" class="col-6"></div>

                    <div class="field col-6">
                      <label>Área deseada <span class="req">*</span></label>
                      <SearchSelect
                        v-model="form.areaDeseada"
                        :items="catalogo.areasTrabajo"
                        label-field="label"
                        value-field="value"
                        placeholder="Selecciona…"
                      />
                    </div>
                    
                    <div v-if="form.areaDeseada === 'otra'" class="field col-6">
                      <label>Especifica: <span class="req">*</span></label>
                      <input autocomplete="new-password" v-model.trim="form.areaDeseadaOtra" placeholder="Nombre de la universidad" />
                    </div>

                    <div v-if="form.areaDeseada != 'otra'" class="col-6"></div>

                    <div class="field col-6"> 
                      <label>Nombre de la Empresa <span class="req">*</span></label>
                      <input autocomplete="new-password" v-model.trim="form.empresa" placeholder="Empresa S.A.C" v-restrict="{ only: 'letters', max: 80 }"/>
                    </div>
                    <div class="field col-6">
                      <label>Puesto <span class="req">*</span></label>
                      <input autocomplete="new-password" v-model.trim="form.puesto" placeholder="Cargo actual" v-restrict="{ only: 'letters', max: 80 }"/>
                    </div>
                    <div class="field col-6">
                      <label>Años de experiencia <span class="req">*</span></label>
                      <input autocomplete="new-password" v-model.number="form.aniosExp" type="number" min="0" placeholder="0" />
                    </div>
                    <div class="field col-6">
                      <label>Sector económico <span class="req">*</span></label>
                      <SearchSelect
                        v-model="form.sector"
                        :items="catalogo.sectores"
                        label-field="label"
                        value-field="value"
                        placeholder="Educación, TI, Banca…"
                      />
                    </div>
                </div>
                </div>
              </template>
            </section>

            <!-- STEP 5: ACCESIBILIDAD -->
            <section v-else-if="currentStep === 5" class="form-section">
              <h3>Accesibilidad</h3>
              <div class="row">
                <div class="field col-6">
                  <label>¿Cuentas con alguna necesidad especial que podamos tener en cuenta para mejorar tu experiencia de aprendizaje? <span class="req">*</span></label>
                  <SearchSelect
                    v-model="form.necesidadEspecial"
                    :items="catalogo.problems"
                    label-field="label"
                    value-field="value"
                    placeholder="Selecciona…"
                  />
                </div>
                <div v-if="form.necesidadEspecial === 'otro'" class="field col-6">
                  <label>Especifica <span class="req">*</span></label>
                  <input autocomplete="new-password" v-model.trim="form.necesidadEspecialOtra" placeholder="Describe aquí" />
                </div>
                
              </div>
            </section>

            <!-- STEP 6: IDENTIDAD -->
            <section v-else-if="currentStep === 6" class="form-section">
              <h3>Verificación de identidad</h3>
              <p class="muted">Adjunta ambas caras de tu DNI/ID</p>
              <div class="row">
                <!-- FRONTAL -->
                <div class="field col-6">
                  <label>Frontal <span class="req">*</span></label>
                  <div
                    class="upload-card"
                    :class="{ 'upload-card--filled': !!files.front }"
                  >
                    <div class="upload-card__icon">
                      <picture v-if="!files.front">
                        <source srcset="/assets/images/upload.webp" type="image/webp">
                        <img src="/assets/images/subir.png" width="70%"  alt="WE Educación Ejecutiva" />
                      </picture>
                      
                      <picture v-if="files.front">
                        <source srcset="/assets/images/okay.webp" type="image/webp">
                        <img src="/assets/images/okay.png" width="70%"  alt="WE Educación Ejecutiva" />
                      </picture>
                    </div>

                    <div class="upload-card__body">
                      <div class="upload-card__title">
                        {{ files.front ? 'Archivo seleccionado' : 'Subir imagen frontal' }}
                      </div>
                      <div class="upload-card__subtitle">
                        {{ files.front ? files.front.name : 'JPG, PNG o WEBP · Máx. 10 MB' }}
                      </div>
                    </div>


                      <!-- Botón X -->
                      <button
                        v-if="files.front"
                        type="button"
                        class="upload-card__clear"
                        @click="clearFile('front')"
                        aria-label="Quitar archivo frontal"
                      >
                        ×
                      </button>
                    <!-- Input real (oculto visualmente pero clickeable) -->
                    <input
                      class="upload-card__input"
                      autocomplete="new-password"
                      ref="dniFront"
                      type="file"
                      accept="image/*"
                      @change="onFile($event, 'front')"
                      :class="{ invalid: touchedFiles.front && !files.front }"
                    />
                  </div>

                  <small v-if="touchedFiles.front && !files.front" class="err">Requerido</small>

                  <div v-if="previews.front" class="thumb">
                    <img :src="previews.front" alt="DNI frontal" />
                  </div>
                </div>

                <!-- REVERSO -->
                <div class="field col-6">
                  <label>Reverso <span class="req">*</span></label>

                  <div
                    class="upload-card"
                    :class="{ 'upload-card--filled': !!files.back }"
                  >
                    <div class="upload-card__icon">
                            
                      <picture v-if="!files.back">
                        <source srcset="/assets/images/upload.webp" type="image/webp">
                        <img src="/assets/images/subir.png" width="70%"  alt="WE Educación Ejecutiva" />
                      </picture>
                      
                      <picture v-if="files.back">
                        <source srcset="/assets/images/okay.webp" type="image/webp">
                        <img src="/assets/images/okay.png" width="70%"  alt="WE Educación Ejecutiva" />
                      </picture>
                    </div>

                    <div class="upload-card__body">
                      <div class="upload-card__title">
                        {{ files.back ? 'Archivo seleccionado' : 'Subir imagen reverso' }}
                      </div>
                      <div class="upload-card__subtitle">
                        {{ files.back ? files.back.name : 'JPG, PNG o WEBP · Máx. 10 MB' }}
                      </div>
                    </div>

                    <button
                      v-if="files.back"
                      type="button"
                      class="upload-card__clear"
                      @click="clearFile('back')"
                      aria-label="Quitar archivo reverso"
                    >
                      ×
                    </button>
                    <input
                      class="upload-card__input"
                      autocomplete="new-password"
                      ref="dniBack"
                      type="file"
                      accept="image/*"
                      @change="onFile($event, 'back')"
                      :class="{ invalid: touchedFiles.back && !files.back }"
                    />
                  </div>

                  <small v-if="touchedFiles.back && !files.back" class="err">Requerido</small>

                  <div v-if="previews.back" class="thumb">
                    <img :src="previews.back" alt="DNI reverso" />
                  </div>
                </div>

              </div>
            </section>

            <!-- STEP 7: DESPEDIDA -->
            <section v-else-if="currentStep === 7" class="form-section ">
              <!-- <h3>Despedida</h3> -->
              <div class="text-center">
                <p class="muted fw-bold">
                  Muchas gracias por darte el tiempo de llegar hasta aquí 😊
                  Gracias a ti, seguiremos mejorando nuestra propuesta y ofrecerte lo mejor 🚀
                </p>
                <hr>
                <picture>
                  <source srcset="/assets/images/final.webp" type="image/webp">
                  <img src="/assets/images/footer.png" width="70%" alt="WE Educación Ejecutiva" />
                </picture>
              </div>
            </section>

            <!-- Step nav -->
            <div class="step-nav" :class="{ 'step-nav--center': currentStep === 1 }">
              <button
                v-if="currentStep != '1'"
                class="btn ghost"
                @click="prev"
                :disabled="currentStep === minStep || currentStep=='2'"
              >
                Atrás
              </button>

              <!-- Mostrar “Siguiente / Empezar” solo si NO es el último paso -->
              <button
                v-if="currentStep < maxStep"
                class="btn"
                @click="next"
                :disabled="!canNext"
              >
                {{ (currentStep == '1') ? 'Empezar' : 'Siguiente' }}
              </button>

              <button
                v-if="currentStep === maxStep"
                class="btn primary"
                :disabled="isSubmitting"
                @click="submit"
              >
                {{ isSubmitting ? 'Enviando…' : 'Enviar' }}
              </button>
            </div>


          </div>
        </transition>
      </div>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>
    <!-- Success Modal -->
    <transition name="fade-slide">
      <div v-if="showSuccess" class="modal-backdrop" @click.self="onSuccessOK">
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="ok-title">
          <div class="modal-icon">✅</div>
          <h3 id="ok-title" class="modal-title">¡Información enviada!</h3>
          <p class="modal-text">Tu ficha fue registrada correctamente.</p>
          <button class="btn" @click="onSuccessOK" autofocus>Aceptar</button>
        </div>
      </div>
    </transition>

  </div>
  
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted, inject } from 'vue'
import SearchSelect from '@/components/common/SearchSelect.vue'
import api from '@/services/api'
const dniFront = ref(null)
const dniBack  = ref(null)
const catalog          = inject('catalog')
const showSuccess = ref(false)

function onSuccessOK() {
  showSuccess.value = false
  resetForm()               // aquí recién limpiamos todo
}

/* --------------------
 * Secciones (con %)
 * -------------------- */
const sections = [
  { section: 'Bienvenida',    porcent: 0,   step: 1 }, // texto
  { section: 'Contacto',      porcent: 0,  step: 2 },
  { section: 'Programa',      porcent: 20,  step: 3 },
  { section: 'Perfil',        porcent: 40,  step: 4 },
  { section: 'Accesibilidad', porcent: 60,  step: 5 },
  { section: 'Identidad',     porcent: 80,  step: 6 },
  { section: 'Despedida',     porcent: 100, step: 7 }  // texto
]
const minStep = 1
const maxStep = 7
function next(){
  if(!canNext.value){
    showToast('Completa los campos requeridos del paso actual')
    return
  }
  currentStep.value++
}

/* --------------------
 * Estado base
 * -------------------- */
const form = reactive({
  email: '',
  documento: '',
  born: '',
  apellidos: '',
  nombres: '',
  celular: '',
  categoriaPrograma: null,
  programa: null,
  carrera: null,
  carreraOtra: '',
  universidad: null,
  universidadOtra: '',
  gradoAcademico: null,
  situacionActual: null,
  areaActual: null,
  areaDeseada: null,
  areaActualOtra: null,
  areaDeseadaOtra: null,
  empresa: '',
  puesto: '',
  aniosExp: null,
  sector: null,
  programaEmprendimiento: '',
  tallerSpeaking: '',
  pais: null,
  departamento: '',
  necesidadEspecial: null,
  necesidadEspecialOtra: '',
})

const defaultForm = {
  email: '', documento: '', born: '', apellidos: '', nombres: '', celular: '',
  categoriaPrograma: null, programa: null,
  carrera: null, carreraOtra: '',
  universidad: null, universidadOtra: '',
  gradoAcademico: null, situacionActual: null,
  areaActual: null, areaDeseada: null,
  empresa: '', puesto: '', aniosExp: null, sector: null,
  programaEmprendimiento: '', tallerSpeaking: '',
  pais: null, departamento: '',
  necesidadEspecial: null, necesidadEspecialOtra: ''
}
Object.assign(form, defaultForm)

const isSubmitting = ref(false)


const files = reactive({ front: null, back: null })
const touchedFiles = reactive({ front: false, back: false })

const previews = reactive({ front: '', back: '' })
const touched = reactive({})
const toast = ref('')
const currentStep = ref(1)
const autosaveState = ref('inactivo')

/* --------------------
 * Catálogos (mock + los tuyos)
 * -------------------- */
const catalogo = {
  carreras: [
      { value: 'adm', label: 'Administración' },
      { value: 'hoteleria', label: 'Administración Hotelera' },
      { value: 'antropologia', label: 'Antropología' },
      { value: 'arqueologia', label: 'Arqueología' },
      { value: 'arquitectura', label: 'Arquitectura' },
      { value: 'teatro', label: 'Arte Dramático' },
      { value: 'bibliotecologia', label: 'Bibliotecología y Ciencias de la Información' },
      { value: 'biologia', label: 'Biología' },
      { value: 'biotecnologia', label: 'Biotecnología' },
      { value: 'actuaria', label: 'Ciencias Actuariales y Financieras' },
      { value: 'comunicaciones', label: 'Ciencias de la Comunicación' },
      { value: 'ciencia_datos', label: 'Ciencia de Datos' },
      { value: 'ciencias_politicas', label: 'Ciencias Políticas' },
      { value: 'deporte', label: 'Ciencias del Deporte' },
      { value: 'ciberseguridad', label: 'Ciberseguridad' },
      { value: 'conservacion', label: 'Conservación y Restauración' },
      { value: 'contabilidad', label: 'Contabilidad' },
      { value: 'criminalistica', label: 'Criminalística' },
      { value: 'danza', label: 'Danza' },
      { value: 'danza_arte', label: 'Danza y Arte Dramático' },
      { value: 'derecho', label: 'Derecho' },
      { value: 'diseno', label: 'Diseño Gráfico' },
      { value: 'diseno_interiores', label: 'Diseño de Interiores' },
      { value: 'diseno_modas', label: 'Diseño de Modas' },
      { value: 'economia', label: 'Economía' },
      { value: 'educacion', label: 'Educación' },
      { value: 'enfermeria', label: 'Enfermería' },
      { value: 'estadistica', label: 'Estadística' },
      { value: 'farmacia', label: 'Farmacia y Bioquímica' },
      { value: 'filosofia', label: 'Filosofía' },
      { value: 'fisica', label: 'Física' },
      { value: 'fotografia', label: 'Fotografía' },
      { value: 'gastronomia', label: 'Gastronomía' },
      { value: 'genetica', label: 'Genética' },
      { value: 'geografia', label: 'Geografía' },
      { value: 'gestion_publica', label: 'Gestión Pública' },
      { value: 'historia', label: 'Historia' },
      { value: 'agroindustrial', label: 'Ingeniería Agroindustrial' },
      { value: 'ambiental', label: 'Ingeniería Ambiental' },
      { value: 'civil', label: 'Ingeniería Civil' },
      { value: 'minas', label: 'Ingeniería de Minas' },
      { value: 'energia', label: 'Ingeniería de la Energía' },
      { value: 'petroleo', label: 'Ingeniería de Petróleo' },
      { value: 'sistemas', label: 'Ingeniería de Sistemas' },
      { value: 'software', label: 'Ingeniería de Software' },
      { value: 'telecomunicaciones', label: 'Ingeniería de Telecomunicaciones' },
      { value: 'energias_renovables', label: 'Ingeniería en Energías Renovables' },
      { value: 'forestal', label: 'Ingeniería Forestal' },
      { value: 'geologica', label: 'Ingeniería Geológica' },
      { value: 'industrial', label: 'Ingeniería Industrial' },
      { value: 'mecanica', label: 'Ingeniería Mecánica' },
      { value: 'metalurgica', label: 'Ingeniería Metalúrgica' },
      { value: 'pesquera', label: 'Ingeniería Pesquera' },
      { value: 'quimica', label: 'Ingeniería Química' },
      { value: 'textil', label: 'Ingeniería Textil' },
      { value: 'joyeria', label: 'Joyería' },
      { value: 'linguistica', label: 'Lingüística' },
      { value: 'literatura', label: 'Literatura' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'matematicas', label: 'Matemáticas' },
      { value: 'medicina', label: 'Medicina Humana' },
      { value: 'veterinaria', label: 'Medicina Veterinaria' },
      { value: 'meteorologia', label: 'Meteorología' },
      { value: 'musica', label: 'Música' },
      { value: 'negocios_internacionales', label: 'Negocios Internacionales' },
      { value: 'neurociencia', label: 'Neurociencia' },
      { value: 'nutricion', label: 'Nutrición' },
      { value: 'obstetricia', label: 'Obstetricia' },
      { value: 'oceanografia', label: 'Oceanografía' },
      { value: 'odontologia', label: 'Odontología' },
      { value: 'otra', label: 'Otra' },
      { value: 'periodismo', label: 'Periodismo' },
      { value: 'psicologia', label: 'Psicología' },
      { value: 'publicidad', label: 'Publicidad' },
      { value: 'quimica_pura', label: 'Química Pura' },
      { value: 'relaciones_internacionales', label: 'Relaciones Internacionales' },
      { value: 'relaciones_publicas', label: 'Relaciones Públicas' },
      { value: 'robotica', label: 'Robótica' },
      { value: 'robotica_ia', label: 'Robótica e Inteligencia Artificial' },
      { value: 'seguridad', label: 'Seguridad y Defensa' },
      { value: 'sociologia', label: 'Sociología' },
      { value: 'blockchain', label: 'Tecnologías Blockchain' },
      { value: 'traduccion', label: 'Traducción e Interpretación' },
      { value: 'turismo', label: 'Turismo y Hotelería' },
      { value: 'turismo_sostenible', label: 'Turismo Sostenible' },
      { value: 'urbanismo', label: 'Urbanismo' },
      { value: 'zootecnia', label: 'Zootecnia' }
  ],
  universidades: [
    { value: 'utp', label: 'UTP' }, 
    { value: 'uni', label: 'UNI' }, { value: 'pucp', label: 'PUCP' }, { value: 'unmsm', label: 'UNMSM' }, { value: 'upc', label: 'UPC' }, { value: 'esan', label: 'ESAN' }, { value: 'lima', label: 'Universidad de Lima' }, { value: 'pacifico', label: 'Universidad del Pacífico' }, { value: 'cientifica', label: 'Universidad Científica del Sur' }, { value: 'usil', label: 'USIL' }, { value: 'continental', label: 'Continental' }, { value: 'utec', label: 'UTEC' }, { value: 'wiener', label: 'Wiener' }, { value: 'ricardo_palma', label: 'Ricardo Palma' }, { value: 'san_martin', label: 'San Martín de Porres' }, { value: 'catolica_santa', label: 'Universidad Católica Sedes Sapientiae' }, { value: 'antonio_ruiz', label: 'Antonio Ruiz de Montoya' }, { value: 'peruana_union', label: 'Unión Peruana' }, { value: 'nacional_ingenieria', label: 'Universidad Nacional de Ingeniería' }, { value: 'nacional_mayor', label: 'Universidad Nacional Mayor de San Marcos' }, { value: 'agraria_lamolina', label: 'Universidad Nacional Agraria La Molina' }, { value: 'federico_villarreal', label: 'Universidad Nacional Federico Villarreal' }, { value: 'callao', label: 'Universidad Nacional del Callao' }, { value: 'amazonica', label: 'Universidad Nacional de la Amazonía Peruana' }, { value: 'piura', label: 'Universidad de Piura' }, { value: 'trujillo', label: 'Universidad Nacional de Trujillo' }, { value: 'chiclayo', label: 'Universidad Nacional Pedro Ruiz Gallo' }, { value: 'cajamarca', label: 'Universidad Nacional de Cajamarca' }, { value: 'huanuco', label: 'Universidad Nacional Hermilio Valdizán' }, { value: 'ica', label: 'Universidad Nacional San Luis Gonzaga' }, { value: 'tacna', label: 'Universidad Nacional Jose Mariátegui' }, { value: 'arequipa_catolica', label: 'Universidad Católica de Santa María' }, { value: 'arequipa_nacional', label: 'Universidad Nacional de San Agustín' }, { value: 'cusco_nacional', label: 'Universidad Nacional de San Antonio Abad del Cusco' }, { value: 'huancayo', label: 'Universidad Nacional del Centro del Perú' }, { value: 'iquitos', label: 'Universidad Nacional de la Amazonía Peruana' }, { value: 'ayacucho', label: 'Universidad Nacional San Cristóbal de Huamanga' }, { value: 'puno', label: 'Universidad Nacional del Altiplano' }, { value: 'tarapoto', label: 'Universidad Nacional de San Martín' }, { value: 'chimbote', label: 'Universidad Nacional del Santa' }, { value: 'cerro_pasco', label: 'Universidad Nacional Daniel Alcides Carrión' }, { value: 'tingo_maria', label: 'Universidad Nacional Agraria de la Selva' }, { value: 'madre_de_dios', label: 'Universidad Nacional Amazónica de Madre de Dios' }, { value: 'tumbes', label: 'Universidad Nacional de Tumbes' }, { value: 'abancay', label: 'Universidad Nacional Micaela Bastidas de Apurímac' }, { value: 'moquegua', label: 'Universidad Nacional de Moquegua' }, { value: 'jaen', label: 'Universidad Nacional de Jaén' }, { value: 'cutervo', label: 'Universidad Nacional Autónoma de Chota' }, { value: 'barranca', label: 'Universidad Nacional de Barranca' }, { value: 'cañete', label: 'Universidad Nacional de Cañete' }, { value: 'hualgayoc', label: 'Universidad Nacional de Hualgayoc' }, { value: 'la_union', label: 'Universidad Nacional de La Unión' }, { value: 'gran_chimu', label: 'Universidad Nacional del Gran Chimú' },
    { value: 'otra', label: 'Otra' }
  ],
  situaciones: [
    { value: 'actualmente, no me encuentro laborando',  label: 'Actualmente no me encuentro laborando' },
    { value: 'me encuentro laborando',      label: 'Me encuentro laborando' },
    { value: 'nunca he laborado',  label: 'Nunca he laborado' }
  ],
  sectores: [
      { value: 'agroindustria', label: 'Agroindustria' },
      { value: 'automotriz', label: 'Automotriz' },
      { value: 'construccion', label: 'Construcción' },
      { value: 'consultoria', label: 'Consultoría' },
      { value: 'educacion', label: 'Educación' },
      { value: 'energia', label: 'Energía' },
      { value: 'entretenimiento', label: 'Entretenimiento' },
      { value: 'farmaceutica', label: 'Farmacéutica' },
      { value: 'finanzas', label: 'Finanzas' },
      { value: 'gastronomia', label: 'Gastronomía' },
      { value: 'gobierno', label: 'Gobierno' },
      { value: 'inmobiliaria', label: 'Inmobiliaria' },
      { value: 'investigacion', label: 'Investigación y Desarrollo' },
      { value: 'legal', label: 'Legal' },
      { value: 'manufactura', label: 'Manufactura' },
      { value: 'medios', label: 'Medios y Comunicación' },
      { value: 'mineria', label: 'Minería' },
      { value: 'moda', label: 'Moda' },
      { value: 'organizaciones_sin_fines_lucro', label: 'Organizaciones sin fines de lucro' },
      { value: 'publicidad', label: 'Publicidad y Marketing' },
      { value: 'retail', label: 'Retail' },
      { value: 'salud', label: 'Salud' },
      { value: 'seguros', label: 'Seguros' },
      { value: 'servicios', label: 'Servicios' },
      { value: 'tecnologia', label: 'Tecnología' },
      { value: 'telecomunicaciones', label: 'Telecomunicaciones' },
      { value: 'transporte', label: 'Transporte y Logística' },
      { value: 'turismo', label: 'Turismo' }
  ],
  areasTrabajo: [
      { value: 'administracion', label: 'Administración' },
      { value: 'agroindustria', label: 'Agroindustria' },
      { value: 'arte_diseno', label: 'Arte y Diseño' },
      { value: 'atencion_cliente', label: 'Atención al Cliente' },
      { value: 'banca_seguros', label: 'Banca y Seguros' },
      { value: 'biotecnologia', label: 'Biotecnología' },
      { value: 'calidad', label: 'Calidad' },
      { value: 'ciencias', label: 'Ciencias' },
      { value: 'comercial', label: 'Comercial' },
      { value: 'comercio_exterior', label: 'Comercio Exterior' },
      { value: 'construccion_infraestructura', label: 'Construcción e Infraestructura' },
      { value: 'consultoria', label: 'Consultoría' },
      { value: 'consultoria_estrategica', label: 'Consultoría Estratégica' },
      { value: 'deportes_recreacion', label: 'Deportes y Recreación' },
      { value: 'diseno', label: 'Diseño' },
      { value: 'educacion', label: 'Educación' },
      { value: 'energia_recursos_naturales', label: 'Energía y Recursos Naturales' },
      { value: 'entretenimiento_ocio', label: 'Entretenimiento y Ocio' },
      { value: 'finanzas', label: 'Finanzas' },
      { value: 'proyectos', label: 'Gestión de Proyectos' },
      { value: 'ingenieria', label: 'Ingeniería' },
      { value: 'investigacion_desarrollo', label: 'Investigación y Desarrollo' },
      { value: 'legal', label: 'Legal' },
      { value: 'legal_judicial', label: 'Legal y Judicial' },
      { value: 'logistica', label: 'Logística' },
      { value: 'logistica_cadena_suministro', label: 'Logística y Cadena de Suministro' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'medio_ambiente', label: 'Medio Ambiente' },
      { value: 'medios_comunicacion', label: 'Medios de Comunicación' },
      { value: 'mineria_metalurgia', label: 'Minería y Metalurgia' },
      { value: 'moda_belleza', label: 'Moda y Belleza' },
      { value: 'operaciones', label: 'Operaciones' },
      { value: 'produccion', label: 'Producción' },
      { value: 'produccion_manufactura', label: 'Producción y Manufactura' },
      { value: 'recursos_humanos', label: 'Recursos Humanos' },
      { value: 'salud', label: 'Salud' },
      { value: 'seguridad_defensa', label: 'Seguridad y Defensa' },
      { value: 'servicios_publicos', label: 'Servicios Públicos' },
      { value: 'tecnologia', label: 'Tecnología' },
      { value: 'turismo_hoteleria', label: 'Turismo y Hotelería' },
      { value: 'ventas', label: 'Ventas' },
      { value: 'otra', label: 'Otra' }
  ],
  grados: [
    { value: 'primaria', label: 'Primaria Completa' },
    { value: 'secundaria', label: 'Secundaria Completa' },
    { value: 'tecnico', label: 'Técnico' },
    { value: 'bachiller', label: 'Bachiller' },
    { value: 'titulo', label: 'Título' },
    { value: 'maestria', label: 'Maestría' },
    { value: 'doctorado', label: 'Doctorado' },
  ],
  paises: [
      { value: 'ae', label: 'Emiratos Árabes Unidos' },
      { value: 'de', label: 'Alemania' },
      { value: 'ao', label: 'Angola' },
      { value: 'sa', label: 'Arabia Saudita' },
      { value: 'dz', label: 'Argelia' },
      { value: 'ar', label: 'Argentina' },
      { value: 'au', label: 'Australia' },
      { value: 'at', label: 'Austria' },
      { value: 'be', label: 'Bélgica' },
      { value: 'bo', label: 'Bolivia' },
      { value: 'br', label: 'Brasil' },
      { value: 'ca', label: 'Canadá' },
      { value: 'cl', label: 'Chile' },
      { value: 'cn', label: 'China' },
      { value: 'co', label: 'Colombia' },
      { value: 'kr', label: 'Corea del Sur' },
      { value: 'cr', label: 'Costa Rica' },
      { value: 'cu', label: 'Cuba' },
      { value: 'dk', label: 'Dinamarca' },
      { value: 'ec', label: 'Ecuador' },
      { value: 'eg', label: 'Egipto' },
      { value: 'sv', label: 'El Salvador' },
      { value: 'es', label: 'España' },
      { value: 'us', label: 'Estados Unidos' },
      { value: 'et', label: 'Etiopía' },
      { value: 'ph', label: 'Filipinas' },
      { value: 'fr', label: 'Francia' },
      { value: 'gh', label: 'Ghana' },
      { value: 'gt', label: 'Guatemala' },
      { value: 'hn', label: 'Honduras' },
      { value: 'in', label: 'India' },
      { value: 'id', label: 'Indonesia' },
      { value: 'ie', label: 'Irlanda' },
      { value: 'it', label: 'Italia' },
      { value: 'jp', label: 'Japón' },
      { value: 'ke', label: 'Kenia' },
      { value: 'ly', label: 'Libia' },
      { value: 'my', label: 'Malasia' },
      { value: 'ma', label: 'Marruecos' },
      { value: 'mx', label: 'México' },
      { value: 'mz', label: 'Mozambique' },
      { value: 'ni', label: 'Nicaragua' },
      { value: 'ng', label: 'Nigeria' },
      { value: 'no', label: 'Noruega' },
      { value: 'nz', label: 'Nueva Zelanda' },
      { value: 'pa', label: 'Panamá' },
      { value: 'py', label: 'Paraguay' },
      { value: 'pe', label: 'Perú' },
      { value: 'pt', label: 'Portugal' },
      { value: 'pr', label: 'Puerto Rico' },
      { value: 'qa', label: 'Qatar' },
      { value: 'uk', label: 'Reino Unido' },
      { value: 'cd', label: 'República Democrática del Congo' },
      { value: 'do', label: 'República Dominicana' },
      { value: 'ru', label: 'Rusia' },
      { value: 'sg', label: 'Singapur' },
      { value: 'za', label: 'Sudáfrica' },
      { value: 'sd', label: 'Sudán' },
      { value: 'se', label: 'Suecia' },
      { value: 'ch', label: 'Suiza' },
      { value: 'th', label: 'Tailandia' },
      { value: 'tz', label: 'Tanzania' },
      { value: 'tn', label: 'Túnez' },
      { value: 'ug', label: 'Uganda' },
      { value: 'uy', label: 'Uruguay' },
      { value: 've', label: 'Venezuela' },
      { value: 'vn', label: 'Vietnam' },
      { value: 'zm', label: 'Zambia' },
      { value: 'zw', label: 'Zimbabue' }
  ],
  categories: [
    { value: 'diplomado', label: 'Diplomado' },
    { value: 'curso', label: 'Curso' },
    { value: 'especializacion', label: 'Especialización' },
    { value: 'pee', label: 'PEE' }
  ],
  problems: [
    { value: 'neuronal', label: 'Sí, necesito adaptaciones por razones de neurodiversidad (p. ej., TDAH, dislexia, autismo, etc.).' },
    { value: 'auditiva', label: 'Sí, necesito apoyo relacionado con discapacidad auditiva.' },
    { value: 'visual', label: 'Sí, necesito apoyo relacionado con discapacidad visual.' },
    { value: 'ninguna', label: 'No, no tengo ninguna necesidad específica.' },
    { value: 'otro', label: 'Otro' }
  ],
  programs: [
    // ANALISTA DE COMPRAS CON SAP
    { value: 'ANALISTA DE COMPRAS CON SAP', label: 'ANALISTA DE COMPRAS CON SAP', category: 'pee' },

    // ANALISTA DE DATOS
    { value: 'ANALISTA DE DATOS', label: 'ANALISTA DE DATOS', category: 'pee' },

    // ANALISTA DE PROCESOS
    { value: 'ANALISTA DE PROCESOS', label: 'ANALISTA DE PROCESOS', category: 'pee' },

    // ANALISTA DE PROYECTOS
    { value: 'ANALISTA DE PROYECTOS', label: 'ANALISTA DE PROYECTOS', category: 'pee' },

    // AUTOCAD
    { value: 'AUTOCAD', label: 'AUTOCAD', category: 'curso' },

    // AZURE
    { value: 'AZURE', label: 'AZURE', category: 'curso' },

    // BIZAGI: MODELAMIENTO DE PROCESOS
    { value: 'BIZAGI: MODELAMIENTO DE PROCESOS', label: 'BIZAGI: MODELAMIENTO DE PROCESOS', category: 'curso' },

    // BUSINESS ANALYTICS
    { value: 'BUSINESS ANALYTICS', label: 'BUSINESS ANALYTICS', category: 'curso' },

    // CIBERSEGURIDAD
    { value: 'CIBERSEGURIDAD', label: 'CIBERSEGURIDAD', category: 'curso' },

    // CONTABILIDAD FINANCIERA CON ERP
    { value: 'CONTABILIDAD FINANCIERA CON ERP', label: 'CONTABILIDAD FINANCIERA CON ERP', category: 'curso' },

    // COSTOS Y PRESUPUESTOS
    { value: 'COSTOS Y PRESUPUESTOS', label: 'COSTOS Y PRESUPUESTOS', category: 'curso' },

    // DATA ANALYTICS
    { value: 'DATA ANALYTICS', label: 'DATA ANALYTICS', category: 'curso' },

    // DATABRICKS
    { value: 'DATABRICKS', label: 'DATABRICKS', category: 'curso' },

    // DESARROLLO FRONT END
    { value: 'DESARROLLO FRONT END', label: 'DESARROLLO FRONT END', category: 'especializacion' },

    // ESPECIALISTA EN COMPRAS CON SAP
    { value: 'ESPECIALISTA EN COMPRAS CON SAP', label: 'ESPECIALISTA EN COMPRAS CON SAP', category: 'especializacion' },

    // ESTRATEGIAS Y TÉCNICAS COMERICALES
    { value: 'ESTRATEGIAS Y TÉCNICAS COMERICALES', label: 'ESTRATEGIAS Y TÉCNICAS COMERICALES', category: 'curso' },

    // EXCEL EXPERT
    { value: 'EXCEL EXPERT', label: 'EXCEL EXPERT', category: 'especializacion' },

    // FINANZAS APLICADAS
    { value: 'FINANZAS APLICADAS', label: 'FINANZAS APLICADAS', category: 'especializacion' },

    // GERENCIA DE CENTROS DE DISTRIBUCIÓN Y ALMACENES
    { value: 'GERENCIA DE CENTROS DE DISTRIBUCIÓN Y ALMACENES', label: 'GERENCIA DE CENTROS DE DISTRIBUCIÓN Y ALMACENES', category: 'curso' },

    // GESTIÓN ÁGIL DE PROYECTOS
    { value: 'GESTIÓN ÁGIL DE PROYECTOS', label: 'GESTIÓN ÁGIL DE PROYECTOS', category: 'curso' },

    // GESTIÓN DE COMERCIO INTERNACIONAL
    { value: 'GESTIÓN DE COMERCIO INTERNACIONAL', label: 'GESTIÓN DE COMERCIO INTERNACIONAL', category: 'curso' },

    // GESTIÓN DE COMPRAS Y PROVEEDORES
    { value: 'GESTIÓN DE COMPRAS Y PROVEEDORES', label: 'GESTIÓN DE COMPRAS Y PROVEEDORES', category: 'curso' },

    // GESTIÓN DE INDICADORES KPIS Y OKRS
    { value: 'GESTIÓN DE INDICADORES KPIS Y OKRS', label: 'GESTIÓN DE INDICADORES KPIS Y OKRS', category: 'curso' },

    // GESTIÓN DE PROCESOS
    { value: 'GESTIÓN DE PROCESOS', label: 'GESTIÓN DE PROCESOS', category: 'curso' },

    // GESTIÓN DE PROCESOS Y MEJORA CONTINUA
    { value: 'GESTIÓN DE PROCESOS Y MEJORA CONTINUA', label: 'GESTIÓN DE PROCESOS Y MEJORA CONTINUA', category: 'diplomado' },

    // GESTIÓN DE PROYECTOS
    { value: 'GESTIÓN DE PROYECTOS', label: 'GESTIÓN DE PROYECTOS', category: 'diplomado' },
    { value: 'GESTIÓN DE PROYECTOS', label: 'GESTIÓN DE PROYECTOS', category: 'especializacion' },

    // GESTIÓN DE PROYECTOS I
    { value: 'GESTIÓN DE PROYECTOS I', label: 'GESTIÓN DE PROYECTOS I', category: 'curso' },

    // GESTIÓN DE TRANSPORTES Y CANALES DE DISTRIBUCIÓN
    { value: 'GESTIÓN DE TRANSPORTES Y CANALES DE DISTRIBUCIÓN', label: 'GESTIÓN DE TRANSPORTES Y CANALES DE DISTRIBUCIÓN', category: 'curso' },

    // GESTIÓN FINANCIERA
    { value: 'GESTIÓN FINANCIERA', label: 'GESTIÓN FINANCIERA', category: 'diplomado' },

    // GESTIÓN FINANCIERA DE PROYECTOS
    { value: 'GESTIÓN FINANCIERA DE PROYECTOS', label: 'GESTIÓN FINANCIERA DE PROYECTOS', category: 'curso' },

    // IA & DEEP LEARNING
    { value: 'IA & DEEP LEARNING', label: 'IA & DEEP LEARNING', category: 'curso' },

    // INTELIGENCIA Y ANÁLISIS DE DATOS
    { value: 'INTELIGENCIA Y ANÁLISIS DE DATOS', label: 'INTELIGENCIA Y ANÁLISIS DE DATOS', category: 'diplomado' },

    // KPIS LOGÍSTICOS CON POWER BI
    { value: 'KPIS LOGÍSTICOS CON POWER BI', label: 'KPIS LOGÍSTICOS CON POWER BI', category: 'curso' },

    // LEAN LOGISTICS
    { value: 'LEAN LOGISTICS', label: 'LEAN LOGISTICS', category: 'curso' },

    // LEAN SIX SIGMA
    { value: 'LEAN SIX SIGMA', label: 'LEAN SIX SIGMA', category: 'curso' },

    // LEAN SIX SIGMA YELLOW BELT
    { value: 'LEAN SIX SIGMA YELLOW BELT', label: 'LEAN SIX SIGMA YELLOW BELT', category: 'curso' },

    // MICROSOFT EXCEL
    { value: 'MICROSOFT EXCEL', label: 'MICROSOFT EXCEL', category: 'especializacion' },

    // MICROSOFT EXCEL AVANZADO
    { value: 'MICROSOFT EXCEL AVANZADO', label: 'MICROSOFT EXCEL AVANZADO', category: 'curso' },

    // MICROSOFT EXCEL BÁSICO
    { value: 'MICROSOFT EXCEL BÁSICO', label: 'MICROSOFT EXCEL BÁSICO', category: 'curso' },

    // MICROSOFT EXCEL INTERMEDIO
    { value: 'MICROSOFT EXCEL INTERMEDIO', label: 'MICROSOFT EXCEL INTERMEDIO', category: 'curso' },

    // MICROSOFT PROJECT: GESTIÓN DE PROYECTOS
    { value: 'MICROSOFT PROJECT: GESTIÓN DE PROYECTOS', label: 'MICROSOFT PROJECT: GESTIÓN DE PROYECTOS', category: 'curso' },

    // MODELAMIENTO DE PROCESOS CON BIZAGI
    { value: 'MODELAMIENTO DE PROCESOS CON BIZAGI', label: 'MODELAMIENTO DE PROCESOS CON BIZAGI', category: 'curso' },

    // PLANEAMIENTO DE LA DEMANDA
    { value: 'PLANEAMIENTO DE LA DEMANDA', label: 'PLANEAMIENTO DE LA DEMANDA', category: 'pee' },

    // PLANEAMIENTO FINANCIERO
    { value: 'PLANEAMIENTO FINANCIERO', label: 'PLANEAMIENTO FINANCIERO', category: 'curso' },

    // PLANEAMIENTO Y PRONÓSTICO DE LA DEMANDA
    { value: 'PLANEAMIENTO Y PRONÓSTICO DE LA DEMANDA', label: 'PLANEAMIENTO Y PRONÓSTICO DE LA DEMANDA', category: 'curso' },

    // PMO: GESTIÓN DE PORTAFOLIO Y OFICINA DE PROYECTOS
    { value: 'PMO: GESTIÓN DE PORTAFOLIO Y OFICINA DE PROYECTOS', label: 'PMO: GESTIÓN DE PORTAFOLIO Y OFICINA DE PROYECTOS', category: 'curso' },

    // POWER APPS Y POWER AUTOMATE
    { value: 'POWER APPS Y POWER AUTOMATE', label: 'POWER APPS Y POWER AUTOMATE', category: 'curso' },
    { value: 'POWER APPS Y POWER AUTOMATE', label: 'POWER APPS Y POWER AUTOMATE', category: 'especializacion' },

    // POWER APPS Y POWER AUTOMATE AVANZADO
    { value: 'POWER APPS Y POWER AUTOMATE AVANZADO', label: 'POWER APPS Y POWER AUTOMATE AVANZADO', category: 'curso' },

    // POWER APPS Y POWER AUTOMATE PRESENCIAL
    { value: 'POWER APPS Y POWER AUTOMATE PRESENCIAL', label: 'POWER APPS Y POWER AUTOMATE PRESENCIAL', category: 'curso' },

    // POWER BI
    { value: 'POWER BI', label: 'POWER BI', category: 'curso' },
    { value: 'POWER BI', label: 'POWER BI', category: 'especializacion' },

    // POWER BI AVANZADO - DAX
    { value: 'POWER BI AVANZADO - DAX', label: 'POWER BI AVANZADO - DAX', category: 'curso' },

    // PROGRAMACIÓN CON VBA MACROS EN EXCEL
    { value: 'PROGRAMACIÓN CON VBA MACROS EN EXCEL', label: 'PROGRAMACIÓN CON VBA MACROS EN EXCEL', category: 'curso' },

    // PROGRAMACIÓN JAVASCRIPT WEB
    { value: 'PROGRAMACIÓN JAVASCRIPT WEB', label: 'PROGRAMACIÓN JAVASCRIPT WEB', category: 'curso' },

    // PROGRAMACIÓN WEB
    { value: 'PROGRAMACIÓN WEB', label: 'PROGRAMACIÓN WEB', category: 'curso' },

    // PYTHON AVANZADO: MACHINE LEARNING
    { value: 'PYTHON AVANZADO: MACHINE LEARNING', label: 'PYTHON AVANZADO: MACHINE LEARNING', category: 'curso' },

    // PYTHON: ANÁLISIS DE DATOS
    { value: 'PYTHON: ANÁLISIS DE DATOS', label: 'PYTHON: ANÁLISIS DE DATOS', category: 'curso' },

    // PYTHON: DATA SCIENCE
    { value: 'PYTHON: DATA SCIENCE', label: 'PYTHON: DATA SCIENCE', category: 'especializacion' },

    // REACT JS & REACT NATIVE
    { value: 'REACT JS & REACT NATIVE', label: 'REACT JS & REACT NATIVE', category: 'curso' },

    // ROBOTIZACIÓN DE PROCESOS CON UIPATH
    { value: 'ROBOTIZACIÓN DE PROCESOS CON UIPATH', label: 'ROBOTIZACIÓN DE PROCESOS CON UIPATH', category: 'curso' },

    // SAP S/4 HANA
    { value: 'SAP S/4 HANA', label: 'SAP S/4 HANA', category: 'especializacion' },

    // SAP S/4 HANA EWM: LOGÍSTICA Y ALMACENES
    { value: 'SAP S/4 HANA EWM: LOGÍSTICA Y ALMACENES', label: 'SAP S/4 HANA EWM: LOGÍSTICA Y ALMACENES', category: 'curso' },

    // SAP S/4 HANA FI: CONTABILIDAD FINANCIERA
    { value: 'SAP S/4 HANA FI: CONTABILIDAD FINANCIERA', label: 'SAP S/4 HANA FI: CONTABILIDAD FINANCIERA', category: 'curso' },

    // SAP S/4 HANA HCM: GESTIÓN DEL CAPITAL HUMANO
    { value: 'SAP S/4 HANA HCM: GESTIÓN DEL CAPITAL HUMANO', label: 'SAP S/4 HANA HCM: GESTIÓN DEL CAPITAL HUMANO', category: 'curso' },

    // SAP S/4 HANA IN: SAP INTEGRAL (MM+PP+SD+FI)
    { value: 'SAP S/4 HANA IN: SAP INTEGRAL (MM+PP+SD+FI)', label: 'SAP S/4 HANA IN: SAP INTEGRAL (MM+PP+SD+FI)', category: 'curso' },

    // SAP S/4 HANA MM: LOGÍSTICA Y MATERIALES
    { value: 'SAP S/4 HANA MM: LOGÍSTICA Y MATERIALES', label: 'SAP S/4 HANA MM: LOGÍSTICA Y MATERIALES', category: 'curso' },

    // SAP S/4 HANA PM: MANTENIMIENTO DE PLANTA
    { value: 'SAP S/4 HANA PM: MANTENIMIENTO DE PLANTA', label: 'SAP S/4 HANA PM: MANTENIMIENTO DE PLANTA', category: 'curso' },

    // SAP S/4 HANA PP: PRODUCCIÓN
    { value: 'SAP S/4 HANA PP: PRODUCCIÓN', label: 'SAP S/4 HANA PP: PRODUCCIÓN', category: 'curso' },

    // SAP S/4 HANA SD: LOGÍSTICA Y DISTRIBUCIÓN
    { value: 'SAP S/4 HANA SD: LOGÍSTICA Y DISTRIBUCIÓN', label: 'SAP S/4 HANA SD: LOGÍSTICA Y DISTRIBUCIÓN', category: 'curso' },

    // SAP S/4 HANA: COMPRAS Y ALMACENES
    { value: 'SAP S/4 HANA: COMPRAS Y ALMACENES', label: 'SAP S/4 HANA: COMPRAS Y ALMACENES', category: 'especializacion' },

    // SAP S/4 HANA: GESTIÓN FINANCIERA
    { value: 'SAP S/4 HANA: GESTIÓN FINANCIERA', label: 'SAP S/4 HANA: GESTIÓN FINANCIERA', category: 'especializacion' },

    // SAP S/4 HANA: LOGÍSTICA INTEGRAL
    { value: 'SAP S/4 HANA: LOGÍSTICA INTEGRAL', label: 'SAP S/4 HANA: LOGÍSTICA INTEGRAL', category: 'especializacion' },

    // SAP S/4 HANA: MINERÍA
    { value: 'SAP S/4 HANA: MINERÍA', label: 'SAP S/4 HANA: MINERÍA', category: 'especializacion' },

    // SAP S/4 HANA: PLANIFICACIÓN DE LA PRODUCCIÓN
    { value: 'SAP S/4 HANA: PLANIFICACIÓN DE LA PRODUCCIÓN', label: 'SAP S/4 HANA: PLANIFICACIÓN DE LA PRODUCCIÓN', category: 'especializacion' },

    // SQL SERVER AVANZADO
    { value: 'SQL SERVER AVANZADO', label: 'SQL SERVER AVANZADO', category: 'curso' },

    // SQL SERVER FOR ANALYTICS
    { value: 'SQL SERVER FOR ANALYTICS', label: 'SQL SERVER FOR ANALYTICS', category: 'curso' },

    // SQL SERVER
    { value: 'SQL SERVER', label: 'SQL SERVER', category: 'especializacion' },

    // SUPPLY CHAIN ANALYTICS
    { value: 'SUPPLY CHAIN ANALYTICS', label: 'SUPPLY CHAIN ANALYTICS', category: 'curso' },

    // SUPPLY CHAIN MANAGEMENT
    { value: 'SUPPLY CHAIN MANAGEMENT', label: 'SUPPLY CHAIN MANAGEMENT', category: 'diplomado' },

    // VBA MACROS EN MICROSOFT EXCEL
    { value: 'VBA MACROS EN MICROSOFT EXCEL', label: 'VBA MACROS EN MICROSOFT EXCEL', category: 'especializacion' }
  ]
}
const canNext = computed(() => currentStep.value < maxStep && sectionReady(currentStep.value))

/* --------------------
 * Validación / progreso
 * -------------------- */
const required = ['email','documento', 'born', 'apellidos', 'nombres', 'categoriaPrograma', 'programa',
  'carrera', 'universidad', 'gradoAcademico', 'situacionActual', 'programaEmprendimiento',
  'tallerSpeaking', 'pais', 'departamento', 'necesidadEspecial'
]
const requiredFilled = computed(() => required.filter(k => !!form[k]).length)
const requiredTotal = required.length
const isValid = computed(() => requiredFilled.value === requiredTotal)
const validPhone = computed(() => /^9\d{8}$/.test(form.celular || ''))

function touch(field){ touched[field] = true }
function vClass(field){ return touched[field] && !form[field] ? 'invalid' : '' }

const progressPct = computed(() => {
  const found = sections.find(s => s.step === currentStep.value)
  return found ? found.porcent : 0
})

/* --------------------
 * Lógica de perfil
 * -------------------- */
const isLaborando = computed(() => form.situacionActual === 'me encuentro laborando')

watch(() => form.situacionActual, (val) => {
  if(val !== 'me encuentro laborando'){
    // limpiar campos de trabajo si no labura
    form.areaActual = null
    form.areaDeseada = null
    form.empresa = ''
    form.puesto = ''
    form.aniosExp = null
    form.sector = null
  }
})

/* --------------------
 * Navegación por pasos
 * -------------------- */
function goTo(n){ if(n >= minStep && n <= maxStep) currentStep.value = n }
function prev(){ if(currentStep.value > minStep) currentStep.value-- }

function stepClass(n){
  return {
    active: currentStep.value === n,
    done: n < currentStep.value
  }
}

function sectionReachable(n){
  // Permite ir hacia atrás siempre; hacia adelante solo si los anteriores están "listos"
  if(n <= currentStep.value) return true
  // Valida requisitos mínimos por paso
  for(let i = minStep; i < n; i++){
    if(!sectionReady(i)) return false
  }
  return true
}
function sectionReady(n){
  // 1 Bienvenida: siempre
  if(n === 1) return true
  // 2 Contacto: todo lo requerido + teléfono válido
  if(n === 2) return ['email','born','documento','apellidos','nombres'].every(k => !!form[k]) 
  // 3 Programa
  if(n === 3) return !!form.categoriaPrograma && !!form.programa
  // 4 Perfil: opcional (si elige "Otra", no es obligatorio completar el texto)
  if(n === 4){
    if(!!form.situacionActual && !!form.gradoAcademico && !!form.universidad && !!form.carrera && !!form.pais && !!form.departamento){
      if(isLaborando.value){
        return ['areaActual','areaDeseada','empresa','puesto','aniosExp','sector'].every(k => !!form[k])
      }
      return true
    }
    return false
  } 
  // 5 Accesibilidad
  if(n === 5) return !!form.necesidadEspecial && (form.necesidadEspecial !== 'otro' || !!form.necesidadEspecialOtra)
  // 6 Identidad (opcional)
  if(n === 6) return !!files.front && !!files.back
  // 7 Despedida (final)
  if(n === 7) return true
  return false
}

/* --------------------
 * UX helpers
 * -------------------- */
function maskPhone(){ form.celular = (form.celular || '').replace(/\D/g,'').slice(0,9) }
function showToast(msg){ toast.value = msg; setTimeout(()=> toast.value = '', 2400) }

/* --------------------
 * Archivos + previews
 * -------------------- */
function onFile(e, side){
  const file = e.target.files?.[0]
  touchedFiles[side] = true                // ✅ marcar como tocado
  files[side] = file || null
  if(file){
    const reader = new FileReader()
    reader.onload = ev => { previews[side] = String(ev.target?.result || '') }
    reader.readAsDataURL(file)
  } else {
    previews[side] = ''
  }
}

/* --------------------
 * Autosave (localStorage)
 * -------------------- */
const STORAGE_KEY = 'weee_form_v2'

watch(form, (val)=>{
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  autosaveState.value = 'borrador guardado'
}, { deep: true })

onMounted(()=>{
  const raw = localStorage.getItem(STORAGE_KEY)
  if(raw){
    try { Object.assign(form, JSON.parse(raw)) } catch(e){}
  }
  autosaveState.value = 'activo'
})

/* --------------------
 * Submit (demo)
 * -------------------- */
let allowAutosave = true
watch(form, (val) => {
  if (!allowAutosave) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  autosaveState.value = 'borrador guardado'
}, { deep: true })


function resetForm () {
  allowAutosave = false
  // limpiar reactividad del form
  Object.assign(form, defaultForm)

  // archivos y vistas previas
  files.front = null
  files.back  = null
  previews.front = ''
  previews.back  = ''

  // limpiar inputs file nativos
  if (dniFront.value) dniFront.value.value = ''
  if (dniBack.value)  dniBack.value.value  = ''

  // limpiar “touched” y validaciones
  for (const k in touched) delete touched[k]
  touchedFiles.front = false
  touchedFiles.back  = false

  // limpiar borrador
  localStorage.removeItem(STORAGE_KEY)
  autosaveState.value = 'inactivo'

  // volver al inicio y barra de progreso
  currentStep.value = minStep
  window.scrollTo({ top: 0, behavior: 'smooth' })
  setTimeout(() => { allowAutosave = true; autosaveState.value = 'activo' }, 200)
}

async function uploadDirect(side){
  const f = files[side]
  if (!f) return { key: '', url: '' }

  // Firmar upload
  const {data: sign} = await api.post('/upload/sign', {
    contentType: f.type,
    side
  })

  await fetch(sign.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': f.type,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'x-goog-meta-side': side
    },
    body: f
  })

  // Devolvemos ambas cosas
  return { key: sign.key, url: sign.publicUrl }
}


async function submit(){
  if (!files.front || !files.back) {
    touchedFiles.front = true
    touchedFiles.back  = true
    showToast('Por favor, adjunta ambas caras del DNI antes de enviar.')
    return
  }

  try {
    isSubmitting.value = true

    const front = await uploadDirect('front')
    const back  = await uploadDirect('back')

    const payload = {
      ...form,
      archivos: {
        dni_front_key: front.key,
        dni_back_key:  back.key,
        dni_front_url: front.url,   // opcional (útil si algún día haces público el bucket)
        dni_back_url:  back.url
      }
    }

    // Enviar ficha
    const {data} = await api.post('/inscripcion', payload)
    if (!data.ok) throw new Error('Fallo al registrar')

    showSuccess.value = true     // mostramos modal
  } catch (e) {
    console.error(e)
    showToast('⚠️ Ocurrió un problema al enviar. Intenta de nuevo.')
  } finally {
    isSubmitting.value = false
  }
}

  const programList = ref([])

  function onChangeCategory(opcion) {
    form.programa = null
    programList.value = catalogo.programs.filter(p => p.category === opcion.value)
    
  }
      
  function clearFile(side) {
    // borrar de la reactividad
    files[side] = null
    previews[side] = ''
    touchedFiles[side] = false

    // limpiar input nativo
    if (side === 'front' && dniFront.value) {
      dniFront.value.value = ''
    }
    if (side === 'back' && dniBack.value) {
      dniBack.value.value = ''
    }
  }


</script>

<style scoped>
/* ====== Layout ====== */
.page { display: grid; gap: 16px; padding: 16px; }
.grid { display: grid; grid-template-columns: 1fr; gap: 16px; align-items: start; }
.grid.no-preview { grid-template-columns: 1fr; }
@media (max-width: 1100px){ .grid { grid-template-columns: 1fr; } }

/* ====== Topbar ====== */
.topbar {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 16px;
  background: linear-gradient(135deg,#eef2ff,#f5f3ff);
  border: 1px solid #e5e7eb;
  box-shadow: 0 6px 20px rgba(0,0,0,.04);
}
.brand{ display:flex; align-items:center; gap:12px; }
.brand-title{ font-weight:700; letter-spacing:.2px; }
.brand-sub{ font-size:.8rem; color:#6b7280; }
.actions{ display:flex; gap:8px; }

/* ====== Buttons ====== */
.btn{ appearance:none; border:1px solid #1f2937; background:#111827; color:#fff; padding:8px 12px; border-radius:10px; font-weight:600; box-shadow:0 2px 0 #0b0f17; transition: transform .05s ease, box-shadow .2s ease, background .2s; }
.btn:hover{ transform: translateY(-1px); box-shadow:0 5px 14px rgba(0,0,0,.15); }
.btn:disabled{ opacity:.6; cursor:not-allowed; }
.btn.primary{ background:#3b82f6; border-color:#2563eb; box-shadow:0 2px 0 #1d4ed8; }
.btn.ghost{ background:#fff; color:#111827; border-color:#e5e7eb; box-shadow:none; }

/* ====== Progress / Stepper ====== */
.progress-wrap{ display:grid; gap:8px; }
.progress{ height:8px; background:#eef2ff; border-radius:9999px; overflow:hidden; border:1px solid #e5e7eb; }
.bar{ height:100%; background:linear-gradient(90deg,#3b82f6,#8b5cf6); width:0; transition: width .4s ease; }
.stepper{ display:flex; flex-wrap:wrap; gap:6px; }
.step{ display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:9999px; border:1px solid #e5e7eb; background:#fff; font-weight:600; color:#374151; }
.step .idx{ display:inline-grid; place-items:center; width:22px; height:22px; border-radius:9999px; background:#f3f4f6; font-size:.8rem; font-weight:700; }
.step.active{ border-color:#3b82f6; color:#1f2937; }
.step.done{ background:linear-gradient(180deg,#f8fafc,#ffffff); }
.step:disabled{ opacity:.5 }

/* ====== Cards ====== */
.card{ background:#fff; border:1px solid #e5e7eb; border-radius:16px; padding:16px; box-shadow:0 8px 24px rgba(0,0,0,.05); }
.form-card{ overflow:visible; }

/* ====== Form ====== */
.form-section{ display:grid; gap:14px; }
.form-section h3{ margin:0; font-size:1rem; text-transform:uppercase; letter-spacing:.06em; color:#111827; position:relative; padding-left:10px; }
.form-section h3:before{ content:''; position:absolute; left:0; top:3px; bottom:3px; width:3px; background:#3b82f6; border-radius:3px; }
.row{ display:flex; flex-wrap:wrap; margin:-8px; }
.col-12{ width:100%; padding:8px; }
.col-8{ width:66.6666%; padding:8px; }
.col-6{ width:50%; padding:8px; }
.col-4{ width:33.3333%; padding:8px; }
.col-3{ width:25%; padding:8px; }
.col-2{ width:16.6666%; padding:8px; }
@media (max-width: 900px){ .col-8,.col-6,.col-4,.col-3,.col-2{ width:100%; } }

.field{ display:grid; gap:6px; min-height: 96px; }
label{ font-size:.85rem; color:#111827; font-weight:600; }
.req{ color:#ef4444; }
input, select{ border:1px solid #e5e7eb; border-radius:10px; padding:10px 12px; font-size:.95rem; outline:none; transition: box-shadow .15s ease, border .15s ease; }
input:focus, select:focus{ border-color:#93c5fd; box-shadow:0 0 0 4px rgba(59,130,246,.12); }
.invalid{ border-color:#f87171 !important; box-shadow:0 0 0 4px rgba(248,113,113,.12) !important; }
.err{ color:#ef4444; font-size:.8rem; }
.muted{ color:#6b7280; font-size:.9rem; }

/* Step nav */
.step-nav{ display:flex; justify-content:space-between; margin-top:8px; }

/* Cuando es el paso 1, centramos los botones */
.step-nav--center {
  justify-content: center;
}
/* Thumbnails */
.thumb{ margin-top:8px; border:1px solid #e5e7eb; border-radius:10px; padding:6px; width:100%; max-width:240px; background:#fafafa }
.thumb img{ width:100%; border-radius:8px; display:block; }

/* Animations */
.fade-slide-enter-active,.fade-slide-leave-active{ transition: all .24s ease; }
.fade-slide-enter-from{ opacity:0; transform: translateY(8px); }
.fade-slide-leave-to{ opacity:0; transform: translateY(-8px); }
.toast-enter-active,.toast-leave-active{ transition: opacity .25s ease, transform .25s ease; }
.toast-enter-from,.toast-leave-to{ opacity:0; transform: translateY(8px); }
.toast{ position:fixed; right:16px; bottom:16px; background:#111827; color:#fff; padding:10px 14px; border-radius:12px; box-shadow:0 10px 24px rgba(0,0,0,.16); z-index:20 }
/* Subtítulo interno de secciones (para “Experiencia Laboral”) */
.form-section-subtitle {
  margin-top: 6px;
  margin-bottom: 4px;
  padding: 10px 12px;
  border-radius: 10px;
  background: linear-gradient(180deg,#f9fafb,#ffffff);
  border: 1px solid #e5e7eb;
}

.form-section-subtitle h4 {
  margin: 0 0 4px;
  font-size: .95rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: .02em;
}

.form-section-subtitle + .row {
  margin-top: 6px;
}
/* Mensaje de ayuda: oculto por defecto */
.assist{
  opacity: 0;
  max-height: 0;
  overflow: hidden;
  font-size: .8rem;
  color: #6b7280;
  transition: opacity .2s ease, max-height .2s ease;
}

/* Cuando el campo tiene foco en cualquier hijo (input interno del SearchSelect), mostrar */
.field:focus-within .assist{
  opacity: 1;
  max-height: 40px; /* suficiente para una línea */
}

/* Si ya eligió "otra", mantenlo visible */
.assist--persist{
  opacity: 1 !important;
  max-height: 40px !important;
}
.modal-backdrop{
  position: fixed; inset: 0;
  background: rgba(17,24,39,.5);
  display: grid; place-items: center;
  z-index: 50;
  padding: 16px;
}
.modal-card{
  width: 100%; max-width: 480px;
  background: #fff; border: 1px solid #e5e7eb;
  border-radius: 16px; padding: 20px;
  text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,.15);
}
.modal-icon{ font-size: 40px; margin-bottom: 6px; }
.modal-title{ margin: 0 0 6px; font-size: 1.15rem; }
.modal-text{ margin: 0 0 14px; color:#6b7280; }
.brand-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0; /* que no se achique demasiado */
}

.brand-title {
  font-weight: 700;
  letter-spacing: .2px;
}

.brand-sub {
  font-size: .8rem;
  color: #6b7280;
}

/* Hero banner sin marco, pegado al ancho */
.hero-banner {
  margin-top: 4px;
}

.hero-banner--plain {
  border-radius: 0;
  overflow: hidden;
}

.hero-banner-img {
  display: block;
  width: 100%;
  object-fit:contain;
  margin-left: auto;
  margin-right: auto;
}

/* En móvil, que no sea tan alto */
@media (max-width: 640px) {
  .hero-banner-img {
    max-height: 80px;
  }
}
/* Responsive */
@media (max-width: 640px) {
  .topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .brand-banner {
    justify-content: center;      /* en móvil lo centramos */
  }

  .brand-banner-img {
    max-width: 100%;
    max-height: 48px;
  }
}
.file-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  padding-right: 40px; /* espacio para la X */
}

/* El input ocupa todo el ancho */
.file-input-wrap input[type="file"] {
  flex: 1;
}

/* Nombre del archivo (opcional) */
.file-name {
  position: absolute;
  left: 12px;
  right: 40px;
  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: .8rem;
  color: #4b5563;
}

/* Botón X */
.file-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: #ef4444;
  color: #fff;
  border-radius: 999px;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
}

.file-clear:hover {
  background: #b91c1c;
}
.upload-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px dashed #cbd5f5;
  background: #f9fafb;
  cursor: pointer;
  transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
}

.upload-card:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 0 0 3px rgba(59,130,246,.12);
}

.upload-card--filled {
  border-style: solid;
  border-color: #3b82f6;
  background: #ffffff;
}

.upload-card__icon {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 18px;
  flex-shrink: 0;
}

.upload-card__body {
  flex: 1;
  min-width: 0;
}

.upload-card__title {
  font-size: .9rem;
  font-weight: 600;
  color: #111827;
}

.upload-card__subtitle {
  font-size: .8rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Botón X */
.upload-card__clear {
  border: none;
  background: #ef4444;
  color: #fff;
  border-radius: 999px;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  flex-shrink: 0;
}

.upload-card__clear:hover {
  background: #b91c1c;
}

/* Input file real: invisible pero ocupa toda la card */
.upload-card__input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

</style>
