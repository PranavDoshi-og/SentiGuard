const API_BASE = '/api';

export const checkHealth = async () => {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error('non-ok');
    return true;
  } catch (err) {
    return false;
  }
};

export const scanUrl = async (url) => {
  try {
    const res = await fetch(`${API_BASE}/scan/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Server error: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    if (err.message.includes('fetch') || err.message.includes('Failed')) {
      throw new Error('Cannot reach the API. Make sure the backend is running on port 8000.');
    }
    throw err;
  }
};

export const scanQr = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/scan/qr`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Server error: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    throw new Error(`QR scan failed: ${err.message}`);
  }
};
