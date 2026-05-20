import { Claim } from '../types';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { format } from 'date-fns';
import { getEligibilityStatus } from '../utils/claimValidation';

interface ClaimsListProps {
  claims: Claim[];
  selectedClaimId: string | null;
  onSelectClaim: (claimId: string) => void;
}

export function ClaimsList({ claims, selectedClaimId, onSelectClaim }: ClaimsListProps) {
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

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'Physical Location':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'Home Location':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'Online':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#25476a] text-white">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Mentor</th>
              <th className="px-4 py-3 text-left font-medium">Course</th>
              <th className="px-4 py-3 text-left font-medium">Method</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Submitted</th>
              <th className="px-4 py-3 text-left font-medium">Progress</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Amount</th>
              <th className="px-4 py-3 text-left font-medium">Document</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {claims.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No claims match the current filters
                </td>
              </tr>
            ) : (
              claims.map((claim) => {
                const isSelected = claim.id === selectedClaimId;
                const eligibility = getEligibilityStatus(claim);

                return (
                  <tr
                    key={claim.id}
                    onClick={() => onSelectClaim(claim.id)}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50 border-l-4 border-l-[#25476a]' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm">{claim.mentorName}</td>
                    <td className="px-4 py-3 text-sm">{claim.courseName}</td>
                    <td className="px-4 py-3">
                      <Badge className={getMethodColor(claim.teachingMethod)} variant="secondary">
                        {claim.teachingMethod}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{claim.paymentType}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {format(new Date(claim.submittedDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-24">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={claim.progress}
                            className="h-2 bg-gray-200"
                            style={
                              {
                                '--progress-background': '#38aae1',
                              } as React.CSSProperties
                            }
                          />
                          <span className="text-xs text-gray-600 whitespace-nowrap">
                            {claim.progress}%
                          </span>
                        </div>
                        {eligibility === 'Not Eligible' && (
                          <span className="text-xs text-red-600 mt-1 block">Not Eligible</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      KES {claim.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{claim.etimsDocument}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}