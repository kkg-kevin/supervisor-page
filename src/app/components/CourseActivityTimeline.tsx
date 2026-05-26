import { CourseWithMentor } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { format } from 'date-fns';
import { ArrowRight, BookOpen, Clock, User } from 'lucide-react';
import { getReviewMetrics } from '../utils/claimValidation';

interface CourseActivityTimelineProps {
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

export function CourseActivityTimeline({
  courses,
  selectedCourseId,
  onSelectCourse,
}: CourseActivityTimelineProps) {
  const sortedCourses = [...courses].sort(
    (a, b) => new Date(b.submittedAt ?? '').getTime() - new Date(a.submittedAt ?? '').getTime()
  );

  return (
    <Card className="border-gray-200 h-full">
      <CardHeader className="bg-[#25476a] text-white">
        <CardTitle className="flex items-center gap-2">
          <Clock size={20} />
          Submission Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[720px]">
          <div className="p-4 space-y-3">
            {sortedCourses.map((course) => {
              const isSelected = course.id === selectedCourseId;
              const metrics = getReviewMetrics(course);

              return (
                <div
                  key={course.id}
                  onClick={() => onSelectCourse(course.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-[#25476a] shadow-md'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2 gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            course.claimStatus === 'Pending Review'
                              ? '#feb139'
                              : course.claimStatus === 'Approved'
                                ? '#16a34a'
                                : '#ef4444',
                        }}
                      />
                      <span className="text-xs text-gray-500">
                        {course.submittedAt
                          ? format(new Date(course.submittedAt), 'MMM dd, yyyy h:mm a')
                          : 'Not submitted'}
                      </span>
                    </div>
                    <Badge className={getStatusColor(course.claimStatus)} variant="secondary">
                      {course.claimStatus}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-sm font-medium">{course.mentor.name}</span>
                      <ArrowRight size={14} className="text-gray-300" />
                      <BookOpen size={16} className="text-gray-400" />
                      <span className="text-sm">{course.name}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Sessions:</span>
                        <p className="text-gray-700">
                          {course.sessions.filter((session) => session.completed).length}/
                          {course.sessions.length}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Attendance:</span>
                        <p className="text-gray-700">{metrics.attendancePercent}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Reports:</span>
                        <p className="text-gray-700">{metrics.reportsPercent}%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">{course.paymentType}</span>
                      <span className="text-sm" style={{ color: '#25476a' }}>
                        KES {course.claimAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
