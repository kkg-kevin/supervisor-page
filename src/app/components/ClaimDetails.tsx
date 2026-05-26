import { useState, type ElementType } from 'react';
import { CourseWithMentor, ReviewAction, Student } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { format } from 'date-fns';
import {
  getRemainingBalance,
  getReviewMetrics,
  getValidationMessage,
  isClaimValid,
} from '../utils/claimValidation';
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  MessageSquareText,
  Users,
  XCircle,
} from 'lucide-react';

interface ClaimDetailsProps {
  course: CourseWithMentor | null;
  onReview: (action: ReviewAction) => void;
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

const metricColor = (value: number) => (value >= 90 ? 'text-green-700' : 'text-amber-700');

export function ClaimDetails({ course, onReview }: ClaimDetailsProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  if (!course) {
    return (
      <Card className="border-gray-200 h-full flex items-center justify-center">
        <CardContent className="text-center text-gray-500 py-12">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Select a claim to view mentor activity</p>
        </CardContent>
      </Card>
    );
  }

  const metrics = getReviewMetrics(course);
  const validationMessage = getValidationMessage(course);
  const canApprove = isClaimValid(course);
  const remainingBalance = getRemainingBalance(course);

  const presentFor = (sessionId: string, studentId: string) =>
    course.attendance.find((mark) => mark.sessionId === sessionId && mark.studentId === studentId)
      ?.present ?? false;

  const studentSummary = (student: Student) => {
    const attendanceMarks = course.attendance.filter((mark) => mark.studentId === student.id);
    const present = attendanceMarks.filter((mark) => mark.present).length;
    const issuedAssignments = course.assignments.filter((assignment) => assignment.issued);
    const submitted = issuedAssignments.filter((assignment) =>
      assignment.submittedStudentIds.includes(student.id)
    ).length;
    const reportsDone = course.reports.filter((report) => report.done).length;

    return {
      attendance: attendanceMarks.length === 0 ? 100 : Math.round((present / attendanceMarks.length) * 100),
      assignment:
        issuedAssignments.length === 0 ? 100 : Math.round((submitted / issuedAssignments.length) * 100),
      report: course.reports.length === 0 ? 100 : Math.round((reportsDone / course.reports.length) * 100),
    };
  };

  const handleReject = () => {
    if (!showRejectionInput) {
      setShowRejectionInput(true);
      return;
    }

    if (rejectionReason.trim()) {
      onReview({ courseId: course.id, decision: 'rejected', comment: rejectionReason.trim() });
      setRejectionReason('');
      setShowRejectionInput(false);
    }
  };

  const handleApprove = () => {
    onReview({ courseId: course.id, decision: 'approved' });
    setRejectionReason('');
    setShowRejectionInput(false);
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="bg-[#25476a] text-white">
        <CardTitle className="flex items-center justify-between gap-3">
          <span>Course Review</span>
          <Badge className={getStatusColor(course.claimStatus)}>{course.claimStatus}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {!metrics.activityComplete && (
          <Alert className="border-amber-200 bg-amber-50 text-amber-900">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Incomplete mentor activity</AlertTitle>
            <AlertDescription>
              Attendance, assignments, and reports must each reach 90% before approval.
            </AlertDescription>
          </Alert>
        )}

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xl text-[#25476a]">{course.name}</p>
              <p className="text-sm text-gray-600">{course.mentor.name}</p>
            </div>
            {course.submittedAt && (
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} className="text-gray-400" />
                {format(new Date(course.submittedAt), 'MMM dd, yyyy h:mm a')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <SummaryTile label="Total Earnings" value={`KES ${course.totalEarnings.toLocaleString()}`} />
            <SummaryTile label="Advance Claimed" value={`KES ${course.advanceClaimed.toLocaleString()}`} />
            <SummaryTile label="Remaining Balance" value={`KES ${remainingBalance.toLocaleString()}`} />
            <SummaryTile label="Claim Amount" value={`KES ${course.claimAmount.toLocaleString()}`} />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <MetricTile label="Completion" value={metrics.completionPercent} />
          <MetricTile label="Attendance" value={metrics.attendancePercent} />
          <MetricTile label="Assignments" value={metrics.assignmentsPercent} />
          <MetricTile label="Reports" value={metrics.reportsPercent} />
        </section>

        {validationMessage && (
          <p className="flex items-center gap-2 text-sm text-amber-700">
            <AlertCircle size={16} />
            {validationMessage}
          </p>
        )}

        <section>
          <SectionTitle icon={BookOpen} title="Sessions" />
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Date</th>
                  <th className="px-3 py-2 text-left font-medium">Duration</th>
                  <th className="px-3 py-2 text-left font-medium">Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {course.sessions.map((session) => (
                  <tr key={session.id}>
                    <td className="px-3 py-2">{format(new Date(session.date), 'MMM dd, yyyy')}</td>
                    <td className="px-3 py-2">{session.durationMinutes} min</td>
                    <td className="px-3 py-2">
                      {session.completed ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Complete</Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <SectionTitle icon={Users} title="Attendance" />
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Session</th>
                  {course.students.map((student) => (
                    <th key={student.id} className="px-3 py-2 text-center font-medium">
                      {student.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {course.sessions.map((session) => (
                  <tr key={session.id}>
                    <td className="px-3 py-2">{format(new Date(session.date), 'MMM dd')}</td>
                    {course.students.map((student) => (
                      <td key={student.id} className="px-3 py-2 text-center">
                        {presentFor(session.id, student.id) ? (
                          <CheckCircle2 className="mx-auto h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="mx-auto h-4 w-4 text-red-500" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <SectionTitle icon={ClipboardCheck} title="Assignments" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {course.assignments.map((assignment) => {
              const ungraded = assignment.submittedStudentIds.length - assignment.gradedStudentIds.length;

              return (
                <div key={assignment.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{assignment.title}</p>
                    {ungraded > 0 && (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        {ungraded} ungraded
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm text-gray-600">
                    <p>Issued: {assignment.issued ? 'Yes' : 'No'}</p>
                    <p>Submitted: {assignment.submittedStudentIds.length}/{course.students.length}</p>
                    <p>Graded: {assignment.gradedStudentIds.length}/{course.students.length}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <SectionTitle icon={MessageSquareText} title="Reports" />
          <div className="space-y-3">
            {course.reports.map((report) => (
              <div key={report.id} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{report.title}</p>
                  <Badge
                    className={
                      report.done
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                    }
                  >
                    {report.done ? 'Done' : 'Pending'}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {report.content ?? 'No report content submitted yet.'}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle icon={Users} title="Students Summary" />
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Student</th>
                  <th className="px-3 py-2 text-left font-medium">Attendance</th>
                  <th className="px-3 py-2 text-left font-medium">Assignment</th>
                  <th className="px-3 py-2 text-left font-medium">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {course.students.map((student) => {
                  const summary = studentSummary(student);

                  return (
                    <tr key={student.id}>
                      <td className="px-3 py-2">{student.name}</td>
                      <td className={`px-3 py-2 ${metricColor(summary.attendance)}`}>
                        {summary.attendance}%
                      </td>
                      <td className={`px-3 py-2 ${metricColor(summary.assignment)}`}>
                        {summary.assignment}%
                      </td>
                      <td className={`px-3 py-2 ${metricColor(summary.report)}`}>
                        {summary.report}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {course.claimStatus === 'Rejected' && course.rejectionReason && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 mb-1">Rejection Comment:</p>
            <p className="text-sm text-red-900">{course.rejectionReason}</p>
          </div>
        )}

        {course.claimStatus === 'Pending Review' && (
          <div className="space-y-3 pt-4 border-t">
            {showRejectionInput ? (
              <div className="space-y-3">
                <Textarea
                  placeholder="Enter rejection comment..."
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleReject}
                    variant="destructive"
                    disabled={!rejectionReason.trim()}
                    className="flex-1"
                  >
                    Confirm Rejection
                  </Button>
                  <Button
                    onClick={() => {
                      setShowRejectionInput(false);
                      setRejectionReason('');
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={handleApprove}
                  disabled={!canApprove}
                  className="flex-1 hover:opacity-90"
                  style={{ backgroundColor: canApprove ? '#38aae1' : undefined }}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button onClick={handleReject} variant="destructive" className="flex-1">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg text-[#25476a]">{value}</p>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-sm font-medium ${metricColor(value)}`}>{value}%</p>
      </div>
      <Progress value={value} className="mt-2 h-2 bg-gray-200" />
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: ElementType; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-[#25476a]">
      <Icon size={18} />
      <p className="font-medium">{title}</p>
    </div>
  );
}
