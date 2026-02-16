import { MSG, DEFAULTS, STATUS_COLORS, STORAGE_KEYS } from '../shared/constants.js';
import { sendMsg, escapeHtml, show, hide } from '../shared/utils.js';

let searchTimeout = null;
let categories = [];

async function init() {
  const config = await getApiUrl();

  if (!config) {
    show('not-configured');
    document.getElementById('go-to-options').addEventListener('click', () => chrome.runtime.openOptionsPage());
    return;
  }

  show('main-content');
  setupEventListeners();
  await loadInitialData();
  await updateHighlightButton();
}

async function getApiUrl() {
  return new Promise((resolve) => {
    chrome.storage.managed.get('apiBaseUrl', (managed) => {
      if (chrome.runtime.lastError || !managed?.apiBaseUrl) {
        chrome.storage.sync.get({ [STORAGE_KEYS.API_BASE_URL]: '' }, (sync) => {
          resolve(sync[STORAGE_KEYS.API_BASE_URL] || '');
        });
        return;
      }
      resolve(managed.apiBaseUrl);
    });
  });
}

function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    if (searchTimeout) clearTimeout(searchTimeout);
    if (query.length < 2) {
      hide('results-container');
      show('recent-container');
      hide('empty-state');
      return;
    }
    searchTimeout = setTimeout(() => searchTerms(query), DEFAULTS.SEARCH_DEBOUNCE_MS);
  });

  document.getElementById('open-sidepanel').addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await chrome.sidePanel.open({ tabId: tab.id });
        window.close();
      }
    } catch (err) {
      console.error('Failed to open side panel:', err);
    }
  });

  document.getElementById('open-options').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('toggle-highlight').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;
    try {
      const hostname = new URL(tab.url).hostname;
      const result = await sendMsg({ type: MSG.TOGGLE_HIGHLIGHTING, payload: { hostname } });
      updateHighlightUI(result.enabled, hostname);

      if (tab.id) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: result.enabled ? 'ENABLE_HIGHLIGHTING' : 'DISABLE_HIGHLIGHTING',
          });
        } catch {
          if (result.enabled) {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content/content-script.js'],
            });
          }
        }
      }
    } catch { /* ignore */ }
  });

  document.getElementById('propose-btn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    const url = tab.url || '';
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('edge://') || url.startsWith('about:')) {
      await chrome.sidePanel.open({ tabId: tab.id });
      window.close();
      return;
    }

    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: MSG.SHOW_CLIPPER,
        payload: { selectedText: '', pageUrl: url, pageTitle: tab.title || '' },
      });
      window.close();
    } catch {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content/content-script.js'],
        });
        setTimeout(async () => {
          await chrome.tabs.sendMessage(tab.id, {
            type: MSG.SHOW_CLIPPER,
            payload: { selectedText: '', pageUrl: url, pageTitle: tab.title || '' },
          });
          window.close();
        }, 200);
      } catch (err) {
        console.error('Cannot inject content script:', err);
        await chrome.sidePanel.open({ tabId: tab.id });
        window.close();
      }
    }
  });

  document.getElementById('retry-btn').addEventListener('click', loadInitialData);
}

async function updateHighlightButton() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;
  try {
    const hostname = new URL(tab.url).hostname;
    const result = await sendMsg({ type: MSG.GET_HIGHLIGHTING_STATE, payload: { hostname } });
    updateHighlightUI(result.enabled, hostname);
  } catch { /* ignore */ }
}

function updateHighlightUI(enabled, hostname) {
  const btn = document.getElementById('toggle-highlight');
  const statusEl = document.getElementById('highlight-status');
  const statusText = document.getElementById('highlight-status-text');

  if (enabled) {
    btn.classList.add('active');
    btn.title = 'Disable Highlighting';
    statusEl.style.display = '';
    statusEl.className = 'highlight-status active';
    statusText.textContent = `Highlighting enabled on ${hostname}`;
  } else {
    btn.classList.remove('active');
    btn.title = 'Enable Highlighting';
    statusEl.style.display = '';
    statusEl.className = 'highlight-status';
    statusText.textContent = `Highlighting disabled`;
  }
}

async function loadInitialData() {
  hide('error-state');
  show('loading');

  try {
    const [terms, cats] = await Promise.all([
      sendMsg({ type: MSG.GET_TERMS }),
      sendMsg({ type: MSG.GET_CATEGORIES }),
    ]);
    categories = Array.isArray(cats) ? cats : [];
    hide('loading');
    const termList = Array.isArray(terms) ? terms : [];
    const recent = termList.slice(0, DEFAULTS.RECENT_TERMS_COUNT);
    renderTermList('recent-list', recent);
  } catch (err) {
    hide('loading');
    hide('recent-container');
    show('error-state');
    document.getElementById('error-message').textContent = err.message || 'Failed to connect';
  }
}

async function searchTerms(query) {
  hide('recent-container');
  hide('empty-state');
  hide('error-state');
  show('loading');

  try {
    const results = await sendMsg({ type: MSG.SEARCH_TERMS, payload: { query } });
    hide('loading');

    if (results.length === 0) {
      hide('results-container');
      show('empty-state');
      return;
    }

    show('results-container');
    document.getElementById('results-count').textContent = String(results.length);
    renderTermList('results-list', results);
  } catch (err) {
    hide('loading');
    show('error-state');
    document.getElementById('error-message').textContent = err.message || 'Search failed';
  }
}

function renderTermList(containerId, terms) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  for (const term of terms) {
    const card = document.createElement('div');
    card.className = 'term-card';
    card.setAttribute('data-testid', `card-term-${term.id}`);
    card.addEventListener('click', () => openTermInSidePanel(term.id));

    const s = STATUS_COLORS[term.status] || STATUS_COLORS.Draft;
    const cat = categories.find((c) => c.name === term.category);
    const dotColor = cat?.color || '#8C898C';

    card.innerHTML = `
      <div class="term-card-header">
        <span class="term-name">${escapeHtml(term.name)}</span>
        <span class="term-status" style="background:${s.bg};color:${s.text};border:1px solid ${s.border}">${term.status}</span>
      </div>
      <div class="term-category">
        <span class="term-category-dot" style="background:${dotColor}"></span>
        ${escapeHtml(term.category)}
      </div>
      <div class="term-definition">${escapeHtml(term.definition)}</div>
    `;
    container.appendChild(card);
  }
}

async function openTermInSidePanel(termId) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.sidePanel.open({ tabId: tab.id });
    }
  } catch { /* ignore */ }
  setTimeout(() => {
    chrome.runtime.sendMessage({
      type: MSG.NAVIGATE_SIDEPANEL,
      payload: { view: 'term', termId },
    });
  }, 600);
}

document.addEventListener('DOMContentLoaded', init);
