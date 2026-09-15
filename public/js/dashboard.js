const token = sessionStorage.getItem('jwt');
const tableBody = document.querySelector('#personasTableBody');
const desde = document.querySelector('#desde');
const hasta = document.querySelector('#hasta');
const codigoPostal = document.querySelector('#codigoPostal');
const reconciliacion = document.querySelector('#reconciliacion');
const aceptarCristo = document.querySelector('#aceptarCristo');
const iglesia = document.querySelector('#iglesia');
const voluntario = document.querySelector('#voluntario');
const estado = document.querySelector('#estado');
const mensaje = document.querySelector('#mensaje');
const userLabel = document.querySelector('#userLabel');
const exportBtn = document.querySelector('#exportBtn');
const logoutBtn = document.querySelector('#logoutBtn');
const applyFiltersBtn = document.querySelector('#applyFiltersBtn');
const shareLink = document.querySelector('#shareLink');
const copyLinkBtn = document.querySelector('#copyLinkBtn');
const estadoModal = document.querySelector('#estadoModal');
const closeEstadoModalBtn = document.querySelector('#closeEstadoModalBtn');
const estadoForm = document.querySelector('#estadoForm');
const estadoPersonaId = document.querySelector('#estadoPersonaId');
const nuevoEstado = document.querySelector('#nuevoEstado');
const notaEstado = document.querySelector('#notaEstado');
const estadoHistorial = document.querySelector('#estadoHistorial');
const estadoMensaje = document.querySelector('#estadoMensaje');

const estadosProgresivos = window.__APP_CONFIG__?.estadosProgresivos || [];
const estadosEspeciales = window.__APP_CONFIG__?.estadosEspeciales || [];

const shareUrl = window.__APP_CONFIG__?.registrationUrl || `${window.location.origin}/registro.html`;
shareLink.textContent = shareUrl;

copyLinkBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(shareUrl);
    mensaje.textContent = 'Link copiado.';
  } catch (error) {
    mensaje.textContent = 'No se pudo copiar el link automáticamente.';
  }
});

function parseJwt(tokenValue) {
  try {
    const payload = tokenValue.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[character]));
}

function addEstadoOptions(select, includeAll = false) {
  select.innerHTML = includeAll ? '<option value="">Todos</option>' : '';

  const progressiveGroup = document.createElement('optgroup');
  progressiveGroup.label = 'Estados progresivos';
  estadosProgresivos.forEach((value) => progressiveGroup.appendChild(new Option(value, value)));
  select.appendChild(progressiveGroup);

  const specialGroup = document.createElement('optgroup');
  specialGroup.label = 'Categorías especiales';
  estadosEspeciales.forEach((value) => specialGroup.appendChild(new Option(value, value)));
  select.appendChild(specialGroup);
}

addEstadoOptions(estado, true);
addEstadoOptions(nuevoEstado);

function renderRows(rows) {
  if (!rows.length) {
    tableBody.innerHTML = '<tr><td colspan="12">No hay registros para los filtros seleccionados.</td></tr>';
    return;
  }

  tableBody.innerHTML = rows.map((row) => `
    <tr>
      <td>${escapeHtml(row.nombre_completo)}</td>
      <td>${escapeHtml(row.correo)}</td>
      <td>${escapeHtml(row.telefono || '-')}</td>
      <td>${escapeHtml(row.codigo_postal)}</td>
      <td>${escapeHtml(row.edad)}</td>
      <td>${escapeHtml(row.evento_descripcion || '-')}</td>
      <td>${escapeHtml(row.iglesia || '-')}</td>
      <td>${escapeHtml(row.voluntario || '-')}</td>
      <td>${row.reconciliacion ? '✓' : ''}</td>
      <td>${row.aceptar_cristo ? '✓' : ''}</td>
      <td><button type="button" class="status-btn" data-persona-id="${row.id}" data-persona-nombre="${escapeHtml(row.nombre_completo)}" data-estado-actual="${escapeHtml(row.estado_actual || 'Sin estado')}">${escapeHtml(row.estado_actual || 'Sin estado')}</button></td>
      <td>${escapeHtml(new Date(row.fecha_registro).toLocaleString('es-MX'))}</td>
    </tr>
  `).join('');
}

function buildPersonasParams() {
  const params = new URLSearchParams();
  if (desde.value) params.set('desde', desde.value);
  if (hasta.value) params.set('hasta', hasta.value);
  if (codigoPostal.value) params.set('codigo_postal', codigoPostal.value);
  if (reconciliacion.value) params.set('reconciliacion', reconciliacion.value);
  if (aceptarCristo.value) params.set('aceptar_cristo', aceptarCristo.value);
  if (iglesia.value) params.set('iglesia', iglesia.value);
  if (voluntario.value) params.set('voluntario', voluntario.value);
  if (estado.value) params.set('estado', estado.value);
  return params;
}

function formatHistoryDate(value) {
  return new Date(value).toLocaleString('es-MX');
}

async function loadEstadoHistorial(personaId) {
  estadoHistorial.innerHTML = '<p class="history-empty">Cargando historial...</p>';

  const response = await fetch(`/api/personas/${personaId}/historial`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo cargar el historial.');
  }

  if (!data.length) {
    estadoHistorial.innerHTML = '<p class="history-empty">Todavía no hay cambios de estado.</p>';
    return;
  }

  estadoHistorial.innerHTML = data.map((item) => `
    <article class="history-item">
      <div class="history-item-topline">
        <strong>${escapeHtml(item.estado)}</strong>
        <time datetime="${escapeHtml(item.fecha_cambio)}">${escapeHtml(formatHistoryDate(item.fecha_cambio))}</time>
      </div>
      ${item.nota ? `<p>${escapeHtml(item.nota)}</p>` : ''}
    </article>
  `).join('');
}

async function openEstadoModal(personaId, personaNombre, currentEstado) {
  estadoPersonaId.value = personaId;
  estadoModal.hidden = false;
  document.body.classList.add('modal-open');
  document.querySelector('#estadoModalTitle').textContent = `Estado de ${personaNombre}`;
  estadoMensaje.textContent = '';
  notaEstado.value = '';
  nuevoEstado.value = currentEstado === 'Sin estado' ? '' : currentEstado;

  try {
    await loadEstadoHistorial(personaId);
  } catch (error) {
    estadoHistorial.innerHTML = '';
    estadoMensaje.textContent = error.message;
  }
}

function closeEstadoModal() {
  estadoModal.hidden = true;
  document.body.classList.remove('modal-open');
}

async function fetchPersonas() {
  const params = buildPersonasParams();

  try {
    const response = await fetch(`/api/personas?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'No se pudieron cargar los registros.');
    }

    const rows = await response.json();
    renderRows(rows);
  } catch (error) {
    mensaje.textContent = error.message;
  }
}

if (!token) {
  window.location.href = '/login.html';
} else {
  const payload = parseJwt(token);

  if (!payload) {
    sessionStorage.removeItem('jwt');
    window.location.href = '/login.html';
  }

  userLabel.textContent = payload.nombre || payload.email || 'Usuario';
  fetchPersonas();
}

applyFiltersBtn.addEventListener('click', fetchPersonas);

tableBody.addEventListener('click', (event) => {
  const statusButton = event.target.closest('[data-persona-id]');
  if (statusButton) {
    openEstadoModal(
      statusButton.dataset.personaId,
      statusButton.dataset.personaNombre,
      statusButton.dataset.estadoActual
    );
  }
});

closeEstadoModalBtn.addEventListener('click', closeEstadoModal);
estadoModal.addEventListener('click', (event) => {
  if (event.target === estadoModal) closeEstadoModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !estadoModal.hidden) closeEstadoModal();
});

estadoForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  estadoMensaje.textContent = '';

  try {
    const response = await fetch(`/api/personas/${estadoPersonaId.value}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ estado: nuevoEstado.value, nota: notaEstado.value })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'No se pudo actualizar el estado.');
    }

    estadoMensaje.textContent = 'Estado actualizado correctamente.';
    notaEstado.value = '';
    await loadEstadoHistorial(estadoPersonaId.value);
    await fetchPersonas();
  } catch (error) {
    estadoMensaje.textContent = error.message;
  }
});

exportBtn.addEventListener('click', async () => {
  const params = buildPersonasParams();

  try {
    const response = await fetch(`/api/personas/export?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'No se pudo exportar el PDF.');
    }

    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    const generatedDate = new Date().toISOString().slice(0, 10);

    downloadLink.href = downloadUrl;
    downloadLink.download = `registro-personas-${generatedDate}.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    mensaje.textContent = error.message;
  }
});

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('jwt');
  window.location.href = '/login.html';
});
