import { STORAGE_KEYS } from './constants.js';

async function getConfig() {
  return new Promise((resolve) => {
    chrome.storage.managed.get(null, (managed) => {
      if (chrome.runtime.lastError || !managed || !managed.apiBaseUrl) {
        chrome.storage.sync.get({
          [STORAGE_KEYS.API_BASE_URL]: '',
          [STORAGE_KEYS.EXTENSION_API_SECRET]: '',
        }, (sync) => {
          resolve({
            baseUrl: (sync[STORAGE_KEYS.API_BASE_URL] || '').replace(/\/$/, ''),
            secret: sync[STORAGE_KEYS.EXTENSION_API_SECRET] || '',
          });
        });
        return;
      }
      resolve({
        baseUrl: (managed.apiBaseUrl || '').replace(/\/$/, ''),
        secret: managed.extensionApiSecret || '',
      });
    });
  });
}

async function getUserEmail() {
  return new Promise((resolve) => {
    try {
      chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' }, (info) => {
        if (chrome.runtime.lastError || !info?.email) {
          resolve('');
          return;
        }
        resolve(info.email);
      });
    } catch {
      resolve('');
    }
  });
}

async function apiRequest(method, path, body, options = {}) {
  const config = await getConfig();
  if (!config.baseUrl) {
    throw new Error('API URL not configured. Open extension settings.');
  }

  const headers = { 'Content-Type': 'application/json' };

  if (options.withAuth) {
    const email = await getUserEmail();
    if (!email) {
      throw new Error('Sign in to Chrome with your @katgroupinc.com account to use this feature.');
    }
    headers['X-Extension-User-Email'] = email;
    headers['X-Extension-Id'] = chrome.runtime.id;
    if (config.secret) {
      headers['X-Extension-Secret'] = config.secret;
    } else {
      throw new Error('Extension API secret not configured. Check settings or contact your IT admin.');
    }
  }

  if (options.etag) {
    headers['If-None-Match'] = options.etag;
  }

  const fetchOptions = { method, headers };
  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${config.baseUrl}${path}`, fetchOptions);

  if (response.status === 304) {
    return { notModified: true };
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  const result = {};
  const etag = response.headers.get('etag');
  if (etag) result.etag = etag;

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    result.data = await response.json();
  }
  return result;
}

export const api = {
  terms: {
    list: () => apiRequest('GET', '/api/terms').then(r => r.data),
    search: (query) => apiRequest('GET', `/api/terms/search?q=${encodeURIComponent(query)}`).then(r => r.data),
    get: (id) => apiRequest('GET', `/api/terms/${id}`).then(r => r.data),
    getVersions: (id) => apiRequest('GET', `/api/terms/${id}/versions`).then(r => r.data),
    getPrinciples: (id) => apiRequest('GET', `/api/terms/${id}/principles`).then(r => r.data),
    getByCategory: (category) => apiRequest('GET', `/api/terms/category/${encodeURIComponent(category)}`).then(r => r.data),
    getIndex: (etag) => apiRequest('GET', '/api/terms/index', null, { etag }),
  },
  categories: {
    list: () => apiRequest('GET', '/api/categories').then(r => r.data),
  },
  proposals: {
    list: (status) => apiRequest('GET', `/api/proposals${status ? `?status=${status}` : ''}`, null, { withAuth: true }).then(r => r.data),
    create: (data) => apiRequest('POST', '/api/proposals', data, { withAuth: true }).then(r => r.data),
    approve: (id) => apiRequest('POST', `/api/proposals/${id}/approve`, null, { withAuth: true }).then(r => r.data),
    reject: (id, comment) => apiRequest('POST', `/api/proposals/${id}/reject`, { reviewComment: comment }, { withAuth: true }).then(r => r.data),
    requestChanges: (id, comment) => apiRequest('POST', `/api/proposals/${id}/request-changes`, { reviewComment: comment }, { withAuth: true }).then(r => r.data),
  },
  principles: {
    list: () => apiRequest('GET', '/api/principles').then(r => r.data),
    get: (id) => apiRequest('GET', `/api/principles/${id}`).then(r => r.data),
    getTerms: (id) => apiRequest('GET', `/api/principles/${id}/terms`).then(r => r.data),
  },
};

export { getUserEmail };
