import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, FileText, MessageSquare, Settings as SettingsIcon, Sparkles } from 'lucide-react';
import { getAuthUser } from '@/lib/middleware/auth';
import { UnifiedHeader } from '@/components/layout/UnifiedHeader';

export const metadata: Metadata = {
  title: 'Settings',
};

const destinations = [
  {
    title: 'Workspace templates',
    description: 'Standardize handoffs with reusable templates, due dates, and task metadata.',
    href: '/settings/templates',
    icon: FileText,
    accent: 'from-cyan-500/15 to-cyan-500/5',
  },
  {
    title: 'Slack integration',
    description: 'Connect Slack for notifications, summaries, and task activity updates.',
    href: '/settings/slack',
    icon: MessageSquare,
    accent: 'from-emerald-500/15 to-emerald-500/5',
  },
];

const highlights = [
  'Settings hub first, nested pages second',
  'Designed for fast navigation, not dead-end navigation',
  'Keeps the dashboard shell consistent with the rest of TaskFlow',
];

export default async function SettingsPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <>
      <UnifiedHeader
        variant="dashboard"
        userEmail={user.email ?? 'Unknown'}
        title="Settings"
        description="Manage the workspace surface, templates, and integrations from one place"
        backTo="/dashboard"
      />

      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 h-[380px] bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_40%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_34%),linear-gradient(to_bottom,rgba(2,6,23,0.94),rgba(2,6,23,0.76),transparent)]" />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[28px] border border-border/60 bg-card/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.14)] backdrop-blur-sm md:p-8">
              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground w-fit">
                <Sparkles className="h-3.5 w-3.5" />
                Workspace control center
              </div>

              <div className="mt-5 grid gap-8 xl:grid-cols-[1.3fr_0.8fr] xl:items-start">
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                      <SettingsIcon size={20} />
                    </div>
                    <div className="space-y-2">
                      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Settings</h1>
                      <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                        One place to tune how TaskFlow works for your team, from templates to integrations.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {highlights.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm leading-6 text-muted-foreground"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-border/60 bg-background/80 p-5 shadow-sm">
                  <h2 className="text-sm font-medium text-foreground">Quick routing</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Jump straight into the area you need without leaving the settings hub.
                  </p>
                  <div className="mt-4 space-y-2">
                    {destinations.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="group flex items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                      >
                        <span className="text-sm font-medium text-foreground">{item.title}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              {destinations.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group relative overflow-hidden rounded-[26px] border border-border/60 bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.accent}`} />
                    <div className="relative flex min-h-[208px] h-full flex-col justify-between gap-8">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-background/80 text-foreground shadow-sm backdrop-blur">
                          <Icon className="h-5 w-5" />
                        </div>
                        <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-lg font-semibold tracking-tight text-foreground">{item.title}</h2>
                        <p className="max-w-md text-sm leading-6 text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </section>

            <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[26px] border border-border/60 bg-card p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-foreground/5 text-foreground">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold tracking-tight">Coming next</h2>
                    <p className="text-sm leading-6 text-muted-foreground">
                      This hub stays the entry point as new settings areas are added.
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-dashed border-border/60 bg-background/60 p-4">
                    <p className="text-sm font-medium text-foreground">Appearance</p>
                    <p className="mt-1 text-sm text-muted-foreground">Future theme and brand controls.</p>
                  </div>
                  <div className="rounded-2xl border border-dashed border-border/60 bg-background/60 p-4">
                    <p className="text-sm font-medium text-foreground">Permissions</p>
                    <p className="mt-1 text-sm text-muted-foreground">Role-based controls and workspace access.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border border-border/60 bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold tracking-tight">Navigation rule</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Clicking Settings now lands on this hub first. Templates and Slack are the primary destinations, and future sub-pages can be introduced without making the sidebar feel abrupt.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
