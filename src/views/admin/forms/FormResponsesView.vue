<template>
  <div class="responses-page">
    <!-- Loading -->
    <div v-if="loading" class="state-container">
      <div class="loader"></div>
      <p>Cargando respuestas...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-container error">
      <div class="state-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
      <h3>Error al cargar</h3>
      <p>{{ error }}</p>
      <router-link to="/admin/forms" class="btn btn-secondary">Volver a la lista</router-link>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Header -->
      <header class="page-header">
        <div class="header-top">
          <router-link :to="`/admin/forms/${formUuid}`" class="back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </router-link>
          <div class="header-badges">
            <span class="badge" :class="form?.form_type?.toLowerCase()">
              {{ form?.form_type === 'EXAM' ? 'Examen' : 'Encuesta' }}
            </span>
          </div>
        </div>

        <div class="header-main">
          <div class="header-info">
            <h1>Respuestas</h1>
            <p class="form-title">{{ form?.title }}</p>
          </div>
          <div class="header-actions">
            <button @click="clearAllFilters" class="btn btn-secondary" v-if="hasActiveFilters">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Limpiar Filtros
            </button>
            <button @click="verGraficos" class="btn btn-primary" :disabled="responses.length === 0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              Reportes
            </button>
          </div>
        </div>
      </header>

      <!-- Stats Cards -->
      <section class="stats-section">
        <div class="stat-card">
          <div class="stat-icon blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.total || 0 }}</span>
            <span class="stat-label">Total respuestas</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.completed || 0 }}</span>
            <span class="stat-label">Completadas</span>
          </div>
        </div>

        <template v-if="isExam">
          <div class="stat-card">
            <div class="stat-icon orange">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.avgScore || 0 }}<small>%</small></span>
              <span class="stat-label">Promedio</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon teal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.certified || 0 }}</span>
              <span class="stat-label">Certificados</span>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="stat-card">
            <div class="stat-icon purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ formQuestions.length }}</span>
              <span class="stat-label">Preguntas</span>
            </div>
          </div>
        </template>
      </section>

      <!-- TABLA PARA EXÁMENES -->
      <section v-if="isExam" class="table-section">
        <div class="table-card">
          <div class="table-wrapper">
            <table class="data-table" v-if="responses.length > 0 || hasActiveFilters">
              <thead>
                <tr class="header-row">
                  <th>Respondiente</th>
                  <th>Fecha</th>
                  <th>Puntuación</th>
                  <th>Resultado</th>
                  <th>Certificado</th>
                  <th>Tiempo</th>
                  <th class="th-actions">Acciones</th>
                </tr>
                <tr class="filter-row">
                  <th>
                    <div class="filter-input-wrapper">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <input type="text" v-model="columnFilters.respondent" placeholder="Buscar..." @input="applyFilters">
                    </div>
                  </th>
                  <th>
                    <div class="filter-date-wrapper">
                      <input type="date" v-model="columnFilters.dateFrom" @change="applyFilters" title="Desde">
                      <span class="date-separator">-</span>
                      <input type="date" v-model="columnFilters.dateTo" @change="applyFilters" title="Hasta">
                    </div>
                  </th>
                  <th>
                    <div class="filter-range">
                      <input type="number" v-model.number="columnFilters.scoreMin" placeholder="Min" min="0" max="100" @input="applyFilters">
                      <span>-</span>
                      <input type="number" v-model.number="columnFilters.scoreMax" placeholder="Max" min="0" max="100" @input="applyFilters">
                    </div>
                  </th>
                  <th>
                    <select v-model="columnFilters.passed" @change="applyFilters" class="filter-select">
                      <option value="">Todos</option>
                      <option value="true">Aprobado</option>
                      <option value="false">Reprobado</option>
                    </select>
                  </th>
                  <th>
                    <select v-model="columnFilters.hasCertificate" @change="applyFilters" class="filter-select">
                      <option value="">Todos</option>
                      <option value="true">Con certificado</option>
                      <option value="false">Sin certificado</option>
                    </select>
                  </th>
                  <th>
                    <div class="filter-range">
                      <input type="number" v-model.number="columnFilters.durationMin" placeholder="Min" min="0" @input="applyFilters">
                      <span>-</span>
                      <input type="number" v-model.number="columnFilters.durationMax" placeholder="Max" min="0" @input="applyFilters">
                    </div>
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="response in filteredResponses" :key="response.id">
                  <td>
                    <div class="respondent-cell">
                      <div class="avatar">{{ getInitials(response.respondent_name) }}</div>
                      <div class="respondent-info">
                        <span class="name">{{ response.respondent_name || 'Anónimo' }}</span>
                        <span class="email">{{ response.respondent_email || '-' }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="date-cell">{{ formatDate(response.submitted_at || response.started_at) }}</td>
                  <td>
                    <span v-if="response.percentage_score !== null" class="score-value">{{ response.percentage_score }}%</span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <span v-if="response.percentage_score !== null" class="result-badge" :class="response.passed ? 'passed' : 'failed'">
                      {{ response.passed ? 'Aprobado' : 'Reprobado' }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <span v-if="response.odoo_certificate_pdf" class="cert-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      Emitido
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>{{ formatDuration(response.duration_minutes) }}</td>
                  <td>
                    <div class="actions-cell">
                      <button @click="viewResponse(response)" class="btn-icon" title="Ver detalle">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      <button @click="confirmDelete(response)" class="btn-icon danger" title="Eliminar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="filteredResponses.length > 0">
                <tr>
                  <td colspan="7" class="table-footer">
                    <span class="results-count">Mostrando {{ filteredResponses.length }} de {{ responses.length }} respuestas</span>
                  </td>
                </tr>
              </tfoot>
            </table>

            <div v-if="filteredResponses.length === 0 && responses.length > 0" class="empty-state">
              <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <h3>Sin resultados</h3>
              <p>No hay respuestas que coincidan con los filtros aplicados</p>
              <button @click="clearAllFilters" class="btn btn-secondary">Limpiar filtros</button>
            </div>

            <div v-else-if="responses.length === 0 && !hasActiveFilters" class="empty-state">
              <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <h3>Sin respuestas</h3>
              <p>Aún no hay respuestas para este examen</p>
            </div>
          </div>
        </div>
      </section>

      <!-- TABLA PARA ENCUESTAS -->
      <section v-else class="table-section">
        <div class="table-card">
          <div class="table-wrapper survey-table-wrapper">
            <table class="data-table survey-table" v-if="responses.length > 0 || hasActiveFilters">
              <thead>
                <tr class="header-row">
                  <th class="sticky-col">#</th>
                  <th>Fecha</th>
                  <th v-for="question in formQuestions" :key="question.id" class="question-header" :title="question.question_text">
                    <div class="question-header-content">
                      <span class="question-num">P{{ question.order_index }}</span>
                      <span class="question-text">{{ truncateText(question.question_text, 25) }}</span>
                    </div>
                  </th>
                  <th class="th-actions">Acciones</th>
                </tr>
                <tr class="filter-row">
                  <th class="sticky-col"></th>
                  <th>
                    <div class="filter-date-wrapper">
                      <input type="date" v-model="columnFilters.dateFrom" @change="applyFilters" title="Desde">
                      <span class="date-separator">-</span>
                      <input type="date" v-model="columnFilters.dateTo" @change="applyFilters" title="Hasta">
                    </div>
                  </th>
                  <th v-for="question in formQuestions" :key="'filter-' + question.id">
                    <input type="text" v-model="questionFilters[question.id]" placeholder="Filtrar..." class="filter-input-small" @input="applyFilters">
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(response, index) in filteredSurveyResponses" :key="response.id">
                  <td class="sticky-col"><span class="row-number">{{ index + 1 }}</span></td>
                  <td class="date-cell">{{ formatDateShort(response.submitted_at || response.started_at) }}</td>
                  <td v-for="question in formQuestions" :key="question.id + '-' + response.id" class="answer-cell">
                    <div class="survey-answer" :title="getAnswerForQuestion(response, question.id)">
                      {{ truncateText(getAnswerForQuestion(response, question.id), 35) }}
                    </div>
                  </td>
                  <td>
                    <div class="actions-cell">
                      <button @click="viewResponse(response)" class="btn-icon" title="Ver detalle">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      <button @click="confirmDelete(response)" class="btn-icon danger" title="Eliminar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="filteredSurveyResponses.length > 0">
                <tr>
                  <td :colspan="formQuestions.length + 3" class="table-footer">
                    <span class="results-count">Mostrando {{ filteredSurveyResponses.length }} de {{ responses.length }} respuestas</span>
                  </td>
                </tr>
              </tfoot>
            </table>

            <div v-if="filteredSurveyResponses.length === 0 && responses.length > 0" class="empty-state">
              <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <h3>Sin resultados</h3>
              <p>No hay respuestas que coincidan con los filtros</p>
              <button @click="clearAllFilters" class="btn btn-secondary">Limpiar filtros</button>
            </div>

            <div v-else-if="responses.length === 0 && !hasActiveFilters" class="empty-state">
              <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <h3>Sin respuestas</h3>
              <p>Aún no hay respuestas para esta encuesta</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="pagination">
        <button @click="goToPage(pagination.page - 1)" :disabled="pagination.page <= 1" class="btn-page">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="page-info">Página {{ pagination.page }} de {{ pagination.pages }}</span>
        <button @click="goToPage(pagination.page + 1)" :disabled="pagination.page >= pagination.pages" class="btn-page">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </template>

    <!-- ==================== MODAL DETALLE ==================== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
          <div class="modal-container" :class="{ 'modal-survey': !isExam }">
            <!-- Header -->
            <div class="modal-header">
              <div class="modal-title-row">
                <div class="respondent-avatar">{{ getInitials(selectedResponse?.respondent_name) }}</div>
                <div class="respondent-meta">
                  <h2>{{ selectedResponse?.respondent_name || 'Anónimo' }}</h2>
                  <span class="respondent-email">{{ selectedResponse?.respondent_email || 'Sin email' }}</span>
                </div>
              </div>
              <button @click="showDetailModal = false" class="btn-close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="modal-body" v-if="selectedResponse">
              <!-- Loading Detail -->
              <div v-if="loadingDetail" class="loading-detail">
                <div class="loader-small"></div>
                <span>Cargando respuestas...</span>
              </div>

              <!-- ========== CONTENIDO EXAMEN ========== -->
              <template v-else-if="isExam">
                <!-- Score Card -->
                <div v-if="selectedResponse.percentage_score !== null" class="score-card" :class="selectedResponse.passed ? 'passed' : 'failed'">
                  <div class="score-main">
                    <span class="score-number">{{ selectedResponse.percentage_score }}</span>
                    <span class="score-percent">%</span>
                  </div>
                  <div class="score-details">
                    <span class="score-label" :class="selectedResponse.passed ? 'passed' : 'failed'">
                      {{ selectedResponse.passed ? 'Aprobado' : 'Reprobado' }}
                    </span>
                    <span class="score-meta">{{ getCorrectCount(selectedResponse.answers) }}/{{ selectedResponse.answers?.length || 0 }} correctas</span>
                  </div>
                  <div class="score-progress">
                    <div class="progress-bar" :style="{ width: selectedResponse.percentage_score + '%' }"></div>
                  </div>
                </div>

                <!-- Info Pills -->
                <div class="info-pills">
                  <div class="pill">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>{{ formatDate(selectedResponse.submitted_at || selectedResponse.started_at) }}</span>
                  </div>
                  <div class="pill" v-if="selectedResponse.duration_minutes">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>{{ formatDuration(selectedResponse.duration_minutes) }}</span>
                  </div>
                  <div class="pill" v-if="selectedResponse.odoo_certificate_pdf">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <span>Certificado emitido</span>
                  </div>
                </div>

                <!-- Filter Tabs -->
                <div v-if="selectedResponse.answers?.length > 0" class="filter-tabs">
                  <button :class="['tab', { active: answerFilter === 'all' }]" @click="answerFilter = 'all'">
                    Todas ({{ selectedResponse.answers?.length || 0 }})
                  </button>
                  <button :class="['tab', { active: answerFilter === 'correct' }]" @click="answerFilter = 'correct'">
                    <span class="dot correct"></span>Correctas ({{ getCorrectCount(selectedResponse.answers) }})
                  </button>
                  <button :class="['tab', { active: answerFilter === 'incorrect' }]" @click="answerFilter = 'incorrect'">
                    <span class="dot incorrect"></span>Incorrectas ({{ getIncorrectCount(selectedResponse.answers) }})
                  </button>
                </div>

                <!-- Answers List para Examen -->
                <div class="answers-section" v-if="selectedResponse.answers?.length > 0">
                  <div class="answers-list">
                    <div v-for="(answer, idx) in filteredAnswers" :key="idx" class="answer-card"
                         :class="{ 'is-correct': answer.is_correct === true, 'is-incorrect': answer.is_correct === false }">
                      <div v-if="answer.is_correct !== null" class="answer-indicator">
                        <svg v-if="answer.is_correct" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </div>
                      <div class="answer-content">
                        <div class="answer-header">
                          <span class="answer-num">{{ getOriginalIndex(answer) }}</span>
                          <p class="answer-question">{{ answer.question_text }}</p>
                        </div>
                        <div class="answer-response">
                          <span class="response-label">Respuesta:</span>
                          <p class="response-text">{{ formatAnswer(answer) }}</p>
                        </div>
                        <div v-if="answer.points_earned !== null" class="answer-points">
                          <span class="points-value">{{ answer.points_earned }}</span>
                          <span class="points-max">/ {{ answer.max_points }} pts</span>
                        </div>
                      </div>
                    </div>
                    <div v-if="filteredAnswers.length === 0 && answerFilter !== 'all'" class="empty-filter">
                      <p>No hay respuestas {{ answerFilter === 'correct' ? 'correctas' : 'incorrectas' }}</p>
                    </div>
                  </div>
                </div>
              </template>

              <!-- ========== CONTENIDO ENCUESTA (NUEVO DISEÑO) ========== -->
              <template v-else>
                <!-- Info Pills para Encuesta -->
                <div class="info-pills survey-info">
                  <div class="pill">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>{{ formatDate(selectedResponse.submitted_at || selectedResponse.started_at) }}</span>
                  </div>
                  <div class="pill highlight">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                    <span>{{ surveyAnswers.length }} preguntas respondidas</span>
                  </div>
                </div>

                <!-- Navegación de Preguntas -->
                <div class="survey-nav-container">
                  <!-- Nav Lateral -->
                  <div class="survey-nav">
                    <div class="nav-header">
                      <span class="nav-title">Preguntas</span>
                      <span class="nav-count">{{ currentQuestionIndex + 1 }}/{{ surveyAnswers.length }}</span>
                    </div>
                    <div class="nav-list">
                      <button 
                        v-for="(answer, idx) in surveyAnswers" 
                        :key="idx"
                        :class="['nav-item', { active: currentQuestionIndex === idx }]"
                        @click="goToQuestion(idx)"
                      >
                        <span class="nav-num">{{ idx + 1 }}</span>
                        <span class="nav-text">{{ truncateText(answer.question_text, 30) }}</span>
                        <span class="nav-status" :class="{ answered: hasAnswer(answer) }">
                          <svg v-if="hasAnswer(answer)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </span>
                      </button>
                    </div>
                  </div>

                  <!-- Contenido de la Pregunta -->
                  <div class="survey-content">
                    <div v-if="surveyAnswers.length > 0" class="question-display">
                      <!-- Pregunta Actual -->
                      <div class="current-question">
                        <div class="question-badge">
                          <span class="q-number">Pregunta {{ currentQuestionIndex + 1 }}</span>
                          <span class="q-type">{{ getQuestionTypeLabel(currentAnswer?.question_type) }}</span>
                        </div>
                        <h3 class="question-text-main">{{ currentAnswer?.question_text }}</h3>
                      </div>

                      <!-- Respuesta -->
                      <div class="answer-display">
                        <div class="answer-label">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                          <span>Respuesta del encuestado</span>
                        </div>
                        <div class="answer-box" :class="{ empty: !hasAnswer(currentAnswer) }">
                          <template v-if="hasAnswer(currentAnswer)">
                            <!-- Rating/Scale Visual -->
                            <div v-if="isRatingType(currentAnswer?.question_type)" class="rating-display">
                              <div class="rating-stars">
                                <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= Number(formatAnswer(currentAnswer)) }">
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                  </svg>
                                </span>
                              </div>
                              <span class="rating-value">{{ formatAnswer(currentAnswer) }} / 5</span>
                            </div>
                            <!-- Scale Visual -->
                            <div v-else-if="isScaleType(currentAnswer?.question_type)" class="scale-display">
                              <div class="scale-bar">
                                <div class="scale-fill" :style="{ width: getScalePercentage(currentAnswer) + '%' }"></div>
                                <div class="scale-marker" :style="{ left: getScalePercentage(currentAnswer) + '%' }">
                                  <span class="marker-value">{{ formatAnswer(currentAnswer) }}</span>
                                </div>
                              </div>
                              <div class="scale-labels">
                                <span>0</span>
                                <span>10</span>
                              </div>
                            </div>
                            <!-- Checkbox/Multiple -->
                            <div v-else-if="isMultipleType(currentAnswer?.question_type)" class="multiple-display">
                              <div v-for="(opt, i) in parseMultipleAnswer(currentAnswer)" :key="i" class="option-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                <span>{{ opt }}</span>
                              </div>
                            </div>
                            <!-- Texto Normal -->
                            <p v-else class="answer-text">{{ formatAnswer(currentAnswer) }}</p>
                          </template>
                          <p v-else class="no-answer">Sin respuesta</p>
                        </div>
                      </div>

                      <!-- Navegación Inferior -->
                      <div class="question-nav">
                        <button 
                          class="nav-btn prev" 
                          :disabled="currentQuestionIndex === 0"
                          @click="prevQuestion"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15 18 9 12 15 6"/>
                          </svg>
                          <span>Anterior</span>
                        </button>
                        <div class="nav-dots">
                          <button 
                            v-for="(_, idx) in surveyAnswers" 
                            :key="idx"
                            :class="['dot', { active: currentQuestionIndex === idx }]"
                            @click="goToQuestion(idx)"
                          ></button>
                        </div>
                        <button 
                          class="nav-btn next" 
                          :disabled="currentQuestionIndex === surveyAnswers.length - 1"
                          @click="nextQuestion"
                        >
                          <span>Siguiente</span>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div v-else class="empty-filter">
                      <p>No hay respuestas registradas</p>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirmation -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal-container modal-sm">
          <div class="modal-header">
            <h2>Confirmar eliminación</h2>
            <button @click="showDeleteModal = false" class="btn-close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de eliminar esta respuesta? Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button @click="showDeleteModal = false" class="btn btn-secondary">Cancelar</button>
            <button @click="deleteResponse" class="btn btn-danger">Eliminar</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import formService from '@/services/form.service'

const route = useRoute()
const router = useRouter()
const formUuid = computed(() => route.params.id)

// State
const form = ref(null)
const responses = ref([])
const formQuestions = ref([])
const stats = ref({ total: 0, completed: 0, avgScore: 0, certified: 0 })
const loading = ref(true)
const error = ref(null)
const showDetailModal = ref(false)
const showDeleteModal = ref(false)
const selectedResponse = ref(null)
const responseToDelete = ref(null)
const answerFilter = ref('all')

// Survey Navigation State
const currentQuestionIndex = ref(0)
const loadingDetail = ref(false)

// Computed
const isExam = computed(() => form.value?.form_type === 'EXAM')

// Survey Answers - todas las respuestas de la encuesta seleccionada
const surveyAnswers = computed(() => {
  if (!selectedResponse.value?.answers) return []
  return selectedResponse.value.answers
})

// Respuesta actual en el navegador
const currentAnswer = computed(() => {
  return surveyAnswers.value[currentQuestionIndex.value] || null
})

// Column Filters
const columnFilters = ref({
  respondent: '',
  status: '',
  dateFrom: '',
  dateTo: '',
  scoreMin: null,
  scoreMax: null,
  passed: '',
  hasCertificate: '',
  durationMin: null,
  durationMax: null
})

const questionFilters = reactive({})
const pagination = ref({ page: 1, limit: 50, total: 0, pages: 0 })

const hasActiveFilters = computed(() => {
  const baseFilters = columnFilters.value.respondent !== '' ||
         columnFilters.value.dateFrom !== '' ||
         columnFilters.value.dateTo !== '' ||
         columnFilters.value.scoreMin !== null ||
         columnFilters.value.scoreMax !== null ||
         columnFilters.value.passed !== '' ||
         columnFilters.value.hasCertificate !== '' ||
         columnFilters.value.durationMin !== null ||
         columnFilters.value.durationMax !== null
  const questionFilterActive = Object.values(questionFilters).some(v => v && v !== '')
  return baseFilters || questionFilterActive
})

// Filtered Responses for EXAM
const filteredResponses = computed(() => {
  let result = [...responses.value]
  const f = columnFilters.value

  if (f.respondent) {
    const search = f.respondent.toLowerCase()
    result = result.filter(r => 
      (r.respondent_name?.toLowerCase().includes(search)) ||
      (r.respondent_email?.toLowerCase().includes(search))
    )
  }
  if (f.dateFrom) {
    const from = new Date(f.dateFrom)
    result = result.filter(r => new Date(r.submitted_at || r.started_at) >= from)
  }
  if (f.dateTo) {
    const to = new Date(f.dateTo)
    to.setHours(23, 59, 59, 999)
    result = result.filter(r => new Date(r.submitted_at || r.started_at) <= to)
  }
  if (f.scoreMin !== null && f.scoreMin !== '') {
    result = result.filter(r => r.percentage_score !== null && r.percentage_score >= f.scoreMin)
  }
  if (f.scoreMax !== null && f.scoreMax !== '') {
    result = result.filter(r => r.percentage_score !== null && r.percentage_score <= f.scoreMax)
  }
  if (f.passed !== '') {
    const isPassed = f.passed === 'true'
    result = result.filter(r => r.passed === isPassed)
  }
  if (f.hasCertificate !== '') {
    const hasCert = f.hasCertificate === 'true'
    result = result.filter(r => hasCert ? !!r.odoo_certificate_pdf : !r.odoo_certificate_pdf)
  }
  if (f.durationMin !== null && f.durationMin !== '') {
    result = result.filter(r => r.duration_minutes !== null && r.duration_minutes >= f.durationMin)
  }
  if (f.durationMax !== null && f.durationMax !== '') {
    result = result.filter(r => r.duration_minutes !== null && r.duration_minutes <= f.durationMax)
  }
  return result
})

// Filtered Responses for SURVEY
const filteredSurveyResponses = computed(() => {
  let result = [...responses.value]
  const f = columnFilters.value

  if (f.dateFrom) {
    const from = new Date(f.dateFrom)
    result = result.filter(r => new Date(r.submitted_at || r.started_at) >= from)
  }
  if (f.dateTo) {
    const to = new Date(f.dateTo)
    to.setHours(23, 59, 59, 999)
    result = result.filter(r => new Date(r.submitted_at || r.started_at) <= to)
  }
  for (const [questionId, filterValue] of Object.entries(questionFilters)) {
    if (filterValue && filterValue !== '') {
      const search = filterValue.toLowerCase()
      result = result.filter(r => {
        const answerText = getAnswerForQuestion(r, questionId)
        return answerText.toLowerCase().includes(search)
      })
    }
  }
  return result
})

const filteredAnswers = computed(() => {
  if (!selectedResponse.value?.answers) return []
  if (answerFilter.value === 'all') return selectedResponse.value.answers
  if (answerFilter.value === 'correct') return selectedResponse.value.answers.filter(a => a.is_correct === true)
  return selectedResponse.value.answers.filter(a => a.is_correct === false)
})

// Watch para resetear navegación cuando cambia la respuesta seleccionada
watch(selectedResponse, () => {
  currentQuestionIndex.value = 0
})

// Survey Navigation Methods
function goToQuestion(idx) {
  currentQuestionIndex.value = idx
}

function nextQuestion() {
  if (currentQuestionIndex.value < surveyAnswers.value.length - 1) {
    currentQuestionIndex.value++
  }
}

function prevQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

function hasAnswer(answer) {
  if (!answer) return false
  return answer.answer_text || 
         answer.answer_number !== null && answer.answer_number !== undefined ||
         answer.answer_date ||
         (answer.selected_options && answer.selected_options.length > 0)
}

function getQuestionTypeLabel(type) {
  const labels = {
    'TEXT': 'Texto',
    'TEXTAREA': 'Texto largo',
    'RADIO': 'Opción única',
    'CHECKBOX': 'Opción múltiple',
    'SELECT': 'Selección',
    'RATING': 'Calificación',
    'SCALE': 'Escala',
    'DATE': 'Fecha',
    'NUMBER': 'Número',
    'EMAIL': 'Email'
  }
  return labels[type] || type || 'Texto'
}

function isRatingType(type) {
  return type === 'RATING'
}

function isScaleType(type) {
  return type === 'SCALE'
}

function isMultipleType(type) {
  return type === 'CHECKBOX'
}

function parseMultipleAnswer(answer) {
  if (!answer) return []
  if (answer.selected_options && Array.isArray(answer.selected_options)) {
    return answer.selected_options
  }
  if (answer.answer_text && answer.answer_text.includes(',')) {
    return answer.answer_text.split(',').map(s => s.trim())
  }
  return [formatAnswer(answer)]
}

function getScalePercentage(answer) {
  const value = Number(formatAnswer(answer))
  return Math.min(100, Math.max(0, value * 10))
}

// Methods
function verGraficos() {
  router.push(`/admin/forms/${formUuid.value}/reports`)
}

function clearAllFilters() {
  columnFilters.value = {
    respondent: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    scoreMin: null,
    scoreMax: null,
    passed: '',
    hasCertificate: '',
    durationMin: null,
    durationMax: null
  }
  for (const key in questionFilters) {
    questionFilters[key] = ''
  }
}

function applyFilters() {}

function getAnswerForQuestion(response, questionId) {
  if (!response.answers) return '-'
  const answer = response.answers.find(a => 
    a.question_id === questionId || 
    a.question_uuid === questionId ||
    a.questionId === questionId ||
    a.questionUuid === questionId
  )
  if (!answer && questionId.startsWith('q-')) {
    const idx = parseInt(questionId.split('-')[1])
    if (!isNaN(idx) && response.answers[idx]) {
      return formatAnswer(response.answers[idx])
    }
  }
  if (!answer) return '-'
  return formatAnswer(answer)
}

function truncateText(text, maxLength) {
  if (!text || text === '-') return text
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

function exportToCSV() {
  if (responses.value.length === 0) return
  let headers, rows
  if (isExam.value) {
    headers = ['Respondiente', 'Email', 'Fecha', 'Puntuación', 'Resultado', 'Certificado', 'Tiempo (min)']
    rows = filteredResponses.value.map(r => [
      r.respondent_name || 'Anónimo',
      r.respondent_email || '',
      formatDate(r.submitted_at || r.started_at),
      r.percentage_score !== null ? `${r.percentage_score}%` : '',
      r.passed ? 'Aprobado' : 'Reprobado',
      r.odoo_certificate_pdf ? 'Sí' : 'No',
      r.duration_minutes || ''
    ])
  } else {
    headers = ['#', 'Fecha', ...formQuestions.value.map(q => q.question_text)]
    rows = filteredSurveyResponses.value.map((r, idx) => [
      idx + 1,
      formatDate(r.submitted_at || r.started_at),
      ...formQuestions.value.map(q => getAnswerForQuestion(r, q.id))
    ])
  }
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `respuestas_${form.value?.title || 'formulario'}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

function getCorrectCount(answers) {
  if (!answers) return 0
  return answers.filter(a => a.is_correct === true).length
}

function getIncorrectCount(answers) {
  if (!answers) return 0
  return answers.filter(a => a.is_correct === false).length
}

function getOriginalIndex(answer) {
  if (!selectedResponse.value?.answers) return 0
  return selectedResponse.value.answers.indexOf(answer) + 1
}

async function viewResponse(response) {
  answerFilter.value = 'all'
  currentQuestionIndex.value = 0
  selectedResponse.value = { ...response, answers: [] }
  showDetailModal.value = true
  
  // Cargar detalles (answers) de la respuesta
  loadingDetail.value = true
  try {
    const detail = await formService.getResponseDetail(formUuid.value, response.id)
    if (detail.ok && detail.data) {
      selectedResponse.value = {
        ...selectedResponse.value,
        ...detail.data
      }
    }
  } catch (err) {
    console.error('Error loading response detail:', err)
  } finally {
    loadingDetail.value = false
  }
}

async function loadForm() {
  try {
    const response = await formService.get(formUuid.value)
    form.value = response.data?.form || response.data || response
    if (form.value?.form_type !== 'EXAM') {
      extractQuestions()
    }
  } catch (err) {
    console.error('Error loading form:', err)
    error.value = 'No se pudo cargar el formulario'
  }
}

function extractQuestions() {
  const questions = []
  if (form.value?.sections) {
    form.value.sections.forEach(section => {
      if (section.questions) {
        section.questions.forEach(q => {
          questions.push({
            id: q.uuid || q.id,
            question_text: q.question_text,
            question_type: q.question_type,
            order_index: questions.length + 1
          })
          questionFilters[q.uuid || q.id] = ''
        })
      }
    })
  }
  if (questions.length === 0 && form.value?.questions) {
    form.value.questions.forEach(q => {
      questions.push({
        id: q.uuid || q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        order_index: questions.length + 1
      })
      questionFilters[q.uuid || q.id] = ''
    })
  }
  if (questions.length === 0 && responses.value.length > 0) {
    const firstResponse = responses.value[0]
    if (firstResponse.answers) {
      firstResponse.answers.forEach((a, idx) => {
        const qId = a.question_uuid || a.question_id || `q-${idx}`
        questions.push({
          id: qId,
          question_text: a.question_text || `Pregunta ${idx + 1}`,
          question_type: a.question_type || 'TEXT',
          order_index: idx + 1
        })
        questionFilters[qId] = ''
      })
    }
  }
  formQuestions.value = questions
}

async function loadStats() {
  try {
    const response = await formService.getStats(formUuid.value)
    stats.value = response.data || response || {}
  } catch (err) {
    console.error('Error loading stats:', err)
  }
}

async function loadResponses() {
  try {
    const params = { page: pagination.value.page, limit: pagination.value.limit }
    const response = await formService.getResponses(formUuid.value, params)
    responses.value = response.data?.responses || response.responses || []
    if (response.data?.pagination) {
      pagination.value = { ...pagination.value, ...response.data.pagination }
    }
  } catch (err) {
    console.error('Error loading responses:', err)
    responses.value = []
  }
}

async function loadData() {
  loading.value = true
  error.value = null
  try {
    await loadForm()
    await Promise.all([loadStats(), loadResponses()])
    if (!isExam.value && formQuestions.value.length === 0 && responses.value.length > 0) {
      extractQuestions()
    }
  } finally {
    loading.value = false
  }
}

function goToPage(page) {
  if (page < 1 || page > pagination.value.pages) return
  pagination.value.page = page
  loadResponses()
}

function confirmDelete(response) {
  responseToDelete.value = response
  showDeleteModal.value = true
}

async function deleteResponse() {
  if (!responseToDelete.value) return
  try {
    responses.value = responses.value.filter(r => r.id !== responseToDelete.value.id)
    showDeleteModal.value = false
    responseToDelete.value = null
  } catch (err) {
    console.error('Error:', err)
  }
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function formatDateShort(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('es-PE', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}

function formatDuration(minutes) {
  if (!minutes) return '-'
  if (minutes < 60) return `${minutes} min`
  return `${Math.floor(minutes / 60)}h ${minutes % 60}min`
}

function formatAnswer(answer) {
  if (answer.answer_text) return answer.answer_text
  if (answer.answer_number !== null && answer.answer_number !== undefined) return String(answer.answer_number)
  if (answer.answer_date) return formatDate(answer.answer_date)
  if (answer.selected_options && answer.selected_options.length > 0) return answer.selected_options.join(', ')
  return '-'
}

onMounted(() => loadData())
</script>

<style scoped>
/* Variables */
.responses-page {
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
  --purple: #8b5cf6;
  
  padding: 24px;
  max-width: 1800px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--gray-light);
}

.modal-container {
  background: var(--white);
  border-radius: 16px;
  width: 100%;
  max-width: 640px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 15, 90, 0.25);
  overflow: hidden;
  /* Refuerzo de fondo */
  background-color: #FFFFFF;
}

/* State Container */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  background: var(--white);
  border-radius: var(--radius);
  padding: 40px;
}
.loader {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--celeste);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Header */
.page-header {
  background: var(--white);
  border-radius: var(--radius);
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.header-top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-light);
  border-radius: 10px;
  color: var(--text-light);
  transition: all 0.2s;
  text-decoration: none;
}
.back-btn:hover { background: var(--gray); color: var(--text); }
.badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.badge.exam { background: #fef3c7; color: #d97706; }
.badge.survey { background: #dbeafe; color: #1d4ed8; }
.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}
.header-info h1 { margin: 0 0 4px; font-size: 24px; font-weight: 700; color: var(--blue); }
.form-title { margin: 0; font-size: 14px; color: var(--text-light); }
.header-actions { display: flex; gap: 12px; flex-wrap: wrap; }

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
}
.btn-primary { background: var(--blue); color: var(--white); }
.btn-primary:hover { background: #001a7a; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary { background: var(--white); color: var(--text); border: 1px solid var(--border); }
.btn-secondary:hover { background: var(--gray-light); }
.btn-danger { background: var(--danger); color: var(--white); }

/* Stats */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}
.stat-card {
  background: var(--white);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-icon.blue { background: #dbeafe; color: #2563eb; }
.stat-icon.green { background: #d1fae5; color: #059669; }
.stat-icon.orange { background: #fef3c7; color: #d97706; }
.stat-icon.teal { background: #ccfbf1; color: #0d9488; }
.stat-icon.purple { background: #ede9fe; color: #7c3aed; }
.stat-content { display: flex; flex-direction: column; }
.stat-value { font-size: 28px; font-weight: 700; color: var(--blue); }
.stat-value small { font-size: 18px; }
.stat-label { font-size: 13px; color: var(--text-muted); }

/* Table */
.table-section { margin-bottom: 20px; }
.table-card {
  background: var(--white);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; min-width: 900px; }
.survey-table-wrapper { overflow-x: auto; }
.survey-table { min-width: auto; }

.data-table .header-row th {
  text-align: left;
  padding: 14px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--white);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: var(--blue);
  border: none;
  white-space: nowrap;
}
.question-header { min-width: 150px; max-width: 200px; }
.question-header-content { display: flex; flex-direction: column; gap: 2px; }
.question-num { font-size: 10px; opacity: 0.7; font-weight: 700; }
.question-text { font-size: 11px; font-weight: 500; text-transform: none; letter-spacing: normal; white-space: normal; line-height: 1.3; }

.sticky-col { position: sticky; left: 0; z-index: 10; background: inherit; }
.header-row .sticky-col { background: var(--blue); }
.filter-row .sticky-col { background: var(--gray-light); }
tbody tr .sticky-col { background: var(--white); }
tbody tr:hover .sticky-col { background: var(--gray-light); }

.filter-row th { padding: 10px 8px; background: var(--gray-light); border-bottom: 2px solid var(--border); }
.filter-input-wrapper { display: flex; align-items: center; gap: 6px; background: var(--white); border: 1px solid var(--border); border-radius: 6px; padding: 0 8px; }
.filter-input-wrapper svg { color: var(--text-muted); flex-shrink: 0; }
.filter-input-wrapper input { border: none; background: none; padding: 8px 0; font-size: 12px; width: 100%; outline: none; }
.filter-input-small { width: 100%; padding: 6px 8px; border: 1px solid var(--border); border-radius: 6px; font-size: 11px; background: var(--white); }
.filter-select { width: 100%; padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 12px; background: var(--white); cursor: pointer; }
.filter-date-wrapper { display: flex; align-items: center; gap: 4px; }
.filter-date-wrapper input[type="date"] { flex: 1; padding: 6px 8px; border: 1px solid var(--border); border-radius: 6px; font-size: 11px; min-width: 0; }
.date-separator { color: var(--text-muted); font-size: 12px; }
.filter-range { display: flex; align-items: center; gap: 4px; }
.filter-range input { width: 50px; padding: 6px 8px; border: 1px solid var(--border); border-radius: 6px; font-size: 12px; text-align: center; }
.filter-range span { color: var(--text-muted); }

.data-table tbody td { padding: 12px; border-bottom: 1px solid var(--border); font-size: 13px; color: var(--text); }
.data-table tbody tr:hover td { background: var(--gray-light); }

.respondent-cell { display: flex; align-items: center; gap: 10px; }
.avatar { width: 34px; height: 34px; border-radius: 8px; background: var(--celeste); color: var(--white); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
.respondent-info { display: flex; flex-direction: column; min-width: 0; }
.respondent-info .name { font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.respondent-info .email { font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.score-value { font-weight: 700; font-size: 14px; color: var(--blue); }
.result-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; }
.result-badge.passed { background: #d1fae5; color: #059669; }
.result-badge.failed { background: #fee2e2; color: #dc2626; }
.cert-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: #ccfbf1; color: #0d9488; border-radius: 6px; font-size: 11px; font-weight: 600; }
.text-muted { color: var(--text-muted); }
.date-cell { white-space: nowrap; font-size: 12px; }
.row-number { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: var(--gray); border-radius: 6px; font-size: 12px; font-weight: 600; color: var(--text-light); }
.answer-cell { max-width: 200px; }
.survey-answer { font-size: 12px; color: var(--text); line-height: 1.4; word-break: break-word; }

.actions-cell { display: flex; justify-content: flex-end; gap: 6px; }
.btn-icon { width: 32px; height: 32px; border: none; background: var(--gray-light); border-radius: 6px; color: var(--text-light); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.btn-icon:hover { background: var(--gray); color: var(--text); }
.btn-icon.danger:hover { background: #fee2e2; color: var(--danger); }
.th-actions { text-align: right; width: 80px; }

.table-footer { padding: 12px 16px !important; background: var(--gray-light); border-top: 2px solid var(--border); }
.results-count { font-size: 13px; color: var(--text-light); font-weight: 500; }

.empty-state { padding: 60px 20px; text-align: center; }
.empty-icon { color: var(--text-muted); margin-bottom: 16px; }
.empty-state h3 { margin: 0 0 8px; font-size: 18px; color: var(--text); }
.empty-state p { margin: 0 0 20px; color: var(--text-muted); }

.pagination { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 16px; background: var(--white); border-radius: var(--radius); margin-top: 16px; }
.btn-page { width: 36px; height: 36px; border: 1px solid var(--border); background: var(--white); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--text-light); cursor: pointer; transition: all 0.2s; }
.btn-page:hover:not(:disabled) { background: var(--gray-light); color: var(--text); }
.btn-page:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 14px; color: var(--text-muted); }

/* Modal */
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 15, 90, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 1000; }
.modal-container { background: var(--white); border-radius: 16px; width: 100%; max-width: 640px; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0, 15, 90, 0.25); overflow: hidden; }
.modal-container.modal-sm { max-width: 420px; }
.modal-container.modal-survey { max-width: 900px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.modal-header h2 { margin: 0; font-size: 18px; font-weight: 600; }
.modal-title-row { display: flex; align-items: center; gap: 14px; }
.respondent-avatar { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, var(--blue), var(--celeste)); color: var(--white); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; }
.respondent-meta { display: flex; flex-direction: column; }
.respondent-meta h2 { margin: 0; font-size: 16px; font-weight: 600; }
.respondent-email { font-size: 13px; color: var(--text-muted); }
.btn-close { width: 36px; height: 36px; border: none; background: transparent; border-radius: 10px; color: var(--text-muted); cursor: pointer; }
.btn-close:hover { background: var(--gray-light); color: var(--text); }
.modal-body { padding: 24px; overflow-y: auto; flex: 1; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid var(--border); }

/* Score Card */
.score-card { background: var(--gray-light); border-radius: 14px; padding: 20px 24px; display: flex; align-items: center; gap: 20px; position: relative; margin-bottom: 20px; }
.score-card.passed { background: linear-gradient(135deg, #ecfdf5, #d1fae5); }
.score-card.failed { background: linear-gradient(135deg, #fef2f2, #fee2e2); }
.score-main { display: flex; align-items: baseline; }
.score-number { font-size: 48px; font-weight: 800; color: var(--blue); }
.score-card.passed .score-number { color: #059669; }
.score-card.failed .score-number { color: #dc2626; }
.score-percent { font-size: 24px; font-weight: 700; color: var(--text-muted); }
.score-details { display: flex; flex-direction: column; gap: 4px; }
.score-label { font-size: 14px; font-weight: 700; padding: 4px 12px; border-radius: 6px; width: fit-content; }
.score-label.passed { background: rgba(5, 150, 105, 0.15); color: #059669; }
.score-label.failed { background: rgba(220, 38, 38, 0.15); color: #dc2626; }
.score-meta { font-size: 13px; color: var(--text-light); }
.score-progress { position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: rgba(0,0,0,0.08); border-radius: 0 0 14px 14px; overflow: hidden; }
.score-progress .progress-bar { height: 100%; background: var(--celeste); }
.score-card.passed .progress-bar { background: #10b981; }
.score-card.failed .progress-bar { background: #ef4444; }

/* Info Pills */
.info-pills { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
.info-pills.survey-info { margin-bottom: 24px; }
.pill { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: var(--gray-light); border-radius: 8px; font-size: 13px; color: var(--text-light); }
.pill.highlight { background: #dbeafe; color: #1d4ed8; }

/* Filter Tabs */
.filter-tabs { display: flex; gap: 8px; padding: 4px; background: var(--gray-light); border-radius: 10px; margin-bottom: 20px; }
.tab { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; border: none; background: transparent; border-radius: 8px; font-size: 13px; font-weight: 500; color: var(--text-light); cursor: pointer; }
.tab.active { background: var(--white); color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.correct { background: #10b981; }
.dot.incorrect { background: #ef4444; }

/* Exam Answers */
.answers-list { display: flex; flex-direction: column; gap: 12px; }
.answer-card { display: flex; gap: 14px; padding: 16px; background: var(--white); border: 1px solid var(--border); border-radius: 12px; }
.answer-card.is-correct { border-color: #a7f3d0; background: linear-gradient(135deg, #fff, #ecfdf5); }
.answer-card.is-incorrect { border-color: #fecaca; background: linear-gradient(135deg, #fff, #fef2f2); }
.answer-indicator { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.answer-card.is-correct .answer-indicator { background: #d1fae5; color: #059669; }
.answer-card.is-incorrect .answer-indicator { background: #fee2e2; color: #dc2626; }
.answer-content { flex: 1; min-width: 0; }
.answer-header { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
.answer-num { width: 22px; height: 22px; background: var(--gray); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--text-light); flex-shrink: 0; }
.answer-question { margin: 0; font-size: 14px; font-weight: 600; color: var(--text); }
.response-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 4px; }
.response-text { margin: 0; font-size: 14px; color: var(--text-light); word-break: break-word; }
.answer-points { display: flex; align-items: baseline; gap: 2px; margin-top: 10px; }
.points-value { font-size: 16px; font-weight: 700; color: var(--blue); }
.answer-card.is-correct .points-value { color: #059669; }
.answer-card.is-incorrect .points-value { color: #dc2626; }
.points-max { font-size: 13px; color: var(--text-muted); }

.empty-filter { text-align: center; padding: 40px 20px; color: var(--text-muted); }

/* Loading Detail */
.loading-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  color: var(--text-muted);
}
.loader-small {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--celeste);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ==================== SURVEY NAV STYLES ==================== */
.survey-nav-container {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 24px;
  min-height: 400px;
}

/* Nav Lateral */
.survey-nav {
  background: var(--gray-light);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}
.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 12px;
}
.nav-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

.modal-container {
  background: var(--white);
  border-radius: 16px;
  width: 100%;
  max-width: 640px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 15, 90, 0.25);
  overflow: hidden;
  /* Refuerzo de fondo */
  background-color: #FFFFFF;
}
.nav-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--celeste);
  background: #dbeafe;
  padding: 2px 8px;
  border-radius: 10px;
}
.nav-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  max-height: 350px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}
.nav-item:hover {
  background: var(--white);
}
.nav-item.active {
  background: var(--white);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.nav-num {
  width: 24px;
  height: 24px;
  background: var(--gray);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  flex-shrink: 0;
}
.nav-item.active .nav-num {
  background: var(--celeste);
  color: var(--white);
}
.nav-text {
  flex: 1;
  font-size: 12px;
  color: var(--text-light);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nav-item.active .nav-text {
  color: var(--text);
  font-weight: 500;
}
.nav-status {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--gray);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.nav-status.answered {
  background: #d1fae5;
  color: #059669;
}

/* Survey Content */
.survey-content {
  display: flex;
  flex-direction: column;
}
.question-display {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Current Question */
.current-question {
  margin-bottom: 24px;
}
.question-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.q-number {
  font-size: 12px;
  font-weight: 700;
  color: var(--celeste);
  background: #dbeafe;
  padding: 4px 12px;
  border-radius: 6px;
}
.q-type {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--gray);
  padding: 4px 10px;
  border-radius: 6px;
}
.question-text-main {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.5;
}

/* Answer Display */
.answer-display {
  flex: 1;
  margin-bottom: 24px;
}
.answer-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 12px;
}
.answer-box {
  background: var(--gray-light);
  border-radius: 12px;
  padding: 20px;
  min-height: 100px;
}
.answer-box.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fef3c7;
}
.answer-text {
  margin: 0;
  font-size: 16px;
  color: var(--text);
  line-height: 1.6;
}
.no-answer {
  margin: 0;
  font-size: 14px;
  color: #d97706;
  font-style: italic;
}

/* Rating Display */
.rating-display {
  display: flex;
  align-items: center;
  gap: 16px;
}
.rating-stars {
  display: flex;
  gap: 4px;
}
.star {
  color: var(--gray);
  transition: color 0.2s;
}
.star.filled {
  color: #f59e0b;
}
.rating-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

/* Scale Display */
.scale-display {
  width: 100%;
}
.scale-bar {
  position: relative;
  height: 12px;
  background: var(--gray);
  border-radius: 6px;
  margin-bottom: 8px;
}
.scale-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--celeste), var(--blue));
  border-radius: 6px;
  transition: width 0.3s;
}
.scale-marker {
  position: absolute;
  top: -8px;
  transform: translateX(-50%);
}
.marker-value {
  display: inline-block;
  background: var(--blue);
  color: var(--white);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
}
.scale-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-muted);
}

/* Multiple Display */
.multiple-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--white);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text);
}
.option-item svg {
  color: var(--success);
  flex-shrink: 0;
}

/* Question Nav */
.question-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}
.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s;
}
.nav-btn:hover:not(:disabled) {
  background: var(--gray-light);
  border-color: var(--celeste);
  color: var(--celeste);
}
.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.nav-dots {
  display: flex;
  gap: 6px;
}
.nav-dots .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--gray);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}
.nav-dots .dot.active {
  background: var(--celeste);
  transform: scale(1.3);
}
.nav-dots .dot:hover:not(.active) {
  background: var(--text-muted);
}

/* Responsive */
@media (max-width: 768px) {
  .responses-page { padding: 16px; }
  .header-main { flex-direction: column; }
  .header-actions { width: 100%; }
  .stats-section { grid-template-columns: repeat(2, 1fr); }
  .filter-date-wrapper { flex-direction: column; }
  .date-separator { display: none; }
  
  .survey-nav-container {
    grid-template-columns: 1fr;
  }
  .survey-nav {
    max-height: 200px;
  }
  .nav-list {
    flex-direction: row;
    overflow-x: auto;
    max-height: none;
    gap: 8px;
  }
  .nav-item {
    flex-shrink: 0;
    min-width: 150px;
  }
}
</style>