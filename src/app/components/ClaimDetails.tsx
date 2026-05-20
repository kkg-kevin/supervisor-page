import { Claim } from '../types';
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
import { isClaimValid, getValidationMessage, getEligibilityStatus } from '../utils/claimValidation';
import {
  Calendar,
  FileText,
  Eye,
  ExternalLink,
  TrendingUp,
  Users,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Send,
} from 'lucide-react';
import { useState } from 'react';

interface ClaimDetailsProps {
  claim: Claim | null;
  onApproveClaim: (claimId: string) => void;
  onRejectClaim: (claimId: string, reason: string) => void;
  onMoveToFinance: (claimId: string) => void;
}

export function ClaimDetails({
  claim,
  onApproveClaim,
  onRejectClaim,
  onMoveToFinance,
}: ClaimDetailsProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [isEtimsPreviewOpen, setIsEtimsPreviewOpen] = useState(false);

  if (!claim) {
    return (
      <Card className="border-gray-200 h-full flex items-center justify-center">
        <CardContent className="text-center text-gray-500 py-12">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Select a claim to view details</p>
        </CardContent>
      </Card>
    );
  }

  const isValid = isClaimValid(claim);
  const validationMessage = getValidationMessage(claim);
  const eligibility = getEligibilityStatus(claim);

  const handleReject = () => {
    if (showRejectionInput) {
      if (rejectionReason.trim()) {
        onRejectClaim(claim.id, rejectionReason);
        setRejectionReason('');
        setShowRejectionInput(false);
      }
    } else {
      setShowRejectionInput(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Review':
        return 'bg-[#feb139] text-white hover:bg-[#feb139]';
      case 'Approved':
        return 'bg-[#38aae1] text-white hover:bg-[#38aae1]';
      case 'Rejected':
        return 'bg-red-500 text-white hover:bg-red-500';
      case 'Moved to Finance':
        return 'bg-green-600 text-white hover:bg-green-600';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const openEtimsDocument = () => {
    const documentHtml = `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${claim.etimsDocument}</title>
          <style>
            body {
              margin: 0;
              background: #eef2f6;
              color: #1f2937;
              font-family: Arial, sans-serif;
            }
            main {
              width: min(840px, calc(100% - 32px));
              margin: 32px auto;
              background: white;
              border: 1px solid #d6dde6;
              box-shadow: 0 20px 50px rgba(37, 71, 106, 0.18);
            }
            header {
              background: #25476a;
              color: white;
              padding: 28px 36px;
            }
            section {
              padding: 28px 36px;
            }
            h1, h2, p {
              margin: 0;
            }
            h1 {
              font-size: 24px;
            }
            h2 {
              color: #25476a;
              font-size: 16px;
              margin-bottom: 14px;
            }
            .meta {
              color: #bfdbfe;
              margin-top: 8px;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 16px;
            }
            .field {
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 10px;
            }
            .label {
              color: #6b7280;
              font-size: 12px;
              margin-bottom: 4px;
            }
            .value {
              font-size: 15px;
            }
            .amount {
              color: #25476a;
              font-size: 28px;
              font-weight: 700;
            }
            .stamp {
              border: 2px solid #38aae1;
              color: #25476a;
              display: inline-block;
              font-weight: 700;
              letter-spacing: 1px;
              margin-top: 20px;
              padding: 10px 16px;
            }
          </style>
        </head>
        <body>
          <main>
            <header>
              <h1>eTIMS Tax Invoice</h1>
              <p class="meta">${claim.etimsDocument}</p>
            </header>
            <section>
              <h2>Claim Summary</h2>
              <div class="grid">
                <div class="field">
                  <p class="label">Mentor</p>
                  <p class="value">${claim.mentorName}</p>
                </div>
                <div class="field">
                  <p class="label">Course</p>
                  <p class="value">${claim.courseName}</p>
                </div>
                <div class="field">
                  <p class="label">Teaching Method</p>
                  <p class="value">${claim.teachingMethod}</p>
                </div>
                <div class="field">
                  <p class="label">Payment Type</p>
                  <p class="value">${claim.paymentType}</p>
                </div>
                <div class="field">
                  <p class="label">Submitted Date</p>
                  <p class="value">${format(new Date(claim.submittedDate), 'MMM dd, yyyy')}</p>
                </div>
                <div class="field">
                  <p class="label">Claim Status</p>
                  <p class="value">${claim.status}</p>
                </div>
              </div>
            </section>
            <section>
              <h2>Invoice Amount</h2>
              <p class="amount">KES ${claim.amount.toLocaleString()}</p>
              <p class="stamp">eTIMS DOCUMENT VERIFIED</p>
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
          <CardTitle className="flex items-center justify-between">
            <span>Claim Details</span>
            <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Mentor Name</p>
            <p className="mt-1">{claim.mentorName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Course Name</p>
            <p className="mt-1">{claim.courseName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Teaching Method</p>
            <p className="mt-1">{claim.teachingMethod}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Payment Type</p>
            <p className="mt-1">{claim.paymentType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Amount</p>
            <p className="mt-1 text-lg" style={{ color: '#25476a' }}>
              KES {claim.amount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Submitted Date</p>
            <p className="mt-1 flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              {format(new Date(claim.submittedDate), 'MMM dd, yyyy')}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-600">eTIMS Document</p>
            <div className="mt-2 flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex min-w-0 items-center gap-2 text-sm">
                <FileText size={16} className="shrink-0 text-gray-400" />
                <span className="truncate">{claim.etimsDocument}</span>
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEtimsPreviewOpen(true)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button type="button" size="sm" onClick={openEtimsDocument}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View
                </Button>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Eligibility</p>
            <Badge
              className={`mt-1 ${
                eligibility === 'Eligible'
                  ? 'bg-green-100 text-green-800 hover:bg-green-100'
                  : 'bg-red-100 text-red-800 hover:bg-red-100'
              }`}
            >
              {eligibility}
            </Badge>
          </div>
        </div>

        {/* Course Progress */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Course Progress</p>
          <div className="flex items-center gap-3">
            <Progress
              value={claim.progress}
              className="h-3 flex-1 bg-gray-200"
              style={
                {
                  '--progress-background': '#38aae1',
                } as React.CSSProperties
              }
            />
            <span className="text-sm font-medium" style={{ color: '#38aae1' }}>
              {claim.progress}%
            </span>
          </div>
          {validationMessage && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle size={16} />
              {validationMessage}
            </div>
          )}
        </div>

        {/* Course Activity Stats */}
        <div>
          <p className="text-sm text-gray-600 mb-3">Course Activity</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <BookOpen size={16} />
                <span>Course Sessions</span>
              </div>
              <p className="text-lg" style={{ color: '#25476a' }}>
                {claim.courseActivity.courseSessions.completed}/
                {claim.courseActivity.courseSessions.total}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <CheckCircle2 size={16} />
                <span>Lesson Content</span>
              </div>
              <p className="text-lg" style={{ color: '#25476a' }}>
                {claim.courseActivity.lessonContent.completed}/
                {claim.courseActivity.lessonContent.total}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Users size={16} />
                <span>Learner Attendance</span>
              </div>
              <p className="text-lg" style={{ color: '#25476a' }}>
                {claim.courseActivity.learnerAttendance}%
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <TrendingUp size={16} />
                <span>Report</span>
              </div>
              <p className="text-lg" style={{ color: '#25476a' }}>
                {claim.courseActivity.report}%
              </p>
            </div>
          </div>
        </div>

        {/* Rejection Reason (if rejected) */}
        {claim.status === 'Rejected' && claim.rejectionReason && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 mb-1">Rejection Reason:</p>
            <p className="text-sm text-red-900">{claim.rejectionReason}</p>
          </div>
        )}

        {/* Action Buttons */}
        {claim.status === 'Pending Review' && (
          <div className="space-y-3 pt-4 border-t">
            {showRejectionInput ? (
              <div className="space-y-3">
                <Textarea
                  placeholder="Enter rejection reason..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
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
              <div className="flex gap-3">
                <Button
                  onClick={() => onApproveClaim(claim.id)}
                  disabled={!isValid}
                  className="flex-1 hover:opacity-90"
                  style={{
                    backgroundColor: isValid ? '#38aae1' : undefined,
                  }}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve Claim
                </Button>
                <Button onClick={handleReject} variant="destructive" className="flex-1">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Reject Claim
                </Button>
              </div>
            )}
          </div>
        )}

        {claim.status === 'Approved' && (
          <div className="pt-4 border-t">
            <Button
              onClick={() => onMoveToFinance(claim.id)}
              className="w-full hover:opacity-90"
              style={{ backgroundColor: '#25476a' }}
            >
              <Send className="mr-2 h-4 w-4" />
              Move to Finance
            </Button>
          </div>
        )}
        </CardContent>
      </Card>

      <Dialog open={isEtimsPreviewOpen} onOpenChange={setIsEtimsPreviewOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#25476a]" />
              {claim.etimsDocument}
            </DialogTitle>
            <DialogDescription>
              eTIMS document preview for {claim.mentorName}'s {claim.courseName} claim.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-gray-200 bg-gray-100 p-4">
            <div className="mx-auto max-w-[620px] border border-gray-300 bg-white shadow-lg">
              <div className="bg-[#25476a] px-6 py-5 text-white">
                <p className="text-xl">eTIMS Tax Invoice</p>
                <p className="mt-1 text-sm text-blue-200">{claim.etimsDocument}</p>
              </div>

              <div className="space-y-6 p-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Mentor</p>
                    <p className="mt-1">{claim.mentorName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Course</p>
                    <p className="mt-1">{claim.courseName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Teaching Method</p>
                    <p className="mt-1">{claim.teachingMethod}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Payment Type</p>
                    <p className="mt-1">{claim.paymentType}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Submitted Date</p>
                    <p className="mt-1">{format(new Date(claim.submittedDate), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Claim Status</p>
                    <p className="mt-1">{claim.status}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-5">
                  <p className="text-sm text-gray-500">Invoice Amount</p>
                  <p className="mt-1 text-3xl" style={{ color: '#25476a' }}>
                    KES {claim.amount.toLocaleString()}
                  </p>
                </div>

                <div className="inline-flex rounded border-2 border-[#38aae1] px-4 py-2 text-sm font-medium text-[#25476a]">
                  eTIMS DOCUMENT VERIFIED
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
