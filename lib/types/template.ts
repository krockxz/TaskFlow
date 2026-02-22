import { TaskStatus } from '@prisma/client';

export type CustomFieldValue = string | number | boolean | null;

export interface TemplateField {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select';
  label: string;
  required: boolean;
  options?: string[];
}

/**
 * HandoffTemplateStep - Type for template steps stored in database
 * This matches the schema defined in lib/validation/template.ts
 */
export interface HandoffTemplateStep {
  status: TaskStatus;
  requiredFields: TemplateField[];
  allowedTransitions: TaskStatus[];
}

export interface TemplateStep {
  status: TaskStatus;
  requiredFields: TemplateField[];
  allowedTransitions: TaskStatus[];
}

export interface HandoffTemplateInput {
  name: string;
  description?: string;
  steps: TemplateStep[];
}

export interface CustomFieldsData {
  [fieldName: string]: CustomFieldValue;
}
