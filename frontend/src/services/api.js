import jsQR from 'jsqr';

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
    const shouldFallbackToBrowserDecode =
      err.message.includes('QR scanning libraries not available') ||
      err.message.includes('No URL found in QR code') ||
      err.message.includes('Server error: 500');

    if (!shouldFallbackToBrowserDecode) {
      throw new Error(`QR scan failed: ${err.message}`);
    }

    try {
      const extractedUrl = await decodeQrFromImageFile(file);
      return await scanUrl(extractedUrl);
    } catch (decodeErr) {
      throw new Error(`QR scan failed: ${decodeErr.message}`);
    }
  }
};

const decodeQrFromImageFile = async (file) => {
  if (!jsQR) {
    throw new Error('QR decoding library is not available in the browser.');
  }

  const image = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });

  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const result = jsQR(imageData.data, imageData.width, imageData.height);

  if (!result?.data) {
    throw new Error('Could not detect a QR code in this image.');
  }

  const qrValue = result.data.trim();
  if (qrValue.startsWith('http://') || qrValue.startsWith('https://')) {
    return qrValue;
  }
  if (qrValue.includes('.')) {
    return `https://${qrValue}`;
  }

  throw new Error('QR code does not contain a URL.');
};

const loadImageFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Unable to read the uploaded image file.'));
    };

    image.src = objectUrl;
  });
};
