import { CourseWithMentor, TeachingMethod } from '../types';
import { Badge } from './ui/badge';
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
} from 'lucide-react';

interface ClaimsListProps {
  courses: CourseWithMentor[];
  selectedCourseId: string | null;
  onSelectCourse: (courseId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending Review':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
    case 'Approved':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'Rejected':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    default:
      return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
  }
};

const getMethodBadge = (method: TeachingMethod) => {
  switch (method) {
    case 'Physical Location':
      return {
        label: 'Center',
        icon: Building2,
        className: 'bg-[#25476a] text-white hover:bg-[#25476a]',
      };
    case 'Home Location':
      return {
        label: 'Home',
        icon: Home,
        className: 'bg-[#38aae1] text-white hover:bg-[#38aae1]',
      };
    case 'Online':
      return {
        label: 'Online',
        icon: Monitor,
        className: 'bg-emerald-600 text-white hover:bg-emerald-600',
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
  if (course.teachingMethod === 'Online') return 'Online - Virtual';
  if (course.teachingMethod === 'Home Location') return "Student's Location";
  return `${course.name} Learning Center`;
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
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {courses.map((course) => {
            const isSelected = course.id === selectedCourseId;
            const MethodIcon = getMethodBadge(course.teachingMethod).icon;
            const CourseIcon = getCourseIcon(course.name);
            const methodBadge = getMethodBadge(course.teachingMethod);
            const completedSessions = course.sessions.filter((session) => session.completed).length;

            return (
              <button
                key={course.id}
                type="button"
                onClick={() => onSelectCourse(course.id)}
                className={`group min-h-[238px] rounded-2xl border bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  isSelected
                    ? 'border-[#25476a] ring-2 ring-[#25476a]/15'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eaf2fa] text-[#25476a]">
                      <CourseIcon size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xl font-semibold text-gray-950">{course.name}</p>
                      <p className="mt-1 truncate text-sm text-[#3f6389]">{getLocation(course)}</p>
                    </div>
                  </div>

                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf2fa] text-[#25476a] transition-colors group-hover:bg-[#d7e8f7]">
                    <ChevronRight size={20} />
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-[#f3f7fb] p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Badge className={`shrink-0 gap-1.5 rounded-full px-3 py-1 ${methodBadge.className}`}>
                      <MethodIcon size={13} />
                      {methodBadge.label}
                    </Badge>
                    <span className="truncate text-sm text-[#3f6389]">{course.mentor.name}</span>
                  </div>
                  <Badge className={`shrink-0 rounded-full px-3 py-1 ${getStatusColor(course.claimStatus)}`}>
                    {course.claimStatus === 'Pending Review' ? 'Pending' : course.claimStatus}
                  </Badge>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-[#3f6389]">Sessions</p>
                    <p className="mt-1 text-lg font-bold text-gray-950">
                      {completedSessions}/{course.sessions.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-[#3f6389]">Claim</p>
                    <p className="mt-1 text-lg font-bold text-gray-950">
                      KES {course.claimAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-[#3f6389]">Submitted</p>
                    <p className="mt-1 text-sm font-semibold text-gray-950">
                      {course.submittedAt ? format(new Date(course.submittedAt), 'MMM dd') : '-'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
