import { CourseWithMentor, TeachingMethod } from '../types';
import { getRequestedPayment } from '../utils/claimValidation';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { format } from 'date-fns';
import {
  BookOpen,
  Building2,
  ChevronRight,
  Code2,
  Cpu,
  FlaskConical,
  Home,
  Monitor,
  Palette,
  MapPin,
} from 'lucide-react';

interface ClaimsListProps {
  courses: CourseWithMentor[];
  selectedCourseId: string | null;
  onSelectCourse: (courseId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending Review':
      return 'bg-[#feb139]/10 text-[#feb139] hover:bg-[#feb139]/10';
    case 'Approved':
      return 'bg-[#25476a]/10 text-[#25476a] hover:bg-[#25476a]/10';
    case 'Rejected':
      return 'bg-[#38aae1]/10 text-[#38aae1] hover:bg-[#38aae1]/10';
    default:
      return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
  }
};

const getMethodBadge = (method: TeachingMethod) => {
  switch (method) {
    case 'Center':
      return {
        label: 'Center',
        icon: Building2,
        className: 'bg-[#25476a] text-white hover:bg-[#25476a]',
      };
    case 'Home':
      return {
        label: 'Home',
        icon: Home,
        className: 'bg-[#38aae1] text-white hover:bg-[#38aae1]',
      };
    case 'Physical':
      return {
        label: 'Physical',
        icon: MapPin,
        className: 'bg-[#feb139] text-white hover:bg-[#feb139]',
      };
    case 'Online':
      return {
        label: 'Online',
        icon: Monitor,
        className: 'bg-[#25476a] text-white hover:bg-[#25476a]',
      };
    case 'Google Meet':
      return {
        label: 'Google Meet',
        icon: Monitor,
        className: 'bg-[#38aae1] text-white hover:bg-[#38aae1]',
      };
  }
};

const getCourseIcon = (courseName: string) => {
  if (courseName.includes('Robotics')) return Cpu;
  if (courseName.includes('Animation') || courseName.includes('3D')) return Palette;
  if (courseName.includes('Game')) return Code2;
  if (courseName.includes('Science')) return FlaskConical;
  return BookOpen;
};

const getLocation = (course: CourseWithMentor) => {
  if (course.teachingMethod === 'Center') return `${course.name} Learning Center`;
  if (course.teachingMethod === 'Home') return "Student's Location";
  if (course.teachingMethod === 'Physical') return 'Physical Location';
  if (course.teachingMethod === 'Online') return 'Online - Zoom';
  if (course.teachingMethod === 'Google Meet') return 'Google Meet';
  return course.teachingMethod;
};

export function ClaimsList({ courses, selectedCourseId, onSelectCourse }: ClaimsListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-medium text-[#25476a]">Submitted Course Claims</p>
          <p className="text-sm text-gray-500">Select a claim to inspect mentor activity</p>
        </div>
        <p className="text-sm text-gray-500">{courses.length} claim{courses.length === 1 ? '' : 's'}</p>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-gray-500">
          No claims match the current filters
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <Table className="min-w-[980px]">
            <TableHeader className="bg-[#eaf2fa]">
              <TableRow className="hover:bg-[#eaf2fa]">
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-[#25476a]">
                  Course
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-[#25476a]">
                  Mentor
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-[#25476a]">
                  Method
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-[#25476a]">
                  Sessions
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-[#25476a]">
                  Claim
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-[#25476a]">
                  Submitted
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold uppercase text-[#25476a]">
                  Status
                </TableHead>
                <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase text-[#25476a]">
                  View
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => {
                const isSelected = course.id === selectedCourseId;
                const MethodIcon = getMethodBadge(course.teachingMethod).icon;
                const CourseIcon = getCourseIcon(course.name);
                const methodBadge = getMethodBadge(course.teachingMethod);
                const completedSessions = course.sessions.filter((session) => session.completed).length;
                const requestedPayment = getRequestedPayment(course);

                return (
                  <TableRow
                    key={course.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectCourse(course.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelectCourse(course.id);
                      }
                    }}
                    aria-label={`Open ${course.name} claim`}
                    data-state={isSelected ? 'selected' : undefined}
                    className="cursor-pointer bg-white hover:bg-[#f5f9fc]"
                  >
                    <TableCell className="px-4 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eaf2fa] text-[#25476a]">
                          <CourseIcon size={19} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-950">{course.name}</p>
                          <p className="truncate text-xs text-[#3f6389]">{getLocation(course)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-gray-700">{course.mentor.name}</TableCell>
                    <TableCell className="px-4 py-4">
                      <Badge className={`gap-1.5 rounded-full px-3 py-1 ${methodBadge.className}`}>
                        <MethodIcon size={13} />
                        {methodBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-gray-700">
                      {completedSessions}/{course.sessions.length}
                    </TableCell>
                    <TableCell className="px-4 py-4 font-medium text-gray-950">
                      KES {requestedPayment.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-gray-700">
                      {course.submittedAt ? format(new Date(course.submittedAt), 'MMM dd, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <Badge className={`rounded-full px-3 py-1 ${getStatusColor(course.claimStatus)}`}>
                        {course.claimStatus === 'Pending Review' ? 'Pending' : course.claimStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf2fa] text-[#25476a]">
                        <ChevronRight size={18} />
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
