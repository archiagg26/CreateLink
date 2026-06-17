import { Link } from 'react-router-dom';
import type { FeedPost } from '../../types/index';
import ScoreBadge from '../shared/ScoreBadge';
import VerificationBadge from '../shared/VerificationBadge';
import { getStore } from '../../services/store';

interface FeedCardProps {
  post: FeedPost;
  onApply?: (post: FeedPost) => void;
  onContact?: (post: FeedPost) => void;
}

// Category color chips
const CATEGORY_COLORS: Record<string, string> = {
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

export function FeedCard({ post, onApply, onContact }: FeedCardProps) {
  const isCampaign = post.type === 'campaign';
  const store = getStore();

  const creatorAuthor = post.authorRole === 'creator' ? store.creators.get(post.authorId) : null;
  const brandAuthor = post.authorRole === 'brand' ? store.brands.get(post.authorId) : null;

  const authorName = creatorAuthor?.displayName ?? brandAuthor?.companyName ?? 'Partner';
  const authorAvatar =
    creatorAuthor?.avatarUrl ?? brandAuthor?.logoUrl ??
    'https://api.dicebear.com/7.x/initials/svg?seed=Partner';
  const authorSub =
    creatorAuthor?.bio ?? brandAuthor?.industry ?? 'Collaboration Opportunity';
  const verificationStatus =
    creatorAuthor?.verificationStatus ?? brandAuthor?.verificationStatus ?? 'unverified';

  const timeString = new Date(post.publishedAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric',
  });

  const catColor = CATEGORY_COLORS[post.category] ?? 'bg-[#F8EFF3] text-[#A8678A]';

  return (
    <article
      className="bg-white border border-[#E7E1D8] rounded-[20px] p-5 shadow-card hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
      aria-label={`${isCampaign ? 'Campaign' : 'Creator'} post: ${post.title}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-3 mb-4">
        <div className="flex gap-3 items-center min-w-0">
          <img
            src={authorAvatar}
            alt={authorName}
            className={`w-11 h-11 shrink-0 border-2 border-white shadow-soft ${
              post.authorRole === 'creator' ? 'rounded-full' : 'rounded-xl'
            }`}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Link
                to={post.authorRole === 'creator' ? `/creator/${post.authorId}` : `/brand/${post.authorId}`}
                className="text-sm font-bold text-[#1F1F1F] hover:text-[#A8678A] truncate"
              >
                {authorName}
              </Link>
              <VerificationBadge status={verificationStatus} size="sm" showLabel={false} />
            </div>
            <p className="text-xs text-[#6E6A65] truncate max-w-[200px] sm:max-w-[260px] mt-0.5">
              {authorSub}
            </p>
            <p className="text-[10px] text-[#6E6A65] mt-0.5 flex items-center gap-1">
              <span>{timeString}</span>
              <span className="w-1 h-1 rounded-full bg-[#E7E1D8] inline-block" />
              <span>{isCampaign ? 'Campaign Post 📢' : 'Portfolio Showcase 🎨'}</span>
            </p>
          </div>
        </div>

        {/* Match score badge */}
        {post.collaborationMatchScore != null && (
          <div className="shrink-0">
            <ScoreBadge
              score={post.collaborationMatchScore}
              label={isCampaign ? 'Match' : 'Score'}
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-[#1F1F1F] mb-2 hover:text-[#A8678A] transition-colors leading-snug">
        {post.title}
      </h3>

      {/* Body */}
      <p className="text-sm text-[#6E6A65] leading-relaxed mb-4 line-clamp-3 flex-1">
        {post.body}
      </p>

      {/* Optional image (full-width, below body) */}
      {post.imageFilename && (
        <div className="mb-4">
          <img
            src={new URL(`../../assets/${post.imageFilename}`, import.meta.url).href}
            alt={post.title}
            className="w-full rounded-lg object-cover max-h-[420px] h-auto"
          />
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${catColor}`}>
          {post.category}
        </span>
        {post.aiRecommendationTag && (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F8EFF3] text-[#A8678A] border border-[#E7E1D8]">
            <svg className="w-3 h-3 text-[#A8678A]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 1l2.39 4.84L18 6.27l-4 3.9.95 5.5L10 13.15l-4.95 2.52.95-5.5L2 6.27l5.61-.43z" />
            </svg>
            {post.aiRecommendationTag}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-[#E7E1D8] pt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => alert('Saved to bookmarks.')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#6E6A65] hover:text-[#A8678A] hover:bg-[#F8EFF3] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          Save
        </button>

        <div className="flex gap-2">
          {isCampaign && onApply && (
            <button
              type="button"
              onClick={() => onApply(post)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1F1F1F] text-white font-bold text-xs rounded-xl shadow-soft hover:opacity-90 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Apply Now
            </button>
          )}

          {!isCampaign && onContact && (
            <button
              type="button"
              onClick={() => onContact(post)}
              className="flex items-center gap-1.5 px-4 py-1.5 border border-[#A8678A] text-[#A8678A] hover:bg-[#F8EFF3] font-bold text-xs rounded-xl transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Contact Creator
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default FeedCard;
