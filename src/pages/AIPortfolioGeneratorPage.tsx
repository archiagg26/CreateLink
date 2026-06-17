// placeholder

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCreatorStore } from '../stores/creatorStore';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PinnedReel {
  id: string;
  title: string;
  category: string;
  thumbnailUrl: string;
  videoUrl: string;
  metrics: { views: number; likes: number; comments: number; engagementRate: number };
}

interface ReelAnalysis {
  reelId: string;
  title: string;
  niche: string;
  brandFit: string[];
  strengths: string[];
  insight: string;
  score: number; // 0–100
}

interface AIPortfolio {
  headline: string;
  intro: string;
  specialties: string[];
  brandCategories: string[];
  featuredContent: { title: string; description: string; metric: string }[];
  collaborationHighlights: string[];
  audienceInsights: string;
  reelAnalyses: ReelAnalysis[];
}

// ── AI mock analysis ──────────────────────────────────────────────────────────

async function analyzeReels(reels: PinnedReel[], creatorName: string, categories: string[]): Promise<AIPortfolio> {
  // Simulate AI latency
  await new Promise(r => setTimeout(r, 2800));

  const primaryNiche = reels.length > 0 ? reels[0].category : categories[0] ?? 'lifestyle';
  const allCategories = [...new Set([...reels.map(r => r.category), ...categories])];

  const strengths: Record<string, string[]> = {
    beauty:    ['Strong skincare product demonstrations', 'Excellent product close-up shots', 'High audience engagement on beauty tutorials'],
    tech:      ['Compelling product unboxing style', 'Technical explanations made accessible', 'Strong review credibility'],
    lifestyle: ['Authentic storytelling', 'High audience relatability', 'Excellent morning/daily routine content'],
    fitness:   ['Motivational transformation content', 'Clear workout instruction delivery', 'Strong health brand alignment'],
    food:      ['Appealing food visuals', 'Strong recipe presentation', 'Excellent product integration'],
    travel:    ['Cinematic destination showcase', 'Aspirational travel storytelling', 'Strong engagement on travel tips'],
    fashion:   ['Excellent styling content', 'Strong brand collaboration potential', 'High visual quality'],
    gaming:    ['High viewer retention on gameplay', 'Strong community engagement', 'Excellent sponsor integration'],
    finance:   ['Trust-building financial content', 'Strong educational delivery', 'High-value audience demographics'],
    education: ['Clear instructional content', 'High save rates on educational posts', 'Strong knowledge brand fit'],
  };

  const reelAnalyses: ReelAnalysis[] = reels.map((reel, i) => ({
    reelId: reel.id,
    title: reel.title,
    niche: reel.category,
    brandFit: allCategories.slice(0, 3),
    strengths: strengths[reel.category] ?? strengths['lifestyle'],
    insight: (strengths[reel.category] ?? strengths['lifestyle'])[i % 3],
    score: Math.min(98, 72 + Math.round(reel.metrics.engagementRate * 400) + Math.floor(Math.random() * 10)),
  }));

  const topStrengths = [...new Set(reelAnalyses.flatMap(a => a.strengths))].slice(0, 4);

  return {
    headline: `${creatorName} — ${allCategories.slice(0, 2).map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' & ')} Creator`,
    intro: `${creatorName} is an authentic ${primaryNiche} content creator known for high-engagement storytelling and genuine product integrations. With a proven track record of brand collaborations, ${creatorName} brings creativity, audience trust, and measurable results to every campaign.`,
    specialties: topStrengths,
    brandCategories: allCategories.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
    featuredContent: reels.slice(0, 3).map(r => ({
      title: r.title,
      description: `${r.category.charAt(0).toUpperCase() + r.category.slice(1)} content with ${(r.metrics.engagementRate * 100).toFixed(1)}% engagement rate`,
      metric: `${r.metrics.views >= 1000 ? (r.metrics.views / 1000).toFixed(0) + 'K' : r.metrics.views} views`,
    })),
    collaborationHighlights: [
      'Seamless product integration that feels native to content',
      'Audience-first approach ensuring genuine brand endorsement',
      'Proven campaign delivery with measurable engagement outcomes',
    ],
    audienceInsights: `Primary audience: 25–34 age group (42%), predominantly female (63%). Highest engagement from US, UK, and Canada. Content performs best on evening uploads with authentic, story-driven formats.`,
    reelAnalyses,
  };
}

// ── Step progress ─────────────────────────────────────────────────────────────
const STEPS = ['Select Source', 'AI Analysis', 'Portfolio Preview', 'Publish'];

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AIPortfolioGeneratorPage() {
  const { currentUser } = useAuthStore();
  const { creator, loadCreator } = useCreatorStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [sourceMode, setSourceMode] = useState<'pinned' | 'all' | 'top' | 'niche'>('pinned');
  const [selectedNiche, setSelectedNiche] = useState('');
  const [generating, setGenerating] = useState(false);
  const [portfolio, setPortfolio] = useState<AIPortfolio | null>(null);
  const [editedPortfolio, setEditedPortfolio] = useState<AIPortfolio | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<'desktop' | 'mobile' | 'brand'>('desktop');
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) loadCreator(currentUser.id);
  }, [currentUser, loadCreator]);

  // Read pinned reels from sessionStorage (set by CreatorProfilePage)
  const pinnedReels: PinnedReel[] = (() => {
    try { return JSON.parse(sessionStorage.getItem('pinnedReels') ?? '[]'); }
    catch { return []; }
  })();

  const allReels: PinnedReel[] = (() => {
    try { return JSON.parse(sessionStorage.getItem('allReels') ?? '[]'); }
    catch { return []; }
  })();

  const getSourceReels = (): PinnedReel[] => {
    if (sourceMode === 'pinned' && pinnedReels.length > 0) return pinnedReels;
    if (sourceMode === 'top') return [...allReels].sort((a, b) => b.metrics.engagementRate - a.metrics.engagementRate).slice(0, 6);
    if (sourceMode === 'niche') return allReels.filter(r => r.category === selectedNiche);
    return allReels;
  };

  const handleGenerate = async () => {
    if (!creator) return;
    setGenerating(true);
    setStep(1);
    const reels = getSourceReels();
    // Fall back to portfolio-based mock reels if no real reels stored
    const fallbackReels: PinnedReel[] = creator.portfolio.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      thumbnailUrl: p.mediaUrl,
      videoUrl: '',
      metrics: p.metrics,
    }));
    const sourceReels = reels.length > 0 ? reels : fallbackReels;
    try {
      const result = await analyzeReels(sourceReels, creator.displayName, creator.contentCategories);
      setPortfolio(result);
      setEditedPortfolio(result);
      setStep(2);
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = () => {
    setStep(3);
    setPublishedSuccess(true);
    setTimeout(() => navigate(`/creator/${creator?.id}`), 2500);
  };

  const hasPinned = pinnedReels.length > 0;
  const sourceReels = getSourceReels();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1F1F1F] flex items-center gap-2">
            ✨ AI Portfolio Generator
          </h1>
          <p className="text-[#6E6A65] text-sm mt-1">
            Generate a brand-ready portfolio automatically from your best reels
          </p>
        </div>
        <button onClick={() => navigate(`/creator/${creator?.id}`)}
          className="px-4 py-2 text-xs font-bold text-[#6E6A65] border border-[#E7E1D8] rounded-xl hover:bg-[#F8EFF3] transition-colors">
          ← Back to Profile
        </button>
      </div>

      {/* Step progress bar */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black shrink-0 ${
              i < step ? 'bg-emerald-500 text-white'
              : i === step ? 'bg-[#1F1F1F] text-white'
              : 'bg-[#E7E1D8] text-[#6E6A65]'
            }`}>
              {i < step ? '✓' : i + 1}
            </div>
            <div className="flex-1 mx-1 text-[10px] font-bold text-[#6E6A65] truncate hidden sm:block">{label}</div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 rounded ${i < step ? 'bg-emerald-400' : 'bg-[#E7E1D8]'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── STEP 0: Select source ── */}
      {step === 0 && (
        <div className="space-y-5">
          <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-6 space-y-5">
            <h2 className="font-black text-[#1F1F1F] text-lg">Choose reel source</h2>

            {/* Pinned reels info banner */}
            {hasPinned ? (
              <div className="bg-[#F8EFF3] border border-[#A8678A]/30 rounded-2xl px-4 py-3 flex items-center gap-3">
                <span className="text-xl">📌</span>
                <div>
                  <p className="text-sm font-bold text-[#1F1F1F]">{pinnedReels.length} pinned reels detected</p>
                  <p className="text-xs text-[#6E6A65]">AI will prioritize your pinned reels as creator-selected best work</p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                <span className="text-xl">💡</span>
                <div>
                  <p className="text-sm font-bold text-[#1F1F1F]">No pinned reels found</p>
                  <p className="text-xs text-[#6E6A65]">Pin your best reels on your profile first, or AI will auto-select top performers</p>
                </div>
              </div>
            )}

            {/* Source options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'pinned' as const, emoji: '📌', label: 'Use Pinned Reels', desc: 'Prioritize your hand-picked best work', recommended: hasPinned },
                { id: 'top' as const,    emoji: '🔥', label: 'Top Performing Reels', desc: 'AI selects by engagement rate & views' },
                { id: 'all' as const,    emoji: '🎬', label: 'Use All Reels', desc: 'Full portfolio analysis across all content' },
                { id: 'niche' as const,  emoji: '🎯', label: 'By Niche', desc: 'Focus on a specific content category' },
              ].map(opt => (
                <button key={opt.id} type="button"
                  onClick={() => setSourceMode(opt.id)}
                  className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                    sourceMode === opt.id
                      ? 'border-[#A8678A] bg-[#F8EFF3]'
                      : 'border-[#E7E1D8] bg-white hover:border-[#A8678A]/50'
                  }`}>
                  <span className="text-2xl">{opt.emoji}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-[#1F1F1F]">{opt.label}</p>
                      {opt.recommended && <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#A8678A] text-white">RECOMMENDED</span>}
                    </div>
                    <p className="text-xs text-[#6E6A65] mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Niche selector */}
            {sourceMode === 'niche' && (
              <div>
                <label className="block text-xs font-bold text-[#1F1F1F] mb-2">Select niche</label>
                <div className="flex flex-wrap gap-2">
                  {(creator?.contentCategories ?? ['lifestyle', 'tech', 'beauty']).map(cat => (
                    <button key={cat} type="button" onClick={() => setSelectedNiche(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                        selectedNiche === cat ? 'bg-[#1F1F1F] text-white' : 'bg-[#F8EFF3] text-[#A8678A] hover:bg-[#E7E1D8]'
                      }`}>{cat}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Source preview */}
            {sourceReels.length > 0 && (
              <div>
                <p className="text-xs font-bold text-[#6E6A65] uppercase tracking-wider mb-2">
                  {sourceReels.length} reels will be analyzed
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {sourceReels.slice(0, 6).map(r => (
                    <div key={r.id} className="shrink-0 w-16 rounded-xl overflow-hidden bg-[#1F1F1F]" style={{ aspectRatio: '9/16' }}>
                      {r.thumbnailUrl
                        ? <img src={r.thumbnailUrl} alt={r.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-white/30 text-xs text-center p-1">{r.category}</div>
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={handleGenerate}
            disabled={sourceMode === 'niche' && !selectedNiche}
            className="w-full py-3.5 rounded-2xl bg-[#1F1F1F] text-white font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2">
            ✨ Generate Portfolio with AI
          </button>
        </div>
      )}

      {/* ── STEP 1: Generating ── */}
      {step === 1 && generating && (
        <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-12 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#F8EFF3] flex items-center justify-center text-3xl mx-auto animate-pulse">✨</div>
          <h2 className="font-black text-[#1F1F1F] text-lg">Analyzing your reels...</h2>
          <div className="space-y-3 max-w-sm mx-auto">
            {[
              '🔍 Scanning pinned reel content',
              '🧠 Analyzing brand fit & niche alignment',
              '📊 Evaluating engagement & audience quality',
              '✍️ Generating portfolio copy',
            ].map((msg, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-[#6E6A65]">
                <div className="w-4 h-4 rounded-full border-2 border-[#A8678A] border-t-transparent animate-spin shrink-0" />
                {msg}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2: Portfolio Preview + Edit ── */}
      {step === 2 && editedPortfolio && (
        <div className="space-y-5">
          {/* Preview toggle */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-1 bg-white border border-[#E7E1D8] rounded-2xl p-1.5 w-fit">
              {(['desktop', 'mobile', 'brand'] as const).map(v => (
                <button key={v} onClick={() => setActivePreview(v)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    activePreview === v ? 'bg-[#1F1F1F] text-white' : 'text-[#6E6A65] hover:bg-[#F8EFF3]'
                  }`}>
                  {v === 'desktop' ? '🖥️' : v === 'mobile' ? '📱' : '🏷️'} {v}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setStep(0); setPortfolio(null); setEditedPortfolio(null); }}
                className="px-4 py-2 text-xs font-bold text-[#6E6A65] border border-[#E7E1D8] rounded-xl hover:bg-[#F8EFF3]">
                🔄 Regenerate
              </button>
              <button onClick={handlePublish}
                className="px-5 py-2 text-xs font-black bg-[#1F1F1F] text-white rounded-xl hover:opacity-90">
                🚀 Publish Portfolio
              </button>
            </div>
          </div>

          {/* Portfolio preview card */}
          <div className={`bg-white border border-[#E7E1D8] rounded-[20px] overflow-hidden ${activePreview === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
            {/* Cover */}
            <div className="h-28 bg-[#F8EFF3]" style={{ background: 'linear-gradient(135deg, #F8EFF3 0%, #F6F2E8 100%)' }}>
              <div className="px-6 pt-5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  <span className="text-[10px] font-black text-[#A8678A] uppercase tracking-widest">AI Generated Portfolio</span>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 -mt-6">
              {/* Editable headline */}
              <div className="group relative mb-1">
                {editingSection === 'headline' ? (
                  <input autoFocus value={editedPortfolio.headline}
                    onChange={e => setEditedPortfolio(p => p ? { ...p, headline: e.target.value } : p)}
                    onBlur={() => setEditingSection(null)}
                    className="w-full text-2xl font-black text-[#1F1F1F] bg-[#F8EFF3] rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#A8678A]" />
                ) : (
                  <h2 className="text-2xl font-black text-[#1F1F1F] cursor-text hover:text-[#A8678A] transition-colors"
                    onClick={() => setEditingSection('headline')}>
                    {editedPortfolio.headline}
                    <span className="ml-2 opacity-0 group-hover:opacity-100 text-sm text-[#A8678A]">✏️</span>
                  </h2>
                )}
              </div>

              {/* Editable intro */}
              <div className="group relative mb-5">
                {editingSection === 'intro' ? (
                  <textarea autoFocus value={editedPortfolio.intro}
                    onChange={e => setEditedPortfolio(p => p ? { ...p, intro: e.target.value } : p)}
                    onBlur={() => setEditingSection(null)}
                    rows={3} className="w-full text-sm text-[#6E6A65] bg-[#F8EFF3] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A8678A] resize-none" />
                ) : (
                  <p className="text-sm text-[#6E6A65] leading-relaxed cursor-text hover:text-[#1F1F1F] transition-colors"
                    onClick={() => setEditingSection('intro')}>
                    {editedPortfolio.intro}
                    <span className="ml-1 opacity-0 group-hover:opacity-100 text-[#A8678A]">✏️</span>
                  </p>
                )}
              </div>

              {/* Specialties */}
              <div className="mb-5">
                <p className="text-[11px] font-black uppercase tracking-wider text-[#6E6A65] mb-2">Content Specialties</p>
                <div className="space-y-1.5">
                  {editedPortfolio.specialties.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-[#1F1F1F]">
                      <span className="text-[#A8678A]">✦</span> {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand categories */}
              <div className="mb-5">
                <p className="text-[11px] font-black uppercase tracking-wider text-[#6E6A65] mb-2">Brand Categories</p>
                <div className="flex flex-wrap gap-2">
                  {editedPortfolio.brandCategories.map(cat => (
                    <span key={cat} className="px-3 py-1 rounded-full text-xs font-bold bg-[#F8EFF3] text-[#A8678A] border border-[#E7E1D8]">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Featured content */}
              {editedPortfolio.featuredContent.length > 0 && (
                <div className="mb-5">
                  <p className="text-[11px] font-black uppercase tracking-wider text-[#6E6A65] mb-3">Featured Content</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {editedPortfolio.featuredContent.map((fc, i) => (
                      <div key={i} className="bg-[#F8EFF3] rounded-2xl p-4">
                        <p className="text-xs font-black text-[#1F1F1F] leading-snug mb-1">{fc.title}</p>
                        <p className="text-[10px] text-[#6E6A65]">{fc.description}</p>
                        <p className="text-sm font-black text-[#A8678A] mt-2">{fc.metric}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reel analyses */}
              {editedPortfolio.reelAnalyses.length > 0 && (
                <div className="mb-5">
                  <p className="text-[11px] font-black uppercase tracking-wider text-[#6E6A65] mb-3">AI Reel Analysis</p>
                  <div className="space-y-3">
                    {editedPortfolio.reelAnalyses.map((ra, i) => (
                      <div key={i} className="bg-white border border-[#E7E1D8] rounded-2xl p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-bold text-[#1F1F1F] line-clamp-1">{ra.title}</p>
                          <div className="flex items-center gap-1 shrink-0">
                            <div className="relative w-8 h-8">
                              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                                <circle cx="16" cy="16" r="12" fill="none" stroke="#E7E1D8" strokeWidth="3" />
                                <circle cx="16" cy="16" r="12" fill="none" stroke="#A8678A" strokeWidth="3"
                                  strokeDasharray={`${(ra.score / 100) * 75.4} 75.4`} strokeLinecap="round" />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-[#1F1F1F]">{ra.score}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-[#A8678A] font-semibold italic">"{ra.insight}"</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {ra.brandFit.map(b => (
                            <span key={b} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F6F2E8] text-[#6E6A65] capitalize">{b}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audience insights */}
              <div className="bg-[#F6F2E8] rounded-2xl p-4">
                <p className="text-[11px] font-black uppercase tracking-wider text-[#6E6A65] mb-1">Audience Insights</p>
                <p className="text-xs text-[#6E6A65] leading-relaxed">{editedPortfolio.audienceInsights}</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#9E9A97] text-center">
            Click any text field to edit · Portfolio updates are saved when you publish
          </p>
        </div>
      )}

      {/* ── STEP 3: Published ── */}
      {step === 3 && publishedSuccess && (
        <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-16 text-center space-y-4">
          <div className="text-5xl">🎉</div>
          <h2 className="font-black text-[#1F1F1F] text-xl">Portfolio Published!</h2>
          <p className="text-[#6E6A65] text-sm">Your AI-generated portfolio is now live on your profile.</p>
          <p className="text-[#9E9A97] text-xs">Redirecting to profile...</p>
        </div>
      )}

    </div>
  );
}
