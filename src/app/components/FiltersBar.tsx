import { Filters } from '../types';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface FiltersBarProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void;
  onClearFilters: () => void;
}

const statusFilters = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'Pending Review' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Rejected', value: 'Rejected' },
];

export function FiltersBar({ filters, onFilterChange, onClearFilters }: FiltersBarProps) {
  const hasActiveFilters = filters.status !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4 p-4 bg-white border border-gray-200 rounded-lg">
      <span className="text-sm font-medium text-gray-700">Status:</span>

      <div className="inline-flex overflow-hidden rounded-md border border-gray-200 bg-gray-50">
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            type="button"
            variant={filters.status === filter.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange('status', filter.value)}
            className={
              filters.status === filter.value
                ? 'rounded-none bg-[#25476a] hover:bg-[#25476a]'
                : 'rounded-none'
            }
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={onClearFilters} className="ml-auto">
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
