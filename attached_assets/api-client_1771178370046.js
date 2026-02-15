import { STORAGE_KEYS } from '../shared/constants.js';

async function getBaseUrl() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ [STORAGE_KEYS.API_BASE_URL]: '' }, (result) => {
      const url = result[STORAGE_KEYS.API_BASE_URL];
      resolve(url ? url.replace(/\/$/, '') : '');
    });
  });
}

async function apiRequest(method, path, body) {
  const baseUrl = await getBaseUrl();
  if (!baseUrl) {
    throw new Error('API URL not configured. Open extension settings.');
  }

  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${baseUrl}${path}`, options);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return undefined;
}

export const api = {
  terms: {
    list: () => apiRequest('GET', '/api/terms'),
    search: (query) => apiRequest('GET', `/api/terms/search?q=${encodeURIComponent(query)}`),
    get: (id) => apiRequest('GET', `/api/terms/${id}`),
    getVersions: (id) => apiRequest('GET', `/api/terms/${id}/versions`),
    getPrinciples: (id) => apiRequest('GET', `/api/terms/${id}/principles`),
    getByCategory: (category) => apiRequest('GET', `/api/terms/category/${encodeURIComponent(category)}`),
  },
  categories: {
    list: () => apiRequest('GET', '/api/categories'),
  },
  proposals: {
    list: (status) => apiRequest('GET', `/api/proposals${status ? `?status=${status}` : ''}`),
    create: (data) => apiRequest('POST', '/api/proposals', data),
    approve: (id) => apiRequest('POST', `/api/proposals/${id}/approve`),
    reject: (id, comment) => apiRequest('POST', `/api/proposals/${id}/reject`, { reviewComment: comment }),
    requestChanges: (id, comment) => apiRequest('POST', `/api/proposals/${id}/request-changes`, { reviewComment: comment }),
  },
  principles: {
    list: () => apiRequest('GET', '/api/principles'),
    get: (id) => apiRequest('GET', `/api/principles/${id}`),
    getTerms: (id) => apiRequest('GET', `/api/principles/${id}/terms`),
  },
};
