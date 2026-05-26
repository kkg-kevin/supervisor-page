import { Filters } from '../types';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Search } from 'lucide-react';

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
  const hasActiveFilters = filters.status !== 'all' || filters.search.trim() !== '';

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            value={filters.search}
            onChange={(event) => onFilterChange('search', event.target.value)}
            placeholder="Search claims..."
            className="h-8 pl-9 text-sm"
            aria-label="Search submitted course claims"
          />
        </div>

        <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
          <SelectTrigger size="sm" className="w-full sm:w-40" aria-label="Filter claims by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusFilters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="self-start text-sm text-gray-500 hover:text-blue-600 sm:self-auto"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
