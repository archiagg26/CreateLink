import type { VerificationStatus } from '../../types';

interface VerificationBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const SIZE = {
  sm: { icon: 'w-3 h-3', text: 'text-[11px]', padding: 'px-1.5 py-0.5', gap: 'gap-1' },
  md: { icon: 'w-4 h-4', text: 'text-xs',     padding: 'px-2 py-1',     gap: 'gap-1.5' },
  lg: { icon: 'w-5 h-5', text: 'text-sm',     padding: 'px-3 py-1.5',   gap: 'gap-2' },
};

const CONFIG: Record<VerificationStatus, { label: string; style: string; emoji: string }> = {
  verified:   { label: 'Verified',   style: 'bg-emerald-50 text-emerald-700', emoji: '✅' },
  pending:    { label: 'Pending',    style: 'bg-amber-50 text-amber-700',     emoji: '⏳' },
  unverified: { label: 'Unverified', style: 'bg-[#F6F2E8] text-[#6E6A65]',   emoji: '○' },
};

export function VerificationBadge({ status, size = 'md', showLabel = true }: VerificationBadgeProps) {
  const { label, style, emoji } = CONFIG[status];
  const { icon: _icon, text, padding, gap } = SIZE[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${style} ${padding} ${gap}`}
      aria-label={`Verification: ${label}`}
      role="status"
    >
      <span className={SIZE[size].icon === 'w-3 h-3' ? 'text-[10px]' : 'text-xs'}>{emoji}</span>
      {showLabel && <span className={text}>{label}</span>}
    </span>
  );
}

export default VerificationBadge;
