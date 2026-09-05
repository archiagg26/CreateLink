import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Creator, Application, Campaign } from '../../types/index';
import { fetchReels, type Reel } from '../../services/reelsService';

export interface CreatorReviewExpandedCardProps {
  creator: Creator;
  application?: Application | null;
  campaign?: Campaign | null;
  currentIndex?: number;
  totalCount?: number;
  onPrev?: () => void;
  onNext?: () => void;
  onAction?: (action: 'reject' | 'waitlist' | 'approve' | 'left' | 'down' | 'right') => void;
  onClose?: () => void;
  isModal?: boolean;
}

// Clean Icons
const IconInstagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#E1306C]">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const IconTikTok = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#1F1F1F]">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .592.046.87.136V9.4a6.34 6.34 0 0 0-.87-.06A6.34 6.34 0 0 0 3.14 15.7a6.34 6.34 0 0 0 10.82 4.47v-8.08a8.28 8.28 0 0 0 5.63 2.19V10.8a4.86 4.86 0 0 1-3.45-1.47 4.84 4.84 0 0 1-1.38-2.64h4.83z"></path>
  </svg>
);

const IconYouTube = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#FF0000]">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
  </svg>
);

const IconTrending = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#A8678A]">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const IconPlay = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const IconEye = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#A8678A]">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const IconHeart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#A8678A]">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const IconMessage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#A8678A]">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const IconChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#A8678A]">
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

const IconReject = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const IconWaitlist = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const IconApprove = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const IconExternalLink = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

const IconLocation = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const IconDocument = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-900">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-900">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const IconBriefcase = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-900">
    <rect x="3" y="8" width="18" height="12" rx="2" ry="2"></rect>
    <path d="M16 8V6a4 4 0 0 0-8 0v2"></path>
  </svg>
);

const IconReels = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-900">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
    <line x1="7" y1="2" x2="7" y2="22"></line>
    <line x1="17" y1="2" x2="17" y2="22"></line>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <line x1="2" y1="7" x2="7" y2="7"></line>
    <line x1="2" y1="17" x2="7" y2="17"></line>
    <line x1="17" y1="17" x2="22" y2="17"></line>
    <line x1="17" y1="7" x2="22" y2="7"></line>
  </svg>
);

const IconQuotes = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-900">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
  </svg>
);

// Number Formatter (1200000 -> 1.2M, 45000 -> 45K)
function formatNumber(num?: number | null): string {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace('.0', '')}K`;
  return num.toString();
}

export function CreatorReviewExpandedCard({
  creator,
  application,
  currentIndex = 0,
  totalCount = 1,
  onPrev,
  onNext,
  onAction,
  onClose,
  isModal = false,
}: CreatorReviewExpandedCardProps) {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loadingReels, setLoadingReels] = useState(false);
  const [activeMediaModal, setActiveMediaModal] = useState<Reel | null>(null);
  const [showAllMedia, setShowAllMedia] = useState(false);

  useEffect(() => {
    if (creator.id) {
      setLoadingReels(true);
      fetchReels(creator.id, creator.portfolio)
        .then((fetched) => {
          setReels(fetched);
          setLoadingReels(false);
        })
        .catch(() => setLoadingReels(false));
    }
  }, [creator.id, creator.portfolio]);

  // Combined Portfolio Items & Reels
  const displayItems = useMemo<Reel[]>(() => {
    // If application specifically has selectedPortfolioItems, prioritize those
    if (application?.selectedPortfolioItems && application.selectedPortfolioItems.length > 0) {
      const selectedIds = new Set(application.selectedPortfolioItems);
      const selectedReels = reels.filter(r => selectedIds.has(r.id));
      const selectedPortfolio = (creator.portfolio || []).filter(p => selectedIds.has(p.id));
      const mappedPortfolio: Reel[] = selectedPortfolio.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        thumbnailUrl: p.mediaUrl,
        videoUrl: p.mediaUrl.endsWith('.mp4') ? p.mediaUrl : '',
        metrics: {
          views: p.metrics.views,
          likes: p.metrics.likes,
          comments: p.metrics.comments,
          engagementRate: p.metrics.engagementRate,
        },
        createdAt: p.createdAt,
        campaignId: p.campaignId,
      }));
      const combined = [...selectedReels, ...mappedPortfolio];
      if (combined.length > 0) return combined;
    }

    // Otherwise show reels or portfolio items
    if (reels.length > 0) return reels;
    if (creator.portfolio && creator.portfolio.length > 0) {
      return creator.portfolio.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        thumbnailUrl: p.mediaUrl,
        videoUrl: p.mediaUrl.endsWith('.mp4') ? p.mediaUrl : '',
        metrics: {
          views: p.metrics.views,
          likes: p.metrics.likes,
          comments: p.metrics.comments,
          engagementRate: p.metrics.engagementRate,
        },
        createdAt: p.createdAt,
        campaignId: p.campaignId,
      }));
    }

    return [];
  }, [application, reels, creator.portfolio]);

  // Niches / Categories
  const primaryCategory = creator.contentCategories?.[0] || 'Lifestyle';
  const categoryTitle = `${primaryCategory.charAt(0).toUpperCase() + primaryCategory.slice(1)} & Tech Creator`;
  const nicheTags = (creator.contentCategories?.length > 0 ? creator.contentCategories : ['Lifestyle', 'Tech', 'Productivity', 'Wellness', 'Travel'])
    .map(c => c.charAt(0).toUpperCase() + c.slice(1));

  // Location
  const locationText = creator.location || (creator.id === 'creator-1' ? 'Mumbai, India' : 'Not specified');

  // Social Stats
  const igAccount = creator.socialAccounts?.find(s => s.platform.toLowerCase() === 'instagram');
  const ttAccount = creator.socialAccounts?.find(s => s.platform.toLowerCase() === 'tiktok');
  const ytAccount = creator.socialAccounts?.find(s => s.platform.toLowerCase() === 'youtube');

  const igFollowers = igAccount?.followerCount ?? (creator.id === 'creator-1' ? 85000 : null);
  const ttFollowers = ttAccount?.followerCount ?? (creator.id === 'creator-1' ? 120000 : null);
  const ytFollowers = ytAccount?.followerCount ?? (creator.id === 'creator-1' ? 42000 : null);

  // Engagement Rate calculation
  const rawEr = creator.insights?.averageEngagementRate ?? 0.038;
  const erPercent = rawEr > 1 ? rawEr : rawEr * 100;
  const formattedEr = `${erPercent.toFixed(1)}%`;

  // Performance Snapshot Calculations
  const avgViews = useMemo(() => {
    if (displayItems.length > 0) {
      const v = displayItems.map(i => i.metrics.views).filter(Boolean);
      if (v.length > 0) return Math.round(v.reduce((a, b) => a + b, 0) / v.length);
    }
    return creator.id === 'creator-1' ? 1200000 : 45000;
  }, [displayItems, creator.id]);

  const avgLikes = useMemo(() => {
    if (displayItems.length > 0) {
      const l = displayItems.map(i => i.metrics.likes).filter(Boolean);
      if (l.length > 0) return Math.round(l.reduce((a, b) => a + b, 0) / l.length);
    }
    return creator.id === 'creator-1' ? 45000 : 2800;
  }, [displayItems, creator.id]);

  const avgComments = useMemo(() => {
    if (displayItems.length > 0) {
      const c = displayItems.map(i => i.metrics.comments).filter(Boolean);
      if (c.length > 0) return Math.round(c.reduce((a, b) => a + b, 0) / c.length);
    }
    return creator.id === 'creator-1' ? 920 : 180;
  }, [displayItems, creator.id]);

  // Audience Demographics (Age & Gender)
  const demog = creator.insights?.audienceDemographics;
  const age1824 = demog?.ageGroups?.['18-24'] ? Math.round(demog.ageGroups['18-24'] * 100) : 68;
  const age2534 = demog?.ageGroups?.['25-34'] ? Math.round(demog.ageGroups['25-34'] * 100) : 22;
  const age3544 = demog?.ageGroups?.['35-44'] ? Math.round(demog.ageGroups['35-44'] * 100) : 8;
  const age45 = demog?.ageGroups?.['45+'] ? Math.round(demog.ageGroups['45+'] * 100) : Math.max(2, 100 - age1824 - age2534 - age3544);

  const femalePct = demog?.genderSplit?.female 
    ? Math.round(demog.genderSplit.female > 1 ? demog.genderSplit.female : demog.genderSplit.female * 100) 
    : 72;
  const malePct = demog?.genderSplit?.male 
    ? Math.round(demog.genderSplit.male > 1 ? demog.genderSplit.male : demog.genderSplit.male * 100) 
    : (100 - femalePct);

  // Past Collaborations
  const pastCollabs = useMemo(() => {
    if (creator.collaborationHistory && creator.collaborationHistory.length > 0) {
      return creator.collaborationHistory.map(c => c.brandId.replace('brand-', 'Brand '));
    }
    // Default brand collabs if Maya Chen
    if (creator.id === 'creator-1') {
      return ['Samsung', 'Notion', 'Nykaa', 'Amazon'];
    }
    return [];
  }, [creator]);

  // Sample Caption / Pitch
  const sampleCaption = useMemo(() => {
    if (application?.editedPitch) return application.editedPitch;
    if (displayItems[0]?.description) return displayItems[0].description;
    if (creator.id === 'creator-1') {
      return "Small changes lead to a big, happier life. Here are my top 5 apps that keep me organized and sane! 🤍 #productivity #lifestyle";
    }
    return creator.bio || "Authentic content creation driven by genuine community engagement and storytelling.";
  }, [application, displayItems, creator]);

  const handleAction = (type: 'reject' | 'waitlist' | 'approve') => {
    if (onAction) {
      onAction(type);
    }
  };

  return (
    <div className={`bg-white border border-[#E7E1D8] rounded-[28px] shadow-sm flex flex-col w-full mx-auto overflow-hidden relative ${isModal ? 'max-h-[92vh]' : 'h-full'}`}>
      
      {/* Top Header: Title + Carousel Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E1D8] bg-white shrink-0">
        <h2 className="text-xl font-bold text-[#1F1F1F]">Creator Review</h2>
        <div className="flex items-center gap-3">
          {totalCount > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPrev}
                disabled={currentIndex <= 0}
                aria-label="Previous Creator"
                className="w-8 h-8 rounded-full border border-[#E7E1D8] flex items-center justify-center text-[#1F1F1F] hover:bg-[#FAF7F2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span className="text-sm font-bold">&lt;</span>
              </button>
              <span className="text-xs font-semibold text-[#6E6A65] px-1">
                {currentIndex + 1} of {totalCount}
              </span>
              <button
                type="button"
                onClick={onNext}
                disabled={currentIndex >= totalCount - 1}
                aria-label="Next Creator"
                className="w-8 h-8 rounded-full border border-[#E7E1D8] flex items-center justify-center text-[#1F1F1F] hover:bg-[#FAF7F2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span className="text-sm font-bold">&gt;</span>
              </button>
            </div>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors ml-2"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="p-6 overflow-y-auto flex-1 space-y-6">

        {/* 1. CREATOR INTRODUCTION */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
          {/* Left Block: Avatar, Name, Score, Bio, Tags */}
          <div className="flex gap-4 sm:gap-5 flex-1 items-start">
            <img
              src={creator.avatarUrl}
              alt={creator.displayName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover bg-[#FAF7F2] border border-[#E7E1D8] shrink-0"
            />
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-2xl font-bold text-[#1F1F1F]">{creator.displayName}</h3>
                <span className="bg-[#F8EFF3] text-[#A8678A] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#DDBFD0]">
                  {creator.trustScore}
                </span>
              </div>
              
              <div className="text-sm font-semibold text-[#1F1F1F] mt-1">
                {categoryTitle}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#6E6A65] mt-1">
                <IconLocation />
                <span>{locationText}</span>
              </div>

              <p className="text-xs text-[#6E6A65] mt-2.5 leading-relaxed max-w-xl">
                {creator.bio || "Sharing real-life moments, productivity hacks and simple tech that makes everyday life better. Let's create meaningful stories together! ✨"}
              </p>

              {/* Niche Tag Pills */}
              <div className="flex flex-wrap gap-2 mt-3.5">
                {nicheTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[#FDF3F5] text-neutral-700 text-xs font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Block: View Full Profile & Social Statistics */}
          <div className="flex flex-col items-end shrink-0 gap-3 w-full lg:w-auto pt-2 lg:pt-0">
            <Link
              to={`/creator/${creator.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#E7E1D8] bg-white rounded-xl px-3.5 py-1.5 text-xs font-bold text-[#1F1F1F] hover:bg-[#FAF7F2] transition-colors"
            >
              <span>View Full Profile</span>
              <IconExternalLink />
            </Link>

            <div className="flex flex-col gap-2 w-full sm:w-44 bg-[#FAF7F2] p-3 rounded-xl border border-[#E7E1D8]">
              {igFollowers !== null && (
                <div className="flex items-center justify-between text-xs text-[#1F1F1F]">
                  <div className="flex items-center gap-2">
                    <IconInstagram />
                    <span className="font-bold">{formatNumber(igFollowers)}</span>
                  </div>
                  <span className="text-[11px] text-[#6E6A65]">Followers</span>
                </div>
              )}
              {ttFollowers !== null && (
                <div className="flex items-center justify-between text-xs text-[#1F1F1F]">
                  <div className="flex items-center gap-2">
                    <IconTikTok />
                    <span className="font-bold">{formatNumber(ttFollowers)}</span>
                  </div>
                  <span className="text-[11px] text-[#6E6A65]">Followers</span>
                </div>
              )}
              {ytFollowers !== null && (
                <div className="flex items-center justify-between text-xs text-[#1F1F1F]">
                  <div className="flex items-center gap-2">
                    <IconYouTube />
                    <span className="font-bold">{formatNumber(ytFollowers)}</span>
                  </div>
                  <span className="text-[11px] text-[#6E6A65]">Subscribers</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-[#1F1F1F] pt-2 border-t border-[#E7E1D8] mt-1">
                <div className="flex items-center gap-1.5">
                  <IconTrending />
                  <span className="font-bold text-[#A8678A]">{formattedEr}</span>
                </div>
                <span className="text-[11px] text-[#6E6A65]">Avg. ER</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. PERFORMANCE SNAPSHOT (4 Horizontal Compact Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#FAF7F2] border border-[#E7E1D8] rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-2 mb-1">
              <IconEye />
              <span className="text-xl font-black text-[#1F1F1F]">{formatNumber(avgViews)}</span>
            </div>
            <span className="text-xs text-[#6E6A65] font-medium">Avg. Reel Views</span>
          </div>

          <div className="bg-[#FAF7F2] border border-[#E7E1D8] rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-2 mb-1">
              <IconHeart />
              <span className="text-xl font-black text-[#1F1F1F]">{formatNumber(avgLikes)}</span>
            </div>
            <span className="text-xs text-[#6E6A65] font-medium">Avg. Likes</span>
          </div>

          <div className="bg-[#FAF7F2] border border-[#E7E1D8] rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-2 mb-1">
              <IconMessage />
              <span className="text-xl font-black text-[#1F1F1F]">{formatNumber(avgComments)}</span>
            </div>
            <span className="text-xs text-[#6E6A65] font-medium">Avg. Comments</span>
          </div>

          <div className="bg-[#F8EFF3] border border-[#DDBFD0] rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-2 mb-1">
              <IconChart />
              <span className="text-xl font-black text-[#A8678A]">{formattedEr}</span>
            </div>
            <span className="text-xs text-[#6E6A65] font-medium">Engagement Rate</span>
          </div>
        </div>

        {/* MAIN TWO-COLUMN LAYOUT (About & Demographics on Left | Portfolio & Sample Caption on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          
          {/* LEFT COLUMN: About, Demographics, Past Collabs */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* About / Pitch */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <IconDocument />
                <h4 className="font-bold text-sm text-[#1F1F1F]">About</h4>
              </div>
              <p className="text-xs text-[#6E6A65] leading-relaxed">
                {application?.aiPitch || creator.bio || "Lifestyle and tech content creator with 5+ years of experience. I create authentic, relatable content around daily routines, productivity tools, and modern living. I love collaborating with brands that align with mindful living, innovation, and creativity."}
              </p>
            </div>

            {/* 4. AUDIENCE INSIGHTS (Pure SVG Donut Chart + Demographics) */}
            <div className="pt-2 border-t border-[#E7E1D8]">
              <div className="flex items-center gap-2 mb-3">
                <IconUsers />
                <h4 className="font-bold text-sm text-[#1F1F1F]">Audience Demographics</h4>
              </div>

              <div className="flex items-center gap-5 sm:gap-6 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E7E1D8]">
                {/* Pure SVG Donut Chart (NO inline CSS) */}
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-16 h-16 transform -rotate-90">
                    {/* Background ring */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#E7E1D8"
                      strokeWidth="5"
                    />
                    {/* Segment 1: 18-24 */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#A8678A"
                      strokeWidth="5"
                      strokeDasharray={`${age1824} ${100 - age1824}`}
                      strokeDashoffset="0"
                    />
                    {/* Segment 2: 25-34 */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#DDBFD0"
                      strokeWidth="5"
                      strokeDasharray={`${age2534} ${100 - age2534}`}
                      strokeDashoffset={-age1824}
                    />
                    {/* Segment 3: 35-44 */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#86516F"
                      strokeWidth="5"
                      strokeDasharray={`${age3544} ${100 - age3544}`}
                      strokeDashoffset={-(age1824 + age2534)}
                    />
                    {/* Segment 4: 45+ */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#D1C7BA"
                      strokeWidth="5"
                      strokeDasharray={`${age45} ${100 - age45}`}
                      strokeDashoffset={-(age1824 + age2534 + age3544)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#A8678A]">{age1824}%</span>
                  </div>
                </div>

                {/* Age Breakdown with Colored Markers */}
                <div className="flex flex-col gap-1.5 text-xs flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#A8678A]"></span>
                    <span className="font-bold text-[#1F1F1F]">{age1824}%</span>
                    <span className="text-[#6E6A65] text-[11px]">18-24 years</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#DDBFD0]"></span>
                    <span className="font-bold text-[#1F1F1F]">{age2534}%</span>
                    <span className="text-[#6E6A65] text-[11px]">25-34 years</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#86516F]"></span>
                    <span className="font-bold text-[#1F1F1F]">{age3544}%</span>
                    <span className="text-[#6E6A65] text-[11px]">35-44 years</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D1C7BA]"></span>
                    <span className="font-bold text-[#1F1F1F]">{age45}%</span>
                    <span className="text-[#6E6A65] text-[11px]">45+ years</span>
                  </div>
                </div>

                {/* Gender Split */}
                <div className="flex flex-col gap-3 text-xs pl-2 border-l border-[#E7E1D8]">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 font-bold text-[#A8678A]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="10" r="5"></circle>
                        <line x1="12" y1="15" x2="12" y2="22"></line>
                        <line x1="9" y1="19" x2="15" y2="19"></line>
                      </svg>
                      <span>{femalePct}%</span>
                    </div>
                    <span className="text-[10px] text-[#6E6A65]">Female</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 font-bold text-[#3B82F6]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="15" r="5"></circle>
                        <line x1="12.5" y1="11.5" x2="20" y2="4"></line>
                        <polyline points="15 4 20 4 20 9"></polyline>
                      </svg>
                      <span>{malePct}%</span>
                    </div>
                    <span className="text-[10px] text-[#6E6A65]">Male</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. PREVIOUS COLLABORATIONS */}
            <div className="pt-2 border-t border-[#E7E1D8]">
              <div className="flex items-center gap-2 mb-2.5">
                <IconBriefcase />
                <h4 className="font-bold text-sm text-[#1F1F1F]">Past Collaborations</h4>
              </div>

              {pastCollabs.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {pastCollabs.slice(0, 4).map((brand, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-[#FAF7F2] border border-[#E7E1D8] text-[#1F1F1F] font-semibold text-xs rounded-md shadow-2xs"
                    >
                      {brand}
                    </span>
                  ))}
                  {pastCollabs.length > 4 && (
                    <span className="px-2.5 py-1 bg-white border border-[#E7E1D8] text-[#6E6A65] text-xs font-semibold rounded-md">
                      +{pastCollabs.length - 4} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#6E6A65] italic bg-[#FAF7F2] p-3 rounded-xl border border-[#E7E1D8]">
                  No prior brand collaborations recorded yet on CreateLink.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: 2. CREATOR'S OWN PORTFOLIO & SAMPLE CAPTION */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Header with View All */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <IconReels />
                  <h4 className="font-bold text-sm text-[#1F1F1F]">
                    {application?.selectedPortfolioItems?.length ? 'Submitted Campaign Portfolio' : 'Recent Reels / Content'}
                  </h4>
                </div>
                {displayItems.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllMedia(true)}
                    className="text-xs font-bold text-[#A8678A] hover:underline"
                  >
                    View All ({displayItems.length})
                  </button>
                )}
              </div>

              {/* Media Gallery (3 Vertical Reels / Content Cards) */}
              {loadingReels ? (
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-[9/16] bg-[#FAF7F2] rounded-2xl animate-pulse border border-[#E7E1D8]" />
                  ))}
                </div>
              ) : displayItems.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {displayItems.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setActiveMediaModal(item)}
                      className="group relative aspect-[9/16] bg-neutral-900 rounded-2xl overflow-hidden cursor-pointer border border-[#E7E1D8] shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-b from-[#A8678A] to-[#6A3D55] flex items-center justify-center p-3 text-center">
                          <span className="text-white text-xs font-bold">{item.title}</span>
                        </div>
                      )}

                      {/* Top subtle gradient */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

                      {/* Content Overlay */}
                      <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none">
                        <p className="text-white font-bold text-xs leading-tight line-clamp-3 drop-shadow-sm">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-1.5 text-white font-bold text-[11px] drop-shadow-sm">
                          <IconPlay />
                          <span>{formatNumber(item.metrics?.views || 1200000)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Clean Empty State without fabricated data */
                <div className="text-center py-10 px-4 bg-[#FAF7F2] border border-dashed border-[#E7E1D8] rounded-2xl">
                  <div className="w-10 h-10 mx-auto mb-2 text-[#A8678A] flex items-center justify-center bg-white rounded-full border border-[#E7E1D8]">
                    <IconReels />
                  </div>
                  <p className="text-sm font-bold text-[#1F1F1F]">No portfolio submitted yet</p>
                  <p className="text-xs text-[#6E6A65] mt-1">This creator hasn't attached sample reels or portfolio media.</p>
                </div>
              )}
            </div>

            {/* Sample Caption / Pitch Block */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <IconQuotes />
                <h4 className="font-bold text-sm text-[#1F1F1F]">Sample Caption</h4>
              </div>
              <div className="bg-[#FAF7F2] border border-[#E7E1D8] p-4 rounded-2xl">
                <p className="text-xs text-[#1F1F1F] italic leading-relaxed">
                  "{sampleCaption}"
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 6. STICKY BOTTOM REVIEW ACTION BAR */}
      <div className="px-6 py-4 border-t border-[#E7E1D8] bg-white sticky bottom-0 z-10 grid grid-cols-3 gap-3 rounded-b-[28px]">
        <button
          type="button"
          onClick={() => handleAction('reject')}
          className="flex items-center justify-center gap-2 py-3 bg-[#FEECEE] text-[#E0314F] hover:bg-[#FDD8DC] font-bold text-sm rounded-xl transition-all active:scale-[0.98]"
        >
          <IconReject />
          <span>Reject</span>
        </button>

        <button
          type="button"
          onClick={() => handleAction('waitlist')}
          className="flex items-center justify-center gap-2 py-3 bg-[#FFF8EC] text-[#D97706] hover:bg-[#FEF0D6] font-bold text-sm rounded-xl transition-all active:scale-[0.98]"
        >
          <IconWaitlist />
          <span>Waitlist</span>
        </button>

        <button
          type="button"
          onClick={() => handleAction('approve')}
          className="flex items-center justify-center gap-2 py-3 bg-[#E8FAF0] text-[#10B981] hover:bg-[#D4F6E2] font-bold text-sm rounded-xl transition-all active:scale-[0.98]"
        >
          <IconApprove />
          <span>Approve</span>
        </button>
      </div>

      {/* Media Detail / Video Modal */}
      {activeMediaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E7E1D8] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-[#E7E1D8] flex items-center justify-between">
              <h3 className="font-bold text-[#1F1F1F] text-sm truncate">{activeMediaModal.title}</h3>
              <button
                onClick={() => setActiveMediaModal(null)}
                className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="relative aspect-[9/16] max-h-[60vh] bg-black flex items-center justify-center overflow-hidden">
              {activeMediaModal.videoUrl ? (
                <video
                  src={activeMediaModal.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : activeMediaModal.thumbnailUrl ? (
                <img
                  src={activeMediaModal.thumbnailUrl}
                  alt={activeMediaModal.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-white text-sm">No media preview available</div>
              )}
            </div>
            <div className="p-4 bg-[#FAF7F2] space-y-3">
              <p className="text-xs text-[#6E6A65] leading-relaxed">
                {activeMediaModal.description || "Sample campaign work demonstrating engagement and content style."}
              </p>
              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-[#E7E1D8]">
                <div className="bg-white p-2 rounded-lg border border-[#E7E1D8]">
                  <span className="block text-[10px] text-[#6E6A65]">Views</span>
                  <span className="font-bold text-xs text-[#1F1F1F]">{formatNumber(activeMediaModal.metrics?.views)}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#E7E1D8]">
                  <span className="block text-[10px] text-[#6E6A65]">Likes</span>
                  <span className="font-bold text-xs text-[#1F1F1F]">{formatNumber(activeMediaModal.metrics?.likes)}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#E7E1D8]">
                  <span className="block text-[10px] text-[#6E6A65]">Comments</span>
                  <span className="font-bold text-xs text-[#1F1F1F]">{formatNumber(activeMediaModal.metrics?.comments)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show All Media Gallery Modal */}
      {showAllMedia && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-[#E7E1D8]">
            <div className="p-4 border-b border-[#E7E1D8] flex items-center justify-between">
              <h3 className="font-bold text-[#1F1F1F] text-base">All Portfolio Content ({displayItems.length})</h3>
              <button
                onClick={() => setShowAllMedia(false)}
                className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
              {displayItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setShowAllMedia(false);
                    setActiveMediaModal(item);
                  }}
                  className="group relative aspect-[9/16] bg-neutral-900 rounded-2xl overflow-hidden cursor-pointer border border-[#E7E1D8] shadow-sm hover:shadow-md transition-all"
                >
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-[#A8678A] to-[#6A3D55] flex items-center justify-center p-3 text-center">
                      <span className="text-white text-xs font-bold">{item.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
                  <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none">
                    <p className="text-white font-bold text-xs leading-tight line-clamp-3 drop-shadow-sm">{item.title}</p>
                    <div className="flex items-center gap-1.5 text-white font-bold text-[11px] drop-shadow-sm">
                      <IconPlay />
                      <span>{formatNumber(item.metrics?.views)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
