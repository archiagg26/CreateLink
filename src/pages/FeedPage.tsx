import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFeedStore } from '../stores/feedStore';
import { useAuthStore } from '../stores/authStore';
import { useCreatorStore } from '../stores/creatorStore';
import { useBrandStore } from '../stores/brandStore';
import { getStore } from '../services/store';
import FeedFilters from '../components/feed/FeedFilters';
import FeedCard from '../components/feed/FeedCard';
import ApplicationForm from '../components/application/ApplicationForm';
import type { FeedPost, Campaign } from '../types/index';

export default function FeedPage() {
  const { posts, loadFeed } = useFeedStore();
  const { currentUser } = useAuthStore();
  const { creator, loadCreator } = useCreatorStore();
  const { brand, loadBrand } = useBrandStore();

  const [applyingPost, setApplyingPost] = useState<FeedPost | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => { loadFeed(); }, [loadFeed]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'creator') loadCreator(currentUser.id);
      else loadBrand(currentUser.id);
    }
  }, [currentUser, loadCreator, loadBrand]);

  const handleApply = (post: FeedPost) => {
    if (!currentUser) return;
    if (currentUser.role !== 'creator') {
      alert('Only content creators can apply for campaigns.');
      return;
    }
    setApplyingPost(post);
  };

  const handleSuccess = () => {
    setApplyingPost(null);
    setSuccessMessage('Application submitted! 🎉');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const store = getStore();
  const recCreators = Array.from(store.creators.values()).filter((c) => c.id !== currentUser?.id).slice(0, 3);
  const recBrands   = Array.from(store.brands.values()).filter((b) => b.id !== currentUser?.id).slice(0, 3);

  const verificationStatus = currentUser?.role === 'creator' ? creator?.verificationStatus : brand?.verificationStatus;
  const isVerified = verificationStatus === 'verified';
  const isPending  = verificationStatus === 'pending';

  return (
    <div className="relative">
      {/* Success toast */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F1F1F] text-white font-bold px-6 py-3.5 rounded-2xl shadow-card flex items-center gap-2.5 animate-bounce">
          <span>🎉</span>
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── CENTER: Feed ── */}
        <div className="lg:col-span-9 space-y-4">
          {/* Post prompt */}
          <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-4 shadow-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1F1F1F] text-white flex items-center justify-center text-sm font-black uppercase shrink-0">
              {currentUser?.email ? currentUser.email[0].toUpperCase() : 'U'}
            </div>
            <Link
              to={currentUser?.role === 'creator' ? '/creator/me/portfolio' : '/brand/me/campaigns/new'}
              className="flex-1 bg-[#F8EFF3] hover:bg-[#E7E1D8] border border-[#E7E1D8] px-4 py-2.5 rounded-2xl text-[#6E6A65] text-left text-sm font-medium transition-colors cursor-pointer"
            >
              {currentUser?.role === 'creator'
                ? 'Share your portfolio work, metrics, results... ✨'
                : 'Post a new collaboration campaign opportunity... 🚀'}
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-5 shadow-card space-y-4">
            <span className="block text-xs font-bold uppercase tracking-wider text-[#6E6A65]">
              🔍 Filter Discovery Feed
            </span>
            <FeedFilters />
          </div>

          {/* Feed list */}
          {posts.length === 0 ? (
            <div className="text-center py-16 bg-white border border-[#E7E1D8] rounded-[20px] shadow-card flex flex-col items-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-[#6E6A65] text-sm font-medium">No posts match your current filters.</p>
              <p className="text-[#6E6A65] text-xs mt-1">Try adjusting the category or compensation type.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <FeedCard
                  key={post.id}
                  post={post}
                  onApply={handleApply}
                  onContact={(p) => alert(`Contacting author of: ${p.title}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Widgets (single enriched Recommended panel) ── */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Verification widget */}
          {!isVerified && (
            <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-4 shadow-card shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⚡</span>
                <h4 className="font-bold text-[#1F1F1F] text-sm">
                  {isPending ? 'Verification Pending' : 'Get Verified'}
                </h4>
              </div>
              <p className="text-[#6E6A65] text-xs leading-relaxed mb-3">
                {isPending
                  ? 'Your verification is under review. Connecting more socials speeds this up.'
                  : 'Boost your Trust Score and unlock premium collaborations by verifying your profile.'}
              </p>
              <Link
                to={currentUser?.role === 'creator' ? '/creator/me/verification' : '/brand/me/verification'}
                className="block text-center w-full px-3 py-2 bg-[#1F1F1F] text-white font-bold text-xs rounded-2xl shadow-soft hover:opacity-90 transition-opacity"
              >
                {isPending ? 'Check Status →' : 'Start Verification →'}
              </Link>
            </div>
          )}

          {/* Recommended panel (expanded) */}
          <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-6 shadow-card flex-1 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-[#1F1F1F] text-sm flex items-center gap-2">
                <span>{currentUser?.role === 'creator' ? '🏷️' : '🌟'}</span>
                {currentUser?.role === 'creator' ? 'Recommended Brands' : 'Recommended Creators'}
              </h4>
              <div className="text-xs text-[#6E6A65]">{(currentUser?.role === 'creator' ? recBrands.length : recCreators.length)} suggestions</div>
            </div>

            <div className="space-y-4">
              {currentUser?.role === 'creator' ? (
                recBrands.map((b) => (
                  <div key={b.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#F8EFF3] transition-colors">
                    <img src={b.logoUrl} alt={b.companyName}
                      className="w-12 h-12 rounded-xl border border-[#E7E1D8] bg-[#F8EFF3] shrink-0 object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Link to={`/brand/${b.id}`} className="text-sm font-bold text-[#1F1F1F] hover:text-[#A8678A] truncate">{b.companyName}</Link>
                        <div className="text-[12px] text-[#6E6A65] font-bold">{b.brandScore ?? '—'}</div>
                      </div>
                      <div className="text-[12px] text-[#6E6A65] mt-1">{b.industry}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#6E6A65]">
                        <span className="px-2 py-1 bg-white/50 border border-[#E7E1D8] rounded-full">{b.completedCollaborations ?? 0} collabs</span>
                        <span className={`px-2 py-1 rounded-full ${b.verificationStatus === 'verified' ? 'bg-[#F8EFF3] text-[#A8678A]' : 'bg-transparent border border-white/0'}`}>{b.verificationStatus}</span>
                        <span className="px-2 py-1 bg-white/50 border border-[#E7E1D8] rounded-full">{(b.campaigns?.length ?? 0)} campaigns</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button className="text-[11px] font-bold text-[#A8678A] border border-[#A8678A] rounded-xl px-3 py-1 hover:bg-[#F8EFF3] transition-colors shrink-0">Follow</button>
                    </div>
                  </div>
                ))
              ) : (
                recCreators.map((c) => (
                  <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#F8EFF3] transition-colors">
                    <img src={c.avatarUrl} alt={c.displayName}
                      className="w-12 h-12 rounded-full border border-[#E7E1D8] bg-[#F8EFF3] shrink-0 object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Link to={`/creator/${c.id}`} className="text-sm font-bold text-[#1F1F1F] hover:text-[#A8678A] truncate">{c.displayName}</Link>
                        <div className="text-[12px] text-[#6E6A65] font-bold">{c.trustScore ?? '—'}</div>
                      </div>
                      <div className="text-[12px] text-[#6E6A65] mt-1">{c.contentCategories?.[0] ?? 'General'}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#6E6A65]">
                        <span className="px-2 py-1 bg-white/50 border border-[#E7E1D8] rounded-full">{c.portfolio?.length ?? 0} portfolio</span>
                        <span className="px-2 py-1 bg-white/50 border border-[#E7E1D8] rounded-full">{c.collaborationHistory?.length ?? 0} collabs</span>
                        <span className={`px-2 py-1 rounded-full ${c.verificationStatus === 'verified' ? 'bg-[#F8EFF3] text-[#A8678A]' : 'bg-transparent'}`}>{c.verificationStatus}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button className="text-[11px] font-bold text-[#A8678A] border border-[#A8678A] rounded-xl px-3 py-1 hover:bg-[#F8EFF3] transition-colors shrink-0">Connect</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Application modal */}
      {applyingPost && creator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1F1F]/60 backdrop-blur-sm">
          <div className="max-w-xl w-full bg-white border border-[#E7E1D8] rounded-[20px] p-6 sm:p-8 shadow-card relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setApplyingPost(null)}
              className="absolute top-4 right-4 text-[#6E6A65] hover:text-[#1F1F1F] bg-[#F8EFF3] rounded-xl p-1.5 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            <ApplicationForm
              creator={creator}
              campaign={{ id: applyingPost.campaignId || '', title: applyingPost.title } as unknown as Campaign}
              onClose={() => setApplyingPost(null)}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}
