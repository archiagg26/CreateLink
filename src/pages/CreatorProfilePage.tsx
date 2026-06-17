import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCreatorStore } from '../stores/creatorStore';
import VerificationBadge from '../components/shared/VerificationBadge';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

const CAT_COLORS: Record<string, string> = {
  beauty:    'bg-[#F8EFF3] text-[#A8678A]',
  fitness:   'bg-[#F8EFF3] text-[#A8678A]',
  tech:      'bg-[#F8EFF3] text-[#A8678A]',
  food:      'bg-[#F8EFF3] text-[#A8678A]',
  travel:    'bg-[#F8EFF3] text-[#A8678A]',
  gaming:    'bg-[#F8EFF3] text-[#A8678A]',
  lifestyle: 'bg-[#F8EFF3] text-[#A8678A]',
  finance:   'bg-[#F8EFF3] text-[#A8678A]',
  education: 'bg-[#F8EFF3] text-[#A8678A]',
  fashion:   'bg-[#F8EFF3] text-[#A8678A]',
};

const PLATFORM_SVG: Record<string, JSX.Element> = {
  instagram: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-pink-500">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-red-500">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-slate-800">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.41a8.16 8.16 0 004.77 1.52V7.49a4.85 4.85 0 01-1-.8z"/>
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-sky-500">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
};

// ── Sparkline SVG ─────────────────────────────────────────────────────────────
function Sparkline({ color, up }: { color: string; up: boolean }) {
  const upPath   = 'M0,20 C10,20 10,15 20,15 S30,10 40,8 S50,5 60,3';
  const downPath = 'M0,5  C10,5  10,8  20,10 S30,14 40,16 S50,18 60,20';
  return (
    <svg width="64" height="24" viewBox="0 0 64 24" fill="none">
      <path d={up ? upPath : downPath} stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ female, male, other }: { female: number; male: number; other?: number }) {
  const r = 40;
  const cx = 56;
  const cy = 56;
  const circumference = 2 * Math.PI * r;
  const femaleAngle = female * 360;
  const maleAngle   = male   * 360;
  const otherAngle  = (other ?? 0) * 360;

  function arc(startDeg: number, endDeg: number, color: string, key: string) {
    const start = ((startDeg - 90) * Math.PI) / 180;
    const end   = ((endDeg - 90)   * Math.PI) / 180;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return (
      <path
        key={key}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
        fill={color}
      />
    );
  }

  const segments = [
    { start: 0,                          end: femaleAngle,                color: '#f472b6' },
    { start: femaleAngle,                end: femaleAngle + maleAngle,    color: '#a78bfa' },
    { start: femaleAngle + maleAngle,    end: femaleAngle + maleAngle + otherAngle, color: '#fbbf24' },
  ].filter(s => s.end > s.start);

  return (
    <svg width="112" height="112" viewBox="0 0 112 112">
      {segments.map((s, i) => arc(s.start, s.end, s.color, String(i)))}
      {/* center hole */}
      <circle cx={cx} cy={cy} r={r * 0.6} fill="white" />
      <text x={cx} y={cy - 4} textAnchor="middle" className="text-sm" fontSize="14" fontWeight="800" fill="#374151">
        {Math.round(female * 100)}%
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#6b7280">
        Female
      </text>
    </svg>
  );
}

// ── Score Breakdown Bar ───────────────────────────────────────────────────────
function ScoreBar({ label, score, max, color }: { label: string; score: number; max: number; color: string }) {
  const pct = (score / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-[#6E6A65] w-44 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-[#F6F2E8] rounded-full overflow-hidden">
        <div className={`h-full rounded-full score-bar ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-bold text-[#1F1F1F] w-16 text-right shrink-0">{score}/{max}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CreatorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuthStore();
  const { creator, loadCreator } = useCreatorStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'portfolio' | 'about' | 'reviews'>('portfolio');

  const profileId = id === 'me' ? currentUser?.id : id;
  const isOwnProfile = currentUser?.id === profileId || creator?.userId === currentUser?.id;

  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    setError('');
    loadCreator(profileId)
      .catch((err: unknown) => setError((err as Error).message || 'Failed to load profile.'))
      .finally(() => setLoading(false));
  }, [profileId, loadCreator]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-12 h-12 rounded-full bg-[#1F1F1F] flex items-center justify-center text-white font-black text-lg mb-4">CL</div>
        <div className="w-8 h-8 border-4 border-[#A8678A] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-[#6E6A65] text-sm font-medium">Loading profile...</p>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="text-center py-24 bg-white border border-[#E7E1D8] rounded-[20px] shadow-card">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-[#1F1F1F] font-bold text-lg mb-1">{error || 'Profile not found'}</p>
        <p className="text-[#6E6A65] text-sm mb-6">We couldn't find this creator's profile.</p>
        <Link to="/feed" className="inline-block px-6 py-2.5 bg-[#1F1F1F] text-white font-bold text-sm rounded-2xl shadow-soft hover:opacity-90">
          ← Back to Feed
        </Link>
      </div>
    );
  }

  const totalFollowers = creator.socialAccounts.reduce((s, a) => s + a.followerCount, 0);
  const dem = creator.insights.audienceDemographics;
  const connectedPlatforms = creator.socialAccounts.filter(a => a.connected);

  // Mock recent collaborations (from history + brand names)
  const recentCollabs = [
    { name: 'Samsung',    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=Samsung&backgroundType=gradientLinear', date: 'May 2024', bg: 'bg-blue-100' },
    { name: 'Sephora',    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=Sephora', date: 'Apr 2024', bg: 'bg-slate-900' },
    { name: 'Lululemon',  logo: 'https://api.dicebear.com/7.x/initials/svg?seed=Lululemon', date: 'Mar 2024', bg: 'bg-red-100' },
    { name: 'Glossier',   logo: 'https://api.dicebear.com/7.x/initials/svg?seed=Glossier', date: 'Feb 2024', bg: 'bg-pink-50' },
  ];

  return (
    <div className="space-y-5 pb-12 max-w-5xl mx-auto">

      {/* ── HERO CARD ──────────────────────────────────────────────────── */}
      <div className="rounded-[20px] overflow-hidden shadow-card border border-[#E7E1D8]"
        style={{ background: '#F8EFF3' }}>

        {/* Top area: avatar + name + CTAs */}
        <div className="px-6 pt-6 pb-0 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          {/* Avatar with online dot */}
          <div className="relative shrink-0">
            <img src={creator.avatarUrl} alt={creator.displayName}
              className="w-24 h-24 rounded-full border-4 border-white shadow-soft object-cover bg-white" />
            <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white" />
          </div>

          {/* Name block */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-black text-[#1F1F1F]">{creator.displayName}</h1>
              <VerificationBadge status={creator.verificationStatus} size="sm" />
            </div>
            <p className="text-[#6E6A65] text-sm mb-2">{creator.contentCategories.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' & ')} Creator</p>
            <p className="text-[#6E6A65] text-xs flex items-center gap-1 mb-3">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              San Francisco, CA
            </p>

            {/* Category tags */}
            <div className="flex flex-wrap gap-1.5">
              {creator.contentCategories.map((cat) => (
                <span key={cat} className={`px-3 py-0.5 rounded-full text-xs font-bold capitalize ${CAT_COLORS[cat] ?? 'bg-slate-100 text-slate-600'}`}>
                  {cat}
                </span>
              ))}
              {creator.contentCategories.length > 2 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F8EFF3] text-[#A8678A]">+2</span>
              )}
            </div>
          </div>

          {/* Social icons */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {creator.socialAccounts.map((acc, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-white shadow-soft border border-[#E7E1D8] flex items-center justify-center">
                {PLATFORM_SVG[acc.platform] ?? <span className="text-xs">🔗</span>}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full bg-white shadow-soft border border-[#E7E1D8] flex items-center justify-center">
              <svg className="w-4 h-4 text-[#6E6A65]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {isOwnProfile ? (
              <Link to="/creator/me/portfolio"
                className="px-4 py-2 bg-[#1F1F1F] text-white font-bold text-xs rounded-xl shadow-soft hover:opacity-90 transition-opacity">
                ✏️ Edit Profile
              </Link>
            ) : (
              <button className="px-5 py-2 bg-[#1F1F1F] text-white font-bold text-xs rounded-xl shadow-soft hover:opacity-90 transition-opacity">
                Contact Creator
              </button>
            )}
            <button className="px-4 py-2 bg-white border border-[#E7E1D8] text-[#1F1F1F] font-bold text-xs rounded-xl hover:bg-[#F8EFF3] transition-colors flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
              </svg>
              Save Profile
            </button>
          </div>
        </div>

        {/* Mini stats row */}
        <div className="flex flex-wrap gap-6 px-6 py-4 mt-2 border-t border-[#E7E1D8]">
          {[
            { icon: '🎯', value: '5+ Years', label: 'Experience' },
            { icon: '🏷️', value: '150+ Brands', label: 'Collaborated' },
            { icon: '⭐', value: 'Top 5%', label: 'Ranked Creator' },
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

      {/* ── STAT CARDS ROW ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          {
            label: 'Trust Score',
            value: String(creator.trustScore),
            valueColor: 'text-[#A8678A]',
            sparkColor: '#A8678A',
            up: true,
          },
          {
            label: 'Total Followers',
            value: fmtNum(totalFollowers),
            valueColor: 'text-[#1F1F1F]',
            sparkColor: '#1F1F1F',
            up: true,
          },
          {
            label: 'Avg. Engagement',
            value: `${(creator.insights.averageEngagementRate * 100).toFixed(1)}%`,
            valueColor: 'text-[#1F1F1F]',
            sparkColor: '#1F1F1F',
            up: true,
          },
          {
            label: 'Collabs Done',
            value: String(creator.insights.collaborationCount),
            valueColor: 'text-[#1F1F1F]',
            sparkColor: '#1F1F1F',
            up: false,
          },
          {
            label: 'Success Rate',
            value: `${(creator.insights.successRate * 100).toFixed(0)}%`,
            valueColor: 'text-[#A8678A]',
            sparkColor: '#A8678A',
            up: true,
          },
        ].map(({ label, value, valueColor, sparkColor, up }) => (
          <div key={label} className="bg-white border border-[#E7E1D8] rounded-[20px] p-4 flex flex-col gap-2">
            <p className={`text-xl font-black ${valueColor}`}>{value}</p>
            <p className="text-xs text-[#6E6A65] font-medium leading-tight">{label}</p>
            <Sparkline color={sparkColor} up={up} />
          </div>
        ))}
      </div>

      {/* ── TRUST SCORE + SCORE BREAKDOWN + AUDIENCE DEMOGRAPHICS ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Trust Score Panel */}
        <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-6 shadow-card flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#A8678A]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <h3 className="font-black text-[#1F1F1F] text-base">Creator Trust Score</h3>
            <span className="ml-auto text-[#6E6A65] cursor-help" title="How the score is calculated">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
              </svg>
            </span>
          </div>

          {/* Big score */}
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-[#1F1F1F]">{creator.trustScore}</span>
            <span className="text-[#6E6A65] font-semibold text-lg">/ 100</span>
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F8EFF3] text-[#A8678A]">
              ✓ Excellent
            </span>
          </div>

          {/* Ring chart (CSS only) */}
          <div className="flex justify-center my-2">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="38" fill="none" stroke="#E7E1D8" strokeWidth="10" />
                <circle cx="48" cy="48" r="38" fill="none" stroke="#A8678A" strokeWidth="10"
                  strokeDasharray={`${(creator.trustScore / 100) * 238.76} 238.76`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-[#1F1F1F]">{creator.trustScore}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#6E6A65] leading-relaxed">
            Based on audience quality, engagement consistency & collaboration history.
          </p>

          <div className="bg-[#F8EFF3] rounded-xl px-3 py-2 text-xs text-[#A8678A] font-semibold">
            Top 18% of creators in {creator.contentCategories[0] ?? 'Lifestyle'} niche
          </div>

          <button className="text-[#A8678A] text-xs font-bold flex items-center gap-1 hover:underline">
            View full breakdown →
          </button>
        </div>

        {/* Score Breakdown */}
        <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-6 shadow-card flex flex-col gap-4">
          <h3 className="font-black text-[#1F1F1F] text-base">Score Breakdown</h3>
          <div className="space-y-4">
            <ScoreBar label="Audience Authenticity" score={86} max={100} color="bg-[#1F1F1F]" />
            <ScoreBar label="Engagement Quality"    score={75} max={100} color="bg-[#1F1F1F]" />
            <ScoreBar label="Growth Pattern"        score={70} max={100} color="bg-[#1F1F1F]" />
            <ScoreBar label="Collaboration Success" score={Math.round(creator.insights.successRate * 100)} max={100} color="bg-[#A8678A]" />
          </div>
        </div>

        {/* Audience Demographics */}
        <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-6 shadow-card flex flex-col gap-4">
          <h3 className="font-black text-[#1F1F1F] text-base">Audience Demographics</h3>

          <div className="flex items-center gap-4">
            <DonutChart
              female={dem.genderSplit.female}
              male={dem.genderSplit.male}
              other={dem.genderSplit.other}
            />

            {/* Age legend */}
            <div className="space-y-2 flex-1">
              {[
                { label: '18-24', color: 'bg-[#A8678A]',   pct: dem.ageGroups['18-24'] },
                { label: '25-34', color: 'bg-[#1F1F1F]',  pct: dem.ageGroups['25-34'] },
                { label: '35-44', color: 'bg-[#6E6A65]',  pct: dem.ageGroups['35-44'] },
                { label: '45+',   color: 'bg-[#E7E1D8]',pct: dem.ageGroups['45+'] },
              ].map(({ label, color, pct }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
                  <span className="text-xs text-[#6E6A65] w-10">{label}</span>
                  <span className="text-xs font-black text-[#1F1F1F]">
                    {typeof pct === 'number' ? `${(pct * 100).toFixed(0)}%` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top countries */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E6A65] mb-1.5">Top Countries</p>
            <div className="flex flex-wrap gap-1.5">
              {dem.topCountries.slice(0, 3).map(c => (
                <span key={c} className="px-2.5 py-0.5 rounded-full bg-[#F8EFF3] text-[#A8678A] border border-[#E7E1D8] text-[11px] font-semibold">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RECENT COLLABORATIONS ───────────────────────────────────────── */}
      <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-[#1F1F1F] text-base">Recent Collaborations</h3>
          <button className="text-[#A8678A] text-xs font-bold hover:underline flex items-center gap-1">
            View all collaborations →
          </button>
        </div>
        <div className="flex flex-wrap gap-4">
          {recentCollabs.map(({ name, logo, date, bg }) => (
            <div key={name} className="flex items-center gap-3 bg-[#F8EFF3] rounded-2xl px-4 py-3 border border-[#E7E1D8] hover:border-[#A8678A] transition-colors">
              <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0 overflow-hidden`}>
                <img src={logo} alt={name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1F1F1F]">{name}</p>
                <p className="text-[10px] text-[#6E6A65]">{date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PORTFOLIO TAB ──────────────────────────────────────────────── */}
      <div>
        {/* Tab bar */}
        <div className="flex gap-1 bg-white border border-[#E7E1D8] rounded-2xl p-1.5 shadow-none w-fit mb-5">
          {(['portfolio', 'about', 'reviews'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-[#1F1F1F] text-white shadow-none'
                  : 'text-[#6E6A65] hover:text-[#1F1F1F] hover:bg-[#F8EFF3]'
              }`}>
              {tab === 'portfolio' ? '🎨 Portfolio' : tab === 'about' ? '👤 About' : '⭐ Reviews'}
            </button>
          ))}
        </div>

        {/* Portfolio grid */}
        {activeTab === 'portfolio' && (
          creator.portfolio.length === 0 ? (
            <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-12 text-center shadow-card">
              <div className="text-5xl mb-4">🎨</div>
              <p className="text-[#1F1F1F] font-bold mb-1">No portfolio items yet</p>
              <p className="text-[#6E6A65] text-sm mb-5">Showcase your best work to attract brands.</p>
              {isOwnProfile && (
                <div className="flex justify-center gap-3">
                  <Link to="/creator/me/portfolio" className="px-5 py-2.5 bg-[#1F1F1F] text-white font-bold text-xs rounded-2xl shadow-none hover:opacity-90">
                    + Add Work
                  </Link>
                  <Link to="/creator/me/ai-templates" className="px-5 py-2.5 border border-[#E7E1D8] text-[#1F1F1F] font-bold text-xs rounded-2xl hover:bg-[#F8EFF3]">
                    ✨ AI Templates
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {creator.portfolio.map((item) => (
                <div key={item.id} className="bg-white border border-[#E7E1D8] rounded-[20px] overflow-hidden shadow-card hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
                  <div className="relative h-44 overflow-hidden bg-[#F8EFF3]">
                    <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
                    <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${CAT_COLORS[item.category] ?? 'bg-[#F8EFF3] text-[#A8678A]'}`}>
                      {item.category}
                    </span>
                    {item.campaignId && (
                      <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F8EFF3] text-[#A8678A]">
                        📢 Campaign
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-bold text-[#1F1F1F] text-sm leading-snug mb-1">{item.title}</h4>
                    <p className="text-xs text-[#6E6A65] leading-relaxed line-clamp-2 mb-4 flex-1">{item.description}</p>
                    <div className="grid grid-cols-4 gap-1 border-t border-[#E7E1D8] pt-3">
                      {[
                        { icon: '👁️', val: fmtNum(item.metrics.views),    label: 'Views' },
                        { icon: '❤️', val: fmtNum(item.metrics.likes),    label: 'Likes' },
                        { icon: '💬', val: fmtNum(item.metrics.comments), label: 'Comments' },
                        { icon: '📈', val: `${(item.metrics.engagementRate * 100).toFixed(1)}%`, label: 'ER' },
                      ].map(({ icon, val, label }) => (
                        <div key={label} className="text-center">
                          <div className="text-base">{icon}</div>
                          <div className="text-xs font-black text-[#1F1F1F]">{val}</div>
                          <div className="text-[10px] text-[#6E6A65]">{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* About tab */}
        {activeTab === 'about' && (
          <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-6 shadow-card space-y-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#6E6A65] mb-2">Bio</p>
              <p className="text-sm text-[#6E6A65] leading-relaxed">{creator.bio}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#6E6A65] mb-2">Connected Platforms</p>
              <div className="flex flex-wrap gap-3">
                {creator.socialAccounts.map((acc, i) => (
                  <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${acc.connected ? 'bg-[#F8EFF3] border-[#A8678A] text-[#A8678A]' : 'bg-white border-[#E7E1D8] text-[#6E6A65]'}`}>
                    {PLATFORM_SVG[acc.platform]}
                    <span className="capitalize">{acc.platform}</span>
                    <span className="font-black">{fmtNum(acc.followerCount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reviews tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-12 text-center shadow-card">
            <div className="text-5xl mb-4">⭐</div>
            <p className="text-[#1F1F1F] font-bold">No reviews yet</p>
            <p className="text-[#6E6A65] text-sm mt-1">Reviews from brand collaborations will appear here.</p>
          </div>
        )}
      </div>

    </div>
  );
}
