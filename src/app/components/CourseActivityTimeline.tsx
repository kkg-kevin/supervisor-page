import { Claim } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { format } from 'date-fns';
import { Clock, User, BookOpen, ArrowRight } from 'lucide-react';

interface CourseActivityTimelineProps {
  claims: Claim[];
  selectedClaimId: string | null;
  onSelectClaim: (claimId: string) => void;
}

export function CourseActivityTimeline({
  claims,
  selectedClaimId,
  onSelectClaim,
}: CourseActivityTimelineProps) {
  // Sort claims by date (newest first)
  const sortedClaims = [...claims].sort(
    (a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime()
  );

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
    <Card className="border-gray-200 h-full">
      <CardHeader className="bg-[#25476a] text-white">
        <CardTitle className="flex items-center gap-2">
          <Clock size={20} />
          Course Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="p-4 space-y-3">
            {sortedClaims.map((claim, index) => {
              const isSelected = claim.id === selectedClaimId;

              return (
                <div
                  key={claim.id}
                  onClick={() => onSelectClaim(claim.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-[#25476a] shadow-md'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            claim.status === 'Pending Review'
                              ? '#feb139'
                              : claim.status === 'Approved'
                              ? '#38aae1'
                              : claim.status === 'Rejected'
                              ? '#ef4444'
                              : '#16a34a',
                        }}
                      />
                      <span className="text-xs text-gray-500">
                        {format(new Date(claim.submittedDate), 'MMM dd, yyyy · HH:mm')}
                      </span>
                    </div>
                    <Badge className={getStatusColor(claim.status)} variant="secondary">
                      {claim.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-sm font-medium">{claim.mentorName}</span>
                      <ArrowRight size={14} className="text-gray-300" />
                      <BookOpen size={16} className="text-gray-400" />
                      <span className="text-sm">{claim.courseName}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Method:</span>
                        <p className="text-gray-700 truncate">{claim.teachingMethod}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <p className="text-gray-700">{claim.paymentType}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Progress:</span>
                        <p className="font-medium" style={{ color: '#38aae1' }}>
                          {claim.progress}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        Sessions: {claim.courseActivity.courseSessions.completed}/
                        {claim.courseActivity.courseSessions.total}
                      </span>
                      <span className="text-xs text-gray-500">
                        Attendance: {claim.courseActivity.learnerAttendance}%
                      </span>
                      <span className="text-sm" style={{ color: '#25476a' }}>
                        KES {claim.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
