import { Task, TaskStatus, TaskPriority } from '@prisma/client';

export interface ShiftBriefContext {
  tasks: Task[];
  userName: string;
  timeframe: string;
}

/**
 * Generate an AI prompt for Shift Brief generation.
 *
 * This function creates a context-aware prompt that helps the AI understand
 * what tasks are relevant, their priorities, and what the user needs to know
 * for async handoffs across timezones.
 *
 * @param context - Object containing tasks, user name, and timeframe
 * @returns A formatted prompt string for the AI model
 */
export function generateShiftBriefPrompt(context: ShiftBriefContext): string {
  const { tasks, userName, timeframe } = context;

  // Group tasks by status
  const completed = tasks.filter((t) => t.status === TaskStatus.DONE);
  const inProgress = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS);
  const readyForReview = tasks.filter((t) => t.status === TaskStatus.READY_FOR_REVIEW);
  const open = tasks.filter((t) => t.status === TaskStatus.OPEN);

  // Identify high priority items that need attention
  const highPriority = tasks.filter(
    (t) => t.priority === TaskPriority.HIGH && t.status !== TaskStatus.DONE
  );

  // Identify overdue tasks
  const now = new Date();
  const overdue = tasks.filter(
    (t) => t.dueDate && t.dueDate < now && t.status !== TaskStatus.DONE
  );

  return `You are a project coordination assistant. Generate a concise shift brief for ${userName} covering the last ${timeframe}.

FOCUS: Async handoffs across timezones. Help the user understand what they need to know.

TASKS SUMMARY:
- Completed: ${completed.length} tasks
- In Progress: ${inProgress.length} tasks
- Ready for Review: ${readyForReview.length} tasks
- Open: ${open.length} tasks

${highPriority.length > 0 ? `
HIGH PRIORITY ITEMS:
${highPriority.map((t) => `- ${t.title}${t.dueDate ? ` (due: ${t.dueDate.toISOString().split('T')[0]})` : ''}`).join('\n')}
` : ''}

${overdue.length > 0 ? `
OVERDUE TASKS:
${overdue.map((t) => `- ${t.title} (was due: ${t.dueDate?.toISOString().split('T')[0]})`).join('\n')}
` : ''}

RECENTLY COMPLETED:
${completed.length > 0 ? completed.slice(0, 5).map((t) => `- ${t.title}`).join('\n') : 'None'}

IN PROGRESS:
${inProgress.length > 0 ? inProgress.map((t) => `- ${t.title}${t.assignedTo ? ` (assigned)` : ''}`).join('\n') : 'None'}

Generate a brief, actionable summary in markdown format with these sections:
## Quick Summary (2-3 sentences)
## Completed Work (last 5)
## In Progress
## Ready for Review
## Attention Needed (high priority, overdue, or blocked)

Keep it under 300 words. Be specific but concise. Use bullet points for clarity.`;
}
