import { useState, useMemo } from 'react';
import { Claim, Filters } from './types';
import { mockClaims } from './data/mockClaims';
import { StatsOverview } from './components/StatsOverview';
import { FiltersBar } from './components/FiltersBar';
import { ClaimsList } from './components/ClaimsList';
import { ClaimDetails } from './components/ClaimDetails';
import { CourseActivityTimeline } from './components/CourseActivityTimeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { ClipboardList, Clock } from 'lucide-react';

export default function App() {
  const [claims, setClaims] = useState<Claim[]>(mockClaims);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    teachingMethod: 'all',
    paymentType: 'all',
    mentor: 'all',
    course: 'all',
  });

  // Filter claims based on active filters
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      if (filters.status !== 'all' && claim.status !== filters.status) return false;
      if (filters.teachingMethod !== 'all' && claim.teachingMethod !== filters.teachingMethod)
        return false;
      if (filters.paymentType !== 'all' && claim.paymentType !== filters.paymentType)
        return false;
      if (filters.mentor !== 'all' && claim.mentorName !== filters.mentor) return false;
      if (filters.course !== 'all' && claim.courseName !== filters.course) return false;
      return true;
    });
  }, [claims, filters]);

  const selectedClaim = claims.find((c) => c.id === selectedClaimId) || null;

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      teachingMethod: 'all',
      paymentType: 'all',
      mentor: 'all',
      course: 'all',
    });
  };

  const handleApproveClaim = (claimId: string) => {
    setClaims((prevClaims) =>
      prevClaims.map((claim) =>
        claim.id === claimId ? { ...claim, status: 'Approved' as const } : claim
      )
    );
  };

  const handleRejectClaim = (claimId: string, reason: string) => {
    setClaims((prevClaims) =>
      prevClaims.map((claim) =>
        claim.id === claimId
          ? { ...claim, status: 'Rejected' as const, rejectionReason: reason }
          : claim
      )
    );
  };

  const handleMoveToFinance = (claimId: string) => {
    setClaims((prevClaims) =>
      prevClaims.map((claim) =>
        claim.id === claimId ? { ...claim, status: 'Moved to Finance' as const } : claim
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#25476a] text-white shadow-lg">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <h1 className="text-3xl">Supervisor Payment Approval Dashboard</h1>
          <p className="text-blue-200 mt-2">Review and approve mentor payment claims</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Stats Overview */}
        <StatsOverview claims={claims} />

        {/* Tabs for Claims List and Timeline */}
        <Tabs defaultValue="claims" className="space-y-4">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="claims" className="flex items-center gap-2">
              <ClipboardList size={18} />
              Claims Management
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock size={18} />
              Activity Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="claims" className="space-y-4">
            {/* Filters */}
            <FiltersBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />

            {/* Two-column layout: Claims list + Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ClaimsList
                  claims={filteredClaims}
                  selectedClaimId={selectedClaimId}
                  onSelectClaim={setSelectedClaimId}
                />
              </div>
              <div className="lg:col-span-1">
                <ClaimDetails
                  claim={selectedClaim}
                  onApproveClaim={handleApproveClaim}
                  onRejectClaim={handleRejectClaim}
                  onMoveToFinance={handleMoveToFinance}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CourseActivityTimeline
                  claims={claims}
                  selectedClaimId={selectedClaimId}
                  onSelectClaim={setSelectedClaimId}
                />
              </div>
              <div className="lg:col-span-1">
                <ClaimDetails
                  claim={selectedClaim}
                  onApproveClaim={handleApproveClaim}
                  onRejectClaim={handleRejectClaim}
                  onMoveToFinance={handleMoveToFinance}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
