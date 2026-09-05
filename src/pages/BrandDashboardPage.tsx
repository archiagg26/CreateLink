import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getStore } from '../services/store';
import type { Creator, Campaign, Application, ApplicationStatus } from '../types/index';
import { fetchCampaigns } from '../services/campaignsService';
import { fetchApplications, updateApplicationStatus } from '../services/applicationService';
import { getAllCreators } from '../services/creatorService';
import { CreatorPortfolioReviewPage } from '../components/brand/CreatorPortfolioReviewPage';
import { getCreatorWithFallback } from './SwipeReviewPage';

function ScorePill({ score }: { score: number }) {
  return (
    <span className="px-2 py-0.5 rounded-full bg-[#F8EFF3] text-[#A8678A] border border-[#DDBFD0] text-xs font-bold shadow-2xs">
      {score}
    </span>
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const styles: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-700 border-slate-200',
    shortlisted: 'bg-amber-50 text-amber-700 border-amber-200',
    accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    declined: 'bg-rose-50 text-rose-700 border-rose-200',
    withdrawn: 'bg-neutral-100 text-neutral-500 border-neutral-200',
  };

  const currentStyle = styles[status] || styles.pending;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${currentStyle}`}>
      {status}
    </span>
  );
}

export default function BrandDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Portfolio Review State
  const [reviewingApp, setReviewingApp] = useState<Application | null>(null);
  const [reviewingCreator, setReviewingCreator] = useState<Creator | null>(null);

  // Campaign Filter in Applications Inbox
  const [selectedCampaignFilter, setSelectedCampaignFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [applicantSearch, setApplicantSearch] = useState<string>('');

  // Discover Creators Filter
  const [discoverQuery, setDiscoverQuery] = useState('');
  const [discoverCategory, setDiscoverCategory] = useState<string | null>(null);

  useEffect(() => {
    const store = getStore();

    Promise.all([
      // Load all creators including registered profiles
      getAllCreators().then((creatorsList) => {
        setCreators(creatorsList);
        for (const c of creatorsList) {
          store.creators.set(c.id, c);
        }
      }).catch(err => {
        console.warn('Failed to load all creators:', err);
        setCreators(Array.from(store.creators.values()));
      }),

      fetchCampaigns().then((campaignsList) => {
        for (const c of campaignsList) {
          store.campaigns.set(c.id, c);
        }
        setCampaigns(Array.from(store.campaigns.values()));
      }).catch(err => console.warn('Failed to load campaigns:', err)),

      fetchApplications().then((appsList) => {
        for (const a of appsList) {
          store.applications.set(a.id, a);
        }
        setApplications(Array.from(store.applications.values()));
      }).catch(err => console.warn('Failed to load applications:', err)),
    ]).finally(() => {
      setLoading(false);
    });
  }, []);

  // Handle URL query parameters (?reviewApp=... or ?campaign=...)
  useEffect(() => {
    const campParam = searchParams.get('campaign');
    if (campParam) {
      setSelectedCampaignFilter(campParam);
    }

    const appId = searchParams.get('reviewApp');
    const creatorId = searchParams.get('reviewCreator');

    if (appId && applications.length > 0) {
      const app = applications.find(a => a.id === appId);
      if (app) {
        setReviewingApp(app);
        const c = creators.find(cr => cr.id === app.creatorId) || getCreatorWithFallback(app.creatorId);
        setReviewingCreator(c);
        return;
      }
    }

    if (creatorId && creators.length > 0) {
      const c = creators.find(cr => cr.id === creatorId) || getCreatorWithFallback(creatorId);
      setReviewingCreator(c);
      const app = applications.find(a => a.creatorId === creatorId) || null;
      setReviewingApp(app);
    }
  }, [searchParams, applications, creators]);

  // Filtered applications based on selected campaign and status
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Campaign filter
      if (selectedCampaignFilter !== 'all' && app.campaignId !== selectedCampaignFilter) {
        return false;
      }
      // Status filter
      if (selectedStatusFilter !== 'all' && app.status !== selectedStatusFilter) {
        return false;
      }
      // Search filter
      if (applicantSearch.trim()) {
        const query = applicantSearch.toLowerCase();
        const creatorObj = creators.find(c => c.id === app.creatorId);
        const nameMatch = creatorObj?.displayName?.toLowerCase().includes(query);
        const pitchMatch = (app.editedPitch || app.aiPitch || '').toLowerCase().includes(query);
        const campMatch = app.campaignId.toLowerCase().includes(query);
        if (!nameMatch && !pitchMatch && !campMatch) {
          return false;
        }
      }
      return true;
    });
  }, [applications, selectedCampaignFilter, selectedStatusFilter, applicantSearch, creators]);

  // Discover Creators filter
  const filteredCreators = useMemo(() => {
    return creators.filter((c) => {
      if (discoverCategory && !c.contentCategories.includes(discoverCategory as any)) return false;
      if (discoverQuery && !c.displayName.toLowerCase().includes(discoverQuery.toLowerCase())) return false;
      return true;
    });
  }, [creators, discoverCategory, discoverQuery]);

  // Statistics
  const activeCampaignsCount = campaigns.filter(c => c.status === 'active').length;
  const approvedCount = applications.filter(a => a.status === 'accepted' || a.status === 'approved').length;
  const shortlistedCount = applications.filter(a => a.status === 'shortlisted' || a.status === 'waitlisted').length;

  // ── DEDICATED FULL-WIDTH PORTFOLIO REVIEW VIEW (MATCHING MOCKUP) ──
  if (reviewingCreator) {
    const reviewQueue = filteredApplications.length > 0 ? filteredApplications : applications;
    const currentAppIdx = reviewingApp
      ? reviewQueue.findIndex(a => a.id === reviewingApp.id)
      : -1;
    const currentCreatorIdx = filteredCreators.findIndex(c => c.id === reviewingCreator.id);

    const totalCount = reviewingApp ? reviewQueue.length : filteredCreators.length;
    const currentIndex = reviewingApp
      ? (currentAppIdx >= 0 ? currentAppIdx : 0)
      : (currentCreatorIdx >= 0 ? currentCreatorIdx : 0);

    const matchedCampaign = reviewingApp
      ? campaigns.find(c => c.id === reviewingApp.campaignId)
      : undefined;

    return (
      <CreatorPortfolioReviewPage
        creator={reviewingCreator}
        application={reviewingApp}
        campaignTitle={matchedCampaign?.title || reviewingApp?.campaignId}
        currentIndex={currentIndex}
        totalCount={totalCount}
        onPrev={() => {
          if (reviewingApp && currentAppIdx > 0) {
            const prevApp = reviewQueue[currentAppIdx - 1];
            setReviewingApp(prevApp);
            const prevCreator = creators.find(c => c.id === prevApp.creatorId) || getCreatorWithFallback(prevApp.creatorId);
            setReviewingCreator(prevCreator);
          } else if (!reviewingApp && currentCreatorIdx > 0) {
            setReviewingCreator(filteredCreators[currentCreatorIdx - 1]);
          }
        }}
        onNext={() => {
          if (reviewingApp && currentAppIdx < reviewQueue.length - 1) {
            const nextApp = reviewQueue[currentAppIdx + 1];
            setReviewingApp(nextApp);
            const nextCreator = creators.find(c => c.id === nextApp.creatorId) || getCreatorWithFallback(nextApp.creatorId);
            setReviewingCreator(nextCreator);
          } else if (!reviewingApp && currentCreatorIdx < filteredCreators.length - 1) {
            setReviewingCreator(filteredCreators[currentCreatorIdx + 1]);
          }
        }}
        onBack={() => {
          setReviewingApp(null);
          setReviewingCreator(null);
          setSearchParams({});
        }}
        onAction={async (action) => {
          if (reviewingApp) {
            const newStatus: ApplicationStatus =
              action === 'reject' ? 'rejected' : action === 'waitlist' ? 'shortlisted' : 'accepted';
            try {
              await updateApplicationStatus(reviewingApp.id, newStatus);
              setApplications(prev =>
                prev.map(a => a.id === reviewingApp.id ? { ...a, status: newStatus } : a)
              );
              // Advance to next applicant in queue if available
              if (currentAppIdx < reviewQueue.length - 1) {
                const nextApp = reviewQueue[currentAppIdx + 1];
                setReviewingApp(nextApp);
                const nextCreator = creators.find(c => c.id === nextApp.creatorId) || getCreatorWithFallback(nextApp.creatorId);
                setReviewingCreator(nextCreator);
              }
            } catch (err) {
              console.warn('Failed to update application status:', err);
            }
          } else if (reviewingCreator) {
            localStorage.setItem(`brand-review-${reviewingCreator.id}`, action);
            if (currentCreatorIdx < filteredCreators.length - 1) {
              setReviewingCreator(filteredCreators[currentCreatorIdx + 1]);
            }
          }
        }}
      />
    );
  }

  // ── DASHBOARD OVERVIEW ──
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 text-left">
      
      {/* Brand Dashboard Welcome Header */}
      <div className="bg-white border border-[#E7E1D8] rounded-[28px] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#A8678A]">
            Brand Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1F1F1F] mt-1 tracking-tight">
            Creator Review & Campaign Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6A65] mt-1 max-w-xl">
            Filter applications by campaign, review creator portfolios with full work samples & reels, and manage approvals.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/brand/me/campaigns/new"
            className="px-5 py-2.5 bg-[#1F1F1F] text-white hover:bg-black text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            + Create Campaign
          </Link>
          <Link
            to="/creators"
            className="px-4 py-2.5 bg-white border border-[#E7E1D8] text-[#1F1F1F] hover:bg-[#FAF7F2] text-xs font-bold rounded-xl transition-colors"
          >
            Browse All Creators
          </Link>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E7E1D8] p-5 rounded-2xl shadow-xs">
          <span className="text-xs text-[#6E6A65] font-semibold">Active Campaigns</span>
          <div className="text-2xl font-black text-[#1F1F1F] mt-1">{activeCampaignsCount}</div>
          <span className="text-[10px] text-[#9E9A97]">Running currently</span>
        </div>

        <div className="bg-white border border-[#E7E1D8] p-5 rounded-2xl shadow-xs">
          <span className="text-xs text-[#6E6A65] font-semibold">Applications Received</span>
          <div className="text-2xl font-black text-[#1F1F1F] mt-1">{applications.length}</div>
          <span className="text-[10px] text-[#A8678A] font-semibold">Ready for review</span>
        </div>

        <div className="bg-white border border-[#E7E1D8] p-5 rounded-2xl shadow-xs">
          <span className="text-xs text-[#6E6A65] font-semibold">Shortlisted</span>
          <div className="text-2xl font-black text-[#D97706] mt-1">{shortlistedCount}</div>
          <span className="text-[10px] text-[#9E9A97]">On waitlist</span>
        </div>

        <div className="bg-white border border-[#DDBFD0] bg-gradient-to-br from-white to-[#FDF8FA] p-5 rounded-2xl shadow-xs">
          <span className="text-xs text-[#A8678A] font-bold">Approved Creators</span>
          <div className="text-2xl font-black text-[#A8678A] mt-1">{approvedCount}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">Accepted to campaigns</span>
        </div>
      </div>

      {/* ── APPLICATIONS INBOX (WITH CAMPAIGN SELECTOR) ── */}
      <section className="bg-white border border-[#E7E1D8] rounded-[28px] p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Header and Quick Start */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E1D8]">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-black text-[#1F1F1F] tracking-tight">Applications Inbox</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F8EFF3] text-[#A8678A] text-xs font-bold border border-[#DDBFD0]">
                {filteredApplications.length} {selectedCampaignFilter !== 'all' ? 'for Selected Campaign' : 'Received'}
              </span>
            </div>
            <p className="text-xs text-[#6E6A65] mt-1">
              Select a campaign to filter applicants, or click "Review Portfolio" to open the creator's portfolio & media kit.
            </p>
          </div>

          {filteredApplications.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const pending = filteredApplications.find(a => a.status === 'pending') || filteredApplications[0];
                const c = creators.find(cr => cr.id === pending.creatorId) || getCreatorWithFallback(pending.creatorId);
                setReviewingApp(pending);
                setReviewingCreator(c);
              }}
              className="px-5 py-2.5 bg-[#A8678A] text-white hover:bg-[#935476] text-xs font-bold rounded-xl transition-all shadow-sm self-start sm:self-auto cursor-pointer"
            >
              Start Reviewing Applications →
            </button>
          )}
        </div>

        {/* ── CAMPAIGN SELECTOR TABS & FILTERS BAR ── */}
        <div className="space-y-3">
          
          {/* Campaign Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCampaignFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCampaignFilter === 'all'
                  ? 'bg-[#1F1F1F] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#6E6A65] hover:bg-[#F0EBE3] border border-[#E7E1D8]'
              }`}
            >
              All Campaigns ({applications.length})
            </button>

            {campaigns.map((camp) => {
              const campAppsCount = applications.filter(a => a.campaignId === camp.id).length;
              const isSelected = selectedCampaignFilter === camp.id;

              return (
                <button
                  key={camp.id}
                  type="button"
                  onClick={() => setSelectedCampaignFilter(camp.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#A8678A] text-white shadow-xs'
                      : 'bg-[#FAF7F2] text-[#6E6A65] hover:bg-[#F0EBE3] border border-[#E7E1D8]'
                  }`}
                >
                  <span>{camp.title}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-white text-[#A8678A] border border-[#E7E1D8]'
                  }`}>
                    {campAppsCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Filters: Status & Search */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <input
                value={applicantSearch}
                onChange={(e) => setApplicantSearch(e.target.value)}
                placeholder="Search applicants by creator name or pitch..."
                className="w-full px-3.5 py-2 text-xs border border-[#E7E1D8] rounded-xl focus:outline-none focus:border-[#A8678A] bg-[#FAF7F2]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="flex-1 sm:flex-initial px-3 py-2 text-xs border border-[#E7E1D8] rounded-xl bg-white text-[#1F1F1F] focus:outline-none focus:border-[#A8678A]"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="accepted">Accepted / Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              {(selectedCampaignFilter !== 'all' || selectedStatusFilter !== 'all' || applicantSearch) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCampaignFilter('all');
                    setSelectedStatusFilter('all');
                    setApplicantSearch('');
                  }}
                  className="px-3 py-2 text-xs text-[#A8678A] hover:bg-[#F8EFF3] font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

        </div>

        {/* ── APPLICANTS LIST ── */}
        {loading ? (
          <div className="py-16 text-center text-xs text-[#6E6A65]">Loading applications...</div>
        ) : filteredApplications.length === 0 ? (
          <div className="py-16 text-center bg-[#FAF7F2] rounded-2xl border border-dashed border-[#E7E1D8] p-6">
            <div className="w-12 h-12 rounded-full bg-white text-[#6E6A65] border border-[#E7E1D8] flex items-center justify-center mx-auto mb-3 text-xl">
              📥
            </div>
            <h4 className="font-bold text-[#1F1F1F] text-base">No Applications Match Filter</h4>
            <p className="text-xs text-[#6E6A65] mt-1 max-w-sm mx-auto">
              {selectedCampaignFilter !== 'all'
                ? 'No creator applications received yet for the selected campaign.'
                : 'No creator applications received yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E7E1D8]">
            {filteredApplications.map((app) => {
              const creatorObj = creators.find(c => c.id === app.creatorId) || getCreatorWithFallback(app.creatorId);
              const matchedCampaign = campaigns.find(c => c.id === app.campaignId);
              const pitch = app.editedPitch || app.aiPitch || 'No pitch text provided';

              return (
                <div
                  key={app.id}
                  className="py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#FAF7F2]/60 px-4 -mx-4 rounded-2xl transition-colors"
                >
                  {/* Creator Avatar & Basic Info */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <img
                      src={creatorObj.avatarUrl}
                      alt={creatorObj.displayName}
                      className="w-14 h-14 rounded-2xl object-cover border border-[#E7E1D8] bg-[#FAF7F2] shrink-0 shadow-2xs"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-[#1F1F1F] truncate">
                          {creatorObj.displayName}
                        </h3>
                        <ScorePill score={creatorObj.trustScore} />
                        <StatusBadge status={app.status} />
                      </div>
                      
                      <div className="text-xs text-[#6E6A65] mt-0.5 flex items-center gap-2 truncate">
                        <span className="font-semibold text-[#1F1F1F]">
                          Campaign: {matchedCampaign?.title || app.campaignId}
                        </span>
                        <span>•</span>
                        <span>{new Date(app.submittedAt).toLocaleDateString()}</span>
                      </div>

                      {/* Pitch Snippet */}
                      <p className="text-xs text-[#6E6A65] italic truncate mt-1 max-w-xl">
                        "{pitch}"
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setReviewingApp(app);
                        setReviewingCreator(creatorObj);
                      }}
                      className="px-4 py-2 bg-[#F8EFF3] text-[#A8678A] hover:bg-[#F3E2EC] border border-[#DDBFD0] font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    >
                      <span>Review Portfolio</span>
                      <span>→</span>
                    </button>

                    <Link
                      to={`/messages?recipient=${creatorObj.id}`}
                      className="px-3.5 py-2 border border-[#E7E1D8] text-[#1F1F1F] hover:bg-[#FAF7F2] font-semibold rounded-xl text-xs transition-colors"
                    >
                      Message
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── SECONDARY SECTIONS: ACTIVE CAMPAIGNS & DISCOVER CREATORS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Active Campaigns Card */}
        <section className="bg-white border border-[#E7E1D8] rounded-[28px] p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E1D8] mb-4">
              <div>
                <h3 className="text-lg font-black text-[#1F1F1F] tracking-tight">Active Campaigns</h3>
                <p className="text-xs text-[#6E6A65]">Campaign status and applicant distribution</p>
              </div>
              <Link
                to="/brand/me/campaigns/new"
                className="text-xs font-bold text-[#A8678A] hover:underline"
              >
                + New Campaign
              </Link>
            </div>

            <div className="space-y-3">
              {campaigns.map((camp) => {
                const campApps = applications.filter(a => a.campaignId === camp.id);
                const total = campApps.length;
                const accepted = campApps.filter(a => a.status === 'accepted' || a.status === 'approved').length;
                const shortlisted = campApps.filter(a => a.status === 'shortlisted' || a.status === 'waitlisted').length;

                return (
                  <div
                    key={camp.id}
                    className="p-4 border border-[#E7E1D8] rounded-2xl bg-[#FAF7F2] hover:bg-white transition-colors flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-[#1F1F1F]">{camp.title}</h4>
                      <div className="text-xs text-[#6E6A65] mt-0.5">
                        Status: <span className="capitalize font-semibold">{camp.status}</span>
                      </div>
                      <div className="text-[11px] text-[#A8678A] font-bold mt-1.5">
                        {total} Applicants • {shortlisted} Shortlisted • {accepted} Accepted
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCampaignFilter(camp.id);
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
                        className="px-3 py-1.5 bg-[#F8EFF3] text-[#A8678A] hover:bg-[#F3E2EC] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        title="Filter inbox by this campaign"
                      >
                        Filter ({total})
                      </button>

                      <Link
                        to={`/brand/me/campaigns/${camp.id}/review`}
                        className="px-3 py-1.5 bg-white border border-[#E7E1D8] hover:border-[#A8678A] text-[#1F1F1F] text-xs font-bold rounded-xl transition-colors shrink-0"
                      >
                        Swipe Review
                      </Link>
                    </div>
                  </div>
                );
              })}

              {campaigns.length === 0 && (
                <div className="py-8 text-center text-xs text-[#6E6A65]">
                  No campaigns created yet.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Discover Creators Section */}
        <section className="bg-white border border-[#E7E1D8] rounded-[28px] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E1D8] mb-4">
            <div>
              <h3 className="text-lg font-black text-[#1F1F1F] tracking-tight">Discover Creators</h3>
              <p className="text-xs text-[#6E6A65]">Browse and review creator profiles & portfolios</p>
            </div>
            <Link
              to="/creators"
              className="text-xs font-bold text-[#A8678A] hover:underline"
            >
              View All ({creators.length})
            </Link>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-2.5 mb-4">
            <input
              value={discoverQuery}
              onChange={(e) => setDiscoverQuery(e.target.value)}
              placeholder="Search creator by name or handle..."
              className="flex-1 px-3.5 py-2 text-xs border border-[#E7E1D8] rounded-xl focus:outline-none focus:border-[#A8678A] bg-[#FAF7F2]"
            />
            <select
              value={discoverCategory ?? ''}
              onChange={(e) => setDiscoverCategory(e.target.value || null)}
              className="px-3 py-2 text-xs border border-[#E7E1D8] rounded-xl bg-white text-[#1F1F1F] focus:outline-none focus:border-[#A8678A]"
            >
              <option value="">All niches</option>
              <option value="beauty">Beauty</option>
              <option value="fitness">Fitness</option>
              <option value="tech">Tech</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="food">Food</option>
            </select>
          </div>

          {/* Creator Cards */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {filteredCreators.slice(0, 8).map((c) => {
              const primaryPlatform = c.socialAccounts?.[0]?.platform ?? 'instagram';
              const followersCount = c.socialAccounts?.[0]?.followerCount ?? 0;

              return (
                <div
                  key={c.id}
                  className="p-3.5 border border-[#E7E1D8] rounded-2xl bg-white hover:border-[#A8678A] transition-all flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={c.avatarUrl}
                      alt={c.displayName}
                      className="w-11 h-11 rounded-xl object-cover border border-[#E7E1D8] bg-[#FAF7F2] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#1F1F1F] truncate">{c.displayName}</span>
                        <ScorePill score={c.trustScore} />
                      </div>
                      <div className="text-[11px] text-[#6E6A65] capitalize mt-0.5">
                        {primaryPlatform} • {followersCount.toLocaleString()} followers
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setReviewingCreator(c);
                        const matched = applications.find(a => a.creatorId === c.id) || null;
                        setReviewingApp(matched);
                      }}
                      className="px-3 py-1.5 text-xs bg-[#F8EFF3] text-[#A8678A] hover:bg-[#F3E2EC] font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      View Portfolio
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredCreators.length === 0 && (
              <div className="py-8 text-center text-xs text-[#6E6A65]">
                No creators matched your search.
              </div>
            )}
          </div>
        </section>

      </div>

    </div>
  );
}
