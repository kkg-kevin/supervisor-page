import { useMemo, useState } from 'react';
import { CourseWithMentor, Filters, ReviewAction } from './types';
import { INITIAL_COURSES } from './data/mockClaims';
import { FiltersBar } from './components/FiltersBar';
import { ClaimsList } from './components/ClaimsList';
import { ClaimDetails } from './components/ClaimDetails';
// Timeline and tabs removed per UX update

export default function App() {
  const [courses, setCourses] = useState<CourseWithMentor[]>(INITIAL_COURSES);
  const [reviewActions, setReviewActions] = useState<ReviewAction[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isReviewPageOpen, setIsReviewPageOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({ status: 'all', search: '' });

  const filteredCourses = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesStatus = filters.status === 'all' || course.claimStatus === filters.status;
      const searchableText = [
        course.name,
        course.mentor.name,
        course.teachingMethod,
        course.paymentType,
        course.claimStatus,
        course.etimsDocument,
      ]
        .join(' ')
        .toLowerCase();
      const matchesSearch = searchTerm === '' || searchableText.includes(searchTerm);

      return matchesStatus && matchesSearch;
    });
  }, [courses, filters]);

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? null;

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ status: 'all', search: '' });
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
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {isReviewPageOpen ? (
          <ClaimDetails course={selectedCourse} onReview={updateReview} onBack={closeCourseReview} />
        ) : (
          <>
            <FiltersBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />

            <div className="space-y-6 mt-4">
              <ClaimsList
                courses={filteredCourses}
                selectedCourseId={selectedCourseId}
                onSelectCourse={openCourseReview}
              />
            </div>
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
