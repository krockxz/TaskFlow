/**
 * Slack notification utilities for sending task-related messages.
 *
 * Uses Block Kit for formatted messages with interactive elements.
 * Integrates with task events to notify team members in Slack.
 */

import { getSlackClientByTeam } from './client';

/**
 * Task notification data for sending to Slack.
 */
export interface TaskNotification {
  teamId: string;
  channelId: string;
  taskTitle: string;
  taskUrl: string;
  status: string;
  dueDate?: string;
}

/**
 * Sends a task notification to a Slack channel.
 *
 * Formats the notification using Block Kit with:
 * - Header with task title and handshake emoji
 * - Status and due date fields
 * - Button to open task in TaskFlow
 *
 * @param notification - Notification data
 * @returns true if sent successfully, false otherwise
 */
export async function sendTaskNotification(notification: TaskNotification): Promise<boolean> {
  const client = await getSlackClientByTeam(notification.teamId);

  if (!client) {
    return false;
  }

  try {
    await client.chat.postMessage({
      channel: notification.channelId,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:handshake: New handoff: *${notification.taskTitle}*`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Status:*\n${notification.status}`,
            },
            {
              type: 'mrkdwn',
              text: notification.dueDate ? `*Due:*\n${notification.dueDate}` : '_No due date_',
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Open in TaskFlow',
              },
              url: notification.taskUrl,
              action_id: 'open_task',
            },
          ],
        },
      ],
    });

    return true;
  } catch (error) {
    console.error('Slack notification error:', error);
    return false;
  }
}
