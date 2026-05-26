import { useMemo, useState } from 'react';
import { CourseWithMentor, Filters, ReviewAction } from './types';
import { INITIAL_COURSES } from './data/mockClaims';
import { StatsOverview } from './components/StatsOverview';
import { FiltersBar } from './components/FiltersBar';
import { ClaimsList } from './components/ClaimsList';
import { ClaimDetails } from './components/ClaimDetails';
import { CourseActivityTimeline } from './components/CourseActivityTimeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { ClipboardList, Clock } from 'lucide-react';

export default function App() {
  const [courses, setCourses] = useState<CourseWithMentor[]>(INITIAL_COURSES);
  const [reviewActions, setReviewActions] = useState<ReviewAction[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isReviewPageOpen, setIsReviewPageOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({ status: 'all' });

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (filters.status === 'all') return true;
      return course.claimStatus === filters.status;
    });
  }, [courses, filters]);

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? null;

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ status: 'all' });
  };

  const updateReview = (action: ReviewAction) => {
    setReviewActions((prev) => [action, ...prev.filter((item) => item.courseId !== action.courseId)]);
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === action.courseId
          ? {
              ...course,
              claimStatus: action.decision === 'approved' ? 'Approved' : 'Rejected',
              rejectionReason: action.decision === 'rejected' ? action.comment : undefined,
            }
          : course
      )
    );
  };

  const openCourseReview = (courseId: string) => {
    setSelectedCourseId(courseId);
    setIsReviewPageOpen(true);
  };

  const closeCourseReview = () => {
    setIsReviewPageOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#25476a] text-white shadow-lg">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <h1 className="text-3xl">Mentor Activity Review</h1>
          <p className="text-blue-200 mt-2">
            Inspect submitted course activity before approving mentor claims
          </p>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {isReviewPageOpen ? (
          <ClaimDetails course={selectedCourse} onReview={updateReview} onBack={closeCourseReview} />
        ) : (
          <>
            <StatsOverview courses={courses} />

            <Tabs defaultValue="claims" className="space-y-4">
              <TabsList className="bg-white border border-gray-200">
                <TabsTrigger value="claims" className="flex items-center gap-2">
                  <ClipboardList size={18} />
                  Claim Review
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex items-center gap-2">
                  <Clock size={18} />
                  Submission Timeline
                </TabsTrigger>
              </TabsList>

              <TabsContent value="claims" className="space-y-4">
                <FiltersBar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                />

                <div className="space-y-6">
                  <ClaimsList
                    courses={filteredCourses}
                    selectedCourseId={selectedCourseId}
                    onSelectCourse={openCourseReview}
                  />
                </div>
              </TabsContent>

              <TabsContent value="timeline">
                <CourseActivityTimeline
                  courses={courses}
                  selectedCourseId={selectedCourseId}
                  onSelectCourse={openCourseReview}
                />
              </TabsContent>
            </Tabs>
          </>
        )}

        {!isReviewPageOpen && reviewActions.length > 0 && (
          <p className="mt-4 text-xs text-gray-500">
            {reviewActions.length} local review decision{reviewActions.length === 1 ? '' : 's'} stored
            in this session.
          </p>
        )}
      </main>
    </div>
  );
}
