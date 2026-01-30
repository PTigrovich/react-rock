const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');

const buildUrl = (path) => `${API_BASE_URL}${path}`;

async function request(path, options = {}) {
  const response = await fetch(buildUrl(path), options);
  const text = await response.text();

  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object'
        ? payload.error || JSON.stringify(payload)
        : payload;

    throw new Error(message || 'Ошибка при запросе к API');
  }

  return payload;
}

export function getRocks() {
  return request('/api/rocks');
}

/** Загружает конфиг приложения (из public/data/config.json при dev или с API) */
export async function getConfig() {
  try {
    const base = process.env.REACT_APP_API_BASE_URL || '';
    const url = base ? `${base.replace(/\/$/, '')}/api/config` : '/data/config.json';
    const res = await fetch(url);
    if (!res.ok) return getDefaultConfig();
    const data = await res.json();
    return { ...getDefaultConfig(), ...data };
  } catch {
    return getDefaultConfig();
  }
}

function getDefaultConfig() {
  return {
    checkerboardStart: 'right', // 'left' | 'right' — с какой стороны первая строка сетки
  };
}

export function getRockById(id) {
  return request(`/api/rocks/${id}`);
}

export function createRock(rock) {
  return request('/api/rocks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rock),
  });
}

export function updateRock(id, rock) {
  return request(`/api/rocks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rock),
  });
}

export function deleteRock(id) {
  return request(`/api/rocks/${id}`, {
    method: 'DELETE',
  });
}

