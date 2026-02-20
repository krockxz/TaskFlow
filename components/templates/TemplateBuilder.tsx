'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { handoffTemplateSchema } from '@/lib/validation/template';
import { TemplateStep, TemplateField } from '@/lib/types/template';
import { TaskStatus } from '@prisma/client';
import { useToast } from '@/lib/hooks/use-toast';

interface TemplateBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TemplateBuilder({ open, onOpenChange, onSuccess }: TemplateBuilderProps) {
  const [steps, setSteps] = useState<TemplateStep[]>([]);
  const { success, error } = useToast();

  const form = useForm({
    resolver: zodResolver(handoffTemplateSchema),
    defaultValues: {
      name: '',
      description: '',
      steps: [],
    },
  });

  const addStep = () => {
    const newStep: TemplateStep = {
      status: TaskStatus.OPEN,
      requiredFields: [],
      allowedTransitions: [],
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const addField = (stepIndex: number) => {
    const newField: TemplateField = {
      name: `field_${Date.now()}`,
      type: 'text',
      label: 'New Field',
      required: false,
    };
    const updated = [...steps];
    updated[stepIndex].requiredFields.push(newField);
    setSteps(updated);
  };

  const removeField = (stepIndex: number, fieldIndex: number) => {
    const updated = [...steps];
    updated[stepIndex].requiredFields.splice(fieldIndex, 1);
    setSteps(updated);
  };

  const updateField = (stepIndex: number, fieldIndex: number, updates: Partial<TemplateField>) => {
    const updated = [...steps];
    updated[stepIndex].requiredFields[fieldIndex] = {
      ...updated[stepIndex].requiredFields[fieldIndex],
      ...updates,
    };
    setSteps(updated);
  };

  const onSubmit = async (data: any) => {
    const payload = { ...data, steps };
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      success('Template created successfully');
      form.reset();
      setSteps([]);
      onSuccess?.();
      onOpenChange(false);
    } else {
      error('Failed to create template');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Handoff Template</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Template Name</Label>
            <Input {...form.register('name')} placeholder="Feature Development Workflow" />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea {...form.register('description')} placeholder="Standard workflow for..." />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Workflow Steps</Label>
              <Button type="button" size="sm" onClick={addStep}>
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </Button>
            </div>

            {steps.map((step, stepIndex) => (
              <div key={stepIndex} className="border rounded-lg p-4 space-y-3 mb-3">
                <div className="flex items-center justify-between">
                  <Badge>{step.status.replace(/_/g, ' ')}</Badge>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeStep(stepIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <Label>Required Fields</Label>
                  {step.requiredFields.length === 0 && (
                    <p className="text-sm text-muted-foreground mb-2">No required fields</p>
                  )}
                  {step.requiredFields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="flex gap-2 items-center mb-2">
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(stepIndex, fieldIndex, { label: e.target.value })}
                        placeholder="Field Label"
                      />
                      <Select
                        value={field.type}
                        onValueChange={(value) => updateField(stepIndex, fieldIndex, { type: value as any })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="textarea">Textarea</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="select">Select</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeField(stepIndex, fieldIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addField(stepIndex)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Field
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Template</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
