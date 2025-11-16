// Simple helper around fetch to include JWT token if present
// Read base URL from Vite env, fallback to http://localhost:5001
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5001';
let normalizedBase = rawBase;
if (!/^https?:\/\//i.test(normalizedBase)) {
  normalizedBase = `http://${normalizedBase}`;
}
// remove trailing slash
normalizedBase = normalizedBase.replace(/\/$/, '');
export const API_BASE = `${normalizedBase}/api`;

export const apiFetch = async (endpoint, options = {}) => {
  // Prefer adminToken if present to avoid picking up a stale 'token'
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  
  // Prepare body - stringify if it's an object and not FormData
  let body = options.body;
  if (body && !isFormData && typeof body === 'object') {
    body = JSON.stringify(body);
  }
  
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const path = endpoint && endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const res = await fetch(`${API_BASE}${path}`, { 
    ...options, 
    headers,
    body: body || options.body
  });

  if (!res.ok) {
    let body = null;
    try {
      body = await res.json();
    } catch (_) {
      // ignore json parse errors
    }
    const err = new Error((body && (body.message || body.error)) || res.statusText || 'Request failed');
    err.status = res.status;
    err.body = body;
    throw err;
  }

  // No content
  if (res.status === 204) return null;

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
};
