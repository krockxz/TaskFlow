'use client';

import { Control } from 'react-hook-form';
import { TemplateField } from '@/lib/types/template';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface CustomFieldsRendererProps {
  fields: TemplateField[];
  control: Control<any>;
  values?: Record<string, any>;
}

export function CustomFieldsRenderer({ fields, control, values }: CustomFieldsRendererProps) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <FormField
          key={field.name}
          control={control}
          name={`customFields.${field.name}`}
          defaultValue={values?.[field.name]}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              <FormControl>
                {field.type === 'text' && (
                  <Input
                    {...formField}
                    placeholder={field.label}
                    required={field.required}
                  />
                )}
                {field.type === 'textarea' && (
                  <Textarea
                    {...formField}
                    placeholder={field.label}
                    required={field.required}
                    rows={3}
                  />
                )}
                {field.type === 'number' && (
                  <Input
                    {...formField}
                    type="number"
                    placeholder={field.label}
                    required={field.required}
                    onChange={(e) => formField.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
                {field.type === 'date' && (
                  <Input
                    {...formField}
                    type="date"
                    required={field.required}
                  />
                )}
                {field.type === 'select' && (
                  <Select
                    onValueChange={formField.onChange}
                    defaultValue={formField.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
