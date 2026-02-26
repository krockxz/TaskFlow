/**
 * API endpoint path constants.
 * Centralizes all API routes to prevent typos and make refactoring easier.
 */

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',

  // Tasks endpoints
  TASKS: '/api/tasks',
  TASKS_BY_ID: (id: string) => `/api/tasks/${id}`,
  TASKS_CREATE: '/api/tasks/create',
  TASKS_UPDATE_STATUS: '/api/tasks/update-status',
  TASKS_UPDATE_PRIORITY: '/api/tasks/update-priority',
  TASKS_SET_STATUS: '/api/tasks/set-status',
  TASKS_REASSIGN: '/api/tasks/reassign',
  TASKS_BULK: '/api/tasks/bulk',

  // Queries endpoints
  QUERIES_TASKS: '/api/queries/tasks',

  // Notifications endpoints
  NOTIFICATIONS: '/api/notifications',
  NOTIFICATIONS_UNREAD_COUNT: '/api/notifications/unread-count',
  NOTIFICATIONS_MARK_READ: '/api/notifications/mark-read',

  // Templates endpoints
  TEMPLATES: '/api/templates',
  TEMPLATES_BY_ID: (id: string) => `/api/templates/${id}`,

  // Users endpoints
  USERS: '/api/users',

  // GitHub endpoints
  GITHUB_WEBHOOK: '/api/github/webhook',
  GITHUB_CONNECT: '/api/github/connect',
  GITHUB_SYNC: '/api/github/sync',
  GITHUB_REPOS: '/api/github/repos',

  // Slack endpoints
  SLACK_EVENTS: '/api/slack/events',
  SLACK_INSTALL: '/api/slack/install',
  SLACK_INSTALL_CALLBACK: '/api/slack/install/callback',

  // Analytics endpoints
  ANALYTICS_TASKS_PER_USER: '/api/analytics/tasks-per-user',
  ANALYTICS_WORKLOAD_BALANCE: '/api/analytics/workload-balance',
  ANALYTICS_STATUS_DISTRIBUTION: '/api/analytics/status-distribution',
  ANALYTICS_PRIORITY_DISTRIBUTION: '/api/analytics/priority-distribution',

  // Shift brief endpoint
  SHIFT_BRIEF: '/api/shift-brief',

  // Health check
  HEALTH: '/api/health',
} as const;
