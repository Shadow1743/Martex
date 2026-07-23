// ============================================================
// MARTEX — Admin System Logic (Dashboard, CRUD, Medidas Dinamicas)
// ============================================================

const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : '/api';

let allAdminProducts = [];

// --- Toast Helper ---
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const iconSvg = type === 'error'
    ? `<svg class="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>`
    : `<svg class="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// --- API Helper (works for both authenticated and unauthenticated) ---
async function adminFetch(endpoint, options = {}) {
  try {
    const token = sessionStorage.getItem('martex-admin-token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error en la solicitud');
    }

    return data;
  } catch (error) {
    console.error('Admin API Error:', error);
    throw error;
  }
}

// --- Dashboard Stats ---
async function loadDashboardStats() {
  try {
    const stats = await adminFetch('/dashboard/stats');

    const ingresosEl = document.getElementById('stat-ingresos');
    const pedidosEl = document.getElementById('stat-pedidos');
    const pendientesEl = document.getElementById('stat-pendientes');
    const medidasEl = document.getElementById('stat-medidas');
    const prendasEl = document.getElementById('stat-prendas');

    if (ingresosEl) ingresosEl.textContent = `$${parseFloat(stats.total_ingresos).toFixed(2)}`;
    if (pedidosEl) pedidosEl.textContent = stats.total_pedidos;
    if (pendientesEl) pendientesEl.textContent = stats.pedidos_pendientes;
    if (medidasEl) medidasEl.textContent = stats.total_medidas;
    if (prendasEl) prendasEl.textContent = stats.productos_activos;

    renderRecentOrders(stats.pedidos_recientes);
    renderTopProducts(stats.top_productos);
  } catch (err) {
    console.error('Error cargando stats:', err);
  }
}

function renderRecentOrders(orders) {
  const tbody = document.getElementById('recent-orders-tbody');
  if (!tbody) return;

  if (!orders || orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-xs text-slate-400">No hay pedidos recientes</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr class="border-b border-slate-100 dark:border-slate-800 text-xs">
      <td class="py-3 px-4 font-mono font-bold">#${o.id}</td>
      <td class="py-3 px-4">${o.cliente_nombre}</td>
      <td class="py-3 px-4 font-bold text-emerald-500">$${parseFloat(o.total).toFixed(2)}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${o.estado === 'completado' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}">
          ${o.estado === 'completado' ? 'Completado' : 'Pendiente'}
        </span>
      </td>
      <td class="py-3 px-4 text-slate-400">${new Date(o.fecha).toLocaleDateString('es-SV')}</td>
    </tr>
  `).join('');
}

function renderTopProducts(products) {
  const container = document.getElementById('top-products-container');
  if (!container) return;

  if (!products || products.length === 0) {
    container.innerHTML = `<div class="text-center py-6 text-xs text-slate-400">Sin datos de venta</div>`;
    return;
  }

  container.innerHTML = products.map((p, i) => `
    <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
      <div class="flex items-center gap-2">
        <span class="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px] flex items-center justify-center">${i + 1}</span>
        <span class="font-medium">${p.titulo}</span>
      </div>
      <span class="font-bold text-slate-900 dark:text-white">${p.total_vendido} uds</span>
    </div>
  `).join('');
}

// --- Products CRUD ---
async function loadAdminProducts() {
  try {
    allAdminProducts = await adminFetch('/productos/all');
    renderAdminProducts(allAdminProducts);
  } catch (err) {
    showToast('Error cargando productos', 'error');
  }
}

function renderAdminProducts(products) {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-xs text-slate-400">No hay productos registrados</td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr class="border-b border-slate-100 dark:border-slate-800 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
      <td class="py-3 px-4">
        <div class="flex items-center gap-3">
          <img src="${p.imagen_url}" class="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
               onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><rect fill=%22%231E293B%22 width=%2240%22 height=%2240%22/><text x=%2220%22 y=%2224%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2210%22>Sin Foto</text></svg>'">
          <span class="font-semibold text-slate-900 dark:text-slate-100">${p.titulo}</span>
        </div>
      </td>
      <td class="py-3 px-4"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800">${p.categoria === 'medico' ? 'Medico' : 'Belleza'}</span></td>
      <td class="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">$${parseFloat(p.precio).toFixed(2)}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${p.activo ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}">
          ${p.activo ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td class="py-3 px-4 text-slate-400">${new Date(p.fecha_creacion).toLocaleDateString('es-SV')}</td>
      <td class="py-3 px-4">
        <div class="flex items-center gap-2">
          <button onclick="editProductModal(${p.id})" class="p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" title="Editar">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
          <button onclick="toggleProductActive(${p.id}, ${p.activo})" class="p-1.5 rounded border border-slate-200 dark:border-slate-700 ${p.activo ? 'text-rose-500' : 'text-emerald-500'}" title="${p.activo ? 'Desactivar' : 'Activar'}">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openProductModal() {
  const modal = document.getElementById('product-modal');
  if (!modal) return;

  document.getElementById('product-modal-title').textContent = 'Nuevo Producto';
  document.getElementById('product-form').reset();
  document.getElementById('prod-id').value = '';
  document.getElementById('prod-activo').checked = true;

  modal.classList.add('active');
}

function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.classList.remove('active');
}

function editProductModal(id) {
  const p = allAdminProducts.find(item => item.id === id);
  if (!p) return;

  const modal = document.getElementById('product-modal');
  document.getElementById('product-modal-title').textContent = 'Editar Producto';
  document.getElementById('prod-id').value = p.id;
  document.getElementById('prod-titulo').value = p.titulo;
  document.getElementById('prod-desc').value = p.descripcion || '';
  document.getElementById('prod-cat').value = p.categoria;
  document.getElementById('prod-precio').value = p.precio;
  document.getElementById('prod-imagen').value = p.imagen_url || '';
  document.getElementById('prod-activo').checked = Boolean(p.activo);

  modal.classList.add('active');
}

async function handleProductSave(e) {
  e.preventDefault();

  const id = document.getElementById('prod-id').value;
  const data = {
    titulo: document.getElementById('prod-titulo').value.trim(),
    descripcion: document.getElementById('prod-desc').value.trim(),
    categoria: document.getElementById('prod-cat').value,
    precio: parseFloat(document.getElementById('prod-precio').value),
    imagen_url: document.getElementById('prod-imagen').value.trim(),
    activo: document.getElementById('prod-activo').checked
  };

  try {
    if (id) {
      await adminFetch(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      showToast('Producto actualizado');
    } else {
      await adminFetch('/productos', { method: 'POST', body: JSON.stringify(data) });
      showToast('Producto creado');
    }

    closeProductModal();
    loadAdminProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function toggleProductActive(id, currentStatus) {
  const p = allAdminProducts.find(item => item.id === id);
  if (!p) return;

  try {
    await adminFetch(`/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...p, activo: !currentStatus })
    });
    showToast('Estado del producto actualizado');
    loadAdminProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// --- Orders Manager ---
async function loadOrders() {
  try {
    const filter = document.getElementById('order-filter-select');
    const estado = filter ? filter.value : '';
    let endpoint = '/pedidos';
    if (estado) endpoint += `?estado=${estado}`;

    const orders = await adminFetch(endpoint);
    renderOrders(orders);
  } catch (err) {
    showToast('Error cargando pedidos', 'error');
  }
}

function renderOrders(orders) {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-6 text-xs text-slate-400">No hay pedidos registrados</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr class="border-b border-slate-100 dark:border-slate-800 text-xs">
      <td class="py-3 px-4 font-mono font-bold">#${o.id}</td>
      <td class="py-3 px-4 font-semibold">${o.cliente_nombre}<div class="text-[10px] text-slate-400 font-mono">DUI: ${o.dui}</div></td>
      <td class="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">${o.direccion}</td>
      <td class="py-3 px-4 font-mono">${o.telefono}</td>
      <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800">${o.metodo_pago}</span></td>
      <td class="py-3 px-4 font-bold text-emerald-500">$${parseFloat(o.total).toFixed(2)}</td>
      <td class="py-3 px-4">
        <button onclick="toggleOrderStatus(${o.id}, '${o.estado}')" class="px-2.5 py-1 rounded-full text-[10px] font-bold ${o.estado === 'completado' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}">
          ${o.estado === 'completado' ? 'Completado' : 'Pendiente'}
        </button>
      </td>
      <td class="py-3 px-4 text-slate-400">${new Date(o.fecha).toLocaleDateString('es-SV')}</td>
    </tr>
  `).join('');
}

async function toggleOrderStatus(id, currentStatus) {
  const newStatus = currentStatus === 'pendiente' ? 'completado' : 'pendiente';
  try {
    await adminFetch(`/pedidos/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado: newStatus })
    });
    showToast(`Pedido #${id} actualizado a ${newStatus}`);
    loadOrders();
    loadDashboardStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// --- Dynamic Tailoring Measurement Form ---
function updateMedidasDynamicFields() {
  const tipoSelect = document.getElementById('medida-tipo-select');
  if (!tipoSelect) return;

  const tipo = tipoSelect.value;
  const filipinaBox = document.getElementById('box-filipina');
  const pantalonBox = document.getElementById('box-pantalon');

  if (filipinaBox && pantalonBox) {
    if (tipo === 'filipina') {
      filipinaBox.classList.remove('hidden');
      pantalonBox.classList.add('hidden');
    } else if (tipo === 'pantalon') {
      filipinaBox.classList.add('hidden');
      pantalonBox.classList.remove('hidden');
    } else if (tipo === 'ambos') {
      filipinaBox.classList.remove('hidden');
      pantalonBox.classList.remove('hidden');
    } else {
      filipinaBox.classList.add('hidden');
      pantalonBox.classList.add('hidden');
    }
  }
}

async function handleMedidaSave(e) {
  e.preventDefault();

  const tipo = document.getElementById('medida-tipo-select').value;
  const nombre = document.getElementById('medida-nombre').value.trim();

  if (!nombre || !tipo) {
    showToast('El nombre del cliente y tipo de prenda son obligatorios', 'error');
    return;
  }

  const data = {
    cliente_nombre: nombre,
    telefono: document.getElementById('medida-telefono').value.trim(),
    tipo_prenda: tipo,
    
    // Filipina
    hombro: document.getElementById('m-hombro')?.value || null,
    busto: document.getElementById('m-busto')?.value || null,
    cintura_top: document.getElementById('m-cintura-top')?.value || null,
    cadera_top: document.getElementById('m-cadera-top')?.value || null,
    largo_cintura: document.getElementById('m-largo-cintura')?.value || null,
    manga_largo: document.getElementById('m-manga-largo')?.value || null,
    grosor_brazo: document.getElementById('m-grosor-brazo')?.value || null,
    largo_total_top: document.getElementById('m-largo-total-top')?.value || null,
    
    // Pantalon
    cintura_pant: document.getElementById('m-cintura-pant')?.value || null,
    cadera_pant: document.getElementById('m-cadera-pant')?.value || null,
    largo_rodilla: document.getElementById('m-largo-rodilla')?.value || null,
    largo_total_pant: document.getElementById('m-largo-total-pant')?.value || null,
    grosor_muslo: document.getElementById('m-grosor-muslo')?.value || null,
    tiro: document.getElementById('m-tiro')?.value || null,
    grosor_rodilla: document.getElementById('m-grosor-rodilla')?.value || null,
    
    notas: document.getElementById('medida-notas')?.value.trim() || ''
  };

  try {
    await adminFetch('/medidas', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    showToast('Ficha de medidas registrada exitosamente');
    document.getElementById('medida-form').reset();
    updateMedidasDynamicFields();
    loadMedidasHistory();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadMedidasHistory() {
  const tbody = document.getElementById('medidas-tbody');
  if (!tbody) return;

  try {
    const list = await adminFetch('/medidas');
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-xs text-slate-400">No hay fichas de medida registradas</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(m => `
      <tr class="border-b border-slate-100 dark:border-slate-800 text-xs">
        <td class="py-3 px-4 font-semibold">${m.cliente_nombre}</td>
        <td class="py-3 px-4 font-mono text-slate-400">${m.telefono || '--'}</td>
        <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800">${m.tipo_prenda}</span></td>
        <td class="py-3 px-4 text-[11px] text-slate-500">
          ${m.hombro ? `Hombro: ${m.hombro}cm ` : ''}
          ${m.busto ? `Busto: ${m.busto}cm ` : ''}
          ${m.cintura_top ? `Cintura: ${m.cintura_top}cm ` : ''}
          ${m.cintura_pant ? `Cintura Pant: ${m.cintura_pant}cm ` : ''}
          ${m.largo_total_pant ? `Largo Pant: ${m.largo_total_pant}cm` : ''}
        </td>
        <td class="py-3 px-4 text-slate-400">${new Date(m.fecha).toLocaleDateString('es-SV')}</td>
        <td class="py-3 px-4">
          <button onclick="deleteMedida(${m.id})" class="p-1 text-rose-500 hover:text-rose-400">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error en medidas history:', err);
  }
}

async function deleteMedida(id) {
  if (!confirm('Eliminar esta ficha de medidas?')) return;
  try {
    await adminFetch(`/medidas/${id}`, { method: 'DELETE' });
    showToast('Ficha eliminada');
    loadMedidasHistory();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// --- Admin Navigation Tabs ---
function switchAdminTab(tabName) {
  document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.admin-nav-link').forEach(el => {
    el.classList.remove('bg-emerald-600/15', 'text-emerald-400', 'border', 'border-emerald-500/20');
    el.classList.add('text-slate-400');
  });

  const activeTab = document.getElementById(`tab-${tabName}`);
  const activeLink = document.getElementById(`nav-link-${tabName}`);

  if (activeTab) activeTab.classList.remove('hidden');
  if (activeLink) {
    activeLink.classList.remove('text-slate-400');
    activeLink.classList.add('bg-emerald-600/15', 'text-emerald-400', 'border', 'border-emerald-500/20');
  }

  // Refresh data when switching to specific tabs
  if (tabName === 'dashboard') loadDashboardStats();
  if (tabName === 'productos') loadAdminProducts();
  if (tabName === 'pedidos') loadOrders();
  if (tabName === 'medidas') loadMedidasHistory();
}

// --- Admin Login & Session ---
function showAdminDashboard() {
  const loginView = document.getElementById('admin-login-view');
  const dashboardView = document.getElementById('admin-dashboard-view');

  if (loginView && dashboardView) {
    loginView.style.display = 'none';
    dashboardView.classList.remove('hidden');
    dashboardView.style.display = 'flex';

    loadDashboardStats();
    loadAdminProducts();
    loadOrders();
    loadMedidasHistory();
  }
}

function adminLogout() {
  sessionStorage.removeItem('martex-admin-token');
  sessionStorage.removeItem('martex-admin-user');
  location.reload();
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('martex-admin-token');
  const loginView = document.getElementById('admin-login-view');
  const dashboardView = document.getElementById('admin-dashboard-view');

  // If already logged in, go straight to dashboard
  if (token && dashboardView && loginView) {
    showAdminDashboard();
  }

  // Admin Login Form Submit
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('admin-email').value.trim();
      const password = document.getElementById('admin-pass').value;
      const errorEl = document.getElementById('admin-login-error');

      // Hide previous errors
      if (errorEl) errorEl.classList.add('hidden');

      try {
        const res = await adminFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });

        // Check if user is admin
        if (res.user && res.user.rol !== 'admin') {
          throw new Error('Acceso denegado. Solo administradores pueden ingresar.');
        }

        // Store session
        sessionStorage.setItem('martex-admin-token', res.token || 'martex_session');
        sessionStorage.setItem('martex-admin-user', JSON.stringify(res.user));

        showToast(`Bienvenido, ${res.user.nombre}`);
        showAdminDashboard();
      } catch (err) {
        if (errorEl) {
          errorEl.textContent = err.message;
          errorEl.classList.remove('hidden');
        }
      }
    });
  }

  // Dynamic tailoring selector
  const tipoSelect = document.getElementById('medida-tipo-select');
  if (tipoSelect) {
    tipoSelect.addEventListener('change', updateMedidasDynamicFields);
    updateMedidasDynamicFields();
  }

  const medidaForm = document.getElementById('medida-form');
  if (medidaForm) medidaForm.addEventListener('submit', handleMedidaSave);

  const productForm = document.getElementById('product-form');
  if (productForm) productForm.addEventListener('submit', handleProductSave);

  const orderFilter = document.getElementById('order-filter-select');
  if (orderFilter) orderFilter.addEventListener('change', loadOrders);
});
