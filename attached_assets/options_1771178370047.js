import { STORAGE_KEYS, DEFAULTS } from '../shared/constants.js';

async function init() {
  await loadSettings();
  setupEventListeners();
  document.getElementById('version').textContent = chrome.runtime.getManifest().version;
}

async function loadSettings() {
  const result = await chrome.storage.sync.get({
    [STORAGE_KEYS.API_BASE_URL]: DEFAULTS.API_BASE_URL,
    [STORAGE_KEYS.NOTIFICATIONS_ENABLED]: true,
    [STORAGE_KEYS.NOTIFICATION_INTERVAL]: DEFAULTS.NOTIFICATION_INTERVAL_MINUTES,
  });

  document.getElementById('api-url').value = result[STORAGE_KEYS.API_BASE_URL];
  document.getElementById('notifications-enabled').checked = result[STORAGE_KEYS.NOTIFICATIONS_ENABLED];
  document.getElementById('notification-interval').value = String(result[STORAGE_KEYS.NOTIFICATION_INTERVAL]);
}

function setupEventListeners() {
  document.getElementById('test-btn').addEventListener('click', testConnection);
  document.getElementById('save-btn').addEventListener('click', saveSettings);
}

async function testConnection() {
  const statusEl = document.getElementById('test-status');
  const url = document.getElementById('api-url').value.trim().replace(/\/$/, '');

  if (!url) {
    statusEl.textContent = 'Please enter a URL';
    statusEl.className = 'status-text error';
    return;
  }

  statusEl.textContent = 'Testing...';
  statusEl.className = 'status-text loading';

  try {
    const response = await fetch(`${url}/api/categories`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      statusEl.textContent = `Connected (${Array.isArray(data) ? data.length : 0} categories found)`;
      statusEl.className = 'status-text success';
    } else {
      statusEl.textContent = `Error: HTTP ${response.status}`;
      statusEl.className = 'status-text error';
    }
  } catch {
    statusEl.textContent = 'Cannot reach server';
    statusEl.className = 'status-text error';
  }
}

async function saveSettings() {
  const apiUrl = document.getElementById('api-url').value.trim().replace(/\/$/, '');
  const notificationsEnabled = document.getElementById('notifications-enabled').checked;
  const interval = Number(document.getElementById('notification-interval').value) || DEFAULTS.NOTIFICATION_INTERVAL_MINUTES;

  await chrome.storage.sync.set({
    [STORAGE_KEYS.API_BASE_URL]: apiUrl,
    [STORAGE_KEYS.NOTIFICATIONS_ENABLED]: notificationsEnabled,
    [STORAGE_KEYS.NOTIFICATION_INTERVAL]: interval,
  });

  showToast('Settings saved', 'success');
}

function showToast(message, type) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.style.display = '';
  setTimeout(() => { toast.style.display = 'none'; }, 2500);
}

document.addEventListener('DOMContentLoaded', init);
