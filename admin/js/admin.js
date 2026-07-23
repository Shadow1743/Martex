/* ============================================================
   MARTEX ADMIN — Executive Dashboard & Measurement Engine
   ============================================================ */

// Seed initial demo orders if empty
let orders = JSON.parse(localStorage.getItem('martex_orders') || '[]');
if (orders.length === 0) {
  orders = [
    {
      id: 'MX-849201',
      date: new Date(Date.now() - 3600000 * 5).toISOString(),
      clientName: 'Dra. María Elena Ramos',
      dui: '04829103-5',
      phone: '7845-1290',
      address: 'Colonia Escalon, Calle El Mirador #402, San Salvador',
      paymentMethod: 'Transferencia Bancaria',
      items: [
        { name: 'Set Quirúrgico V-Neck Technical', size: 'M', qty: 2, price: 49.99 },
        { name: 'Gorro Quirúrgico Técnico Adjust-Fit', size: 'ÚNICA', qty: 2, price: 12.00 }
      ],
      total: 123.98,
      status: 'En Confección'
    },
    {
      id: 'MX-731940',
      date: new Date(Date.now() - 3600000 * 24).toISOString(),
      clientName: 'Licda. Sofía Benítez (Spa & Estética)',
      dui: '01948201-9',
      phone: '7102-9944',
      address: 'Avenida Jerusalem, Edificio Plaza Rosa #12, Antiguo Cuscatlán',
      paymentMethod: 'Efectivo contra Entrega',
      items: [
        { name: 'Set Estética Slate Grey Minimalist', size: 'S', qty: 4, price: 45.00 }
      ],
      total: 180.00,
      status: 'Pendiente'
    },
    {
      id: 'MX-510293',
      date: new Date(Date.now() - 3600000 * 48).toISOString(),
      clientName: 'Dr. Roberto Mendoza',
      dui: '02910482-1',
      phone: '7555-8811',
      address: 'Hospital de Diagnóstico, Calle Villalta #20, San Salvador',
      paymentMethod: 'Transferencia Bancaria',
      items: [
        { name: 'Filipina Royal Navy Pro', size: 'L', qty: 3, price: 29.00 },
        { name: 'Bata / Abrigo Médico Laboratorio', size: 'L', qty: 1, price: 34.00 }
      ],
      total: 121.00,
      status: 'Entregado'
    }
  ];
  localStorage.setItem('martex_orders', JSON.stringify(orders));
}

// Seed initial tailoring measurements if empty
let medidas = JSON.parse(localStorage.getItem('martex_medidas') || '[]');
if (medidas.length === 0) {
  medidas = [
    {
      id: 'MED-101',
      date: new Date().toISOString(),
      clientName: 'Dr. Alejandro Rivas',
      phone: '7233-4411',
      garmentType: 'ambos',
      garmentLabel: 'Filipina + Pantalón (Set Completo)',
      filipina: { hombro: '44 cm', busto: '98 cm', cintura: '86 cm', cadera: '96 cm', largoCintura: '45 cm', mangaLargo: '24 cm', grosorBrazo: '34 cm', largoTotal: '72 cm' },
      pantalon: { cintura: '86 cm', cadera: '98 cm', largoRodilla: '54 cm', largoTotal: '102 cm', grosorMuslo: '58 cm', tiro: '28 cm', grosorRodilla: '40 cm' },
      notes: 'Cliente prefiere filipina ligeramente ajustada en hombros y pantalón jogger con resorte.'
    }
  ];
  localStorage.setItem('martex_medidas', JSON.stringify(medidas));
}

// ─── INITIALIZATION ───
document.addEventListener('DOMContentLoaded', () => {
  initAdminTheme();
  updateKPIs();
  renderOrders();
  renderMedidas();
  handleMeasurementTypeChange();
});

// ─── THEME CONTROLLER ───
function initAdminTheme() {
  const savedTheme = localStorage.getItem('martex_admin_theme') || 'dark';
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function toggleAdminTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  if (isDark) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('martex_admin_theme', 'light');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('martex_admin_theme', 'dark');
  }
  showAdminToast(`Modo ${isDark ? 'Claro' : 'Oscuro'} activado`, 'info');
}

// ─── SIDEBAR & TAB SWITCHING ───
function switchTab(tabId) {
  const views = ['dashboard', 'medidas', 'productos', 'pedidos'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    const navBtn = document.getElementById(`nav-${v}`);
    if (el) el.classList.add('hidden');
    if (navBtn) {
      navBtn.classList.remove('text-[#00A896]', 'bg-[#00A896]/10', 'border-[#00A896]/30', 'text-white');
      navBtn.classList.add('text-slate-400');
    }
  });

  const activeView = document.getElementById(`view-${tabId}`);
  const activeNavBtn = document.getElementById(`nav-${tabId}`);
  if (activeView) activeView.classList.remove('hidden');
  if (activeNavBtn) {
    activeNavBtn.classList.remove('text-slate-400');
    activeNavBtn.classList.add('text-[#00A896]', 'bg-[#00A896]/10', 'border-l-4', 'border-[#00A896]', 'text-white');
  }

  // Update Page Title
  const titles = {
    dashboard: 'Dashboard Ejecutivo & Métricas',
    medidas: 'Ficha de Medidas Anatómicas (Sastrería)',
    productos: 'Gestión del Catálogo de Productos',
    pedidos: 'Registro de Ventas & Estado de Pedidos'
  };
  const titleEl = document.getElementById('view-title');
  if (titleEl) titleEl.textContent = titles[tabId] || 'Panel de Administración';

  // Refresh lists
  if (tabId === 'dashboard') updateKPIs();
  if (tabId === 'pedidos') renderOrders();
  if (tabId === 'medidas') renderMedidas();

  // Close mobile sidebar if open
  closeMobileSidebar();
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('active');
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.remove('active');
}

// ─── DYNAMIC ANATOMICAL MEASUREMENT FORM CONTROLLER ───
function handleMeasurementTypeChange() {
  const select = document.getElementById('medida-tipo-prenda');
  if (!select) return;

  const value = select.value; // 'filipina', 'pantalon', 'ambos'
  const filipinaSec = document.getElementById('sec-medidas-filipina');
  const pantalonSec = document.getElementById('sec-medidas-pantalon');

  if (!filipinaSec || !pantalonSec) return;

  const filipinaInputs = filipinaSec.querySelectorAll('input');
  const pantalonInputs = pantalonSec.querySelectorAll('input');

  if (value === 'filipina') {
    filipinaSec.classList.remove('disabled-section');
    filipinaInputs.forEach(i => i.disabled = false);

    pantalonSec.classList.add('disabled-section');
    pantalonInputs.forEach(i => { i.disabled = true; i.value = ''; });
  } else if (value === 'pantalon') {
    pantalonSec.classList.remove('disabled-section');
    pantalonInputs.forEach(i => i.disabled = false);

    filipinaSec.classList.add('disabled-section');
    filipinaInputs.forEach(i => { i.disabled = true; i.value = ''; });
  } else {
    // Ambos
    filipinaSec.classList.remove('disabled-section');
    filipinaInputs.forEach(i => i.disabled = false);

    pantalonSec.classList.remove('disabled-section');
    pantalonInputs.forEach(i => i.disabled = false);
  }
}

function saveMedidaForm(e) {
  e.preventDefault();
  const form = e.target;

  const clientName = form.querySelector('[name="medida_cliente"]').value.trim();
  const phone = form.querySelector('[name="medida_telefono"]').value.trim();
  const garmentType = form.querySelector('[name="garment_type"]').value;
  const notes = form.querySelector('[name="medida_notas"]').value.trim();

  if (!clientName || !phone) {
    showAdminToast('Completa el nombre del cliente y teléfono', 'error');
    return;
  }

  const garmentLabels = {
    filipina: 'Solo Filipina / Gabacha',
    pantalon: 'Solo Pantalón',
    ambos: 'Filipina + Pantalón (Set Completo)'
  };

  const newMedida = {
    id: 'MED-' + Math.floor(100 + Math.random() * 900),
    date: new Date().toISOString(),
    clientName: clientName,
    phone: phone,
    garmentType: garmentType,
    garmentLabel: garmentLabels[garmentType],
    notes: notes,
    filipina: {
      hombro: form.querySelector('[name="f_hombro"]')?.value || '-',
      busto: form.querySelector('[name="f_busto"]')?.value || '-',
      cintura: form.querySelector('[name="f_cintura"]')?.value || '-',
      cadera: form.querySelector('[name="f_cadera"]')?.value || '-',
      largoCintura: form.querySelector('[name="f_largo_cintura"]')?.value || '-',
      mangaLargo: form.querySelector('[name="f_manga_largo"]')?.value || '-',
      grosorBrazo: form.querySelector('[name="f_grosor_brazo"]')?.value || '-',
      largoTotal: form.querySelector('[name="f_largo_total"]')?.value || '-'
    },
    pantalon: {
      cintura: form.querySelector('[name="p_cintura"]')?.value || '-',
      cadera: form.querySelector('[name="p_cadera"]')?.value || '-',
      largoRodilla: form.querySelector('[name="p_largo_rodilla"]')?.value || '-',
      largoTotal: form.querySelector('[name="p_largo_total"]')?.value || '-',
      grosorMuslo: form.querySelector('[name="p_grosor_muslo"]')?.value || '-',
      tiro: form.querySelector('[name="p_tiro"]')?.value || '-',
      grosorRodilla: form.querySelector('[name="p_grosor_rodilla"]')?.value || '-'
    }
  };

  medidas.unshift(newMedida);
  localStorage.setItem('martex_medidas', JSON.stringify(medidas));

  form.reset();
  handleMeasurementTypeChange();
  renderMedidas();
  updateKPIs();
  showAdminToast(`Medidas registradas para ${clientName}`, 'success');
}

function renderMedidas(searchQuery = '') {
  const tbody = document.getElementById('medidas-table-body');
  if (!tbody) return;

  let list = medidas;
  if (searchQuery) {
    list = list.filter(m => m.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || m.phone.includes(searchQuery));
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-400 text-xs">No hay fichas de medidas registradas.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map((m, index) => `
    <tr class="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs">
      <td class="py-4 px-4 font-mono font-bold text-[#00A896]">${m.id}</td>
      <td class="py-4 px-4 font-bold text-slate-900 dark:text-white">
        ${m.clientName}
        <div class="text-[10px] text-slate-500 font-normal">Tel: ${m.phone}</div>
      </td>
      <td class="py-4 px-4">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${m.garmentType === 'ambos' ? 'bg-[#00A896]/10 text-[#00A896] border border-[#00A896]/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}">
          ${m.garmentLabel}
        </span>
      </td>
      <td class="py-4 px-4 text-[11px] text-slate-600 dark:text-slate-300">
        ${m.garmentType !== 'pantalon' ? `<strong>Filipina:</strong> Hombro ${m.filipina.hombro}, Busto ${m.filipina.busto}, Largo ${m.filipina.largoTotal}<br>` : ''}
        ${m.garmentType !== 'filipina' ? `<strong>Pantalón:</strong> Cintura ${m.pantalon.cintura}, Tiro ${m.pantalon.tiro}, Largo ${m.pantalon.largoTotal}` : ''}
      </td>
      <td class="py-4 px-4 text-right space-x-2">
        <button onclick="viewMedidaDetail('${m.id}')" class="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#00A896] hover:text-white text-slate-600 dark:text-slate-300 transition-colors" title="Ver Ficha Completa">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        <button onclick="deleteMedida(${index})" class="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-300 transition-colors" title="Eliminar Ficha">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </td>
    </tr>
  `).join('');
}

function deleteMedida(index) {
  if (confirm('¿Deseas eliminar esta ficha de medidas?')) {
    medidas.splice(index, 1);
    localStorage.setItem('martex_medidas', JSON.stringify(medidas));
    renderMedidas();
    updateKPIs();
    showAdminToast('Ficha eliminada', 'info');
  }
}

function viewMedidaDetail(medidaId) {
  const m = medidas.find(item => item.id === medidaId);
  if (!m) return;

  const detailBox = document.getElementById('medida-modal-body');
  const modal = document.getElementById('medida-modal');
  if (!detailBox || !modal) return;

  detailBox.innerHTML = `
    <div class="space-y-4 text-xs text-slate-700 dark:text-slate-300">
      <div class="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">${m.clientName}</h3>
          <p class="text-slate-400">Tel: ${m.phone} | Ficha: <strong class="font-mono text-[#00A896]">${m.id}</strong></p>
        </div>
        <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#00A896]/10 text-[#00A896]">${m.garmentLabel}</span>
      </div>

      ${m.garmentType !== 'pantalon' ? `
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
          <h4 class="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-[#00A896]">Medidas de Filipina / Gabacha</h4>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>Hombro: <strong>${m.filipina.hombro}</strong></div>
            <div>Busto: <strong>${m.filipina.busto}</strong></div>
            <div>Cintura: <strong>${m.filipina.cintura}</strong></div>
            <div>Cadera: <strong>${m.filipina.cadera}</strong></div>
            <div>Largo Cintura: <strong>${m.filipina.largoCintura}</strong></div>
            <div>Manga Largo: <strong>${m.filipina.mangaLargo}</strong></div>
            <div>Grosor Brazo: <strong>${m.filipina.grosorBrazo}</strong></div>
            <div>Largo Total: <strong>${m.filipina.largoTotal}</strong></div>
          </div>
        </div>
      ` : ''}

      ${m.garmentType !== 'filipina' ? `
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
          <h4 class="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-[#00A896]">Medidas de Pantalón</h4>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>Cintura: <strong>${m.pantalon.cintura}</strong></div>
            <div>Cadera: <strong>${m.pantalon.cadera}</strong></div>
            <div>Largo Rodilla: <strong>${m.pantalon.largoRodilla}</strong></div>
            <div>Largo Total: <strong>${m.pantalon.largoTotal}</strong></div>
            <div>Grosor Muslo: <strong>${m.pantalon.grosorMuslo}</strong></div>
            <div>Tiro: <strong>${m.pantalon.tiro}</strong></div>
            <div>Grosor Rodilla: <strong>${m.pantalon.grosorRodilla}</strong></div>
          </div>
        </div>
      ` : ''}

      ${m.notes ? `
        <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-[11px]">
          <strong>Observaciones de Confección:</strong> ${m.notes}
        </div>
      ` : ''}
    </div>
  `;

  modal.classList.add('active');
}

function closeMedidaModal() {
  const modal = document.getElementById('medida-modal');
  if (modal) modal.classList.remove('active');
}

// ─── ORDERS & SALES LOG TABLE CONTROLLER ───
function renderOrders(filterStatus = 'todos', searchQuery = '') {
  const tbody = document.getElementById('pedidos-table-body');
  if (!tbody) return;

  // Refresh from localStorage
  orders = JSON.parse(localStorage.getItem('martex_orders') || '[]');

  let list = orders;
  if (filterStatus !== 'todos') {
    list = list.filter(o => o.status.toLowerCase().replace(' ', '') === filterStatus.toLowerCase().replace(' ', ''));
  }
  if (searchQuery) {
    list = list.filter(o => o.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || o.dui.includes(searchQuery) || o.id.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400 text-xs">No se encontraron pedidos en esta categoría.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map((o, idx) => `
    <tr class="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs">
      <td class="py-4 px-4 font-mono font-bold text-[#00A896]">${o.id}</td>
      <td class="py-4 px-4 font-bold text-slate-900 dark:text-white">
        ${o.clientName}
        <div class="text-[10px] text-slate-500 font-normal">DUI: ${o.dui} | Tel: ${o.phone}</div>
      </td>
      <td class="py-4 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title="${o.address}">${o.address}</td>
      <td class="py-4 px-4">
        <div class="font-medium text-slate-700 dark:text-slate-300">${o.items.map(i => `${i.qty}x ${i.name} (${i.size})`).join('<br>')}</div>
        <div class="text-[10px] text-slate-400 mt-0.5">Pago: ${o.paymentMethod}</div>
      </td>
      <td class="py-4 px-4 font-mono font-extrabold text-slate-900 dark:text-white">$${o.total.toFixed(2)}</td>
      <td class="py-4 px-4">
        <select onchange="updateOrderStatus('${o.id}', this.value)" class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#00A896]">
          <option value="Pendiente" ${o.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="En Confección" ${o.status === 'En Confección' ? 'selected' : ''}>En Confección</option>
          <option value="Enviado" ${o.status === 'Enviado' ? 'selected' : ''}>Enviado</option>
          <option value="Entregado" ${o.status === 'Entregado' ? 'selected' : ''}>Entregado</option>
          <option value="Cancelado" ${o.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
        </select>
      </td>
      <td class="py-4 px-4 text-right">
        <button onclick="deleteOrder('${o.id}')" class="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-300 transition-colors" title="Eliminar Pedido">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </td>
    </tr>
  `).join('');
}

function updateOrderStatus(orderId, newStatus) {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    localStorage.setItem('martex_orders', JSON.stringify(orders));
    updateKPIs();
    showAdminToast(`Pedido ${orderId} actualizado a "${newStatus}"`, 'success');
  }
}

function deleteOrder(orderId) {
  if (confirm(`¿Deseas eliminar el pedido ${orderId}?`)) {
    orders = orders.filter(o => o.id !== orderId);
    localStorage.setItem('martex_orders', JSON.stringify(orders));
    renderOrders();
    updateKPIs();
    showAdminToast(`Pedido ${orderId} eliminado`, 'info');
  }
}

// ─── KPI METRICS CONTROLLER ───
function updateKPIs() {
  orders = JSON.parse(localStorage.getItem('martex_orders') || '[]');
  medidas = JSON.parse(localStorage.getItem('martex_medidas') || '[]');

  const totalSales = orders.reduce((acc, o) => acc + (o.status !== 'Cancelado' ? o.total : 0), 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pendiente' || o.status === 'En Confección').length;
  const totalMedidasCount = medidas.length;

  const kpiSales = document.getElementById('stat-total-ventas');
  const kpiOrders = document.getElementById('stat-total-pedidos');
  const kpiPending = document.getElementById('stat-pedidos-pendientes');
  const kpiMedidas = document.getElementById('stat-total-medidas');

  if (kpiSales) kpiSales.textContent = `$${totalSales.toFixed(2)}`;
  if (kpiOrders) kpiOrders.textContent = totalOrdersCount;
  if (kpiPending) kpiPending.textContent = pendingOrdersCount;
  if (kpiMedidas) kpiMedidas.textContent = totalMedidasCount;
}

// ─── TOAST NOTIFICATIONS ───
function showAdminToast(msg, type = 'info') {
  let container = document.getElementById('admin-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'admin-toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'border-left-rose-500' : ''}`;
  toast.innerHTML = `
    <svg class="w-4 h-4 text-[#00A896]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    <span class="text-xs font-semibold">${msg}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
