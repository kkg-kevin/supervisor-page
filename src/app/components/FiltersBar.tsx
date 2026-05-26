import { Filters } from '../types';

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
    <div className="mb-4 flex items-center border-b border-gray-200 bg-white">
      <div className="flex items-center gap-8">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => onFilterChange('status', filter.value)}
            className={`border-b-2 px-0 py-3 text-sm transition-colors ${
              filters.status === filter.value
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-950 hover:text-blue-600'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="ml-auto py-3 text-sm text-gray-500 hover:text-blue-600"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
