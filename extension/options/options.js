import { STORAGE_KEYS } from '../shared/constants.js';
import { syncGet, syncSet } from '../shared/utils.js';

let isManaged = false;

async function init() {
  await checkManagedStorage();
  await loadSettings();
  await loadUserEmail();
  setupListeners();
}

async function checkManagedStorage() {
  return new Promise((resolve) => {
    chrome.storage.managed.get(null, (managed) => {
      if (chrome.runtime.lastError || !managed || !managed.apiBaseUrl) {
        isManaged = false;
      } else {
        isManaged = true;
        document.getElementById('managed-notice').style.display = '';
        document.getElementById('api-url').disabled = true;
        document.getElementById('api-secret').disabled = true;
        document.getElementById('api-url').value = managed.apiBaseUrl;
        if (managed.extensionApiSecret) {
          document.getElementById('api-secret').value = '••••••••';
        }
      }
      resolve();
    });
  });
}

async function loadSettings() {
  if (!isManaged) {
    const url = await syncGet(STORAGE_KEYS.API_BASE_URL, '');
    const secret = await syncGet(STORAGE_KEYS.EXTENSION_API_SECRET, '');
    document.getElementById('api-url').value = url;
    document.getElementById('api-secret').value = secret;
  }

  const notif = await syncGet(STORAGE_KEYS.NOTIFICATIONS_ENABLED, true);
  document.getElementById('notifications-toggle').checked = notif;
}

async function loadUserEmail() {
  const emailEl = document.getElementById('user-email');
  try {
    chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' }, (info) => {
      if (chrome.runtime.lastError || !info?.email) {
        emailEl.textContent = 'Not signed into Chrome';
        emailEl.classList.add('warning');
      } else {
        emailEl.textContent = info.email;
        emailEl.classList.remove('warning');
      }
    });
  } catch {
    emailEl.textContent = 'Unable to detect';
    emailEl.classList.add('warning');
  }
}

function setupListeners() {
  document.getElementById('save-btn').addEventListener('click', saveSettings);
  document.getElementById('test-btn').addEventListener('click', testConnection);
}

async function saveSettings() {
  if (!isManaged) {
    const url = document.getElementById('api-url').value.trim().replace(/\/$/, '');
    const secret = document.getElementById('api-secret').value.trim();
    await syncSet(STORAGE_KEYS.API_BASE_URL, url);
    await syncSet(STORAGE_KEYS.EXTENSION_API_SECRET, secret);
  }

  const notif = document.getElementById('notifications-toggle').checked;
  await syncSet(STORAGE_KEYS.NOTIFICATIONS_ENABLED, notif);

  showStatus('Settings saved!', 'success');
}

async function testConnection() {
  const url = document.getElementById('api-url').value.trim().replace(/\/$/, '');
  if (!url) {
    showStatus('Please enter an API URL first', 'error');
    return;
  }

  let secret = '';
  if (isManaged) {
    secret = await new Promise((resolve) => {
      chrome.storage.managed.get('extensionApiSecret', (m) => {
        resolve(m?.extensionApiSecret || '');
      });
    });
  } else {
    secret = document.getElementById('api-secret').value.trim();
  }

  const headers = {};
  if (secret) {
    headers['X-Extension-Secret'] = secret;
  }
  const extId = chrome.runtime.id;
  if (extId) {
    headers['X-Extension-Id'] = extId;
  }

  showStatus('Testing connection...', 'info');
  try {
    const resp = await fetch(`${url}/api/terms/index`, { headers });
    if (resp.ok || resp.status === 304) {
      const data = await resp.json().catch(() => []);
      showStatus(`Connected! Found ${data.length || 0} terms in index.`, 'success');
    } else {
      showStatus(`Server responded with HTTP ${resp.status}`, 'error');
    }
  } catch (err) {
    showStatus(`Connection failed: ${err.message}`, 'error');
  }
}

function showStatus(msg, type) {
  const el = document.getElementById('status-msg');
  el.textContent = msg;
  el.className = `status-msg ${type}`;
  el.style.display = '';
  if (type !== 'info') {
    setTimeout(() => { el.style.display = 'none'; }, 4000);
  }
}

document.addEventListener('DOMContentLoaded', init);
