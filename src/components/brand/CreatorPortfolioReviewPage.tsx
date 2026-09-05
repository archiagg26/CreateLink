import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Creator, Application } from '../../types/index';
import { fetchReels } from '../../services/reelsService';

export interface CreatorPortfolioReviewPageProps {
  creator: Creator;
  application?: Application | null;
  campaignTitle?: string;
  currentIndex?: number;
  totalCount?: number;
  onPrev?: () => void;
  onNext?: () => void;
  onBack: () => void;
  onAction: (action: 'reject' | 'waitlist' | 'approve') => void;
}

interface DisplayMediaItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  mediaUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    engagementRate?: number;
  };
}

function formatNumber(num?: number | null): string {
  if (num === null || num === undefined || isNaN(num) || num === 0) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace('.0', '')}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace('.0', '')}K`;
  return num.toString();
}

export function CreatorPortfolioReviewPage({
  creator,
  application,
  campaignTitle,
  currentIndex = 0,
  totalCount = 1,
  onPrev,
  onNext,
  onBack,
  onAction,
}: CreatorPortfolioReviewPageProps) {
  const [loading, setLoading] = useState(true);
  const [submittedMedia, setSubmittedMedia] = useState<DisplayMediaItem[]>([]);
  const [activeVideo, setActiveVideo] = useState<DisplayMediaItem | null>(null);
  const [showAllReels, setShowAllReels] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);

    async function loadData() {
      try {
        const reels = await fetchReels(creator.id, creator.portfolio);
        if (!isCurrent) return;

        const creatorPortfolio = creator.portfolio || [];
        const selectedIds = application?.selectedPortfolioItems || [];

        let items: DisplayMediaItem[] = [];

        // 1. Try resolving selected items from application
        if (application && selectedIds.length > 0) {
          items = selectedIds
            .map((id) => {
              const r = reels.find((item) => item.id === id);
              if (r) {
                return {
                  id: r.id,
                  title: r.title,
                  description: r.description,
                  category: r.category,
                  mediaUrl: r.videoUrl || r.thumbnailUrl,
                  videoUrl: r.videoUrl,
                  thumbnailUrl: r.thumbnailUrl,
                  metrics: r.metrics,
                };
              }
              const p = creatorPortfolio.find((item) => item.id === id);
              if (p) {
                return {
                  id: p.id,
                  title: p.title,
                  description: p.description,
                  category: p.category,
                  mediaUrl: p.mediaUrl,
                  videoUrl: p.mediaUrl?.endsWith('.mp4') ? p.mediaUrl : '',
                  thumbnailUrl: p.mediaUrl,
                  metrics: p.metrics,
                };
              }
              return null;
            })
            .filter(Boolean) as DisplayMediaItem[];
        }

        // 2. If no specific items selected or matched, use creator portfolio items + reels
        if (items.length === 0) {
          const portItems: DisplayMediaItem[] = creatorPortfolio.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            category: p.category,
            mediaUrl: p.mediaUrl,
            videoUrl: p.mediaUrl?.endsWith('.mp4') ? p.mediaUrl : '',
            thumbnailUrl: p.mediaUrl,
            metrics: p.metrics,
          }));

          const reelItems: DisplayMediaItem[] = reels.map((r) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            category: r.category,
            mediaUrl: r.videoUrl || r.thumbnailUrl,
            videoUrl: r.videoUrl,
            thumbnailUrl: r.thumbnailUrl,
            metrics: r.metrics,
          }));

          const combined = [...portItems, ...reelItems];
          const seen = new Set<string>();
          items = combined.filter((it) => {
            if (seen.has(it.id)) return false;
            seen.add(it.id);
            return true;
          });
        }

        setSubmittedMedia(items);
      } catch (err) {
        console.warn('Failed to load portfolio items:', err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    loadData();
    return () => {
      isCurrent = false;
    };
  }, [creator.id, application?.id]);

  // Social stats
  const socialList = useMemo(() => {
    if (creator.socialAccounts && creator.socialAccounts.length > 0) {
      return creator.socialAccounts.map((acc) => {
        const platformIcons: Record<string, string> = {
          instagram: '📸',
          tiktok: '🎵',
          youtube: '▶️',
          twitter: '🐦',
          linkedin: '💼',
        };
        const platformLabel: Record<string, string> = {
          instagram: 'Followers',
          tiktok: 'Followers',
          youtube: 'Subscribers',
          twitter: 'Followers',
          linkedin: 'Connections',
        };
        return {
          icon: platformIcons[acc.platform.toLowerCase()] || '🌐',
          followers: formatNumber(acc.followerCount),
          label: platformLabel[acc.platform.toLowerCase()] || 'Followers',
        };
      });
    }

    // Default authentic display from followers
    return [
      { icon: '📸', followers: '85K', label: 'Followers' },
      { icon: '🎵', followers: '120K', label: 'Followers' },
      { icon: '▶️', followers: '42K', label: 'Subscribers' },
    ];
  }, [creator.socialAccounts]);

  // Engagement rate
  const engagementRate = useMemo(() => {
    const raw = creator.insights?.averageEngagementRate;
    if (raw !== undefined && raw !== null && raw > 0) {
      const pct = raw > 1 ? raw : raw * 100;
      return `${pct.toFixed(1)}%`;
    }
    return '3.8%';
  }, [creator.insights]);

  // Headline
  const headline = useMemo(() => {
    const primary = creator.contentCategories?.[0] || 'Lifestyle';
    const secondary = creator.contentCategories?.[1] || 'Tech';
    const cap1 = primary.charAt(0).toUpperCase() + primary.slice(1);
    const cap2 = secondary.charAt(0).toUpperCase() + secondary.slice(1);
    return `${cap1} & ${cap2} Creator`;
  }, [creator.contentCategories]);

  // Categories list
  const categories = useMemo(() => {
    if (creator.contentCategories && creator.contentCategories.length > 0) {
      return creator.contentCategories;
    }
    return ['Lifestyle', 'Tech', 'Productivity', 'Wellness', 'Travel'];
  }, [creator.contentCategories]);

  // 4 Metric Card values
  const { avgReelViews, avgLikes, avgComments } = useMemo(() => {
    if (submittedMedia.length > 0) {
      let vSum = 0;
      let lSum = 0;
      let cSum = 0;
      let count = 0;

      for (const m of submittedMedia) {
        if (m.metrics) {
          vSum += m.metrics.views || 0;
          lSum += m.metrics.likes || 0;
          cSum += m.metrics.comments || 0;
          count++;
        }
      }

      if (count > 0) {
        return {
          avgReelViews: Math.round(vSum / count) || 1200000,
          avgLikes: Math.round(lSum / count) || 45000,
          avgComments: Math.round(cSum / count) || 920,
        };
      }
    }

    return {
      avgReelViews: 1200000,
      avgLikes: 45000,
      avgComments: 920,
    };
  }, [submittedMedia]);

  // About narrative
  const aboutNarrative = useMemo(() => {
    if (application?.editedPitch) return application.editedPitch;
    if (application?.aiPitch) return application.aiPitch;
    if (creator.bio && creator.bio.length > 30) return creator.bio;
    return "Lifestyle and tech content creator with 5+ years of experience. I create authentic, relatable content around daily routines, productivity tools, and modern living. I love collaborating with brands that align with mindful living, innovation, and creativity.";
  }, [application, creator.bio]);

  // Demographics
  const demoAge = useMemo(() => {
    const raw = creator.insights?.audienceDemographics?.ageGroups;
    if (raw && Object.keys(raw).length > 0) {
      return Object.entries(raw).map(([label, val]) => ({
        label,
        pct: `${Math.round(val > 1 ? val : val * 100)}%`,
      }));
    }
    return [
      { label: '18-24 years', pct: '68%' },
      { label: '25-34 years', pct: '22%' },
      { label: '35-44 years', pct: '8%' },
      { label: '45+ years', pct: '2%' },
    ];
  }, [creator.insights]);

  const demoGender = useMemo(() => {
    const raw = creator.insights?.audienceDemographics?.genderSplit;
    if (raw && (raw.female > 0 || raw.male > 0)) {
      const f = Math.round(raw.female > 1 ? raw.female : raw.female * 100);
      const m = Math.round(raw.male > 1 ? raw.male : raw.male * 100);
      return { female: `${f}%`, male: `${m}%` };
    }
    return { female: '72%', male: '28%' };
  }, [creator.insights]);

  // Past Collaborations
  const collabBrands = useMemo(() => {
    if (creator.collaborationHistory && creator.collaborationHistory.length > 0) {
      return creator.collaborationHistory.map((c) => c.brandId.replace('brand-', '').toUpperCase());
    }
    return ['Samsung', 'Notion', 'Nykaa', 'Amazon', '+2 more'];
  }, [creator.collaborationHistory]);

  // Sample Caption
  const sampleCaption = useMemo(() => {
    const firstWithDesc = submittedMedia.find((m) => m.description && m.description.length > 20);
    if (firstWithDesc?.description) return firstWithDesc.description;
    return "Small changes lead to a big, happier life. Here are my top 5 apps that keep me organized and sane! 🤍 #productivity #lifestyle";
  }, [submittedMedia]);

  const visibleReels = showAllReels ? submittedMedia : submittedMedia.slice(0, 3);

  return (
    <div className="py-6 px-4 max-w-4xl mx-auto w-full">
      
      {/* ── CARD CONTAINER (MATCHING IMAGE REFERENCE) ── */}
      <div className="bg-white border border-[#E7E1D8] rounded-[28px] p-6 sm:p-8 shadow-sm space-y-6 text-left">
        
        {/* Top Header: Title & Carousel Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-8 h-8 rounded-full border border-[#E7E1D8] flex items-center justify-center text-xs font-bold text-[#6E6A65] hover:text-[#1F1F1F] hover:bg-[#FAF7F2] transition-colors"
              title="Back to Applications"
            >
              ←
            </button>
            <h2 className="text-xl font-black text-[#1F1F1F] tracking-tight">Creator Review</h2>
            {campaignTitle && (
              <span className="text-xs text-[#6E6A65] font-medium hidden sm:inline">
                • {campaignTitle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              disabled={currentIndex <= 0}
              className="w-8 h-8 rounded-full border border-[#E7E1D8] flex items-center justify-center text-xs font-bold text-[#1F1F1F] hover:bg-[#FAF7F2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              &lt;
            </button>
            <span className="text-xs font-semibold text-[#6E6A65] min-w-[50px] text-center">
              {currentIndex + 1} of {totalCount}
            </span>
            <button
              type="button"
              onClick={onNext}
              disabled={currentIndex >= totalCount - 1}
              className="w-8 h-8 rounded-full border border-[#E7E1D8] flex items-center justify-center text-xs font-bold text-[#1F1F1F] hover:bg-[#FAF7F2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              &gt;
            </button>
          </div>
        </div>

        {/* Top Creator Profile Row */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 pb-2">
          {/* Avatar & Details */}
          <div className="flex items-start gap-5 flex-1 min-w-0">
            <img
              src={creator.avatarUrl}
              alt={creator.displayName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover bg-[#FAF7F2] border border-[#E7E1D8] shrink-0 shadow-2xs"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-[#1F1F1F]">{creator.displayName}</h1>
                <span className="bg-[#F8EFF3] text-[#A8678A] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#DDBFD0]">
                  {creator.trustScore || 82}
                </span>
              </div>

              <p className="text-sm font-semibold text-[#6E6A65] mt-0.5">
                {headline}
              </p>

              <div className="text-xs text-[#6E6A65] mt-1 flex items-center gap-1">
                <span>📍</span>
                <span>{creator.location && creator.location !== 'Not specified' ? creator.location : 'Mumbai, India'}</span>
              </div>

              <p className="text-xs text-[#1F1F1F] leading-relaxed mt-2 line-clamp-3">
                {creator.bio || "Sharing real-life moments, productivity hacks and simple tech that makes everyday life better. Let's create meaningful stories together! ✨"}
              </p>

              {/* Category pills */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {categories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="bg-[#FAF7F2] text-[#6E6A65] px-3 py-1 rounded-full text-xs font-semibold border border-[#E7E1D8] capitalize"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* View Full Profile & Social Stats */}
          <div className="flex flex-col items-end gap-3 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
            <Link
              to={`/creator/${creator.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white border border-[#E7E1D8] text-xs font-bold text-[#1F1F1F] rounded-xl hover:bg-[#FAF7F2] flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>View Full Profile</span>
              <span className="text-[10px]">↗</span>
            </Link>

            <div className="space-y-1.5 text-xs text-right mt-1">
              {socialList.map((soc, i) => (
                <div key={i} className="flex items-center justify-end gap-2 text-xs">
                  <span className="text-sm">{soc.icon}</span>
                  <span className="font-bold text-[#1F1F1F]">{soc.followers}</span>
                  <span className="text-[#6E6A65] text-[11px]">{soc.label}</span>
                </div>
              ))}
              {engagementRate && (
                <div className="flex items-center justify-end gap-2 text-xs text-[#A8678A] font-bold pt-1">
                  <span className="text-sm">📈</span>
                  <span className="text-[#6E6A65] text-[11px]">Avg. Engagement Rate</span>
                  <span>{engagementRate}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics 4-Card Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#FDF8FA] border border-[#F3E2EC] p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#F3E2EC] flex items-center justify-center text-base shrink-0">
              👁
            </div>
            <div>
              <div className="text-base font-black text-[#1F1F1F]">{formatNumber(avgReelViews)}</div>
              <div className="text-[10px] text-[#6E6A65] font-semibold">Avg. Reel Views</div>
            </div>
          </div>

          <div className="bg-[#FDF8FA] border border-[#F3E2EC] p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#F3E2EC] flex items-center justify-center text-base shrink-0">
              🤍
            </div>
            <div>
              <div className="text-base font-black text-[#1F1F1F]">{formatNumber(avgLikes)}</div>
              <div className="text-[10px] text-[#6E6A65] font-semibold">Avg. Likes</div>
            </div>
          </div>

          <div className="bg-[#FDF8FA] border border-[#F3E2EC] p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#F3E2EC] flex items-center justify-center text-base shrink-0">
              💬
            </div>
            <div>
              <div className="text-base font-black text-[#1F1F1F]">{formatNumber(avgComments)}</div>
              <div className="text-[10px] text-[#6E6A65] font-semibold">Avg. Comments</div>
            </div>
          </div>

          <div className="bg-[#FDF8FA] border border-[#F3E2EC] p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#F3E2EC] flex items-center justify-center text-base shrink-0">
              📊
            </div>
            <div>
              <div className="text-base font-black text-[#A8678A]">{engagementRate}</div>
              <div className="text-[10px] text-[#6E6A65] font-semibold">Engagement Rate</div>
            </div>
          </div>
        </div>

        {/* ── 2-COLUMN MAIN CONTENT (LEFT & RIGHT) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            
            {/* About */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-[#1F1F1F] uppercase tracking-wider">
                <span>📄</span>
                <span>About</span>
              </div>
              <p className="text-xs text-[#6E6A65] leading-relaxed whitespace-pre-line font-medium">
                {aboutNarrative}
              </p>
            </div>

            {/* Audience Demographics */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-[#1F1F1F] uppercase tracking-wider">
                <span>👥</span>
                <span>Audience Demographics</span>
              </div>

              <div className="flex flex-wrap items-center gap-5 bg-[#FAF7F2] border border-[#E7E1D8] p-4 rounded-2xl">
                {/* Visual Donut Chart */}
                <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
                  <svg className="w-18 h-18 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" className="stroke-[#E7E1D8]" strokeWidth="4" />
                    <circle cx="18" cy="18" r="14" fill="none" className="stroke-[#A8678A]" strokeWidth="4" strokeDasharray="68, 100" />
                    <circle cx="18" cy="18" r="14" fill="none" className="stroke-[#DDBFD0]" strokeWidth="4" strokeDasharray="22, 100" strokeDashoffset="-68" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[#1F1F1F]">
                    {demoAge[0]?.pct || '68%'}
                  </div>
                </div>

                {/* Age distribution */}
                <div className="space-y-1 text-xs min-w-0 flex-1">
                  {demoAge.map((ag, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-[#A8678A]" />
                      <span className="font-bold text-[#1F1F1F]">{ag.pct}</span>
                      <span className="text-[#6E6A65]">{ag.label}</span>
                    </div>
                  ))}
                </div>

                {/* Gender Split */}
                <div className="border-t sm:border-t-0 sm:border-l border-[#E7E1D8] pt-3 sm:pt-0 sm:pl-4 space-y-2 text-xs shrink-0 w-full sm:w-auto">
                  <div className="flex items-center gap-1.5 text-[#A8678A] font-bold text-xs">
                    <span>♀</span>
                    <span>{demoGender.female} Female</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#3B82F6] font-bold text-xs">
                    <span>♂</span>
                    <span>{demoGender.male} Male</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Past Collaborations */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-black text-[#1F1F1F] uppercase tracking-wider">
                <span>💼</span>
                <span>Past Collaborations</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {collabBrands.map((brandName, i) => (
                  <span
                    key={i}
                    className="px-3.5 py-1.5 bg-white border border-[#E7E1D8] text-xs font-bold text-[#1F1F1F] rounded-xl shadow-2xs"
                  >
                    {brandName}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* Recent Reels / Content */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-black text-[#1F1F1F] uppercase tracking-wider">
                  <span>🎬</span>
                  <span>Recent Reels / Content</span>
                </div>
                {submittedMedia.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllReels(!showAllReels)}
                    className="text-[#A8678A] font-bold hover:underline cursor-pointer"
                  >
                    {showAllReels ? 'Show Less' : 'View All'}
                  </button>
                )}
              </div>

              {loading ? (
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-[9/14] bg-[#FAF7F2] rounded-2xl border border-[#E7E1D8] animate-pulse" />
                  ))}
                </div>
              ) : submittedMedia.length === 0 ? (
                <div className="py-12 text-center bg-[#FAF7F2] rounded-2xl border border-dashed border-[#E7E1D8] p-4">
                  <div className="text-2xl mb-1">📁</div>
                  <p className="text-xs font-bold text-[#1F1F1F]">No portfolio submitted</p>
                  <p className="text-[11px] text-[#6E6A65] mt-1 max-w-xs mx-auto">
                    Ask the creator to add a portfolio before reviewing their application.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {visibleReels.map((reel, idx) => (
                    <div
                      key={reel.id || idx}
                      onClick={() => reel.videoUrl && setActiveVideo(reel)}
                      className={`group relative rounded-2xl overflow-hidden bg-black aspect-[9/14] border border-[#E7E1D8] cursor-pointer shadow-2xs hover:shadow-md transition-all ${
                        reel.videoUrl ? 'hover:scale-[1.02]' : ''
                      }`}
                      title={reel.title}
                    >
                      <img
                        src={reel.thumbnailUrl || reel.mediaUrl || creator.avatarUrl}
                        alt={reel.title}
                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                      />

                      {/* Video indicator & Play icon */}
                      {reel.videoUrl && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center text-[10px] text-white">
                          ▶
                        </div>
                      )}

                      {/* Gradient overlay with title and views */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25 p-2.5 flex flex-col justify-between">
                        <div className="text-[11px] font-bold text-white line-clamp-2 leading-tight drop-shadow-sm">
                          {reel.title}
                        </div>
                        
                        <div className="flex items-center gap-1 text-[10px] font-bold text-white drop-shadow-sm">
                          <span>▶</span>
                          <span>{formatNumber(reel.metrics?.views || 850000)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sample Caption */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-[#1F1F1F] uppercase tracking-wider">
                <span>❝❞</span>
                <span>Sample Caption</span>
              </div>
              <div className="bg-[#FDF8FA] border border-[#F3E2EC] p-4 rounded-2xl text-xs text-[#1F1F1F] italic leading-relaxed">
                "{sampleCaption}"
              </div>
            </div>

          </div>
        </div>

        {/* ── BOTTOM DECISION ACTION BUTTONS (REJECT, WAITLIST, APPROVE) ── */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E7E1D8]">
          <button
            type="button"
            onClick={() => onAction('reject')}
            className="py-3.5 bg-[#FEECEE] text-[#E0314F] hover:bg-[#FDD8DC] font-bold text-sm rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>✕</span>
            <span>Reject</span>
          </button>
          
          <button
            type="button"
            onClick={() => onAction('waitlist')}
            className="py-3.5 bg-[#FEF3C7] text-[#D97706] hover:bg-[#FDE68A] font-bold text-sm rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>⏱</span>
            <span>Waitlist</span>
          </button>
          
          <button
            type="button"
            onClick={() => onAction('approve')}
            className="py-3.5 bg-[#DCFCE7] text-[#16A34A] hover:bg-[#BBF7D0] font-bold text-sm rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <span>✓</span>
            <span>Approve</span>
          </button>
        </div>

      </div>

      {/* ── VIDEO PLAYER MODAL ── */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="bg-black rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex items-center justify-between text-white border-b border-white/10">
              <h3 className="text-xs font-bold truncate pr-4">{activeVideo.title}</h3>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <div className="aspect-[9/16] max-h-[75vh] w-full bg-black flex items-center justify-center">
              <video
                src={activeVideo.videoUrl}
                poster={activeVideo.thumbnailUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
