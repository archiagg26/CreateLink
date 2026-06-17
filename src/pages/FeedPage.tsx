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
import ScoreBadge from '../components/shared/ScoreBadge';
import VerificationBadge from '../components/shared/VerificationBadge';
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

  const displayName = currentUser?.role === 'creator'
    ? creator?.displayName || 'Creator Name'
    : brand?.companyName || 'Brand Name';

  const displayBio = currentUser?.role === 'creator'
    ? creator?.bio || 'Content Creator'
    : brand?.description || 'Collaborator Brand';

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

        {/* ── LEFT: Profile Card ── */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-[#E7E1D8] rounded-[20px] overflow-hidden shadow-card">
            {/* Gradient cover */}
            <div className="h-20 bg-[#F8EFF3] relative">
              <div className="absolute inset-0 opacity-30"
                style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #E7E1D8 1px, transparent 1px), radial-gradient(circle at 70% 80%, #E7E1D8 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            </div>

            <div className="px-4 pb-5 text-center relative">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-[#1F1F1F] text-white border-4 border-white flex items-center justify-center text-2xl font-black uppercase shadow-none mx-auto -mt-8 mb-3">
                {currentUser?.email ? currentUser.email[0].toUpperCase() : 'U'}
              </div>

              <Link
                to={currentUser ? (currentUser.role === 'creator' ? `/creator/${currentUser.id}` : `/brand/${currentUser.id}`) : '#'}
                className="block text-base font-bold text-[#1F1F1F] hover:text-[#A8678A] transition-colors"
              >
                {displayName}
              </Link>
              <p className="text-xs text-[#6E6A65] mt-1 line-clamp-2 leading-relaxed">{displayBio}</p>

              {/* Stats row */}
              <div className="mt-4 pt-4 border-t border-[#E7E1D8] space-y-2.5 text-left">
                {currentUser?.role === 'creator' && creator && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6E6A65] font-medium">Trust Score</span>
                    <ScoreBadge score={creator.trustScore} label="Trust" size="sm" />
                  </div>
                )}
                {currentUser?.role === 'brand' && brand && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6E6A65] font-medium">Brand Score</span>
                    <ScoreBadge score={brand.brandScore} label="Score" size="sm" />
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6E6A65] font-medium">Status</span>
                  <VerificationBadge status={verificationStatus || 'unverified'} size="sm" />
                </div>
              </div>

              {/* Profile CTA */}
              <Link
                to={currentUser ? (currentUser.role === 'creator' ? `/creator/${currentUser.id}` : `/brand/${currentUser.id}`) : '#'}
                className="mt-4 block w-full text-center py-2 rounded-2xl border border-[#A8678A] text-[#A8678A] text-xs font-bold hover:bg-[#F8EFF3] transition-colors"
              >
                View Full Profile
              </Link>
            </div>
          </div>
        </div>

        {/* ── CENTER: Feed ── */}
        <div className="lg:col-span-6 space-y-4">
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

        {/* ── RIGHT: Widgets ── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Verification widget */}
          {!isVerified && (
            <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-4 shadow-card">
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

          {/* Recommendations */}
          <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-4 shadow-card">
            <h4 className="font-bold text-[#1F1F1F] text-sm mb-4 flex items-center gap-2">
              <span>{currentUser?.role === 'creator' ? '🏷️' : '🌟'}</span>
              {currentUser?.role === 'creator' ? 'Recommended Brands' : 'Recommended Creators'}
            </h4>

            <div className="space-y-4">
              {currentUser?.role === 'creator' ? (
                recBrands.map((b) => (
                  <div key={b.id} className="flex gap-3 items-center">
                    <img src={b.logoUrl} alt={b.companyName}
                      className="w-9 h-9 rounded-xl border border-[#E7E1D8] bg-[#F8EFF3] shrink-0 object-cover" />
                    <div className="min-w-0 flex-1">
                      <Link to={`/brand/${b.id}`}
                        className="text-xs font-bold text-[#1F1F1F] hover:text-[#A8678A] block truncate">
                        {b.companyName}
                      </Link>
                      <span className="text-[10px] text-[#6E6A65] capitalize">{b.industry}</span>
                    </div>
                    <button className="text-[10px] font-bold text-[#A8678A] border border-[#A8678A] rounded-xl px-2 py-1 hover:bg-[#F8EFF3] transition-colors shrink-0">
                      Follow
                    </button>
                  </div>
                ))
              ) : (
                recCreators.map((c) => (
                  <div key={c.id} className="flex gap-3 items-center">
                    <img src={c.avatarUrl} alt={c.displayName}
                      className="w-9 h-9 rounded-full border border-[#E7E1D8] bg-[#F8EFF3] shrink-0 object-cover" />
                    <div className="min-w-0 flex-1">
                      <Link to={`/creator/${c.id}`}
                        className="text-xs font-bold text-[#1F1F1F] hover:text-[#A8678A] block truncate">
                        {c.displayName}
                      </Link>
                      <span className="text-[10px] text-[#6E6A65] truncate block">{c.bio}</span>
                    </div>
                    <button className="text-[10px] font-bold text-[#A8678A] border border-[#A8678A] rounded-xl px-2 py-1 hover:bg-[#F8EFF3] transition-colors shrink-0">
                      Connect
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Fun stats card */}
          <div className="bg-[#1F1F1F] rounded-[20px] p-4 text-white shadow-soft">
            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
              <span>🚀</span> Platform Stats
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Campaigns', value: '2.4K' },
                { label: 'Creators', value: '50K+' },
                { label: 'Brands', value: '8K+' },
                { label: 'Collabs', value: '200K+' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/10 rounded-2xl py-2.5 px-3 text-center">
                  <div className="text-lg font-black">{value}</div>
                  <div className="text-white/70 text-[10px] mt-0.5">{label}</div>
                </div>
              ))}
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
