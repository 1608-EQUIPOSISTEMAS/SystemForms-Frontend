<template>
    <div class="form-view" :class="{ 'exam-mode': isExam }">
        <!-- Loading -->
        <div v-if="loading" class="state-screen">
          <div class="loader"></div>
          <p class="state-text">Cargando formulario...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="state-screen">
          <div class="state-icon error">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/>
            </svg>
          </div>
          <h2 class="state-title">{{ error }}</h2>
          <p class="state-text">No se pudo cargar el formulario.</p>
        </div>

        <template v-else-if="form">
        <!-- PASO 0: VALIDACIÓN ODOO - SPLIT SCREEN -->
        <div v-if="requiresOdooValidation && !odooValidated && !started" class="validation-screen">
      
      <!-- LADO IZQUIERDO: BRANDING (Solo Desktop) -->
      <div class="validation-brand">
        <div class="brand-content">
          <div class="brand-logo-wrapper">
            <img src="@/assets/images/weonline.png" alt="WE Online" class="brand-logo" />
          </div>
          
          <h1 class="brand-title">{{ form.title }}</h1>
          <p v-if="form.description" class="brand-description">{{ form.description }}</p>
          
          <div v-if="isExam" class="brand-chips">
            <div class="brand-chip" v-if="form.time_limit_minutes">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>{{ form.time_limit_minutes }} minutos</span>
            </div>
            <div class="brand-chip">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              <span>{{ questions.length }} preguntas</span>
            </div>
            <div class="brand-chip">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              <span>Nota minima aprobatoria: 11</span>
            </div>
          </div>
          
          <div class="brand-decoration">
            <div class="decoration-circle circle-1"></div>
            <div class="decoration-circle circle-2"></div>
            <div class="decoration-circle circle-3"></div>
          </div>
        </div>
        
        <div class="brand-footer">
          <span>W|E Educación Ejecutiva</span>
        </div>
      </div>
      
      <!-- LADO DERECHO: FORMULARIO -->
      <div class="validation-form-side">
        <div class="validation-form-container">
          
          <!-- Header móvil con gradiente (Solo Mobile/Tablet) -->
          <div class="mobile-header">
            <img src="@/assets/images/weonline.png" alt="WE Online" class="mobile-logo" />
            <h2 class="mobile-title">{{ form.title }}</h2>
          </div>
          
          <!-- Contenido del formulario -->
          <div class="mobile-form-content">
            <!-- Icono -->
            <div class="form-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                <circle cx="12" cy="16" r="1"/>
              </svg>
            </div>
            
            <!-- Título y subtítulo -->
            <h2 class="form-title">Verificar acceso</h2>
            <p class="form-subtitle">Ingresa el correo registrado en el Campus Virtual para continuar</p>
            
            <!-- Formulario -->
            <form @submit.prevent="validateOdooEmail" class="validation-form">
              <div class="input-wrapper">
                <label class="input-label">Correo electrónico</label>
                <div class="input-field" :class="{ 'has-error': odooError, 'is-focused': emailFocused }">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input 
                    type="email" 
                    v-model="odooEmail" 
                    placeholder="tucorreo@ejemplo.com" 
                    :disabled="validatingOdoo" 
                    required 
                    autofocus
                    @focus="emailFocused = true"
                    @blur="emailFocused = false"
                  />
                </div>
              </div>
              
              <!-- Mensaje de error -->
              <div v-if="odooError" class="error-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{{ odooError }}</span>
              </div>
              
              <!-- Botón submit -->
              <button type="submit" class="submit-btn" :disabled="validatingOdoo || !odooEmail">
                <span v-if="validatingOdoo" class="btn-loader"></span>
                <span class="btn-text">{{ validatingOdoo ? 'Verificando...' : 'Continuar' }}</span>
                <svg v-if="!validatingOdoo" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </form>
            
            <!-- Ayuda -->
            <div class="form-help">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>¿Problemas para acceder? Contacta a soporte</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>

    <!-- PASO 1: VERIFICANDO RESPUESTA PREVIA -->
    <div v-else-if="checkingPreviousResponse" class="loading-state">
      <div class="spinner"></div>
      <p>Verificando registro...</p>
    </div>

<div v-else-if="previousResponse && previousResponse.status === 'PASSED'" class="result-screen-split">
  
  <!-- LADO IZQUIERDO: BRANDING + SCORE -->
  <div class="result-brand passed">
    <div class="result-brand-content">
      <!-- Logo -->
      <div class="result-logo">
        <img src="@/assets/images/weonline.png" alt="WE Online" />
      </div>
      
      <!-- Score Display Principal -->
      <div class="result-score-hero">
        <div class="score-status-badge success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>Aprobado</span>
        </div>
        
        <div class="score-number-hero">
          <span class="score-value">{{ calculateScore(previousResponse.data.total_score, previousResponse.data.max_score) }}</span>
          <span class="score-separator">/</span>
          <span class="score-max">20</span>
        </div>
        
        <p class="score-label-hero">Nota obtenida</p>
      </div>
      
      <!-- Stats minimalistas -->
      <div class="result-stats-row">
        <div class="stat-item">
          <span class="stat-number">{{ previousResponse.data.correct_count || 0 }}</span>
          <span class="stat-label">Correctas</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number">{{ previousResponse.data.total_questions || 0 }}</span>
          <span class="stat-label">Total</span>
        </div>
      </div>
    </div>
    
    <!-- Footer del lado izquierdo -->
    <div class="result-brand-footer">
      <span>W|E Educación Ejecutiva</span>
    </div>
  </div>
  
  <!-- LADO DERECHO: DETALLES + ACCIONES -->
  <div class="result-details-side">
    <div class="result-details-container">
      
      <!-- Header móvil (solo mobile) -->
      <div class="result-mobile-header">
        <img src="@/assets/images/weonline.png" alt="WE Online" class="mobile-logo" />
        <div class="mobile-score-badge success">
          <span>{{ calculateScore(previousResponse.data.total_score, previousResponse.data.max_score) }}/20</span>
          <span class="badge-status">Aprobado</span>
        </div>
      </div>
      
      <!-- Contenido -->
      <div class="result-details-content">
        <!-- Icono + Título -->
        <div class="result-header-icon success">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        
        <h1 class="result-title">¡Examen Aprobado!</h1>
        <p class="result-subtitle">Has completado exitosamente esta evaluación</p>
        
        <!-- Info Cards -->
        <div class="result-info-grid">
          <div class="info-card">
            <div class="info-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div class="info-content">
              <span class="info-label">Fecha de aprobación</span>
                <span class="info-value">{{ formatDate(previousResponse.data.submitted_at).split(',')[0] }}</span>
            </div>
          </div>
          
          <div class="info-card">
            <div class="info-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div class="info-content">
              <span class="info-label">Respuestas correctas</span>
              <span class="info-value">{{ previousResponse.data.correct_count || 0 }} de {{ previousResponse.data.total_questions || 0 }}</span>
            </div>
          </div>
        </div>
        
        <!-- Acciones -->
        <div class="result-actions">
          <button @click="viewFullResult" class="action-btn primary">
            <span>Ver Detalle Completo</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
          
          <button v-if="previousResponse.data.certificate_pdf" @click="downloadCertificate" class="action-btn secondary success">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Descargar Certificado</span>
          </button>
        </div>
        
        <!-- Help text -->
        <p class="result-help-text">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>Tu certificado también está disponible en el Campus Virtual</span>
        </p>
      </div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════════
     ALUMNO REPROBÓ - SPLIT SCREEN LAYOUT
     ═══════════════════════════════════════════════════════════════ -->
<div v-else-if="previousResponse && previousResponse.status === 'FAILED'" class="result-screen-split">
  
  <!-- LADO IZQUIERDO: BRANDING + SCORE -->
  <div class="result-brand failed">
    <div class="result-brand-content">
      <!-- Logo -->
      <div class="result-logo">
        <img src="@/assets/images/weonline.png" alt="WE Online" />
      </div>
      
      <!-- Score Display Principal -->
      <div class="result-score-hero">
        <div class="score-status-badge danger">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <span>No Aprobado</span>
        </div>
        
        <div class="score-number-hero failed">
          <span class="score-value">{{ calculateScore(previousResponse.data.total_score, previousResponse.data.max_score) }}</span>
          <span class="score-separator">/</span>
          <span class="score-max">20</span>
        </div>
        
        <p class="score-label-hero">Nota obtenida</p>
      </div>
      
      <!-- Stats minimalistas -->
      <div class="result-stats-row">
        <div class="stat-item">
          <span class="stat-number">{{ previousResponse.data.correct_count || 0 }}</span>
          <span class="stat-label">Correctas</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number">{{ previousResponse.data.total_questions || 0 }}</span>
          <span class="stat-label">Total</span>
        </div>
      </div>
      
      <!-- Intentos (solo si hay más de uno) -->
      <div v-if="previousResponse.all_attempts && previousResponse.all_attempts.length > 1" class="attempts-indicator">
        <span class="attempts-label">Intento {{ previousResponse.attempt_number }} de 2</span>
        <div class="attempts-dots">
          <span v-for="n in 2" :key="n" class="attempt-dot" :class="{ filled: n <= previousResponse.attempt_number, current: n === previousResponse.attempt_number }"></span>
        </div>
      </div>
    </div>
    
    <!-- Footer del lado izquierdo -->
    <div class="result-brand-footer">
      <span>W|E Educación Ejecutiva</span>
    </div>
  </div>
  
  <!-- LADO DERECHO: DETALLES + ACCIONES -->
  <div class="result-details-side">
    <div class="result-details-container">
      
      <!-- Header móvil (solo mobile) -->
      <div class="result-mobile-header">
        <img src="@/assets/images/weonline.png" alt="WE Online" class="mobile-logo" />
        <div class="mobile-score-badge danger">
          <span>{{ calculateScore(previousResponse.data.total_score, previousResponse.data.max_score) }}/20</span>
          <span class="badge-status">No Aprobado</span>
        </div>
      </div>
      
      <!-- Contenido -->
      <div class="result-details-content">
        <!-- Icono + Título -->
        <div class="result-header-icon danger">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        
        <h1 class="result-title">Examen No Aprobado</h1>
        <p class="result-subtitle">
          {{ previousResponse.attempt_number < 2 ? 'Tienes una oportunidad más para aprobar' : 'Has agotado tus intentos disponibles' }}
        </p>
        
        <!-- Historial de intentos (si hay más de uno) -->
        <div v-if="previousResponse.all_attempts && previousResponse.all_attempts.length > 1" class="attempts-timeline">
          <div 
            v-for="(attempt, idx) in previousResponse.all_attempts" 
            :key="idx"
            class="timeline-item"
            :class="{ current: idx === previousResponse.all_attempts.length - 1 }"
          >
            <div class="timeline-marker">{{ idx + 1 }}</div>
            <div class="timeline-content">
              <span class="timeline-score">{{ calculateScore(attempt.total_score, attempt.max_score) }}/20</span>
                <span class="timeline-date">{{ formatDate(previousResponse.data.submitted_at).split(',')[0] }}</span>
            </div>
          </div>
        </div>
        
        <!-- Info Cards -->
        <div class="result-info-grid">
          <div class="info-card">
            <div class="info-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div class="info-content">
              <span class="info-label">Fecha del intento</span>
                <span class="info-value">{{ formatDate(previousResponse.data.submitted_at).split(',')[0] }}</span>
            </div>
          </div>
          
          <div class="info-card">
            <div class="info-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div class="info-content">
              <span class="info-label">Respuestas correctas</span>
              <span class="info-value">{{ previousResponse.data.correct_count || 0 }} de {{ previousResponse.data.total_questions || 0 }}</span>
            </div>
          </div>
        </div>
        
        <!-- Acciones -->
        <div class="result-actions">
          <!-- Botón reintentar (si tiene intentos) -->
          <button v-if="previousResponse.attempt_number < 2" @click="retakeExam" class="action-btn primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            <span>Volver a Intentar</span>
          </button>
          
          <!-- Mensaje sin intentos -->
          <div v-else class="no-attempts-alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>Has utilizado tus 2 intentos. Contacta el area de academica: 922744702.</span>
          </div>
          
          <button @click="viewFullResult" class="action-btn secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span>Ver Detalle del Intento</span>
          </button>
        </div>
        
        <!-- Oportunidades restantes (si aplica) -->
        <p v-if="previousResponse.attempt_number < 2" class="result-help-text">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>Te queda {{ 2 - previousResponse.attempt_number }} oportunidad{{ 2 - previousResponse.attempt_number === 1 ? '' : 'es' }} para aprobar</span>
        </p>
      </div>
    </div>
  </div>
</div>

      <!-- PASO 2: QUIZ / EXAMEN -->
      <div v-else-if="!submitted" class="quiz-screen">
        <!-- Quiz content (sin cambios) -->
        <header class="quiz-header">
          <div class="header-left">
            <img src="@/assets/images/weonline.png" alt="WE" class="header-logo" />
            <span class="header-title">{{ form.title }}</span>
          </div>
          <div class="header-right">
            <div v-if="isExam && form.time_limit_minutes" class="timer" :class="{ warning: timerWarning, critical: timerCritical }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {{ formattedTime }}
            </div>
            <button @click="showNavPanel = !showNavPanel" class="btn-nav-toggle mobile-only">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              <span class="nav-count-badge">{{ answeredCount }}/{{ questions.length }}</span>
            </button>
          </div>
        </header>
        <div class="quiz-progress"><div class="progress-bar" :style="{ width: progressPercent + '%' }"></div></div>
        
        <div class="quiz-layout">
          <main class="quiz-main">
            <div class="question-card" :key="currentQuestion.id">
              <div class="question-header">
                <span class="question-badge">Pregunta {{ currentIndex + 1 }}</span>
                <span v-if="currentQuestion.points" class="question-points">{{ currentQuestion.points }} pts</span>
              </div>
              <h2 class="question-text">{{ currentQuestion.question_text }}</h2>
              <p v-if="currentQuestion.help_text" class="question-help">{{ currentQuestion.help_text }}</p>
              <div class="answer-container">
                <input v-if="isType('TEXT')" type="text" v-model="answers[currentQuestion.id]" :placeholder="currentQuestion.placeholder || 'Escribe aquí...'" class="input-text" @keyup.enter="nextQuestion"/>
                <textarea v-else-if="isType('TEXTAREA')" v-model="answers[currentQuestion.id]" :placeholder="currentQuestion.placeholder || 'Escribe tu respuesta...'" class="input-textarea" rows="4"></textarea>
                <input v-else-if="isType('EMAIL')" type="email" v-model="answers[currentQuestion.id]" :placeholder="currentQuestion.placeholder || 'correo@ejemplo.com'" class="input-text" @keyup.enter="nextQuestion"/>
                <input v-else-if="isType('NUMBER')" type="number" v-model="answers[currentQuestion.id]" :placeholder="currentQuestion.placeholder || '0'" class="input-text" @keyup.enter="nextQuestion"/>
                <input v-else-if="isType('DATE')" type="date" v-model="answers[currentQuestion.id]" class="input-text"/>
                <div v-else-if="isType('RADIO') || isType('SINGLE_CHOICE')" class="options-list">
                  <button v-for="option in currentQuestion.options" :key="option.id" type="button" class="option-card" :class="{ selected: answers[currentQuestion.id] === option.id }" @click="selectRadio(currentQuestion.id, option.id)">
                    <span class="option-marker"><svg v-if="answers[currentQuestion.id] === option.id" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>
                    <span class="option-label">{{ option.option_text }}</span>
                  </button>
                </div>
                <div v-else-if="isType('CHECKBOX') || isType('MULTIPLE_CHOICE')" class="options-list">
                  <button v-for="option in currentQuestion.options" :key="option.id" type="button" class="option-card checkbox" :class="{ selected: answers[currentQuestion.id]?.includes(option.id) }" @click="toggleCheckbox(currentQuestion.id, option.id)">
                    <span class="option-marker checkbox"><svg v-if="answers[currentQuestion.id]?.includes(option.id)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>
                    <span class="option-label">{{ option.option_text }}</span>
                  </button>
                </div>
                <select v-else-if="isType('SELECT') || isType('DROPDOWN')" v-model="answers[currentQuestion.id]" class="input-select">
                  <option value="" disabled>Selecciona una opción</option>
                  <option v-for="option in currentQuestion.options" :key="option.id" :value="option.id">{{ option.option_text }}</option>
                </select>
                <div v-else-if="isType('TRUE_FALSE')" class="tf-options">
                  <button type="button" class="tf-btn" :class="{ selected: answers[currentQuestion.id] === true }" @click="answers[currentQuestion.id] = true"><span class="tf-marker">V</span>Verdadero</button>
                  <button type="button" class="tf-btn" :class="{ selected: answers[currentQuestion.id] === false }" @click="answers[currentQuestion.id] = false"><span class="tf-marker">F</span>Falso</button>
                </div>
                <div v-else-if="isType('RATING')" class="rating-container">
                  <button v-for="n in (currentQuestion.config?.max_stars || 5)" :key="n" type="button" class="star" :class="{ active: answers[currentQuestion.id] >= n }" @click="answers[currentQuestion.id] = n">
                    <svg width="32" height="32" viewBox="0 0 24 24" :fill="answers[currentQuestion.id] >= n ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </button>
                </div>
                <div v-else-if="isType('SCALE')" class="scale-container">
                  <div class="scale-labels"><span>{{ currentQuestion.config?.min_label || currentQuestion.config?.min || 1 }}</span><span>{{ currentQuestion.config?.max_label || currentQuestion.config?.max || 10 }}</span></div>
                  <div class="scale-buttons"><button v-for="n in getScaleRange(currentQuestion)" :key="n" type="button" class="scale-btn" :class="{ active: answers[currentQuestion.id] === n }" @click="answers[currentQuestion.id] = n">{{ n }}</button></div>
                </div>
                <label v-else-if="isType('FILE')" class="file-upload">
                  <input type="file" @change="handleFileChange($event, currentQuestion.id)" />
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span>{{ answers[currentQuestion.id] || 'Selecciona archivo' }}</span>
                </label>
                <input v-else type="text" v-model="answers[currentQuestion.id]" :placeholder="currentQuestion.placeholder || 'Escribe aquí...'" class="input-text" @keyup.enter="nextQuestion"/>
              </div>
              <p v-if="currentError" class="error-field">{{ currentError }}</p>
            </div>
            <div class="question-nav">
              <button @click="goBack" class="nav-btn" :disabled="currentIndex === 0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>Anterior
              </button>
              <button @click="nextQuestion" class="nav-btn primary" :class="{ finish: isLastQuestion }">
                <span v-if="isLastQuestion">Finalizar {{ isExam ? 'examen' : 'encuesta' }}</span>
                <span v-else>Siguiente</span>
                <svg v-if="!isLastQuestion" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                <svg v-if="isLastQuestion" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </button>
            </div>
          </main>

          <aside class="quiz-sidebar desktop-only">
            <div class="sidebar-nav-header"><h3>Navegación</h3></div>
            <div class="nav-legend">
              <span class="legend-item answered"><span class="dot"></span> Respondidas {{ answeredCount }}</span>
              <span class="legend-item pending"><span class="dot"></span> Sin responder {{ questions.length - answeredCount }}</span>
            </div>
            <div class="nav-grid">
              <button v-for="(q, idx) in questions" :key="q.id" class="nav-cell" :class="{ active: currentIndex === idx, answered: isAnswered(q.id) }" @click="goToQuestion(idx)">{{ idx + 1 }}</button>
            </div>
          </aside>

          <aside class="nav-panel mobile-panel" :class="{ open: showNavPanel }">
            <div class="nav-panel-header"><h3>Navegación</h3><button @click="showNavPanel = false" class="close-panel"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
            <div class="nav-legend"><span class="legend-item answered"><span class="dot"></span> Respondidas {{ answeredCount }}</span><span class="legend-item pending"><span class="dot"></span> Sin responder {{ questions.length - answeredCount }}</span></div>
            <div class="nav-grid"><button v-for="(q, idx) in questions" :key="q.id" class="nav-cell" :class="{ active: currentIndex === idx, answered: isAnswered(q.id) }" @click="goToQuestion(idx)">{{ idx + 1 }}</button></div>
          </aside>
          <div v-if="showNavPanel" class="nav-overlay" @click="showNavPanel = false"></div>
        </div>
      </div>

      <!-- Survey Result (no examen) -->
      <div v-else-if="!isExam" class="survey-result-screen">
        <!-- Sin cambios -->
        <div class="survey-result-card">
          <div class="survey-logo-wrapper"><img src="@/assets/images/weonline.png" alt="WE Online" class="survey-result-logo" /></div>
          <div class="success-badge">
            <div class="success-icon-wrapper">
              <svg class="success-check" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div class="success-rings"><span class="ring ring-1"></span><span class="ring ring-2"></span></div>
          </div>
          <div class="survey-result-content">
            <h1 class="survey-result-title">¡Gracias por tu respuesta!</h1>
            <p class="survey-result-message">{{ form.submit_message || 'Tu respuesta ha sido registrada correctamente.' }}</p>
          </div>
          <div class="survey-form-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>{{ form.title }}</span>
          </div>
          <div class="survey-info-pills">
            <div class="info-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span>{{ formatDate(new Date()) }}</span></div>
            <div class="info-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><span>{{ questions.length }} respuestas</span></div>
          </div>
          <div class="survey-divider"></div>
          <button @click="goHome" class="btn-survey-home">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Volver al inicio</span>
          </button>
          <p class="survey-footer-text">Puedes cerrar esta ventana de forma segura</p>
        </div>
      </div>

      <!-- PASO 3: RESULTADOS EXAMEN -->
      <div v-else class="result-screen">
        <div class="result-layout">
          <div class="result-left">
            <div class="result-mobile-header">
              <button @click="scrollToReview" class="mobile-nav-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>Ver respuestas</button>
              <button @click="scrollToTop" class="mobile-nav-btn back"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>Volver arriba</button>
            </div>

            <!-- Score Card con tour-target -->
            <div class="score-card" :class="{ passed: examResult?.passed, 'tour-highlight': tourStep === 0 }" ref="scoreCardRef" data-tour="score">
              <div class="score-status">
                <div class="status-icon">
                  <svg v-if="examResult?.passed" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </div>
                <span class="status-text">{{ examResult?.passed ? '¡Aprobado!' : 'No aprobado' }}</span>
              </div>
              <div class="score-main">
                <div class="score-number">
                  <span class="score-obtained">{{ displayScore }}</span>
                  <span class="score-separator">/</span>
                  <span class="score-total">{{ displayMaxScore }}</span>
                </div>
                <span class="score-label">{{ hasPointsSystem ? 'Puntos obtenidos' : 'Respuestas correctas' }}</span>
              </div>
              <div class="score-stats">
                <div class="stat-box correct"><span class="stat-num">{{ examResult?.correct_count || 0 }}</span><span class="stat-label">CORRECTAS</span></div>
                <div class="stat-box wrong"><span class="stat-num">{{ (examResult?.total_questions || 0) - (examResult?.correct_count || 0) }}</span><span class="stat-label">INCORRECTAS</span></div>

              </div>
              <div class="score-progress">
                <div class="progress-track"><div class="progress-fill" :class="{ passed: examResult?.passed }" :style="{ width: (examResult?.percentage || 0) + '%' }"></div></div>
              </div>
            </div>

            <div class="section-divider"><span class="divider-line"></span><span class="divider-text">Revisión</span><span class="divider-line"></span></div>

            <!-- Review Section con tour-target -->
            <div v-if="isExam && examResult?.details?.length" class="review-section" :class="{ 'tour-highlight': tourStep === 1 }" ref="reviewSection" data-tour="review">
              <div class="review-header">
                <h3>Revisión de respuestas</h3>
                <div class="review-summary"><span class="summary-correct">{{ examResult.correct_count }} correctas</span><span class="summary-wrong">{{ examResult.total_questions - examResult.correct_count }} incorrectas</span></div>
              </div>
              <div class="review-pills">
                <button v-for="(item, idx) in examResult.details" :key="idx" class="pill" :class="{ active: reviewIndex === idx, correct: item.is_correct === true, wrong: item.is_correct === false }" @click="reviewIndex = idx">{{ idx + 1 }}</button>
              </div>
              <div v-if="currentReview" class="review-card">
                <div class="review-card-header">
                  <span class="review-number">Pregunta {{ reviewIndex + 1 }}</span>
                  <div class="review-meta">
                    <span v-if="currentReview.points" class="review-points">{{ currentReview.points }} pts</span>
                    <span class="review-status" :class="{ correct: currentReview.is_correct, wrong: currentReview.is_correct === false }">{{ currentReview.is_correct ? 'Correcta' : currentReview.is_correct === false ? 'Incorrecta' : 'Sin calificar' }}</span>
                  </div>
                </div>
                <p class="review-question">{{ currentReview.question_text }}</p>
                <div class="review-answers">
                  <div class="review-answer user" :class="{ wrong: currentReview.is_correct === false }"><span class="answer-label">TU RESPUESTA</span><span class="answer-text">{{ currentReview.user_answer || 'Sin respuesta' }}</span></div>
                  <div v-if="currentReview.is_correct === false && currentReview.correct_answer" class="review-answer correct"><span class="answer-label">RESPUESTA CORRECTA</span><span class="answer-text">{{ currentReview.correct_answer }}</span></div>
                </div>
                <div class="review-nav">
                  <button @click="reviewIndex = Math.max(0, reviewIndex - 1)" :disabled="reviewIndex === 0" class="review-arrow"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
                  <span class="review-counter">{{ reviewIndex + 1 }} de {{ examResult.details.length }}</span>
                  <button @click="reviewIndex = Math.min(examResult.details.length - 1, reviewIndex + 1)" :disabled="reviewIndex >= examResult.details.length - 1" class="review-arrow"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>
                </div>
              </div>
            </div>
          </div>

          <div class="result-right" ref="sidebarSection">
            <div class="sidebar-logo"><img src="@/assets/images/weonline.png" alt="WE Online" /></div>
            <div v-if="odooStudent" class="sidebar-student">
              <div class="student-avatar-lg">{{ odooStudent.full_name.charAt(0) }}</div>
              <div class="student-details"><strong>{{ odooStudent.full_name }}</strong><span>{{ odooStudent.email }}</span></div>
            </div>
            <div class="sidebar-exam">
              <h4>{{ form.title }}</h4>
              <div class="exam-details">
                <div class="detail-row"><span class="detail-label">Fecha</span><span class="detail-value">{{ formatDate(new Date()) }}</span></div>
                <div class="detail-row" v-if="hasPointsSystem"><span class="detail-label">Puntaje</span><span class="detail-value">{{ examResult?.total_score || 0 }} / {{ examResult?.max_score || 0 }} pts</span></div>
                <div class="detail-row"><span class="detail-label">Aciertos</span><span class="detail-value">{{ examResult?.correct_count || 0 }} / {{ examResult?.total_questions || 0 }}</span></div>
                <div class="detail-row" v-if="examResult?.passing_score"><span class="detail-label">Nota mínima</span><span class="detail-value">11 ({{ examResult.passing_score }}%)</span></div>
              </div>
            </div>
            
            <!-- QR Section con tour-target -->
            <div v-if="examResult?.odoo?.pdf_url" class="sidebar-certificate" :class="{ 'tour-highlight': tourStep === 2 }" ref="qrSectionRef" data-tour="qr">
              <div class="cert-header"><span class="cert-icon">🎓</span><div class="cert-text"><strong>¡Certificado disponible!</strong><span>Escanea el QR o descarga</span></div></div>
              <div class="cert-qr"><canvas ref="qrCanvas" class="qr-canvas"></canvas></div>
            </div>
            
            <!-- Actions con tour-targets -->
            <div class="sidebar-actions">
              <a v-if="examResult?.odoo?.pdf_url" :href="examResult.odoo.pdf_url" target="_blank" class="action-btn pdf" :class="{ 'tour-highlight': tourStep === 3 }" ref="pdfBtnRef" data-tour="pdf">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Certificado oficial (PDF)
              </a>
              <button @click="downloadTicket" class="action-btn download" :class="{ 'tour-highlight': tourStep === 4 }" ref="ticketBtnRef" data-tour="ticket">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Descargar constancia de Examen
              </button>
              <button @click="openLinkedInModal" class="action-btn linkedin" :class="{ 'tour-highlight': tourStep === 5 }" ref="linkedinBtnRef" data-tour="linkedin">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>Compartir en LinkedIn
              </button>
            </div>
            <div class="sidebar-footer"><span>W|E Educación Ejecutiva</span></div>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══════════════════════════════════════════════════════════
         MODAL DE PROCESAMIENTO
         ═══════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="submitting" class="processing-overlay">
        <div class="processing-modal">
          <div class="processing-video-container">
            <video ref="processingVideo" autoplay loop muted playsinline class="processing-video">
              <source :src="processingVideoSrc" type="video/mp4">
            </video>
          </div>
          <div class="processing-content">
            <h2 class="processing-title">{{ isExam ? '¡Estamos corrigiendo tu examen!' : '¡Procesando tus respuestas!' }}</h2>
            <p class="processing-text">{{ isExam ? 'Espera un momento mientras evaluamos tus respuestas...' : 'Espera un momento mientras guardamos tu información...' }}</p>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ═══════════════════════════════════════════════════════════
         TOUR MODAL
         ═══════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="showTour && submitted && isExam" class="tour-overlay">
        <div class="tour-spotlight" :style="spotlightStyle"></div>
        <div class="tour-modal" :style="tourModalStyle">
          <button @click="closeTour" class="tour-close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <div class="tour-header">
            <div class="tour-icon">
              <component :is="tourSteps[tourStep]?.icon || 'span'" />
            </div>
            <h3 class="tour-title">{{ tourSteps[tourStep]?.title }}</h3>
          </div>
          <p class="tour-description">{{ tourSteps[tourStep]?.description }}</p>
          <div class="tour-footer">
            <div class="tour-dots">
              <span v-for="(step, idx) in tourSteps" :key="idx" class="tour-dot" :class="{ active: idx === tourStep, completed: idx < tourStep }"></span>
            </div>
            <div class="tour-actions">
              <button v-if="tourStep > 0" @click="prevTourStep" class="tour-btn secondary">Anterior</button>
              <button @click="nextTourStep" class="tour-btn primary">
                {{ tourStep === tourSteps.length - 1 ? 'Finalizar' : 'Siguiente' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Botón flotante para reiniciar tour -->
    <Teleport to="body">
      <button v-if="submitted && isExam && !showTour" @click="startTour" class="tour-restart-btn" title="Ver tutorial">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>Tour virtual</span>
      </button>
    </Teleport>

    <!-- MODAL LINKEDIN -->
    <Teleport to="body">
      <div v-if="showLinkedInModal" class="linkedin-modal-overlay" @click.self="closeLinkedInModal">
        <div class="linkedin-modal">
          <div class="linkedin-modal-header">
            <div class="linkedin-header-left">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#0077b5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              <span>Compartir en LinkedIn</span>
            </div>
            <button @click="closeLinkedInModal" class="linkedin-close-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="linkedin-modal-body">
            <div class="linkedin-preview-card">
              <div class="preview-header">
                <div class="preview-avatar">{{ odooStudent?.full_name?.charAt(0) || 'U' }}</div>
                <div class="preview-info">
                  <strong>{{ odooStudent?.full_name || 'Usuario' }}</strong>
                  <span>Publicación • Ahora</span>
                </div>
              </div>
              <div class="preview-image">
                <div class="preview-image-placeholder">
                  <div class="placeholder-score">
                    <span class="placeholder-value">{{ displayScore }}/{{ displayMaxScore }}</span>
                    <span class="placeholder-status" :class="{ passed: examResult?.passed }">{{ examResult?.passed ? 'APROBADO' : 'NO APROBADO' }}</span>
                  </div>
                  <span class="placeholder-title">{{ form.title }}</span>
                </div>
              </div>
            </div>
            <div class="linkedin-editor">
              <label class="editor-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edita tu mensaje
              </label>
              <textarea v-model="linkedInPostText" class="editor-textarea" rows="8" placeholder="Escribe tu mensaje..."></textarea>
              <div class="editor-footer">
                <span class="char-count" :class="{ warning: linkedInPostText.length > 2800 }">{{ linkedInPostText.length }} / 3000</span>
              </div>
            </div>
            <div class="linkedin-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span>Se incluirá automáticamente tu nota del examen y también tu certificado conseguido</span>
            </div>
          </div>
          <div class="linkedin-modal-footer">
            <button @click="closeLinkedInModal" class="linkedin-btn-cancel">Cancelar</button>
            <button @click="confirmLinkedInShare" class="linkedin-btn-share" :disabled="linkedInLoading || linkedInPostText.length > 3000">
              <span v-if="linkedInLoading" class="btn-loader"></span>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              {{ linkedInLoading ? 'Preparando...' : 'Publicar en LinkedIn' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive, watch, nextTick, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import formService from '@/services/form.service'
import responseService from '@/services/response.service'
import processingVideoSrc from '@/assets/images/videosparky.mp4'
import Swal from 'sweetalert2' 

const route = useRoute()
const router = useRouter()

const checkingPreviousResponse = ref(false)
const previousResponse = ref(null)

// State
const form = ref(null)
const questions = ref([])
const loading = ref(true)
const error = ref(null)
const started = ref(false)
const submitted = ref(false)
const submitting = ref(false)
const answers = reactive({})
const errors = reactive({})
const currentIndex = ref(0)
const examResult = ref(null)
const timeRemaining = ref(0)
const timerInterval = ref(null)
const reviewIndex = ref(0)
const showNavPanel = ref(false)
const emailFocused = ref(false)

// Certificate Polling State
const certificatePolling = ref(null)
const certificateChecking = ref(false)

// Odoo State
const requiresOdooValidation = ref(false)
const odooValidated = ref(false)
const odooStudent = ref(null)
const odooEmail = ref('')
const odooError = ref('')
const validatingOdoo = ref(false)

// LinkedIn Modal State
const showLinkedInModal = ref(false)
const linkedInPostText = ref('')
const linkedInLoading = ref(false)

// Tour State
const showTour = ref(false)
const tourStep = ref(0)
const spotlightStyle = ref({})
const tourModalStyle = ref({})

// Refs
const qrCanvas = ref(null)
const reviewSection = ref(null)
const sidebarSection = ref(null)
const processingVideo = ref(null)
const scoreCardRef = ref(null)
const qrSectionRef = ref(null)
const pdfBtnRef = ref(null)
const ticketBtnRef = ref(null)
const linkedinBtnRef = ref(null)

// Tour Steps Definition
const tourSteps = computed(() => {
  const steps = [
    {
      target: 'score',
      ref: scoreCardRef,
      title: '📊 Tu Resultado',
      description: 'Aquí puedes ver tu nota final, el porcentaje obtenido y si aprobaste o no el examen.',
      icon: () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
        h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
        h('polyline', { points: '22 4 12 14.01 9 11.01' })
      ])
    },
    {
      target: 'review',
      ref: reviewSection,
      title: '📝 Revisión de Respuestas',
      description: 'Revisa cada pregunta, tu respuesta y la respuesta correcta. Usa los botones numerados para navegar.',
      icon: () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
        h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
        h('polyline', { points: '14 2 14 8 20 8' }),
        h('line', { x1: 16, y1: 13, x2: 8, y2: 13 }),
        h('line', { x1: 16, y1: 17, x2: 8, y2: 17 })
      ])
    }
  ]
  
  if (examResult.value?.odoo?.pdf_url) {
    steps.push({
      target: 'qr',
      ref: qrSectionRef,
      title: '📱 Código QR',
      description: 'Escanea este código QR con tu celular para acceder directamente a tu certificado digital.',
      icon: () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
        h('rect', { x: 3, y: 3, width: 7, height: 7 }),
        h('rect', { x: 14, y: 3, width: 7, height: 7 }),
        h('rect', { x: 14, y: 14, width: 7, height: 7 }),
        h('rect', { x: 3, y: 14, width: 7, height: 7 })
      ])
    })
    steps.push({
      target: 'pdf',
      ref: pdfBtnRef,
      title: '📄 Certificado Oficial',
      description: 'Descarga tu certificado oficial en formato PDF. Este documento tiene validez institucional.',
      icon: () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
        h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
        h('polyline', { points: '14 2 14 8 20 8' })
      ])
    })
  }
  
  steps.push({
    target: 'ticket',
    ref: ticketBtnRef,
    title: '🎫 Constancia de Examen',
    description: 'Imprime o guarda tu constancia tipo ticket con el resumen de tu evaluación.',
    icon: () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
      h('polyline', { points: '7 10 12 15 17 10' }),
      h('line', { x1: 12, y1: 15, x2: 12, y2: 3 })
    ])
  })
  
  steps.push({
    target: 'linkedin',
    ref: linkedinBtnRef,
    title: '💼 Compartir en LinkedIn',
    description: '¡Comparte tu logro con tu red profesional! Publicaremos tu resultado junto con tu certificado.',
    icon: () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'currentColor' }, [
      h('path', { d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' })
      ])
  })
  
  return steps
})

// Computed
const isExam = computed(() => form.value?.form_type === 'EXAM')
const currentQuestion = computed(() => questions.value[currentIndex.value] || {})
const currentError = computed(() => errors[currentQuestion.value?.id])
const isLastQuestion = computed(() => currentIndex.value === questions.value.length - 1)
const progressPercent = computed(() => questions.value.length ? Math.round(((currentIndex.value + 1) / questions.value.length) * 100) : 0)
const currentReview = computed(() => examResult.value?.details?.[reviewIndex.value] || null)
const answeredCount = computed(() => questions.value.filter(q => isAnswered(q.id)).length)

function goHome() { window.location.href = '/' }

const calculatedMaxScore = computed(() => {
  if (form.value?.max_score) return form.value.max_score
  return questions.value.reduce((sum, q) => sum + (parseFloat(q.points) || 1), 0)
})

const hasPointsSystem = computed(() => {
  if (examResult.value) return (examResult.value.max_score || 0) > (examResult.value.total_questions || 0)
  return calculatedMaxScore.value > questions.value.length
})

const displayScore = computed(() => hasPointsSystem.value ? (examResult.value?.total_score || 0) : (examResult.value?.correct_count || 0))
const displayMaxScore = computed(() => hasPointsSystem.value ? (examResult.value?.max_score || calculatedMaxScore.value) : (examResult.value?.total_questions || questions.value.length))

const timerPercent = computed(() => form.value?.time_limit_minutes ? (timeRemaining.value / (form.value.time_limit_minutes * 60)) * 100 : 100)
const timerWarning = computed(() => form.value?.time_limit_minutes && timerPercent.value <= 25 && timerPercent.value > 10)
const timerCritical = computed(() => form.value?.time_limit_minutes && timerPercent.value <= 10)
const formattedTime = computed(() => {
  const m = Math.floor(timeRemaining.value / 60)
  const s = timeRemaining.value % 60
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
})

// ═══════════════════════════════════════
// CERTIFICATE POLLING
// ═══════════════════════════════════════
async function checkCertificateStatus() {
  if (!examResult.value?.response_uuid || certificateChecking.value) return
  
  try {
    certificateChecking.value = true
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    
    const response = await fetch(`${API_URL}/public/result/${examResult.value.response_uuid}`)
    const data = await response.json()
    
    if (data.ok && data.data?.odoo?.pdf_url) {
      console.log('✅ Certificado disponible, actualizando UI...')
      
      examResult.value.odoo = data.data.odoo
      
      stopCertificatePolling()
      
      Swal.close()
      
      await Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Certificado disponible',
        html: 'Puedes descargarlo aquí y verlo en tu <strong>Campus Virtual</strong>',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        showCloseButton: true,
        customClass: {
          popup: 'certificate-toast',
          title: 'certificate-toast-title',
          htmlContainer: 'certificate-toast-text',
          icon: 'certificate-toast-icon',
          timerProgressBar: 'certificate-toast-progress'
        }
      })
      
      await nextTick()
      generateQR()
      
      if (isExam.value) {
        setTimeout(() => startTour(), 500)
      }
    } else if (!data.data?.certificate_processing) {
      console.log('⚠️ Certificado no disponible o falló')
      stopCertificatePolling()
      
      Swal.close()
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Error de conexión',
        html: 'Hubo un problema al generar el certificado. Por favor, intente nuevamente.',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        showCloseButton: true,
        customClass: {
          popup: 'certificate-toast error',
          title: 'certificate-toast-title',
          htmlContainer: 'certificate-toast-text',
          icon: 'certificate-toast-icon',
          timerProgressBar: 'certificate-toast-progress'
        }
      })
    }
  } catch (err) {
    console.error('Error checking certificate:', err)
  } finally {
    certificateChecking.value = false
  }
}

function startCertificatePolling() {
  if (certificatePolling.value) return
  
  console.log('🔄 Iniciando polling de certificado (cada 1 segundo)...')
  
  certificatePolling.value = setInterval(checkCertificateStatus, 1000)
  
  checkCertificateStatus()
  
  setTimeout(() => {
    if (certificatePolling.value) {
      console.log('⏱️ Timeout de polling alcanzado (2 minutos)')
      stopCertificatePolling()
    }
  }, 120000)
}

function stopCertificatePolling() {
  if (certificatePolling.value) {
    console.log('⏹️ Deteniendo polling de certificado')
    clearInterval(certificatePolling.value)
    certificatePolling.value = null
  }
}

// ═══════════════════════════════════════
// TOUR METHODS
// ═══════════════════════════════════════
function startTour() {
  tourStep.value = 0
  showTour.value = true
  updateTourPosition()
}

function closeTour() {
  showTour.value = false
}

function nextTourStep() {
  if (tourStep.value < tourSteps.value.length - 1) {
    tourStep.value++
    updateTourPosition()
  } else {
    closeTour()
  }
}

function prevTourStep() {
  if (tourStep.value > 0) {
    tourStep.value--
    updateTourPosition()
  }
}

function updateTourPosition() {
  nextTick(() => {
    const step = tourSteps.value[tourStep.value]
    if (!step?.ref?.value) {
      tourModalStyle.value = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }
      spotlightStyle.value = { display: 'none' }
      return
    }
    
    const el = step.ref.value.$el || step.ref.value
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    
    setTimeout(() => {
      const rect = el.getBoundingClientRect()
      const padding = 16
      
      spotlightStyle.value = {
        display: 'block',
        top: `${rect.top - padding}px`,
        left: `${rect.left - padding}px`,
        width: `${rect.width + padding * 2}px`,
        height: `${rect.height + padding * 2}px`
      }
      
      const modalWidth = Math.min(400, window.innerWidth - 32)
      const modalHeight = 320
      const gap = 16
      
      let modalTop, modalLeft
      
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const spaceRight = window.innerWidth - rect.right
      const spaceLeft = rect.left
      
      if (spaceBelow >= modalHeight + gap) {
        modalTop = rect.bottom + gap
        modalLeft = rect.left + (rect.width / 2) - (modalWidth / 2)
      } else if (spaceAbove >= modalHeight + gap) {
        modalTop = rect.top - modalHeight - gap
        modalLeft = rect.left + (rect.width / 2) - (modalWidth / 2)
      } else if (spaceRight >= modalWidth + gap) {
        modalTop = rect.top + (rect.height / 2) - (modalHeight / 2)
        modalLeft = rect.right + gap
      } else if (spaceLeft >= modalWidth + gap) {
        modalTop = rect.top + (rect.height / 2) - (modalHeight / 2)
        modalLeft = rect.left - modalWidth - gap
      } else {
        modalTop = window.innerHeight / 2 - modalHeight / 2
        modalLeft = window.innerWidth / 2 - modalWidth / 2
      }
      
      modalLeft = Math.max(16, Math.min(modalLeft, window.innerWidth - modalWidth - 16))
      modalTop = Math.max(16, Math.min(modalTop, window.innerHeight - modalHeight - 16))
      
      tourModalStyle.value = {
        top: `${modalTop}px`,
        left: `${modalLeft}px`,
        maxWidth: `${modalWidth}px`,
        transform: 'none'
      }
    }, 400)
  })
}

watch(tourStep, () => {
  if (showTour.value) updateTourPosition()
})

// ═══════════════════════════════════════
// FORM METHODS
// ═══════════════════════════════════════
function isAnswered(qid) {
  const a = answers[qid]
  return a !== null && a !== undefined && a !== '' && a !== 0 && !(Array.isArray(a) && !a.length)
}

function isType(type) {
  const t = currentQuestion.value.type || currentQuestion.value.type_code || currentQuestion.value.question_type || ''
  return t.toUpperCase() === type
}

function getScaleRange(q) {
  const min = q.config?.min || 1
  const max = q.config?.max || 10
  return Array.from({ length: max - min + 1 }, (_, i) => min + i)
}

function goToQuestion(idx) { 
  currentIndex.value = idx
  showNavPanel.value = false
}

function scrollToReview() { 
  reviewSection.value?.scrollIntoView({ behavior: 'smooth' })
}

function scrollToTop() { 
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ═══════════════════════════════════════
// ODOO VALIDATION
// ═══════════════════════════════════════
async function validateOdooEmail() {
  if (!odooEmail.value) return
  validatingOdoo.value = true
  odooError.value = ''
  
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const res = await fetch(`${API_URL}/public/validate-student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: odooEmail.value.trim().toLowerCase(), 
        form_uuid: form.value.uuid 
      })
    })
    
    const data = await res.json()
    
    if (!data.ok) { 
      odooError.value = data.error || 'Error al validar'
      return
    }
    
    if (data.validated && data.student) { 
      odooValidated.value = true
      odooStudent.value = data.student
      
      // ✅ VERIFICAR RESPUESTA PREVIA DESPUÉS DE VALIDAR ODOO
      if (isExam.value) {
        await checkPreviousResponse()
      }
    } else { 
      odooValidated.value = true
    }
  } catch (err) { 
    odooError.value = 'Error de conexión. Intenta de nuevo.'
  } finally { 
    validatingOdoo.value = false
  }
}

// ═══════════════════════════════════════
// CHECK PREVIOUS RESPONSE
// ═══════════════════════════════════════
async function checkPreviousResponse() {
  if (!odooStudent.value?.email || !form.value?.uuid) {
    console.log('⚠️ No hay email u uuid para verificar')
    return
  }

  checkingPreviousResponse.value = true
  console.log('🔍 Verificando respuesta previa para:', odooStudent.value.email)
  
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const response = await fetch(
      `${API_URL}/public/check-previous-response?form_uuid=${form.value.uuid}&respondent_email=${odooStudent.value.email}`
    )
    
    const data = await response.json()

    
    
    if (!data.ok) {
      console.error('❌ Error al verificar respuesta previa:', data.error)
      previousResponse.value = null
      // ✅ Si hay error, permitir continuar
      started.value = true
      startTimer()
      return
    }

    console.log('📊 Resultado verificación:', data)

    if (data.has_previous_response) {
      previousResponse.value = data
      console.log('✅ Tiene respuesta previa:', data.status, '- Puede dar examen:', data.can_take_exam)
      
      if (!data.can_take_exam) {
        console.log('🚫 No puede volver a dar el examen (ya aprobó)')
        return
      }
      
      // ✅ Puede reintentar: NO iniciar automáticamente, mostrar pantalla de reintento
    } else {
      console.log('✅ No tiene respuesta previa, iniciar examen')
      previousResponse.value = null
      
      // ✅ INICIAR EXAMEN AUTOMÁTICAMENTE
      started.value = true
      startTimer()
    }
    
  } catch (error) {
    console.error('❌ Error checking previous response:', error)
    previousResponse.value = null
    // ✅ Si hay error, permitir continuar
    started.value = true
    startTimer()
  } finally {
    checkingPreviousResponse.value = false
  }
}

function retakeExam() {
  console.log('🔄 Reiniciando examen...')
  previousResponse.value = null
  started.value = true
  
  // Reiniciar respuestas
  questions.value.forEach(q => {
    const t = (q.type || q.type_code || q.question_type || '').toUpperCase()
    if (t === 'CHECKBOX' || t === 'MULTIPLE_CHOICE') {
      answers[q.id] = []
    } else if (t === 'RATING') {
      answers[q.id] = 0
    } else {
      answers[q.id] = null
    }
  })
  
  // Reiniciar índice
  currentIndex.value = 0
  
  // Iniciar cronómetro
  startTimer()
}

function viewFullResult() {
  if (previousResponse.value?.data?.response_uuid) {
    router.push(`/result/${previousResponse.value.data.response_uuid}`)
  }
}

function downloadCertificate() {
  if (previousResponse.value?.data?.certificate_pdf) {
    window.open(previousResponse.value.data.certificate_pdf, '_blank')
  }
}

// ═══════════════════════════════════════
// LOAD FORM
// ═══════════════════════════════════════
async function loadForm() {
  try {
    loading.value = true
    const uuid = route.params.uuid
    
    if (!uuid) { 
      error.value = 'URL inválida'
      return
    }
    
    const res = await formService.getPublic(uuid)
    let formData, questionsData = []
    
    if (res.data?.ok && res.data?.data) { 
      formData = res.data.data.form
      questionsData = res.data.data.questions || []
    } else if (res.data?.data) { 
      formData = res.data.data.form || res.data.data
      questionsData = res.data.data.questions || []
    } else if (res.data?.form) { 
      formData = res.data.form
      questionsData = res.data.questions || []
    } else {
      throw new Error('Respuesta inválida')
    }
    
    form.value = formData
    requiresOdooValidation.value = !!formData.requires_odoo_validation
    
    if (formData.shuffle_questions) {
      questionsData = questionsData.sort(() => Math.random() - 0.5)
    }
    
    questions.value = questionsData
    
    questionsData.forEach(q => {
      const t = (q.type || q.type_code || q.question_type || '').toUpperCase()
      if (t === 'CHECKBOX' || t === 'MULTIPLE_CHOICE') {
        answers[q.id] = []
      } else if (t === 'RATING') {
        answers[q.id] = 0
      } else {
        answers[q.id] = null
      }
    })
    
    // Si NO requiere validación Odoo, iniciar directo
    if (!requiresOdooValidation.value && !formData.welcome_message) { 
      started.value = true
      startTimer()
    }
  } catch (e) { 
    error.value = e.response?.data?.error || e.message || 'Error al cargar'
  } finally { 
    loading.value = false
  }
}

function startForm() { 
  started.value = true
  startTimer()
}

function startTimer() {
  // Limpiar timer existente si hay
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
  
  if (!isExam.value || !form.value?.time_limit_minutes) return
  
  timeRemaining.value = form.value.time_limit_minutes * 60
  
  timerInterval.value = setInterval(() => {
    timeRemaining.value--
    if (timeRemaining.value <= 0) { 
      clearInterval(timerInterval.value)
      submitForm(true)
    }
  }, 1000)
}

function selectRadio(qid, oid) { 
  answers[qid] = oid
  delete errors[qid]
}

function toggleCheckbox(qid, oid) {
  if (!answers[qid]) answers[qid] = []
  const i = answers[qid].indexOf(oid)
  if (i > -1) {
    answers[qid].splice(i, 1)
  } else {
    answers[qid].push(oid)
  }
  delete errors[qid]
}

function validateCurrent() {
  const q = currentQuestion.value
  if (!q.is_required && !isExam.value) return true
  
  const a = answers[q.id]
  const empty = a === null || a === undefined || a === '' || a === 0 || (Array.isArray(a) && !a.length)
  
  if (empty && isExam.value) { 
    errors[q.id] = 'Debes responder esta pregunta'
    return false
  }
  
  if (empty && q.is_required) { 
    errors[q.id] = 'Campo requerido'
    return false
  }
  
  delete errors[q.id]
  return true
}

function goBack() { 
  if (currentIndex.value > 0) currentIndex.value--
}

function nextQuestion() { 
  if (validateCurrent()) {
    if (isLastQuestion.value) {
      submitForm()
    } else {
      currentIndex.value++
    }
  }
}

async function submitForm(auto = false) {
  if (!auto && !validateAll()) return
  
  submitting.value = true
  if (timerInterval.value) clearInterval(timerInterval.value)
  
  const startTime = Date.now()
  
  try {
    const formatted = questions.value.map(q => ({ 
      question_id: q.id, 
      answer_value: answers[q.id]
    }))
    
    const timeSpent = form.value.time_limit_minutes 
      ? (form.value.time_limit_minutes * 60) - timeRemaining.value 
      : null
      
    const questionsShown = questions.value.map(q => q.id)
    
    const payload = {
      form_uuid: form.value.uuid,
      answers: formatted,
      time_spent: timeSpent,
      respondent_email: odooStudent.value?.email || null,
      respondent_name: odooStudent.value?.full_name || null,
      questions_shown: questionsShown
    }
    
    if (odooValidated.value && odooStudent.value) {
      payload.odoo_partner_id = odooStudent.value.partner_id
      payload.odoo_student_names = odooStudent.value.names
      payload.odoo_student_surnames = odooStudent.value.surnames
    }
    
    const res = await responseService.submit(payload)
    
    let hasCertificateProcessing = false
    
    if (isExam.value && res.data?.data) {
      const data = res.data.data
      examResult.value = {
        response_uuid: data.response_uuid,
        percentage: data.score || 0,
        passed: data.passed,
        correct_count: data.correct_count || 0,
        total_questions: data.total_questions || questions.value.length,
        total_score: data.total_score || 0,
        max_score: data.max_score || calculatedMaxScore.value,
        passing_score: data.passing_score,
        details: data.details || [],
        odoo: data.odoo || null
      }
      
      hasCertificateProcessing = data.certificate_processing && !data.odoo?.pdf_url
      
      if (hasCertificateProcessing) {
        console.log('🔄 Certificado en proceso, iniciando polling...')
        startCertificatePolling()
      }
    }
    
    const elapsed = Date.now() - startTime
    const remainingTime = Math.max(0, 5000 - elapsed)
    
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime))
    }
    
    submitted.value = true
    submitting.value = false
    await nextTick()
    
    if (isExam.value && hasCertificateProcessing) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Certificándote en el Campus Virtual',
        html: 'Estamos generando tu certificado oficial...',
        showConfirmButton: false,
        showCloseButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
        customClass: {
          popup: 'certificate-toast loading',
          title: 'certificate-toast-title',
          htmlContainer: 'certificate-toast-text',
          icon: 'certificate-toast-icon'
        }
      })
    }
    
  } catch (e) {
    console.error('Error al enviar:', e)
    
    const elapsed = Date.now() - startTime
    const remainingTime = Math.max(0, 2000 - elapsed)
    
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime))
    }
    
    submitting.value = false
    alert(auto ? 'Tiempo agotado. Error al enviar.' : 'Error al enviar respuestas.')
  }
}

function validateAll() {
  let ok = true
  questions.value.forEach((q, i) => {
    const a = answers[q.id]
    const empty = a === null || a === undefined || a === '' || a === 0 || (Array.isArray(a) && !a.length)
    
    if ((isExam.value || q.is_required) && empty) { 
      errors[q.id] = 'Campo requerido'
      if (ok) currentIndex.value = i
      ok = false
    }
  })
  return ok
}

function handleFileChange(e, qid) { 
  const f = e.target.files[0]
  if (f) answers[qid] = f.name
}

async function generateQR() {
  if (!examResult.value?.odoo?.certificate_id || !qrCanvas.value) return
  
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const responseUuid = examResult.value.response_uuid
    const qrUrl = responseUuid 
      ? `${API_URL}/public/certificate/${responseUuid}`
      : `${window.location.origin}/verificar/${examResult.value.odoo.certificate_id}`
      
    await QRCode.toCanvas(qrCanvas.value, qrUrl, { 
      width: 120, 
      margin: 2, 
      color: { dark: '#000F5A', light: '#ffffff' }
    })
  } catch (err) { 
    console.error('QR error:', err)
  }
}

function downloadTicket() {
  const result = examResult.value
  const student = odooStudent.value
  const scoreDisplay = hasPointsSystem.value 
    ? `${result?.total_score||0}/${result?.max_score||0} pts` 
    : `${result?.correct_count||0}/${result?.total_questions||0}`
    
  const content = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Constancia</title><style>@page{size:80mm 240mm;margin:0}*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;width:80mm;padding:8mm;background:#fff}.ticket{text-align:center}.logo{font-size:18px;font-weight:bold;color:#000F5A;margin-bottom:4mm;letter-spacing:2px}.title{font-size:10px;color:#666;margin-bottom:6mm;border-bottom:1px dashed #ccc;padding-bottom:4mm;text-transform:uppercase;letter-spacing:1px}.exam-name{font-size:12px;font-weight:600;color:#000F5A;margin-bottom:6mm;line-height:1.4}.student-name{font-size:11px;color:#333;margin-bottom:6mm;padding:3mm;background:#f5f5f5;border-radius:2mm}.score-box{background:${result?.passed?'#ecfdf5':'#fef2f2'};padding:6mm;border-radius:3mm;margin-bottom:5mm}.score{font-size:28px;font-weight:bold;color:${result?.passed?'#059669':'#dc2626'}}.status{font-size:11px;font-weight:600;color:${result?.passed?'#059669':'#dc2626'};margin-top:2mm;text-transform:uppercase;letter-spacing:1px}.details{text-align:left;font-size:10px;color:#333;margin:5mm 0;border-top:1px dashed #ccc;border-bottom:1px dashed #ccc;padding:4mm 0}.row{display:flex;justify-content:space-between;margin:2mm 0}.row .label{color:#666}.row .value{font-weight:600}.footer{font-size:8px;color:#999;margin-top:5mm}.barcode{font-family:monospace;font-size:9px;letter-spacing:3px;margin-top:3mm;color:#333}</style></head><body><div class="ticket"><div class="logo">W | E</div><div class="title">Constancia de Evaluación</div><div class="exam-name">${form.value.title}</div>${student?`<div class="student-name">${student.full_name}</div>`:''}<div class="score-box"><div class="score">${scoreDisplay}</div><div class="status">${result?.passed?'APROBADO':'NO APROBADO'}</div></div><div class="details"><div class="row"><span class="label">Correctas:</span><span class="value">${result?.correct_count||0} de ${result?.total_questions||0}</span></div>${hasPointsSystem.value?`<div class="row"><span class="label">Puntos:</span><span class="value">${result?.total_score||0} de ${result?.max_score||0}</span></div>`:''}<div class="row"><span class="label">Porcentaje:</span><span class="value">${result?.percentage||0}%</span></div><div class="row"><span class="label">Fecha:</span><span class="value">${formatDate(new Date())}</span></div></div><div class="footer">WE | Educación Ejecutiva<br>www.weonline.pe</div><div class="barcode">■■■ ${Date.now().toString(36).toUpperCase()} ■■■</div></div></body></html>`
  
  const win = window.open('', '_blank', 'width=320,height=700')
  win.document.write(content)
  win.document.close()
  setTimeout(() => win.print(), 300)
}

// ═══════════════════════════════════════
// LINKEDIN FUNCTIONS
// ═══════════════════════════════════════
function generateDefaultLinkedInText() {
  const result = examResult.value
  const student = odooStudent.value
  const timestamp = new Date().toLocaleString('es-PE', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit'
  })
  const scoreText = hasPointsSystem.value 
    ? `${result?.total_score||0}/${result?.max_score||0} puntos` 
    : `${result?.correct_count||0}/${result?.total_questions||0}`
  
  let text = `🎓 ¡Completé la evaluación "${form.value.title}"!\n\n`
  text += `📊 Resultado: ${scoreText} (${result?.percentage||0}%) ${result?.passed ? '✅ APROBADO' : ''}\n\n`
  if (student?.full_name) text += `👤 ${student.full_name}\n\n`
  text += `Gracias a @WE Online por esta oportunidad.\n\n`
  text += `📅 ${timestamp}\n\n`
  text += `#WEOnline #EducaciónEjecutiva #Certificación`
  
  return text
}

function openLinkedInModal() {
  linkedInPostText.value = generateDefaultLinkedInText()
  showLinkedInModal.value = true
}

function closeLinkedInModal() {
  showLinkedInModal.value = false
  linkedInLoading.value = false
}

async function confirmLinkedInShare() {
  linkedInLoading.value = true
  
  try {
    const imageBlob = await generateCertificateImage()
    if (!imageBlob) { 
      alert('Error al generar imagen')
      linkedInLoading.value = false
      return
    }
    
    const result = examResult.value
    const student = odooStudent.value
    
    const examData = {
      title: form.value.title,
      percentage: result?.percentage || 0,
      passed: result?.passed,
      correct: result?.correct_count || 0,
      total: result?.total_questions || 0,
      totalScore: result?.total_score || 0,
      maxScore: result?.max_score || 0,
      formUuid: form.value.uuid,
      studentName: student?.full_name || '',
      certificateId: result?.odoo?.certificate_id || null,
      pdfUrl: result?.odoo?.pdf_url || null,
      returnUrl: window.location.pathname
    }
    
    localStorage.setItem('linkedin_exam_data', JSON.stringify(examData))
    localStorage.setItem('linkedin_post_text', linkedInPostText.value)
    
    const reader = new FileReader()
    reader.readAsDataURL(imageBlob)
    reader.onloadend = () => {
      localStorage.setItem('linkedin_certificate_image', reader.result.split(',')[1])
      const state = btoa(JSON.stringify({ formUuid: form.value.uuid, ts: Date.now() }))
      const clientId = '78grbv4vc7hu8f'
      const redirectUri = encodeURIComponent(`${window.location.origin}/linkedin/callback`)
      const scope = encodeURIComponent('openid profile email w_member_social')
      window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${encodeURIComponent(state)}&scope=${scope}`
    }
    reader.onerror = () => { 
      alert('Error al procesar imagen')
      linkedInLoading.value = false
    }
  } catch (err) { 
    console.error('Error LinkedIn:', err)
    alert('Error al preparar publicación')
    linkedInLoading.value = false
  }
}

async function generateCertificateImage() {
  const result = examResult.value
  const student = odooStudent.value
  const scoreText = hasPointsSystem.value 
    ? `${result?.total_score||0}/${result?.max_score||0}` 
    : `${result?.correct_count||0}/${result?.total_questions||0}`
  const scoreLabel = hasPointsSystem.value ? 'puntos' : 'respuestas correctas'
  
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = `<div style="width:600px;padding:40px;background:linear-gradient(135deg,#000F5A 0%,#0499D5 100%);border-radius:16px;font-family:'Segoe UI',Arial,sans-serif;color:white;text-align:center;"><div style="font-size:28px;font-weight:bold;letter-spacing:4px;margin-bottom:8px;">W | E</div><div style="font-size:12px;text-transform:uppercase;letter-spacing:2px;opacity:0.9;margin-bottom:24px;">Constancia de Evaluación</div><div style="font-size:18px;font-weight:600;margin-bottom:32px;line-height:1.4;">${form.value.title}</div>${student?`<div style="font-size:14px;opacity:0.9;margin-bottom:24px;">${student.full_name}</div>`:''}<div style="background:rgba(255,255,255,0.2);padding:24px 40px;border-radius:12px;display:inline-block;margin-bottom:24px;"><div style="font-size:64px;font-weight:700;line-height:1;">${scoreText}</div><div style="font-size:16px;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin-top:8px;">${result?.passed?'APROBADO':'NO APROBADO'}</div></div><div style="font-size:14px;opacity:0.9;">${result?.percentage||0}% - ${scoreLabel}</div><div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.2);font-size:12px;opacity:0.8;">${formatDate(new Date())} • WE | Educación Ejecutiva</div></div>`
  tempDiv.style.position = 'absolute'
  tempDiv.style.left = '-9999px'
  document.body.appendChild(tempDiv)
  
  try {
    const canvas = await html2canvas(tempDiv.firstElementChild, { 
      scale: 2, 
      backgroundColor: null, 
      logging: false
    })
    document.body.removeChild(tempDiv)
    return new Promise(resolve => canvas.toBlob(blob => resolve(blob), 'image/png', 1.0))
  } catch (err) { 
    document.body.removeChild(tempDiv)
    return null
  }
}

function formatDate(date) {
  if (!date) return ''
  let d = date instanceof Date ? date : new Date(date)
  
  // Si la fecha viene sin timezone (de MySQL), asumir UTC
  if (typeof date === 'string' && !date.includes('Z') && !date.includes('+')) {
    d = new Date(date + 'Z') // Agregar Z para forzar UTC
  }
  
  return d.toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

function formatDateShort(date) {
  if (!date) return ''
  let d = date instanceof Date ? date : new Date(date)
  
  // Si la fecha viene sin timezone (de MySQL), asumir UTC
  if (typeof date === 'string' && !date.includes('Z') && !date.includes('+')) {
    d = new Date(date + 'Z') // Agregar Z para forzar UTC
  }
  
  return d.toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

// Calcular nota sobre 20
function calculateScore(totalScore, maxScore) {
  if (!maxScore || maxScore === 0) return '0'
  const nota = (totalScore / maxScore) * 20
  return Math.round(nota * 10) / 10 // Redondear a 1 decimal
}

// ═══════════════════════════════════════
// LIFECYCLE HOOKS
// ═══════════════════════════════════════
onMounted(() => loadForm())

onUnmounted(() => { 
  if (timerInterval.value) clearInterval(timerInterval.value)
  stopCertificatePolling()
})

watch(answers, () => {
  if (errors[currentQuestion.value?.id]) {
    const a = answers[currentQuestion.value.id]
    if (a !== null && a !== undefined && a !== '' && a !== 0) {
      delete errors[currentQuestion.value.id]
    }
  }
}, { deep: true })
</script>

<style scoped>

  /* ═══════════════════════════════════════════════════════════════
   QUIZ SCREEN - ESTILOS COMPLETOS (AGREGAR AL PRIMER CSS)
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   RESULT SCREEN SPLIT - BASE LAYOUT
   ═══════════════════════════════════════════════════════════════ */

.result-screen-split {
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  background: var(--white);
}

/* ═══════════════════════════════════════════════════════════════
   LADO IZQUIERDO - BRANDING + SCORE
   ═══════════════════════════════════════════════════════════════ */

.result-brand {
  display: none; /* Oculto en mobile */
  flex-direction: column;
  justify-content: space-between;
  flex: 0 0 50%;
  max-width: 50%;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 48px;
  position: relative;
  overflow: hidden;
}

/* Variante PASSED - Verde/Éxito */
.result-brand.passed {
  background: linear-gradient(135deg, #065f46 0%, #047857 50%, #10b981 100%);
}

/* Variante FAILED - Rojo/Peligro */
.result-brand.failed {
  background: linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #ef4444 100%);
}

.result-brand-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 480px;
}

/* Logo */
.result-logo {
  margin-bottom: 48px;
}

.result-logo img {
  height: 40px;
  filter: brightness(0) invert(1);
}

/* Score Hero */
.result-score-hero {
  margin-bottom: 40px;
}

.score-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 24px;
}

.score-status-badge.success {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.score-status-badge.danger {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.score-number-hero {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}

.score-number-hero .score-value {
  font-size: 96px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
  letter-spacing: -4px;
}

.score-number-hero .score-separator {
  font-size: 48px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
}

.score-number-hero .score-max {
  font-size: 48px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.score-label-hero {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 500;
}

/* Stats Row */
.result-stats-row {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 24px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
}

.stat-number.failed {
  color: #fecaca;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
}

/* Attempts Indicator */
.attempts-indicator {
  margin-top: 32px;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.attempts-label {
  display: block;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;
}

.attempts-dots {
  display: flex;
  gap: 8px;
}

.attempt-dot {
  width: 32px;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.attempt-dot.filled {
  background: rgba(255, 255, 255, 0.6);
}

.attempt-dot.current {
  background: #ffffff;
}

/* Brand Footer */
.result-brand-footer {
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.result-brand-footer span {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.5px;
}

/* ═══════════════════════════════════════════════════════════════
   LADO DERECHO - DETALLES + ACCIONES
   ═══════════════════════════════════════════════════════════════ */

.result-details-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  background: var(--white);
  min-height: 100vh;
  min-height: 100dvh;
}

.result-details-container {
  width: 100%;
  max-width: 440px;
}

/* Mobile Header */
.result-mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.result-mobile-header .mobile-logo {
  height: 32px;
}

.mobile-score-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.mobile-score-badge span:first-child {
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
}

.mobile-score-badge.success span:first-child {
  color: var(--success);
}

.mobile-score-badge.danger span:first-child {
  color: var(--danger);
}

.mobile-score-badge .badge-status {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mobile-score-badge.success .badge-status {
  color: var(--success);
}

.mobile-score-badge.danger .badge-status {
  color: var(--danger);
}

/* Header Icon */
.result-header-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.result-header-icon.success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: var(--success);
}

.result-header-icon.danger {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: var(--danger);
}

/* Títulos */
.result-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 10px;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.result-subtitle {
  font-size: 15px;
  color: var(--text-light);
  margin: 0 0 32px;
  line-height: 1.5;
}

/* Attempts Timeline */
.attempts-timeline {
  display: flex;
  gap: 16px;
  margin-bottom: 28px;
  padding: 20px;
  background: var(--gray-light);
  border-radius: 16px;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--white);
  border: 2px solid var(--border);
  border-radius: 12px;
  flex: 1;
  transition: all 0.2s ease;
}

.timeline-item.current {
  border-color: var(--celeste);
  background: rgba(4, 153, 213, 0.04);
}

.timeline-marker {
  width: 28px;
  height: 28px;
  background: var(--gray);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-light);
  flex-shrink: 0;
}

.timeline-item.current .timeline-marker {
  background: var(--celeste);
  color: var(--white);
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.timeline-score {
  font-size: 16px;
  font-weight: 700;
  color: var(--danger);
}

.timeline-date {
  font-size: 11px;
  color: var(--text-muted);
}

/* Info Grid */
.result-info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 28px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: var(--gray-light);
  border-radius: 14px;
  transition: all 0.2s ease;
}

.info-card:hover {
  background: var(--gray);
}

.info-icon {
  width: 40px;
  height: 40px;
  background: var(--white);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--celeste);
  flex-shrink: 0;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.info-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

/* Actions */
.result-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 16px 24px;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--blue) 0%, #001a7a 100%);
  color: var(--white);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 15, 90, 0.3);
}

.action-btn.secondary {
  background: var(--white);
  color: var(--text-light);
  border: 2px solid var(--border);
}

.action-btn.secondary:hover {
  border-color: var(--celeste);
  color: var(--celeste);
  background: rgba(4, 153, 213, 0.02);
}

.action-btn.secondary.success {
  color: var(--success);
  border-color: var(--success);
}

.action-btn.secondary.success:hover {
  background: #ecfdf5;
}

/* No Attempts Alert */
.no-attempts-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 18px;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 2px solid #fbbf24;
  border-radius: 14px;
  color: #92400e;
  font-size: 14px;
  line-height: 1.5;
}

.no-attempts-alert svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #f59e0b;
}

/* Help Text */
.result-help-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.result-help-text svg {
  flex-shrink: 0;
  color: var(--text-muted);
}

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE BREAKPOINTS
   ═══════════════════════════════════════════════════════════════ */

/* Tablet */
@media (min-width: 768px) {
  .result-details-side {
    padding: 48px 40px;
  }
  
  .result-mobile-header {
    margin-bottom: 40px;
  }
  
  .result-header-icon {
    width: 80px;
    height: 80px;
  }
  
  .result-title {
    font-size: 32px;
  }
  
  .result-info-grid {
    flex-direction: row;
    gap: 16px;
  }
  
  .info-card {
    flex: 1;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .result-brand {
    display: flex; /* Mostrar en desktop */
  }
  
  .result-mobile-header {
    display: none; /* Ocultar en desktop */
  }
  
  .result-details-side {
    flex: 0 0 50%;
    max-width: 50%;
    padding: 48px 56px;
  }
  
  .result-details-container {
    max-width: 420px;
  }
  
  .attempts-timeline {
    flex-direction: row;
  }
}

/* Large Desktop */
@media (min-width: 1280px) {
  .result-brand {
    padding: 56px 64px;
  }
  
  .score-number-hero .score-value {
    font-size: 112px;
  }
  
  .score-number-hero .score-separator {
    font-size: 56px;
  }
  
  .score-number-hero .score-max {
    font-size: 56px;
  }
  
  .result-details-side {
    padding: 56px 72px;
  }
}

/* Extra Large Desktop */
@media (min-width: 1440px) {
  .result-brand {
    flex: 0 0 55%;
    max-width: 55%;
    padding: 64px 80px;
  }
  
  .result-brand-content {
    max-width: 520px;
  }
  
  .result-details-side {
    flex: 0 0 45%;
    max-width: 45%;
  }
  
  .score-number-hero .score-value {
    font-size: 120px;
  }
}

/* ═══════════════════════════════════════════════════════════════
   LOADING STATE (sin cambios, mantener existente)
   ═══════════════════════════════════════════════════════════════ */

.loading-state {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: var(--white);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border);
  border-top-color: var(--celeste);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  font-size: 15px;
  color: var(--text-light);
  margin: 0;
}
.quiz-screen {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--gray-light);
}

.quiz-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--white);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-logo {
  height: 28px;
}

.header-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  display: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.timer {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--blue);
  color: white;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.timer.warning {
  background: var(--warning);
}

.timer.critical {
  background: var(--danger);
  animation: pulse 0.5s infinite;
}

@keyframes pulse {
  50% { opacity: 0.7; }
}

.btn-nav-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--gray);
  border: none;
  border-radius: 8px;
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.nav-count-badge {
  background: var(--celeste);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

.quiz-progress {
  height: 4px;
  background: var(--border);
}

.quiz-progress .progress-bar {
  height: 100%;
  background: var(--celeste);
  transition: width 0.3s ease;
}

.quiz-layout {
  flex: 1;
  display: flex;
  position: relative;
}

.quiz-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
}

.mobile-only {
  display: flex;
}

.desktop-only {
  display: none;
}

.quiz-sidebar {
  display: none;
}

.nav-panel.mobile-panel {
  display: flex;
}

/* ═══════════════════════════════════════════════════════════════
   QUESTION CARD
   ═══════════════════════════════════════════════════════════════ */

.question-card {
  flex: 1;
  background: var(--white);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  animation: fadeInQ 0.3s ease;
}

@keyframes fadeInQ {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.question-badge {
  font-size: 12px;
  font-weight: 700;
  color: var(--celeste);
  background: rgba(4, 153, 213, 0.1);
  padding: 6px 14px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.question-points {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
}

.question-text {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.5;
  margin: 0 0 8px;
  color: var(--blue);
}

.question-help {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0 0 20px;
}

/* ═══════════════════════════════════════════════════════════════
   ANSWER INPUTS
   ═══════════════════════════════════════════════════════════════ */

.answer-container {
  margin-top: 20px;
}

.input-text,
.input-textarea,
.input-select {
  width: 100%;
  padding: 14px 16px;
  font-size: 15px;
  color: var(--text);
  background: var(--white);
  border: 2px solid var(--border);
  border-radius: 10px;
}

.input-text:focus,
.input-textarea:focus,
.input-select:focus {
  outline: none;
  border-color: var(--celeste);
}

.input-textarea {
  resize: none;
  min-height: 100px;
}

.input-select {
  appearance: none;
  cursor: pointer;
}

/* ═══════════════════════════════════════════════════════════════
   OPTIONS (RADIO, CHECKBOX, SELECT)
   ═══════════════════════════════════════════════════════════════ */

.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--white);
  border: 2px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
}

.option-card:hover {
  border-color: var(--celeste);
  background: rgba(4, 153, 213, 0.02);
}

.option-card.selected {
  border-color: var(--celeste);
  background: rgba(4, 153, 213, 0.06);
}

.option-marker {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-marker.checkbox {
  border-radius: 6px;
}

.option-card.selected .option-marker {
  background: var(--celeste);
  border-color: var(--celeste);
  color: white;
}

.option-label {
  flex: 1;
  font-size: 15px;
  color: var(--text);
  line-height: 1.4;
}

/* ═══════════════════════════════════════════════════════════════
   TRUE/FALSE
   ═══════════════════════════════════════════════════════════════ */

.tf-options {
  display: flex;
  gap: 12px;
}

.tf-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 18px;
  background: var(--white);
  border: 2px solid var(--border);
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
}

.tf-btn:hover {
  border-color: var(--celeste);
}

.tf-btn.selected {
  border-color: var(--celeste);
  background: rgba(4, 153, 213, 0.06);
}

.tf-marker {
  width: 32px;
  height: 32px;
  background: var(--gray);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: var(--text-light);
}

.tf-btn.selected .tf-marker {
  background: var(--celeste);
  color: white;
}

/* ═══════════════════════════════════════════════════════════════
   RATING & SCALE
   ═══════════════════════════════════════════════════════════════ */

.rating-container {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.star {
  background: none;
  border: none;
  padding: 4px;
  color: var(--border);
  cursor: pointer;
}

.star:hover,
.star.active {
  color: #fbbf24;
  transform: scale(1.1);
}

.scale-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.scale-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.scale-btn {
  width: 40px;
  height: 40px;
  border: 2px solid var(--border);
  border-radius: 8px;
  background: var(--white);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-light);
  cursor: pointer;
}

.scale-btn:hover {
  border-color: var(--celeste);
  color: var(--celeste);
}

.scale-btn.active {
  background: var(--celeste);
  border-color: var(--celeste);
  color: white;
}

/* ═══════════════════════════════════════════════════════════════
   FILE UPLOAD
   ═══════════════════════════════════════════════════════════════ */

.file-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px;
  border: 2px dashed var(--border);
  border-radius: 10px;
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
}

.file-upload:hover {
  border-color: var(--celeste);
  color: var(--celeste);
}

.file-upload input {
  display: none;
}

/* ═══════════════════════════════════════════════════════════════
   QUESTION NAVIGATION
   ═══════════════════════════════════════════════════════════════ */

.error-field {
  margin-top: 12px;
  font-size: 13px;
  color: var(--danger);
}

.question-nav {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: 2px solid var(--border);
  border-radius: 10px;
  background: var(--white);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-light);
  cursor: pointer;
}

.nav-btn:hover:not(:disabled) {
  border-color: var(--text-light);
  color: var(--text);
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nav-btn.primary {
  flex: 1;
  background: var(--celeste);
  border-color: var(--celeste);
  color: white;
}

.nav-btn.primary:hover:not(:disabled) {
  background: #0380b8;
  border-color: #0380b8;
}

.nav-btn.finish {
  background: var(--success);
  border-color: var(--success);
}

.nav-btn.finish:hover:not(:disabled) {
  background: #059669;
  border-color: #059669;
}

/* ═══════════════════════════════════════════════════════════════
   NAVIGATION PANEL (MOBILE)
   ═══════════════════════════════════════════════════════════════ */

.nav-panel {
  position: fixed;
  top: 0;
  right: -320px;
  width: 300px;
  height: 100%;
  background: var(--white);
  box-shadow: -4px 0 20px rgba(0,0,0,0.1);
  z-index: 200;
  display: flex;
  flex-direction: column;
  transition: right 0.3s ease;
}

.nav-panel.open {
  right: 0;
}

.nav-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.nav-panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.close-panel {
  background: none;
  border: none;
  padding: 4px;
  color: var(--text-light);
  cursor: pointer;
}

.nav-legend {
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-light);
}

.legend-item .dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
}

.legend-item.answered .dot {
  background: var(--celeste);
}

.legend-item.pending .dot {
  background: var(--border);
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  align-content: start;
}

.nav-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray);
  border: 2px solid transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-light);
  cursor: pointer;
}

.nav-cell:hover {
  border-color: var(--celeste);
}

.nav-cell.active {
  border-color: var(--blue);
  background: var(--blue);
  color: white;
}

.nav-cell.answered {
  background: var(--celeste);
  color: white;
}

.nav-cell.answered.active {
  background: var(--blue);
}

.nav-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 150;
}

/* ═══════════════════════════════════════════════════════════════
   RESULT SCREEN
   ═══════════════════════════════════════════════════════════════ */

.result-screen {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--gray-light);
}

.result-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.result-mobile-header {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--white);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
}

.mobile-nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--gray);
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
}

.mobile-nav-btn:hover {
  background: var(--border);
}

.mobile-nav-btn.back {
  background: var(--blue);
  color: white;
}

.mobile-nav-btn.back:hover {
  background: #001a7a;
}

.result-left {
  flex: 1;
  padding: 20px;
  background: var(--white);
}

/* ═══════════════════════════════════════════════════════════════
   SCORE CARD
   ═══════════════════════════════════════════════════════════════ */

.score-card {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
  padding: 20px 16px;
}

.score-card.passed .score-status {
  color: var(--success);
}

.score-card:not(.passed) .score-status {
  color: var(--danger);
}

.score-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 16px;
}

.status-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-card.passed .status-icon {
  background: #d1fae5;
  color: var(--success);
}

.score-card:not(.passed) .status-icon {
  background: #fee2e2;
  color: var(--danger);
}

.status-text {
  font-size: 18px;
  font-weight: 700;
}

.score-main {
  margin-bottom: 20px;
}

.score-number {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  margin-bottom: 6px;
}

.score-obtained {
  font-size: 56px;
  font-weight: 800;
  color: var(--blue);
  line-height: 1;
}

.score-separator {
  font-size: 32px;
  font-weight: 300;
  color: var(--text-muted);
}

.score-total {
  font-size: 32px;
  font-weight: 600;
  color: var(--text-muted);
}

.score-label {
  font-size: 13px;
  color: var(--text-light);
}

.score-stats {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stat-box {
  text-align: center;
  padding: 12px 16px;
  background: var(--gray-light);
  border-radius: 10px;
  min-width: 80px;
}

.stat-box.correct .stat-num {
  color: var(--success);
}

.stat-box.wrong .stat-num {
  color: var(--danger);
}

.stat-num {
  display: block;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text);
}

.stat-label {
  font-size: 9px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
  display: block;
}

.score-progress {
  position: relative;
  max-width: 400px;
  margin: 0 auto 20px;
}

.progress-track {
  height: 10px;
  background: var(--gray);
  border-radius: 5px;
  overflow: visible;
}

.progress-fill {
  height: 100%;
  background: var(--danger);
  border-radius: 5px;
  transition: width 0.8s ease;
}

.progress-fill.passed {
  background: var(--celeste);
}

/* ═══════════════════════════════════════════════════════════════
   REVIEW SECTION
   ═══════════════════════════════════════════════════════════════ */

.section-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin: 32px auto 24px;
  max-width: 500px;
  padding: 0 16px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}

.divider-text {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  white-space: nowrap;
}

.review-section {
  max-width: 500px;
  margin: 0 auto;
  padding: 0 16px 32px;
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.review-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}

.review-summary {
  display: flex;
  gap: 16px;
  font-size: 13px;
  font-weight: 500;
}

.summary-correct {
  color: var(--success);
}

.summary-wrong {
  color: var(--danger);
}

.review-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.pill {
  width: 36px;
  height: 36px;
  border: 2px solid var(--border);
  border-radius: 8px;
  background: var(--white);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-light);
  cursor: pointer;
}

.pill:hover {
  border-color: var(--celeste);
}

.pill.active {
  border-color: var(--blue);
  background: var(--blue);
  color: white;
}

.pill.correct {
  border-color: var(--success);
  background: #ecfdf5;
  color: var(--success);
}

.pill.correct.active {
  background: var(--success);
  color: white;
}

.pill.wrong {
  border-color: var(--danger);
  background: #fef2f2;
  color: var(--danger);
}

.pill.wrong.active {
  background: var(--danger);
  color: white;
}

.review-card {
  background: var(--gray-light);
  border-radius: 16px;
  padding: 24px;
}

.review-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.review-number {
  font-size: 13px;
  font-weight: 700;
  color: var(--celeste);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.review-points {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  background: #fef3c7;
  border-radius: 6px;
  color: #92400e;
}

.review-status {
  font-size: 11px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.review-status.correct {
  background: #d1fae5;
  color: var(--success);
}

.review-status.wrong {
  background: #fee2e2;
  color: var(--danger);
}

.review-question {
  font-size: 16px;
  font-weight: 500;
  color: var(--text);
  margin: 0 0 20px;
  line-height: 1.6;
}

.review-answers {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-answer {
  padding: 16px;
  background: var(--white);
  border-radius: 10px;
  border-left: 4px solid var(--border);
}

.review-answer.user.wrong {
  border-left-color: var(--danger);
}

.review-answer.correct {
  background: #ecfdf5;
  border-left-color: var(--success);
}

.answer-label {
  display: block;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.answer-text {
  font-size: 15px;
  color: var(--text);
  line-height: 1.5;
}

.review-answer.correct .answer-text {
  color: #065f46;
  font-weight: 500;
}

.review-answer.user.wrong .answer-text {
  color: var(--danger);
}

.review-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.review-arrow {
  width: 40px;
  height: 40px;
  border: 2px solid var(--border);
  border-radius: 10px;
  background: var(--white);
  color: var(--text-light);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.review-arrow:hover:not(:disabled) {
  border-color: var(--celeste);
  color: var(--celeste);
}

.review-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.review-counter {
  font-size: 14px;
  color: var(--text-light);
  font-weight: 500;
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR (RESULT RIGHT)
   ═══════════════════════════════════════════════════════════════ */

.result-right {
  padding: 24px 20px;
  background: var(--gray-light);
  border-top: 1px solid var(--border);
}

.sidebar-logo {
  text-align: center;
  margin-bottom: 24px;
}

.sidebar-logo img {
  height: 32px;
}

.sidebar-student {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--white);
  border-radius: 14px;
  margin-bottom: 16px;
}

.student-avatar-lg {
  width: 48px;
  height: 48px;
  background: var(--blue);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
}

.student-details {
  flex: 1;
  min-width: 0;
}

.student-details strong {
  display: block;
  font-size: 15px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.student-details span {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.sidebar-exam {
  background: var(--white);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 16px;
}

.sidebar-exam h4 {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.4;
}

.exam-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.detail-label {
  color: var(--text-muted);
}

.detail-value {
  font-weight: 600;
  color: var(--text);
}

.sidebar-certificate {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 16px;
}

.cert-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.cert-icon {
  font-size: 32px;
}

.cert-text strong {
  display: block;
  font-size: 14px;
  color: #065f46;
  margin-bottom: 2px;
}

.cert-text span {
  font-size: 12px;
  color: #047857;
}

.cert-qr {
  text-align: center;
}

.qr-canvas {
  width: 120px !important;
  height: 120px !important;
  border-radius: 10px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}

.action-btn.pdf {
  background: #dc2626;
  color: white;
}

.action-btn.pdf:hover {
  background: #b91c1c;
}

.action-btn.download {
  background: var(--blue);
  color: white;
}

.action-btn.download:hover {
  background: #001a7a;
}

.action-btn.linkedin {
  background: #0077b5;
  color: white;
}

.action-btn.linkedin:hover {
  background: #006097;
}

.sidebar-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.sidebar-footer span {
  font-size: 12px;
  color: var(--text-muted);
}

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE - QUIZ & RESULT
   ═══════════════════════════════════════════════════════════════ */

@media (min-width: 768px) {
  .header-title {
    display: block;
  }
  
  .quiz-main {
    padding: 40px 24px;
  }
  
  .question-card {
    padding: 32px;
  }
  
  .question-text {
    font-size: 22px;
  }
}

@media (min-width: 1024px) {
  .mobile-only {
    display: none !important;
  }
  
  .desktop-only {
    display: flex !important;
  }
  
  .nav-panel.mobile-panel {
    display: none !important;
  }
  
  .quiz-layout {
    max-width: 100%;
    margin: 0;
    gap: 0;
  }
  
  .quiz-main {
    flex: 0 0 70%;
    max-width: 70%;
    padding: 32px 40px;
    margin: 0;
  }
  
  .quiz-sidebar {
    display: flex !important;
    flex-direction: column;
    flex: 0 0 30%;
    max-width: 30%;
    background: var(--white);
    border-left: 1px solid var(--border);
    padding: 24px;
    position: sticky;
    top: 60px;
    height: calc(100vh - 64px);
    overflow-y: auto;
  }
  
  .sidebar-nav-header {
    margin-bottom: 16px;
  }
  
  .sidebar-nav-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
  }
  
  .quiz-sidebar .nav-legend {
    display: flex;
    gap: 16px;
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--border);
  }
  
  .quiz-sidebar .nav-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    margin-bottom: 20px;
  }
  
  .result-layout {
    flex-direction: row;
  }
  
  .result-mobile-header {
    display: none;
  }
  
  .result-left {
    flex: 0 0 70%;
    max-width: 70%;
    padding: 40px;
    border-right: 1px solid var(--border);
    overflow-y: auto;
    max-height: 100vh;
  }
  
  .result-right {
    flex: 0 0 30%;
    max-width: 30%;
    padding: 32px 24px;
    border-top: none;
    background: var(--white);
    overflow-y: auto;
    max-height: 100vh;
    position: sticky;
    top: 0;
  }
  
  .score-card {
    padding: 32px 24px;
  }
  
  .score-obtained {
    font-size: 72px;
  }
  
  .score-separator {
    font-size: 40px;
  }
  
  .score-total {
    font-size: 40px;
  }
  
  .stat-box {
    padding: 14px 24px;
    min-width: 100px;
  }
  
  .stat-num {
    font-size: 26px;
  }
  
  .section-divider {
    max-width: 500px;
    margin: 40px auto 32px;
  }
  
  .review-section {
    padding: 0 0 40px;
    max-width: 600px;
  }
  
  .pill {
    width: 38px;
    height: 38px;
    font-size: 14px;
  }
  
  .qr-canvas {
    width: 130px !important;
    height: 130px !important;
  }
  
  .sidebar-logo {
    margin-bottom: 28px;
  }
  
  .sidebar-logo img {
    height: 36px;
  }
}

@media (min-width: 1280px) {
  .result-left {
    padding: 48px 56px;
  }
  
  .result-right {
    padding: 40px 32px;
  }
  
  .score-obtained {
    font-size: 80px;
  }
  
  .score-separator {
    font-size: 44px;
  }
  
  .score-total {
    font-size: 44px;
  }
  
  .quiz-main {
    padding: 40px 56px;
  }
  
  .quiz-sidebar {
    padding: 32px;
  }
  
  .section-divider {
    margin: 44px auto 36px;
  }
}

/* ═══════════════════════════════════════════════════════════════
   TOUR STYLES - SISTEMA DE TUTORIAL INTERACTIVO
   ═══════════════════════════════════════════════════════════════ */

/* Overlay oscuro de fondo */
.tour-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 15, 90, 0.85);
  z-index: 9998;
  animation: tour-fade-in 0.3s ease;
}

@keyframes tour-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Spotlight que ilumina el elemento activo */
.tour-spotlight {
  position: fixed;
  border-radius: 16px;
  z-index: 9999;
  pointer-events: none;
  box-shadow:   
    0 0 0 4px #0499D5,
    0 0 0 8px rgba(4, 153, 213, 0.3),
    0 0 0 9999px rgba(0, 15, 90, 0.85);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Borde animado del spotlight (anillo interior) */
.tour-spotlight::before {
  content: '';
  position: absolute;
  inset: -6px;
  border: 3px solid #0499D5;
  border-radius: 20px;
  animation: tour-pulse-border 2s infinite;
}

/* Borde animado del spotlight (anillo exterior) */
.tour-spotlight::after {
  content: '';
  position: absolute;
  inset: -12px;
  border: 2px solid rgba(4, 153, 213, 0.4);
  border-radius: 24px;
  animation: tour-pulse-border 2s infinite 0.3s;
}

@keyframes tour-pulse-border {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1); 
  }
  50% { 
    opacity: 0.4; 
    transform: scale(1.01); 
  }
}

/* Modal del tour (tarjeta informativa) */
.tour-modal {
  position: fixed;
  background: #ffffff;
  border-radius: 20px;
  padding: 28px;
  width: calc(100% - 32px);
  max-width: 400px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
  z-index: 10000;
  animation: tour-modal-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes tour-modal-enter {
  from { 
    opacity: 0; 
    transform: translateY(24px) scale(0.95); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}

/* Botón cerrar (X) del tour */
.tour-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 36px;
  height: 36px;
  border: none;
  background: #f1f5f9;
  border-radius: 10px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.tour-close:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* Header del modal del tour */
.tour-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
  padding-right: 30px;
}

/* Icono del tour con gradiente */
.tour-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #000F5A 0%, #0499D5 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 15, 90, 0.3);
}

/* Título del paso del tour */
.tour-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
  line-height: 1.3;
}

/* Descripción del paso */
.tour-description {
  font-size: 15px;
  color: #64748b;
  line-height: 1.7;
  margin: 0 0 16px;
}

/* Footer del modal */
.tour-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

/* Contenedor de dots (indicadores de progreso) */
.tour-dots {
  display: flex;
  gap: 8px;
}

/* Dot individual */
.tour-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e2e8f0;
  transition: all 0.3s;
}

/* Dot activo (paso actual) */
.tour-dot.active {
  background: #0499D5;
  transform: scale(1.3);
  box-shadow: 0 0 0 3px rgba(4, 153, 213, 0.2);
}

/* Dot completado */
.tour-dot.completed {
  background: #10b981;
}

/* Contenedor de botones de acción */
.tour-actions {
  display: flex;
  gap: 10px;
}

/* Botón base del tour */
.tour-btn {
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

/* Botón secundario (Omitir) */
.tour-btn.secondary {
  background: #f1f5f9;
  color: #64748b;
}

.tour-btn.secondary:hover {
  background: #e2e8f0;
  color: #1a1a2e;
}

/* Botón primario (Siguiente, Finalizar) */
.tour-btn.primary {
  background: linear-gradient(135deg, #0499D5 0%, #0380b8 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(4, 153, 213, 0.3);
}

.tour-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(4, 153, 213, 0.4);
}

/* Clase que se aplica al elemento destacado */
.tour-highlight {
  position: relative !important;
  z-index: 9999 !important;
  background: inherit;
}

/* Botón flotante para reiniciar el tour */
.tour-restart-btn {
  position: fixed;
  bottom: 24px;
  left: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #000F5A 0%, #0499D5 100%);
  color: white;
  border: none;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 24px rgba(0, 15, 90, 0.35);
  z-index: 1000;
  transition: all 0.3s;
  animation: tour-btn-pulse 3s ease-in-out infinite;
}

.tour-restart-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(0, 15, 90, 0.45);
  animation: none;
}

/* Texto del botón reiniciar (oculto en móvil) */
.tour-restart-btn span {
  display: none;
}

@keyframes tour-btn-pulse {
  0%, 100% { 
    box-shadow: 0 4px 24px rgba(0, 15, 90, 0.35); 
  }
  50% { 
    box-shadow: 0 4px 24px rgba(0, 15, 90, 0.35), 
                0 0 0 8px rgba(4, 153, 213, 0.15); 
  }
}

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE - TOUR
   ═══════════════════════════════════════════════════════════════ */

/* Tablet y Desktop: mostrar texto en botón reiniciar */
@media (min-width: 768px) {
  .tour-restart-btn span {
    display: inline;
  }
}

/* Móvil: ajustar modal del tour */
@media (max-width: 480px) {
  .tour-modal {
    left: 12px !important;
    right: 12px !important;
    max-width: calc(100% - 24px) !important;
    padding: 24px 20px;
  }
  
  .tour-icon {
    width: 48px;
    height: 48px;
  }
  
  .tour-title {
    font-size: 17px;
  }
  
  .tour-footer {
    flex-direction: column;
    gap: 16px;
  }
  
  .tour-dots {
    order: 2;
  }
  
  .tour-actions {
    width: 100%;
    order: 1;
  }
  
  .tour-btn {
    flex: 1;
    text-align: center;
  }
  
  .tour-restart-btn {
    bottom: 16px;
    left: 16px;
    padding: 12px 16px;
  }
}
  /* ═══════════════════════════════════════════════════════════════
    PASSED EXAM SCREEN - NUEVA PALETA
    ═══════════════════════════════════════════════════════════════ */
  .passed-exam-screen {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: var(--gray-light);
  }

  .passed-exam-card {
    background: var(--white);
    border-radius: 24px;
    padding: 40px 32px;
    max-width: 520px;
    width: 100%;
    box-shadow: var(--shadow);
  }

  .passed-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .passed-icon-wrapper {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    color: var(--success);
  }

  .passed-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--text);
    margin: 0 0 8px;
    line-height: 1.3;
  }

  .passed-subtitle {
    font-size: 15px;
    color: var(--text-light);
    margin: 0;
  }

  /* Score Display */
  .passed-score-section {
    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
    border-radius: 20px;
    padding: 32px 24px;
    text-align: center;
    margin-bottom: 24px;
    border: 2px solid #a7f3d0;
  }

  .passed-score-display {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 4px;
    margin-bottom: 8px;
  }

  .score-number-large.success {
    color: var(--success);
  }

  .score-divider.success {
    color: var(--success);
  }

  .score-max.success {
    color: var(--success);
  }

  /* Details Grid */
  .passed-details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 28px;
  }

  .detail-icon.success {
    color: var(--success);
  }

  /* Actions */
  .passed-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .btn-view-full {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 16px 24px;
    background: linear-gradient(135deg, var(--blue) 0%, #001a7a 100%);
    color: var(--white);
    border: none;
    border-radius: var(--radius);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-view-full:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 15, 90, 0.3);
  }

  .btn-download-cert {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 14px 24px;
    background: var(--white);
    color: var(--success);
    border: 2px solid var(--success);
    border-radius: var(--radius);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-download-cert:hover {
    background: #ecfdf5;
    transform: translateY(-1px);
  }

  /* Responsive */
  @media (max-width: 640px) {
    .passed-exam-card {
      padding: 32px 24px;
    }
    
    .passed-title {
      font-size: 24px;
    }
    
    .passed-details-grid {
      grid-template-columns: 1fr;
    }
  }

  /* ═══════════════════════════════════════════════════════════════
    FAILED EXAM SCREEN - NUEVA PALETA
    ═══════════════════════════════════════════════════════════════ */
  .failed-exam-screen {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: var(--gray-light);
  }

  .failed-exam-card {
    background: var(--white);
    border-radius: 24px;
    padding: 40px 32px;
    max-width: 520px;
    width: 100%;
    box-shadow: var(--shadow);
  }

  .failed-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .failed-icon-wrapper {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    color: var(--danger);
  }

  .failed-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--text);
    margin: 0 0 8px;
    line-height: 1.3;
  }

  .failed-subtitle {
    font-size: 15px;
    color: var(--text-light);
    margin: 0;
  }

  /* Historial de Intentos */
  .attempts-history {
    background: var(--gray-light);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 24px;
  }

  .attempts-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 16px;
  }

  .attempts-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .attempt-item {
    background: var(--white);
    border: 2px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.2s ease;
  }

  .attempt-item.current {
    border-color: var(--celeste);
    background: rgba(4, 153, 213, 0.04);
  }

  .attempt-badge {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: var(--gray-light);
    padding: 6px 12px;
    border-radius: 6px;
    white-space: nowrap;
  }

  .attempt-item.current .attempt-badge {
    background: var(--celeste);
    color: var(--white);
  }

  .attempt-score {
    display: flex;
    align-items: baseline;
    gap: 2px;
    flex-shrink: 0;
  }

  .score-big {
    font-size: 24px;
    font-weight: 800;
    color: var(--danger);
    line-height: 1;
  }

  .score-small {
    font-size: 14px;
    font-weight: 600;
    color: var(--danger);
    opacity: 0.6;
  }

  .attempt-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    color: var(--text-light);
  }

  .attempt-date {
    font-size: 11px;
    color: var(--text-muted);
  }

  /* Score Display */
  .failed-score-section {
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    border-radius: 20px;
    padding: 32px 24px;
    text-align: center;
    margin-bottom: 24px;
    border: 2px solid #fecaca;
    position: relative;
  }

  .section-label {
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 11px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: var(--white);
    padding: 4px 12px;
    border-radius: 6px;
  }

  .failed-score-display {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 4px;
    margin-bottom: 8px;
  }

  .score-number-large {
    font-size: 64px;
    font-weight: 800;
    color: var(--danger);
    line-height: 1;
  }

  .score-divider {
    font-size: 40px;
    font-weight: 300;
    color: var(--danger);
    opacity: 0.6;
  }

  .score-max {
    font-size: 32px;
    font-weight: 600;
    color: var(--danger);
    opacity: 0.7;
  }

  .score-description {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-light);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Details Grid */
  .failed-details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 28px;
  }

  .detail-card {
    background: var(--gray-light);
    border-radius: 14px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .detail-card.full-width {
    grid-column: 1 / -1;
  }

  .detail-icon {
    width: 40px;
    height: 40px;
    background: var(--white);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--celeste);
    flex-shrink: 0;
  }

  .detail-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .detail-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .detail-value {
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
  }

  .detail-value.critical {
    color: var(--danger);
    font-size: 18px;
  }

  /* Actions */
  .failed-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .btn-retry {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 16px 24px;
    background: linear-gradient(135deg, var(--blue) 0%, #001a7a 100%);
    color: var(--white);
    border: none;
    border-radius: var(--radius);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-retry:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 15, 90, 0.3);
  }

  .btn-view-detail {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 14px 24px;
    background: var(--white);
    color: var(--text-light);
    border: 2px solid var(--border);
    border-radius: var(--radius);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-view-detail:hover {
    border-color: var(--celeste);
    color: var(--celeste);
    background: rgba(4, 153, 213, 0.02);
  }

  /* Mensaje de no más intentos */
  .no-attempts-message {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 18px;
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    border: 2px solid #fbbf24;
    border-radius: var(--radius);
    color: #92400e;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 12px;
  }

  .no-attempts-message svg {
    flex-shrink: 0;
    margin-top: 2px;
    color: #f59e0b;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .failed-exam-card {
      padding: 32px 24px;
    }
    
    .failed-title {
      font-size: 24px;
    }
    
    .score-number-large {
      font-size: 56px;
    }
    
    .score-divider {
      font-size: 36px;
    }
    
    .score-max {
      font-size: 28px;
    }
    
    .failed-details-grid {
      grid-template-columns: 1fr;
    }
    
    .detail-card.full-width {
      grid-column: 1;
    }

    .attempt-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .attempt-score {
      order: -1;
    }

    .attempts-history {
      padding: 16px;
    }
  }

  /* ═══════════════════════════════════════════════════════════════
    LOADING STATE
    ═══════════════════════════════════════════════════════════════ */
  .loading-state {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e2e8f0;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* ═══════════════════════════════════════════════════════════════
    PROCESSING MODAL STYLES
    ═══════════════════════════════════════════════════════════════ */
.processing-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 15, 90, 0.95);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
    backdrop-filter: blur(0px);
  }
  to { 
    opacity: 1; 
    backdrop-filter: blur(5px);
  }
}

.processing-modal {
  background: #ffffff;
  border-radius: 24px;
  padding: 40px 32px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  animation: modalSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  z-index: 1000000;
}

@keyframes modalSlide {
  from { 
    opacity: 0; 
    transform: translateY(30px) scale(0.92); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}

.processing-video-container {
  width: 180px;
  height: 180px;
  margin: 0 auto 24px;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  box-shadow: 
    0 8px 24px rgba(0, 15, 90, 0.15),
    0 0 0 1px rgba(0, 15, 90, 0.05);
}

.processing-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.processing-content {
  margin-top: 8px;
}

.processing-title {
  font-size: 20px;
  font-weight: 700;
  color: #000F5A;
  margin: 0 0 10px;
  line-height: 1.3;
}

.processing-text {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 480px) {
  .processing-modal {
    padding: 32px 24px;
    border-radius: 20px;
    margin: 16px;
  }
  
  .processing-video-container {
    width: 150px;
    height: 150px;
  }
  
  .processing-title {
    font-size: 18px;
  }
  
  .processing-text {
    font-size: 13px;
  }
}

  /* ═══════════════════════════════════════════════════════════════
    SWEETALERT TOAST STYLES - ESTILO NOTIFICACIÓN HORIZONTAL
    ═══════════════════════════════════════════════════════════════ */
:deep(.certificate-toast) {
  min-width: 380px !important;
  max-width: 450px !important;
  padding: 18px 20px !important;
  background: #ffffff !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05) !important;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

:deep(.swal2-hide) {
  animation: slideOutRight 0.3s cubic-bezier(0.4, 0, 1, 1) !important;
}

:deep(.certificate-toast.loading) {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%) !important;
}

:deep(.certificate-toast.error) {
  background: #ffffff !important;
}

:deep(.certificate-toast .swal2-icon) {
  margin: 0 !important;
  width: 40px !important;
  height: 40px !important;
  border-width: 3px !important;
}

:deep(.certificate-toast .swal2-icon.swal2-success) {
  border-color: #10b981 !important;
  color: #10b981 !important;
}

:deep(.certificate-toast .swal2-icon.swal2-error) {
  border-color: #ef4444 !important;
  color: #ef4444 !important;
}

:deep(.certificate-toast .swal2-icon.swal2-info) {
  border-color: #0499D5 !important;
  color: #0499D5 !important;
}

:deep(.certificate-toast .swal2-icon .swal2-icon-content) {
  font-size: 24px !important;
}

:deep(.certificate-toast .swal2-success-ring) {
  border: 3px solid rgba(16, 185, 129, 0.3) !important;
}

:deep(.certificate-toast .swal2-success-line-tip),
:deep(.certificate-toast .swal2-success-line-long) {
  background-color: #10b981 !important;
}

:deep(.certificate-toast .swal2-x-mark-line-left),
:deep(.certificate-toast .swal2-x-mark-line-right) {
  background-color: #ef4444 !important;
}

:deep(.certificate-toast .swal2-icon.swal2-info::before) {
  content: 'ℹ' !important;
  font-size: 24px !important;
}

:deep(.certificate-toast-title) {
  font-size: 16px !important;
  font-weight: 700 !important;
  color: #1a1a2e !important;
  margin: 0 !important;
  padding: 0 !important;
  line-height: 1.3 !important;
}

:deep(.certificate-toast-text) {
  font-size: 14px !important;
  color: #64748b !important;
  margin: 4px 0 0 0 !important;
  padding: 0 !important;
  line-height: 1.5 !important;
}

:deep(.certificate-toast-text strong) {
  color: #000F5A !important;
  font-weight: 600 !important;
}

:deep(.certificate-toast .swal2-close) {
  width: 28px !important;
  height: 28px !important;
  line-height: 28px !important;
  font-size: 24px !important;
  color: #94a3b8 !important;
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
  top: 16px !important;
  right: 16px !important;
}

:deep(.certificate-toast .swal2-close:hover) {
  background: #f1f5f9 !important;
  color: #1a1a2e !important;
  transform: none !important;
}

:deep(.certificate-toast-progress) {
  background: rgba(4, 153, 213, 0.2) !important;
  height: 4px !important;
  border-radius: 0 0 12px 12px !important;
}

:deep(.certificate-toast-progress .swal2-timer-progress-bar) {
  background: #0499D5 !important;
}

:deep(.certificate-toast .swal2-loader) {
  border-width: 3px !important;
  border-color: #0499D5 transparent #0499D5 transparent !important;
  width: 30px !important;
  height: 30px !important;
  margin: 0 auto !important;
}

:deep(.certificate-toast .swal2-popup) {
  display: flex !important;
  flex-direction: row !important;
  align-items: flex-start !important;
  gap: 14px !important;
  padding: 0 !important;
}

:deep(.certificate-toast .swal2-html-container) {
  margin: 0 !important;
  padding: 0 !important;
  flex: 1 !important;
  text-align: left !important;
}

:deep(.swal2-container.swal2-top-end) {
  background: transparent !important;
}

@media (max-width: 640px) {
  :deep(.certificate-toast) {
    min-width: calc(100vw - 32px) !important;
    max-width: calc(100vw - 32px) !important;
    margin: 16px !important;
  }
}

:deep(.certificate-toast .swal2-icon) {
  position: relative !important;
  flex-shrink: 0 !important;
  margin-top: 2px !important;
}

:deep(.certificate-toast .swal2-content) {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  padding: 0 32px 0 0 !important;
}

  /* ═══════════════════════════════════════════════════════════════
    VALIDATION SCREEN - SPLIT LAYOUT (FULL HEIGHT)
    ═══════════════════════════════════════════════════════════════ */

  .validation-screen {
    display: flex;
    min-height: 100vh;
    min-height: 100dvh;
    width: 100%;
    background: #ffffff;
    padding: 0 !important;
  }

  .validation-brand {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    flex: 0 0 55%;
    max-width: 55%;
    min-height: 100vh;
    min-height: 100dvh;
    background: linear-gradient(135deg, #000F5A 0%, #001a7a 50%, #0499D5 100%);
    padding: 48px;
    position: relative;
    overflow: hidden;
  }

  .brand-content {
    position: relative;
    z-index: 2;
    max-width: 520px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .brand-logo-wrapper {
    margin-bottom: 48px;
  }

  .brand-logo-wrapper .brand-logo {
    height: 44px;
    filter: brightness(0) invert(1);
    margin-bottom: 0;
  }

  .brand-title {
    font-size: 36px;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.25;
    margin: 0 0 20px;
    letter-spacing: -0.5px;
  }

  .brand-description {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.7;
    margin: 0 0 40px;
    max-width: 440px;
  }

  .brand-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .brand-chip {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
  }

  .brand-chip svg {
    opacity: 0.85;
  }

  .brand-decoration {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
  }

  .decoration-circle {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .circle-1 {
    width: 400px;
    height: 400px;
    top: -100px;
    right: -100px;
    background: radial-gradient(circle, rgba(4, 153, 213, 0.15) 0%, transparent 70%);
  }

  .circle-2 {
    width: 300px;
    height: 300px;
    bottom: 10%;
    right: 20%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
  }

  .circle-3 {
    width: 200px;
    height: 200px;
    bottom: -50px;
    left: 10%;
    background: radial-gradient(circle, rgba(4, 153, 213, 0.1) 0%, transparent 70%);
  }

  .brand-footer {
    position: relative;
    z-index: 2;
    padding-top: 32px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: auto;
  }

  .brand-footer span {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    letter-spacing: 0.5px;
  }

  .validation-form-side {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 24px;
    background: #ffffff;
    min-height: 100vh;
    min-height: 100dvh;
  }

  .validation-form-container {
    width: 100%;
    max-width: 400px;
  }

  .mobile-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .mobile-logo {
    height: 36px;
    margin-bottom: 20px;
  }

  .mobile-title {
    font-size: 20px;
    font-weight: 700;
    color: #000F5A;
    line-height: 1.35;
    margin: 0;
  }

  .form-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, rgba(4, 153, 213, 0.1) 0%, rgba(0, 15, 90, 0.08) 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0499D5;
    margin-bottom: 28px;
  }

  .form-title {
    font-size: 26px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 10px;
    letter-spacing: -0.3px;
  }

  .form-subtitle {
    font-size: 15px;
    color: #64748b;
    line-height: 1.6;
    margin: 0 0 32px;
  }

  .validation-form {
    margin-bottom: 24px;
  }

  .input-wrapper {
    margin-bottom: 20px;
  }

  .input-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
  }

  .input-field {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 18px;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .input-field svg {
    color: #94a3b8;
    flex-shrink: 0;
    transition: color 0.2s;
  }

  .input-field.is-focused {
    background: #ffffff;
    border-color: #0499D5;
    box-shadow: 0 0 0 4px rgba(4, 153, 213, 0.1);
  }

  .input-field.is-focused svg {
    color: #0499D5;
  }

  .input-field.has-error {
    border-color: #ef4444;
    background: #fef2f2;
  }

  .input-field.has-error svg {
    color: #ef4444;
  }

  .input-field input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 15px;
    color: #1a1a2e;
    font-family: inherit;
  }

  .input-field input::placeholder {
    color: #94a3b8;
  }

  .input-field input:disabled {
    opacity: 0.6;
  }

  .error-message {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 10px;
    margin-bottom: 20px;
  }

  .error-message svg {
    color: #ef4444;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .error-message span {
    font-size: 14px;
    color: #dc2626;
    line-height: 1.5;
  }

  .submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 16px 24px;
    background: #000F5A;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .submit-btn:hover:not(:disabled) {
    background: #001a7a;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 15, 90, 0.25);
  }

  .submit-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .submit-btn .btn-loader {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .form-help {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 13px;
    color: #94a3b8;
  }

  .form-help svg {
    flex-shrink: 0;
  }

  @media (min-width: 768px) {
    .validation-form-side {
      padding: 48px 40px;
    }
    
    .mobile-header {
      display: none;
    }
    
    .form-icon {
      width: 72px;
      height: 72px;
      border-radius: 18px;
    }
    
    .form-icon svg {
      width: 32px;
      height: 32px;
    }
    
    .form-title {
      font-size: 28px;
    }
  }

  @media (min-width: 1024px) {
    .validation-screen {
      padding: 0 !important;
    }
    
    .validation-brand {
      display: flex;
    }
    
    .mobile-header {
      display: none;
    }
    
    .validation-form-side {
      flex: 0 0 45%;
      max-width: 45%;
      padding: 48px 56px;
    }
    
    .validation-form-container {
      max-width: 380px;
    }
  }

  @media (min-width: 1280px) {
    .validation-brand {
      padding: 56px 64px;
    }
    
    .brand-title {
      font-size: 40px;
    }
    
    .brand-description {
      font-size: 17px;
    }
    
    .validation-form-side {
      padding: 56px 72px;
    }
    
    .validation-form-container {
      max-width: 400px;
    }
  }

  @media (min-width: 1440px) {
    .validation-brand {
      flex: 0 0 58%;
      max-width: 58%;
      padding: 64px 80px;
    }
    
    .brand-content {
      max-width: 580px;
    }
    
    .brand-title {
      font-size: 44px;
    }
    
    .validation-form-side {
      flex: 0 0 42%;
      max-width: 42%;
    }
  }

  /* ═══════════════════════════════════════════════════════════════
    CORE STYLES
    ═══════════════════════════════════════════════════════════════ */
  .form-view { 
    --blue: #000F5A; 
    --celeste: #0499D5; 
    --gray: #EEEEEE; 
    --gray-light: #F8F9FA; 
    --white: #FFFFFF; 
    --text: #1a1a2e; 
    --text-light: #64748b; 
    --text-muted: #94a3b8; 
    --success: #10b981; 
    --danger: #ef4444; 
    --warning: #f59e0b; 
    --border: #e2e8f0; 
    --radius: 12px; 
    --shadow: 0 4px 20px rgba(0, 15, 90, 0.08); 
    min-height: 100vh; 
    min-height: 100dvh; 
    background: var(--white); 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
    color: var(--text); 
  }

  .brand-logo { height: 36px; margin-bottom: 20px; }
  .btn-loader { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }

  .state-screen { min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center; }
  .loader { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--blue); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
  .state-icon { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
  .state-icon.error { background: #fef2f2; color: var(--danger); }
  .state-title { font-size: 18px; font-weight: 600; margin: 0 0 8px; }
  .state-text { font-size: 14px; color: var(--text-light); margin: 0; }
</style>