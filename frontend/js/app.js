/* ============================================================
   MARTEX — Motor Principal de la Tienda (El Salvador)
   ============================================================ */

// ─── ACCESOS OCULTOS SILENCIOSOS AL PANEL ADMINISTRADOR ───
let logoClickCount = 0;
let logoClickTimer = null;

function handleLogoClick(e) {
  logoClickCount++;
  clearTimeout(logoClickTimer);
  
  if (logoClickCount >= 5) {
    e.preventDefault();
    logoClickCount = 0;
    window.location.href = '../admin/admin.html';
    return false;
  }
  
  logoClickTimer = setTimeout(() => {
    logoClickCount = 0;
  }, 1500);
}

let copyrightClickCount = 0;
let copyrightClickTimer = null;

function handleSecretFooterClick(e) {
  e.preventDefault();
  copyrightClickCount++;
  clearTimeout(copyrightClickTimer);

  if (copyrightClickCount >= 3) {
    copyrightClickCount = 0;
    window.location.href = '../admin/admin.html';
    return;
  }

  copyrightClickTimer = setTimeout(() => {
    copyrightClickCount = 0;
  }, 1200);
}

let keySequence = '';
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
    e.preventDefault();
    window.location.href = '../admin/admin.html';
    return;
  }

  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  keySequence += e.key.toLowerCase();
  if (keySequence.length > 10) keySequence = keySequence.substring(keySequence.length - 10);
  
  if (keySequence.endsWith('admin')) {
    keySequence = '';
    window.location.href = '../admin/admin.html';
  }
});

// ─── CATÁLOGO DE PRODUCTOS MARTEX ───
const PRODUCTS = [
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
    description: 'Diseño clásico Azul Marino con tres bolsillos reinforced y costuras dobles para mayor resistencia.',
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
  },
  {
    id: 'b-02',
    name: 'Filipina Estilo Salón Gris',
    category: 'belleza',
    categoryLabel: 'Salón & Estética',
    price: 32.00,
    badge: 'Resistente a Tintes',
    image: '../imagenes/Camisa de uniforme color gris.jpeg',
    gallery: [
      '../imagenes/Camisa de uniforme color gris.jpeg',
      '../imagenes/Camisa (scrug) color  verde esmeralda.jpeg'
    ],
    description: 'Filipina entallada y cómoda para largas jornadas en salón de belleza.',
    fabric: 'Poliéster de Tacto Suave y Antifluido.',
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  }
];

let cart = JSON.parse(localStorage.getItem('martex_cart') || '[]');
let activeFilter = 'todos';
let activeQuickViewProduct = null;
let selectedSize = 'M';
let selectedQty = 1;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  
  const grid = document.getElementById('products-grid');
  if (grid && grid.dataset.pageCategory) {
    activeFilter = grid.dataset.pageCategory;
  }
  
  renderProducts();
  updateCartUI();
  initSearch();
});

function toggleMobileNav() {
  const overlay = document.getElementById('mobile-nav-overlay');
  const drawer = document.getElementById('mobile-nav-drawer');
  if (overlay && drawer) {
    overlay.classList.toggle('active');
    drawer.classList.toggle('active');
    document.body.style.overflow = drawer.classList.contains('active') ? 'hidden' : '';
  }
}

function closeMobileNav() {
  const overlay = document.getElementById('mobile-nav-overlay');
  const drawer = document.getElementById('mobile-nav-drawer');
  if (overlay && drawer) {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('martex_theme') || 'dark';
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }
  updateThemeToggleIcons(savedTheme);
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  const newTheme = isDark ? 'light' : 'dark';
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }
  localStorage.setItem('martex_theme', newTheme);
  updateThemeToggleIcons(newTheme);
}

function updateThemeToggleIcons(theme) {
  const themeBtns = document.querySelectorAll('.theme-toggle-btn');
  themeBtns.forEach(btn => {
    if (theme === 'dark') {
      btn.innerHTML = `
        <svg class="w-5 h-5 text-amber-400 stroke-[2] transition-transform hover:rotate-45 duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
        </svg>`;
    } else {
      btn.innerHTML = `
        <svg class="w-5 h-5 text-indigo-600 stroke-[2] transition-transform hover:-rotate-12 duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 3a6 6 0 0 0 9 9 9 0 1 1-9-9Z"/>
        </svg>`;
    }
  });
}

function initSearch() {
  const searchInput = document.getElementById('catalog-search-input');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    renderProducts(query);
  });
}

function filterProducts(category, btnElement) {
  activeFilter = category;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('bg-[#00A896]', 'text-white', 'shadow-md', 'shadow-[#00A896]/20');
    btn.classList.add('bg-slate-100', 'dark:bg-slate-800/80', 'text-slate-600', 'dark:text-slate-300');
  });
  if (btnElement) {
    btnElement.classList.remove('bg-slate-100', 'dark:bg-slate-800/80', 'text-slate-600', 'dark:text-slate-300');
    btnElement.classList.add('bg-[#00A896]', 'text-white', 'shadow-md', 'shadow-[#00A896]/20');
  }
  renderProducts();
}

function renderProducts(searchQuery = '') {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  let filtered = PRODUCTS;
  if (activeFilter !== 'todos') {
    filtered = filtered.filter(p => p.category === activeFilter);
  }
  if (searchQuery) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery) || p.categoryLabel.toLowerCase().includes(searchQuery));
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-400">
        <svg class="w-12 h-12 mx-auto mb-3 opacity-40 stroke-[1.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <p class="text-base font-semibold">No encontramos prendas para esta búsqueda</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(product => `
    <article class="product-card group relative flex flex-col justify-between">
      <div>
        <div class="img-container relative">
          <span class="absolute top-3 left-3 z-10 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#0A111E]/85 backdrop-blur-md text-[#00A896] border border-[#00A896]/40 shadow-sm flex items-center gap-1.5">
            <svg class="w-3 h-3 text-[#00A896] stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            ${product.badge}
          </span>
          <img src="${product.image}" alt="${product.name}" loading="lazy" class="w-full h-full object-cover">
          <button onclick="openQuickView('${product.id}')" class="absolute inset-0 bg-[#0A111E]/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 text-white font-bold text-xs tracking-wide">
            <svg class="w-5 h-5 text-[#00A896] stroke-[2.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            Ver detalle completo
          </button>
        </div>
        <div class="p-5">
          <div class="text-[11px] font-bold text-[#00A896] uppercase tracking-wider mb-1 flex items-center gap-1">
            <svg class="w-3.5 h-3.5 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.38 3.46 16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z"/></svg>
            ${product.categoryLabel}
          </div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white line-clamp-1 mb-2 group-hover:text-[#00A896] transition-colors">${product.name}</h3>
          <div class="flex items-baseline justify-between mt-3">
            <div class="text-lg font-extrabold text-slate-900 dark:text-white font-mono">$${product.price.toFixed(2)}</div>
            <div class="text-[11px] text-slate-500 font-medium">Tallas: ${product.sizes.join(', ')}</div>
          </div>
        </div>
      </div>
      <div class="px-5 pb-5 pt-0">
        <button onclick="openQuickView('${product.id}')" class="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#00A896] hover:text-white dark:hover:bg-[#00A896] text-slate-800 dark:text-slate-200 text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2">
          <span>Ver Detalle / Comprar</span>
          <svg class="w-4 h-4 stroke-[2.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </div>
    </article>
  `).join('');
}

function openQuickView(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  activeQuickViewProduct = product;
  selectedSize = product.sizes[0] || 'M';
  selectedQty = 1;

  const modal = document.getElementById('quickview-modal');
  const dialog = document.getElementById('quickview-dialog');
  if (!modal || !dialog) return;

  dialog.innerHTML = `
    <div class="relative p-6 sm:p-8">
      <button onclick="closeQuickView()" class="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
        <svg class="w-5 h-5 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div class="space-y-4">
          <div class="aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 relative group">
            <img id="qv-main-img" src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            <span class="absolute top-4 left-4 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-[#0A111E]/80 text-[#00A896] border border-[#00A896]/30 backdrop-blur-md flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              ${product.badge}
            </span>
          </div>
          <div class="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            ${product.gallery.map((imgUrl, i) => `
              <button onclick="swapQvImage('${imgUrl}', this)" class="qv-thumb-btn flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden border-2 ${i === 0 ? 'border-[#00A896]' : 'border-transparent'} transition-all opacity-80 hover:opacity-100">
                <img src="${imgUrl}" class="w-full h-full object-cover">
              </button>
            `).join('')}
          </div>
        </div>

        <div class="space-y-6">
          <div>
            <div class="text-xs font-bold text-[#00A896] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <svg class="w-4 h-4 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.38 3.46 16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z"/></svg>
              ${product.categoryLabel}
            </div>
            <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight mb-2">${product.name}</h2>
            <div class="text-2xl font-black text-slate-900 dark:text-white font-mono">$${product.price.toFixed(2)}</div>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div class="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
              <svg class="w-4 h-4 text-[#00A896] stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Telas Antifluido Nivel 4 (Hecho en El Salvador)
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${product.description}</p>
            <div class="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-200 dark:border-slate-700/60">
              <strong class="text-slate-700 dark:text-slate-300">Material:</strong> ${product.fabric}
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Elegir Talla: <span id="qv-selected-size-label" class="text-[#00A896] font-mono">${selectedSize}</span>
            </label>
            <div class="flex flex-wrap gap-2.5">
              ${product.sizes.map(sz => `
                <button onclick="selectQvSize('${sz}', this)" class="size-pill ${sz === selectedSize ? 'active' : ''}">${sz}</button>
              `).join('')}
            </div>
          </div>

          <div class="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div class="flex items-center gap-4">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Cantidad:</span>
              <div class="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <button onclick="adjustQvQty(-1)" class="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold">-</button>
                <span id="qv-qty-val" class="px-4 text-xs font-bold text-slate-900 dark:text-white font-mono">1</span>
                <button onclick="adjustQvQty(1)" class="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold">+</button>
              </div>
            </div>

            <button onclick="addQvToCart()" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00A896] to-teal-500 hover:from-[#009284] hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-[#00A896]/25 hover:shadow-[#00A896]/40 transition-all duration-300 flex items-center justify-center gap-3">
              <svg class="w-5 h-5 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.6-7.4"/><path d="m4.5 11 4-7"/><path d="m9 11 1 9"/></svg>
              <span>Agregar al Carrito de Compras</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  const modal = document.getElementById('quickview-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function swapQvImage(url, btnEl) {
  const mainImg = document.getElementById('qv-main-img');
  if (mainImg) mainImg.src = url;
  document.querySelectorAll('.qv-thumb-btn').forEach(b => {
    b.classList.remove('border-[#00A896]');
    b.classList.add('border-transparent');
  });
  if (btnEl) {
    btnEl.classList.remove('border-transparent');
    btnEl.classList.add('border-[#00A896]');
  }
}

function selectQvSize(sz, btnEl) {
  selectedSize = sz;
  const label = document.getElementById('qv-selected-size-label');
  if (label) label.textContent = sz;
  document.querySelectorAll('.size-pill').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
}

function adjustQvQty(delta) {
  selectedQty = Math.max(1, selectedQty + delta);
  const qtyVal = document.getElementById('qv-qty-val');
  if (qtyVal) qtyVal.textContent = selectedQty;
}

function addQvToCart() {
  if (!activeQuickViewProduct) return;
  addToCart(activeQuickViewProduct.id, selectedSize, selectedQty);
  closeQuickView();
}

function addToCart(productId, size = 'M', qty = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existingIdx = cart.findIndex(item => item.id === productId && item.size === size);
  if (existingIdx > -1) {
    cart[existingIdx].qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: size,
      qty: qty
    });
  }

  saveCart();
  updateCartUI();
  openCartDrawer();
  showToast(`"${product.name}" agregado al carrito`, 'success');
}

function updateCartQty(index, delta) {
  if (cart[index]) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
    saveCart();
    updateCartUI();
  }
}

function removeFromCart(index) {
  if (cart[index]) {
    const item = cart[index];
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    showToast(`Eliminado: ${item.name}`, 'info');
  }
}

function saveCart() {
  localStorage.setItem('martex_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const totalCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(b => {
    b.textContent = totalCount;
    b.style.display = totalCount > 0 ? 'inline-flex' : 'none';
  });

  const drawerList = document.getElementById('cart-drawer-list');
  const drawerSubtotal = document.getElementById('cart-drawer-subtotal');
  const drawerTotal = document.getElementById('cart-drawer-total');

  if (drawerSubtotal) drawerSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  if (drawerTotal) drawerTotal.textContent = `$${subtotal.toFixed(2)}`;

  if (drawerList) {
    if (cart.length === 0) {
      drawerList.innerHTML = `
        <div class="py-20 text-center text-slate-400 space-y-3">
          <svg class="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 stroke-[1.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          <p class="text-sm font-semibold">Tu carrito de compras está vacío</p>
          <button onclick="closeCartDrawer()" class="text-xs text-[#00A896] hover:underline font-bold">Ver catálogo de prendas</button>
        </div>`;
    } else {
      drawerList.innerHTML = cart.map((item, i) => `
        <div class="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 relative group">
          <img src="${item.image}" alt="${item.name}" class="w-16 h-20 object-cover rounded-lg bg-slate-200 dark:bg-slate-700">
          <div class="flex-1 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start">
                <h4 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 pr-4">${item.name}</h4>
                <button onclick="removeFromCart(${i})" class="text-slate-400 hover:text-rose-500 transition-colors p-0.5">
                  <svg class="w-4 h-4 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
              <div class="text-[11px] font-semibold text-[#00A896]">Talla: ${item.size}</div>
            </div>
            <div class="flex items-center justify-between mt-2">
              <div class="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                <button onclick="updateCartQty(${i}, -1)" class="px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-bold">-</button>
                <span class="px-2.5 text-xs font-bold font-mono text-slate-900 dark:text-white">${item.qty}</span>
                <button onclick="updateCartQty(${i}, 1)" class="px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-bold">+</button>
              </div>
              <span class="text-xs font-extrabold font-mono text-slate-900 dark:text-white">$${(item.price * item.qty).toFixed(2)}</span>
            </div>
          </div>
        </div>
      `).join('');
    }
  }
}

function openCartDrawer() {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (overlay && drawer) {
    overlay.classList.add('active');
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (overlay && drawer) {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function openCheckoutModal() {
  if (cart.length === 0) {
    showToast('Agrega al menos una prenda al carrito', 'error');
    return;
  }
  closeCartDrawer();
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function submitOrder(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.querySelector('[name="client_name"]').value.trim();
  const dui = form.querySelector('[name="client_dui"]').value.trim();
  const phone = form.querySelector('[name="client_phone"]').value.trim();
  const address = form.querySelector('[name="client_address"]').value.trim();
  const payment = form.querySelector('[name="payment_method"]').value;

  if (!name || !dui || !phone || !address) {
    showToast('Por favor llena todos los datos del pedido', 'error');
    return;
  }

  const orderTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const newOrder = {
    id: 'MX-' + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toISOString(),
    clientName: name,
    dui: dui,
    phone: phone,
    address: address,
    paymentMethod: payment === 'efectivo' ? 'Efectivo contra entrega' : 'Transferencia bancaria',
    items: [...cart],
    total: orderTotal,
    status: 'Pendiente'
  };

  const existingOrders = JSON.parse(localStorage.getItem('martex_orders') || '[]');
  existingOrders.unshift(newOrder);
  localStorage.setItem('martex_orders', JSON.stringify(existingOrders));

  cart = [];
  saveCart();
  updateCartUI();

  closeCheckoutModal();
  showOrderSuccessModal(newOrder);
}

function showOrderSuccessModal(order) {
  const modal = document.getElementById('order-success-modal');
  const details = document.getElementById('order-success-details');
  if (!modal || !details) return;

  details.innerHTML = `
    <div class="text-center space-y-3">
      <div class="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#00A896] flex items-center justify-center mx-auto">
        <svg class="w-8 h-8 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h3 class="text-xl font-extrabold text-slate-900 dark:text-white">¡Pedido Registrado!</h3>
      <p class="text-xs text-slate-500">Orden <strong class="text-[#00A896] font-mono">#${order.id}</strong> realizada con éxito.</p>
    </div>

    <div class="my-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2 text-slate-700 dark:text-slate-300">
      <div class="flex justify-between"><span class="text-slate-400">Cliente:</span> <strong>${order.clientName}</strong></div>
      <div class="flex justify-between"><span class="text-slate-400">DUI:</span> <strong class="font-mono">${order.dui}</strong></div>
      <div class="flex justify-between"><span class="text-slate-400">Teléfono:</span> <strong>${order.phone}</strong></div>
      <div class="flex justify-between"><span class="text-slate-400">Forma de Pago:</span> <strong class="text-[#00A896]">${order.paymentMethod}</strong></div>
      <div class="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2"><span class="text-slate-400">Total:</span> <strong class="text-base font-extrabold font-mono text-slate-900 dark:text-white">$${order.total.toFixed(2)}</strong></div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeOrderSuccessModal() {
  const modal = document.getElementById('order-success-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function openAuthModal(mode = 'login') {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    switchAuthTab(mode);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('auth-login-form');
  const registerForm = document.getElementById('auth-register-form');
  const tabLoginBtn = document.getElementById('tab-btn-login');
  const tabRegisterBtn = document.getElementById('tab-btn-register');

  if (tab === 'login') {
    if (loginForm) loginForm.classList.remove('hidden');
    if (registerForm) registerForm.classList.add('hidden');
    if (tabLoginBtn) tabLoginBtn.className = 'flex-1 py-2.5 text-xs font-bold border-b-2 border-[#00A896] text-[#00A896]';
    if (tabRegisterBtn) tabRegisterBtn.className = 'flex-1 py-2.5 text-xs font-semibold text-slate-400 hover:text-white border-b-2 border-transparent';
  } else {
    if (loginForm) loginForm.classList.add('hidden');
    if (registerForm) registerForm.classList.remove('hidden');
    if (tabRegisterBtn) tabRegisterBtn.className = 'flex-1 py-2.5 text-xs font-bold border-b-2 border-[#00A896] text-[#00A896]';
    if (tabLoginBtn) tabLoginBtn.className = 'flex-1 py-2.5 text-xs font-semibold text-slate-400 hover:text-white border-b-2 border-transparent';
  }
}

function simulateGoogleAuth() {
  showToast('Entrando con tu cuenta de Google...', 'info');
  setTimeout(() => {
    closeAuthModal();
    showToast('¡Bienvenido a Martex!', 'success');
  }, 1000);
}

function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'border-left-rose-500' : ''}`;
  
  const icon = type === 'success' ? `
    <svg class="w-5 h-5 text-[#00A896] stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>
  ` : type === 'error' ? `
    <svg class="w-5 h-5 text-rose-500 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
  ` : `
    <svg class="w-5 h-5 text-sky-400 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
  `;

  toast.innerHTML = `
    ${icon}
    <span class="text-slate-800 dark:text-slate-100 text-xs font-semibold">${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
