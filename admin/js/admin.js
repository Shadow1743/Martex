/* ============================================================
   MARTEX ADMIN — Executive Dashboard & Measurement Engine (El Salvador)
   ============================================================ */

// ─── SEED DEMO DATA IF EMPTY ───
let orders = JSON.parse(localStorage.getItem('martex_orders') || '[]');
if (orders.length === 0) {
  orders = [
    {
      id: 'MX-849201',
      date: new Date(Date.now() - 3600000 * 5).toISOString(),
      clientName: 'Dra. María Elena Ramos',
      dui: '04829103-5',
      phone: '6049 7383',
      address: 'Usulután, El Salvador',
      paymentMethod: 'Transferencia Bancaria',
      items: [
        { name: 'Conjunto Quirúrgico Azul Médico', size: 'M', qty: 2, price: 49.99 }
      ],
      total: 99.98,
      status: 'En Confección'
    },
    {
      id: 'MX-731940',
      date: new Date(Date.now() - 3600000 * 24).toISOString(),
      clientName: 'Licda. Sofía Benítez (Spa & Estética)',
      dui: '01948201-9',
      phone: '7102-9944',
      address: 'Usulután, El Salvador',
      paymentMethod: 'Efectivo contra Entrega',
      items: [
        { name: 'Uniforme Gris para Estética y Spa', size: 'S', qty: 2, price: 45.00 }
      ],
      total: 90.00,
      status: 'Pendiente'
    }
  ];
  localStorage.setItem('martex_orders', JSON.stringify(orders));
}

let medidas = JSON.parse(localStorage.getItem('martex_medidas') || '[]');
if (medidas.length === 0) {
  medidas = [
    {
      id: 'MED-101',
      date: new Date().toISOString(),
      clientName: 'Dr. Alejandro Rivas',
      phone: '6049 7383',
      garmentType: 'ambos',
      garmentLabel: 'Filipina + Pantalón (Set Completo)',
      filipina: { hombro: '44 cm', busto: '98 cm', cintura: '86 cm', cadera: '96 cm', largoCintura: '45 cm', mangaLargo: '24 cm', grosorBrazo: '34 cm', largoTotal: '72 cm' },
      pantalon: { cintura: '86 cm', cadera: '98 cm', largoRodilla: '54 cm', largoTotal: '102 cm', grosorMuslo: '58 cm', tiro: '28 cm', grosorRodilla: '40 cm' },
      notes: 'Cliente prefiere filipina holgada y pantalón jogger con resorte.'
    }
  ];
  localStorage.setItem('martex_medidas', JSON.stringify(medidas));
}

// Default Products Seed
const DEFAULT_PRODUCTS = [
  {
    id: 'm-01',
    name: 'Conjunto Quirúrgico Azul Médico',
    category: 'medicos',
    categoryLabel: 'Colección Médica',
    price: 49.99,
    badge: 'Antifluido Premium',
    image: '../imagenes/conjunto de uniforme médico.jpeg',
    gallery: [
      '../imagenes/conjunto de uniforme médico.jpeg',
      '../imagenes/Camisa(scrub)colorAzul.jpeg'
    ],
    description: 'Filipina médica ergonómica de cuello en V con bolsillos estratégicos y pantalón jogger cómodo. Confeccionada en El Salvador con tela antimicrobiana.',
    fabric: 'Tela Antifluido Nivel 4 de Secado Rápido.',
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: 'm-02',
    name: 'Filipina Verde Esmeralda',
    category: 'medicos',
    categoryLabel: 'Colección Médica',
    price: 28.50,
    badge: 'Popular en El Salvador',
    image: '../imagenes/Camisa (scrug) color  verde esmeralda.jpeg',
    gallery: [
      '../imagenes/Camisa (scrug) color  verde esmeralda.jpeg',
      '../imagenes/conjunto de uniforme médico.jpeg'
    ],
    description: 'Corte cómodo en tono Verde Esmeralda. Resistente a arrugas y a lavados frecuentes.',
    fabric: 'Tela Antifluido de Grado Médico.',
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: 'm-03',
    name: 'Filipina Azul Marino Pro',
    category: 'medicos',
    categoryLabel: 'Colección Médica',
    price: 29.00,
    badge: 'Antifluido',
    image: '../imagenes/Camisa(scrub)colorAzul.jpeg',
    gallery: [
      '../imagenes/Camisa(scrub)colorAzul.jpeg',
      '../imagenes/conjunto de uniforme médico.jpeg'
    ],
    description: 'Diseño clásico Azul Marino con tres bolsillos reforzados y costuras dobles para mayor resistencia.',
    fabric: 'Mezcla Antifluido Fresca y Respirable.',
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: 'm-04',
    name: 'Abrigo y Bata de Laboratorio',
    category: 'medicos',
    categoryLabel: 'Colección Médica',
    price: 34.00,
    badge: 'Alta Protección',
    image: '../imagenes/Abrigo médico.jpeg',
    gallery: [
      '../imagenes/Abrigo médico.jpeg',
      '../imagenes/conjunto de uniforme médico.jpeg'
    ],
    description: 'Bata clínica de presentación impecable con botones al frente y bolsillos amplios.',
    fabric: 'Tela Repelente a Manchas y Químicos.',
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: 'b-01',
    name: 'Uniforme Gris para Estética y Spa',
    category: 'belleza',
    categoryLabel: 'Salón & Estética',
    price: 45.00,
    badge: 'Especial Estética',
    image: '../imagenes/Camisa de uniforme color gris.jpeg',
    gallery: [
      '../imagenes/Camisa de uniforme color gris.jpeg',
      '../imagenes/Camisa(scrub)colorAzul.jpeg'
    ],
    description: 'Uniforme sobrio y elegante tono Gris para salones de belleza, cosmetología y spas.',
    fabric: 'Tela Repelente a Tintes de Cabello y Aceites.',
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  }
];

let products = JSON.parse(localStorage.getItem('martex_products') || '[]');
if (products.length === 0) {
  products = DEFAULT_PRODUCTS;
  localStorage.setItem('martex_products', JSON.stringify(products));
}

let activeEditingProductId = null;

// ─── INITIALIZATION ───
document.addEventListener('DOMContentLoaded', () => {
  initAdminTheme();
  updateKPIs();
  renderOrders();
  renderMedidas();
  renderAdminProducts();
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
      navBtn.classList.remove('text-[#00A896]', 'bg-[#00A896]/10', 'border-l-4', 'border-[#00A896]', 'text-white');
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

  const titles = {
    dashboard: 'Dashboard Ejecutivo & Métricas',
    medidas: 'Ficha de Medidas Anatómicas (Sastrería)',
    productos: 'Gestión del Catálogo de Productos',
    pedidos: 'Registro de Ventas & Estado de Pedidos'
  };
  const titleEl = document.getElementById('view-title');
  if (titleEl) titleEl.textContent = titles[tabId] || 'Panel de Administración';

  if (tabId === 'dashboard') updateKPIs();
  if (tabId === 'pedidos') renderOrders();
  if (tabId === 'medidas') renderMedidas();
  if (tabId === 'productos') renderAdminProducts();

  closeMobileSidebar();
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) {
    sidebar.classList.toggle('active');
    if (overlay) {
      overlay.classList.toggle('hidden', !sidebar.classList.contains('active'));
    }
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('active');
  if (overlay) overlay.classList.add('hidden');
}

// ─── DYNAMIC TAILORING MEASUREMENT FORM ───
function handleMeasurementTypeChange() {
  const select = document.getElementById('medida-tipo-prenda');
  if (!select) return;

  const value = select.value;
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
  showAdminToast(`Medidas guardadas para ${clientName}`, 'success');
}

function renderMedidas(searchQuery = '') {
  const tbody = document.getElementById('medidas-table-body');
  if (!tbody) return;

  medidas = JSON.parse(localStorage.getItem('martex_medidas') || '[]');

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
        <button onclick="viewMedidaDetail('${m.id}')" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#00A896] hover:text-white text-slate-600 dark:text-slate-300 transition-colors" title="Ver Ficha Completa">
          <svg class="w-4 h-4 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        <button onclick="deleteMedida(${index})" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-300 transition-colors" title="Eliminar Ficha">
          <svg class="w-4 h-4 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
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

  tbody.innerHTML = list.map((o) => `
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
        <button onclick="deleteOrder('${o.id}')" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-300 transition-colors" title="Eliminar Pedido">
          <svg class="w-4 h-4 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </td>
    </tr>
  `).join('');
}

function updateOrderStatus(orderId, newStatus) {
  orders = JSON.parse(localStorage.getItem('martex_orders') || '[]');
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
    orders = JSON.parse(localStorage.getItem('martex_orders') || '[]');
    orders = orders.filter(o => o.id !== orderId);
    localStorage.setItem('martex_orders', JSON.stringify(orders));
    renderOrders();
    updateKPIs();
    showAdminToast(`Pedido ${orderId} eliminado`, 'info');
  }
}

// ─── CATALOG MANAGEMENT CONTROLLER (PRODUCT CRUD) ───
function renderAdminProducts() {
  const container = document.getElementById('admin-products-container');
  if (!container) return;

  products = JSON.parse(localStorage.getItem('martex_products') || '[]');

  if (products.length === 0) {
    container.innerHTML = `<div class="col-span-full py-12 text-center text-slate-400 text-xs">No hay prendas registradas en el catálogo.</div>`;
    return;
  }

  container.innerHTML = products.map(p => `
    <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
      <div class="space-y-3">
        <div class="aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 relative">
          <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover">
          <span class="absolute top-2 left-2 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#0A111E]/80 text-[#00A896] backdrop-blur-md">
            ${p.categoryLabel}
          </span>
        </div>
        <div>
          <div class="flex justify-between items-start">
            <h4 class="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">${p.name}</h4>
            <span class="font-black font-mono text-sm text-[#00A896]">$${p.price.toFixed(2)}</span>
          </div>
          <p class="text-xs text-slate-500 line-clamp-2 mt-1">${p.description}</p>
        </div>
      </div>
      <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
        <span class="text-emerald-500 font-bold flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Activo
        </span>
        <div class="flex gap-2">
          <button onclick="openProductModal('${p.id}')" class="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-[#00A896] hover:text-white font-bold transition-colors">Editar</button>
          <button onclick="deleteProduct('${p.id}')" class="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-bold transition-colors">Eliminar</button>
        </div>
      </div>
    </div>
  `).join('');
}

function openProductModal(productId = null) {
  activeEditingProductId = productId;
  const modal = document.getElementById('product-modal');
  const title = document.getElementById('product-modal-title');
  const form = document.getElementById('product-form');

  if (!modal || !form) return;

  if (productId) {
    const p = products.find(item => item.id === productId);
    if (p) {
      if (title) title.textContent = 'Editar Prenda del Catálogo';
      form.querySelector('[name="p_name"]').value = p.name;
      form.querySelector('[name="p_category"]').value = p.category;
      form.querySelector('[name="p_price"]').value = p.price;
      form.querySelector('[name="p_badge"]').value = p.badge;
      form.querySelector('[name="p_image"]').value = p.image;
      form.querySelector('[name="p_description"]').value = p.description;
      form.querySelector('[name="p_fabric"]').value = p.fabric;
    }
  } else {
    if (title) title.textContent = 'Agregar Nueva Prenda al Catálogo';
    form.reset();
  }

  modal.classList.add('active');
}

function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.classList.remove('active');
  activeEditingProductId = null;
}

function saveProductForm(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.querySelector('[name="p_name"]').value.trim();
  const category = form.querySelector('[name="p_category"]').value;
  const price = parseFloat(form.querySelector('[name="p_price"]').value) || 0;
  const badge = form.querySelector('[name="p_badge"]').value.trim() || 'Antifluido';
  const image = form.querySelector('[name="p_image"]').value.trim() || '../imagenes/conjunto de uniforme médico.jpeg';
  const description = form.querySelector('[name="p_description"]').value.trim();
  const fabric = form.querySelector('[name="p_fabric"]').value.trim() || 'Tela Antifluido Nivel 4';

  if (!name || !price) {
    showAdminToast('Completa el nombre y el precio del producto', 'error');
    return;
  }

  products = JSON.parse(localStorage.getItem('martex_products') || '[]');

  const categoryLabel = category === 'medicos' ? 'Colección Médica' : 'Salón & Estética';

  if (activeEditingProductId) {
    const idx = products.findIndex(p => p.id === activeEditingProductId);
    if (idx > -1) {
      products[idx] = {
        ...products[idx],
        name, category, categoryLabel, price, badge, image, description, fabric
      };
      showAdminToast(`Prenda "${name}" actualizada`, 'success');
    }
  } else {
    const newP = {
      id: 'prod-' + Math.floor(1000 + Math.random() * 9000),
      name, category, categoryLabel, price, badge, image,
      gallery: [image],
      description, fabric,
      sizes: ['XS', 'S', 'M', 'L', 'XL']
    };
    products.unshift(newP);
    showAdminToast(`Nueva prenda "${name}" agregada`, 'success');
  }

  localStorage.setItem('martex_products', JSON.stringify(products));
  closeProductModal();
  renderAdminProducts();
}

function deleteProduct(productId) {
  if (confirm('¿Seguro que deseas eliminar esta prenda del catálogo?')) {
    products = JSON.parse(localStorage.getItem('martex_products') || '[]');
    products = products.filter(p => p.id !== productId);
    localStorage.setItem('martex_products', JSON.stringify(products));
    renderAdminProducts();
    showAdminToast('Prenda eliminada del catálogo', 'info');
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
    <svg class="w-4 h-4 text-[#00A896] stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>
    <span class="text-xs font-semibold">${msg}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
