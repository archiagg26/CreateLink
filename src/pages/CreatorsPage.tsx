import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getStore } from '../services/store';
import VerificationBadge from '../components/shared/VerificationBadge';
import type { ContentCategory } from '../types/index';

const CATEGORIES: ContentCategory[] = ['beauty','fitness','tech','food','travel','gaming','lifestyle','finance','education','fashion'];
function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n/1_000).toFixed(0)}K`;
  return String(n);
}

export default function CreatorsPage() {
  const store = getStore();
  const allCreators = Array.from(store.creators.values());

  const [niche, setNiche]               = useState<ContentCategory | 'all'>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy]             = useState<'trust' | 'engagement' | 'followers'>('trust');

  const filtered = allCreators
    .filter(c => {
      if (niche !== 'all' && !c.contentCategories.includes(niche)) return false;
      if (verifiedOnly && c.verificationStatus !== 'verified') return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'trust') return b.trustScore - a.trustScore;
      if (sortBy === 'engagement') return b.insights.averageEngagementRate - a.insights.averageEngagementRate;
      const aF = a.socialAccounts.reduce((s, x) => s + x.followerCount, 0);
      const bF = b.socialAccounts.reduce((s, x) => s + x.followerCount, 0);
      return bF - aF;
    });

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#1F1F1F]">Creators</h1>
        <p className="text-[#6E6A65] text-sm mt-1">Discover verified creators across every niche</p>
      </div>

      {/* Filters (no duplicate search — topbar handles it) */}
      <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-5 shadow-card space-y-4">
        {/* Sort + Verified row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2.5 bg-[#F6F2E8] border border-transparent rounded-xl text-sm text-[#1F1F1F] focus:outline-none focus:bg-white focus:border-[#A8678A] cursor-pointer">
            <option value="trust">Sort: Trust Score</option>
            <option value="engagement">Sort: Engagement Rate</option>
            <option value="followers">Sort: Followers</option>
          </select>

          {/* Verified toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <div className={`w-9 h-5 rounded-full transition-colors relative ${verifiedOnly ? 'bg-[#A8678A]' : 'bg-[#E7E1D8]'}`}
              onClick={() => setVerifiedOnly(p => !p)}>
              <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${verifiedOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-xs font-semibold text-[#6E6A65]">Verified only</span>
          </label>
        </div>

        {/* Niche chips */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setNiche('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${niche === 'all' ? 'bg-[#1F1F1F] text-white' : 'bg-[#F8EFF3] text-[#A8678A] hover:bg-[#E7E1D8]'}`}>
            All
          </button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setNiche(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${niche === cat ? 'bg-[#1F1F1F] text-white' : 'bg-[#F8EFF3] text-[#A8678A] hover:bg-[#E7E1D8]'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-[#6E6A65] font-medium">{filtered.length} creator{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Creator grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-16 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-[#1F1F1F] font-bold">No creators match your filters</p>
          <p className="text-[#6E6A65] text-sm mt-1">Try adjusting your search or niche filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(creator => {
            const totalFollowers = creator.socialAccounts.reduce((s,a) => s+a.followerCount, 0);
            return (
              <Link key={creator.id} to={`/creator/${creator.id}`}
                className="bg-white border border-[#E7E1D8] rounded-[20px] p-5 shadow-card hover:border-[#A8678A] hover:-translate-y-0.5 hover:shadow-soft transition-all duration-200 flex flex-col">
                {/* Avatar + name */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative shrink-0">
                    <img src={creator.avatarUrl} alt={creator.displayName}
                      className="w-12 h-12 rounded-full border-2 border-white shadow-soft object-cover bg-[#F8EFF3]" />
                    {creator.verificationStatus === 'verified' && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white text-[8px] flex items-center justify-center text-white font-black">✓</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-[#1F1F1F] truncate">{creator.displayName}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <VerificationBadge status={creator.verificationStatus} size="sm" showLabel={false} />
                      <span className="text-[10px] text-[#6E6A65] capitalize">{creator.contentCategories[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-[#6E6A65] leading-relaxed line-clamp-2 mb-3 flex-1">{creator.bio}</p>

                {/* Category chips */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {creator.contentCategories.slice(0,3).map(cat => (
                    <span key={cat} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F8EFF3] text-[#A8678A] capitalize">{cat}</span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 border-t border-[#E7E1D8] pt-3">
                  <div className="text-center">
                    <p className="text-sm font-black text-[#A8678A]">{creator.trustScore}</p>
                    <p className="text-[9px] text-[#6E6A65]">Trust</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-[#1F1F1F]">{fmtNum(totalFollowers)}</p>
                    <p className="text-[9px] text-[#6E6A65]">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-[#1F1F1F]">{(creator.insights.averageEngagementRate*100).toFixed(1)}%</p>
                    <p className="text-[9px] text-[#6E6A65]">Eng. Rate</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
