import { Filters } from '../types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface FiltersBarProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void;
  onClearFilters: () => void;
}

export function FiltersBar({ filters, onFilterChange, onClearFilters }: FiltersBarProps) {
  const hasActiveFilters = Object.values(filters).some((value) => value !== 'all');

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4 p-4 bg-white border border-gray-200 rounded-lg">
      <span className="text-sm font-medium text-gray-700">Filters:</span>

      <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Pending Review">Pending Review</SelectItem>
          <SelectItem value="Approved">Approved</SelectItem>
          <SelectItem value="Rejected">Rejected</SelectItem>
          <SelectItem value="Moved to Finance">Moved to Finance</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.teachingMethod}
        onValueChange={(value) => onFilterChange('teachingMethod', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Teaching Method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Methods</SelectItem>
          <SelectItem value="Physical Location">Physical Location</SelectItem>
          <SelectItem value="Home Location">Home Location</SelectItem>
          <SelectItem value="Online">Online</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.paymentType}
        onValueChange={(value) => onFilterChange('paymentType', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Payment Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="Full">Full</SelectItem>
          <SelectItem value="Advance">Advance</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.mentor} onValueChange={(value) => onFilterChange('mentor', value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Mentor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Mentors</SelectItem>
          <SelectItem value="Kevin Mwangi">Kevin Mwangi</SelectItem>
          <SelectItem value="Amina Otieno">Amina Otieno</SelectItem>
          <SelectItem value="Brian Kamau">Brian Kamau</SelectItem>
          <SelectItem value="Mercy Wanjiku">Mercy Wanjiku</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.course} onValueChange={(value) => onFilterChange('course', value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Course" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Courses</SelectItem>
          <SelectItem value="Game Design">Game Design</SelectItem>
          <SelectItem value="Animation">Animation</SelectItem>
          <SelectItem value="Robotics">Robotics</SelectItem>
          <SelectItem value="3D Modeling">3D Modeling</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="ml-auto"
        >
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
