// ============================================================
// MARTEX — Theme Module (Modo Oscuro / Claro Global)
// Persistencia en localStorage + Iconos SVG Sol/Luna
// ============================================================

const THEME_SVG = {
  sun: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"/></svg>`,
  moon: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`
};

function initGlobalTheme() {
  const saved = localStorage.getItem('martex-theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  updateThemeButtonUI();
}

function toggleGlobalTheme() {
  document.documentElement.classList.toggle('dark');
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('martex-theme', isDark ? 'dark' : 'light');
  updateThemeButtonUI();
}

function updateThemeButtonUI() {
  const btns = document.querySelectorAll('.theme-toggle-btn');
  const isDark = document.documentElement.classList.contains('dark');
  
  btns.forEach(btn => {
    btn.innerHTML = isDark ? THEME_SVG.sun : THEME_SVG.moon;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initGlobalTheme();
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', toggleGlobalTheme);
  });
});
