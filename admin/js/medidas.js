// ============================================================
// MARTEX ADMIN — Tailoring Measurement Module (Filipina & Pantalón)
// Supports 15 specialized tailoring parameters
// ============================================================

async function loadMedidas() {
  try {
    const medidas = await adminFetch('/medidas');
    renderMedidas(medidas);
  } catch (error) {
    showToast('Error cargando la lista de medidas', 'error');
  }
}

function renderMedidas(medidas) {
  const tbody = document.getElementById('medidas-tbody');
  if (!tbody) return;

  if (medidas.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="8" class="text-center py-8 text-xs text-slate-400 font-medium">No hay registros de medidas guardados</td></tr>
    `;
    return;
  }

  tbody.innerHTML = medidas.map(m => {
    const typeLabel = m.tipo_prenda === 'filipina' ? 'Filipina / Gabacha' :
                      m.tipo_prenda === 'pantalon' ? 'Pantalón' : 'Filipina y Pantalón';

    // Format measurements summary
    let filipinaSummary = '';
    if (m.tipo_prenda === 'filipina' || m.tipo_prenda === 'ambos') {
      filipinaSummary = `Hombro: ${m.hombro || '-'} cm | Busto: ${m.busto || '-'} cm | Cintura Top: ${m.cintura_top || '-'} cm | Cadera Top: ${m.cadera_top || '-'} cm | Largo Cintura: ${m.largo_cintura || '-'} cm | Manga: ${m.manga_largo || '-'} cm | Brazo: ${m.grosor_brazo || '-'} cm | Largo Top: ${m.largo_total_top || '-'} cm`;
    }

    let pantalonSummary = '';
    if (m.tipo_prenda === 'pantalon' || m.tipo_prenda === 'ambos') {
      pantalonSummary = `Cintura Pant: ${m.cintura_pant || '-'} cm | Cadera Pant: ${m.cadera_pant || '-'} cm | Rodilla: ${m.largo_rodilla || '-'} cm | Largo Pant: ${m.largo_total_pant || '-'} cm | Muslo: ${m.grosor_muslo || '-'} cm | Tiro: ${m.tiro || '-'} cm | Grosor Rodilla: ${m.grosor_rodilla || '-'} cm`;
    }

    return `
      <tr class="border-b border-slate-100 dark:border-slate-800 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
        <td class="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">${m.cliente_nombre}</td>
        <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">${m.telefono || 'Sin registro'}</td>
        <td class="py-3.5 px-4">
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400">
            ${typeLabel}
          </span>
        </td>
        <td class="py-3.5 px-4 text-[11px] text-slate-600 dark:text-slate-300 max-w-xs">
          ${filipinaSummary ? `<div class="font-medium text-slate-700 dark:text-slate-200">${filipinaSummary}</div>` : ''}
          ${pantalonSummary ? `<div class="font-medium text-slate-700 dark:text-slate-200 mt-1">${pantalonSummary}</div>` : ''}
        </td>
        <td class="py-3.5 px-4 text-slate-400 max-w-[120px] truncate">${m.notas || '—'}</td>
        <td class="py-3.5 px-4 text-slate-400">${new Date(m.fecha).toLocaleDateString('es-SV')}</td>
        <td class="py-3.5 px-4">
          <button onclick="deleteMedida(${m.id})" class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 transition-colors" title="Eliminar">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function updateMedidaFields() {
  const tipo = document.getElementById('medida-tipo').value;
  const filipinaSection = document.getElementById('filipina-fields-section');
  const pantalonSection = document.getElementById('pantalon-fields-section');

  if (filipinaSection && pantalonSection) {
    if (tipo === 'filipina') {
      filipinaSection.classList.remove('hidden');
      pantalonSection.classList.add('hidden');
    } else if (tipo === 'pantalon') {
      filipinaSection.classList.add('hidden');
      pantalonSection.classList.remove('hidden');
    } else if (tipo === 'ambos') {
      filipinaSection.classList.remove('hidden');
      pantalonSection.classList.remove('hidden');
    } else {
      filipinaSection.classList.add('hidden');
      pantalonSection.classList.add('hidden');
    }
  }
}

async function saveMedida(e) {
  e.preventDefault();

  const tipo = document.getElementById('medida-tipo').value;
  const nombre = document.getElementById('medida-nombre').value.trim();
  const telefono = document.getElementById('medida-telefono').value.trim();

  if (!nombre || !tipo) {
    showToast('El nombre del cliente y el tipo de prenda son obligatorios', 'error');
    return;
  }

  const data = {
    cliente_nombre: nombre,
    telefono: telefono,
    tipo_prenda: tipo,
    
    // Filipina
    hombro: document.getElementById('m-hombro')?.value || null,
    busto: document.getElementById('m-busto')?.value || null,
    cintura_top: document.getElementById('m-cintura-top')?.value || null,
    cadera_top: document.getElementById('m-cadera-top')?.value || null,
    largo_cintura: document.getElementById('m-largo-cintura')?.value || null,
    manga_largo: document.getElementById('m-manga-largo')?.value || null,
    grosor_brazo: document.getElementById('m-grosor-brazo')?.value || null,
    largo_total_top: document.getElementById('m-largo-total-top')?.value || null,
    
    // Pantalón
    cintura_pant: document.getElementById('m-cintura-pant')?.value || null,
    cadera_pant: document.getElementById('m-cadera-pant')?.value || null,
    largo_rodilla: document.getElementById('m-largo-rodilla')?.value || null,
    largo_total_pant: document.getElementById('m-largo-total-pant')?.value || null,
    grosor_muslo: document.getElementById('m-grosor-muslo')?.value || null,
    tiro: document.getElementById('m-tiro')?.value || null,
    grosor_rodilla: document.getElementById('m-grosor-rodilla')?.value || null,
    
    notas: document.getElementById('medida-notas')?.value.trim() || ''
  };

  try {
    await adminFetch('/medidas', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    showToast('Ficha de medidas registrada exitosamente');
    document.getElementById('medida-form').reset();
    updateMedidaFields();
    loadMedidas();
  } catch (error) {
    showToast(error.message || 'Error guardando registro de medidas', 'error');
  }
}

async function deleteMedida(id) {
  if (!confirm('¿Desea eliminar este registro de medidas?')) return;

  try {
    await adminFetch(`/medidas/${id}`, { method: 'DELETE' });
    showToast('Registro de medidas eliminado');
    loadMedidas();
  } catch (error) {
    showToast('Error eliminando registro', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('medidas-tbody')) {
    loadMedidas();

    const form = document.getElementById('medida-form');
    if (form) form.addEventListener('submit', saveMedida);

    const tipoSelect = document.getElementById('medida-tipo');
    if (tipoSelect) {
      tipoSelect.addEventListener('change', updateMedidaFields);
      updateMedidaFields();
    }
  }
});
