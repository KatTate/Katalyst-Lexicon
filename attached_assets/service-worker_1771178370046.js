import { api } from './api-client.js';
import { ALARM_NAMES, DEFAULTS, STORAGE_KEYS, MSG } from '../shared/constants.js';

// ── Install / Startup ─────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener((details) => {
  // Context menus
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

  // Notification polling alarm
  chrome.alarms.create(ALARM_NAMES.NOTIFICATION_CHECK, {
    delayInMinutes: 1,
    periodInMinutes: DEFAULTS.NOTIFICATION_INTERVAL_MINUTES,
  });

  // On first install, open options for configuration
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
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
});

// Side panel: don't auto-open on action click (popup opens instead)
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });

// ── Central Message Router ────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch((err) => sendResponse({ error: err.message }));
  return true; // async
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

    // NAVIGATE_SIDEPANEL is handled by the side panel listener directly
    default:
      return undefined;
  }
}

// ── Context Menu ──────────────────────────────────────────────────────

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
    await chrome.tabs.sendMessage(tab.id, {
      type: MSG.SHOW_CLIPPER,
      payload: {
        selectedText: info.selectionText || '',
        pageUrl: info.pageUrl || '',
        pageTitle: tab.title || '',
      },
    });
  }
});

// ── Notification Polling ──────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAMES.NOTIFICATION_CHECK) return;

  try {
    const result = await chrome.storage.sync.get({
      [STORAGE_KEYS.NOTIFICATIONS_ENABLED]: true,
    });

    if (!result[STORAGE_KEYS.NOTIFICATIONS_ENABLED]) {
      chrome.action.setBadgeText({ text: '' });
      return;
    }

    const proposals = await api.proposals.list('pending');
    const count = proposals.length;

    chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
    chrome.action.setBadgeBackgroundColor({ color: '#78BF26' });

    const stored = await chrome.storage.local.get(STORAGE_KEYS.LAST_KNOWN_PROPOSAL_COUNT);
    const lastKnown = stored[STORAGE_KEYS.LAST_KNOWN_PROPOSAL_COUNT] ?? 0;

    if (count > lastKnown && lastKnown >= 0) {
      const diff = count - lastKnown;
      chrome.notifications.create(`proposals-${Date.now()}`, {
        type: 'basic',
        iconUrl: 'assets/icons/icon-128.png',
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
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    await chrome.sidePanel.open({ tabId: tab.id });
    setTimeout(() => {
      chrome.runtime.sendMessage({
        type: MSG.NAVIGATE_SIDEPANEL,
        payload: { view: 'review' },
      });
    }, 500);
  }
});
