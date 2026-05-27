import { useEffect, useState } from 'react';
import { CourseWithMentor, ReviewAction, Session } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { format } from 'date-fns';
import {
  getAdvancePayable,
  getAmountPayable,
  getRequestedPayment,
  getReviewMetrics,
  getValidationMessage,
  isClaimValid,
} from '../utils/claimValidation';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Home,
  MapPin,
  Monitor,
  Receipt,
} from 'lucide-react';

interface ClaimDetailsProps {
  course: CourseWithMentor | null;
  onReview: (action: ReviewAction) => void;
  onBack?: () => void;
}

const percent = (value: number, total: number) => (total === 0 ? 100 : Math.round((value / total) * 100));
type ActivityDrilldown = 'activity' | 'assignments' | 'reports';

export function ClaimDetails({ course, onReview, onBack }: ClaimDetailsProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(0);
  const [isEtimsPreviewOpen, setIsEtimsPreviewOpen] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [activityDrilldown, setActivityDrilldown] = useState<ActivityDrilldown>('activity');

  useEffect(() => {
    setSelectedSessionIndex(0);
    setActivityDrilldown('activity');
    setShowRejectionInput(false);
    setRejectionReason('');
  }, [course?.id]);

  if (!course) {
    return (
      <Card className="flex h-full items-center justify-center border-gray-200">
        <CardContent className="py-12 text-center text-gray-500">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Select a claim to view mentor activity</p>
        </CardContent>
      </Card>
    );
  }

  const metrics = getReviewMetrics(course);
  const validationMessage = getValidationMessage(course);
  const canApprove = isClaimValid(course);
  const amountPayable = getAmountPayable(course);
  const advancePayable = getAdvancePayable(course);
  const requestedPayment = getRequestedPayment(course);
  const isGoogleMeetClaim = course.teachingMethod === 'Google Meet';
  const completedSessions = course.sessions.filter((session) => session.completed).length;

  const selectedSession = course.sessions[selectedSessionIndex] ?? course.sessions[0];
  const sessionAssignments = course.assignments.filter(
    (assignment) => assignment.sessionId === selectedSession?.id
  );
  const sessionReports = course.reports.filter((report) => report.sessionId === selectedSession?.id);
  const selectedSessionAttendance = course.attendance.filter(
    (mark) => mark.sessionId === selectedSession?.id
  );
  const presentCount = selectedSessionAttendance.filter((mark) => mark.present).length;
  const sessionAttendancePercent = percent(presentCount, selectedSessionAttendance.length);
  const issuedSessionAssignments = sessionAssignments.filter((assignment) => assignment.issued);
  const expectedSessionAssignments = issuedSessionAssignments.length * course.students.length;
  const gradedSessionAssignments = issuedSessionAssignments.reduce(
    (total, assignment) => total + assignment.gradedStudentIds.length,
    0
  );
  const sessionAssignmentPercent = percent(gradedSessionAssignments, expectedSessionAssignments);
  const completedSessionReports = sessionReports.filter((report) => report.done).length;
  const sessionReportPercent = percent(completedSessionReports, sessionReports.length);
  const selectedSessionLabel = `Session ${selectedSessionIndex + 1}`;

  const presentFor = (sessionId: string, studentId: string) =>
    course.attendance.find((mark) => mark.sessionId === sessionId && mark.studentId === studentId)
      ?.present ?? false;

  const goToPreviousSession = () => {
    setSelectedSessionIndex((current) => Math.max(current - 1, 0));
  };

  const goToNextSession = () => {
    setSelectedSessionIndex((current) => Math.min(current + 1, course.sessions.length - 1));
  };

  if (activityDrilldown === 'assignments') {
    return (
      <AssignmentSessionDetails
        course={course}
        selectedSessionIndex={selectedSessionIndex}
        sessionAssignments={sessionAssignments}
        onBack={() => setActivityDrilldown('activity')}
        onPreviousSession={goToPreviousSession}
        onNextSession={goToNextSession}
      />
    );
  }

  if (activityDrilldown === 'reports') {
    return (
      <ReportSessionDetails
        course={course}
        selectedSessionIndex={selectedSessionIndex}
        sessionReports={sessionReports}
        onBack={() => setActivityDrilldown('activity')}
        onPreviousSession={goToPreviousSession}
        onNextSession={goToNextSession}
      />
    );
  }

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReview({ courseId: course.id, decision: 'rejected', comment: rejectionReason.trim() });
      setRejectionReason('');
      setShowRejectionInput(false);
    }
  };

  const handleApprove = () => {
    onReview({ courseId: course.id, decision: 'approved' });
    setRejectionReason('');
    setShowApproveConfirm(false);
  };

  const openEtimsDocument = () => {
    const documentHtml = `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${course.etimsDocument}</title>
          <style>
            body { margin: 0; background: #eef2f6; color: #1f2937; font-family: Arial, sans-serif; }
            main { width: min(840px, calc(100% - 32px)); margin: 32px auto; background: white; border: 1px solid #d6dde6; box-shadow: 0 20px 50px rgba(37, 71, 106, 0.18); }
            header { background: #25476a; color: white; padding: 28px 36px; }
            section { padding: 28px 36px; }
            h1, h2, p { margin: 0; }
            h1 { font-size: 24px; }
            h2 { color: #25476a; font-size: 16px; margin-bottom: 14px; }
            .meta { color: #bfdbfe; margin-top: 8px; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
            .field { border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
            .label { color: #6b7280; font-size: 12px; margin-bottom: 4px; }
            .value { font-size: 15px; }
            .amount { color: #25476a; font-size: 28px; font-weight: 700; }
            .stamp { border: 2px solid #38aae1; color: #25476a; display: inline-block; font-weight: 700; letter-spacing: 1px; margin-top: 20px; padding: 10px 16px; }
          </style>
        </head>
        <body>
          <main>
            <header>
              <h1>eTIMS Payment Reference</h1>
              <p class="meta">${course.etimsDocument}</p>
            </header>
            <section>
              <h2>Mentor Claim</h2>
              <div class="grid">
                <div class="field"><p class="label">Mentor</p><p class="value">${course.mentor.name}</p></div>
                <div class="field"><p class="label">Course</p><p class="value">${course.name}</p></div>
                <div class="field"><p class="label">Payment Type</p><p class="value">${course.paymentType}</p></div>
                <div class="field"><p class="label">Claim Status</p><p class="value">${course.claimStatus}</p></div>
                <div class="field"><p class="label">Submitted</p><p class="value">${
                  course.submittedAt ? format(new Date(course.submittedAt), 'MMM dd, yyyy h:mm a') : 'Not submitted'
                }</p></div>
                <div class="field"><p class="label">Document</p><p class="value">${course.etimsDocument}</p></div>
              </div>
            </section>
            <section>
              <h2>Claim Amount</h2>
              <p class="amount">KES ${requestedPayment.toLocaleString()}</p>
              <p class="stamp">MENTOR eTIMS SUBMISSION</p>
            </section>
          </main>
        </body>
      </html>
    `;

    const documentWindow = window.open('', '_blank', 'noopener,noreferrer');

    if (documentWindow) {
      documentWindow.document.write(documentHtml);
      documentWindow.document.close();
    }
  };

  return (
    <>
      <div className="space-y-5">
        <header className="flex items-center gap-4">
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-10 w-10 shrink-0 rounded-full text-[#25476a] hover:bg-white"
              aria-label="Back to claims"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#25476a] text-white">
            <CourseMethodIcon course={course} />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold leading-tight text-[#08294f]">{course.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#416489]">
              <Badge className="gap-1 rounded-full bg-[#25476a] px-2 py-1 text-white hover:bg-[#25476a]">
                <CourseMethodIcon course={course} small />
                {course.teachingMethod}
              </Badge>
              <span>{getCourseLocation(course)}</span>
            </div>
          </div>
        </header>

        <section className="grid overflow-hidden rounded-2xl border border-[#d6e0ea] bg-white shadow-sm lg:grid-cols-[1.15fr_1.5fr_1.4fr]">
          <div className="flex items-center gap-5 border-b border-[#d6e0ea] p-6 lg:border-b-0 lg:border-r">
            <ProgressRing value={metrics.completionPercent} />
            <div>
              <p className="text-xs font-semibold uppercase text-[#416489]">Course Progress</p>
              <p className="mt-2 text-base font-bold text-[#08294f]">
                {completedSessions}/{course.sessions.length} sessions
              </p>
              <span className="mt-3 inline-flex rounded-full bg-[#eaf2fa] px-3 py-1 text-xs font-semibold text-[#25476a]">
                {course.students.length} students
              </span>
            </div>
          </div>

          <div className="border-b border-[#d6e0ea] p-6 lg:border-b-0 lg:border-r">
            <p className="text-xs font-semibold uppercase text-[#416489]">Amount Payable</p>
            <p className="mt-2 text-3xl font-bold text-[#153e68]">KSh {amountPayable.toLocaleString()}</p>
            <p className="mt-5 text-xs text-[#416489]">Advance payable</p>
            <p className="mt-2 font-mono text-base font-bold text-[#d15d00]">
              KSh {advancePayable.toLocaleString()}
            </p>
          </div>

          <div className="p-6">
            <p className="text-xs font-semibold uppercase text-[#416489]">Payment Actions</p>
            <p className="mt-2 text-sm font-semibold text-[#08294f]">
              Review the mentor payment claim and submitted activity.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Button
                type="button"
                onClick={() => setShowApproveConfirm(true)}
                disabled={course.claimStatus !== 'Pending Review' || !canApprove}
                className="h-11 flex-1 rounded-xl bg-[#25476a] font-bold text-white hover:bg-[#1d3a58]"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve Claim
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={course.claimStatus !== 'Pending Review'}
                onClick={() => setShowRejectionInput(true)}
                className="h-11 flex-1 rounded-xl border-[#d6e0ea] font-bold text-[#25476a]"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </div>
        </section>

        {validationMessage && (
          <p className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <AlertCircle size={16} />
            {validationMessage}
          </p>
        )}

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.92fr)]">
          <div className="overflow-hidden rounded-2xl border border-[#d6e0ea] bg-white shadow-sm">
            {isGoogleMeetClaim ? (
              <GoogleMeetSessionTable sessions={course.sessions} />
            ) : (
              <>
                <div className="flex flex-col gap-4 border-b border-[#d6e0ea] bg-[#f8fbff] p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="mr-1 min-w-[120px]">
                      <p className="text-xl font-bold text-[#08294f]">{selectedSessionLabel}</p>
                      <p className="text-sm text-[#416489]">
                        {format(new Date(selectedSession.date), 'yyyy-MM-dd')}
                      </p>
                    </div>
                    <SessionMetric label="Attendance" value={sessionAttendancePercent} />
                    <SessionMetric label="Assignment" value={sessionAssignmentPercent} />
                    <SessionMetric label="Report" value={sessionReportPercent} />
                  </div>

                  <div className="flex items-center gap-5 self-start text-[#416489] lg:self-auto">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={goToPreviousSession}
                      disabled={selectedSessionIndex === 0}
                      className="h-8 w-8 text-[#8cadca] hover:bg-white hover:text-[#25476a]"
                      aria-label="Previous session"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <span className="min-w-14 text-center text-sm">
                      {selectedSessionIndex + 1} / {course.sessions.length}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={goToNextSession}
                      disabled={selectedSessionIndex === course.sessions.length - 1}
                      className="h-8 w-8 text-[#416489] hover:bg-white hover:text-[#25476a]"
                      aria-label="Next session"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-sm">
                    <thead className="bg-[#eaf2fa] text-[#08294f]">
                      <tr>
                        <th className="w-[40%] px-4 py-4 text-left text-xs font-semibold uppercase text-[#416489]">
                          Student
                        </th>
                        <th className="w-[19%] border-l border-[#d6e0ea] px-4 py-4 text-center text-xs font-semibold uppercase text-[#416489]">
                          Attendance
                        </th>
                        <th className="w-[24%] border-l border-[#d6e0ea] px-4 py-4 text-center text-base font-semibold uppercase">
                          <button
                            type="button"
                            onClick={() => setActivityDrilldown('assignments')}
                            className="rounded-md px-2 py-1 font-semibold uppercase text-[#08294f] transition hover:bg-white hover:text-[#25476a] focus:outline-none focus:ring-2 focus:ring-[#25476a] focus:ring-offset-2"
                          >
                            Assignment
                          </button>
                        </th>
                        <th className="w-[17%] border-l border-[#d6e0ea] px-4 py-4 text-center text-base font-semibold uppercase">
                          <button
                            type="button"
                            onClick={() => setActivityDrilldown('reports')}
                            className="rounded-md px-2 py-1 font-semibold uppercase text-[#08294f] transition hover:bg-white hover:text-[#25476a] focus:outline-none focus:ring-2 focus:ring-[#25476a] focus:ring-offset-2"
                          >
                            Report
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e3e8ee]">
                      {course.students.map((student) => {
                        const isPresent = presentFor(selectedSession.id, student.id);
                        const reportDone =
                          sessionReports.length > 0 && sessionReports.every((report) => report.done);

                        return (
                          <tr key={student.id} className="bg-white">
                            <td className="px-4 py-5">
                              <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#153e68] text-xs font-bold text-white">
                                  {getInitials(student.name)}
                                </span>
                                <span className="font-semibold text-[#08294f]">{student.name}</span>
                              </div>
                            </td>
                            <td className="border-l border-[#e3e8ee] px-4 py-5 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span
                                  className={`relative h-7 w-14 rounded-full ${
                                    isPresent ? 'bg-[#06c167]' : 'bg-red-400'
                                  }`}
                                  aria-label={isPresent ? 'Present' : 'Absent'}
                                >
                                  <span
                                    className={`absolute top-1 h-5 w-5 rounded-full bg-white ${
                                      isPresent ? 'right-1' : 'left-1'
                                    }`}
                                  />
                                </span>
                                <span
                                  className={
                                    isPresent
                                      ? 'text-xs font-semibold text-[#009b52]'
                                      : 'text-xs font-semibold text-red-600'
                                  }
                                >
                                  {isPresent ? 'Present' : 'Absent'}
                                </span>
                              </div>
                            </td>
                            <td className="border-l border-[#e3e8ee] px-4 py-5">
                              <div className="flex flex-wrap justify-center gap-2">
                                {sessionAssignments.length === 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => setActivityDrilldown('assignments')}
                                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-200"
                                  >
                                    Not issued
                                  </button>
                                ) : (
                                  sessionAssignments.map((assignment) => (
                                    <button
                                      key={assignment.id}
                                      type="button"
                                      onClick={() => setActivityDrilldown('assignments')}
                                      className="rounded-full focus:outline-none focus:ring-2 focus:ring-[#25476a] focus:ring-offset-2"
                                    >
                                      <AssignmentBadge
                                        issued={assignment.issued}
                                        submitted={assignment.submittedStudentIds.includes(student.id)}
                                        graded={assignment.gradedStudentIds.includes(student.id)}
                                      />
                                    </button>
                                  ))
                                )}
                              </div>
                            </td>
                            <td className="border-l border-[#e3e8ee] px-4 py-5 text-center">
                              <button
                                type="button"
                                onClick={() => setActivityDrilldown('reports')}
                                className="rounded-full focus:outline-none focus:ring-2 focus:ring-[#25476a] focus:ring-offset-2"
                              >
                                <ReportBadge done={reportDone} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          <aside className="min-h-[420px] rounded-2xl border border-[#d6e0ea] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#08294f]">Claim History</h2>
                <p className="mt-1 text-sm text-[#416489]">{course.name}</p>
              </div>
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full border border-[#d6e0ea] bg-[#f4f8fb] px-2 text-xs font-semibold text-[#25476a]">
                1
              </span>
            </div>

            <div className="mt-5 rounded-2xl border border-[#d6e0ea] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-[#08294f]">Payment claim</h3>
                  <p className="mt-2 text-xs text-[#416489]">
                    {course.submittedAt
                      ? format(new Date(course.submittedAt), 'MMM dd, yyyy, h:mm a')
                      : 'Not submitted'}
                  </p>
                </div>
                <Badge className={getClaimBadgeClass(course.claimStatus)}>
                  {course.claimStatus === 'Pending Review' ? 'Requested' : course.claimStatus}
                </Badge>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-[#f8fbff] px-3 py-3">
                <span className="text-sm text-[#416489]">Amount</span>
                <span className="font-mono text-sm font-bold text-[#153e68]">
                  KSh {requestedPayment.toLocaleString()}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                <p className="text-[#416489]">
                  Invoice: <span className="font-semibold text-[#08294f]">{course.etimsDocument}</span>
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEtimsPreviewOpen(true)}
                  className="h-8 rounded-full border-[#d6e0ea] text-[#25476a]"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </div>

              <div className="mt-4 rounded-xl border border-[#d6e0ea] bg-[#f8fbff] px-3 py-3">
                <p className="text-xs font-bold uppercase text-[#416489]">Note</p>
                <p className="mt-1 text-sm text-[#416489]">
                  {course.paymentType === 'Full' ? 'Full course payment' : 'Advance payment claim'}
                </p>
                {course.claimStatus === 'Rejected' && course.rejectionReason && (
                  <p className="mt-3 text-sm text-red-700">{course.rejectionReason}</p>
                )}
              </div>
            </div>
          </aside>
        </section>
      </div>

      <Dialog open={isEtimsPreviewOpen} onOpenChange={setIsEtimsPreviewOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#25476a]" />
              {course.etimsDocument}
            </DialogTitle>
            <DialogDescription>
              eTIMS payment reference submitted by {course.mentor.name} for {course.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-gray-200 bg-gray-100 p-4">
            <div className="mx-auto max-w-[620px] border border-gray-300 bg-white shadow-lg">
              <div className="bg-[#25476a] px-6 py-5 text-white">
                <p className="text-xl">eTIMS Payment Reference</p>
                <p className="mt-1 text-sm text-blue-200">{course.etimsDocument}</p>
              </div>

              <div className="space-y-6 p-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <PreviewField label="Mentor" value={course.mentor.name} />
                  <PreviewField label="Course" value={course.name} />
                  <PreviewField label="Payment Type" value={course.paymentType} />
                  <PreviewField label="Claim Status" value={course.claimStatus} />
                  <PreviewField
                    label="Submitted"
                    value={
                      course.submittedAt
                        ? format(new Date(course.submittedAt), 'MMM dd, yyyy h:mm a')
                        : 'Not submitted'
                    }
                  />
                  <PreviewField label="Document" value={course.etimsDocument} />
                </div>

                <div className="border-t border-gray-200 pt-5">
                  <p className="text-sm text-gray-500">Claim Amount</p>
                  <p className="mt-1 text-3xl text-[#25476a]">KES {requestedPayment.toLocaleString()}</p>
                </div>

                <div className="inline-flex rounded border-2 border-[#38aae1] px-4 py-2 text-sm font-medium text-[#25476a]">
                  MENTOR eTIMS SUBMISSION
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={openEtimsDocument}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View Full Document
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showApproveConfirm} onOpenChange={setShowApproveConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Claim</DialogTitle>
            <DialogDescription>This will mark the mentor payment claim as approved.</DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowApproveConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={!canApprove}>
              Confirm Approve
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectionInput} onOpenChange={setShowRejectionInput}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reject Claim</DialogTitle>
            <DialogDescription>Provide a brief reason for rejecting this claim.</DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            <Textarea
              placeholder="Enter rejection comment..."
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              className="min-h-[120px] w-full"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectionInput(false);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim()}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AssignmentSessionDetails({
  course,
  selectedSessionIndex,
  sessionAssignments,
  onBack,
  onPreviousSession,
  onNextSession,
}: {
  course: CourseWithMentor;
  selectedSessionIndex: number;
  sessionAssignments: CourseWithMentor['assignments'];
  onBack: () => void;
  onPreviousSession: () => void;
  onNextSession: () => void;
}) {
  const selectedSession = course.sessions[selectedSessionIndex] ?? course.sessions[0];
  const sessionLabel = `Session ${selectedSessionIndex + 1}`;
  const issuedCount = course.students.filter((student) =>
    sessionAssignments.some((assignment) => assignment.issued || assignment.submittedStudentIds.includes(student.id) || assignment.gradedStudentIds.includes(student.id))
  ).length;
  const submittedCount = course.students.filter((student) =>
    sessionAssignments.some((assignment) => assignment.submittedStudentIds.includes(student.id))
  ).length;
  const gradedCount = course.students.filter((student) =>
    sessionAssignments.some((assignment) => assignment.gradedStudentIds.includes(student.id))
  ).length;

  return (
    <div className="space-y-5">
      <ActivityDetailHeader
        title={`Assignments — ${sessionLabel}`}
        date={selectedSession.date}
        selectedSessionIndex={selectedSessionIndex}
        totalSessions={course.sessions.length}
        onBack={onBack}
        onPreviousSession={onPreviousSession}
        onNextSession={onNextSession}
      />

      <section className="flex flex-col gap-5 rounded-2xl border border-[#d6e0ea] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-[#416489]">{course.name}</p>
          <h2 className="mt-1 text-xl font-bold text-[#08294f]">{sessionLabel}</h2>
          <p className="mt-2 text-sm text-[#416489]">
            {format(new Date(selectedSession.date), 'yyyy-MM-dd')} · {course.students.length} students
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <SummaryCounter value={gradedCount} label="Graded" tone="green" />
          <SummaryCounter value={submittedCount} label="Submitted" tone="orange" />
          <SummaryCounter value={issuedCount} label="Issued" tone="blue" />
        </div>
      </section>

      <div className="overflow-hidden rounded-2xl border border-[#d6e0ea] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-[#eaf2fa] text-[#08294f]">
              <tr>
                <th className="w-[24%] px-4 py-4 text-left text-xs font-semibold uppercase text-[#416489]">
                  Student Name
                </th>
                <th className="w-[16%] border-l border-[#d6e0ea] px-4 py-4 text-left text-xs font-semibold uppercase text-[#416489]">
                  Assignment
                </th>
                <th className="w-[38%] border-l border-[#d6e0ea] px-4 py-4 text-center text-xs font-semibold uppercase text-[#416489]">
                  Progress
                </th>
                <th className="w-[22%] border-l border-[#d6e0ea] px-4 py-4 text-center text-xs font-semibold uppercase text-[#416489]">
                  Assignment File
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e8ee]">
              {course.students.map((student) => {
                const status = getStudentAssignmentStatus(sessionAssignments, student.id);

                return (
                  <tr key={student.id} className="bg-white">
                    <td className="px-4 py-5">
                      <StudentNameCell name={student.name} />
                    </td>
                    <td className="border-l border-[#e3e8ee] px-4 py-5">
                      <p className="font-bold text-[#08294f]">{sessionLabel}</p>
                      <p className="mt-1 text-xs text-[#416489]">{sessionLabel}</p>
                    </td>
                    <td className="border-l border-[#e3e8ee] px-4 py-5">
                      <AssignmentProgress status={status} />
                    </td>
                    <td className="border-l border-[#e3e8ee] px-4 py-5 text-center">
                      <DownloadButton label="Download" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportSessionDetails({
  course,
  selectedSessionIndex,
  sessionReports,
  onBack,
  onPreviousSession,
  onNextSession,
}: {
  course: CourseWithMentor;
  selectedSessionIndex: number;
  sessionReports: CourseWithMentor['reports'];
  onBack: () => void;
  onPreviousSession: () => void;
  onNextSession: () => void;
}) {
  const selectedSession = course.sessions[selectedSessionIndex] ?? course.sessions[0];
  const sessionLabel = `Session ${selectedSessionIndex + 1}`;
  const reportDone = sessionReports.length > 0 && sessionReports.every((report) => report.done);
  const doneCount = reportDone ? course.students.length : 0;
  const pendingCount = reportDone ? 0 : course.students.length;

  return (
    <div className="space-y-5">
      <ActivityDetailHeader
        title={`Reports — ${sessionLabel}`}
        date={selectedSession.date}
        selectedSessionIndex={selectedSessionIndex}
        totalSessions={course.sessions.length}
        onBack={onBack}
        onPreviousSession={onPreviousSession}
        onNextSession={onNextSession}
      />

      <section className="flex flex-col gap-5 rounded-2xl border border-[#d6e0ea] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-[#416489]">{course.name}</p>
          <h2 className="mt-1 text-xl font-bold text-[#08294f]">{sessionLabel} Report</h2>
          <p className="mt-2 text-sm text-[#416489]">
            {format(new Date(selectedSession.date), 'yyyy-MM-dd')} · {course.students.length} students
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SummaryCounter value={doneCount} label="Done" tone="green" />
          <SummaryCounter value={pendingCount} label="Pending" tone="red" />
        </div>
      </section>

      <div className="overflow-hidden rounded-2xl border border-[#d6e0ea] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-[#eaf2fa] text-[#08294f]">
              <tr>
                <th className="w-[32%] px-4 py-4 text-left text-xs font-semibold uppercase text-[#416489]">
                  Student Name
                </th>
                <th className="w-[25%] border-l border-[#d6e0ea] px-4 py-4 text-left text-xs font-semibold uppercase text-[#416489]">
                  Report
                </th>
                <th className="w-[16%] border-l border-[#d6e0ea] px-4 py-4 text-left text-xs font-semibold uppercase text-[#416489]">
                  Status
                </th>
                <th className="w-[27%] border-l border-[#d6e0ea] px-4 py-4 text-center text-xs font-semibold uppercase text-[#416489]">
                  Download
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e8ee]">
              {course.students.map((student) => (
                <tr key={student.id} className="bg-white">
                  <td className="px-4 py-5">
                    <StudentNameCell name={student.name} />
                  </td>
                  <td className="border-l border-[#e3e8ee] px-4 py-5">
                    <p className="font-bold text-[#08294f]">{sessionLabel} Report</p>
                    <p className="mt-1 text-xs text-[#416489]">{sessionLabel}</p>
                  </td>
                  <td className="border-l border-[#e3e8ee] px-4 py-5">
                    <ReportBadge done={reportDone} />
                  </td>
                  <td className="border-l border-[#e3e8ee] px-4 py-5 text-center">
                    <DownloadButton label="Download" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ActivityDetailHeader({
  title,
  date,
  selectedSessionIndex,
  totalSessions,
  onBack,
  onPreviousSession,
  onNextSession,
}: {
  title: string;
  date: string;
  selectedSessionIndex: number;
  totalSessions: number;
  onBack: () => void;
  onPreviousSession: () => void;
  onNextSession: () => void;
}) {
  return (
    <header className="flex items-center gap-3">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="h-9 w-9 shrink-0 rounded-full text-[#25476a] hover:bg-white"
        aria-label="Back to activity"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onPreviousSession}
        disabled={selectedSessionIndex === 0}
        className="h-9 w-9 shrink-0 rounded-full text-[#25476a] hover:bg-white"
        aria-label="Previous session"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold leading-tight text-[#08294f]">{title}</h1>
        <p className="mt-1 text-sm text-[#416489]">{format(new Date(date), 'yyyy-MM-dd')}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onNextSession}
        disabled={selectedSessionIndex === totalSessions - 1}
        className="ml-2 h-9 w-9 shrink-0 rounded-full text-[#25476a] hover:bg-white"
        aria-label="Next session"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </header>
  );
}

function SummaryCounter({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: 'green' | 'orange' | 'blue' | 'red';
}) {
  const toneClass = {
    green: 'bg-green-50 text-[#009b52]',
    orange: 'bg-orange-50 text-[#d15d00]',
    blue: 'bg-[#f1f6fb] text-[#25476a]',
    red: 'bg-rose-50 text-rose-600',
  }[tone];

  return (
    <div className={`flex min-h-14 min-w-20 flex-col items-center justify-center rounded-xl px-4 ${toneClass}`}>
      <span className="font-mono text-lg font-bold">{value}</span>
      <span className="mt-1 text-[10px] font-bold uppercase">{label}</span>
    </div>
  );
}

function StudentNameCell({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#153e68] text-xs font-bold text-white">
        {getInitials(name)}
      </span>
      <span className="font-semibold text-[#08294f]">{name}</span>
    </div>
  );
}

function AssignmentProgress({ status }: { status: 'issued' | 'submitted' | 'graded' }) {
  const steps: Array<'issued' | 'submitted' | 'graded'> = ['issued', 'submitted', 'graded'];
  const activeIndex = steps.indexOf(status);

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center text-xs text-[#08294f]">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <span
              className={`h-3 w-3 rounded-full ${
                index <= activeIndex ? 'bg-[#25476a]' : 'border border-[#9bb2c7] bg-white'
              }`}
            />
            <span className={`ml-2 capitalize ${index === activeIndex ? 'font-bold' : ''}`}>{step}</span>
            {index < steps.length - 1 && <span className="mx-2 h-px w-6 bg-[#25476a]" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function DownloadButton({ label }: { label: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-9 rounded-xl border-[#d6e0ea] px-4 font-bold text-[#153e68]"
    >
      <Download className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}

function getStudentAssignmentStatus(
  assignments: CourseWithMentor['assignments'],
  studentId: string
): 'issued' | 'submitted' | 'graded' {
  if (assignments.some((assignment) => assignment.gradedStudentIds.includes(studentId))) return 'graded';
  if (assignments.some((assignment) => assignment.submittedStudentIds.includes(studentId))) return 'submitted';
  return 'issued';
}

function CourseMethodIcon({ course, small = false }: { course: CourseWithMentor; small?: boolean }) {
  const className = small ? 'h-3 w-3' : 'h-5 w-5';

  if (course.teachingMethod === 'Center') return <Building2 className={className} />;
  if (course.teachingMethod === 'Home') return <Home className={className} />;
  if (course.teachingMethod === 'Physical') return <MapPin className={className} />;
  if (course.teachingMethod === 'Google Meet' || course.teachingMethod === 'Online') {
    return <Monitor className={className} />;
  }

  return <Receipt className={className} />;
}

function getCourseLocation(course: CourseWithMentor) {
  if (course.teachingMethod === 'Center') return `${course.name} Learning Center`;
  if (course.teachingMethod === 'Home') return "Student's Location";
  if (course.teachingMethod === 'Physical') return 'Physical Location';
  if (course.teachingMethod === 'Online') return 'Online - Zoom';
  return 'Google Meet';
}

function getClaimBadgeClass(status: CourseWithMentor['claimStatus']) {
  if (status === 'Approved') {
    return 'rounded-full border border-green-200 bg-green-50 px-3 py-1 text-green-700 hover:bg-green-50';
  }

  if (status === 'Rejected') {
    return 'rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-600 hover:bg-red-50';
  }

  return 'rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700 hover:bg-blue-50';
}

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="mt-1">{value}</p>
    </div>
  );
}

function GoogleMeetSessionTable({ sessions }: { sessions: Session[] }) {
  return (
    <>
      <div className="border-b border-[#d6e0ea] bg-[#f8fbff] p-5">
        <p className="text-xl font-bold text-[#08294f]">Google Meet Sessions</p>
        <p className="text-sm text-[#416489]">Scheduled session review</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-[#eaf2fa] text-[#08294f]">
            <tr>
              <th className="w-[18%] px-5 py-4 text-left text-xs font-semibold uppercase text-[#416489]">
                Session
              </th>
              <th className="w-[32%] border-l border-[#d6e0ea] px-5 py-4 text-left text-xs font-semibold uppercase text-[#416489]">
                Session Scheduled
              </th>
              <th className="w-[25%] border-l border-[#d6e0ea] px-5 py-4 text-center text-xs font-semibold uppercase text-[#416489]">
                Session Status
              </th>
              <th className="w-[25%] border-l border-[#d6e0ea] px-5 py-4 text-center text-xs font-semibold uppercase text-[#416489]">
                Session Duration
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e3e8ee]">
            {sessions.map((session, index) => (
              <tr key={session.id} className={index % 2 === 1 ? 'bg-[#f6f9fc]' : 'bg-white'}>
                <td className="px-5 py-5 font-semibold text-[#08294f]">Session {index + 1}</td>
                <td className="border-l border-[#e3e8ee] px-5 py-5 font-semibold text-[#08294f]">
                  {format(new Date(session.date), 'MMM d, yyyy, hh:mm a')}
                </td>
                <td className="border-l border-[#e3e8ee] px-5 py-5 text-center">
                  <SessionStatusBadge completed={session.completed} />
                </td>
                <td className="border-l border-[#e3e8ee] px-5 py-5 text-center">
                  <DurationPill durationMinutes={session.durationMinutes} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ProgressRing({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 29;
  const dashOffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative h-[76px] w-[76px] shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 76 76" aria-hidden="true">
        <circle cx="38" cy="38" r="29" fill="none" stroke="#e7edf3" strokeWidth="6" />
        <circle
          cx="38"
          cy="38"
          r="29"
          fill="none"
          stroke="#16a34a"
          strokeLinecap="round"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#08294f]">
        {value}%
      </span>
    </div>
  );
}

function SessionMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex h-9 items-center gap-3 rounded-full border border-[#d6e0ea] bg-white px-4 shadow-sm">
      <span className="text-xs text-[#416489]">{label}</span>
      <span className="text-sm font-bold text-[#08294f]">{value}%</span>
    </div>
  );
}

function AssignmentBadge({
  issued,
  submitted,
  graded,
}: {
  issued: boolean;
  submitted: boolean;
  graded: boolean;
}) {
  if (!issued) {
    return <Badge className="rounded-full bg-gray-100 text-gray-700 hover:bg-gray-100">Not issued</Badge>;
  }

  if (graded) {
    return (
      <Badge className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-green-700 hover:bg-green-50">
        Graded
      </Badge>
    );
  }

  if (submitted) {
    return (
      <Badge className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700 hover:bg-amber-50">
        Submitted
      </Badge>
    );
  }

  return (
    <Badge className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-600 hover:bg-red-50">
      Pending
    </Badge>
  );
}

function ReportBadge({ done }: { done: boolean }) {
  return (
    <Badge
      className={
        done
          ? 'gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-green-700 hover:bg-green-50'
          : 'rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-600 hover:bg-red-50'
      }
    >
      {done && <CheckSquare className="h-3 w-3" />}
      {done ? 'Done' : 'Pending'}
    </Badge>
  );
}

function SessionStatusBadge({ completed }: { completed: boolean }) {
  return (
    <Badge
      className={
        completed
          ? 'min-w-[136px] justify-center rounded-full border border-green-200 bg-green-50 px-5 py-2 text-green-700 hover:bg-green-50'
          : 'min-w-[136px] justify-center rounded-full border border-red-200 bg-red-50 px-5 py-2 text-red-600 hover:bg-red-50'
      }
    >
      {completed ? 'Completed' : 'Cancelled'}
    </Badge>
  );
}

function DurationPill({ durationMinutes }: { durationMinutes: number }) {
  return (
    <span className="inline-flex min-w-[90px] items-center justify-center rounded-full border border-[#d6e0ea] bg-[#f1f6fb] px-4 py-2 font-semibold text-[#08294f]">
      {formatSessionDuration(durationMinutes)}
    </span>
  );
}

function formatSessionDuration(durationMinutes: number) {
  if (durationMinutes < 60) return `${durationMinutes} min`;

  const hours = durationMinutes / 60;
  if (Number.isInteger(hours)) return `${hours}hr`;

  return `${hours.toFixed(1)}hrs`;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
