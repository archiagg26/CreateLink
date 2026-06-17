import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCreatorStore } from '../stores/creatorStore';
import { useBrandStore } from '../stores/brandStore';
import { getStore } from '../services/store';

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function BarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map(d => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t-md"
            style={{ height: `${Math.max((d.value / max) * 80, 4)}px`, background: color }} />
          <span className="text-[9px] text-[#6E6A65] font-medium">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  const w = 80; const h = 28;
  const pts = values.map((v, i) =>
    `${(i / Math.max(values.length - 1, 1)) * w},${h - (v / max) * h}`
  ).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline fill="none" stroke={color} strokeWidth="1.8" points={pts}
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AnalyticsPage() {
  const { currentUser } = useAuthStore();
  const { creator, loadCreator } = useCreatorStore();
  const { brand, loadBrand } = useBrandStore();

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'creator') loadCreator(currentUser.id);
    else loadBrand(currentUser.id);
  }, [currentUser, loadCreator, loadBrand]);

  const isCreator = currentUser?.role === 'creator';

  if (isCreator) {
    if (!creator) return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-[#A8678A] border-t-transparent rounded-full animate-spin" />
      </div>
    );

    const totalFollowers = creator.socialAccounts.reduce((s, a) => s + a.followerCount, 0);
    const totalViews = creator.portfolio.reduce((s, p) => s + p.metrics.views, 0);

    const monthlyViews = [18000, 22000, 31000, 28000, 41000, 55000, 48000, 67000, 72000, 89000, 95000, 110000];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = months.map((label, i) => ({ label, value: monthlyViews[i] }));

    return (
      <div className="space-y-6 pb-12 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#1F1F1F]">Analytics</h1>
            <p className="text-[#6E6A65] text-sm mt-1">Your creator performance overview</p>
          </div>
          <Link to={`/creator/${creator.id}`}
            className="px-4 py-2 text-xs font-bold text-[#6E6A65] border border-[#E7E1D8] rounded-xl hover:bg-[#F8EFF3]">
            View Profile →
          </Link>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Trust Score',     value: String(creator.trustScore),      sub: '/100',             color: '#A8678A', spark: [60,65,70,72,75,78,80,82] },
            { label: 'Total Followers', value: fmtNum(totalFollowers),           sub: 'across platforms', color: '#1F1F1F', spark: [40,50,55,60,70,80,90,100] },
            { label: 'Avg Engagement',  value: `${(creator.insights.averageEngagementRate * 100).toFixed(1)}%`, sub: 'per post', color: '#1F1F1F', spark: [6,7,8,9,9.5,9.7,9.7,9.7] },
            { label: 'Collabs Done',    value: String(creator.insights.collaborationCount), sub: 'completed', color: '#1F1F1F', spark: [0,0,0,0,0,0,1,1] },
          ].map(({ label, value, sub, color, spark }) => (
            <div key={label} className="bg-white border border-[#E7E1D8] rounded-[20px] p-4 shadow-card">
              <p className="text-xs font-semibold text-[#6E6A65] mb-1">{label}</p>
              <p className="text-xl font-black" style={{ color }}>
                {value}<span className="text-xs text-[#9E9A97] font-normal ml-1">{sub}</span>
              </p>
              <MiniSparkline values={spark} color={color} />
            </div>
          ))}
        </div>

        {/* Views chart */}
        <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-[#1F1F1F] text-base">Views Over Time</h3>
            <span className="text-xs text-[#6E6A65]">Last 12 months</span>
          </div>
          <BarChart data={chartData} color="#A8678A" />
          <div className="mt-3 flex items-center justify-between text-xs text-[#6E6A65]">
            <span>Total: {fmtNum(totalViews)} views</span>
            <span className="text-emerald-600 font-bold">↑ 23% vs last year</span>
          </div>
        </div>

        {/* Platform + top content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-6 shadow-card">
            <h3 className="font-black text-[#1F1F1F] text-base mb-4">Platform Breakdown</h3>
            {creator.socialAccounts.length === 0 ? (
              <p className="text-sm text-[#6E6A65]">No platforms connected.</p>
            ) : (
              <div className="space-y-3">
                {creator.socialAccounts.map((acc, i) => {
                  const pct = Math.round((acc.followerCount / Math.max(totalFollowers, 1)) * 100);
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-[#1F1F1F] capitalize">
                          {acc.platform} <span className="text-[#6E6A65]">{acc.handle}</span>
                        </span>
                        <span className="font-black text-[#A8678A]">{fmtNum(acc.followerCount)}</span>
                      </div>
                      <div className="h-2 bg-[#F6F2E8] rounded-full overflow-hidden">
                        <div className="h-full bg-[#A8678A] rounded-full score-bar" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-6 shadow-card">
            <h3 className="font-black text-[#1F1F1F] text-base mb-4">Top Performing Content</h3>
            {creator.portfolio.length === 0 ? (
              <p className="text-sm text-[#6E6A65]">No portfolio items yet.</p>
            ) : (
              <div className="space-y-3">
                {[...creator.portfolio]
                  .sort((a, b) => b.metrics.views - a.metrics.views)
                  .slice(0, 3)
                  .map((item, i) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#F8EFF3] text-[#A8678A] text-xs font-black flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#1F1F1F] truncate">{item.title}</p>
                        <p className="text-[10px] text-[#6E6A65]">
                          {fmtNum(item.metrics.views)} views · {(item.metrics.engagementRate * 100).toFixed(1)}% ER
                        </p>
                      </div>
                      <span className="text-xs font-black text-[#1F1F1F] shrink-0">
                        {fmtNum(item.metrics.likes)} ❤️
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Audience summary */}
        <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-6 shadow-card">
          <h3 className="font-black text-[#1F1F1F] text-base mb-4">Audience Insights</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Primary Age',   value: '25–34', sub: `${(creator.insights.audienceDemographics.ageGroups['25-34'] * 100).toFixed(0)}% of audience` },
              { label: 'Top Gender',    value: `${(creator.insights.audienceDemographics.genderSplit.female * 100).toFixed(0)}% Female`, sub: undefined },
              { label: 'Top Country',   value: creator.insights.audienceDemographics.topCountries[0] ?? 'N/A', sub: undefined },
              { label: 'Success Rate',  value: `${(creator.insights.successRate * 100).toFixed(0)}%`, sub: 'of campaigns' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-[#F6F2E8] rounded-2xl p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E6A65] mb-1">{label}</p>
                <p className="text-sm font-black text-[#1F1F1F]">{value}</p>
                {sub && <p className="text-[10px] text-[#6E6A65] mt-0.5">{sub}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Brand analytics ──────────────────────────────────────────────────────────
  if (!brand) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-4 border-[#A8678A] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const store = getStore();
  const myCampaigns = Array.from(store.campaigns.values())
    .filter(c => c.brandId === brand.id && c.status !== 'removed');
  const totalApplicants = myCampaigns.reduce((s, c) => s + c.applicantCount, 0);

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-[#1F1F1F]">Analytics</h1>
        <p className="text-[#6E6A65] text-sm mt-1">Your brand performance overview</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Brand Score',      value: String(brand.brandScore),    color: '#A8678A' },
          { label: 'Campaigns',        value: String(myCampaigns.length),  color: '#1F1F1F' },
          { label: 'Total Applicants', value: String(totalApplicants),     color: '#1F1F1F' },
          { label: 'Creator Rating',   value: brand.averageCreatorRating > 0 ? `${brand.averageCreatorRating.toFixed(1)}★` : 'N/A', color: '#1F1F1F' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-[#E7E1D8] rounded-[20px] p-5 shadow-card">
            <p className="text-xs font-semibold text-[#6E6A65] mb-1">{label}</p>
            <p className="text-2xl font-black" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-6 shadow-card">
        <h3 className="font-black text-[#1F1F1F] text-base mb-4">Campaign Performance</h3>
        {myCampaigns.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📢</div>
            <p className="text-sm text-[#6E6A65]">No campaigns yet.</p>
            <Link to="/brand/me/campaigns/new" className="mt-3 inline-block px-4 py-2 bg-[#1F1F1F] text-white text-xs font-bold rounded-xl hover:opacity-90">
              Create Campaign →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myCampaigns.map(camp => (
              <div key={camp.id} className="flex items-center gap-4 bg-[#F6F2E8] rounded-2xl px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1F1F1F] truncate">{camp.title}</p>
                  <p className="text-[10px] text-[#6E6A65] capitalize">
                    {camp.status} · {camp.compensationType.replace('_', ' ')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-[#A8678A]">{camp.applicantCount}</p>
                  <p className="text-[10px] text-[#6E6A65]">applicants</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
