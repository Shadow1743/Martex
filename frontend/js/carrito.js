// ============================================================
// MARTEX — Shopping Cart Module (Minimalist, SVG Icons, Sizes)
// ============================================================

const CART_KEY = 'martex-cart';

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
}

function addToCart(product, talla = 'M') {
  const cart = getCart();
  const cartItemId = `${product.id}-${talla}`;
  const existing = cart.find(item => item.cartItemId === cartItemId);

  if (existing) {
    existing.cantidad += 1;
  } else {
    cart.push({
      cartItemId: cartItemId,
      id: product.id,
      titulo: product.titulo,
      precio: parseFloat(product.precio),
      imagen_url: product.imagen_url,
      talla: talla,
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
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
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

function renderCartDrawer() {
  const container = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total-price');
  const checkoutBtn = document.getElementById('cart-checkout-btn');

  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center text-slate-400">
        <svg class="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600 stroke-[1.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.6-7.4"/><path d="m4.5 11 4-7"/><path d="m9 11 1 9"/></svg>
        <p class="text-sm font-medium">El carrito está vacío</p>
        <p class="text-xs text-slate-400 mt-1">Explora nuestro catálogo e incluye prendas</p>
      </div>
    `;
    if (totalEl) totalEl.textContent = '$0.00';
    if (checkoutBtn) checkoutBtn.classList.add('hidden');
    return;
  }

  if (checkoutBtn) checkoutBtn.classList.remove('hidden');

  container.innerHTML = cart.map(item => `
    <div class="flex gap-4 py-4 border-b border-slate-200 dark:border-slate-800 items-center">
      <img src="${item.imagen_url}" alt="${item.titulo}" class="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
           onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%231A1A1A%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2212%22>Sin Foto</text></svg>'">
      
      <div class="flex-1 min-w-0">
        <h4 class="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">${item.titulo}</h4>
        <div class="flex items-center gap-2 mt-1">
          <span class="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">Talla ${item.talla}</span>
          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">$${item.precio.toFixed(2)}</span>
        </div>
        <div class="flex items-center gap-2 mt-2">
          <button onclick="updateQuantity('${item.cartItemId}', -1)" class="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-content-center text-xs font-bold transition-colors">-</button>
          <span class="text-xs font-semibold w-5 text-center">${item.cantidad}</span>
          <button onclick="updateQuantity('${item.cartItemId}', 1)" class="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-content-center text-xs font-bold transition-colors">+</button>
        </div>
      </div>

      <button onclick="removeFromCart('${item.cartItemId}')" class="p-1.5 text-slate-400 hover:text-rose-500 transition-colors" title="Eliminar">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
      </button>
    </div>
  `).join('');

  if (totalEl) {
    totalEl.textContent = `$${getCartTotal().toFixed(2)}`;
  }
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
  renderCartDrawer();
}

document.addEventListener('DOMContentLoaded', () => {
  renderCartDrawer();
  const overlay = document.getElementById('cart-overlay');
  if (overlay) overlay.addEventListener('click', closeCart);
});
