import { Claim } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { format } from 'date-fns';
import { isClaimValid, getValidationMessage, getEligibilityStatus } from '../utils/claimValidation';
import {
  Calendar,
  FileText,
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

  return (
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
          <div>
            <p className="text-sm text-gray-600">eTIMS Document</p>
            <p className="mt-1 flex items-center gap-2">
              <FileText size={16} className="text-gray-400" />
              {claim.etimsDocument}
            </p>
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
  );
}