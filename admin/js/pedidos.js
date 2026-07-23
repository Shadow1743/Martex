// ============================================================
// MARTEX ADMIN — Orders Management Module (Minimalist, No Emojis)
// ============================================================

async function loadOrders() {
  try {
    const filter = document.getElementById('order-filter');
    const estado = filter ? filter.value : '';
    
    let endpoint = '/pedidos';
    if (estado) endpoint += `?estado=${estado}`;

    const orders = await adminFetch(endpoint);
    renderOrders(orders);
  } catch (error) {
    showToast('Error cargando la lista de pedidos', 'error');
  }
}

function renderOrders(orders) {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="8" class="text-center py-8 text-xs text-slate-400 font-medium">No se encontraron pedidos en el sistema</td></tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(order => `
    <tr class="border-b border-slate-100 dark:border-slate-800 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
      <td class="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">#${order.id}</td>
      <td class="py-3.5 px-4">
        <div class="font-semibold text-slate-900 dark:text-slate-100">${order.cliente_nombre}</div>
        <div class="text-[11px] text-slate-400 font-mono">DUI: ${order.dui}</div>
      </td>
      <td class="py-3.5 px-4 max-w-[200px] text-slate-600 dark:text-slate-300 truncate">${order.direccion}</td>
      <td class="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">${order.telefono}</td>
      <td class="py-3.5 px-4">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.metodo_pago === 'efectivo' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}">
          ${order.metodo_pago === 'efectivo' ? 'Efectivo' : 'Transferencia'}
        </span>
      </td>
      <td class="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">$${parseFloat(order.total).toFixed(2)}</td>
      <td class="py-3.5 px-4">
        <button onclick="toggleOrderStatus(${order.id}, '${order.estado}')" 
                class="px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${order.estado === 'completado' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20'}"
                title="Haga clic para alternar el estado">
          ${order.estado === 'completado' ? 'Completado' : 'Pendiente'}
        </button>
      </td>
      <td class="py-3.5 px-4 text-slate-400">${new Date(order.fecha).toLocaleDateString('es-SV')}</td>
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
  } catch (error) {
    showToast('Error actualizando estado del pedido', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('orders-tbody')) {
    loadOrders();
    const filter = document.getElementById('order-filter');
    if (filter) filter.addEventListener('change', loadOrders);
  }
});
