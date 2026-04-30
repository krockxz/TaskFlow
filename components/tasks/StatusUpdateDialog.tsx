'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CustomFieldsRenderer } from '@/components/templates/CustomFieldsRenderer';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface StatusUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  targetStatus: string;
  requiredFields: any[];
  onSuccess: () => void;
}

export function StatusUpdateDialog({
  isOpen,
  onOpenChange,
  taskId,
  targetStatus,
  requiredFields,
  onSuccess,
}: StatusUpdateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {},
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      form.reset({});
    }
  }, [isOpen, form]);

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/tasks/set-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          status: targetStatus,
          customFields: values,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update status');
      }

      success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Required Information</DialogTitle>
          <DialogDescription>
            To move this task to <span className="font-semibold text-foreground uppercase">{targetStatus.replace(/_/g, ' ')}</span>, please fill in the following required information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <CustomFieldsRenderer fields={requiredFields} control={form.control} />
            
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Transition
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
