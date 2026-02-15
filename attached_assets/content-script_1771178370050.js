// Content script - runs in the context of web pages.
// Cannot use ES module imports (content scripts don't support type: module),
// so this is self-contained.

const CLIPPER_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Roboto:wght@400;500&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  .kl-clipper {
    position: fixed; top: 16px; right: 16px; width: 380px; max-height: 80vh; overflow-y: auto;
    background: #FFF; border: 1px solid #D0D1DB; border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,.15), 0 0 0 1px rgba(0,0,0,.05);
    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 13px; color: #50534C; z-index: 2147483647;
    animation: klSlideIn .2s ease;
  }
  @keyframes klSlideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
  .kl-header { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid #D0D1DB; background:#F5F6F8; border-radius:12px 12px 0 0; }
  .kl-header-title { font-family:'Montserrat',sans-serif; font-weight:700; font-size:14px; color:#3D3936; display:flex; align-items:center; gap:8px; }
  .kl-header-title svg { color:#78BF26; }
  .kl-close { background:none; border:none; padding:4px; cursor:pointer; color:#8C898C; border-radius:4px; display:flex; align-items:center; }
  .kl-close:hover { background:#EAEAED; color:#3D3936; }
  .kl-body { padding:16px; }
  .kl-preview { background:#F5F6F8; border:1px solid #D0D1DB; border-radius:8px; padding:10px 12px; font-size:12px; color:#50534C; line-height:1.5; max-height:80px; overflow-y:auto; margin-bottom:14px; }
  .kl-field { margin-bottom:12px; }
  .kl-label { display:block; font-size:12px; font-weight:500; color:#50534C; margin-bottom:4px; }
  .kl-input, .kl-textarea, .kl-select { width:100%; padding:7px 10px; border:1px solid #D0D1DB; border-radius:8px; font-size:13px; font-family:'Roboto',sans-serif; outline:none; transition:border-color .15s; background:#FFF; }
  .kl-input:focus, .kl-textarea:focus, .kl-select:focus { border-color:#78BF26; box-shadow:0 0 0 3px rgba(120,191,38,.15); }
  .kl-textarea { resize:vertical; min-height:60px; }
  .kl-footer { display:flex; justify-content:flex-end; gap:8px; padding:12px 16px; border-top:1px solid #D0D1DB; }
  .kl-btn { padding:7px 14px; border-radius:8px; font-size:12px; font-weight:500; font-family:'Roboto',sans-serif; cursor:pointer; border:none; transition:background .15s; }
  .kl-btn-primary { background:#78BF26; color:#fff; }
  .kl-btn-primary:hover { background:#6AAD1E; }
  .kl-btn-primary:disabled { background:#B8DF8A; cursor:not-allowed; }
  .kl-btn-secondary { background:#F5F6F8; color:#50534C; border:1px solid #D0D1DB; }
  .kl-btn-secondary:hover { background:#EAEAED; }
  .kl-success { padding:24px; text-align:center; color:#78BF26; font-weight:500; font-size:14px; }
  .kl-success svg { margin-bottom:8px; }
  .kl-error { padding:8px 12px; background:#FEF2F2; border:1px solid #FECACA; border-radius:8px; color:#EF4444; font-size:12px; margin-bottom:12px; }
`;

let clipperRoot = null;

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function escapeAttr(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function hideClipper() {
  if (clipperRoot) {
    clipperRoot.remove();
    clipperRoot = null;
  }
}

async function showClipper(payload) {
  hideClipper();

  clipperRoot = document.createElement('div');
  clipperRoot.id = 'katalyst-lexicon-clipper-root';
  clipperRoot.style.cssText = 'all:initial;position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;';
  const shadow = clipperRoot.attachShadow({ mode: 'closed' });

  const style = document.createElement('style');
  style.textContent = CLIPPER_STYLES;
  shadow.appendChild(style);

  // Fetch categories
  let categories = [];
  try {
    categories = await chrome.runtime.sendMessage({ type: 'GET_CATEGORIES' });
  } catch { /* continue without categories */ }

  const previewText = payload.selectedText
    ? payload.selectedText.substring(0, 300) + (payload.selectedText.length > 300 ? '...' : '')
    : `Page: ${payload.pageTitle}`;

  const categoryOptions = (categories || [])
    .map((c) => `<option value="${escapeAttr(c.name)}">${escapeHtml(c.name)}</option>`)
    .join('');

  const wrapper = document.createElement('div');
  wrapper.className = 'kl-clipper';
  wrapper.innerHTML = `
    <div class="kl-header">
      <span class="kl-header-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
        Propose Term
      </span>
      <button class="kl-close" id="kl-close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="kl-body" id="kl-body">
      <div class="kl-preview">${escapeHtml(previewText)}</div>
      <div id="kl-error" class="kl-error" style="display:none;"></div>
      <div class="kl-field">
        <label class="kl-label">Term Name *</label>
        <input class="kl-input" id="kl-name" type="text" value="${escapeAttr(payload.selectedText || '')}" placeholder="Enter term name">
      </div>
      <div class="kl-field">
        <label class="kl-label">Category *</label>
        <select class="kl-select" id="kl-category"><option value="">Select category...</option>${categoryOptions}</select>
      </div>
      <div class="kl-field">
        <label class="kl-label">Definition *</label>
        <textarea class="kl-textarea" id="kl-definition" placeholder="What does this term mean?" rows="3"></textarea>
      </div>
      <div class="kl-field">
        <label class="kl-label">Why It Exists</label>
        <textarea class="kl-textarea" id="kl-why" placeholder="Why is this term important?" rows="2"></textarea>
      </div>
      <div class="kl-field">
        <label class="kl-label">When to Use</label>
        <input class="kl-input" id="kl-used-when" type="text" placeholder="Context for using this term">
      </div>
      <div class="kl-field">
        <label class="kl-label">When NOT to Use</label>
        <input class="kl-input" id="kl-not-used-when" type="text" placeholder="When this term should be avoided">
      </div>
    </div>
    <div class="kl-footer" id="kl-footer">
      <button class="kl-btn kl-btn-secondary" id="kl-cancel">Cancel</button>
      <button class="kl-btn kl-btn-primary" id="kl-submit">Submit Proposal</button>
    </div>
  `;

  shadow.appendChild(wrapper);
  document.body.appendChild(clipperRoot);

  // Events
  shadow.getElementById('kl-close').addEventListener('click', hideClipper);
  shadow.getElementById('kl-cancel').addEventListener('click', hideClipper);
  shadow.getElementById('kl-submit').addEventListener('click', async () => {
    const name = shadow.getElementById('kl-name').value.trim();
    const category = shadow.getElementById('kl-category').value;
    const definition = shadow.getElementById('kl-definition').value.trim();
    const whyExists = shadow.getElementById('kl-why').value.trim();
    const usedWhen = shadow.getElementById('kl-used-when').value.trim();
    const notUsedWhen = shadow.getElementById('kl-not-used-when').value.trim();
    const errorEl = shadow.getElementById('kl-error');

    if (!name || name.length < 2) { errorEl.textContent = 'Term name must be at least 2 characters.'; errorEl.style.display = ''; return; }
    if (!category) { errorEl.textContent = 'Please select a category.'; errorEl.style.display = ''; return; }
    if (!definition || definition.length < 10) { errorEl.textContent = 'Definition must be at least 10 characters.'; errorEl.style.display = ''; return; }

    errorEl.style.display = 'none';
    const submitBtn = shadow.getElementById('kl-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      await chrome.runtime.sendMessage({
        type: 'CREATE_PROPOSAL',
        payload: {
          termName: name,
          category,
          type: 'new',
          status: 'pending',
          submittedBy: 'Extension User',
          definition,
          whyExists: whyExists || null,
          usedWhen: usedWhen || null,
          notUsedWhen: notUsedWhen || null,
          examplesGood: [],
          examplesBad: [],
          synonyms: [],
        },
      });

      const body = shadow.getElementById('kl-body');
      const footer = shadow.getElementById('kl-footer');
      body.innerHTML = `
        <div class="kl-success">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          <div>Term proposed successfully!</div>
        </div>
      `;
      footer.style.display = 'none';
      setTimeout(hideClipper, 1500);
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Proposal';
      errorEl.textContent = err.message || 'Submission failed';
      errorEl.style.display = '';
    }
  });

  // Focus name input
  setTimeout(() => shadow.getElementById('kl-name')?.focus(), 100);
}

// Message listener
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_SELECTION') {
    const selection = window.getSelection();
    sendResponse({
      hasSelection: !!selection && selection.toString().trim().length > 0,
      text: selection?.toString() || '',
      pageTitle: document.title,
      pageUrl: window.location.href,
    });
    return true;
  }

  if (message.type === 'SHOW_CLIPPER') {
    showClipper(message.payload);
    sendResponse({ success: true });
    return true;
  }

  return false;
});
