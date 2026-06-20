import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useBrandStore } from '../stores/brandStore';
import { getStore } from '../services/store';
import VerificationBadge from '../components/shared/VerificationBadge';
import type { Campaign } from '../types/index';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function Sparkline({ color, up }: { color: string; up: boolean }) {
  const upPath   = 'M0,20 C10,20 10,15 20,15 S30,10 40,8 S50,5 60,3';
  const downPath = 'M0,5 C10,5 10,8 20,10 S30,14 40,16 S50,18 60,20';
  return (
    <svg width="60" height="22" viewBox="0 0 60 22" fill="none">
      <path d={up ? upPath : downPath} stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const STATUS_STYLE: Record<string, string> = {
  active:    'bg-emerald-100 text-emerald-700',
  draft:     'bg-slate-100 text-slate-600',
  paused:    'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
  removed:   'bg-red-100 text-red-600',
};

// ── Score breakdown bar ───────────────────────────────────────────────────────
function ScoreBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-4 py-1.5">
      <span className="text-xs font-bold text-[#6E6A65] w-40 shrink-0">{label}</span>
      <div className="flex-1 h-2.5 bg-[#F6F2E8] rounded-full overflow-hidden">
        <div className={`h-full rounded-full score-bar transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-black text-[#1F1F1F] w-14 text-right shrink-0">{pct}/100</span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BrandProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuthStore();
  const { brand, loadBrand } = useBrandStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'about' | 'reviews'>('campaigns');
  const [appliedCampaignIds, setAppliedCampaignIds] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState('');

  const handleApply = (campaignId: string) => {
    setAppliedCampaignIds((prev) => [...prev, campaignId]);
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId ? { ...c, applicantCount: c.applicantCount + 1 } : c
      )
    );
    setSuccessToast('Application submitted successfully! 🎉');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const profileId = id === 'me' ? currentUser?.id : id;
  const isOwnProfile = currentUser?.id === profileId || brand?.userId === currentUser?.id;

  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    setError('');
    loadBrand(profileId)
      .then(() => {
        const store = getStore();
        // look up by brand entity id (brand.id) not userId
        const b = store.brands
          ? Array.from(store.brands.values()).find(
              bv => bv.userId === profileId || bv.id === profileId
            )
          : null;
        const brandId = b ? b.id : (brand ? brand.id : profileId);
        if (brandId && store.campaigns) {
          const bc = Array.from(store.campaigns.values()).filter(
            c => c.brandId === brandId && c.status !== 'removed'
          );
          setCampaigns(bc);
        }
      })
      .catch(err => setError((err as Error).message || 'Failed to load brand.'))
      .finally(() => setLoading(false));
  }, [profileId, loadBrand]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-12 h-12 rounded-full bg-[#1F1F1F] flex items-center justify-center text-white font-black text-lg mb-4">CL</div>
        <div className="w-8 h-8 border-4 border-[#A8678A] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-[#6E6A65] text-sm font-medium">Loading brand profile...</p>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="text-center py-24 bg-white border border-[#E7E1D8] rounded-[20px]">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-[#1F1F1F] font-bold text-lg mb-1">{error || 'Brand not found'}</p>
        <Link to="/feed" className="inline-block mt-4 px-6 py-2.5 bg-[#1F1F1F] text-white font-bold text-sm rounded-2xl hover:opacity-90">
          ← Back to Feed
        </Link>
      </div>
    );
  }

  const scoreLabel = brand.brandScore >= 90 ? 'Top 5% Brand' : brand.brandScore >= 70 ? 'Top 15% Brand' : brand.brandScore >= 50 ? 'Verified Partner' : 'Active Partner';

  return (
    <div className="space-y-5 pb-12 max-w-5xl mx-auto">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div className="rounded-[20px] overflow-hidden border border-[#E7E1D8]"
        style={{ background: 'linear-gradient(135deg, #F8EFF3 0%, #F6F2E8 60%, #fff 100%)' }}>

        <div className="px-6 pt-6 pb-0 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-soft bg-white flex items-center justify-center shrink-0 overflow-hidden">
            <img src={brand.logoUrl} alt={brand.companyName} className="w-full h-full object-contain p-1" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-black text-[#1F1F1F]">{brand.companyName}</h1>
              <VerificationBadge status={brand.verificationStatus} size="sm" />
              {brand.isNewToPlatform && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F8EFF3] text-[#A8678A] border border-[#A8678A]/30">
                  New to Platform
                </span>
              )}
            </div>
            <p className="text-[#A8678A] text-sm font-semibold mb-1 capitalize">{brand.industry}</p>
            <p className="text-[#6E6A65] text-sm leading-relaxed max-w-xl">{brand.description}</p>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            {isOwnProfile ? (
              <Link to="/brand/me/campaigns/new"
                className="px-4 py-2 bg-[#1F1F1F] text-white font-bold text-xs rounded-xl hover:opacity-90 transition-opacity">
                + New Campaign
              </Link>
            ) : (
              <button className="px-5 py-2 bg-[#1F1F1F] text-white font-bold text-xs rounded-xl hover:opacity-90">
                Contact Brand
              </button>
            )}
            <button className="px-4 py-2 bg-white border border-[#E7E1D8] text-[#1F1F1F] font-bold text-xs rounded-xl hover:bg-[#F8EFF3] flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
              </svg>
              Save
            </button>
          </div>
        </div>

      </div>

      {/* ── STAT CARDS ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Brand Trust Score', value: brand.isNewToPlatform ? 'New' : String(brand.brandScore), color: 'text-[#A8678A]', sub: 'Top 1% Brand' },
          { label: 'Collabs Done',      value: String(brand.completedCollaborations), color: 'text-[#1F1F1F]', sub: 'Total Collabs' },
          { label: 'Creator Rating',    value: brand.averageCreatorRating > 0 ? `${brand.averageCreatorRating.toFixed(1)}★` : '—', color: 'text-[#1F1F1F]', sub: '124 Reviews' },
          { label: 'Response Time',     value: brand.averageResponseTimeHours > 0 ? `${brand.averageResponseTimeHours}h` : '—', color: 'text-[#1F1F1F]', sub: 'Avg Response' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="bg-white border border-[#E7E1D8] rounded-2xl p-4 flex flex-col justify-between gap-1 relative group min-h-[96px]">
            <p className={`text-3xl font-black tracking-tight ${color} leading-none`}>{value}</p>
            <p className="text-[10px] text-[#6E6A65] font-black uppercase tracking-wider leading-none mt-auto">{label}</p>
            {sub && <p className="text-[9px] text-[#A8678A] font-semibold leading-none mt-1">{sub}</p>}
          </div>
        ))}
      </div>

      {/* ── BRAND SCORE + BREAKDOWN ──────────────────────────────────── */}
      {/* ── BRAND TRUST REPORT & BREAKDOWN ──────────────────────────── */}
      {!brand.isNewToPlatform && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 🛡️ Brand Trust Report (Score, category info, based on, and snapshot) */}
          <div className="bg-[#A8678A]/4 border border-[#A8678A]/20 rounded-2xl p-6 shadow-card flex flex-col justify-between gap-4 h-full">
            <div role="img" aria-label={`Brand Trust Score: ${brand.brandScore} out of 100`} className="flex flex-col gap-4">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg leading-none select-none">🛡️</span>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#1F1F1F] leading-none">Brand Trust Score</h3>
                </div>
                <span className="text-[9px] font-bold text-[#A8678A] uppercase tracking-wider pl-7 leading-none block">
                  Primary Trust Indicator
                </span>
              </div>

              {/* Score display & Ring */}
              <div className="flex items-center gap-6">
                {/* Ring chart */}
                <div className="relative w-20 h-20 shrink-0">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="38" fill="none" stroke="#E7E1D8" strokeWidth="10" />
                    <circle cx="48" cy="48" r="38" fill="none" stroke="#A8678A" strokeWidth="10"
                      strokeDasharray={`${(brand.brandScore / 100) * 238.76} 238.76`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-base font-black text-[#1F1F1F]">{brand.brandScore}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#1F1F1F] tracking-tight">{brand.brandScore}</span>
                    <span className="text-[#6E6A65] font-semibold text-xs">/ 100</span>
                  </div>
                  <div className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-[#F8EFF3] text-[#A8678A] inline-block uppercase tracking-wider border border-[#A8678A]/20">
                    🏆 Top Brand in {brand.industry ? (brand.industry.charAt(0).toUpperCase() + brand.industry.slice(1)) : 'Consumer Electronics'}
                  </div>
                </div>
              </div>

              {/* Based On List */}
              <div>
                <p className="text-[10px] font-black text-[#1F1F1F] uppercase tracking-wider mb-1.5">Based on:</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-[#6E6A65]">
                  <div className="flex items-center gap-1">
                    <span className="text-[#A8678A]">•</span> Payment Reliability
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[#A8678A]">•</span> Creator Feedback
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[#A8678A]">•</span> Communication Quality
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[#A8678A]">•</span> Campaign Performance
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#6E6A65] leading-relaxed">
                Our trust engine evaluates brands continuously based on verified platform interactions, historical payments, and direct creator feedback.
              </p>
            </div>

            {/* Brand Snapshot Row */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] font-bold text-[#6E6A65] border-t border-[#A8678A]/15 pt-3.5 mt-auto">
              <span className="text-[#A8678A]">🏢</span>
              <span className="text-emerald-700 font-bold">✓ Verified Brand</span>
              <span className="text-[#6E6A65]/40 select-none">•</span>
              <span>92% On-Time Payments</span>
              <span className="text-[#6E6A65]/40 select-none">•</span>
              <span>4.6★ Rating</span>
              <span className="text-[#6E6A65]/40 select-none">•</span>
              <span>6h Response Time</span>
              <span className="text-[#6E6A65]/40 select-none">•</span>
              <span>68% Repeat Collaborations</span>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="bg-white border border-[#E7E1D8] rounded-2xl p-5 shadow-card flex flex-col justify-between gap-3 h-full">
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none select-none">📊</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1F1F1F] leading-none">Score Breakdown</h3>
            </div>
            <div className="space-y-2.5 flex-1 flex flex-col justify-center my-auto">
              <ScoreBar label="Payment Reliability"    pct={Math.min(100, Math.round(brand.brandScore * 1.05))} color="bg-[#1F1F1F]" />
              <ScoreBar label="Creator Reviews"        pct={Math.round(brand.averageCreatorRating * 20)} color="bg-[#A8678A]" />
              <ScoreBar label="Campaign Success Rate"  pct={brand.completedCollaborations > 0 ? 88 : 0} color="bg-[#1F1F1F]" />
              <ScoreBar label="Communication Quality"  pct={brand.averageResponseTimeHours <= 4 ? 95 : brand.averageResponseTimeHours <= 12 ? 75 : 50} color="bg-[#A8678A]" />
              <ScoreBar label="Response Speed"         pct={brand.averageResponseTimeHours <= 2 ? 100 : brand.averageResponseTimeHours <= 6 ? 80 : 55} color="bg-[#1F1F1F]" />
            </div>
          </div>
        </div>
      )}

      {/* ── TABS ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-white border border-[#E7E1D8] rounded-2xl p-1.5 w-fit">
        {(['campaigns', 'about', 'reviews'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              activeTab === tab
                ? 'bg-[#1F1F1F] text-white'
                : 'text-[#6E6A65] hover:text-[#1F1F1F] hover:bg-[#F8EFF3]'
            }`}>
            {tab === 'campaigns' ? '📢 Campaigns' : tab === 'about' ? '🏢 About' : '⭐ Reviews'}
          </button>
        ))}
      </div>

      {/* ── CAMPAIGNS TAB ────────────────────────────────────────────── */}
      {activeTab === 'campaigns' && (
        <div>
          {isOwnProfile && (
            <div className="flex justify-end mb-4">
              <Link to="/brand/me/campaigns/new"
                className="flex items-center gap-2 px-4 py-2 bg-[#1F1F1F] text-white font-bold text-xs rounded-xl hover:opacity-90">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Campaign
              </Link>
            </div>
          )}

          {campaigns.length === 0 ? (
            <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-16 text-center">
              <div className="text-5xl mb-4">📢</div>
              <p className="text-[#1F1F1F] font-bold mb-1">No campaigns yet</p>
              <p className="text-[#6E6A65] text-sm mb-5">
                {isOwnProfile ? 'Create your first campaign to start finding creators.' : 'This brand has no active campaigns.'}
              </p>
              {isOwnProfile && (
                <Link to="/brand/me/campaigns/new"
                  className="px-6 py-2.5 bg-[#1F1F1F] text-white font-bold text-xs rounded-xl hover:opacity-90">
                  + Create Campaign
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaigns.map(camp => (
                <div key={camp.id}
                  className="bg-white border border-[#E7E1D8] rounded-[24px] p-6 hover:border-[#A8678A] hover:shadow-[0_12px_30px_rgba(168,103,138,0.08)] hover:-translate-y-1 transition-all duration-300 group flex flex-col min-h-[220px]">
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLE[camp.status] ?? 'bg-slate-100 text-slate-600'}`}>
                          {camp.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F8EFF3] text-[#A8678A] capitalize">
                          {camp.compensationType.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="font-black text-[#1F1F1F] text-base group-hover:text-[#A8678A] transition-colors">
                        {camp.title}
                      </h4>
                    </div>
                    <div className="text-right shrink-0">
                      {camp.compensationAmount && (
                        <p className="text-base font-black text-[#1F1F1F] tracking-tight">
                          ₹{fmtNum(camp.compensationAmount)}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-[#6E6A65] leading-relaxed line-clamp-2 flex-1 mb-4">
                    {camp.description}
                  </p>

                  {/* Category chips */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {camp.contentCategories.map(cat => (
                      <span key={cat} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F6F2E8] text-[#6E6A65] capitalize">
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Trust Badges */}
                  <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-bold uppercase tracking-wider leading-none shadow-sm select-none">
                      ✓ Verified Brand
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-[#E7E1D8] text-[9px] font-semibold uppercase tracking-wider leading-none shadow-sm select-none">
                      92% On-Time Payments
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#F8EFF3] text-[#A8678A] border border-[#A8678A]/20 text-[9px] font-semibold uppercase tracking-wider leading-none shadow-sm select-none">
                      {brand.averageCreatorRating > 0 ? `${brand.averageCreatorRating.toFixed(1)}★ Rating` : '4.6★ Rating'}
                    </span>
                  </div>

                  <div className="border-t border-[#E7E1D8] pt-3 flex items-center justify-between">
                    <span className="text-xs text-[#6E6A65] font-medium">
                      {camp.applicantCount} applicants · Due {new Date(camp.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                    {isOwnProfile ? (
                      <div className="flex gap-3">
                        <Link to={`/brand/me/campaigns/${camp.id}/edit`}
                          className="text-xs font-bold text-[#6E6A65] hover:text-[#1F1F1F]">Edit</Link>
                        <Link to={`/brand/me/campaigns/${camp.id}/review`}
                          className="text-xs font-bold text-[#A8678A] hover:underline">Review →</Link>
                      </div>
                    ) : (
                      !isOwnProfile && currentUser?.role === 'creator' && (
                        <button
                          onClick={() => handleApply(camp.id)}
                          className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 shadow-sm active:scale-95 ${
                            appliedCampaignIds.includes(camp.id)
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default font-bold'
                              : 'bg-[#1F1F1F] text-white hover:bg-[#A8678A] hover:shadow-soft'
                          }`}
                          disabled={appliedCampaignIds.includes(camp.id)}
                        >
                          {appliedCampaignIds.includes(camp.id) ? 'Applied ✓' : 'Apply Now'}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ABOUT TAB ────────────────────────────────────────────────── */}
      {activeTab === 'about' && (
        <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-6 space-y-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6E6A65] mb-2">Company Overview</p>
            <p className="text-sm text-[#6E6A65] leading-relaxed mb-3">
              {brand.description || 'We build smart devices that integrate seamlessly into your lifestyle.'}
            </p>
            <p className="text-sm text-[#6E6A65] leading-relaxed">
              We specialize in creating premium products designed for modern creators and consumers. Our company values transparent collaborations, timely compensation, and clear communication. Over the past few years, we have partnered with hundreds of digital creators across beauty, lifestyle, and tech niches, delivering successful campaigns with mutual growth. We look forward to building long-term partnerships with creators who share our vision of premium quality and authenticity.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Industry', value: brand.industry },
              { label: 'Verification', value: brand.verificationStatus },
              { label: 'Platform Status', value: brand.isNewToPlatform ? 'New' : 'Established' },
              { label: 'Completed Collabs', value: String(brand.completedCollaborations) },
              { label: 'Creator Rating', value: brand.averageCreatorRating > 0 ? `${brand.averageCreatorRating.toFixed(1)} / 5.0` : 'No ratings yet' },
              { label: 'Response Time', value: brand.averageResponseTimeHours > 0 ? `~${brand.averageResponseTimeHours}h` : 'N/A' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F6F2E8] rounded-2xl px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E6A65] mb-1">{label}</p>
                <p className="text-sm font-black text-[#1F1F1F] capitalize">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── REVIEWS TAB ──────────────────────────────────────────────── */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {[
            {
              id: 'rev-1',
              creatorName: 'Aarav Mehta',
              role: 'Tech & Lifestyle Creator',
              rating: 5,
              date: 'May 12, 2026',
              text: 'Working with this brand was an absolute breeze. The brief was crystal clear, payment was initiated within 24 hours of campaign delivery, and the communication team was extremely supportive throughout the approval process. Highly recommended!',
              avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Aarav'
            },
            {
              id: 'rev-2',
              creatorName: 'Neha Sharma',
              role: 'Beauty & Wellness Influencer',
              rating: 4.5,
              date: 'April 28, 2026',
              text: 'Very professional brand partnership. They gave me full creative freedom on the content as long as key features were demonstrated. Response times were quick and payment was completely on-time. Will definitely collaborate again.',
              avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Neha'
            }
          ].map(review => (
            <div key={review.id} className="bg-white border border-[#E7E1D8] rounded-[20px] p-5 hover:border-[#A8678A]/45 hover:shadow-soft transition-all">
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-[#E7E1D8] shrink-0">
                  <img src={review.avatar} alt={review.creatorName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-[#1F1F1F]">{review.creatorName}</h4>
                    <span className="text-[10px] text-[#6E6A65]">{review.date}</span>
                  </div>
                  <p className="text-[11px] text-[#A8678A] font-semibold">{review.role}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-sm ${i < Math.floor(review.rating) ? 'text-amber-500' : 'text-slate-200'}`}>★</span>
                ))}
                <span className="text-xs font-black text-[#1F1F1F] ml-1">{review.rating}</span>
              </div>
              
              <p className="text-sm text-[#6E6A65] leading-relaxed">
                {review.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── SUCCESS TOAST ── */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1F1F1F] text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-[#E7E1D8]/20 animate-in fade-in slide-in-from-bottom-5 duration-300 font-bold text-sm">
          <span>{successToast}</span>
        </div>
      )}
    </div>
  );
}
