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
    <div className="flex items-center gap-3">
      <span className="text-sm text-[#6E6A65] w-44 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-[#F6F2E8] rounded-full overflow-hidden">
        <div className={`h-full rounded-full score-bar ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-bold text-[#1F1F1F] w-16 text-right shrink-0">{pct}/100</span>
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
        const b = Array.from(store.brands.values()).find(
          bv => bv.userId === profileId || bv.id === profileId
        );
        if (b) {
          const bc = Array.from(store.campaigns.values()).filter(
            c => c.brandId === b.id && c.status !== 'removed'
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

  const scoreLabel = brand.brandScore >= 90 ? 'Excellent' : brand.brandScore >= 70 ? 'Great' : brand.brandScore >= 50 ? 'Good' : 'Building';

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

        {/* Mini stats */}
        <div className="flex flex-wrap gap-6 px-6 py-4 mt-2 border-t border-[#E7E1D8]/60">
          {[
            { icon: '🤝', value: String(brand.completedCollaborations), label: 'Collabs Done' },
            { icon: '⭐', value: brand.averageCreatorRating > 0 ? `${brand.averageCreatorRating.toFixed(1)}/5` : 'N/A', label: 'Creator Rating' },
            { icon: '⚡', value: brand.averageResponseTimeHours > 0 ? `${brand.averageResponseTimeHours}h` : 'N/A', label: 'Avg Response' },
            { icon: '📢', value: String(campaigns.length), label: 'Campaigns' },
          ].map(({ icon, value, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-base">{icon}</span>
              <div>
                <p className="text-xs font-black text-[#1F1F1F]">{value}</p>
                <p className="text-[10px] text-[#6E6A65]">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── STAT CARDS ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Brand Score',    value: brand.isNewToPlatform ? 'New' : String(brand.brandScore), color: 'text-[#A8678A]', sparkColor: '#A8678A', up: true },
          { label: 'Collabs',        value: String(brand.completedCollaborations), color: 'text-[#1F1F1F]', sparkColor: '#1F1F1F', up: true },
          { label: 'Creator Rating', value: brand.averageCreatorRating > 0 ? `${brand.averageCreatorRating.toFixed(1)}★` : '—', color: 'text-[#1F1F1F]', sparkColor: '#1F1F1F', up: true },
          { label: 'Response Time',  value: brand.averageResponseTimeHours > 0 ? `${brand.averageResponseTimeHours}h` : '—', color: 'text-[#1F1F1F]', sparkColor: '#1F1F1F', up: false },
        ].map(({ label, value, color, sparkColor, up }) => (
          <div key={label} className="bg-white border border-[#E7E1D8] rounded-[20px] p-4 flex flex-col gap-2">
            <p className={`text-xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-[#6E6A65] font-medium">{label}</p>
            <Sparkline color={sparkColor} up={up} />
          </div>
        ))}
      </div>

      {/* ── BRAND SCORE + BREAKDOWN ──────────────────────────────────── */}
      {!brand.isNewToPlatform && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Score ring */}
          <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#A8678A]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
              <h3 className="font-black text-[#1F1F1F] text-base">Brand Score</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-[#1F1F1F]">{brand.brandScore}</span>
              <span className="text-[#6E6A65] font-semibold text-lg">/ 100</span>
              <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F8EFF3] text-[#A8678A]">
                ✓ {scoreLabel}
              </span>
            </div>
            <div className="flex justify-center my-2">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="38" fill="none" stroke="#E7E1D8" strokeWidth="10" />
                  <circle cx="48" cy="48" r="38" fill="none" stroke="#A8678A" strokeWidth="10"
                    strokeDasharray={`${(brand.brandScore / 100) * 238.76} 238.76`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-black text-[#1F1F1F]">{brand.brandScore}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-[#6E6A65] leading-relaxed">
              Based on payment reliability, creator reviews, campaign success, communication quality & response speed.
            </p>
            <div className="bg-[#F8EFF3] rounded-xl px-3 py-2 text-xs text-[#A8678A] font-semibold">
              Top brand in {brand.industry} category
            </div>
          </div>

          {/* Score breakdown */}
          <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-6 flex flex-col gap-4">
            <h3 className="font-black text-[#1F1F1F] text-base">Score Breakdown</h3>
            <div className="space-y-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map(camp => (
                <div key={camp.id}
                  className="bg-white border border-[#E7E1D8] rounded-[20px] p-5 hover:border-[#A8678A] hover:shadow-soft transition-all group flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLE[camp.status] ?? 'bg-slate-100 text-slate-600'}`}>
                          {camp.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F8EFF3] text-[#A8678A] capitalize">
                          {camp.compensationType.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="font-bold text-[#1F1F1F] text-sm group-hover:text-[#A8678A] transition-colors">
                        {camp.title}
                      </h4>
                    </div>
                    <div className="text-right shrink-0">
                      {camp.compensationAmount && (
                        <p className="text-sm font-black text-[#1F1F1F]">
                          ₹{fmtNum(camp.compensationAmount)}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#6E6A65] leading-relaxed line-clamp-2 flex-1 mb-4">
                    {camp.description}
                  </p>

                  {/* Category chips */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {camp.contentCategories.map(cat => (
                      <span key={cat} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F6F2E8] text-[#6E6A65] capitalize">
                        {cat}
                      </span>
                    ))}
                  </div>

                  <div className="border-t border-[#E7E1D8] pt-3 flex items-center justify-between">
                    <span className="text-xs text-[#6E6A65] font-medium">
                      {camp.applicantCount} applicants · Due {new Date(camp.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                    {isOwnProfile && (
                      <div className="flex gap-3">
                        <Link to={`/brand/me/campaigns/${camp.id}/edit`}
                          className="text-xs font-bold text-[#6E6A65] hover:text-[#1F1F1F]">Edit</Link>
                        <Link to={`/brand/me/campaigns/${camp.id}/review`}
                          className="text-xs font-bold text-[#A8678A] hover:underline">Review →</Link>
                      </div>
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
            <p className="text-sm text-[#6E6A65] leading-relaxed">{brand.description}</p>
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
        <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-12 text-center">
          <div className="text-5xl mb-4">⭐</div>
          <p className="text-[#1F1F1F] font-bold">No reviews yet</p>
          <p className="text-[#6E6A65] text-sm mt-1">Creator reviews from completed collaborations will appear here.</p>
        </div>
      )}

    </div>
  );
}
