// ============================================================
// MARTEX ADMIN — Products CRUD Module (Minimalist, Zero Emojis)
// ============================================================

let allAdminProducts = [];

async function loadAdminProducts() {
  try {
    allAdminProducts = await adminFetch('/productos/all');
    renderAdminProducts(allAdminProducts);
  } catch (error) {
    showToast('Error cargando catálogo de productos', 'error');
  }
}

function renderAdminProducts(products) {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;

  if (products.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="6" class="text-center py-8 text-xs text-slate-400 font-medium">No se encontraron productos registrados</td></tr>
    `;
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr class="border-b border-slate-100 dark:border-slate-800 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
      <td class="py-3.5 px-4">
        <div class="flex items-center gap-3">
          <img src="${p.imagen_url}" alt="${p.titulo}" class="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
               onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><rect fill=%22%231A1A1A%22 width=%2240%22 height=%2240%22/><text x=%2220%22 y=%2224%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2210%22>Sin Foto</text></svg>'">
          <span class="font-semibold text-slate-900 dark:text-slate-100">${p.titulo}</span>
        </div>
      </td>
      <td class="py-3.5 px-4">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          ${p.categoria === 'medico' ? 'Médico' : 'Belleza'}
        </span>
      </td>
      <td class="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">$${parseFloat(p.precio).toFixed(2)}</td>
      <td class="py-3.5 px-4">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${p.activo ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}">
          ${p.activo ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td class="py-3.5 px-4 text-slate-400">${new Date(p.fecha_creacion).toLocaleDateString('es-SV')}</td>
      <td class="py-3.5 px-4">
        <div class="flex items-center gap-2">
          <button onclick="editProduct(${p.id})" class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors" title="Editar">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
          <button onclick="toggleProductStatus(${p.id}, ${p.activo})" class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 ${p.activo ? 'text-rose-500' : 'text-emerald-500'} transition-colors" title="${p.activo ? 'Desactivar' : 'Activar'}">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openProductModal(product = null) {
  const modal = document.getElementById('product-modal');
  const title = document.getElementById('modal-title');
  const form = document.getElementById('product-form');

  if (!modal) return;

  if (product) {
    title.textContent = 'Editar Producto';
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-titulo').value = product.titulo;
    document.getElementById('product-descripcion').value = product.descripcion || '';
    document.getElementById('product-categoria').value = product.categoria;
    document.getElementById('product-precio').value = product.precio;
    document.getElementById('product-imagen').value = product.imagen_url || '';
    document.getElementById('product-activo').checked = Boolean(product.activo);
  } else {
    title.textContent = 'Nuevo Producto';
    form.reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-activo').checked = true;
  }

  modal.classList.add('active');
}

function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.classList.remove('active');
}

function editProduct(id) {
  const product = allAdminProducts.find(p => p.id === id);
  if (product) openProductModal(product);
}

async function saveProduct(e) {
  e.preventDefault();

  const id = document.getElementById('product-id').value;
  const data = {
    titulo: document.getElementById('product-titulo').value.trim(),
    descripcion: document.getElementById('product-descripcion').value.trim(),
    categoria: document.getElementById('product-categoria').value,
    precio: parseFloat(document.getElementById('product-precio').value),
    imagen_url: document.getElementById('product-imagen').value.trim(),
    activo: document.getElementById('product-activo').checked
  };

  if (!data.titulo || isNaN(data.precio)) {
    showToast('Título y precio son obligatorios', 'error');
    return;
  }

  try {
    if (id) {
      await adminFetch(`/productos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      showToast('Producto actualizado correctamente');
    } else {
      await adminFetch('/productos', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      showToast('Producto registrado exitosamente');
    }

    closeProductModal();
    loadAdminProducts();
  } catch (error) {
    showToast(error.message || 'Error guardando producto', 'error');
  }
}

async function toggleProductStatus(id, currentStatus) {
  const product = allAdminProducts.find(p => p.id === id);
  if (!product) return;

  try {
    await adminFetch(`/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...product,
        activo: !currentStatus
      })
    });

    showToast(`Estado del producto actualizado`);
    loadAdminProducts();
  } catch (error) {
    showToast('Error modificando estado', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('products-tbody')) {
    loadAdminProducts();
    const form = document.getElementById('product-form');
    if (form) form.addEventListener('submit', saveProduct);
  }
});
