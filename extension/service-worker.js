import { api, getUserEmail } from './shared/api-client.js';
import { ALARM_NAMES, DEFAULTS, STORAGE_KEYS, MSG } from './shared/constants.js';

const RETRY_DELAYS = [1, 5, 15];

chrome.runtime.onInstalled.addListener((details) => {
  chrome.contextMenus.create({
    id: 'search-lexicon',
    title: 'Search Lexicon for "%s"',
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    id: 'propose-term',
    title: 'Propose "%s" as Lexicon Term',
    contexts: ['selection'],
  });

  chrome.alarms.create(ALARM_NAMES.NOTIFICATION_CHECK, {
    delayInMinutes: 1,
    periodInMinutes: DEFAULTS.NOTIFICATION_INTERVAL_MINUTES,
  });

  chrome.alarms.create(ALARM_NAMES.REFRESH_TERM_INDEX, {
    delayInMinutes: 0.1,
    periodInMinutes: DEFAULTS.TERM_INDEX_REFRESH_MINUTES,
  });

  if (details.reason === 'install') {
    refreshTermIndex();
  }
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.get(ALARM_NAMES.NOTIFICATION_CHECK, (existing) => {
    if (!existing) {
      chrome.alarms.create(ALARM_NAMES.NOTIFICATION_CHECK, {
        delayInMinutes: 1,
        periodInMinutes: DEFAULTS.NOTIFICATION_INTERVAL_MINUTES,
      });
    }
  });
  chrome.alarms.get(ALARM_NAMES.REFRESH_TERM_INDEX, (existing) => {
    if (!existing) {
      chrome.alarms.create(ALARM_NAMES.REFRESH_TERM_INDEX, {
        delayInMinutes: 0.1,
        periodInMinutes: DEFAULTS.TERM_INDEX_REFRESH_MINUTES,
      });
    }
  });
});

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch((err) => sendResponse({ error: err.message }));
  return true;
});

async function handleMessage(message) {
  const p = message.payload || {};

  switch (message.type) {
    case MSG.SEARCH_TERMS:
      return api.terms.search(p.query);
    case MSG.GET_TERMS:
      return api.terms.list();
    case MSG.GET_TERM:
      return api.terms.get(p.id);
    case MSG.GET_TERM_VERSIONS:
      return api.terms.getVersions(p.id);
    case MSG.GET_TERM_PRINCIPLES:
      return api.terms.getPrinciples(p.id);
    case MSG.GET_TERMS_BY_CATEGORY:
      return api.terms.getByCategory(p.category);

    case MSG.GET_CATEGORIES:
      return api.categories.list();

    case MSG.GET_PROPOSALS:
      return api.proposals.list(p.status);
    case MSG.CREATE_PROPOSAL:
      return api.proposals.create(p);
    case MSG.APPROVE_PROPOSAL:
      return api.proposals.approve(p.id);
    case MSG.REJECT_PROPOSAL:
      return api.proposals.reject(p.id, p.comment);
    case MSG.REQUEST_CHANGES:
      return api.proposals.requestChanges(p.id, p.comment);

    case MSG.GET_PRINCIPLES:
      return api.principles.list();
    case MSG.GET_PRINCIPLE:
      return api.principles.get(p.id);
    case MSG.GET_PRINCIPLE_TERMS:
      return api.principles.getTerms(p.id);

    case MSG.OPEN_SIDEPANEL: {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await chrome.sidePanel.open({ tabId: tab.id });
      }
      return { success: true };
    }

    case MSG.GET_TERM_INDEX: {
      const stored = await chrome.storage.local.get(STORAGE_KEYS.TERM_INDEX);
      return stored[STORAGE_KEYS.TERM_INDEX] || [];
    }

    case MSG.REFRESH_TERM_INDEX:
      await refreshTermIndex();
      return { success: true };

    case MSG.TOGGLE_HIGHLIGHTING: {
      const hostname = p.hostname;
      if (!hostname) return { enabled: false };
      const data = await chrome.storage.sync.get({ [STORAGE_KEYS.HIGHLIGHTING_DISABLED_SITES]: {} });
      const disabledSites = data[STORAGE_KEYS.HIGHLIGHTING_DISABLED_SITES] || {};
      const isCurrentlyEnabled = !disabledSites[hostname];
      if (isCurrentlyEnabled) {
        disabledSites[hostname] = true;
      } else {
        delete disabledSites[hostname];
      }
      await chrome.storage.sync.set({ [STORAGE_KEYS.HIGHLIGHTING_DISABLED_SITES]: disabledSites });
      return { enabled: !isCurrentlyEnabled };
    }

    case MSG.GET_HIGHLIGHTING_STATE: {
      const hostname = p.hostname;
      if (!hostname) return { enabled: false };
      const data = await chrome.storage.sync.get({ [STORAGE_KEYS.HIGHLIGHTING_DISABLED_SITES]: {} });
      const disabledSites = data[STORAGE_KEYS.HIGHLIGHTING_DISABLED_SITES] || {};
      return { enabled: !disabledSites[hostname] };
    }

    case MSG.GET_USER_EMAIL: {
      const email = await getUserEmail();
      return { email };
    }

    default:
      return undefined;
  }
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  if (info.menuItemId === 'search-lexicon') {
    await chrome.sidePanel.open({ tabId: tab.id });
    setTimeout(() => {
      chrome.runtime.sendMessage({
        type: MSG.NAVIGATE_SIDEPANEL,
        payload: { view: 'search', query: info.selectionText },
      });
    }, 500);
  }

  if (info.menuItemId === 'propose-term') {
    const url = tab.url || '';
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('edge://') || url.startsWith('about:')) {
      await openProposeInWebApp(info.selectionText);
      return;
    }

    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: MSG.SHOW_CLIPPER,
        payload: {
          selectedText: info.selectionText || '',
          pageUrl: info.pageUrl || '',
          pageTitle: tab.title || '',
        },
      });
    } catch {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content/content-script.js'],
        });
        setTimeout(async () => {
          try {
            await chrome.tabs.sendMessage(tab.id, {
              type: MSG.SHOW_CLIPPER,
              payload: {
                selectedText: info.selectionText || '',
                pageUrl: info.pageUrl || '',
                pageTitle: tab.title || '',
              },
            });
          } catch {
            await openProposeInWebApp(info.selectionText);
          }
        }, 300);
      } catch {
        await openProposeInWebApp(info.selectionText);
      }
    }
  }
});

async function openProposeInWebApp(termName) {
  const baseUrl = await getBaseUrl();
  if (baseUrl) {
    const proposalUrl = `${baseUrl}/propose?name=${encodeURIComponent(termName || '')}`;
    chrome.tabs.create({ url: proposalUrl });
  }
}

function normalizeUrl(raw) {
  let url = (raw || '').trim().replace(/\/$/, '');
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
}

async function getBaseUrl() {
  const config = await chrome.storage.managed.get('apiBaseUrl').catch(() => ({}));
  const syncData = await chrome.storage.sync.get({ [STORAGE_KEYS.API_BASE_URL]: '' });
  return normalizeUrl(config?.apiBaseUrl || syncData[STORAGE_KEYS.API_BASE_URL] || '');
}

async function refreshTermIndex(retryCount = 0) {
  try {
    const stored = await chrome.storage.local.get(STORAGE_KEYS.TERM_INDEX_ETAG);
    const currentEtag = stored[STORAGE_KEYS.TERM_INDEX_ETAG] || null;
    const result = await api.terms.getIndex(currentEtag);

    if (result.notModified) return;

    await chrome.storage.local.set({
      [STORAGE_KEYS.TERM_INDEX]: result.data,
      [STORAGE_KEYS.TERM_INDEX_ETAG]: result.etag || null,
      [STORAGE_KEYS.TERM_INDEX_UPDATED]: Date.now(),
    });
  } catch {
    if (retryCount < RETRY_DELAYS.length) {
      const delay = RETRY_DELAYS[retryCount];
      chrome.alarms.create(`retry-term-index-${retryCount}`, { delayInMinutes: delay });
    }
  }
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAMES.REFRESH_TERM_INDEX) {
    await refreshTermIndex();
    return;
  }

  if (alarm.name.startsWith('retry-term-index-')) {
    const retryCount = parseInt(alarm.name.split('-').pop(), 10) + 1;
    await refreshTermIndex(retryCount);
    return;
  }

  if (alarm.name !== ALARM_NAMES.NOTIFICATION_CHECK) return;

  try {
    const result = await chrome.storage.sync.get({
      [STORAGE_KEYS.NOTIFICATIONS_ENABLED]: true,
    });

    if (!result[STORAGE_KEYS.NOTIFICATIONS_ENABLED]) {
      chrome.action.setBadgeText({ text: '' });
      return;
    }

    const email = await getUserEmail();
    if (!email) {
      chrome.action.setBadgeText({ text: '' });
      return;
    }

    const proposals = await api.proposals.list('pending');
    const count = Array.isArray(proposals) ? proposals.length : 0;

    chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
    chrome.action.setBadgeBackgroundColor({ color: '#78BF26' });

    const stored = await chrome.storage.local.get(STORAGE_KEYS.LAST_KNOWN_PROPOSAL_COUNT);
    const lastKnown = stored[STORAGE_KEYS.LAST_KNOWN_PROPOSAL_COUNT] ?? 0;

    if (count > lastKnown && lastKnown >= 0) {
      const diff = count - lastKnown;
      chrome.notifications.create(`proposals-${Date.now()}`, {
        type: 'basic',
        iconUrl: 'icons/icon-128.png',
        title: 'Katalyst Lexicon',
        message: `${diff} new term proposal${diff > 1 ? 's' : ''} pending review`,
      });
    }

    await chrome.storage.local.set({ [STORAGE_KEYS.LAST_KNOWN_PROPOSAL_COUNT]: count });
  } catch {
    chrome.action.setBadgeText({ text: '' });
  }
});

chrome.notifications.onClicked.addListener(async () => {
  const baseUrl = await getBaseUrl();
  if (baseUrl) {
    chrome.tabs.create({ url: `${baseUrl}/proposals` });
  }
});
