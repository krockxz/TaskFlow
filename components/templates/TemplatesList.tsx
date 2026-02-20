'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { HandoffTemplate } from '@prisma/client';
import { TemplateBuilder } from './TemplateBuilder';
import { motion } from 'motion/react';
import { useToast } from '@/lib/hooks/use-toast';

interface TemplatesListProps {
  templates: HandoffTemplate[];
}

export function TemplatesList({ templates }: TemplatesListProps) {
  const [builderOpen, setBuilderOpen] = useState(false);
  const { success, error } = useToast();

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;

    const response = await fetch(`/api/templates/${id}`, { method: 'DELETE' });

    if (response.ok) {
      success('Template deleted successfully');
      window.location.reload();
    } else {
      error('Failed to delete template');
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setBuilderOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <motion.div
        layout
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {templates.map((template, index) => (
          <motion.div
            key={template.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.05,
              duration: 0.3,
              ease: 'easeOut',
            }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="h-full">
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 mb-4">
                {(template.steps as any[])?.map((step: any) => (
                  <Badge key={step.status} variant="secondary">
                    {step.status.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(template.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        ))}
      </motion.div>

      <TemplateBuilder
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
