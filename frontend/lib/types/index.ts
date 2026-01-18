/**
 * Shared Type Definitions for TaskFlow
 *
 * This file contains all shared types used across the application.
 * These types align with the Prisma schema for consistency.
 */

import type { User as SupabaseUser } from "@supabase/supabase-js";

// ============================================================================
// Task Types
// ============================================================================

export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'READY_FOR_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  createdById: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  createdBy: UserPreview;
  assignedToUser: UserPreview | null;
  events?: TaskEvent[];
}

export interface UserPreview {
  id: string;
  email: string;
}

// ============================================================================
// Task Event Types
// ============================================================================

export type EventType = 'CREATED' | 'ASSIGNED' | 'STATUS_CHANGED' | 'COMPLETED' | 'PRIORITY_CHANGED';

export interface TaskEvent {
  id: string;
  taskId: string;
  eventType: EventType;
  oldStatus: string | null;
  newStatus: string | null;
  changedById: string;
  createdAt: string;
  // Relations
  changedBy: UserPreview;
}

// ============================================================================
// Notification Types
// ============================================================================

export interface Notification {
  id: string;
  userId: string;
  taskId: string;
  message: string;
  read: boolean;
  createdAt: string;
  // Relations
  task?: {
    id: string;
    title: string;
    status: TaskStatus;
  };
}

// ============================================================================
// Presence Types
// ============================================================================

export interface PresenceState {
  userId: string;
  email: string;
  taskId: string;
  lastSeen: number;
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser extends SupabaseUser {
  id: string;
  email: string;
}

// ============================================================================
// Form Input Types
// ============================================================================

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: TaskPriority;
  assignedTo?: string;
}

export interface UpdateTaskStatusInput {
  taskId: string;
  status: string;
}

export interface AssignTaskInput {
  taskId: string;
  assignedTo: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================================================
// Query Keys (for TanStack Query)
// ============================================================================

export const queryKeys = {
  tasks: ['tasks'] as const,
  task: (id: string) => ['tasks', id] as const,
  notifications: ['notifications'] as const,
  notificationsUnread: ['notifications', 'unread-count'] as const,
  users: ['users'] as const,
} as const;

// ============================================================================
// Auth Types
// ============================================================================

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
}
