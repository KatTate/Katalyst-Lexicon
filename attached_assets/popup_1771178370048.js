import { MSG, DEFAULTS, STATUS_COLORS, STORAGE_KEYS } from '../shared/constants.js';
import { sendMsg, escapeHtml, show, hide } from '../shared/utils.js';

let searchTimeout = null;
let categories = [];

async function init() {
  const result = await chrome.storage.sync.get({ [STORAGE_KEYS.API_BASE_URL]: '' });
  const apiUrl = result[STORAGE_KEYS.API_BASE_URL];

  if (!apiUrl) {
    show('not-configured');
    document.getElementById('go-to-options').addEventListener('click', () => chrome.runtime.openOptionsPage());
    return;
  }

  show('main-content');
  setupEventListeners();
  await loadInitialData();
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

  document.getElementById('propose-btn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    // Don't try to inject into chrome:// or edge:// pages
    const url = tab.url || '';
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('edge://') || url.startsWith('about:')) {
      // Open the side panel with a propose view instead
      await chrome.sidePanel.open({ tabId: tab.id });
      window.close();
      return;
    }

    try {
      // Try sending to existing content script first
      await chrome.tabs.sendMessage(tab.id, {
        type: MSG.SHOW_CLIPPER,
        payload: { selectedText: '', pageUrl: url, pageTitle: tab.title || '' },
      });
      window.close();
    } catch {
      // Content script not injected yet — inject it first, then send message
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content/content-script.js'],
        });
        // Small delay for script to initialize
        setTimeout(async () => {
          await chrome.tabs.sendMessage(tab.id, {
            type: MSG.SHOW_CLIPPER,
            payload: { selectedText: '', pageUrl: url, pageTitle: tab.title || '' },
          });
          window.close();
        }, 200);
      } catch (err) {
        console.error('Cannot inject content script:', err);
        // Fallback: open side panel
        await chrome.sidePanel.open({ tabId: tab.id });
        window.close();
      }
    }
  });

  document.getElementById('retry-btn').addEventListener('click', loadInitialData);
}

async function loadInitialData() {
  hide('error-state');
  show('loading');

  try {
    const [terms, cats] = await Promise.all([
      sendMsg({ type: MSG.GET_TERMS }),
      sendMsg({ type: MSG.GET_CATEGORIES }),
    ]);
    categories = cats;
    hide('loading');
    const recent = terms.slice(0, DEFAULTS.RECENT_TERMS_COUNT);
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
