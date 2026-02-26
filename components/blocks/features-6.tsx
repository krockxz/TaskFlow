/**
 * Features Section - Vercel Design System
 *
 * Modern showcase with monochrome palette and subtle styling.
 */

'use client';

import { Bell, BarChart3, Users, Zap, Search, LayoutDashboard, CheckSquare, Settings, Moon, MoreHorizontal } from 'lucide-react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { SPRING_PRESETS, STAGGER } from '@/lib/constants/animations';
import { Z_INDEX } from '@/lib/constants/layout';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: STAGGER.FAST,
            delayChildren: 0.1
        }
    }
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            ...SPRING_PRESETS.SOFT
        }
    }
} as const;

// Animated task data
const taskPool = [
    { id: 1, title: "Fix authentication middleware redirect issue", status: "in-progress" as const, priority: "high" as const, assignee: "JD", due: "Today" },
    { id: 2, title: "Update landing page hero section design", status: "todo" as const, priority: "medium" as const, assignee: "SK", due: "Tomorrow" },
    { id: 3, title: "Review PR #142 - user profile refactor", status: "in-progress" as const, priority: "low" as const, assignee: "MR", due: "Jan 31" },
    { id: 4, title: "Set up CI/CD pipeline for staging", status: "done" as const, priority: "high" as const, assignee: "JD", due: "Completed" },
    { id: 5, title: "Implement dark mode toggle in settings", status: "todo" as const, priority: "low" as const, assignee: "SK", due: "Feb 2" },
    { id: 6, title: "Add team presence indicators to tasks", status: "in-progress" as const, priority: "medium" as const, assignee: "AL", due: "Today" },
    { id: 7, title: "Optimize database query performance", status: "todo" as const, priority: "high" as const, assignee: "MR", due: "Feb 1" },
];

const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
        "todo": "bg-secondary text-muted-foreground border border-border",
        "in-progress": "bg-secondary text-foreground border border-foreground/20",
        "done": "bg-secondary text-muted-foreground/70 border border-border"
    };
    const labels = { "todo": "Todo", "in-progress": "Active", "done": "Done" };
    return (
        <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium ${styles[status as keyof typeof styles]}`}
        >
            {labels[status as keyof typeof labels]}
        </motion.span>
    );
};

const PriorityIndicator = ({ priority }: { priority: string }) => {
    const colors = {
        "high": "bg-foreground",
        "medium": "bg-foreground/50",
        "low": "bg-foreground/20"
    };
    return (
        <div className="flex gap-0.5 flex-shrink-0">
            {[1, 2].map((i) => (
                <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`w-1 h-3 rounded-full ${priority === 'high' ? colors.high : priority === 'medium' ? (i === 1 ? colors.medium : 'bg-border') : colors.low}`}
                />
            ))}
        </div>
    );
};

const AnimatedTaskRow = ({ task, index }: { task: typeof taskPool[0]; index: number }) => (
    <motion.div
        key={task.id}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, x: -50 }}
        transition={{ delay: index * 0.1 }}
        className="flex flex-wrap md:flex-nowrap items-center px-4 py-2 md:h-12 gap-x-2 gap-y-1 hover:bg-secondary/50 transition-colors"
    >
        <motion.div
            className="w-4 h-4 rounded border border-border mr-3 flex-shrink-0"
            whileHover={{ scale: 1.1 }}
        />
        <StatusBadge status={task.status} />
        <span className="flex-1 min-w-[8rem] md:min-w-0 ml-3 text-sm truncate pr-4">{task.title}</span>
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            <PriorityIndicator priority={task.priority} />
            <div className="flex items-center gap-2 mr-1">
                <motion.div
                    className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center text-background text-[10px] font-medium"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {task.assignee}
                </motion.div>
                <motion.div
                    className="w-2 h-2 rounded-full bg-foreground border-2 border-card"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                />
            </div>
            <span className="text-xs text-muted-foreground w-16 text-right">{task.due}</span>
        </div>
    </motion.div>
);

interface StatCardProps {
    label: string;
    value: number | string;
    change: string;
    icon: React.ComponentType<{ className?: string }>;
    delay: number;
}

const StatCard = ({ label, value, change, icon: Icon, delay }: StatCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay, type: "spring" as const, ...SPRING_PRESETS.SOFT }}
        className="bg-card rounded-xl border border-border p-4 relative overflow-hidden group"
    >
        <div className="flex items-center justify-between mb-3 relative">
            <span className="text-xs text-muted-foreground font-medium">{label}</span>
            <motion.div
                className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center border border-border"
                whileHover={{ rotate: 5 }}
            >
                <Icon className="w-3.5 h-3.5 text-foreground" />
            </motion.div>
        </div>
        <div className="text-2xl font-semibold text-foreground relative">
            {value}
        </div>
        <div className="text-xs text-muted-foreground mt-1.5 relative">{change}</div>
    </motion.div>
);

export function Features() {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
    const [visibleTasks, setVisibleTasks] = useState(taskPool.slice(0, 4));

    // Auto-rotate tasks
    useEffect(() => {
        if (!isInView) return;

        const interval = setInterval(() => {
            setVisibleTasks(prev => {
                const nextIndex = (prev[0].id) % taskPool.length;
                const nextTask = taskPool.find(t => t.id === nextIndex + 1);
                if (nextTask && !prev.find(t => t.id === nextTask.id)) {
                    return [...prev.slice(1), nextTask];
                }
                return prev;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [isInView]);

    return (
        <section ref={sectionRef} className="py-32 overflow-hidden">
            <div className="mx-auto max-w-5xl space-y-20 px-6">
                {/* Header */}
                <motion.div
                    className="grid items-center gap-6 md:grid-cols-2 md:gap-12"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <motion.h2
                        className="text-4xl md:text-5xl font-semibold tracking-tight-vercel text-foreground"
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        Everything you need to manage tasks effectively
                    </motion.h2>
                    <motion.p
                        className="text-muted-foreground text-lg max-w-sm sm:ml-auto leading-relaxed"
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Powerful features that keep your distributed team aligned, productive, and always in sync.
                    </motion.p>
                </motion.div>

                {/* App Showcase */}
                <motion.div
                    className="relative rounded-2xl p-2 md:-mx-8"
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
                >
                    <div className="h-[540px] relative overflow-hidden rounded-xl bg-gradient-to-br from-background via-background to-secondary/30 border border-border">
                        {/* Browser Chrome */}
                        <motion.div
                            className="absolute top-0 left-0 right-0 h-11 bg-secondary/30 border-b border-border flex items-center px-4 gap-3"
                            style={{ zIndex: Z_INDEX.STICKY }}
                            initial={{ y: -20 }}
                            animate={isInView ? { y: 0 } : {}}
                            transition={{ delay: 0.5, type: "spring" }}
                        >
                            <div className="flex gap-2">
                                <motion.div
                                    className="w-3 h-3 rounded-full bg-foreground/20"
                                    whileHover={{ scale: 1.2 }}
                                />
                                <motion.div
                                    className="w-3 h-3 rounded-full bg-foreground/20"
                                    whileHover={{ scale: 1.2 }}
                                />
                                <motion.div
                                    className="w-3 h-3 rounded-full bg-foreground/20"
                                    whileHover={{ scale: 1.2 }}
                                />
                            </div>
                            <div className="flex-1 max-w-xs mx-auto">
                                <div className="h-7 rounded-full bg-background border border-border/50 px-4 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                                    <motion.div
                                        className="flex-1 h-1 rounded-full bg-secondary"
                                        initial={{ width: 0 }}
                                        animate={isInView ? { width: "100%" } : {}}
                                        transition={{ delay: 0.8, duration: 0.8 }}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* App Container */}
                        <div className="absolute inset-0 top-11 flex">
                            {/* Sidebar */}
                            <motion.div
                                className="w-56 border-r border-border bg-secondary/20 flex flex-col hidden sm:flex"
                                initial={{ x: -50, opacity: 0 }}
                                animate={isInView ? { x: 0, opacity: 1 } : {}}
                                transition={{ delay: 0.6, type: "spring" }}
                            >
                                <div className="h-14 border-b border-border flex items-center px-5 gap-3">
                                    <motion.div
                                        className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center"
                                        whileHover={{ rotate: 5 }}
                                    >
                                        <span className="text-background text-sm font-bold">T</span>
                                    </motion.div>
                                    <span className="font-semibold text-sm">TaskFlow</span>
                                </div>

                                <div className="flex-1 p-4 space-y-1">
                                    {[
                                        { icon: LayoutDashboard, label: "Dashboard", active: true },
                                        { icon: CheckSquare, label: "Tasks", active: false },
                                        { icon: BarChart3, label: "Analytics", active: false },
                                        { icon: Settings, label: "Settings", active: false },
                                    ].map((item, i) => (
                                        <motion.div
                                            key={item.label}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${item.active
                                                ? "bg-secondary text-foreground"
                                                : "text-muted-foreground hover:bg-secondary/50"
                                                }`}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={isInView ? { x: 0, opacity: 1 } : {}}
                                            transition={{ delay: 0.7 + i * 0.05 }}
                                            whileHover={{ x: 4 }}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                <motion.div
                                    className="p-4 border-t border-border"
                                    initial={{ opacity: 0 }}
                                    animate={isInView ? { opacity: 1 } : {}}
                                    transition={{ delay: 0.9 }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-foreground flex items-center justify-center text-background text-xs font-medium">
                                            JD
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">John Doe</div>
                                            <div className="text-xs text-muted-foreground truncate">john@taskflow.io</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Main Content */}
                            <motion.div
                                className="flex-1 flex flex-col bg-background"
                                initial={{ opacity: 0 }}
                                animate={isInView ? { opacity: 1 } : {}}
                                transition={{ delay: 0.8 }}
                            >
                                {/* Header */}
                                <div className="h-14 border-b border-border flex items-center justify-between px-6">
                                    <div className="flex items-center gap-4">
                                        <h1 className="text-lg font-semibold">Dashboard</h1>
                                        <div className="hidden sm:flex h-5 w-px bg-border" />
                                        <motion.div
                                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border"
                                            whileFocus={{ scale: 1.02 }}
                                        >
                                            <Search className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Search tasks...</span>
                                        </motion.div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            className="relative"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Bell className="w-4.5 h-4.5 text-muted-foreground" />
                                            <motion.div
                                                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-foreground"
                                                animate={{ scale: [1, 1.3, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            />
                                        </motion.div>
                                        <Moon className="w-4.5 h-4.5 text-muted-foreground hidden sm:block" />
                                        <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-background text-xs font-medium">
                                            JD
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-hidden p-5 space-y-5">
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <StatCard label="Total" value="24" change="+4 this week" icon={CheckSquare} delay={0} />
                                        <StatCard label="Active" value="8" change="5 online" icon={LayoutDashboard} delay={0.1} />
                                        <StatCard label="Done" value="16" change="+12 today" icon={BarChart3} delay={0.2} />
                                        <StatCard label="Overdue" value="3" change="Needs attention" icon={Zap} delay={0.3} />
                                    </div>

                                    {/* Task Table */}
                                    <motion.div
                                        className="bg-card rounded-xl border border-border overflow-hidden"
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={isInView ? { y: 0, opacity: 1 } : {}}
                                        transition={{ delay: 1 }}
                                    >
                                        <div className="h-12 border-b border-border bg-secondary/30 flex items-center px-4 gap-3">
                                            <div className="flex items-center gap-2">
                                                <motion.div
                                                    className="w-4 h-4 rounded border border-border"
                                                    animate={{ borderColor: ["hsl(var(--border))", "hsl(var(--foreground))", "hsl(var(--border))"] }}
                                                    transition={{ duration: 3, repeat: Infinity }}
                                                />
                                                <span className="text-sm font-medium">Recent Tasks</span>
                                            </div>
                                            <div className="ml-auto flex items-center gap-2">
                                                <motion.button
                                                    className="px-2.5 py-1 text-xs rounded-md bg-background border border-border hover:bg-secondary transition-colors"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Filter
                                                </motion.button>
                                                <motion.button
                                                    className="px-2.5 py-1 text-xs rounded-md bg-foreground text-background"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    New Task
                                                </motion.button>
                                            </div>
                                        </div>

                                        <div className="divide-y divide-border/50">
                                            <AnimatePresence mode="popLayout">
                                                {visibleTasks.map((task, index) => (
                                                    <AnimatedTaskRow key={task.id} task={task} index={index} />
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                        {/* Fade-out overlay matching section background */}
                        <div
                            className="absolute bottom-0 left-0 right-0 h-52 pointer-events-none"
                            style={{
                                background: 'linear-gradient(to bottom, transparent, hsl(var(--background)))',
                                zIndex: Z_INDEX.SIDEBAR
                            }}
                        />
                    </div>
                </motion.div>

                {/* Feature Items */}
                <motion.div
                    className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-8 lg:grid-cols-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                >
                    {[
                        { icon: Bell, title: "Real-time Updates", desc: "Get instant notifications when tasks are assigned, updated, or completed." },
                        { icon: Users, title: "Team Presence", desc: "See who's viewing each task right now for better collaboration." },
                        { icon: Settings, title: "Smart Filtering", desc: "Filter by status, priority, assignee, or custom date ranges." },
                        { icon: Zap, title: "Bulk Actions", desc: "Update multiple tasks at once to save time and effort." },
                    ].map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            variants={itemVariants}
                            className="space-y-3"
                        >
                            <motion.div
                                className="flex items-center gap-2"
                                whileHover={{ x: 4 }}
                            >
                                <feature.icon className="w-5 h-5 text-foreground" />
                                <h3 className="text-sm font-medium text-foreground">{feature.title}</h3>
                            </motion.div>
                            <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
