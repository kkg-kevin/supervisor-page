import { CourseWithMentor } from '../types';

export type ReviewMetrics = {
  completionPercent: number;
  attendancePercent: number;
  assignmentsPercent: number;
  reportsPercent: number;
  activityComplete: boolean;
};

const percent = (value: number, total: number) => (total === 0 ? 100 : Math.round((value / total) * 100));

export function getReviewMetrics(course: CourseWithMentor): ReviewMetrics {
  const completedSessions = course.sessions.filter((session) => session.completed).length;
  const presentMarks = course.attendance.filter((mark) => mark.present).length;
  const issuedAssignments = course.assignments.filter((assignment) => assignment.issued);
  const expectedAssignmentMarks = issuedAssignments.length * course.students.length;
  const gradedMarks = issuedAssignments.reduce(
    (total, assignment) => total + assignment.gradedStudentIds.length,
    0
  );
  const completedReports = course.reports.filter((report) => report.done).length;

  const metrics = {
    completionPercent: percent(completedSessions, course.sessions.length),
    attendancePercent: percent(presentMarks, course.attendance.length),
    assignmentsPercent: percent(gradedMarks, expectedAssignmentMarks),
    reportsPercent: percent(completedReports, course.reports.length),
  };

  return {
    ...metrics,
    activityComplete:
      metrics.attendancePercent >= 90 &&
      metrics.assignmentsPercent >= 90 &&
      metrics.reportsPercent >= 90,
  };
}

export function getRemainingBalance(course: CourseWithMentor) {
  return Math.max(course.totalEarnings - course.advanceClaimed, 0);
}

export function isClaimValid(course: CourseWithMentor): boolean {
  const metrics = getReviewMetrics(course);

  if (!metrics.activityComplete) return false;
  if (course.paymentType === 'Full') return metrics.completionPercent === 100;
  if (course.paymentType === 'Advance') return metrics.completionPercent >= 30;

  return false;
}

export function getValidationMessage(course: CourseWithMentor): string {
  const metrics = getReviewMetrics(course);

  if (!metrics.activityComplete) return 'Incomplete mentor activity';
  if (course.paymentType === 'Full' && metrics.completionPercent < 100) {
    return 'Full payment requires 100% course completion';
  }
  if (course.paymentType === 'Advance' && metrics.completionPercent < 30) {
    return 'Advance payment requires at least 30% course completion';
  }

  return '';
}

export function getEligibilityStatus(course: CourseWithMentor): 'Eligible' | 'Needs Review' {
  return isClaimValid(course) ? 'Eligible' : 'Needs Review';
}
