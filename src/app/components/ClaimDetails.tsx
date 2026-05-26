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
  getHourlyRate,
  getRemainingBalance,
  getRequestedPayment,
  getReviewMetrics,
  getValidationMessage,
  isClaimValid,
} from '../utils/claimValidation';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Eye,
} from 'lucide-react';

interface ClaimDetailsProps {
  course: CourseWithMentor | null;
  onReview: (action: ReviewAction) => void;
  onBack?: () => void;
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

const percent = (value: number, total: number) => (total === 0 ? 100 : Math.round((value / total) * 100));

export function ClaimDetails({ course, onReview, onBack }: ClaimDetailsProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(0);
  const [isEtimsPreviewOpen, setIsEtimsPreviewOpen] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

  useEffect(() => {
    setSelectedSessionIndex(0);
    setShowRejectionInput(false);
    setRejectionReason('');
  }, [course?.id]);

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
  const amountPayable = getAmountPayable(course);
  const advancePayable = getAdvancePayable(course);
  const requestedPayment = getRequestedPayment(course);
  const remainingBalance = getRemainingBalance(course);
  const hourlyRate = getHourlyRate(course);
  const isGoogleMeetClaim = course.teachingMethod === 'Google Meet';

  const presentFor = (sessionId: string, studentId: string) =>
    course.attendance.find((mark) => mark.sessionId === sessionId && mark.studentId === studentId)
      ?.present ?? false;

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

  const goToPreviousSession = () => {
    setSelectedSessionIndex((current) => Math.max(current - 1, 0));
  };

  const goToNextSession = () => {
    setSelectedSessionIndex((current) => Math.min(current + 1, course.sessions.length - 1));
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            {onBack && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onBack}
                className="h-9 w-9 shrink-0"
                aria-label="Back to claims"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-2xl font-semibold text-[#08294f]">{course.name}</h2>
                <Badge className={getStatusColor(course.claimStatus)}>{course.claimStatus}</Badge>
              </div>
              <p className="text-sm text-[#416489]">
                {course.mentor.name}
                {course.submittedAt ? ` - Submitted ${format(new Date(course.submittedAt), 'MMM dd, yyyy h:mm a')}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              {course.claimStatus === 'Pending Review' && (
                <>
                  <Button
                    type="button"
                    onClick={() => setShowApproveConfirm(true)}
                    disabled={!canApprove}
                    size="sm"
                    className="px-3 py-1.5 text-sm font-medium shadow-sm"
                    style={{ backgroundColor: canApprove ? '#38aae1' : undefined }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="px-3 py-1.5 text-sm font-medium"
                    onClick={() => setShowRejectionInput(true)}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </>
              )}
            </div>

            {course.etimsDocument && (
              <div className="pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEtimsPreviewOpen(true)}
                  className="px-3 py-1 text-sm"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </div>
            )}
          </div>
        </div>

        <section className="rounded-2xl border border-[#d6e0ea] bg-white p-5 shadow-sm">
          <div className="grid gap-5 lg:grid-cols-[240px_1fr_1fr]">
            <div className="flex items-center gap-4">
              <ProgressRing value={metrics.completionPercent} />
              <div>
                <p className="text-sm text-[#315b87]">{isGoogleMeetClaim ? 'Sessions' : 'Students'}</p>
                <p className="text-lg font-bold text-[#08294f]">
                  {isGoogleMeetClaim ? course.sessions.length : course.students.length}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#d3e1ee] bg-[#f8fbff] p-4">
              <p className="text-xs text-[#315b87]">Amount Payable</p>
              <p className="mt-1 text-xl font-bold text-[#08294f]">
                KSh {amountPayable.toLocaleString()}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-[#dbe5ef] pt-3 text-xs">
                <span className="text-[#315b87]">Advance Payable</span>
                <span className="font-bold text-[#c65300]">KSh {advancePayable.toLocaleString()}</span>
              </div>
            </div>

            <div className="rounded-xl border border-[#f7c456] bg-[#fff9e8] p-4">
              <p className="text-xs text-[#d15d00]">Requested Payment</p>
              <p className="mt-1 text-xl font-bold text-[#d15d00]">
                KSh {requestedPayment.toLocaleString()}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-[#f3c65c] pt-3 text-xs">
                <span className="text-[#d15d00]">Balance Left</span>
                <span className="font-bold text-[#a33f00]">KSh {Math.max(amountPayable - requestedPayment, 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </section>

        {validationMessage && (
          <p className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <AlertCircle size={16} />
            {validationMessage}
          </p>
        )}

        {isGoogleMeetClaim ? (
          <GoogleMeetSessionTable sessions={course.sessions} />
        ) : (
        <section>
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="mr-1">
                <p className="text-lg font-bold text-[#08294f]">Session {selectedSessionIndex + 1}</p>
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

          <div className="overflow-hidden rounded-2xl border border-[#d6e0ea] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-sm">
                <thead className="bg-[#eaf2fa] text-[#08294f]">
                  <tr>
                    <th className="w-[40%] px-4 py-4 text-left text-xs font-semibold uppercase tracking-normal text-[#416489]">
                      Student
                    </th>
                    <th className="w-[19%] border-l border-[#d6e0ea] px-4 py-4 text-center text-xs font-semibold uppercase tracking-normal">
                      Attendance
                    </th>
                    <th className="w-[24%] border-l border-[#d6e0ea] px-4 py-4 text-center text-base font-semibold uppercase tracking-normal">
                      Assignment
                    </th>
                    <th className="w-[17%] border-l border-[#d6e0ea] px-4 py-4 text-center text-base font-semibold uppercase tracking-normal">
                      Report
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
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#153e68] text-xs font-semibold text-white">
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
                                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                                  isPresent ? 'right-1' : 'left-1'
                                }`}
                              />
                            </span>
                            <span className={isPresent ? 'text-xs font-semibold text-[#009b52]' : 'text-xs font-semibold text-red-600'}>
                              {isPresent ? 'Present' : 'Absent'}
                            </span>
                          </div>
                        </td>
                        <td className="border-l border-[#e3e8ee] px-4 py-5">
                          <div className="flex flex-wrap justify-center gap-2">
                            {sessionAssignments.length === 0 ? (
                              <Badge className="rounded-full bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-100">
                                Not issued
                              </Badge>
                            ) : (
                              sessionAssignments.map((assignment) => (
                                <AssignmentBadge
                                  key={assignment.id}
                                  issued={assignment.issued}
                                  submitted={assignment.submittedStudentIds.includes(student.id)}
                                  graded={assignment.gradedStudentIds.includes(student.id)}
                                />
                              ))
                            )}
                          </div>
                        </td>
                        <td className="border-l border-[#e3e8ee] px-4 py-5 text-center">
                          <ReportBadge done={reportDone} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        )}

        {course.claimStatus === 'Rejected' && course.rejectionReason && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="mb-1 text-sm text-red-800">Rejection Comment:</p>
            <p className="text-sm text-red-900">{course.rejectionReason}</p>
          </div>
        )}

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
                  <p className="mt-1 text-3xl" style={{ color: '#25476a' }}>
                    KES {requestedPayment.toLocaleString()}
                  </p>
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
            <DialogDescription>Are you sure you want to approve this claim? This will mark the claim as approved.</DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowApproveConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleApprove()} disabled={!canApprove}>
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
    <section>
      <div className="mb-5">
        <p className="text-lg font-bold text-[#08294f]">Google Meet Sessions</p>
        <p className="text-sm text-[#416489]">Scheduled session review</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#d6e0ea] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="bg-[#eaf2fa] text-[#08294f]">
              <tr>
                <th className="w-[18%] px-5 py-4 text-left text-xs font-semibold uppercase tracking-normal text-[#416489]">
                  Session
                </th>
                <th className="w-[32%] border-l border-[#d6e0ea] px-5 py-4 text-left text-xs font-semibold uppercase tracking-normal text-[#416489]">
                  Session Scheduled
                </th>
                <th className="w-[25%] border-l border-[#d6e0ea] px-5 py-4 text-center text-xs font-semibold uppercase tracking-normal text-[#416489]">
                  Session Status
                </th>
                <th className="w-[25%] border-l border-[#d6e0ea] px-5 py-4 text-center text-xs font-semibold uppercase tracking-normal text-[#416489]">
                  Session Duration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e8ee]">
              {sessions.map((session, index) => (
                <tr key={session.id} className={index % 2 === 1 ? 'bg-[#f6f9fc]' : 'bg-white'}>
                  <td className="px-5 py-5 font-semibold text-[#08294f]">
                    Session {index + 1}
                  </td>
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
      </div>
    </section>
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
          stroke="#feb139"
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

function SessionMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex h-9 items-center gap-3 rounded-lg border border-[#d6e0ea] bg-white px-3 shadow-sm">
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
    return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Not issued</Badge>;
  }

  if (graded) {
    return <Badge className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-green-700 hover:bg-green-50">Graded</Badge>;
  }

  if (submitted) {
    return <Badge className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700 hover:bg-amber-50">Submitted</Badge>;
  }

  return <Badge className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-600 hover:bg-red-50">Pending</Badge>;
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

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
