"use client";

import { cn } from "@/lib/utils";
import { AnimatedList } from "@/components/ui/animated-list";

interface Item {
  name: string;
  description: string;
  icon: string;
  time: string;
}

const notifications: Item[] = [
  {
    name: "Status Updated",
    description: "Backend API → In Progress",
    time: "2m",
    icon: "○",
  },
  {
    name: "New Task Assigned",
    description: "Design Review for Loop",
    time: "5m",
    icon: "+",
  },
  {
    name: "Comment Added",
    description: "Maria: 'LGTM, shipping it'",
    time: "12m",
    icon: '"',
  },
  {
    name: "Task Completed",
    description: "Homepage v2.0",
    time: "18m",
    icon: "✓",
  },
  {
    name: "Handoff Complete",
    description: "Yuki → Maria",
    time: "1h",
    icon: "→",
  },
];

const Notification = ({ name, description, icon, time }: Item) => {
  return (
    <figure
      className={cn(
        "group relative w-full overflow-hidden rounded-lg"
      )}
    >
      {/* Hover effect */}
      <div className="absolute inset-0 bg-foreground/[0.02] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex items-center gap-4 px-4 py-3.5">
        {/* Icon */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-foreground/5 font-mono-display text-xs text-foreground/60 transition-colors group-hover:bg-foreground/10 group-hover:text-foreground/80">
          {icon}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground/90 truncate">
              {name}
            </span>
            <time className="text-xs text-foreground/30 font-mono-display shrink-0">
              {time}
            </time>
          </div>
          <p className="text-sm text-foreground/50 truncate mt-0.5">
            {description}
          </p>
        </div>

        {/* Accent line on hover */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-0.5 bg-foreground/20 scale-y-0 transition-transform duration-300 group-hover:scale-y-100" />
      </div>
    </figure>
  );
};

export function NotificationsDemo({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex h-[420px] w-full flex-col overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            <div className="w-2.5 h-2.5 rounded-full bg-foreground/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-foreground/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-foreground/20" />
          </div>
        </div>
        <span className="text-xs font-mono-display text-foreground/30">Notifications</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-hidden pt-4">
        <AnimatedList delay={2000} className="gap-1">
          {notifications.map((item, idx) => (
            <Notification {...item} key={idx} />
          ))}
        </AnimatedList>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
