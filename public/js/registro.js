const form = document.querySelector('#registroForm');
const mensaje = document.querySelector('#mensaje');
const shareLink = document.querySelector('#shareLink');
const copyLinkBtn = document.querySelector('#copyLinkBtn');

const shareUrl = window.__APP_CONFIG__?.registrationUrl || `${window.location.origin}/registro.html`;

shareLink.textContent = shareUrl;

copyLinkBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(shareUrl);
    mensaje.textContent = 'Link copiado al portapapeles.';
  } catch (error) {
    mensaje.textContent = 'No se pudo copiar el link automáticamente.';
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  mensaje.textContent = '';

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  payload.edad = Number(formData.get('edad'));
  payload.reconciliacion = formData.has('reconciliacion');
  payload.aceptar_cristo = formData.has('aceptar_cristo');

  try {
    const response = await fetch('/api/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'No se pudo registrar la información.');
    }

    mensaje.textContent = data.message;
    form.reset();
  } catch (error) {
    mensaje.textContent = error.message;
  }
});
