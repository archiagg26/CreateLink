import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getStore } from '../services/store';
import type { FeedPost, Brand, Creator } from '../types/index';

// ── Bookmark storage ──────────────────────────────────────────────────────────
const STORAGE_KEY = 'cl_bookmarks';

interface Bookmark {
  id: string;
  type: 'campaign' | 'creator' | 'brand';
  savedAt: string;
}

function getBookmarks(): Bookmark[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; }
}

function saveBookmarks(bm: Bookmark[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bm));
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(getBookmarks);

  const toggle = (id: string, type: Bookmark['type']) => {
    setBookmarks(prev => {
      const exists = prev.find(b => b.id === id);
      const next = exists ? prev.filter(b => b.id !== id) : [...prev, { id, type, savedAt: new Date().toISOString() }];
      saveBookmarks(next);
      return next;
    });
  };

  const isBookmarked = (id: string) => bookmarks.some(b => b.id === id);

  return { bookmarks, toggle, isBookmarked };
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function BookmarksPage() {
  const { currentUser } = useAuthStore();
  const { bookmarks, toggle } = useBookmarks();
  const store = getStore();
  const [activeTab, setActiveTab] = useState<'all' | 'campaigns' | 'creators' | 'brands'>('all');

  const campaignBookmarks = bookmarks.filter(b => b.type === 'campaign');
  const creatorBookmarks  = bookmarks.filter(b => b.type === 'creator');
  const brandBookmarks    = bookmarks.filter(b => b.type === 'brand');

  // Resolve data
  const savedPosts: FeedPost[] = campaignBookmarks.flatMap(b => {
    const p = store.feedPosts.get(b.id);
    return p ? [p] : [];
  });
  const savedCreators: Creator[] = creatorBookmarks.flatMap(b => {
    const c = store.creators.get(b.id);
    return c ? [c] : [];
  });
  const savedBrands: Brand[] = brandBookmarks.flatMap(b => {
    const br = store.brands.get(b.id);
    return br ? [br] : [];
  });

  const isEmpty = bookmarks.length === 0;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1F1F1F]">Bookmarks</h1>
          <p className="text-[#6E6A65] text-sm mt-1">Your saved campaigns, creators and brands</p>
        </div>
        {!isEmpty && (
          <button onClick={() => { localStorage.removeItem(STORAGE_KEY); window.location.reload(); }}
            className="text-xs font-bold text-[#A8678A] hover:underline">
            Clear all
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-16 text-center">
          <div className="text-5xl mb-4">🔖</div>
          <p className="text-[#1F1F1F] font-bold text-lg">No bookmarks yet</p>
          <p className="text-[#6E6A65] text-sm mt-2 mb-6">
            Save campaigns, creators, and brands to find them here later.
          </p>
          <Link to="/feed" className="px-6 py-2.5 bg-[#1F1F1F] text-white font-bold text-sm rounded-xl hover:opacity-90">
            Explore Feed →
          </Link>
        </div>
      ) : (
        <>
          {/* Tab bar */}
          <div className="flex gap-1 bg-white border border-[#E7E1D8] rounded-2xl p-1.5 w-fit">
            {([
              { id: 'all',       label: `All (${bookmarks.length})` },
              { id: 'campaigns', label: `Campaigns (${campaignBookmarks.length})` },
              { id: 'creators',  label: `Creators (${creatorBookmarks.length})` },
              { id: 'brands',    label: `Brands (${brandBookmarks.length})` },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === t.id ? 'bg-[#1F1F1F] text-white' : 'text-[#6E6A65] hover:bg-[#F8EFF3]'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Campaign bookmarks */}
          {(activeTab === 'all' || activeTab === 'campaigns') && savedPosts.length > 0 && (
            <div className="space-y-3">
              {activeTab === 'all' && <p className="text-xs font-black uppercase tracking-wider text-[#6E6A65]">Campaigns</p>}
              {savedPosts.map(post => (
                <div key={post.id} className="bg-white border border-[#E7E1D8] rounded-[20px] p-5 shadow-card flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#1F1F1F]">{post.title}</p>
                    <p className="text-xs text-[#6E6A65] mt-1 line-clamp-2">{post.body}</p>
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F8EFF3] text-[#A8678A] capitalize">{post.category}</span>
                  </div>
                  <button onClick={() => toggle(post.id, 'campaign')}
                    className="shrink-0 text-[#A8678A] hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Creator bookmarks */}
          {(activeTab === 'all' || activeTab === 'creators') && savedCreators.length > 0 && (
            <div className="space-y-3">
              {activeTab === 'all' && <p className="text-xs font-black uppercase tracking-wider text-[#6E6A65]">Creators</p>}
              {savedCreators.map(c => (
                <div key={c.id} className="bg-white border border-[#E7E1D8] rounded-[20px] p-5 shadow-card flex items-center gap-4">
                  <img src={c.avatarUrl} alt={c.displayName} className="w-12 h-12 rounded-full border border-[#E7E1D8] shrink-0 object-cover" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/creator/${c.id}`} className="text-sm font-bold text-[#1F1F1F] hover:text-[#A8678A] block truncate">{c.displayName}</Link>
                    <p className="text-xs text-[#6E6A65] mt-0.5 truncate">{c.bio}</p>
                    <p className="text-xs font-bold text-[#A8678A] mt-0.5">Trust: {c.trustScore}</p>
                  </div>
                  <button onClick={() => toggle(c.id, 'creator')} className="shrink-0 text-[#A8678A] hover:text-red-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Brand bookmarks */}
          {(activeTab === 'all' || activeTab === 'brands') && savedBrands.length > 0 && (
            <div className="space-y-3">
              {activeTab === 'all' && <p className="text-xs font-black uppercase tracking-wider text-[#6E6A65]">Brands</p>}
              {savedBrands.map(b => (
                <div key={b.id} className="bg-white border border-[#E7E1D8] rounded-[20px] p-5 shadow-card flex items-center gap-4">
                  <img src={b.logoUrl} alt={b.companyName} className="w-12 h-12 rounded-xl border border-[#E7E1D8] shrink-0 object-contain p-1 bg-white" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/brand/${b.id}`} className="text-sm font-bold text-[#1F1F1F] hover:text-[#A8678A] block truncate">{b.companyName}</Link>
                    <p className="text-xs text-[#6E6A65] mt-0.5 capitalize">{b.industry}</p>
                    <p className="text-xs font-bold text-[#A8678A] mt-0.5">Score: {b.brandScore}</p>
                  </div>
                  <button onClick={() => toggle(b.id, 'brand')} className="shrink-0 text-[#A8678A] hover:text-red-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
