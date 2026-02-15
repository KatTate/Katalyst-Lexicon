(() => {
  if (window.__katalystLexiconLoaded) return;
  window.__katalystLexiconLoaded = true;

  const HIGHLIGHT_CLASS = 'katalyst-term-highlight';
  const TOOLTIP_ID = 'katalyst-term-tooltip';
  const CLIPPER_ID = 'katalyst-clipper-overlay';
  const THROTTLE_MS = 2000;

  let termIndex = [];
  let highlightEnabled = false;
  let lastScanTime = 0;
  let observer = null;
  let tooltipTimeout = null;

  function injectStyles() {
    if (document.getElementById('katalyst-ext-styles')) return;
    const style = document.createElement('style');
    style.id = 'katalyst-ext-styles';
    style.textContent = `
      .${HIGHLIGHT_CLASS} {
        background: rgba(120, 191, 38, 0.15);
        border-bottom: 2px solid #78BF26;
        cursor: pointer;
        transition: background 0.15s;
        border-radius: 2px;
        padding: 0 1px;
      }
      .${HIGHLIGHT_CLASS}:hover {
        background: rgba(120, 191, 38, 0.3);
      }
      #${TOOLTIP_ID} {
        position: fixed;
        z-index: 2147483647;
        background: #fff;
        border: 1px solid #D0D1DB;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        padding: 12px 16px;
        max-width: 360px;
        font-family: 'Roboto', -apple-system, sans-serif;
        font-size: 13px;
        color: #50534C;
        opacity: 0;
        transform: translateY(4px);
        transition: opacity 0.15s, transform 0.15s;
        pointer-events: none;
      }
      #${TOOLTIP_ID}.visible {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }
      #${TOOLTIP_ID} .tt-name {
        font-family: 'Montserrat', sans-serif;
        font-weight: 700;
        font-size: 14px;
        color: #3D3936;
        margin-bottom: 4px;
      }
      #${TOOLTIP_ID} .tt-category {
        font-size: 11px;
        color: #8C898C;
        margin-bottom: 6px;
      }
      #${TOOLTIP_ID} .tt-definition {
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      #${TOOLTIP_ID} .tt-link {
        display: inline-block;
        margin-top: 8px;
        color: #78BF26;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        text-decoration: none;
      }
      #${TOOLTIP_ID} .tt-link:hover {
        text-decoration: underline;
      }
      #${CLIPPER_ID} {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        z-index: 2147483646;
        background: rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Roboto', -apple-system, sans-serif;
      }
      .clipper-card {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.25);
        width: 400px;
        max-height: 80vh;
        overflow-y: auto;
        padding: 0;
      }
      .clipper-header {
        padding: 16px 20px;
        border-bottom: 1px solid #D0D1DB;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .clipper-header h3 {
        font-family: 'Montserrat', sans-serif;
        font-size: 16px;
        font-weight: 700;
        color: #3D3936;
        margin: 0;
      }
      .clipper-close {
        background: none;
        border: none;
        color: #8C898C;
        cursor: pointer;
        font-size: 20px;
        padding: 4px;
        line-height: 1;
      }
      .clipper-close:hover {
        color: #3D3936;
      }
      .clipper-body {
        padding: 20px;
      }
      .clipper-field {
        margin-bottom: 16px;
      }
      .clipper-field label {
        display: block;
        font-size: 12px;
        font-weight: 500;
        color: #8C898C;
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: .04em;
      }
      .clipper-field input, .clipper-field textarea, .clipper-field select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #D0D1DB;
        border-radius: 8px;
        font-size: 13px;
        font-family: 'Roboto', sans-serif;
        color: #50534C;
        outline: none;
        box-sizing: border-box;
        transition: border-color .15s;
      }
      .clipper-field input:focus, .clipper-field textarea:focus {
        border-color: #78BF26;
        box-shadow: 0 0 0 3px rgba(120,191,38,.12);
      }
      .clipper-field textarea {
        resize: vertical;
        min-height: 60px;
      }
      .clipper-context {
        background: #F5F6F8;
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 12px;
        color: #8C898C;
        margin-bottom: 12px;
      }
      .clipper-context strong {
        color: #50534C;
      }
      .clipper-footer {
        padding: 12px 20px;
        border-top: 1px solid #D0D1DB;
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
      .clipper-btn {
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        transition: background .15s;
      }
      .clipper-btn-primary {
        background: #78BF26;
        color: #fff;
      }
      .clipper-btn-primary:hover {
        background: #6AAD1E;
      }
      .clipper-btn-primary:disabled {
        background: #D0D1DB;
        cursor: not-allowed;
      }
      .clipper-btn-secondary {
        background: #F5F6F8;
        color: #50534C;
        border: 1px solid #D0D1DB;
      }
      .clipper-btn-secondary:hover {
        background: #EAEAED;
      }
      .clipper-msg {
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        margin-top: 8px;
      }
      .clipper-msg.success {
        background: #E8F5D4;
        color: #3D6B0F;
      }
      .clipper-msg.error {
        background: #FEE2E2;
        color: #991B1B;
      }
    `;
    document.head.appendChild(style);
  }

  async function getTermIndex() {
    try {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: 'GET_TERM_INDEX' }, (resp) => {
          if (chrome.runtime.lastError) { reject(chrome.runtime.lastError); return; }
          resolve(resp);
        });
      });
      return response || [];
    } catch { return []; }
  }

  async function checkHighlightState() {
    try {
      const hostname = window.location.hostname;
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: 'GET_HIGHLIGHTING_STATE', payload: { hostname } },
          (resp) => {
            if (chrome.runtime.lastError) { reject(chrome.runtime.lastError); return; }
            resolve(resp);
          }
        );
      });
      return response?.enabled || false;
    } catch { return false; }
  }

  function buildRegex() {
    if (termIndex.length === 0) return null;
    const allNames = [];
    for (const t of termIndex) {
      allNames.push(t.name);
      if (t.synonyms) {
        for (const s of t.synonyms) {
          if (s.trim()) allNames.push(s.trim());
        }
      }
    }
    allNames.sort((a, b) => b.length - a.length);
    const escaped = allNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
  }

  function findTermByMatch(text) {
    const lower = text.toLowerCase();
    return termIndex.find((t) => {
      if (t.name.toLowerCase() === lower) return true;
      if (t.synonyms) {
        return t.synonyms.some((s) => s.toLowerCase() === lower);
      }
      return false;
    });
  }

  function scanAndHighlight() {
    const now = Date.now();
    if (now - lastScanTime < THROTTLE_MS) return;
    lastScanTime = now;

    const regex = buildRegex();
    if (!regex) return;

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript', 'textarea', 'input', 'code', 'pre', 'svg'].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.closest(`.${HIGHLIGHT_CLASS}, #${TOOLTIP_ID}, #${CLIPPER_ID}, [contenteditable="true"]`)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    for (const textNode of nodes) {
      const text = textNode.textContent;
      regex.lastIndex = 0;
      if (!regex.test(text)) continue;

      const parent = textNode.parentElement;
      if (!parent) continue;

      regex.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let lastIdx = 0;
      let match;

      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIdx) {
          frag.appendChild(document.createTextNode(text.slice(lastIdx, match.index)));
        }
        const span = document.createElement('span');
        span.className = HIGHLIGHT_CLASS;
        span.textContent = match[0];
        span.dataset.termMatch = match[0];
        frag.appendChild(span);
        lastIdx = regex.lastIndex;
      }

      if (lastIdx < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIdx)));
      }

      parent.replaceChild(frag, textNode);
    }
  }

  function removeHighlights() {
    const highlights = document.querySelectorAll(`.${HIGHLIGHT_CLASS}`);
    for (const el of highlights) {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
      }
    }
  }

  function setupTooltip() {
    let tooltip = document.getElementById(TOOLTIP_ID);
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = TOOLTIP_ID;
      document.body.appendChild(tooltip);
    }

    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest(`.${HIGHLIGHT_CLASS}`);
      if (!target) return;

      const matchText = target.dataset.termMatch || target.textContent;
      const term = findTermByMatch(matchText);
      if (!term) return;

      if (tooltipTimeout) clearTimeout(tooltipTimeout);

      tooltip.innerHTML = `
        <div class="tt-name">${escapeHtml(term.name)}</div>
        <div class="tt-link" data-term-id="${term.id}">View full entry &rarr;</div>
      `;

      const rect = target.getBoundingClientRect();
      const tooltipWidth = 360;
      let left = rect.left;
      if (left + tooltipWidth > window.innerWidth - 16) {
        left = window.innerWidth - tooltipWidth - 16;
      }
      if (left < 16) left = 16;

      let top = rect.bottom + 8;
      if (top + 120 > window.innerHeight) {
        top = rect.top - 120;
      }

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.classList.add('visible');

      tooltip.querySelector('.tt-link')?.addEventListener('click', () => {
        chrome.runtime.sendMessage({
          type: 'OPEN_SIDEPANEL',
        });
        setTimeout(() => {
          chrome.runtime.sendMessage({
            type: 'NAVIGATE_SIDEPANEL',
            payload: { view: 'term', termId: term.id },
          });
        }, 600);
        hideTooltip();
      });
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest(`.${HIGHLIGHT_CLASS}`);
      if (!target) return;
      tooltipTimeout = setTimeout(hideTooltip, 300);
    });

    tooltip.addEventListener('mouseenter', () => {
      if (tooltipTimeout) clearTimeout(tooltipTimeout);
    });
    tooltip.addEventListener('mouseleave', () => {
      hideTooltip();
    });
  }

  function hideTooltip() {
    const tooltip = document.getElementById(TOOLTIP_ID);
    if (tooltip) tooltip.classList.remove('visible');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  async function showClipper(data) {
    injectStyles();
    let overlay = document.getElementById(CLIPPER_ID);
    if (overlay) overlay.remove();

    overlay = document.createElement('div');
    overlay.id = CLIPPER_ID;

    const selectedText = data.selectedText || window.getSelection()?.toString()?.trim() || '';

    overlay.innerHTML = `
      <div class="clipper-card">
        <div class="clipper-header">
          <h3>Propose a Lexicon Term</h3>
          <button class="clipper-close" data-testid="button-clipper-close">&times;</button>
        </div>
        <div class="clipper-body">
          ${data.pageTitle ? `<div class="clipper-context"><strong>Source:</strong> ${escapeHtml(data.pageTitle)}</div>` : ''}
          <div class="clipper-field">
            <label>Term Name *</label>
            <input type="text" id="clipper-name" value="${(selectedText || '').replace(/"/g, '&quot;')}" placeholder="Enter term name" data-testid="input-clipper-name">
          </div>
          <div class="clipper-field">
            <label>Proposed Definition *</label>
            <textarea id="clipper-definition" placeholder="What does this term mean?" data-testid="input-clipper-definition"></textarea>
          </div>
          <div class="clipper-field">
            <label>Context / Rationale</label>
            <textarea id="clipper-rationale" placeholder="Why should this be a Lexicon term?" data-testid="input-clipper-rationale">${data.pageUrl ? `Found on: ${escapeHtml(data.pageUrl)}` : ''}</textarea>
          </div>
          <div id="clipper-feedback"></div>
        </div>
        <div class="clipper-footer">
          <button class="clipper-btn clipper-btn-secondary" id="clipper-cancel" data-testid="button-clipper-cancel">Cancel</button>
          <button class="clipper-btn clipper-btn-primary" id="clipper-submit" data-testid="button-clipper-submit">Submit Proposal</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('.clipper-close').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#clipper-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#clipper-submit').addEventListener('click', async () => {
      const name = overlay.querySelector('#clipper-name').value.trim();
      const definition = overlay.querySelector('#clipper-definition').value.trim();
      const rationale = overlay.querySelector('#clipper-rationale').value.trim();
      const feedback = overlay.querySelector('#clipper-feedback');
      const submitBtn = overlay.querySelector('#clipper-submit');

      if (!name || !definition) {
        feedback.innerHTML = '<div class="clipper-msg error">Name and definition are required.</div>';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      try {
        await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({
            type: 'CREATE_PROPOSAL',
            payload: { termName: name, proposedDefinition: definition, rationale },
          }, (resp) => {
            if (chrome.runtime.lastError) { reject(new Error(chrome.runtime.lastError.message)); return; }
            if (resp?.error) { reject(new Error(resp.error)); return; }
            resolve(resp);
          });
        });

        feedback.innerHTML = '<div class="clipper-msg success">Proposal submitted successfully!</div>';
        submitBtn.textContent = 'Submitted';
        setTimeout(() => overlay.remove(), 1500);
      } catch (err) {
        feedback.innerHTML = `<div class="clipper-msg error">${escapeHtml(err.message)}</div>`;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Proposal';
      }
    });

    const nameInput = overlay.querySelector('#clipper-name');
    if (!nameInput.value) nameInput.focus();
    else overlay.querySelector('#clipper-definition').focus();
  }

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver(() => {
      if (highlightEnabled) {
        scanAndHighlight();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  async function enableHighlighting() {
    highlightEnabled = true;
    injectStyles();
    termIndex = await getTermIndex();
    if (termIndex.length > 0) {
      scanAndHighlight();
      setupTooltip();
      startObserver();
    }
  }

  function disableHighlighting() {
    highlightEnabled = false;
    stopObserver();
    removeHighlights();
    hideTooltip();
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ENABLE_HIGHLIGHTING') {
      enableHighlighting();
      sendResponse({ success: true });
    } else if (message.type === 'DISABLE_HIGHLIGHTING') {
      disableHighlighting();
      sendResponse({ success: true });
    } else if (message.type === 'SHOW_CLIPPER') {
      showClipper(message.payload || {});
      sendResponse({ success: true });
    } else if (message.type === 'GET_SELECTION') {
      sendResponse({ text: window.getSelection()?.toString()?.trim() || '' });
    }
    return true;
  });

  async function initContentScript() {
    const enabled = await checkHighlightState();
    if (enabled) {
      await enableHighlighting();
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initContentScript();
  } else {
    document.addEventListener('DOMContentLoaded', initContentScript);
  }
})();
