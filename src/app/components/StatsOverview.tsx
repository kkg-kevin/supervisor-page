import { Claim } from '../types';
import { Card, CardContent } from './ui/card';
import { FileText, CheckCircle, XCircle, DollarSign } from 'lucide-react';

interface StatsOverviewProps {
  claims: Claim[];
}

export function StatsOverview({ claims }: StatsOverviewProps) {
  const pendingClaims = claims.filter((c) => c.status === 'Pending Review').length;
  const approvedClaims = claims.filter((c) => c.status === 'Approved').length;
  const rejectedClaims = claims.filter((c) => c.status === 'Rejected').length;
  const totalValue = claims
    .filter((c) => c.status === 'Pending Review' || c.status === 'Approved')
    .reduce((sum, c) => sum + c.amount, 0);

  const stats = [
    {
      title: 'Pending Claims',
      value: pendingClaims,
      icon: FileText,
      color: '#feb139',
    },
    {
      title: 'Approved Claims',
      value: approvedClaims,
      icon: CheckCircle,
      color: '#38aae1',
    },
    {
      title: 'Rejected Claims',
      value: rejectedClaims,
      icon: XCircle,
      color: '#ef4444',
    },
    {
      title: 'Total Claim Value',
      value: `KES ${totalValue.toLocaleString()}`,
      icon: DollarSign,
      color: '#25476a',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl mt-2" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
