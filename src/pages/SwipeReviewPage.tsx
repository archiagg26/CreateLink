import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSwipeStore } from '../stores/swipeStore';
import { getStore } from '../services/store';
import SwipeCard from '../components/swipe/SwipeCard';
import SwipeControls from '../components/swipe/SwipeControls';
import UndoToast from '../components/shared/UndoToast';
import type { Creator, Campaign } from '../types/index';
import * as brandService from '../services/brandService';

export default function SwipeReviewPage() {
  const { id: campaignId } = useParams<{ id: string }>();
  const { queue, undoAvailable, loadApplications, rankByMatchScore, swipe, undo } = useSwipeStore();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (campaignId) {
      Promise.resolve().then(() => {
        setLoading(true);
      });
      loadApplications(campaignId)
        .then(() => brandService.getCampaign(campaignId))
        .then((camp) => {
          setCampaign(camp);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [campaignId, loadApplications]);

  const handleSwipe = useCallback(async (direction: 'approve' | 'decline' | 'waitlist') => {
    if (queue.length === 0) return;
    const currentApp = queue[0];
    const directionLabels = { approve: 'approved', decline: 'declined', waitlist: 'waitlisted' };

    setToastMessage(`Application ${directionLabels[direction]}.`);
    await swipe(currentApp.id, direction);
  }, [queue, swipe]);

  const handleUndo = async () => {
    await undo();
    setToastMessage('Swipe undone.');
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (queue.length === 0) return;
      if (e.key === 'ArrowRight') {
        handleSwipe('approve');
      } else if (e.key === 'ArrowLeft') {
        handleSwipe('decline');
      } else if (e.key === 'ArrowDown') {
        handleSwipe('waitlist');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [queue, handleSwipe]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#A8678A] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#6E6A65] text-sm">Loading applications...</p>
      </div>
    );
  }

  const currentApp = queue[0];
  let currentCreator: Creator | null = null;
  if (currentApp) {
    const store = getStore();
    currentCreator = store.creators.get(currentApp.creatorId) || null;
  }

  return (
    <div className="space-y-8 max-w-xl mx-auto text-center relative min-h-[70vh] flex flex-col justify-between">
      {/* Undo Toast */}
      {toastMessage && undoAvailable && (
        <UndoToast
          message={toastMessage}
          onUndo={handleUndo}
          onDismiss={() => setToastMessage('')}
        />
      )}

      <div>
        <div className="flex justify-between items-center mb-6">
          <Link
            to={campaign ? `/brand/${campaign.brandId}` : '/feed'}
            className="text-xs font-bold text-[#6E6A65] hover:text-[#1F1F1F] flex items-center gap-1.5 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Profile
          </Link>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6A65]">
            Swipe Application Review
          </span>
          <div className="w-10"></div>
        </div>

        {campaign && (
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-[#1F1F1F]">{campaign.title}</h2>
            <p className="text-[#6E6A65] text-xs mt-1">Review pending candidates using controls or arrow keys.</p>
          </div>
        )}
      </div>

      {/* Main card viewport */}
      <div className="flex-1 flex items-center justify-center min-h-[350px]">
        {currentApp && currentCreator ? (
          <div className="w-full">
            <SwipeCard
              application={currentApp}
              creator={currentCreator}
            />
          </div>
        ) : (
          <div className="bg-white border border-[#E7E1D8] rounded-[20px] shadow-card p-10 text-center w-full py-16">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-12 h-12 text-[#6E6A65] mx-auto mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
            </svg>
            <h4 className="font-bold text-[#1F1F1F] mb-1">Queue Completed</h4>
            <p className="text-[#6E6A65] text-xs max-w-xs mx-auto">No more pending applications for this campaign.</p>
          </div>
        )}
      </div>

      {/* Controls & Helpers Footer */}
      {currentApp && (
        <div className="mt-8">
          {queue.length > 1 && (
            <button
              onClick={rankByMatchScore}
              className="mb-4 px-4 py-2 rounded-xl bg-white hover:bg-[#F8EFF3] border border-[#E7E1D8] text-xs font-bold text-[#1F1F1F] transition-colors"
            >
              Rank Queue by AI Match Score
            </button>
          )}

          <SwipeControls onSwipe={handleSwipe} />

          <div className="flex justify-center gap-6 text-[10px] text-[#6E6A65] mt-2 font-medium">
            <span>&larr; Decline</span>
            <span>&darr; Waitlist</span>
            <span>&rarr; Approve</span>
          </div>
        </div>
      )}
    </div>
  );
}
