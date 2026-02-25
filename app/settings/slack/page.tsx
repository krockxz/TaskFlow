/**
 * Slack integration settings page.
 *
 * Allows users to:
 * - View connection status
 * - Install/uninstall Slack app
 * - Configure notification channels
 * - Test slash command functionality
 */

import { getAuthUser } from '@/lib/middleware/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { env } from '@/lib/env';
import { Header } from '@/components/layout/Header';

export default async function SlackSettingsPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  const installation = await prisma.slackInstallation.findFirst();

  return (
    <>
      <Header
        userEmail={user.email ?? 'Unknown'}
        title="Slack Integration"
        description="Connect your Slack workspace for task notifications and AI summaries"
        backTo="/dashboard"
      />
      <div className="container max-w-4xl py-8">
        <div className="space-y-6">
          {/* Connection Status */}
          {installation ? (
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">Connected</h2>
              <p className="text-muted-foreground">
                Slack workspace is connected as team ID: {installation.teamId}
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Use the slash command <code className="rounded bg-muted px-1.5 py-0.5 text-sm">/taskflow-brief</code> in any
                Slack channel to get your AI Shift Brief.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">Not Connected</h2>
              <p className="text-muted-foreground mb-4">
                Connect your Slack workspace to enable task notifications and slash commands.
              </p>
              {env.SLACK_CLIENT_ID ? (
                <a
                  href={`https://slack.com/oauth/v2/authorize?client_id=${env.SLACK_CLIENT_ID}&scope=chat:write,chat:write.public,commands,incoming-webhook&user_scope=`}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Add to Slack
                </a>
              ) : (
                <div className="rounded-md bg-destructive/10 p-4">
                  <p className="text-sm text-destructive font-medium">
                    Slack integration is not configured. Please set SLACK_CLIENT_ID environment variable.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Features */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Features</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                Slash command <code className="rounded bg-muted px-1.5 py-0.5 text-sm">/taskflow-brief</code> for AI
                summaries
              </li>
              <li>Task notifications when assigned or status changes</li>
              <li>Interactive buttons to accept/ask questions about tasks</li>
              <li>Handoff notifications in team channels</li>
            </ul>
          </div>

          {/* Setup Instructions */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Setup Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Create a Slack App at https://api.slack.com/apps</li>
              <li>
                Add OAuth scopes: chat:write, chat:write.public, commands, incoming-webhook (Bot Token Scopes)
              </li>
              <li>Enable slash commands and create /taskflow-brief command</li>
              <li>
                Set environment variables:
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li>SLACK_CLIENT_ID</li>
                  <li>SLACK_CLIENT_SECRET</li>
                  <li>SLACK_SIGNING_SECRET</li>
                </ul>
              </li>
              <li>Install the app to your workspace using the button above</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
