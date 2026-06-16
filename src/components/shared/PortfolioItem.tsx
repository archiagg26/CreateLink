import React from 'react';
import type { PortfolioItem as PortfolioItemType, ContentCategory } from '../../types';

// ─── Media type icon helpers ─────────────────────────────────────────────────

/**
 * Determines media type from a URL string by inspecting its extension.
 * Falls back to 'link' for unrecognised or external URLs.
 */
function getMediaType(url: string): 'image' | 'video' | 'audio' | 'link' {
  if (!url) return 'link';
  const lower = url.toLowerCase();
  if (/\.(jpe?g|png|gif|webp|avif|svg)(\?|$)/.test(lower)) return 'image';
  if (/\.(mp4|webm|mov|avi|mkv)(\?|$)/.test(lower)) return 'video';
  if (/\.(mp3|wav|ogg|flac|aac)(\?|$)/.test(lower)) return 'audio';
  return 'link';
}

interface MediaIconProps {
  url: string;
  className?: string;
}

const MediaIcon: React.FC<MediaIconProps> = ({ url, className = 'w-5 h-5' }) => {
  const type = getMediaType(url);

  switch (type) {
    case 'image':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3 3h18m-9 3h.008v.008H12V6z" />
        </svg>
      );
    case 'video':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25v-7.5A2.25 2.25 0 014.5 6.75H12a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0112 18.75z" />
        </svg>
      );
    case 'audio':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
      );
  }
};

// ─── Category badge ───────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<ContentCategory, string> = {
  beauty: 'bg-pink-100 text-pink-800',
  fitness: 'bg-green-100 text-green-800',
  tech: 'bg-blue-100 text-blue-800',
  food: 'bg-orange-100 text-orange-800',
  travel: 'bg-cyan-100 text-cyan-800',
  gaming: 'bg-purple-100 text-purple-800',
  lifestyle: 'bg-indigo-100 text-indigo-800',
  finance: 'bg-emerald-100 text-emerald-800',
  education: 'bg-yellow-100 text-yellow-800',
  fashion: 'bg-rose-100 text-rose-800',
};

// ─── Metric item ──────────────────────────────────────────────────────────────

interface MetricItemProps {
  label: string;
  value: string | number;
}

const MetricItem: React.FC<MetricItemProps> = ({ label, value }) => (
  <div className="flex flex-col items-center">
    <span className="text-sm font-semibold text-gray-800">{value}</span>
    <span className="text-xs text-gray-500">{label}</span>
  </div>
);

// ─── Format helpers ───────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatEngagement(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

// ─── Component props ──────────────────────────────────────────────────────────

interface PortfolioItemProps {
  /** The portfolio item data to display */
  item: PortfolioItemType;
  /** Called when the user clicks the edit button (only shown when not readonly) */
  onEdit?: () => void;
  /** Called when the user clicks the delete button (only shown when not readonly) */
  onDelete?: () => void;
  /**
   * When true, edit and delete buttons are hidden.
   * Defaults to false.
   */
  readonly?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PortfolioItem — displays a single portfolio entry card.
 *
 * Shows:
 *  - Title and description
 *  - Media type icon alongside a link to the media
 *  - Category badge
 *  - Performance metrics (views, likes, comments, shares, engagement rate)
 *  - Edit / delete action buttons when `readonly` is false (default)
 *
 * Linked to campaign when `item.campaignId` is non-null (shown as a tag).
 */
const PortfolioItem: React.FC<PortfolioItemProps> = ({
  item,
  onEdit,
  onDelete,
  readonly = false,
}) => {
  const categoryColor = CATEGORY_COLORS[item.category] ?? 'bg-gray-100 text-gray-800';
  const mediaType = getMediaType(item.mediaUrl);
  const mediaLabel = mediaType === 'image' ? 'Image'
    : mediaType === 'video' ? 'Video'
    : mediaType === 'audio' ? 'Audio'
    : 'Link';

  return (
    <article
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      aria-label={`Portfolio item: ${item.title}`}
    >
      {/* ── Header row ─────────────────────────────────────────────────── */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          {/* Title + category */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {item.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {/* Category badge */}
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${categoryColor}`}
              >
                {item.category}
              </span>

              {/* Campaign tag */}
              {item.campaignId && (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 text-violet-800 px-2 py-0.5 text-xs font-medium">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                  Campaign
                </span>
              )}
            </div>
          </div>

          {/* Action buttons — only when editable */}
          {!readonly && (
            <div className="flex items-center gap-1 shrink-0">
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  aria-label={`Edit portfolio item: ${item.title}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                  </svg>
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  aria-label={`Delete portfolio item: ${item.title}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {item.description}
          </p>
        )}
      </div>

      {/* ── Media link ─────────────────────────────────────────────────── */}
      {item.mediaUrl && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
          <a
            href={item.mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded transition-colors"
            aria-label={`View ${mediaLabel} for ${item.title} (opens in new tab)`}
          >
            <MediaIcon url={item.mediaUrl} className="w-4 h-4 shrink-0" />
            <span>{mediaLabel}</span>
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        </div>
      )}

      {/* ── Metrics ────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
          Performance
        </p>
        <div className="grid grid-cols-5 gap-2 text-center">
          <MetricItem label="Views" value={formatCount(item.metrics.views)} />
          <MetricItem label="Likes" value={formatCount(item.metrics.likes)} />
          <MetricItem label="Comments" value={formatCount(item.metrics.comments)} />
          <MetricItem label="Shares" value={formatCount(item.metrics.shares)} />
          <MetricItem
            label="Engagement"
            value={formatEngagement(item.metrics.engagementRate)}
          />
        </div>
      </div>

      {/* ── Footer: date ───────────────────────────────────────────────── */}
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
        <time
          dateTime={item.createdAt}
          className="text-xs text-gray-400"
        >
          Added {new Date(item.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </time>
      </div>
    </article>
  );
};

export default PortfolioItem;
