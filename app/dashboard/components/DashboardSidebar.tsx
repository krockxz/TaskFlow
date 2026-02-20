"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    LogOut,
    Search,
    ChevronDown,
    Filter,
    Calendar as CalendarIcon,
    Flag,
    CheckCircle2,
    Users,
    Loader2,
    Settings,
    Github,
    Globe,
} from "lucide-react";
import { useTaskFilters } from "@/app/dashboard/hooks/useTaskFilters";
import { signOut } from "@/lib/auth/oauth-helpers";
import { cn } from "@/lib/utils";

// Smooth easing — no overshoot
const softSpringEasing = "cubic-bezier(0.4, 0, 0.2, 1)";

/* ----------------------------- Brand / Logos ----------------------------- */

function InterfacesLogoSquare() {
    return (
        <div className="flex items-center justify-center font-bold text-xl text-white tracking-tighter">
            TF
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

interface MenuItemT {
    id?: string;
    icon?: React.ReactNode;
    label: string;
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
    onSectionChange,
    userEmail
}: {
    activeSection: string;
    onSectionChange: (section: string) => void;
    userEmail: string;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleLogout = async () => {
        const { error } = await signOut();
        if (!error) {
            startTransition(() => {
                router.push('/');
                router.refresh();
            });
        }
    };

    const navItems = [
        { id: "dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
        { id: "timezone-lanes", icon: <Globe size={20} />, label: "Timezone Lanes", href: "/dashboard/timezone-lanes" },
        { id: "filters", icon: <Filter size={20} />, label: "Filters" },
        { id: "settings", icon: <Settings size={20} />, label: "Settings" },
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
                        onClick={() => !item.href && onSectionChange(item.id)}
                        tooltip={item.label}
                        href={(item as any).href}
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
    const handleClick = () => {
        if (item.hasDropdown && onToggle) onToggle();
        else item.onClick?.();
    };

    // Active state styling
    const isActive = item.isActive;

    return (
        <div
            className={`relative shrink-0 transition-all duration-500 ${isCollapsed ? "w-full flex justify-center" : "w-full"
                }`}
        >
            <div
                className={cn(
                    "rounded-md cursor-pointer transition-all duration-200 flex items-center relative select-none",
                    isActive ? "bg-neutral-800 text-white" : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200",
                    isCollapsed ? "size-10 justify-center" : "w-full min-h-[40px] px-3 py-2"
                )}
                onClick={handleClick}
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

interface DashboardSidebarProps {
    children: React.ReactNode;
    users: { id: string; email: string }[];
    userEmail: string;
}

export function DashboardSidebar({ children, users, userEmail }: DashboardSidebarProps) {
    const [activeSection, setActiveSection] = useState("filters");
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(["Status-0-Status", "Priority-0-Priority"]));

    const taskFilters = useTaskFilters();
    const { filters, actions } = taskFilters;

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
                            isActive: !filters.status.length && !filters.priority.length && !filters.assignedTo && !filters.dateRange,
                            onClick: actions.clearAll
                        }
                    ]
                }
            ]
        },
        filters: {
            title: "Filters",
            sections: [
                {
                    title: "Properties",
                    items: [
                        {
                            label: "Status",
                            icon: <CheckCircle2 size={18} />,
                            hasDropdown: true,
                            isActive: filters.status.length > 0,
                            children: [
                                { label: "Open", onClick: () => actions.toggleStatus("OPEN"), isActive: filters.status.includes("OPEN") },
                                { label: "In Progress", onClick: () => actions.toggleStatus("IN_PROGRESS"), isActive: filters.status.includes("IN_PROGRESS") },
                                { label: "Review", onClick: () => actions.toggleStatus("READY_FOR_REVIEW"), isActive: filters.status.includes("READY_FOR_REVIEW") },
                                { label: "Done", onClick: () => actions.toggleStatus("DONE"), isActive: filters.status.includes("DONE") },
                            ]
                        },
                        {
                            label: "Priority",
                            icon: <Flag size={18} />,
                            hasDropdown: true,
                            isActive: filters.priority.length > 0,
                            children: [
                                { label: "High", onClick: () => actions.togglePriority("HIGH"), isActive: filters.priority.includes("HIGH"), icon: <Flag size={12} className="text-red-500" /> },
                                { label: "Medium", onClick: () => actions.togglePriority("MEDIUM"), isActive: filters.priority.includes("MEDIUM"), icon: <Flag size={12} className="text-yellow-500" /> },
                                { label: "Low", onClick: () => actions.togglePriority("LOW"), isActive: filters.priority.includes("LOW"), icon: <Flag size={12} className="text-blue-500" /> },
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
                            isActive: !!filters.assignedTo,
                            children: [
                                { label: "All Users", onClick: () => actions.setAssignedTo("all"), isActive: !filters.assignedTo },
                                ...users.map(u => ({
                                    label: u.email,
                                    onClick: () => actions.setAssignedTo(u.id),
                                    isActive: filters.assignedTo === u.id
                                }))
                            ]
                        },
                        {
                            label: "Date Range",
                            icon: <CalendarIcon size={18} />,
                            hasDropdown: true,
                            isActive: !!filters.dateRange,
                            children: [
                                { label: "Any time", onClick: () => actions.setDateRange("all_time"), isActive: !filters.dateRange },
                                { label: "Today", onClick: () => actions.setDateRange("today"), isActive: filters.dateRange === 'today' },
                                { label: "Last 7 days", onClick: () => actions.setDateRange("last_7_days"), isActive: filters.dateRange === 'last_7_days' },
                                { label: "Last 30 days", onClick: () => actions.setDateRange("last_30_days"), isActive: filters.dateRange === 'last_30_days' },
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
                            label: "GitHub",
                            icon: <Github size={18} />,
                            isActive: false,
                        }
                    ]
                }
            ]
        }
    }), [filters.status, filters.priority, filters.assignedTo, filters.dateRange, actions, users]) as Record<string, { title: string, sections: MenuSectionT[] }>;

    const currentContent = sidebarContent[activeSection] || sidebarContent.filters;

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
        <div className="flex h-screen w-full bg-black">
            {/* 1. Icon Rail */}
            <IconNavigation
                activeSection={activeSection}
                onSectionChange={(s) => {
                    setActiveSection(s);
                    if (isCollapsed) setIsCollapsed(false);
                }}
                userEmail={userEmail}
            />

            {/* 2. Collapsible Sidebar Panel */}
            <aside
                className={cn(
                    "bg-black flex flex-col pt-4 pb-4 transition-all duration-500 overflow-hidden border-r border-neutral-800",
                    isCollapsed ? "w-0 opacity-0 px-0 border-none" : "w-64 px-4 opacity-100"
                )}
                style={{ transitionTimingFunction: softSpringEasing }}
            >
                <SectionTitle
                    title={currentContent.title}
                    onToggleCollapse={toggleCollapse}
                    isCollapsed={isCollapsed}
                />

                {activeSection === 'filters' && (
                    <SearchContainer
                        isCollapsed={isCollapsed}
                        onSearch={actions.setSearch}
                        initialValue={filters.search}
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
                {isCollapsed && (
                    <button
                        onClick={toggleCollapse}
                        className="mt-2 mx-auto p-2 rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
                    >
                        <ChevronDown size={16} className="-rotate-90" />
                    </button>
                )}
            </aside>

            {/* 3. Main Content Area */}
            <main className="flex-1 bg-background rounded-tl-xl my-2 mr-2 flex flex-col overflow-hidden shadow-xl border border-border/50">
                {childrenWithProps}
            </main>
        </div>
    );
}
