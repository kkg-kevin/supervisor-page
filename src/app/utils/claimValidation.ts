import { CourseWithMentor } from '../types';

export type ReviewMetrics = {
  completionPercent: number;
  attendancePercent: number;
  assignmentsPercent: number;
  reportsPercent: number;
  activityComplete: boolean;
};

const percent = (value: number, total: number) => (total === 0 ? 100 : Math.round((value / total) * 100));
const CENTER_RATE_PER_HOUR = 904;
const GOOGLE_MEET_RATE_PER_HOUR = 500;
const ADVANCE_PERCENT = 0.3;

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

export function getHourlyRate(course: CourseWithMentor) {
  return course.teachingMethod === 'Google Meet' ? GOOGLE_MEET_RATE_PER_HOUR : CENTER_RATE_PER_HOUR;
}

export function getAmountPayable(course: CourseWithMentor) {
  const totalMinutes = course.sessions.reduce((total, session) => total + session.durationMinutes, 0);

  return Math.round((totalMinutes / 60) * getHourlyRate(course));
}

export function getAdvancePayable(course: CourseWithMentor) {
  return Math.round(getAmountPayable(course) * ADVANCE_PERCENT);
}

export function getRequestedPayment(course: CourseWithMentor) {
  return course.paymentType === 'Advance' ? getAdvancePayable(course) : getAmountPayable(course);
}

export function getRemainingBalance(course: CourseWithMentor) {
  if (course.paymentType !== 'Advance') return 0;

  return Math.max(getAmountPayable(course) - getAdvancePayable(course), 0);
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
