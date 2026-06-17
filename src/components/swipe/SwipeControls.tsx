
interface SwipeControlsProps {
  onSwipe: (direction: 'approve' | 'decline' | 'waitlist') => void;
  disabled?: boolean;
}

export function SwipeControls({ onSwipe, disabled = false }: SwipeControlsProps) {
  return (
    <div className="flex items-center justify-center gap-6 py-4">
      {/* Decline button (left) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSwipe('decline')}
        className="w-14 h-14 rounded-full bg-white border border-[#E7E1D8] hover:border-rose-500 hover:bg-rose-50 text-rose-500 hover:scale-105 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        aria-label="Decline application"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Waitlist button (down) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSwipe('waitlist')}
        className="w-12 h-12 rounded-full bg-white border border-[#E7E1D8] hover:border-amber-500 hover:bg-amber-50 text-amber-500 hover:scale-105 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        aria-label="Waitlist application"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
        </svg>
      </button>

      {/* Approve button (right) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSwipe('approve')}
        className="w-14 h-14 rounded-full bg-white border border-[#E7E1D8] hover:border-emerald-500 hover:bg-emerald-50 text-emerald-500 hover:scale-105 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        aria-label="Approve application"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </button>
    </div>
  );
}

export default SwipeControls;
