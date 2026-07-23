// ============================================================
// MARTEX ADMIN — Core Module (Minimalist, SVG Icons, Zero Emojis)
// ============================================================

const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : '/api';

const SVG_ICONS = {
  check: `<svg class="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
  alert: `<svg class="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>`,
  sun: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"/></svg>`,
  moon: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`
};

function checkAuth() {
  const token = sessionStorage.getItem('martex-admin-token');
  const isLoginPage = window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/admin/');

  if (!token && !isLoginPage) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

function getAuthHeaders() {
  const token = sessionStorage.getItem('martex-admin-token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

async function adminFetch(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: getAuthHeaders(),
      ...options
    });

    const data = await response.json();

    if (response.status === 401) {
      sessionStorage.removeItem('martex-admin-token');
      sessionStorage.removeItem('martex-admin-user');
      window.location.href = 'index.html';
      return;
    }

    if (!response.ok) {
      throw new Error(data.error || 'Error en la solicitud');
    }

    return data;
  } catch (error) {
    console.error('Admin API Error:', error);
    throw error;
  }
}

function initAdminTheme() {
  const saved = localStorage.getItem('martex-theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  updateAdminThemeToggleUI();
}

function toggleAdminTheme() {
  document.documentElement.classList.toggle('dark');
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('martex-theme', isDark ? 'dark' : 'light');
  updateAdminThemeToggleUI();
}

function updateAdminThemeToggleUI() {
  const btn = document.getElementById('admin-theme-toggle');
  if (!btn) return;
  const isDark = document.documentElement.classList.contains('dark');
  btn.innerHTML = isDark ? SVG_ICONS.sun : SVG_ICONS.moon;
}

function showUserInfo() {
  const userEl = document.getElementById('admin-user-name');
  if (userEl) {
    const user = JSON.parse(sessionStorage.getItem('martex-admin-user') || '{}');
    userEl.textContent = user.nombre || 'Administrador';
  }
}

function logout() {
  sessionStorage.removeItem('martex-admin-token');
  sessionStorage.removeItem('martex-admin-user');
  window.location.href = 'index.html';
}

function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icon = type === 'error' ? SVG_ICONS.alert : SVG_ICONS.check;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${icon}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  initAdminTheme();
  showUserInfo();

  const themeBtn = document.getElementById('admin-theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleAdminTheme);

  const toggleSidebarBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (toggleSidebarBtn && sidebar) {
    toggleSidebarBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  const isLoginPage = window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/admin/');
  if (!isLoginPage) {
    checkAuth();
  }
});
