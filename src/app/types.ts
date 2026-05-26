export type TeachingMethod = 'Center' | 'Home' | 'Physical' | 'Online' | 'Google Meet';
export type PaymentType = 'Full' | 'Advance';
export type ClaimStatus = 'Pending Review' | 'Approved' | 'Rejected';

export type Student = {
  id: string;
  name: string;
};

export type Session = {
  id: string;
  date: string;
  durationMinutes: number;
  completed: boolean;
};

export type Attendance = {
  sessionId: string;
  studentId: string;
  present: boolean;
};

export type Assignment = {
  id: string;
  sessionId: string;
  title: string;
  issued: boolean;
  submittedStudentIds: string[];
  gradedStudentIds: string[];
};

export type Report = {
  id: string;
  sessionId: string;
  title: string;
  done: boolean;
  content?: string;
};

export type Course = {
  id: string;
  name: string;
  teachingMethod: TeachingMethod;
  paymentType: PaymentType;
  totalEarnings: number;
  advanceClaimed: number;
  claimAmount: number;
  claimStatus: ClaimStatus;
  etimsDocument: string;
  students: Student[];
  sessions: Session[];
  attendance: Attendance[];
  assignments: Assignment[];
  reports: Report[];
  rejectionReason?: string;
};

export type Mentor = { id: string; name: string };

export type CourseWithMentor = Course & {
  mentor: Mentor;
  submittedAt?: string;
};

export type ReviewAction = {
  courseId: string;
  decision: 'approved' | 'rejected';
  comment?: string;
};

export interface Filters {
  status: string;
  search: string;
}
