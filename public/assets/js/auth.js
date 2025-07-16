let _accessToken = sessionStorage.getItem('accessToken');
let _refreshPromise = null;

function setTokens({ accessToken, refreshToken }) {
  if (accessToken) {
    _accessToken = accessToken;
    sessionStorage.setItem('accessToken', accessToken);
  }
  if (refreshToken) {
    sessionStorage.setItem('refreshToken', refreshToken);
  }
}

async function login() {
  const username = document.getElementById('usernameInput')?.value?.trim();
  const password = document.getElementById('passwordInput')?.value;
  const errEl = document.getElementById('errno');

  if (!username || !password) {
    showError(errEl, 'Введіть логін та пароль');
    return;
  }

  errEl?.classList.add('hidden');

  try {
    const res = await fetch('auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const result = await res.json();

    if (!res.ok) {
      showError(errEl, result?.error || 'Помилка сервера');
      return;
    }

    setTokens(result);
    window.location.href = 'admin/users';
  } catch {
    showError(errEl, 'Немає з\'єднання з сервером');
  }
}

function refreshAccessToken() {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (!refreshToken) {
      logOut();
      return null;
    }

    const refreshRes = await fetch('/auth/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!refreshRes.ok) {
      logOut();
      return null;
    }

    const result = await refreshRes.json();
    setTokens(result);
    return _accessToken;
  })().finally(() => {
    _refreshPromise = null;
  });

  return _refreshPromise;
}

async function getValidAccessToken() {
  if (_accessToken) return _accessToken;
  return refreshAccessToken();
}

function logOut() {
  _accessToken = null;
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  window.location.href = '/admin';
}

document.getElementById('log_out')?.addEventListener('click', logOut);

const ALLOWED_ORIGIN = 'http://localhost:3000';

window.addEventListener('message', (event) => {
  if (event.origin !== ALLOWED_ORIGIN) return;
  if (event.data?.type !== 'SET_TOKEN') return;
  if (typeof event.data.token !== 'string' || !event.data.token) return;
  if (_accessToken) return;

  setTokens({ accessToken: event.data.token });
  window.location.href = 'admin/users';
});

function showError(el, message) {
  if (!el) return;
  el.textContent = message;
  el.classList.remove('hidden');
}

async function apiFetch(endpoint, options = {}) {
  let token = await getValidAccessToken();
  if (!token) return null;

  const isFormData = options.body instanceof FormData;

  const doFetch = (accessToken) =>
    fetch(endpoint, {
      ...options,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
      },
    });

  let res = await doFetch(token);

  if (res.status === 401) {
    token = await refreshAccessToken();
    if (!token) return null;

    res = await doFetch(token);

    if (res.status === 401) {
      logOut();
      return null;
    }
  }

  return res;
}
