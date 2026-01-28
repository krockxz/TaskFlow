'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DateRangePreset } from '@/lib/types';

const TIME_RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'last_90_days', label: 'Last 90 days' },
  { value: 'all_time', label: 'All time' },
];

interface TimeRangeSelectorProps {
  defaultValue?: DateRangePreset;
}

export function TimeRangeSelector({ defaultValue = 'last_30_days' }: TimeRangeSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentValue = (searchParams.get('range') as DateRangePreset) || defaultValue;

  const handleChange = (value: DateRangePreset) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', value);
    router.push(`/analytics?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="time-range">Time Range:</Label>
      <Select
        value={currentValue}
        onValueChange={handleChange}
      >
        <SelectTrigger id="time-range" className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TIME_RANGE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
