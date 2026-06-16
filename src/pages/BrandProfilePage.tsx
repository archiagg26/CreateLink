import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useBrandStore } from '../stores/brandStore';
import { getStore } from '../services/store';
import ScoreBadge from '../components/shared/ScoreBadge';
import VerificationBadge from '../components/shared/VerificationBadge';
import PartialDataIndicator from '../components/shared/PartialDataIndicator';
import type { Campaign } from '../types/index';

export default function BrandProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuthStore();
  const { brand, loadBrand } = useBrandStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const profileId = id === 'me' ? currentUser?.id : id;
  const isOwnProfile = currentUser?.id === profileId;

  useEffect(() => {
    if (profileId) {
      Promise.resolve().then(() => {
        setLoading(true);
      });
      loadBrand(profileId)
        .then(() => {
          // Fetch brand's campaigns from store
          const store = getStore();
          const brandCampaigns = Array.from(store.campaigns.values()).filter(
            (c) => c.brandId === profileId && c.status !== 'removed'
          );
          setCampaigns(brandCampaigns);
          setLoading(false);
        })
        .catch((err) => {
          setError((err as Error).message || 'Failed to load brand profile.');
          setLoading(false);
        });
    }
  }, [profileId, loadBrand]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">Loading brand profile...</p>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
        <p className="text-rose-500 font-bold mb-4">{error || 'Brand profile not found.'}</p>
        <Link to="/feed" className="px-5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm hover:bg-slate-700 transition-colors">
          Return to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Brand Profile Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm relative">
        {/* Cover Banner */}
        <div className="h-32 sm:h-48 bg-gradient-to-r from-purple-600/20 via-indigo-600/15 to-blue-600/20 relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        </div>

        {/* Profile Content Container */}
        <div className="px-6 pb-6 relative">
          {/* Logo Overlay */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
            <img
              src={brand.logoUrl}
              alt={brand.companyName}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 shadow-md relative z-10 p-1 object-contain"
            />
            {/* Score metrics / Action buttons */}
            <div className="flex flex-col gap-2 shrink-0 sm:pb-2 items-start sm:items-end">
              {brand.isNewToPlatform ? (
                <span className="inline-flex items-center rounded-full bg-slate-150 dark:bg-slate-800 text-slate-600 dark:text-slate-350 text-xs px-3 py-1.5 font-bold uppercase border border-slate-250 dark:border-slate-700">
                  New to Platform
                </span>
              ) : (
                <ScoreBadge score={brand.brandScore} label="Brand Score" size="lg" />
              )}
              {brand.brandScorePartialData && !brand.isNewToPlatform && (
                <PartialDataIndicator completionPercent={70} label="Brand Performance" />
              )}

              {isOwnProfile && (
                <div className="flex flex-col sm:flex-row gap-2 mt-1 w-full sm:w-auto">
                  <Link
                    to="/brand/me/campaigns/new"
                    className="text-center px-4 py-2 rounded-full bg-[#0a66c2] text-white hover:bg-[#004182] dark:bg-[#70b5f9] dark:text-slate-950 dark:hover:bg-[#58a6ff] text-xs font-bold transition-all duration-200 shadow-sm"
                  >
                    Create Campaign
                  </Link>
                  <Link
                    to="/brand/me/verification"
                    className="text-center px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Verification Details
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 m-0">
                {brand.companyName}
              </h2>
              <VerificationBadge status={brand.verificationStatus} size="sm" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#0a66c2] dark:text-[#70b5f9]">
              {brand.industry}
            </p>
            <p className="text-sm text-slate-755 dark:text-slate-300 max-w-2xl leading-relaxed mt-2">
              {brand.description}
            </p>
          </div>
        </div>
      </div>

      {/* Campaign Statistics grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Completed Collaborations</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">{brand.completedCollaborations}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Average Creator Rating</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-500 dark:text-amber-400">{brand.averageCreatorRating.toFixed(1)} / 5.0</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Response Speed</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#0a66c2] dark:text-[#70b5f9]">{brand.averageResponseTimeHours} hours</span>
        </div>
      </div>

      {/* Campaigns History */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Campaign History</h3>
        {campaigns.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-slate-400 mx-auto mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.062 1.21-.486 1.458a.747.747 0 0 1-.995-.315l-.014-.029C10.74 18.06 9.4 15.86 8.5 13.5M10.34 6.66C10.593 5.7 10.924 4.77 11.325 3.88c.247-.55.91-.735 1.458-.487.498.248.69.83.486 1.343l-.014.03C12.36 7.12 11.16 8.56 10.34 9.84" />
            </svg>
            <p className="text-sm font-medium text-slate-650 dark:text-slate-400 mb-3">No active campaigns listed.</p>
            {isOwnProfile && (
              <Link
                to="/brand/me/campaigns/new"
                className="inline-block px-4 py-2 rounded-full bg-[#0a66c2] text-white hover:bg-[#004182] dark:bg-[#70b5f9] dark:text-slate-950 dark:hover:bg-[#58a6ff] text-xs font-bold transition-all shadow-sm"
              >
                Publish First Campaign
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((camp) => (
              <div key={camp.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex flex-col justify-between hover:border-[#0a66c2]/35 dark:hover:border-[#70b5f9]/35 hover:shadow-md transition-all group">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      camp.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25' :
                      camp.status === 'paused' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {camp.status}
                    </span>
                    <span className="text-[10px] text-slate-550 dark:text-slate-400 font-bold uppercase tracking-wider">
                      {camp.compensationType}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#0a66c2] dark:group-hover:text-[#70b5f9] transition-colors mb-2">
                    {camp.title}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-350 text-xs sm:text-sm line-clamp-3 mb-4 leading-relaxed">{camp.description}</p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-auto flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {camp.applicantCount} Applicants
                  </span>

                  {isOwnProfile && (
                    <div className="flex gap-3">
                      <Link
                        to={`/brand/me/campaigns/${camp.id}/edit`}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/brand/me/campaigns/${camp.id}/review`}
                        className="text-xs font-bold text-[#0a66c2] dark:text-[#70b5f9] hover:underline transition-colors"
                      >
                        Review Applications
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
