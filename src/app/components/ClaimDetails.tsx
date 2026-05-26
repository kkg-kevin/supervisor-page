import { useEffect, useState, type ElementType } from 'react';
import { CourseWithMentor, ReviewAction } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
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
  getRemainingBalance,
  getReviewMetrics,
  getValidationMessage,
  isClaimValid,
} from '../utils/claimValidation';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
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

const metricColor = (value: number) => (value >= 90 ? 'text-green-700' : 'text-amber-700');

export function ClaimDetails({ course, onReview, onBack }: ClaimDetailsProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(0);
  const [isEtimsPreviewOpen, setIsEtimsPreviewOpen] = useState(false);

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
  const remainingBalance = getRemainingBalance(course);

  const presentFor = (sessionId: string, studentId: string) =>
    course.attendance.find((mark) => mark.sessionId === sessionId && mark.studentId === studentId)
      ?.present ?? false;

  const selectedSession = course.sessions[selectedSessionIndex] ?? course.sessions[0];
  const sessionAssignments = course.assignments.filter(
    (assignment) => assignment.sessionId === selectedSession?.id
  );
  const sessionReports = course.reports.filter((report) => report.sessionId === selectedSession?.id);

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
              <p class="amount">KES ${course.claimAmount.toLocaleString()}</p>
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
      <Card className="border-gray-200">
        <CardHeader className="bg-[#25476a] text-white">
          <CardTitle className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {onBack && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="h-9 w-9 text-white hover:bg-white/10 hover:text-white"
                  aria-label="Back to claims"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <span>Course Review</span>
            </div>
            <Badge className={getStatusColor(course.claimStatus)}>{course.claimStatus}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
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

        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-gray-200 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <SectionTitle icon={BookOpen} title="Session Review" />
              <p className="text-sm text-gray-600">
                {format(new Date(selectedSession.date), 'MMM dd, yyyy')} - {selectedSession.durationMinutes} min
              </p>
            </div>

            <div className="flex items-center gap-4 self-start rounded-full bg-[#edf4fa] px-3 py-2 text-[#25476a] md:self-auto">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={goToPreviousSession}
                disabled={selectedSessionIndex === 0}
                className="h-8 w-8 rounded-full text-[#25476a] hover:bg-white"
                aria-label="Previous session"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="min-w-14 text-center text-sm font-medium">
                {selectedSessionIndex + 1} / {course.sessions.length}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={goToNextSession}
                disabled={selectedSessionIndex === course.sessions.length - 1}
                className="h-8 w-8 rounded-full text-[#25476a] hover:bg-white"
                aria-label="Next session"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead className="bg-[#eaf2fa] text-[#25476a]">
                <tr>
                  <th className="w-[34%] px-5 py-4 text-left text-xs font-semibold uppercase">
                    Student
                  </th>
                  <th className="w-[18%] border-l border-blue-100 px-5 py-4 text-center text-xs font-semibold uppercase">
                    Attendance
                  </th>
                  <th className="w-[28%] border-l border-blue-100 px-5 py-4 text-center text-xs font-semibold uppercase">
                    Assignment
                  </th>
                  <th className="w-[20%] border-l border-blue-100 px-5 py-4 text-center text-xs font-semibold uppercase">
                    Report
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {course.students.map((student) => {
                  const isPresent = presentFor(selectedSession.id, student.id);
                  const reportDone =
                    sessionReports.length > 0 && sessionReports.every((report) => report.done);

                  return (
                    <tr key={student.id} className="bg-white">
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25476a] text-xs font-semibold text-white">
                            {getInitials(student.name)}
                          </span>
                          <span className="font-medium text-gray-950">{student.name}</span>
                        </div>
                      </td>
                      <td className="border-l border-gray-100 px-5 py-5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`relative h-8 w-16 rounded-full ${
                              isPresent ? 'bg-green-500' : 'bg-red-400'
                            }`}
                            aria-label={isPresent ? 'Present' : 'Absent'}
                          >
                            <span
                              className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-transform ${
                                isPresent ? 'right-1' : 'left-1'
                              }`}
                            />
                          </span>
                          <span className={isPresent ? 'text-xs text-green-700' : 'text-xs text-red-600'}>
                            {isPresent ? 'Present' : 'Absent'}
                          </span>
                        </div>
                      </td>
                      <td className="border-l border-gray-100 px-5 py-5">
                        <div className="flex flex-wrap justify-center gap-2">
                          {sessionAssignments.length === 0 ? (
                            <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
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
                      <td className="border-l border-gray-100 px-5 py-5 text-center">
                        <Badge
                          className={
                            reportDone
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : 'bg-red-50 text-red-600 hover:bg-red-50 border border-red-200'
                          }
                        >
                          {reportDone ? 'Done' : 'Pending'}
                        </Badge>
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

        <section className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#25476a]">
                <FileText size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#25476a]">eTIMS Payment Reference</p>
                <p className="truncate text-sm text-gray-600">{course.etimsDocument}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEtimsPreviewOpen(true)}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button type="button" size="sm" onClick={openEtimsDocument}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View
              </Button>
            </div>
          </div>
        </section>

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
                    KES {course.claimAmount.toLocaleString()}
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
    </>
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

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="mt-1">{value}</p>
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
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Graded</Badge>;
  }

  if (submitted) {
    return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200">Submitted</Badge>;
  }

  return <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border border-red-200">Pending</Badge>;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function SectionTitle({ icon: Icon, title }: { icon: ElementType; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-[#25476a]">
      <Icon size={18} />
      <p className="font-medium">{title}</p>
    </div>
  );
}
