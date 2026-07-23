// ============================================================
// MARTEX ADMIN — Dashboard Analytics Module
// ============================================================

async function loadDashboard() {
  try {
    const stats = await adminFetch('/pedidos/stats');

    document.getElementById('stat-ingresos').textContent = `$${parseFloat(stats.total_ingresos).toFixed(2)}`;
    document.getElementById('stat-pedidos').textContent = stats.total_pedidos;
    document.getElementById('stat-pendientes').textContent = stats.pedidos_pendientes;
    document.getElementById('stat-medidas').textContent = stats.total_medidas;
    document.getElementById('stat-productos').textContent = stats.productos_activos;

    renderTopProducts(stats.top_productos);
    renderRecentOrders(stats.pedidos_recientes);

  } catch (error) {
    showToast('Error cargando estadísticas del dashboard', 'error');
  }
}

function renderTopProducts(products) {
  const container = document.getElementById('top-products');
  if (!container) return;

  if (!products || products.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-slate-400 text-xs font-medium">
        No hay registros de ventas recientes
      </div>
    `;
    return;
  }

  container.innerHTML = products.map((p, i) => `
    <div class="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 text-xs">
      <div class="flex items-center gap-3">
        <span class="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px] flex items-center justify-center">${i + 1}</span>
        <span class="font-medium text-slate-800 dark:text-slate-200">${p.titulo}</span>
      </div>
      <span class="font-bold text-slate-900 dark:text-white">${p.total_vendido} uds</span>
    </div>
  `).join('');
}

function renderRecentOrders(orders) {
  const tbody = document.getElementById('recent-orders');
  if (!tbody) return;

  if (!orders || orders.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="5" class="text-center py-8 text-xs text-slate-400 font-medium">No hay pedidos recientes</td></tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(order => `
    <tr class="border-b border-slate-100 dark:border-slate-800 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
      <td class="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">#${order.id}</td>
      <td class="py-3 px-4 text-slate-700 dark:text-slate-300">${order.cliente_nombre}</td>
      <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">$${parseFloat(order.total).toFixed(2)}</td>
      <td class="py-3 px-4">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${order.estado === 'completado' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}">
          ${order.estado === 'completado' ? 'Completado' : 'Pendiente'}
        </span>
      </td>
      <td class="py-3 px-4 text-slate-400">${new Date(order.fecha).toLocaleDateString('es-SV')}</td>
    </tr>
  `).join('');
}

document.addEventListener('DOMContentLoaded', loadDashboard);
