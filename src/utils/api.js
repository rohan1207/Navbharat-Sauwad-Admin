// Simple helper around fetch to include JWT token if present
// Read base URL from Vite env, fallback to http://localhost:5001
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5001';
let normalizedBase = rawBase;
if (!/^https?:\/\//i.test(normalizedBase)) {
  normalizedBase = `http://${normalizedBase}`;
}
// remove trailing slash
normalizedBase = normalizedBase.replace(/\/$/, '');
// Ensure it includes /api at the end
if (!normalizedBase.endsWith('/api')) {
  normalizedBase = `${normalizedBase}/api`;
}
export const API_BASE = normalizedBase;

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
  
  // Use longer timeout for file uploads (FormData), shorter for regular requests
  // Allow custom timeout via options.timeout (in milliseconds)
  const defaultTimeout = isFormData ? 120000 : 30000; // 2 minutes for uploads, 30 seconds for regular requests
  const timeout = options.timeout !== undefined ? options.timeout : defaultTimeout;
  
  // Remove timeout from options to avoid passing it to fetch
  const { timeout: _, ...fetchOptions } = options;
  
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { 
      ...fetchOptions, 
      headers,
      body: body || options.body,
      signal: AbortSignal.timeout(timeout)
    });
  } catch (fetchError) {
    // Handle network errors (connection refused, etc.)
    console.error('Network error:', fetchError);
    let errorMessage = 'Network error: Could not connect to server.';
    
    if (fetchError.name === 'AbortError' || fetchError.name === 'TimeoutError') {
      if (isFormData) {
        errorMessage = 'Upload timeout: The file upload is taking too long. This may happen with very large images. Please try uploading smaller files or check your internet connection.';
      } else {
        errorMessage = 'Request timeout: Server is not responding. Please check if the backend server is running.';
      }
    } else if (fetchError.message?.includes('Failed to fetch') || fetchError.message?.includes('ERR_CONNECTION_REFUSED')) {
      errorMessage = 'Connection refused: Backend server is not running. Please start the server with `npm run dev` in the backend directory.';
    } else {
      errorMessage = fetchError.message || errorMessage;
    }
    
    const networkError = new Error(errorMessage);
    networkError.isNetworkError = true;
    throw networkError;
  }

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
