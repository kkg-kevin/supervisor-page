import { CourseWithMentor } from '../types';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { format } from 'date-fns';
import { getEligibilityStatus, getReviewMetrics } from '../utils/claimValidation';

interface ClaimsListProps {
  courses: CourseWithMentor[];
  selectedCourseId: string | null;
  onSelectCourse: (courseId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending Review':
      return 'bg-[#feb139] text-white hover:bg-[#feb139]';
    case 'Approved':
      return 'bg-green-600 text-white hover:bg-green-600';
    case 'Rejected':
      return 'bg-red-500 text-white hover:bg-red-500';
    default:
      return 'bg-gray-500 text-white';
  }
};

export function ClaimsList({ courses, selectedCourseId, onSelectCourse }: ClaimsListProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3">
        <p className="font-medium text-[#25476a]">Submitted Course Claims</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#25476a] text-white">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Course</th>
              <th className="px-4 py-3 text-left font-medium">Mentor</th>
              <th className="px-4 py-3 text-left font-medium">Amount</th>
              <th className="px-4 py-3 text-left font-medium">Completion</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {courses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No claims match the current filters
                </td>
              </tr>
            ) : (
              courses.map((course) => {
                const isSelected = course.id === selectedCourseId;
                const metrics = getReviewMetrics(course);
                const eligibility = getEligibilityStatus(course);

                return (
                  <tr
                    key={course.id}
                    onClick={() => onSelectCourse(course.id)}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50 border-l-4 border-l-[#25476a]' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{course.name}</p>
                      <p className="text-xs text-gray-500">
                        {course.submittedAt
                          ? format(new Date(course.submittedAt), 'MMM dd, yyyy')
                          : 'Not submitted'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm">{course.mentor.name}</td>
                    <td className="px-4 py-3 text-sm">KES {course.claimAmount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="w-32">
                        <div className="flex items-center gap-2">
                          <Progress value={metrics.completionPercent} className="h-2 bg-gray-200" />
                          <span className="text-xs text-gray-600 whitespace-nowrap">
                            {metrics.completionPercent}%
                          </span>
                        </div>
                        <span
                          className={`text-xs mt-1 block ${
                            eligibility === 'Eligible' ? 'text-green-700' : 'text-amber-700'
                          }`}
                        >
                          {eligibility}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={getStatusColor(course.claimStatus)}>
                        {course.claimStatus}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
