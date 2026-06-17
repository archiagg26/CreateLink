import React from 'react';
import type { ContentCategory, CompensationType } from '../../types/index';
import { useFeedStore } from '../../stores/feedStore';

const CATEGORIES: (ContentCategory | 'All')[] = [
  'All', 'beauty', 'fitness', 'tech', 'food', 'travel',
  'gaming', 'lifestyle', 'finance', 'education', 'fashion',
];

const COMPENSATION_TYPES: { value: CompensationType | 'All'; label: string }[] = [
  { value: 'All', label: 'All Compensations' },
  { value: 'paid', label: 'Paid 💸' },
  { value: 'gifted', label: 'Gifted / Barter 🎁' },
  { value: 'commission', label: 'Commission 📈' },
  { value: 'revenue_share', label: 'Revenue Share 🤝' },
];

const selectClass =
  'w-full bg-white border border-[#E7E1D8] rounded-2xl px-4 py-2.5 text-[#1F1F1F] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#A8678A] focus:border-[#A8678A] transition-all shadow-soft appearance-none cursor-pointer';

export function FeedFilters() {
  const { filters, setFilters } = useFeedStore();

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setFilters({ category: v === 'All' ? undefined : (v as ContentCategory) });
  };

  const handleCompensationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setFilters({ compensationType: v === 'All' ? undefined : (v as CompensationType) });
  };

  const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setFilters({ deadlineBefore: v ? new Date(v).toISOString() : undefined });
  };

  return (
    <div className="flex flex-col md:flex-row md:items-end gap-4">
      {/* Category */}
      <div className="flex-1 relative">
        <label htmlFor="filter-category" className="block text-[11px] font-bold uppercase tracking-wider text-[#6E6A65] mb-1.5">
          Category
        </label>
        <select id="filter-category" value={filters.category || 'All'} onChange={handleCategoryChange} className={selectClass}>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'All' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Compensation */}
      <div className="flex-1 relative">
        <label htmlFor="filter-compensation" className="block text-[11px] font-bold uppercase tracking-wider text-[#6E6A65] mb-1.5">
          Compensation
        </label>
        <select id="filter-compensation" value={filters.compensationType || 'All'} onChange={handleCompensationChange} className={selectClass}>
          {COMPENSATION_TYPES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Deadline */}
      <div className="flex-1 relative">
        <label htmlFor="filter-deadline" className="block text-[11px] font-bold uppercase tracking-wider text-[#6E6A65] mb-1.5">
          Apply Before
        </label>
        <input
          id="filter-deadline"
          type="date"
          value={filters.deadlineBefore ? filters.deadlineBefore.split('T')[0] : ''}
          onChange={handleDeadlineChange}
          className={selectClass}
        />
      </div>
    </div>
  );
}

export default FeedFilters;
