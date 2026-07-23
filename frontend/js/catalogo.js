// ============================================================
// MARTEX — Catalog Module (Minimalist, Sizes, SVG Icons)
// ============================================================

let allProducts = [];

async function loadProducts(categoria = null) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  grid.innerHTML = Array(4).fill(0).map(() => `
    <div class="skeleton h-[380px]"></div>
  `).join('');

  try {
    let endpoint = '/productos';
    if (categoria) {
      endpoint += `?categoria=${categoria}`;
    }

    const products = await apiFetch(endpoint);
    allProducts = products;
    renderProducts(products);
  } catch (error) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-16">
        <svg class="w-12 h-12 text-slate-400 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
        <p class="text-sm font-medium text-slate-600 dark:text-slate-400">No se pudieron cargar los productos</p>
        <button class="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors" onclick="loadProducts()">Reintentar</button>
      </div>
    `;
  }
}

function renderProducts(products) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-16">
        <svg class="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/></svg>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400">No se encontraron prendas en esta categoría</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(product => {
    const isMedico = product.categoria === 'medico';
    const categoryLabel = isMedico ? 'Medico' : 'Belleza';

    return `
      <div class="glass-card glass-card-hover overflow-hidden flex flex-col group border border-slate-200/80 dark:border-white/[0.06]">
        <div class="relative overflow-hidden bg-slate-100 dark:bg-slate-900 aspect-[4/3]">
          <img src="${product.imagen_url}" alt="${product.titulo}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"
               onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22><rect fill=%22%230B0F19%22 width=%22400%22 height=%22300%22/><text x=%22200%22 y=%22150%22 text-anchor=%22middle%22 fill=%22%23555%22 font-size=%2216%22 font-family=%22sans-serif%22>Sin Imagen</text></svg>'">
          <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0B0F19]/80 text-[#00A896] backdrop-blur-md border border-[#00A896]/20">
            ${categoryLabel}
          </span>
        </div>

        <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#00A896] transition-colors">${product.titulo}</h3>
            <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-500 mt-1 sm:mt-1.5 line-clamp-2">${product.descripcion || ''}</p>
          </div>

          <div class="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100 dark:border-white/5">
            <div class="flex items-center justify-between mb-2.5 sm:mb-3">
              <span class="text-[10px] sm:text-xs text-slate-400 font-medium">Talla</span>
              <select id="size-${product.id}" class="text-[10px] sm:text-xs font-semibold px-2 py-1 rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#00A896]">
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M" selected>M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">$${parseFloat(product.precio).toFixed(2)}</span>
              <button onclick="handleAddToCart(${product.id})" class="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-[#00A896] to-teal-400 hover:from-[#009284] hover:to-teal-300 text-white text-[11px] sm:text-xs font-semibold transition-all shadow-sm shadow-[#00A896]/20 hover:shadow-[#00A896]/40 hover:-translate-y-0.5">
                <svg class="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.6-7.4"/><path d="m4.5 11 4-7"/><path d="m9 11 1 9"/></svg>
                <span>Anadir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function handleAddToCart(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const sizeSelect = document.getElementById(`size-${productId}`);
  const selectedSize = sizeSelect ? sizeSelect.value : 'M';

  addToCart(product, selectedSize);
}

function filterProducts(categoria) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('bg-gradient-to-r', 'from-[#00A896]', 'to-teal-400', 'text-white', 'border-[#00A896]', 'shadow-md', 'shadow-[#00A896]/20');
    btn.classList.add('bg-slate-50', 'dark:bg-white/[0.03]', 'text-slate-600', 'dark:text-slate-400', 'border-slate-200', 'dark:border-white/10');
  });

  if (event && event.currentTarget) {
    event.currentTarget.classList.remove('bg-slate-50', 'dark:bg-white/[0.03]', 'text-slate-600', 'dark:text-slate-400', 'border-slate-200', 'dark:border-white/10');
    event.currentTarget.classList.add('bg-gradient-to-r', 'from-[#00A896]', 'to-teal-400', 'text-white', 'border-[#00A896]', 'shadow-md', 'shadow-[#00A896]/20');
  }

  if (categoria === 'todos') {
    loadProducts();
  } else {
    loadProducts(categoria);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('products-grid')) {
    loadProducts();
  }
});
