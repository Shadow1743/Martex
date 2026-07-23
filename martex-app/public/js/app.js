// ============================================================
// MARTEX — Client App Logic (Landing, Catálogo, Carrito, Auth Modal)
// ============================================================

const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : '/api';

const CART_KEY = 'martex-cart';
let allProducts = [];

// ─── Toast System (No Emojis) ───
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

// ─── API Fetch Helper ───
async function apiFetch(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error en la solicitud');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ─── Shopping Cart Logic ───
function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
}

function addToCart(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const sizeSelect = document.getElementById(`size-${productId}`);
  const talla = sizeSelect ? sizeSelect.value : 'M';

  const cart = getCart();
  const cartItemId = `${product.id}-${talla}`;
  const existing = cart.find(item => item.cartItemId === cartItemId);

  if (existing) {
    existing.cantidad += 1;
  } else {
    cart.push({
      cartItemId,
      id: product.id,
      titulo: product.titulo,
      precio: parseFloat(product.precio),
      imagen_url: product.imagen_url,
      talla,
      cantidad: 1
    });
  }

  saveCart(cart);
  showToast(`${product.titulo} (Talla ${talla}) añadido al carrito`);
}

function removeFromCart(cartItemId) {
  let cart = getCart();
  cart = cart.filter(item => item.cartItemId !== cartItemId);
  saveCart(cart);
}

function updateQuantity(cartItemId, delta) {
  const cart = getCart();
  const item = cart.find(item => item.cartItemId === cartItemId);

  if (item) {
    item.cantidad += delta;
    if (item.cantidad <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    saveCart(cart);
  }
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
}

function toggleCart() {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (overlay && drawer) {
    overlay.classList.toggle('active');
    drawer.classList.toggle('active');
    document.body.style.overflow = drawer.classList.contains('active') ? 'hidden' : '';
  }
}

function closeCart() {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (overlay && drawer) {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const total = getCart().reduce((sum, item) => sum + item.cantidad, 0);
  badge.textContent = total;
  badge.style.display = total > 0 ? 'inline-flex' : 'none';
}

function renderCartDrawer() {
  const container = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total-price');

  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center text-slate-400">
        <svg class="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600 stroke-[1.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.6-7.4"/><path d="m4.5 11 4-7"/><path d="m9 11 1 9"/></svg>
        <p class="text-sm font-medium">El carrito está vacío</p>
      </div>
    `;
    if (totalEl) totalEl.textContent = '$0.00';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="flex gap-4 py-4 border-b border-slate-200 dark:border-slate-800 items-center">
      <img src="${item.imagen_url}" alt="${item.titulo}" class="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
           onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%231A1A1A%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2212%22>Sin Foto</text></svg>'">
      <div class="flex-1 min-w-0">
        <h4 class="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">${item.titulo}</h4>
        <div class="flex items-center gap-2 mt-1">
          <span class="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">Talla ${item.talla}</span>
          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">$${item.precio.toFixed(2)}</span>
        </div>
        <div class="flex items-center gap-2 mt-2">
          <button onclick="updateQuantity('${item.cartItemId}', -1)" class="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-bold transition-colors">-</button>
          <span class="text-xs font-semibold text-center">${item.cantidad}</span>
          <button onclick="updateQuantity('${item.cartItemId}', 1)" class="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-bold transition-colors">+</button>
        </div>
      </div>
      <button onclick="removeFromCart('${item.cartItemId}')" class="p-1 text-slate-400 hover:text-rose-500 transition-colors">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
      </button>
    </div>
  `).join('');

  if (totalEl) {
    totalEl.textContent = `$${getCartTotal().toFixed(2)}`;
  }
}

// ─── Catalog Products ───
async function loadCatalog(categoria = null) {
  const grid = document.getElementById('product-grid') || document.getElementById('products-grid');
  const featuredGrid = document.getElementById('featured-product-grid');
  
  if (!grid && !featuredGrid) return;

  if (grid) {
    grid.innerHTML = Array(4).fill(0).map(() => `
      <div class="h-80 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
    `).join('');
  }
  if (featuredGrid) {
    featuredGrid.innerHTML = Array(4).fill(0).map(() => `
      <div class="h-80 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
    `).join('');
  }

  try {
    let endpoint = '/productos';
    if (categoria) endpoint += `?categoria=${categoria}`;

    const products = await apiFetch(endpoint);
    allProducts = products;
    renderCatalog(products);
  } catch (error) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-16">
        <p class="text-sm font-medium text-slate-500">No se pudieron cargar los productos</p>
      </div>
    `;
  }
}

function renderCatalog(products) {
  const grid = document.getElementById('products-grid') || document.getElementById('product-grid');
  const featuredGrid = document.getElementById('featured-product-grid');
  
  if (!grid && !featuredGrid) return;

  const currentCategory = document.getElementById('category-filter') ? document.getElementById('category-filter').value : 'todos';

  let filtered = products;
  if (currentCategory && currentCategory !== 'todos') {
    filtered = products.filter(p => p.categoria === currentCategory);
  }

  const generateHTML = (items) => {
    if (items.length === 0) {
      return `<div class="col-span-full py-20 text-center text-slate-400">No se encontraron productos en esta categoría.</div>`;
    }

    return items.map(p => `
      <div class="product-card-figs group flex flex-col">
        <div class="image-wrapper w-full relative overflow-hidden rounded-md">
          <img src="${p.imagen_url}" alt="${p.titulo}" class="w-full h-full object-cover transition-transform duration-500" loading="lazy"
               onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 533%22><rect fill=%22%231A1A1A%22 width=%22400%22 height=%22533%22/><text x=%22200%22 y=%22266%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2216%22>Sin Imagen</text></svg>'">
          <span class="absolute top-3 left-3 px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-white/95 text-slate-900 shadow-sm dark:bg-slate-900/90 dark:text-emerald-400">
            ${p.categoria === 'medico' ? 'Médico' : 'Belleza'}
          </span>
          
          <div class="btn-quick-add w-full p-3 absolute bottom-0 left-0 right-0 z-10 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-lg p-2 flex gap-2 items-center shadow-xl">
               <select id="size-${p.id}" class="text-xs font-semibold px-2 py-2 rounded bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 flex-1">
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M" selected>M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                </select>
              <button onclick="addToCart(${p.id})" class="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex-1 text-center">
                Añadir
              </button>
            </div>
          </div>
        </div>

        <div class="pt-4 flex flex-col flex-1">
          <div class="flex justify-between items-start gap-2">
            <h3 class="text-[13px] font-bold text-slate-900 dark:text-white leading-tight uppercase tracking-wide">${p.titulo}</h3>
            <span class="text-sm font-bold text-emerald-600 dark:text-emerald-400">$${parseFloat(p.precio).toFixed(2)}</span>
          </div>
          <button onclick="showProductDetailModal(${p.id})" class="text-[10px] uppercase font-bold text-slate-500 hover:text-emerald-500 mt-2 text-left flex items-center gap-1 transition-colors w-fit">
            Ver Detalles <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  };

  if (grid) {
    grid.innerHTML = generateHTML(filtered);
  }
  
  if (featuredGrid) {
    featuredGrid.innerHTML = generateHTML(products.slice(0, 4));
  }
}

function filterCategory(cat) {
  document.querySelectorAll('.cat-filter-btn').forEach(btn => {
    btn.classList.remove('bg-emerald-600', 'text-white', 'border-emerald-600');
    btn.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300', 'border-slate-200', 'dark:border-slate-700');
  });

  if (event && event.currentTarget) {
    event.currentTarget.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300', 'border-slate-200', 'dark:border-slate-700');
    event.currentTarget.classList.add('bg-emerald-600', 'text-white', 'border-emerald-600');
  }

  loadCatalog(cat === 'todos' ? null : cat);
}

function showProductDetailModal(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  
  const modal = document.getElementById('product-detail-modal');
  if (modal) {
    document.getElementById('detail-title').textContent = p.titulo;
    document.getElementById('detail-desc').textContent = p.descripcion || 'Confección premium antilíquidos con tecnología avanzada.';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeProductDetailModal() {
  const modal = document.getElementById('product-detail-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ─── Auth Modal (Login / Register / Google) ───
function openAuthModal(tab = 'login') {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  switchAuthTab(tab);
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('auth-login-form');
  const regForm = document.getElementById('auth-reg-form');
  const tabLogin = document.getElementById('tab-login');
  const tabReg = document.getElementById('tab-reg');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    regForm.classList.add('hidden');
    tabLogin.classList.add('border-emerald-500', 'text-emerald-500');
    tabLogin.classList.remove('border-transparent', 'text-slate-400');
    tabReg.classList.remove('border-emerald-500', 'text-emerald-500');
    tabReg.classList.add('border-transparent', 'text-slate-400');
  } else {
    loginForm.classList.add('hidden');
    regForm.classList.remove('hidden');
    tabReg.classList.add('border-emerald-500', 'text-emerald-500');
    tabReg.classList.remove('border-transparent', 'text-slate-400');
    tabLogin.classList.remove('border-emerald-500', 'text-emerald-500');
    tabLogin.classList.add('border-transparent', 'text-slate-400');
  }
}

async function loginWithGoogleSimulation() {
  try {
    const res = await apiFetch('/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        google_id: 'google_simulated_user',
        nombre: 'Cliente Google',
        email: 'cliente.google@gmail.com'
      })
    });

    localStorage.setItem('martex-client-user', JSON.stringify(res.user));
    showToast(`Bienvenido(a), ${res.user.nombre}`);
    closeAuthModal();
    updateClientAuthUI();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function updateClientAuthUI() {
  const btn = document.getElementById('auth-btn');
  if (!btn) return;

  const user = JSON.parse(localStorage.getItem('martex-client-user') || 'null');

  if (user) {
    btn.innerHTML = `
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span class="max-w-[100px] truncate">${user.nombre.split(' ')[0]}</span>
    `;
    btn.onclick = () => {
      localStorage.removeItem('martex-client-user');
      showToast('Sesión cerrada');
      updateClientAuthUI();
    };
  } else {
    btn.innerHTML = `
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span>Acceder</span>
    `;
    btn.onclick = () => openAuthModal('login');
  }
}

// ─── Checkout Modal ───
function openCheckoutModal() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('El carrito está vacío', 'error');
    return;
  }

  const modal = document.getElementById('checkout-modal');
  if (!modal) return;

  // Render items
  const summaryEl = document.getElementById('checkout-summary-items');
  const totalEl = document.getElementById('checkout-modal-total');

  if (summaryEl) {
    summaryEl.innerHTML = cart.map(i => `
      <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
        <span>${i.titulo} (${i.talla}) × ${i.cantidad}</span>
        <span class="font-bold">$${(i.precio * i.cantidad).toFixed(2)}</span>
      </div>
    `).join('');
  }

  if (totalEl) totalEl.textContent = `$${getCartTotal().toFixed(2)}`;

  // Prefill user name if logged in
  const user = JSON.parse(localStorage.getItem('martex-client-user') || 'null');
  if (user && document.getElementById('checkout-nombre')) {
    document.getElementById('checkout-nombre').value = user.nombre;
  }

  closeCart();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();

  const nombre = document.getElementById('checkout-nombre').value.trim();
  const dui = document.getElementById('checkout-dui').value.trim();
  const direccion = document.getElementById('checkout-direccion').value.trim();
  const telefono = document.getElementById('checkout-telefono').value.trim();
  const radioChecked = document.querySelector('input[name="metodo_pago"]:checked');
  const metodo = radioChecked ? radioChecked.value : 'efectivo';

  if (!nombre || !dui || !direccion || !telefono) {
    showToast('Todos los campos obligatorios deben ser completados', 'error');
    return;
  }

  const cart = getCart();
  const user = JSON.parse(localStorage.getItem('martex-client-user') || 'null');

  try {
    const res = await apiFetch('/pedidos', {
      method: 'POST',
      body: JSON.stringify({
        usuario_id: user ? user.id : null,
        cliente_nombre: nombre,
        dui,
        direccion,
        telefono,
        metodo_pago: metodo,
        items: cart.map(i => ({ producto_id: i.id, precio: i.precio, cantidad: i.cantidad }))
      })
    });

    const savedCart = [...cart];
    
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
    closeCheckoutModal();

    showSuccessOrderModal(res.pedido_id, res.total, savedCart, metodo);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function showSuccessOrderModal(orderId, total, items, method) {
  const modal = document.getElementById('success-order-modal');
  if (modal) {
    document.getElementById('success-order-id').textContent = `#${orderId}`;
    document.getElementById('success-order-total').textContent = `$${parseFloat(total).toFixed(2)}`;
    
    const btnContainer = document.getElementById('receipt-btn-container');
    if (btnContainer && window.jspdf) {
      window.currentOrderData = { orderId, total, items, method };
      btnContainer.innerHTML = `
        <button onclick="downloadPDFReceipt()" class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors btn-glow flex items-center justify-center gap-2">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Descargar Comprobante PDF
        </button>
      `;
    }
    
    modal.classList.add('active');
  }
}

function downloadPDFReceipt() {
  const data = window.currentOrderData;
  if (!data || !window.jspdf) return;
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.setTextColor(11, 15, 25);
  doc.text("MARTEX - COMPROBANTE DE COMPRA", 20, 20);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Orden #: ${data.orderId}`, 20, 30);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 38);
  doc.text(`Método: ${data.method === 'transferencia' ? 'Transferencia Bancaria' : 'Pago contra Entrega'}`, 20, 46);
  
  doc.setTextColor(11, 15, 25);
  doc.text("Detalle de Productos:", 20, 60);
  
  let y = 70;
  doc.setTextColor(100);
  data.items.forEach(item => {
    doc.text(`- ${item.titulo} (Talla: ${item.talla}) x${item.cantidad} ... $${(item.precio * item.cantidad).toFixed(2)}`, 25, y);
    y += 8;
  });
  
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129); // Emerald 500
  doc.text(`Total Pagado: $${parseFloat(data.total).toFixed(2)}`, 20, y + 10);
  
  if (data.method === 'transferencia') {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Datos Bancarios:", 20, y + 25);
    doc.text("Banco Agrícola - Cuenta: 0000000000 - A nombre de Martex", 20, y + 32);
    doc.text("Por favor envíe este comprobante por WhatsApp para validar su pago.", 20, y + 39);
  }
  
  doc.save(`Martex_Comprobante_${data.orderId}.pdf`);
}

function closeSuccessOrderModal() {
  const modal = document.getElementById('success-order-modal');
  if (modal) modal.classList.remove('active');
}

// DUI & Phone formatting
function formatInputMask(input, pattern) {
  let val = input.value.replace(/\D/g, '');
  if (pattern === 'dui' && val.length > 8) {
    val = val.substring(0, 8) + '-' + val.substring(8, 9);
  } else if (pattern === 'phone' && val.length > 4) {
    val = val.substring(0, 4) + '-' + val.substring(4, 8);
  }
  input.value = val;
}

document.addEventListener('DOMContentLoaded', () => {
  loadCatalog();
  updateCartBadge();
  updateClientAuthUI();

  const cartOverlay = document.getElementById('cart-overlay');
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Forms
  const loginForm = document.getElementById('auth-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const res = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: document.getElementById('auth-email').value,
            password: document.getElementById('auth-pass').value
          })
        });
        localStorage.setItem('martex-client-user', JSON.stringify(res.user));
        showToast(`Sesión iniciada como ${res.user.nombre}`);
        closeAuthModal();
        updateClientAuthUI();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) checkoutForm.addEventListener('submit', handleCheckoutSubmit);

  const duiInput = document.getElementById('checkout-dui');
  if (duiInput) duiInput.addEventListener('input', () => formatInputMask(duiInput, 'dui'));

  const phoneInput = document.getElementById('checkout-telefono');
  if (phoneInput) phoneInput.addEventListener('input', () => formatInputMask(phoneInput, 'phone'));
});
