export const STORAGE_KEYS = {
  API_BASE_URL: 'apiBaseUrl',
  EXTENSION_API_SECRET: 'extensionApiSecret',
  NOTIFICATION_INTERVAL: 'notificationInterval',
  NOTIFICATIONS_ENABLED: 'notificationsEnabled',
  LAST_KNOWN_PROPOSAL_COUNT: 'lastKnownProposalCount',
  TERM_INDEX: 'termIndex',
  TERM_INDEX_ETAG: 'termIndexEtag',
  TERM_INDEX_UPDATED: 'termIndexUpdated',
  HIGHLIGHTING_DISABLED_SITES: 'highlightingDisabledSites',
  RECENT_TERMS: 'recentTerms',
  USER_EMAIL: 'userEmail',
};

export const DEFAULTS = {
  API_BASE_URL: '',
  NOTIFICATION_INTERVAL_MINUTES: 15,
  SEARCH_DEBOUNCE_MS: 300,
  RECENT_TERMS_COUNT: 5,
  TERM_INDEX_REFRESH_MINUTES: 30,
  HIGHLIGHT_SCAN_THROTTLE_MS: 2000,
};

export const ALARM_NAMES = {
  NOTIFICATION_CHECK: 'check-notifications',
  REFRESH_TERM_INDEX: 'refresh-term-index',
};

export const STATUS_COLORS = {
  Draft: { bg: '#EAEAED', text: '#50534C', border: '#D0D1DB' },
  'In Review': { bg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD' },
  Canonical: { bg: '#E8F5D4', text: '#3D6B0F', border: '#78BF26' },
  Deprecated: { bg: '#FBF5CC', text: '#6B5E0D', border: '#E1D660' },
  pending: { bg: '#FBF5CC', text: '#6B5E0D', border: '#E1D660' },
  in_review: { bg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD' },
  changes_requested: { bg: '#FEF0E0', text: '#7C4A0E', border: '#DDCDAE' },
  approved: { bg: '#E8F5D4', text: '#3D6B0F', border: '#78BF26' },
  rejected: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
};

export const VISIBILITY_COLORS = {
  Internal: { bg: '#EAEAED', text: '#50534C' },
  'Client-Safe': { bg: '#FBF5CC', text: '#6B5E0D' },
  Public: { bg: '#E8F5D4', text: '#3D6B0F' },
};

export const MSG = {
  SEARCH_TERMS: 'SEARCH_TERMS',
  GET_TERMS: 'GET_TERMS',
  GET_TERM: 'GET_TERM',
  GET_TERM_VERSIONS: 'GET_TERM_VERSIONS',
  GET_TERM_PRINCIPLES: 'GET_TERM_PRINCIPLES',
  GET_TERMS_BY_CATEGORY: 'GET_TERMS_BY_CATEGORY',
  GET_CATEGORIES: 'GET_CATEGORIES',
  GET_PROPOSALS: 'GET_PROPOSALS',
  CREATE_PROPOSAL: 'CREATE_PROPOSAL',
  APPROVE_PROPOSAL: 'APPROVE_PROPOSAL',
  REJECT_PROPOSAL: 'REJECT_PROPOSAL',
  REQUEST_CHANGES: 'REQUEST_CHANGES',
  GET_PRINCIPLES: 'GET_PRINCIPLES',
  GET_PRINCIPLE: 'GET_PRINCIPLE',
  GET_PRINCIPLE_TERMS: 'GET_PRINCIPLE_TERMS',
  OPEN_SIDEPANEL: 'OPEN_SIDEPANEL',
  NAVIGATE_SIDEPANEL: 'NAVIGATE_SIDEPANEL',
  SHOW_CLIPPER: 'SHOW_CLIPPER',
  GET_SELECTION: 'GET_SELECTION',
  GET_TERM_INDEX: 'GET_TERM_INDEX',
  REFRESH_TERM_INDEX: 'REFRESH_TERM_INDEX',
  TOGGLE_HIGHLIGHTING: 'TOGGLE_HIGHLIGHTING',
  GET_HIGHLIGHTING_STATE: 'GET_HIGHLIGHTING_STATE',
  GET_USER_EMAIL: 'GET_USER_EMAIL',
};
