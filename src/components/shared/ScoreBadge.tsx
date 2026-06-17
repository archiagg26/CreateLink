import React from 'react';

interface ScoreBadgeProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

function getStyle(score: number) {
  if (score >= 90) return 'bg-[#F8EFF3] text-[#A8678A] ring-1 ring-[#E7E1D8]';
  if (score >= 70) return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
  if (score >= 40) return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
  return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
}

const sizes = {
  sm: 'text-[11px] px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
  lg: 'text-base px-3 py-1.5 gap-2',
};

const numberSizes = {
  sm: 'text-xs font-black',
  md: 'text-sm font-black',
  lg: 'text-base font-black',
};

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, label, size = 'md' }) => {
  const s = Math.min(100, Math.max(0, Math.round(score)));
  const ariaLabel = label ? `${label}: ${s}/100` : `Score: ${s}/100`;

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${getStyle(s)} ${sizes[size]}`}
      aria-label={ariaLabel}
      role="img"
    >
      <span className={numberSizes[size]}>{s}</span>
      {label && <span>{label}</span>}
    </span>
  );
};

export default ScoreBadge;
