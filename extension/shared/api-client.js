import { STORAGE_KEYS } from './constants.js';

function normalizeUrl(raw) {
  let url = (raw || '').trim().replace(/\/$/, '');
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
}

async function getConfig() {
  return new Promise((resolve) => {
    chrome.storage.managed.get(null, (managed) => {
      if (chrome.runtime.lastError || !managed || !managed.apiBaseUrl) {
        chrome.storage.sync.get({
          [STORAGE_KEYS.API_BASE_URL]: '',
          [STORAGE_KEYS.EXTENSION_API_SECRET]: '',
        }, (sync) => {
          resolve({
            baseUrl: normalizeUrl(sync[STORAGE_KEYS.API_BASE_URL]),
            secret: sync[STORAGE_KEYS.EXTENSION_API_SECRET] || '',
          });
        });
        return;
      }
      resolve({
        baseUrl: normalizeUrl(managed.apiBaseUrl),
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

  if (config.secret) {
    headers['X-Extension-Secret'] = config.secret;
    headers['X-Extension-Id'] = chrome.runtime.id;
  }

  if (options.withAuth) {
    const email = await getUserEmail();
    if (!email) {
      throw new Error('Sign in to Chrome with your @katgroupinc.com account to use this feature.');
    }
    headers['X-Extension-User-Email'] = email;
    if (!config.secret) {
      throw new Error('Extension API secret not configured. Check settings or contact your IT admin.');
    }
  }

  if (options.etag) {
    headers['If-None-Match'] = options.etag;
  }

  const fetchOptions = { method, headers, credentials: 'omit', redirect: 'follow' };
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

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned non-JSON response. Check your API URL.');
  }

  const result = {};
  const etag = response.headers.get('etag');
  if (etag) result.etag = etag;
  result.data = await response.json();
  return result;
}

function listData(r) { return Array.isArray(r.data) ? r.data : []; }

export const api = {
  terms: {
    list: () => apiRequest('GET', '/api/terms').then(listData),
    search: (query) => apiRequest('GET', `/api/terms/search?q=${encodeURIComponent(query)}`).then(listData),
    get: (id) => apiRequest('GET', `/api/terms/${id}`).then(r => r.data),
    getVersions: (id) => apiRequest('GET', `/api/terms/${id}/versions`).then(listData),
    getPrinciples: (id) => apiRequest('GET', `/api/terms/${id}/principles`).then(listData),
    getByCategory: (category) => apiRequest('GET', `/api/terms/category/${encodeURIComponent(category)}`).then(listData),
    getIndex: (etag) => apiRequest('GET', '/api/terms/index', null, { etag }),
  },
  categories: {
    list: () => apiRequest('GET', '/api/categories').then(listData),
  },
  proposals: {
    list: (status) => apiRequest('GET', `/api/proposals${status ? `?status=${status}` : ''}`, null, { withAuth: true }).then(r => r.data),
    create: (data) => apiRequest('POST', '/api/proposals', data, { withAuth: true }).then(r => r.data),
    approve: (id) => apiRequest('POST', `/api/proposals/${id}/approve`, null, { withAuth: true }).then(r => r.data),
    reject: (id, comment) => apiRequest('POST', `/api/proposals/${id}/reject`, { reviewComment: comment }, { withAuth: true }).then(r => r.data),
    requestChanges: (id, comment) => apiRequest('POST', `/api/proposals/${id}/request-changes`, { reviewComment: comment }, { withAuth: true }).then(r => r.data),
  },
  principles: {
    list: () => apiRequest('GET', '/api/principles').then(listData),
    get: (id) => apiRequest('GET', `/api/principles/${id}`).then(r => r.data),
    getTerms: (id) => apiRequest('GET', `/api/principles/${id}/terms`).then(listData),
  },
};

export { getUserEmail };
