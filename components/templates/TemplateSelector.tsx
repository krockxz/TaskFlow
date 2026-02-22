'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HandoffTemplate } from '@prisma/client';
import { CustomFieldsRenderer } from './CustomFieldsRenderer';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Loader2, AlertCircle } from 'lucide-react';
import type { HandoffTemplateStep } from '@/lib/types/template';
import type { Control } from 'react-hook-form';

interface TemplateSelectorProps {
  control: Control<any>; // Using any to support different form schemas
  onTemplateChange?: (template: HandoffTemplate | null) => void;
}

async function fetchTemplates(): Promise<HandoffTemplate[]> {
  const response = await fetch('/api/templates');
  if (!response.ok) {
    throw new Error(`Failed to fetch templates: ${response.statusText}`);
  }
  return response.json();
}

export function TemplateSelector({ control, onTemplateChange }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<HandoffTemplate | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);

  const {
    data: templates = [],
    isLoading,
    error,
  } = useQuery<HandoffTemplate[], Error>({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId) || null;
    setSelectedTemplate(template);
    onTemplateChange?.(template);
  };

  const handleStatusChange = (status: string) => {
    setCurrentStatus(status);
  };

  // Get required fields for current status
  const templateSteps = selectedTemplate?.steps as unknown as HandoffTemplateStep[] | undefined;
  const currentStep = templateSteps?.find(
    (step) => step.status === currentStatus
  );

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="templateId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Template (Optional)</FormLabel>
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading templates...
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                Failed to load templates. Please try again.
              </div>
            )}
            {!isLoading && !error && (
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleTemplateChange(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormItem>
        )}
      />

      {selectedTemplate && (
        <FormField
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Status</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleStatusChange(value);
                }}
                defaultValue={field.value || 'OPEN'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(selectedTemplate.steps as unknown as HandoffTemplateStep[])?.map((step) => (
                    <SelectItem key={step.status} value={step.status}>
                      {step.status.replace(/_/g, ' ').toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      )}

      {currentStep && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Required Fields</h4>
          <CustomFieldsRenderer
            fields={currentStep.requiredFields}
            control={control}
          />
        </div>
      )}
    </div>
  );
}
