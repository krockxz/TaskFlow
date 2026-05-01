"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    LogOut,
    Search,
    ChevronDown,
    Calendar as CalendarIcon,
    Flag,
    CheckCircle2,
    Users,
    Loader2,
    Settings,
    Globe,
    FileText,
    MessageSquare,
} from "lucide-react";
import { useTaskFilters } from "@/app/dashboard/hooks/useTaskFilters";
import { useSignOut } from "@/lib/auth/sign-out";
import { cn } from "@/lib/utils";

// Smooth easing — no overshoot
const softSpringEasing = "cubic-bezier(0.4, 0, 0.2, 1)";

import Image from "next/image";

/* ----------------------------- Brand / Logos ----------------------------- */

function InterfacesLogoSquare() {
    return (
        <div className="relative size-8 rounded-full overflow-hidden border border-neutral-700 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Image
                src="/logo.jpg"
                alt="TaskFlow"
                fill
                className="object-cover"
            />
        </div>
    );
}



/* --------------------------------- Avatar -------------------------------- */

function AvatarCircle({ email }: { email?: string }) {
    const initial = email ? email[0].toUpperCase() : "U";
    return (
        <div className="relative rounded-full shrink-0 size-8 bg-neutral-800 border border-neutral-700">
            <div className="flex items-center justify-center size-8 text-xs font-medium text-neutral-300">
                {initial}
            </div>
        </div>
    );
}

/* ------------------------------ Search Input ----------------------------- */

function SearchContainer({ isCollapsed, onSearch, initialValue }: { isCollapsed?: boolean, onSearch: (val: string) => void, initialValue?: string }) {
    const [searchValue, setSearchValue] = useState(initialValue || "");

    useEffect(() => {
        setSearchValue(initialValue || "");
    }, [initialValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchValue(val);
        onSearch(val);
    };

    return (
        <div
            className={`relative shrink-0 transition-all duration-500 mb-4 ${isCollapsed ? "w-full flex justify-center" : "w-full"
                }`}
            style={{ transitionTimingFunction: softSpringEasing }}
        >
            <div
                className={`bg-neutral-900 h-10 relative rounded-lg flex items-center transition-all duration-500 border border-neutral-800 ${isCollapsed ? "w-10 min-w-10 justify-center" : "w-full"
                    }`}
                style={{ transitionTimingFunction: softSpringEasing }}
            >
                <div
                    className={`flex items-center justify-center shrink-0 transition-all duration-500 ${isCollapsed ? "p-1" : "px-3"
                        }`}
                    style={{ transitionTimingFunction: softSpringEasing }}
                >
                    <Search size={16} className="text-neutral-400" />
                </div>

                <div
                    className={`flex-1 relative transition-opacity duration-500 overflow-hidden ${isCollapsed ? "opacity-0 w-0" : "opacity-100"
                        }`}
                    style={{ transitionTimingFunction: softSpringEasing }}
                >
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchValue}
                        onChange={handleChange}
                        className="w-full bg-transparent border-none outline-none text-[14px] text-neutral-50 placeholder:text-neutral-500 h-full"
                        tabIndex={isCollapsed ? -1 : 0}
                    />
                </div>
            </div>
        </div>
    );
}

/* --------------------------- Types / Content Map -------------------------- */

interface NavItemT {
    id: string;
    icon: React.ReactNode;
    label: string;
    href?: string;
}

interface MenuItemT {
    id?: string;
    icon?: React.ReactNode;
    label: string;
    href?: string;
    hasDropdown?: boolean;
    isActive?: boolean;
    onClick?: () => void;
    children?: MenuItemT[];
}

interface MenuSectionT {
    title: string;
    items: MenuItemT[];
}

/* ---------------------------- Left Icon Nav Rail -------------------------- */

function IconNavButton({
    children,
    isActive = false,
    onClick,
    tooltip,
    href
}: {
    children: React.ReactNode;
    isActive?: boolean;
    onClick?: () => void;
    tooltip: string;
    href?: string;
}) {
    const buttonContent = (
        <>
            <div
                className={cn(
                    "group flex items-center justify-center rounded-lg size-10 min-w-10 transition-all duration-300 relative",
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200"
                )}
                title={tooltip}
            >
                {children}
            </div>
        </>
    );

    if (href) {
        return (
            <Link href={href}>
                {buttonContent}
            </Link>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
        >
            {buttonContent}
        </button>
    );
}

function IconNavigation({
    activeSection,
    userEmail
}: {
    activeSection: string;
    userEmail: string;
}) {
    const { handleSignOut, isPending } = useSignOut();

    const handleLogout = () => handleSignOut();

    const navItems: NavItemT[] = [
        { id: "dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/dashboard" },
        { id: "timezone-lanes", icon: <Globe size={20} />, label: "Timezone Lanes", href: "/dashboard/timezone-lanes" },
        { id: "settings", icon: <Settings size={20} />, label: "Settings", href: "/settings/templates" },
    ];

    return (
        <aside className="bg-black flex flex-col gap-2 items-center p-3 w-16 h-full border-r border-neutral-800 shrink-0 z-20">
            {/* Logo */}
            <div className="mb-4 mt-2 size-10 flex items-center justify-center">
                <InterfacesLogoSquare />
            </div>

            {/* Navigation Icons */}
            <div className="flex flex-col gap-3 w-full items-center">
                {navItems.map((item) => (
                    <IconNavButton
                        key={item.id}
                        isActive={activeSection === item.id}
                        tooltip={item.label}
                        href={item.href}
                    >
                        {item.icon}
                    </IconNavButton>
                ))}
            </div>

            <div className="flex-1" />

            {/* Bottom section */}
            <div className="flex flex-col gap-3 w-full items-center mb-4">
                <IconNavButton
                    isActive={false}
                    onClick={handleLogout}
                    tooltip="Sign Out"
                >
                    {isPending ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
                </IconNavButton>
                <div className="size-8" title={userEmail}>
                    <AvatarCircle email={userEmail} />
                </div>
            </div>
        </aside>
    );
}

/* ------------------------------ Right Sidebar ----------------------------- */

function SectionTitle({
    title,
    onToggleCollapse,
    isCollapsed,
}: {
    title: string;
    onToggleCollapse: () => void;
    isCollapsed: boolean;
}) {
    if (isCollapsed) {
        return (
            <div className="w-full flex justify-center mb-4 cursor-pointer" onClick={onToggleCollapse}>
                <div className="h-px w-8 bg-neutral-800" />
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden mb-4 px-1">
            <div className="flex items-center justify-between">
                <div className="font-semibold text-lg text-neutral-50 tracking-tight">
                    {title}
                </div>
                <button
                    onClick={onToggleCollapse}
                    className="text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                    <div className="h-6 w-6 flex items-center justify-center rounded hover:bg-neutral-800">
                        <ChevronDown size={14} className="rotate-90" />
                    </div>
                </button>
            </div>
        </div>
    );
}

/* ------------------------------ Menu Elements ---------------------------- */

function MenuItem({
    item,
    isExpanded,
    onToggle,
    isCollapsed,
}: {
    item: MenuItemT;
    isExpanded?: boolean;
    onToggle?: () => void;
    isCollapsed?: boolean;
}) {
    // Active state styling
    const isActive = item.isActive;

    const itemBody = (
        <div
            className={cn(
                "rounded-md cursor-pointer transition-all duration-200 flex items-center relative select-none",
                isActive ? "bg-neutral-800 text-white" : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200",
                isCollapsed ? "size-10 justify-center" : "w-full min-h-[40px] px-3 py-2"
            )}
            onClick={() => {
                if (item.hasDropdown && onToggle) onToggle();
                else item.onClick?.();
            }}
            title={isCollapsed ? item.label : undefined}
        >
            <div className={cn("flex items-center justify-center shrink-0", isActive ? "text-primary-foreground" : "")}>
                {item.icon}
            </div>

            <div
                className={`flex-1 relative transition-opacity duration-300 overflow-hidden ${isCollapsed ? "opacity-0 w-0" : "opacity-100 ml-3"
                    }`}
            >
                <div className="text-[14px] font-medium truncate">
                    {item.label}
                </div>
            </div>

            {!isCollapsed && item.hasDropdown && (
                <div className="shrink-0 ml-2">
                    <ChevronDown
                        size={14}
                        className={cn("transition-transform duration-300", isExpanded ? "rotate-180" : "")}
                    />
                </div>
            )}
        </div>
    );

    return (
        <div
            className={`relative shrink-0 transition-all duration-500 ${isCollapsed ? "w-full flex justify-center" : "w-full"
                }`}
        >
            {item.href && !item.hasDropdown ? (
                <Link href={item.href}>
                    {itemBody}
                </Link>
            ) : (
                itemBody
            )}

            {/* Submenu */}
            {!isCollapsed && isExpanded && item.children && (
                <div className="flex flex-col gap-1 mt-1 ml-4 border-l border-neutral-800 pl-2">
                    {item.children.map((child, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "text-[13px] px-3 py-1.5 rounded-md cursor-pointer transition-colors flex items-center gap-2",
                                child.isActive ? "text-neutral-50 bg-neutral-800/50" : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900"
                            )}
                            onClick={child.onClick}
                        >
                            {child.icon && <span className="opacity-70">{child.icon}</span>}
                            <span className="truncate">{child.label}</span>
                            {child.isActive && <div className="ml-auto size-1.5 rounded-full bg-primary" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function MenuSection({
    section,
    expandedItems,
    onToggleExpanded,
    isCollapsed,
}: {
    section: MenuSectionT;
    expandedItems: Set<string>;
    onToggleExpanded: (itemKey: string) => void;
    isCollapsed?: boolean;
}) {
    return (
        <div className={cn("flex flex-col w-full mb-6", isCollapsed && "items-center")}>
            {!isCollapsed && section.title && (
                <div className="px-3 mb-2 text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                    {section.title}
                </div>
            )}

            <div className="flex flex-col gap-1 w-full">
                {section.items.map((item, index) => {
                    const itemKey = `${section.title}-${index}-${item.label}`;
                    const isExpanded = expandedItems.has(itemKey);
                    return (
                        <MenuItem
                            key={itemKey}
                            item={item}
                            isExpanded={isExpanded}
                            onToggle={() => onToggleExpanded(itemKey)}
                            isCollapsed={isCollapsed}
                        />
                    );
                })}
            </div>
        </div>
    );
}

/* --------------------------------- Layout -------------------------------- */

function getActiveSectionFromPath(pathname?: string) {
    if (!pathname) {
        return "dashboard";
    }

    if (pathname.startsWith("/settings")) {
        return "settings";
    }

    if (pathname === "/dashboard/timezone-lanes" || pathname.startsWith("/dashboard/timezone-lanes/")) {
        return "timezone-lanes";
    }

    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
        return "dashboard";
    }

    return "dashboard";
}

interface DashboardSidebarProps {
    children: React.ReactNode;
    users: { id: string; email: string }[];
    userEmail: string;
}

export function DashboardSidebar({ children, users, userEmail }: DashboardSidebarProps) {
    const pathname = usePathname();
    const activeSection = getActiveSectionFromPath(pathname);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(["Status-0-Status", "Priority-0-Priority"]));

    const taskFilters = useTaskFilters();

    const toggleExpanded = (itemKey: string) => {
        setExpandedItems((prev) => {
            const next = new Set(prev);
            if (next.has(itemKey)) next.delete(itemKey);
            else next.add(itemKey);
            return next;
        });
    };

    const toggleCollapse = () => setIsCollapsed((s) => !s);

    // Build structure based on hooks
    const sidebarContent = React.useMemo(() => ({
        dashboard: {
            title: "Dashboard",
            sections: [
                {
                    title: "Overview",
                    items: [
                        {
                            label: "All Tasks",
                            icon: <LayoutDashboard size={18} />,
                            isActive: !taskFilters.status.length && !taskFilters.priority.length && !taskFilters.assignedTo && !taskFilters.dateRange,
                            onClick: taskFilters.clearAll
                        }
                    ]
                },
                {
                    title: "Filters",
                    items: [
                        {
                            label: "Status",
                            icon: <CheckCircle2 size={18} />,
                            hasDropdown: true,
                            isActive: taskFilters.status.length > 0,
                            children: [
                                { label: "Open", onClick: () => taskFilters.toggleStatus("OPEN"), isActive: taskFilters.status.includes("OPEN") },
                                { label: "In Progress", onClick: () => taskFilters.toggleStatus("IN_PROGRESS"), isActive: taskFilters.status.includes("IN_PROGRESS") },
                                { label: "Review", onClick: () => taskFilters.toggleStatus("READY_FOR_REVIEW"), isActive: taskFilters.status.includes("READY_FOR_REVIEW") },
                                { label: "Done", onClick: () => taskFilters.toggleStatus("DONE"), isActive: taskFilters.status.includes("DONE") },
                            ]
                        },
                        {
                            label: "Priority",
                            icon: <Flag size={18} />,
                            hasDropdown: true,
                            isActive: taskFilters.priority.length > 0,
                            children: [
                                { label: "High", onClick: () => taskFilters.togglePriority("HIGH"), isActive: taskFilters.priority.includes("HIGH"), icon: <Flag size={12} className="text-red-500" /> },
                                { label: "Medium", onClick: () => taskFilters.togglePriority("MEDIUM"), isActive: taskFilters.priority.includes("MEDIUM"), icon: <Flag size={12} className="text-yellow-500" /> },
                                { label: "Low", onClick: () => taskFilters.togglePriority("LOW"), isActive: taskFilters.priority.includes("LOW"), icon: <Flag size={12} className="text-blue-500" /> },
                            ]
                        }
                    ]
                },
                {
                    title: "People & Time",
                    items: [
                        {
                            label: "Assigned To",
                            icon: <Users size={18} />,
                            hasDropdown: true,
                            isActive: !!taskFilters.assignedTo,
                            children: [
                                { label: "All Users", onClick: () => taskFilters.setAssignedTo("all"), isActive: !taskFilters.assignedTo },
                                ...users.map(u => ({
                                    label: u.email,
                                    onClick: () => taskFilters.setAssignedTo(u.id),
                                    isActive: taskFilters.assignedTo === u.id
                                }))
                            ]
                        },
                        {
                            label: "Date Range",
                            icon: <CalendarIcon size={18} />,
                            hasDropdown: true,
                            isActive: !!taskFilters.dateRange,
                            children: [
                                { label: "Any time", onClick: () => taskFilters.setDateRange("all_time"), isActive: !taskFilters.dateRange },
                                { label: "Today", onClick: () => taskFilters.setDateRange("today"), isActive: taskFilters.dateRange === 'today' },
                                { label: "Last 7 days", onClick: () => taskFilters.setDateRange("last_7_days"), isActive: taskFilters.dateRange === 'last_7_days' },
                                { label: "Last 30 days", onClick: () => taskFilters.setDateRange("last_30_days"), isActive: taskFilters.dateRange === 'last_30_days' },
                            ]
                        }
                    ]
                }
            ]
        },
        settings: {
            title: "Settings",
            sections: [
                {
                    title: "Integrations",
                    items: [
                        {
                            label: "Handoff Templates",
                            icon: <FileText size={18} />,
                            href: "/settings/templates",
                            isActive: pathname === "/settings/templates",
                        },
                        {
                            label: "Slack Integration",
                            icon: <MessageSquare size={18} />,
                            href: "/settings/slack",
                            isActive: pathname === "/settings/slack",
                        },
                    ]
                }
            ]
        }
    }), [pathname, taskFilters, users]) as Record<string, { title: string, sections: MenuSectionT[] }>;

    const currentContent = sidebarContent[activeSection as keyof typeof sidebarContent] ?? sidebarContent.dashboard;

    // Pass activeSection as activeView to children (DashboardView)
    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{ activeView?: string }>, {
                activeView: activeSection,
            });
        }
        return child;
    });

    return (
        <div className="relative flex h-screen w-full bg-black overflow-hidden">
            {/* 1. Icon Rail */}
            <IconNavigation
                activeSection={activeSection}
                userEmail={userEmail}
            />

            {/* 2. Collapsible Sidebar Panel */}
            <aside
                className={cn(
                    "bg-black flex flex-col pt-4 pb-4 border-r border-neutral-800 shrink-0 overflow-hidden",
                    "transition-[width,padding,opacity] duration-300",
                    isCollapsed
                        ? "w-0 px-0 opacity-0 pointer-events-none border-r-0"
                        : "w-64 px-4 opacity-100 pointer-events-auto"
                )}
                style={{
                    transitionTimingFunction: softSpringEasing,
                }}
            >
                <SectionTitle
                    title={currentContent.title}
                    onToggleCollapse={toggleCollapse}
                    isCollapsed={isCollapsed}
                />

                {activeSection === 'dashboard' && (
                    <SearchContainer
                        isCollapsed={isCollapsed}
                        onSearch={taskFilters.setSearch}
                        initialValue={taskFilters.search}
                    />
                )}

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {currentContent.sections.map((section, idx) => (
                        <MenuSection
                            key={idx}
                            section={section}
                            expandedItems={expandedItems}
                            onToggleExpanded={toggleExpanded}
                            isCollapsed={isCollapsed}
                        />
                    ))}
                </div>

                {/* Re-expand toggle — inline, no absolute overlap */}
            </aside>

            {isCollapsed && (
                <button
                    type="button"
                    onClick={toggleCollapse}
                    aria-label="Expand sidebar"
                    className="absolute left-16 top-4 z-30 -translate-x-1/2 rounded-r-md border border-l-0 border-neutral-800 bg-black px-2 py-2 text-neutral-500 shadow-lg transition-colors hover:text-neutral-200 hover:bg-neutral-900"
                    style={{
                        transitionTimingFunction: softSpringEasing,
                    }}
                >
                    <ChevronDown size={16} className="-rotate-90" />
                </button>
            )}

            {/* 3. Main Content Area */}
            <main className="flex-1 bg-background rounded-tl-xl my-2 mr-2 flex flex-col overflow-hidden shadow-xl border border-border/50">
                {childrenWithProps}
            </main>
        </div>
    );
}
