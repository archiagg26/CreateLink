import React from 'react';

interface PartialDataIndicatorProps {
  /** Completion percentage from 0 to 100 */
  completionPercent: number;
  /** Optional label describing what data is incomplete, e.g. "Profile" */
  label?: string;
  /** Whether to show the numeric percentage. Defaults to true. */
  showPercent?: boolean;
}

/**
 * Returns Tailwind color classes for the progress bar fill based on completion.
 *  0–39%   → red (very incomplete)
 * 40–69%   → amber (partially complete)
 * 70–99%   → green (mostly complete)
 * 100%     → not shown (no partial data)
 */
function getBarColorClass(percent: number): string {
  if (percent >= 70) return 'bg-green-500';
  if (percent >= 40) return 'bg-amber-400';
  return 'bg-red-400';
}

function getTextColorClass(percent: number): string {
  if (percent >= 70) return 'text-green-700';
  if (percent >= 40) return 'text-amber-700';
  return 'text-red-700';
}

function getBgColorClass(percent: number): string {
  if (percent >= 70) return 'bg-green-50 border-green-200';
  if (percent >= 40) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

/**
 * PartialDataIndicator — shows a visual indicator when profile or score data
 * is incomplete.
 *
 * Renders a progress bar and an optional label such as "Profile 60% complete".
 * The color of the bar and text reflects the completion level:
 *  0–39%   → red
 * 40–69%   → amber
 * 70–99%   → green
 *
 * Used alongside `ScoreBadge` when `trustScorePartialData` or
 * `brandScorePartialData` is true to indicate score was computed from
 * partial inputs.
 */
const PartialDataIndicator: React.FC<PartialDataIndicatorProps> = ({
  completionPercent,
  label,
  showPercent = true,
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(completionPercent)));

  const barColor = getBarColorClass(clamped);
  const textColor = getTextColorClass(clamped);
  const containerBg = getBgColorClass(clamped);

  const displayLabel = label ?? 'Data';
  const ariaLabel = `${displayLabel} ${clamped}% complete`;

  return (
    <div
      className={`inline-flex flex-col gap-1 rounded-md border px-3 py-2 ${containerBg}`}
      role="status"
      aria-label={ariaLabel}
    >
      {/* Header row: warning icon + label + optional percent */}
      <div className={`flex items-center gap-1.5 text-sm font-medium ${textColor}`}>
        {/* Warning icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 flex-shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
        <span>
          {displayLabel}
          {showPercent && (
            <span className="ml-1 font-semibold">{clamped}%</span>
          )}{' '}
          complete
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-[#E7E1D8]"
        aria-hidden="true"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

export default PartialDataIndicator;
