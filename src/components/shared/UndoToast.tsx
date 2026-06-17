import { useEffect, useRef } from 'react';

interface UndoToastProps {
  /** Message to display in the toast */
  message: string;
  /** Called when the user clicks "Undo" */
  onUndo: () => void;
  /** Called when the toast is dismissed (either by timeout or undo) */
  onDismiss: () => void;
  /** Auto-dismiss duration in milliseconds (default: 5000) */
  duration?: number;
}

/**
 * A fixed-position toast notification with an "Undo" action button.
 * Auto-dismisses after `duration` ms unless the user clicks "Undo".
 *
 * Used when a creator removes a portfolio item or a brand removes a campaign
 * so the action can be reversed within the time window.
 */
export function UndoToast({
  message,
  onUndo,
  onDismiss,
  duration = 5000,
}: UndoToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any existing timer on cleanup
  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => {
      clearTimer();
    };
  }, [duration, onDismiss]);

  const handleUndo = () => {
    clearTimer();
    onUndo();
    onDismiss();
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg bg-[#1F1F1F] px-4 py-3 text-white shadow-lg"
    >
      <span className="text-sm">{message}</span>
      <button
        type="button"
        onClick={handleUndo}
        className="rounded bg-white px-3 py-1 text-sm font-semibold text-[#1F1F1F] transition-colors hover:bg-[#F8EFF3] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1F1F1F]"
      >
        Undo
      </button>
      <button
        type="button"
        onClick={() => {
          clearTimer();
          onDismiss();
        }}
        aria-label="Dismiss"
        className="ml-1 rounded p-0.5 text-[#6E6A65] transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-[#1F1F1F]"
      >
        {/* Close icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </button>
    </div>
  );
}

export default UndoToast;
