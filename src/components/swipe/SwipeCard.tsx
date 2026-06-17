import type { Application, Creator } from '../../types/index';
import ScoreBadge from '../shared/ScoreBadge';
import VerificationBadge from '../shared/VerificationBadge';
import AIPitchPanel from '../application/AIPitchPanel';

interface SwipeCardProps {
  application: Application;
  creator: Creator;
}

export function SwipeCard({ application, creator }: SwipeCardProps) {
  // Grab first 3 portfolio items
  const portfolioItems = creator.portfolio.slice(0, 3);

  return (
    <div className="bg-white border border-[#E7E1D8] rounded-[20px] p-6 sm:p-8 shadow-card relative overflow-hidden flex flex-col justify-between max-w-lg mx-auto w-full group">
      {/* Glow removed */}
      <div className="hidden absolute -top-10 -right-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="space-y-6">
        {/* Creator Info Header */}
        <div className="flex items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <img
              src={creator.avatarUrl}
              alt={creator.displayName}
              className="w-14 h-14 rounded-xl border border-[#E7E1D8] bg-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-[#1F1F1F] text-lg">{creator.displayName}</h4>
                <VerificationBadge status={creator.verificationStatus} size="sm" showLabel={false} />
              </div>
              <p className="text-xs text-[#6E6A65] truncate max-w-[180px]">{creator.bio}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <ScoreBadge score={application.collaborationMatchScore} label="Match" size="sm" />
            <ScoreBadge score={creator.trustScore} label="Trust" size="sm" />
          </div>
        </div>

        {/* AI Pitch Panel (Read Only) */}
        <AIPitchPanel pitch={application.editedPitch} onChange={() => {}} readOnly={true} />

        {/* Portfolio Highlights */}
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-[#6E6A65] mb-3">Portfolio Highlights</span>
          {portfolioItems.length === 0 ? (
            <div className="text-center py-4 bg-white border border-[#E7E1D8] rounded-xl text-xs text-[#6E6A65]">
              No portfolio items attached.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {portfolioItems.map((item) => (
                <div key={item.id} className="bg-[#F8EFF3] border border-[#E7E1D8] p-3 rounded-xl flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-[#1F1F1F] truncate">{item.title}</span>
                    <span className="block text-[10px] text-[#6E6A65] capitalize">{item.category}</span>
                  </div>
                  <span className="text-[10px] text-[#A8678A] font-extrabold shrink-0">
                    {(item.metrics.engagementRate * 100).toFixed(1)}% Engagement
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SwipeCard;
