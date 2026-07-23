// ============================================================
// MARTEX — Checkout Module (Minimalist, No Emojis, Clean SVG)
// ============================================================

function loadCheckoutSummary() {
  const container = document.getElementById('checkout-items');
  const totalEl = document.getElementById('checkout-total');
  const submitBtn = document.getElementById('checkout-submit');

  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">No hay prendas seleccionadas</p>`;
    if (submitBtn) submitBtn.disabled = true;
    if (totalEl) totalEl.textContent = '$0.00';
    return;
  }

  if (submitBtn) submitBtn.disabled = false;

  container.innerHTML = cart.map(item => `
    <div class="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800 text-xs">
      <div>
        <span class="font-medium text-slate-800 dark:text-slate-200">${item.titulo}</span>
        <span class="ml-1 text-slate-400 font-mono">(Talla ${item.talla}) × ${item.cantidad}</span>
      </div>
      <span class="font-semibold text-slate-900 dark:text-slate-100">$${(item.precio * item.cantidad).toFixed(2)}</span>
    </div>
  `).join('');

  if (totalEl) {
    totalEl.textContent = `$${getCartTotal().toFixed(2)}`;
  }
}

function initPaymentToggle() {
  const radios = document.querySelectorAll('input[name="metodo_pago"]');
  const bankDetails = document.getElementById('bank-details');

  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'transferencia' && bankDetails) {
        bankDetails.classList.remove('hidden');
      } else if (bankDetails) {
        bankDetails.classList.add('hidden');
      }
    });
  });
}

function validateCheckoutForm() {
  const nombre = document.getElementById('cliente_nombre').value.trim();
  const dui = document.getElementById('dui').value.trim();
  const direccion = document.getElementById('direccion').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const metodo = document.querySelector('input[name="metodo_pago"]:checked');

  if (!nombre) {
    showToast('Por favor ingrese su nombre completo', 'error');
    document.getElementById('cliente_nombre').focus();
    return null;
  }

  if (!dui || dui.length < 9) {
    showToast('Por favor ingrese un DUI válido (00000000-0)', 'error');
    document.getElementById('dui').focus();
    return null;
  }

  if (!direccion) {
    showToast('Por favor ingrese su dirección de entrega', 'error');
    document.getElementById('direccion').focus();
    return null;
  }

  if (!telefono || telefono.length < 8) {
    showToast('Por favor ingrese un número de teléfono válido', 'error');
    document.getElementById('telefono').focus();
    return null;
  }

  if (!metodo) {
    showToast('Seleccione un método de pago', 'error');
    return null;
  }

  return {
    cliente_nombre: nombre,
    dui: dui,
    direccion: direccion,
    telefono: telefono,
    metodo_pago: metodo.value
  };
}

async function submitOrder(e) {
  e.preventDefault();

  const formData = validateCheckoutForm();
  if (!formData) return;

  const cart = getCart();
  if (cart.length === 0) {
    showToast('El carrito está vacío', 'error');
    return;
  }

  const submitBtn = document.getElementById('checkout-submit');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span>Procesando pedido...</span>`;

  try {
    const user = JSON.parse(localStorage.getItem('martex-client-user') || 'null');
    const orderData = {
      usuario_id: user ? user.id : null,
      ...formData,
      items: cart.map(item => ({
        producto_id: item.id,
        precio: item.precio,
        cantidad: item.cantidad
      }))
    };

    const result = await apiFetch('/pedidos', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });

    clearCart();
    showSuccessModal(result.pedido_id, result.total);

  } catch (error) {
    showToast(error.message || 'Error al procesar el pedido', 'error');
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

function showSuccessModal(orderId, total) {
  const modal = document.getElementById('success-modal');
  if (modal) {
    document.getElementById('order-id-display').textContent = `#${orderId}`;
    document.getElementById('order-total-display').textContent = `$${parseFloat(total).toFixed(2)}`;
    modal.classList.add('active');
  }
}

function closeSuccessModal() {
  const modal = document.getElementById('success-modal');
  if (modal) {
    modal.classList.remove('active');
    window.location.href = 'catalogo.html';
  }
}

function formatDUI(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 8) {
    value = value.substring(0, 8) + '-' + value.substring(8, 9);
  }
  input.value = value;
}

function formatPhone(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length > 4) {
    value = value.substring(0, 4) + '-' + value.substring(4, 8);
  }
  input.value = value;
}

document.addEventListener('DOMContentLoaded', () => {
  loadCheckoutSummary();
  initPaymentToggle();

  // Prefill logged user if available
  const user = JSON.parse(localStorage.getItem('martex-client-user') || 'null');
  if (user && document.getElementById('cliente_nombre')) {
    document.getElementById('cliente_nombre').value = user.nombre;
  }

  const form = document.getElementById('checkout-form');
  if (form) {
    form.addEventListener('submit', submitOrder);
  }

  const duiInput = document.getElementById('dui');
  if (duiInput) {
    duiInput.addEventListener('input', () => formatDUI(duiInput));
  }

  const telInput = document.getElementById('telefono');
  if (telInput) {
    telInput.addEventListener('input', () => formatPhone(telInput));
  }
});
