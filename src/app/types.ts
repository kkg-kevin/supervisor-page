export type TeachingMethod = 'Physical Location' | 'Home Location' | 'Online';
export type PaymentType = 'Full' | 'Advance';
export type ClaimStatus = 'Pending Review' | 'Approved' | 'Rejected' | 'Moved to Finance';

export interface CourseActivity {
  courseSessions: { completed: number; total: number };
  lessonContent: { completed: number; total: number };
  learnerAttendance: number;
  report: number;
}

export interface Claim {
  id: string;
  mentorName: string;
  courseName: string;
  teachingMethod: TeachingMethod;
  paymentType: PaymentType;
  submittedDate: string;
  progress: number;
  status: ClaimStatus;
  amount: number;
  etimsDocument: string;
  courseActivity: CourseActivity;
  rejectionReason?: string;
}

export interface Filters {
  status: string;
  teachingMethod: string;
  paymentType: string;
  mentor: string;
  course: string;
}
