/**
 * Shared API Schemas
 *
 * Common Zod schemas used across API routes to ensure consistency.
 */

import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@prisma/client';

// ============================================================================
// Task Common Schemas
// ============================================================================

/**
 * Standard UUID validation for task IDs
 */
export const taskIdSchema = z.string().uuid('Invalid task ID format');

/**
 * User ID validation (nullable for unassigned tasks)
 */
export const assignedToSchema = z.string().uuid('Invalid user ID format').nullable();

/**
 * User ID validation (optional, non-null)
 */
export const assignedToOptionalSchema = z.string().uuid('Invalid user ID format').optional();

/**
 * Task priority enum schema
 */
export const taskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH'], {
  errorMap: () => ({ message: 'Priority must be LOW, MEDIUM, or HIGH' }),
});

/**
 * Task status enum schema
 */
export const taskStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'DONE'], {
  errorMap: () => ({ message: 'Status must be OPEN, IN_PROGRESS, READY_FOR_REVIEW, or DONE' }),
});

// ============================================================================
// Composite Request Schemas
// ============================================================================

/**
 * Base schema for task operations requiring task ID
 */
export const taskOperationSchema = z.object({
  taskId: taskIdSchema,
});

/**
 * Schema for status update requests
 */
export const updateStatusRequestSchema = taskOperationSchema.extend({
  status: taskStatusSchema,
});

/**
 * Schema for priority update requests
 */
export const updatePriorityRequestSchema = taskOperationSchema.extend({
  priority: taskPrioritySchema,
});

/**
 * Schema for reassignment requests
 */
export const reassignRequestSchema = taskOperationSchema.extend({
  assignedTo: assignedToSchema,
});

/**
 * Schema for reassignment requests (optional assignee)
 */
export const reassignOptionalSchema = taskOperationSchema.extend({
  assignedTo: assignedToOptionalSchema,
});

// ============================================================================
// Bulk Action Schemas
// ============================================================================

/**
 * Bulk action types
 */
export const bulkActionSchema = z.enum(['delete', 'changeStatus', 'changePriority', 'reassign']);

/**
 * Bulk status change payload
 */
export const bulkStatusPayloadSchema = z.object({
  status: taskStatusSchema,
});

/**
 * Bulk priority change payload
 */
export const bulkPriorityPayloadSchema = z.object({
  priority: taskPrioritySchema,
});

/**
 * Bulk reassignment payload
 */
export const bulkReassignPayloadSchema = z.object({
  assignedTo: z.string().min(1, 'Assignee ID is required'),
});

/**
 * Full bulk request schema with discriminated union for payloads
 */
export const bulkRequestSchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1, 'At least one task ID is required'),
  action: bulkActionSchema,
  payload: z
    .discriminatedUnion('action', [
      z.object({
        action: z.literal('changeStatus'),
        ...bulkStatusPayloadSchema.shape,
      }),
      z.object({
        action: z.literal('changePriority'),
        ...bulkPriorityPayloadSchema.shape,
      }),
      z.object({
        action: z.literal('reassign'),
        ...bulkReassignPayloadSchema.shape,
      }),
    ])
    .optional()
    .transform((val) => {
      // Extract just the action-specific payload
      if (!val) return undefined;
      const { action, ...rest } = val;
      return rest as { status?: TaskStatus; priority?: TaskPriority; assignedTo?: string };
    }),
});

// ============================================================================
// Task Creation Schemas
// ============================================================================

/**
 * Schema for task creation requests
 */
export const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  priority: taskPrioritySchema.default('MEDIUM'),
  assignedTo: assignedToOptionalSchema,
  dueDate: z.string().datetime().optional(),
  templateId: z.string().uuid().optional(),
  customFields: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  status: taskStatusSchema.optional(),
  timezone: z.string().optional(),
});

// ============================================================================
// Set Status with Custom Fields Schema (for template support)
// ============================================================================

/**
 * Schema for setting status with custom fields (template support)
 */
export const setStatusWithCustomFieldsSchema = z.object({
  id: taskIdSchema,
  status: taskStatusSchema,
  customFields: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});
