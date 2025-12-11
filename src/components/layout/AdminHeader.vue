<template>
  <header class="admin-header">
    <!-- Left Section -->
    <div class="header-left">
      <button class="icon-btn mobile-only" @click="$emit('toggleMobile')" title="Menú">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <div class="search-wrapper" :class="{ 'is-focused': searchFocused }">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input type="text" placeholder="Buscar formularios..." v-model="searchQuery"
          @focus="searchFocused = true" @blur="searchFocused = false" @keyup.enter="handleSearch"/>
        <kbd class="shortcut">⌘K</kbd>
      </div>
    </div>

    <!-- Right Section -->
    <div class="header-right">
      <!-- Notifications -->
      <div class="dropdown" ref="notifDropdown">
        <button class="icon-btn" :class="{ 'has-indicator': unreadCount > 0 }"
          @click="toggleNotifications" title="Notificaciones">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span v-if="unreadCount > 0" class="indicator">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
        </button>

        <transition name="dropdown-fade">
          <div v-if="showNotifications" class="dropdown-panel notifications-panel">
            <div class="panel-header">
              <h3>Notificaciones</h3>
              <button v-if="unreadCount > 0" class="text-btn" @click="markAllRead" :disabled="markingAll">
                {{ markingAll ? 'Marcando...' : 'Marcar leídas' }}
              </button>
            </div>

            <div class="panel-body">
              <!-- Loading -->
              <div v-if="loadingNotifications" class="empty-state">
                <div class="spinner"></div>
                <p>Cargando...</p>
              </div>

              <!-- Empty -->
              <div v-else-if="notifications.length === 0" class="empty-state">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <p>Sin notificaciones</p>
              </div>

              <!-- Notifications List -->
              <div v-else v-for="notif in notifications" :key="notif.id" 
                class="notif-item" :class="{ 'is-unread': !notif.is_read }"
                @click="handleNotificationClick(notif)">
                <div class="notif-indicator" :class="notif.icon"></div>
                <div class="notif-body">
                  <p class="notif-title">{{ notif.title }}</p>
                  <p class="notif-message">{{ notif.message }}</p>
                  <span class="notif-time">{{ formatTime(notif.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- User Menu -->
      <div class="dropdown" ref="userDropdown">
        <button class="user-trigger" @click="toggleUserMenu">
          <div class="user-avatar">{{ userInitials }}</div>
          <span class="user-name desktop-only">{{ userName }}</span>
          <svg class="chevron desktop-only" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <transition name="dropdown-fade">
          <div v-if="showUserMenu" class="dropdown-panel user-panel">
            <div class="panel-user-info">
              <div class="user-avatar large">{{ userInitials }}</div>
              <div class="user-details">
                <p class="user-fullname">{{ userName }}</p>
                <p class="user-role">{{ userRoleLabel }}</p>
              </div>
            </div>
            <div class="panel-divider"></div>
            <div class="panel-menu">
              <router-link to="/admin/profile" class="menu-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Mi Perfil</span>
              </router-link>
              <router-link to="/admin/settings" class="menu-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
                </svg>
                <span>Configuración</span>
              </router-link>
            </div>
            <div class="panel-divider"></div>
            <div class="panel-menu">
              <button class="menu-item danger" @click="handleLogout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import notificationService from '@/services/notification.service'

defineEmits(['toggleMobile'])

const router = useRouter()
const authStore = useAuthStore()

const searchQuery = ref('')
const searchFocused = ref(false)
const showNotifications = ref(false)
const showUserMenu = ref(false)
const notifDropdown = ref(null)
const userDropdown = ref(null)

// Notifications state
const notifications = ref([])
const unreadCount = ref(0)
const loadingNotifications = ref(false)
const markingAll = ref(false)
let pollInterval = null

const userName = computed(() => authStore.fullName)
const userInitials = computed(() => authStore.initials)
const userRoleLabel = computed(() => {
  const roles = { 'SUPER_ADMIN': 'Super Administrador', 'ADMIN': 'Administrador', 'INSTRUCTOR': 'Instructor', 'USER': 'Usuario' }
  return roles[authStore.user?.role?.code] || authStore.user?.role?.name || 'Usuario'
})

// ═══════════════════════════════════════
// NOTIFICATIONS FUNCTIONS
// ═══════════════════════════════════════
async function loadNotifications() {
  loadingNotifications.value = true
  try {
    const result = await notificationService.list({ limit: 20 })
    if (result.ok) {
      notifications.value = result.data.notifications
    }
  } catch (err) {
    console.error('Error loading notifications:', err)
  } finally {
    loadingNotifications.value = false
  }
}

async function loadUnreadCount() {
  try {
    const result = await notificationService.getUnreadCount()
    if (result.ok) {
      unreadCount.value = result.data.count
    }
  } catch (err) {
    console.error('Error loading unread count:', err)
  }
}

async function markAllRead() {
  markingAll.value = true
  try {
    const result = await notificationService.markAllAsRead()
    if (result.ok) {
      notifications.value.forEach(n => n.is_read = true)
      unreadCount.value = 0
    }
  } catch (err) {
    console.error('Error marking all read:', err)
  } finally {
    markingAll.value = false
  }
}

async function handleNotificationClick(notif) {
  // Marcar como leída
  if (!notif.is_read) {
    try {
      await notificationService.markAsRead(notif.id)
      notif.is_read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  // Cerrar panel
  showNotifications.value = false

  // Navegar al link si existe
  if (notif.link) {
    router.push(notif.link)
  }
}

function formatTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return 'Ahora'
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`
  if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} días`
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
}

// ═══════════════════════════════════════
// UI FUNCTIONS
// ═══════════════════════════════════════
function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
  if (showNotifications.value) {
    loadNotifications()
  }
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/admin/search', query: { q: searchQuery.value } })
  }
}

async function handleLogout() {
  authStore.clearAuth()
  router.push('/admin/login')
}

function handleClickOutside(e) {
  if (notifDropdown.value && !notifDropdown.value.contains(e.target)) {
    showNotifications.value = false
  }
  if (userDropdown.value && !userDropdown.value.contains(e.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  loadUnreadCount()
  // Polling cada 30 segundos
  pollInterval = setInterval(loadUnreadCount, 30000)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (pollInterval) clearInterval(pollInterval)
})
</script>

<style scoped>
.admin-header {
  position: sticky; top: 0; z-index: 100; height: 56px;
  background: #ffffff; border-bottom: 1px solid #f0f0f0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px; gap: 20px;
}
.header-left, .header-right { display: flex; align-items: center; gap: 8px; }

.search-wrapper {
  display: flex; align-items: center; gap: 8px; padding: 0 12px;
  height: 36px; min-width: 280px; background: #fafafa;
  border: 1px solid transparent; border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.search-wrapper svg { color: #9ca3af; flex-shrink: 0; transition: color 0.2s; }
.search-wrapper input {
  flex: 1; border: none; background: transparent; outline: none;
  font-size: 14px; color: #1f2937; font-family: inherit;
}
.search-wrapper input::placeholder { color: #9ca3af; }
.search-wrapper .shortcut {
  display: flex; align-items: center; justify-content: center;
  padding: 2px 6px; background: #e5e7eb; border-radius: 4px;
  font-size: 11px; font-weight: 500; color: #6b7280;
}
.search-wrapper.is-focused {
  background: #ffffff; border-color: #001845;
  box-shadow: 0 0 0 3px rgba(0, 24, 69, 0.08);
}
.search-wrapper.is-focused svg { color: #001845; }
.search-wrapper.is-focused .shortcut { opacity: 0; }

.icon-btn {
  position: relative; display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; background: transparent; border: none;
  border-radius: 8px; cursor: pointer; color: #6b7280; transition: all 0.15s ease;
}
.icon-btn:hover { background: #f9fafb; color: #1f2937; }
.icon-btn:active { transform: scale(0.96); }
.icon-btn.has-indicator .indicator {
  position: absolute; top: 4px; right: 4px; min-width: 18px; height: 18px;
  padding: 0 5px; display: flex; align-items: center; justify-content: center;
  background: #dc2626; color: #ffffff; font-size: 10px; font-weight: 600;
  border-radius: 999px; border: 2px solid #ffffff;
}

.user-trigger {
  display: flex; align-items: center; gap: 8px; padding: 4px 8px 4px 4px;
  background: transparent; border: none; border-radius: 8px;
  cursor: pointer; transition: background 0.15s ease;
}
.user-trigger:hover { background: #f9fafb; }
.user-avatar {
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #001845 0%, #003d82 100%);
  color: #ffffff; font-size: 13px; font-weight: 600; border-radius: 8px;
}
.user-avatar.large { width: 48px; height: 48px; font-size: 16px; border-radius: 12px; }
.user-name { font-size: 13px; font-weight: 500; color: #1f2937; }
.chevron { color: #9ca3af; transition: transform 0.2s ease; }

.dropdown { position: relative; }
.dropdown-panel {
  position: absolute; top: calc(100% + 8px); right: 0; min-width: 280px;
  background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden; z-index: 200;
}
.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid #f3f4f6;
}
.panel-header h3 {
  margin: 0; font-size: 13px; font-weight: 600; color: #1f2937;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.text-btn {
  background: none; border: none; font-size: 12px; font-weight: 500;
  color: #001845; cursor: pointer; padding: 0; transition: opacity 0.15s;
}
.text-btn:hover { opacity: 0.7; }
.text-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.panel-body { max-height: 400px; overflow-y: auto; }
.panel-body::-webkit-scrollbar { width: 6px; }
.panel-body::-webkit-scrollbar-track { background: transparent; }
.panel-body::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 3px; }

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 40px 20px; color: #9ca3af;
}
.empty-state svg { margin-bottom: 12px; }
.empty-state p { margin: 0; font-size: 13px; font-weight: 500; }
.spinner {
  width: 24px; height: 24px; border: 2px solid #e5e7eb;
  border-top-color: #001845; border-radius: 50%;
  animation: spin 0.8s linear infinite; margin-bottom: 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.notifications-panel { width: 380px; }
.notif-item {
  display: flex; gap: 12px; padding: 12px 16px;
  border-bottom: 1px solid #f9fafb; cursor: pointer;
  transition: background 0.15s ease;
}
.notif-item:last-child { border-bottom: none; }
.notif-item:hover { background: #f9fafb; }
.notif-item.is-unread { background: #f0f9ff; }
.notif-item.is-unread:hover { background: #e0f2fe; }
.notif-indicator {
  width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex-shrink: 0;
}
.notif-indicator.success { background: #10b981; }
.notif-indicator.info { background: #3b82f6; }
.notif-indicator.warning { background: #f59e0b; }
.notif-indicator.error { background: #ef4444; }
.notif-body { flex: 1; min-width: 0; }
.notif-title { margin: 0 0 2px 0; font-size: 13px; font-weight: 600; color: #1f2937; }
.notif-message { margin: 0 0 4px 0; font-size: 13px; line-height: 1.4; color: #4b5563; }
.notif-time { font-size: 11px; color: #9ca3af; }

.user-panel { width: 240px; }
.panel-user-info { display: flex; gap: 12px; padding: 16px; }
.user-details { flex: 1; min-width: 0; }
.user-fullname {
  margin: 0 0 2px 0; font-size: 14px; font-weight: 600; color: #1f2937;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.user-role { margin: 0; font-size: 12px; color: #6b7280; }
.panel-divider { height: 1px; background: #f3f4f6; }
.panel-menu { padding: 8px; }
.menu-item {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 8px 12px; background: transparent; border: none; border-radius: 6px;
  font-size: 13px; font-weight: 500; color: #374151; text-decoration: none;
  text-align: left; cursor: pointer; transition: background 0.15s ease;
}
.menu-item:hover { background: #f9fafb; }
.menu-item svg { color: #6b7280; flex-shrink: 0; }
.menu-item.danger { color: #dc2626; }
.menu-item.danger svg { color: #dc2626; }

.dropdown-fade-enter-active, .dropdown-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.dropdown-fade-enter-from, .dropdown-fade-leave-to {
  opacity: 0; transform: translateY(-8px) scale(0.96);
}

.mobile-only { display: none; }
.desktop-only { display: inline-flex; }

@media (max-width: 768px) {
  .mobile-only { display: inline-flex; }
  .desktop-only { display: none; }
  .search-wrapper { display: none; }
  .admin-header { padding: 0 16px; }
  .notifications-panel { width: calc(100vw - 32px); right: -8px; }
  .user-panel { right: -8px; }
}
@media (max-width: 480px) {
  .header-right { gap: 4px; }
  .icon-btn { width: 32px; height: 32px; }
  .user-avatar { width: 28px; height: 28px; font-size: 12px; }
}
</style>