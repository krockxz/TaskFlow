import { z } from 'zod';
import { TaskStatus } from '@prisma/client';

export const templateFieldSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(['text', 'textarea', 'number', 'date', 'select']),
  label: z.string().min(1).max(100),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
}).refine(
  (data) => data.type !== 'select' || (data.options && data.options.length > 0),
  { message: "Select fields must have options" }
);

export const templateStepSchema = z.object({
  status: z.nativeEnum(TaskStatus),
  requiredFields: z.array(templateFieldSchema),
  allowedTransitions: z.array(z.nativeEnum(TaskStatus)),
});

export const handoffTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  steps: z.array(templateStepSchema).min(1),
});

export const customFieldsSchema = z.record(z.union([z.string(), z.number(), z.boolean(), z.null()]));
