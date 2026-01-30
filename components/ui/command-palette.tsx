"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Search,
  Command as CommandIcon,
  Sun,
  Moon,
  Home,
  LayoutDashboard,
  Plus,
  Settings,
  User,
  Bell,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const { useState, useEffect, useRef, useCallback, useMemo } = React;

// Define types for our items
type CommandCategory = "Navigation" | "System" | "Tasks";

type CommandSection = "favorites" | "recents" | "all";

type CommandItem = {
  id: string;
  title: string;
  description: string;
  category: CommandCategory;
  section: CommandSection;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
  keywords?: string[];
};

// Define a type for command history
type CommandHistory = {
  id: string;
  timestamp: number;
  count: number;
};

interface TaskFlowCommandPaletteProps {
  triggerButton?: React.ReactNode;
}

export default function TaskFlowCommandPalette({ triggerButton }: TaskFlowCommandPaletteProps) {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commandHistory, setCommandHistory] = useState<CommandHistory[]>(() => {
    const savedHistory = typeof window !== "undefined" ? localStorage.getItem("tfCommandHistory") : null;
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  const ref = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Function to record command usage in history
  const recordCommandUsage = useCallback((commandId: string) => {
    setCommandHistory((prev) => {
      const now = Date.now();
      const existingCommand = prev.find((cmd) => cmd.id === commandId);

      let newHistory;
      if (existingCommand) {
        newHistory = prev.map((cmd) =>
          cmd.id === commandId ? { ...cmd, timestamp: now, count: cmd.count + 1 } : cmd
        );
      } else {
        newHistory = [...prev, { id: commandId, timestamp: now, count: 1 }];
      }

      newHistory.sort((a, b) => b.count - a.count || b.timestamp - a.timestamp);
      const limitedHistory = newHistory.slice(0, 10);

      if (typeof window !== "undefined") {
        localStorage.setItem("tfCommandHistory", JSON.stringify(limitedHistory));
      }

      return limitedHistory;
    });
  }, []);

  // Define TaskFlow-specific commands
  const allCommandItems: CommandItem[] = useMemo(() => [
    // Navigation commands
    {
      id: "nav-home",
      title: "Go to Home",
      description: "Navigate to the landing page",
      category: "Navigation",
      section: "all",
      icon: <Home className="h-4 w-4" />,
      action: () => {
        router.push("/");
        setOpen(false);
      },
      shortcut: "⌘H",
      keywords: ["home", "landing", "start"],
    },
    {
      id: "nav-dashboard",
      title: "Go to Dashboard",
      description: "View your tasks and projects",
      category: "Navigation",
      section: "favorites",
      icon: <LayoutDashboard className="h-4 w-4" />,
      action: () => {
        router.push("/dashboard");
        setOpen(false);
      },
      shortcut: "⌘D",
      keywords: ["dashboard", "tasks", "list"],
    },
    {
      id: "nav-analytics",
      title: "Go to Analytics",
      description: "View project analytics and metrics",
      category: "Navigation",
      section: "all",
      icon: <Settings className="h-4 w-4" />,
      action: () => {
        router.push("/analytics");
        setOpen(false);
      },
      keywords: ["analytics", "metrics", "stats", "charts"],
    },
    // System commands
    {
      id: "theme-toggle",
      title: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
      description: "Toggle dark/light theme",
      category: "System",
      section: "favorites",
      icon: theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
      action: () => {
        setTheme(theme === "dark" ? "light" : "dark");
        recordCommandUsage("theme-toggle");
        setOpen(false);
      },
      shortcut: "⌘T",
      keywords: ["theme", "dark", "light", "mode"],
    },
    // Tasks commands
    {
      id: "task-create",
      title: "Create New Task",
      description: "Create a new task",
      category: "Tasks",
      section: "favorites",
      icon: <Plus className="h-4 w-4" />,
      action: () => {
        // Dispatch event to open task creation modal
        window.dispatchEvent(new CustomEvent("open-create-task-modal"));
        recordCommandUsage("task-create");
        setOpen(false);
      },
      shortcut: "⌘N",
      keywords: ["create", "new", "task", "add"],
    },
  ], [theme]);

  // Get recent commands based on history
  const getRecentCommands = useCallback(() => {
    return commandHistory
      .slice(0, 5)
      .map((historyItem) => {
        const command = allCommandItems.find((cmd) => cmd.id === historyItem.id);
        return command ? { ...command, section: "recents" as const } : null;
      })
      .filter((cmd): cmd is CommandItem & { section: "recents" } => cmd !== null);
  }, [commandHistory, allCommandItems]);

  // Get favorite commands
  const getFavoriteCommands = useCallback(() => {
    return allCommandItems.filter((cmd) => cmd.section === "favorites");
  }, [allCommandItems]);

  // Filter commands based on search term
  const getFilteredCommands = useCallback(() => {
    const searchLower = searchTerm.toLowerCase();

    return allCommandItems.filter((cmd) => {
      if (searchLower) {
        const matchesTitle = cmd.title.toLowerCase().includes(searchLower);
        const matchesDescription = cmd.description.toLowerCase().includes(searchLower);
        const matchesKeywords = cmd.keywords?.some((keyword) =>
          keyword.toLowerCase().includes(searchLower)
        );

        return matchesTitle || matchesDescription || matchesKeywords;
      }

      return true;
    });
  }, [searchTerm, allCommandItems]);

  // Combine all commands for display
  const commandItems = useCallback(() => {
    const recents = getRecentCommands();
    const favorites = getFavoriteCommands();
    const filtered = getFilteredCommands();

    if (searchTerm) {
      return filtered;
    }

    return [
      ...recents,
      ...favorites.filter((fav) => !recents.some((rec) => rec.id === fav.id)),
      ...filtered
        .filter(
          (cmd) =>
            !recents.some((rec) => rec.id === cmd.id) &&
            !favorites.some((fav) => fav.id === cmd.id)
        )
        .slice(0, 10),
    ];
  }, [getRecentCommands, getFavoriteCommands, getFilteredCommands, searchTerm]);

  // Get all available categories
  const categories = [...new Set(allCommandItems.map((cmd) => cmd.category))];

  // Keyboard handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Toggle command palette with Cmd/Ctrl+K
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
        if (!open) {
          setSelectedIndex(0);
          setSearchTerm("");
        }
      }

      if (!open) return;

      // Handle arrow key navigation
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, commandItems().length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        const selectedCommand = commandItems()[selectedIndex];
        if (selectedCommand?.action) {
          selectedCommand.action();
          recordCommandUsage(selectedCommand.id);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, selectedIndex, commandItems, recordCommandUsage]);

  // Scroll selected item into view
  useEffect(() => {
    if (open && selectedIndex >= 0 && itemsRef.current[selectedIndex]) {
      itemsRef.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex, open]);

  // Reset selected index when opening
  useEffect(() => {
    if (open) setSelectedIndex(0);
  }, [open, searchTerm]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node) && open) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Helper function to set refs safely
  const setItemRef = useCallback((el: HTMLDivElement | null, index: number) => {
    itemsRef.current[index] = el;
  }, []);

  // Reset refs array when items change
  useEffect(() => {
    itemsRef.current = itemsRef.current.slice(0, commandItems().length);
  }, [commandItems]);

  return (
    <>
      {/* Trigger button (if provided, otherwise use default) */}
      {!open && triggerButton}

      {/* Default trigger button */}
      {!open && !triggerButton && (
        <motion.button
          onClick={() => setOpen(true)}
          className="fixed right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground shadow-lg backdrop-blur-md hover:bg-background/90 border"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          aria-label="Open command palette"
          title="Press ⌘K to open command palette"
        >
          <CommandIcon className="h-5 w-5" />
        </motion.button>
      )}

      {/* Full command palette */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              ref={ref}
              className="relative w-full max-w-2xl overflow-hidden rounded-xl border bg-background text-foreground shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300, duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="flex items-center border-b px-4">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input
                  className="h-12 w-full border-0 bg-transparent placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type a command or search..."
                  autoFocus
                />
                <kbd className="ml-2 rounded border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  ESC
                </kbd>
              </div>

              {/* Commands List */}
              <div className="max-h-[60vh] overflow-auto py-2">
                {getFilteredCommands().length === 0 ? (
                  <div className="mx-2 my-8 flex flex-col items-center justify-center text-center">
                    <Search className="mb-2 h-5 w-5 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground/50">No commands found for &quot;{searchTerm}&quot;</p>
                  </div>
                ) : (
                  <>
                    {/* Recent Commands */}
                    {getRecentCommands().length > 0 && !searchTerm && (
                      <div className="px-2 py-1">
                        <div className="px-2 text-xs font-medium text-muted-foreground">Recent</div>
                        {getRecentCommands().map((item) => {
                          const globalIdx = commandItems().findIndex((i) => i.id === item.id);
                          const isSelected = selectedIndex === globalIdx;

                          return (
                            <div
                              key={item.id}
                              ref={(el) => setItemRef(el, globalIdx)}
                              className={`mx-2 flex cursor-pointer items-center justify-between rounded-md px-2 py-2 transition-colors ${
                                isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                              }`}
                              onClick={() => {
                                setSelectedIndex(globalIdx);
                                item.action();
                                recordCommandUsage(item.id);
                              }}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md border">
                                  {item.icon}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{item.title}</span>
                                  <span className="text-xs text-muted-foreground">{item.description}</span>
                                </div>
                              </div>
                              {item.shortcut && (
                                <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                                  {item.shortcut}
                                </kbd>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* All Commands */}
                    <div className="px-2 py-1">
                      {getFilteredCommands()
                        .filter((cmd) => !getRecentCommands().some((rec) => rec.id === cmd.id))
                        .map((item) => {
                          const globalIdx = commandItems().findIndex((i) => i.id === item.id);
                          const isSelected = selectedIndex === globalIdx;

                          return (
                            <div
                              key={item.id}
                              ref={(el) => setItemRef(el, globalIdx)}
                              className={`mx-2 flex cursor-pointer items-center justify-between rounded-md px-2 py-2 transition-colors ${
                                isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                              }`}
                              onClick={() => {
                                setSelectedIndex(globalIdx);
                                item.action();
                                recordCommandUsage(item.id);
                              }}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md border">
                                  {item.icon}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{item.title}</span>
                                  <span className="text-xs text-muted-foreground">{item.description}</span>
                                </div>
                              </div>
                              {item.shortcut && (
                                <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                                  {item.shortcut}
                                </kbd>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <kbd className="rounded border bg-muted px-1 py-0.5">⌘K</kbd>
                  <span>to open</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Navigate</span>
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-muted px-1">
                    <span>↑↓</span>
                  </div>
                  <span>Select</span>
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-muted px-1">
                    <span>↵</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export { TaskFlowCommandPalette };
