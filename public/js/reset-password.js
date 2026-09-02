const form = document.querySelector('#resetForm');
const mensaje = document.querySelector('#mensaje');
const tokenInput = document.querySelector('#tokenInput');
const passwordStrength = document.querySelector('#passwordStrength');

const params = new URLSearchParams(window.location.search);
const token = params.get('token') || '';

tokenInput.value = token;

document.querySelectorAll('[data-password-toggle]').forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const passwordInput = document.querySelector(`[name="${toggle.dataset.passwordToggle}"]`);
    const isHidden = passwordInput.type === 'password';

    passwordInput.type = isHidden ? 'text' : 'password';
    toggle.textContent = isHidden ? 'Ocultar' : 'Mostrar';
    toggle.setAttribute('aria-label', `${isHidden ? 'Ocultar' : 'Mostrar'} ${toggle.dataset.passwordToggle === 'nuevaPassword' ? 'contraseña nueva' : 'confirmación de contraseña'}`);
  });
});

document.querySelector('[name="nuevaPassword"]').addEventListener('input', (event) => {
  const password = event.target.value;
  const hasLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const strength = [hasLength, hasNumber, hasSymbol].filter(Boolean).length;
  const labels = ['', 'Débil', 'Aceptable', 'Fuerte'];

  passwordStrength.textContent = password ? `Seguridad: ${labels[strength]}` : '';
  passwordStrength.dataset.strength = String(strength);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  mensaje.textContent = '';

  const payload = Object.fromEntries(new FormData(form).entries());

  if (payload.nuevaPassword !== payload.confirmPassword) {
    mensaje.textContent = 'Las contraseñas no coinciden.';
    mensaje.style.color = 'var(--ember)';
    return;
  }

  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'No se pudo restablecer la contraseña.');
    }

    mensaje.textContent = data.message;
    mensaje.style.color = 'var(--success)';
    form.reset();
    window.location.href = '/login.html';
  } catch (error) {
    mensaje.textContent = error.message;
    mensaje.style.color = 'var(--ember)';
  }
});
