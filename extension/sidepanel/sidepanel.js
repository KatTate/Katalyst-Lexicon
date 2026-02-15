import { MSG, DEFAULTS, STATUS_COLORS, VISIBILITY_COLORS, STORAGE_KEYS } from '../shared/constants.js';
import { sendMsg, escapeHtml, show, hide, formatDate, errorMsg, renderMarkdown } from '../shared/utils.js';

let categories = [];
let searchTimeout = null;
let appBaseUrl = '';

async function init() {
  const config = await getApiUrl();
  appBaseUrl = config || '';
  if (!appBaseUrl) {
    show('not-configured');
    document.getElementById('sp-go-to-options').addEventListener('click', () => chrome.runtime.openOptionsPage());
    return;
  }

  setupTabs();
  setupSearch();
  setupBackButtons();
  listenForMessages();
  await loadBrowse();
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

function setupTabs() {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
}

function switchTab(tabName) {
  hide('detail-view');
  hide('breadcrumb');

  document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
  document.querySelector(`.tab[data-tab="${tabName}"]`)?.classList.add('active');

  document.querySelectorAll('.tab-content').forEach((c) => { c.classList.remove('active'); c.style.display = 'none'; });
  const content = document.getElementById(`tab-${tabName}`);
  if (content) { content.classList.add('active'); content.style.display = ''; }

  if (tabName === 'browse') loadBrowse();
  if (tabName === 'search') setTimeout(() => document.getElementById('sp-search-input')?.focus(), 50);
  if (tabName === 'principles') loadPrinciples();
}

async function loadBrowse() {
  const container = document.getElementById('category-list');
  const loading = document.getElementById('browse-loading');
  hide('category-terms');

  loading.style.display = '';
  try {
    categories = await sendMsg({ type: MSG.GET_CATEGORIES });
    loading.style.display = 'none';
    renderCategories(container, categories);
  } catch (err) {
    loading.style.display = 'none';
    container.innerHTML = `<div class="empty-state"><p>${escapeHtml(errorMsg(err))}</p></div>`;
  }
}

function renderCategories(container, cats) {
  container.innerHTML = '';
  for (const cat of cats) {
    const item = document.createElement('div');
    item.className = 'category-item';
    item.setAttribute('data-testid', `item-category-${cat.id}`);
    item.innerHTML = `
      <span class="category-dot" style="background:${cat.color || '#8C898C'}"></span>
      <div class="category-info">
        <div class="category-name">${escapeHtml(cat.name)}</div>
        ${cat.description ? `<div class="category-desc">${escapeHtml(cat.description)}</div>` : ''}
      </div>
      <span class="category-arrow">&rsaquo;</span>
    `;
    item.addEventListener('click', () => loadCategoryTerms(cat));
    container.appendChild(item);
  }
}

async function loadCategoryTerms(cat) {
  document.getElementById('category-list').style.display = 'none';
  show('category-terms');
  show('breadcrumb');

  const bc = document.getElementById('breadcrumb');
  bc.innerHTML = `<a id="bc-home">Browse</a><span class="sep">/</span>${escapeHtml(cat.name)}`;
  document.getElementById('bc-home').addEventListener('click', () => {
    hide('category-terms');
    hide('breadcrumb');
    document.getElementById('category-list').style.display = '';
  });

  document.getElementById('category-terms-header').textContent = cat.name;

  const list = document.getElementById('category-terms-list');
  list.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const terms = await sendMsg({ type: MSG.GET_TERMS_BY_CATEGORY, payload: { category: cat.name } });
    renderTermList(list, terms);
  } catch (err) {
    list.innerHTML = `<div class="empty-state"><p>${escapeHtml(errorMsg(err))}</p></div>`;
  }
}

function setupSearch() {
  const input = document.getElementById('sp-search-input');
  input.addEventListener('input', () => {
    const q = input.value.trim();
    if (searchTimeout) clearTimeout(searchTimeout);
    if (q.length < 2) {
      document.getElementById('sp-search-results').innerHTML = '';
      hide('sp-search-empty');
      return;
    }
    searchTimeout = setTimeout(() => doSearch(q), DEFAULTS.SEARCH_DEBOUNCE_MS);
  });
}

async function doSearch(query) {
  const results = document.getElementById('sp-search-results');
  hide('sp-search-empty');
  show('sp-search-loading');

  try {
    const terms = await sendMsg({ type: MSG.SEARCH_TERMS, payload: { query } });
    hide('sp-search-loading');

    if (terms.length === 0) {
      results.innerHTML = '';
      show('sp-search-empty');
    } else {
      hide('sp-search-empty');
      renderTermList(results, terms);
    }
  } catch (err) {
    hide('sp-search-loading');
    results.innerHTML = `<div class="empty-state"><p>${escapeHtml(errorMsg(err))}</p></div>`;
  }
}

async function loadPrinciples() {
  const list = document.getElementById('principle-list');
  hide('principles-empty');
  show('principles-loading');

  try {
    const principles = await sendMsg({ type: MSG.GET_PRINCIPLES });
    hide('principles-loading');

    if (principles.length === 0) {
      list.innerHTML = '';
      show('principles-empty');
    } else {
      renderPrincipleList(list, principles);
    }
  } catch (err) {
    hide('principles-loading');
    list.innerHTML = `<div class="empty-state"><p>${escapeHtml(errorMsg(err))}</p></div>`;
  }
}

function renderPrincipleList(container, principles) {
  container.innerHTML = '';
  for (const p of principles) {
    const card = document.createElement('div');
    card.className = 'principle-card';
    card.setAttribute('data-testid', `card-principle-${p.id}`);
    const tagsHtml = (p.tags || []).map((t) => `<span class="principle-tag">${escapeHtml(t)}</span>`).join('');
    card.innerHTML = `
      <div class="principle-title">${escapeHtml(p.title)}</div>
      ${p.summary ? `<div class="principle-summary">${escapeHtml(p.summary)}</div>` : ''}
      ${tagsHtml ? `<div class="principle-tags">${tagsHtml}</div>` : ''}
    `;
    card.addEventListener('click', () => showPrincipleDetail(p));
    container.appendChild(card);
  }
}

async function showPrincipleDetail(principle) {
  show('detail-view');
  const content = document.getElementById('detail-content');
  const vis = VISIBILITY_COLORS[principle.visibility] || VISIBILITY_COLORS.Internal;
  const tagsHtml = (principle.tags || []).map((t) => `<span class="principle-tag">${escapeHtml(t)}</span>`).join('');
  const appUrl = appBaseUrl ? `${appBaseUrl}/principle/${principle.slug || principle.id}` : '';

  let html = `
    <div class="detail-header">
      <div class="detail-title">${escapeHtml(principle.title)}</div>
      <div class="detail-badges">
        <span class="term-status" style="background:${vis.bg};color:${vis.text}">${principle.visibility}</span>
        ${tagsHtml ? `<div class="principle-tags" style="margin-top:4px">${tagsHtml}</div>` : ''}
      </div>
    </div>
    ${principle.summary ? `<div class="detail-section"><div class="detail-section-title">Summary</div><div class="detail-section-content">${escapeHtml(principle.summary)}</div></div>` : ''}
    <div class="detail-section"><div class="detail-section-title">Content</div><div class="detail-section-content markdown-body">${renderMarkdown(principle.body)}</div></div>
  `;

  try {
    const terms = await sendMsg({ type: MSG.GET_PRINCIPLE_TERMS, payload: { id: principle.id } });
    if (terms.length > 0) {
      html += `<div class="detail-section"><div class="detail-section-title">Related Terms</div><div id="p-terms-list" class="term-list"></div></div>`;
    }

    if (appUrl) {
      html += `<div class="detail-actions"><a href="${appUrl}" target="_blank" class="btn btn-primary btn-open-app">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        Open in Lexicon
      </a></div>`;
    }

    content.innerHTML = html;
    if (terms.length > 0) renderTermList(content.querySelector('#p-terms-list'), terms);
  } catch {
    content.innerHTML = html;
  }
}

async function showTermDetail(termId) {
  show('detail-view');
  const content = document.getElementById('detail-content');
  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const term = await sendMsg({ type: MSG.GET_TERM, payload: { id: termId } });
    const cat = categories.find((c) => c.name === term.category);
    const s = STATUS_COLORS[term.status] || STATUS_COLORS.Draft;
    const vis = VISIBILITY_COLORS[term.visibility] || VISIBILITY_COLORS.Internal;
    const appUrl = appBaseUrl ? `${appBaseUrl}/term/${term.id}` : '';

    const synonymsHtml = (term.synonyms || []).map((syn) =>
      `<span class="synonym-pill">${escapeHtml(syn)}</span>`
    ).join('');

    const goodExamplesHtml = (term.examplesGood || []).map((ex) =>
      `<div class="example-card example-good"><span class="example-quote">"${escapeHtml(ex)}"</span></div>`
    ).join('');

    const badExamplesHtml = (term.examplesBad || []).map((ex) =>
      `<div class="example-card example-bad"><span class="example-quote">"${escapeHtml(ex)}"</span></div>`
    ).join('');

    let html = `
      <div class="detail-top-bar">
        <span class="detail-category-badge" style="background:${cat?.color || '#8C898C'}22;color:${cat?.color || '#8C898C'};border:1px solid ${cat?.color || '#8C898C'}44">
          ${escapeHtml(term.category).toUpperCase()}
        </span>
        <span class="detail-version-badge">v${term.version}.0</span>
        <span class="term-status" style="background:${s.bg};color:${s.text};border:1px solid ${s.border}">${term.status.toUpperCase()}</span>
      </div>

      <div class="detail-header">
        <div class="detail-title">${escapeHtml(term.name)}</div>
      </div>

      <div class="detail-section">
        <div class="detail-section-content detail-definition-text">${escapeHtml(term.definition)}</div>
      </div>

      <div class="detail-two-col">
        ${term.whyExists ? `
        <div class="detail-col">
          <div class="detail-section-title detail-icon-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            WHY IT EXISTS
          </div>
          <div class="detail-section-content">${escapeHtml(term.whyExists)}</div>
        </div>
        ` : ''}
        ${synonymsHtml ? `
        <div class="detail-col">
          <div class="detail-section-title">SYNONYMS / ALSO KNOWN AS</div>
          <div class="synonym-pills">${synonymsHtml}</div>
        </div>
        ` : ''}
      </div>

      ${(term.usedWhen || term.notUsedWhen) ? `
      <div class="detail-two-col">
        ${term.usedWhen ? `
        <div class="detail-col">
          <div class="detail-section-title detail-when-use">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#78BF26" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span style="color:#78BF26">When to use</span>
          </div>
          <div class="detail-section-content">${escapeHtml(term.usedWhen)}</div>
        </div>
        ` : ''}
        ${term.notUsedWhen ? `
        <div class="detail-col">
          <div class="detail-section-title detail-when-not-use">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span style="color:#EF4444">When NOT to use</span>
          </div>
          <div class="detail-section-content">${escapeHtml(term.notUsedWhen)}</div>
        </div>
        ` : ''}
      </div>
      ` : ''}

      ${goodExamplesHtml ? `
      <div class="detail-section">
        <div class="detail-section-title" style="color:#78BF26">Good Examples</div>
        ${goodExamplesHtml}
      </div>
      ` : ''}

      ${badExamplesHtml ? `
      <div class="detail-section">
        <div class="detail-section-title" style="color:#EF4444">Bad Examples</div>
        ${badExamplesHtml}
      </div>
      ` : ''}

      <div class="detail-footer">
        ${term.owner ? `<span class="detail-footer-item"><strong>Owner:</strong> ${escapeHtml(term.owner)}</span>` : ''}
        <span class="detail-footer-item"><strong>Last Updated:</strong> ${formatDate(term.updatedAt)}</span>
        <span class="detail-footer-item"><strong>Visibility:</strong> <span class="term-status" style="background:${vis.bg};color:${vis.text}">${term.visibility}</span></span>
      </div>

      <div class="detail-actions">
        ${appUrl ? `<a href="${appUrl}" target="_blank" class="btn btn-primary btn-open-app">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Open in Lexicon
        </a>` : ''}
      </div>

      <div class="detail-section" id="version-history">
        <div class="detail-section-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          VERSION HISTORY
        </div>
        <div class="loading"><div class="spinner"></div></div>
      </div>

      <div class="detail-section" id="linked-principles" style="display:none;">
        <div class="detail-section-title">RELATED PRINCIPLES</div>
        <div id="lp-list"></div>
      </div>
    `;

    content.innerHTML = html;
    loadVersionHistory(termId);
    loadLinkedPrinciples(termId);
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><p>${escapeHtml(errorMsg(err))}</p></div>`;
  }
}

async function loadVersionHistory(termId) {
  const section = document.getElementById('version-history');
  if (!section) return;
  try {
    const versions = await sendMsg({ type: MSG.GET_TERM_VERSIONS, payload: { id: termId } });
    if (!versions.length) { section.style.display = 'none'; return; }
    section.innerHTML = `<div class="detail-section-title">Version History</div>` +
      versions.map((v) => `
        <div class="version-item">
          <span class="version-number">v${v.versionNumber}</span>
          ${v.changeNote ? `<div class="version-note">${escapeHtml(v.changeNote)}</div>` : ''}
          <div class="version-meta">${escapeHtml(v.changedBy)} &middot; ${formatDate(v.changedAt)}</div>
        </div>
      `).join('');
  } catch {
    section.style.display = 'none';
  }
}

async function loadLinkedPrinciples(termId) {
  const section = document.getElementById('linked-principles');
  if (!section) return;
  try {
    const principles = await sendMsg({ type: MSG.GET_TERM_PRINCIPLES, payload: { id: termId } });
    if (!principles.length) return;
    section.style.display = '';
    const list = document.getElementById('lp-list');
    list.innerHTML = principles.map((p) => `
      <div class="principle-card" style="cursor:pointer">
        <div class="principle-title">${escapeHtml(p.title)}</div>
        ${p.summary ? `<div class="principle-summary">${escapeHtml(p.summary)}</div>` : ''}
      </div>
    `).join('');
    list.querySelectorAll('.principle-card').forEach((card, i) => {
      card.addEventListener('click', () => showPrincipleDetail(principles[i]));
    });
  } catch {
    section.style.display = 'none';
  }
}

function renderTermList(container, terms) {
  container.innerHTML = '';
  for (const term of terms) {
    const card = document.createElement('div');
    card.className = 'term-card';
    card.setAttribute('data-testid', `card-term-${term.id}`);
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
    card.addEventListener('click', () => showTermDetail(term.id));
    container.appendChild(card);
  }
}

function setupBackButtons() {
  document.getElementById('detail-back').addEventListener('click', () => {
    hide('detail-view');
  });
}

function listenForMessages() {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === MSG.NAVIGATE_SIDEPANEL) {
      const p = message.payload || {};
      if (p.view === 'search' && p.query) {
        switchTab('search');
        setTimeout(() => {
          const input = document.getElementById('sp-search-input');
          if (input) {
            input.value = p.query;
            doSearch(p.query);
          }
        }, 100);
      } else if (p.view === 'term' && p.termId) {
        showTermDetail(p.termId);
      } else if (p.view === 'browse') {
        switchTab('browse');
      } else if (p.view === 'principles') {
        switchTab('principles');
      }
    }
  });
}

function showToast(message, type) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

document.addEventListener('DOMContentLoaded', init);
