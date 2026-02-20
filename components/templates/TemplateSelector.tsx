'use client';

import { useEffect, useState } from 'react';
import { Control } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HandoffTemplate } from '@prisma/client';
import { CustomFieldsRenderer } from './CustomFieldsRenderer';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';

interface TemplateSelectorProps {
  control: Control<any>;
  onTemplateChange?: (template: HandoffTemplate | null) => void;
}

export function TemplateSelector({ control, onTemplateChange }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<HandoffTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<HandoffTemplate | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data) => setTemplates(data))
      .catch(console.error);
  }, []);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId) || null;
    setSelectedTemplate(template);
    onTemplateChange?.(template);
  };

  const handleStatusChange = (status: string) => {
    setCurrentStatus(status);
  };

  // Get required fields for current status
  const templateSteps = selectedTemplate?.steps as any[] | undefined;
  const currentStep = templateSteps?.find(
    (step: any) => step.status === currentStatus
  );

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="templateId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Template (Optional)</FormLabel>
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
                  {(selectedTemplate.steps as any[])?.map((step: any) => (
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
