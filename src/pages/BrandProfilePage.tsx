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
        <div className="w-10 h-10 border-4 border-[#A8678A] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#6E6A65] text-sm">Loading brand profile...</p>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="text-center py-20 bg-white border border-[#E7E1D8] rounded-[20px] shadow-card">
        <p className="text-[#1F1F1F] font-bold mb-4">{error || 'Brand profile not found.'}</p>
        <Link to="/feed" className="px-5 py-2 rounded-xl bg-[#1F1F1F] text-white text-sm hover:opacity-90 transition-opacity">
          Return to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Brand Profile Header */}
      <div className="bg-white border border-[#E7E1D8] rounded-[20px] overflow-hidden shadow-card relative">
        {/* Cover Banner */}
        <div className="h-32 sm:h-48 bg-[#F8EFF3] relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#E7E1D8_1px,transparent_1px),linear-gradient(to_bottom,#E7E1D8_1px,transparent_1px)] bg-[size:14px_24px] opacity-40"></div>
        </div>

        {/* Profile Content Container */}
        <div className="px-6 pb-6 relative">
          {/* Logo Overlay */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
            <img
              src={brand.logoUrl}
              alt={brand.companyName}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl border-4 border-white bg-white shadow-soft relative z-10 p-1 object-contain"
            />
            {/* Score metrics / Action buttons */}
            <div className="flex flex-col gap-2 shrink-0 sm:pb-2 items-start sm:items-end">
              {brand.isNewToPlatform ? (
                <span className="inline-flex items-center rounded-full bg-[#F8EFF3] text-[#A8678A] text-xs px-3 py-1.5 font-bold uppercase border border-[#A8678A]">
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
                    className="text-center px-4 py-2 rounded-full bg-[#1F1F1F] text-white hover:opacity-90 text-xs font-bold transition-all duration-200 shadow-soft"
                  >
                    Create Campaign
                  </Link>
                  <Link
                    to="/brand/me/verification"
                    className="text-center px-4 py-2 rounded-full bg-white text-[#1F1F1F] border border-[#E7E1D8] text-xs font-bold hover:bg-[#F8EFF3] transition-all"
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
              <h2 className="text-xl sm:text-2xl font-bold text-[#1F1F1F] m-0">
                {brand.companyName}
              </h2>
              <VerificationBadge status={brand.verificationStatus} size="sm" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#A8678A]">
              {brand.industry}
            </p>
            <p className="text-sm text-[#6E6A65] max-w-2xl leading-relaxed mt-2">
              {brand.description}
            </p>
          </div>
        </div>
      </div>

      {/* Campaign Statistics grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-5 shadow-card">
          <span className="text-[#6E6A65] text-xs font-bold uppercase tracking-wider block mb-1.5">Completed Collaborations</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#1F1F1F]">{brand.completedCollaborations}</span>
        </div>
        <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-5 shadow-card">
          <span className="text-[#6E6A65] text-xs font-bold uppercase tracking-wider block mb-1.5">Average Creator Rating</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#1F1F1F]">{brand.averageCreatorRating.toFixed(1)} / 5.0</span>
        </div>
        <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-5 shadow-card">
          <span className="text-[#6E6A65] text-xs font-bold uppercase tracking-wider block mb-1.5">Response Speed</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#1F1F1F]">{brand.averageResponseTimeHours} hours</span>
        </div>
      </div>

      {/* Campaigns History */}
      <div>
        <h3 className="text-lg font-bold text-[#1F1F1F] mb-4">Campaign History</h3>
        {campaigns.length === 0 ? (
          <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-10 text-center shadow-card">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-[#6E6A65] mx-auto mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.062 1.21-.486 1.458a.747.747 0 0 1-.995-.315l-.014-.029C10.74 18.06 9.4 15.86 8.5 13.5M10.34 6.66C10.593 5.7 10.924 4.77 11.325 3.88c.247-.55.91-.735 1.458-.487.498.248.69.83.486 1.343l-.014.03C12.36 7.12 11.16 8.56 10.34 9.84" />
            </svg>
            <p className="text-sm font-medium text-[#6E6A65] mb-3">No active campaigns listed.</p>
            {isOwnProfile && (
              <Link
                to="/brand/me/campaigns/new"
                className="inline-block px-4 py-2 rounded-full bg-[#1F1F1F] text-white hover:opacity-90 text-xs font-bold transition-all shadow-soft"
              >
                Publish First Campaign
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((camp) => (
              <div key={camp.id} className="bg-white border border-[#E7E1D8] p-5 rounded-[20px] flex flex-col justify-between hover:border-[#A8678A] hover:shadow-soft transition-all group">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F8EFF3] text-[#A8678A] border border-[#E7E1D8]`}>
                      {camp.status}
                    </span>
                    <span className="text-[10px] text-[#6E6A65] font-bold uppercase tracking-wider">
                      {camp.compensationType}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#1F1F1F] group-hover:text-[#A8678A] transition-colors mb-2">
                    {camp.title}
                  </h4>
                  <p className="text-[#6E6A65] text-xs sm:text-sm line-clamp-3 mb-4 leading-relaxed">{camp.description}</p>
                </div>

                <div className="border-t border-[#E7E1D8] pt-3 mt-auto flex items-center justify-between">
                  <span className="text-xs text-[#6E6A65] font-medium">
                    {camp.applicantCount} Applicants
                  </span>

                  {isOwnProfile && (
                    <div className="flex gap-3">
                      <Link
                        to={`/brand/me/campaigns/${camp.id}/edit`}
                        className="text-xs font-bold text-[#6E6A65] hover:text-[#1F1F1F] transition-colors"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/brand/me/campaigns/${camp.id}/review`}
                        className="text-xs font-bold text-[#A8678A] hover:underline transition-colors"
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
