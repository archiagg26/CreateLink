import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScoreBadge from '../../components/shared/ScoreBadge';

describe('ScoreBadge', () => {
  describe('rendering', () => {
    it('renders the score value', () => {
      render(<ScoreBadge score={75} />);
      expect(screen.getByText('75')).toBeTruthy();
    });

    it('renders an optional label', () => {
      render(<ScoreBadge score={85} label="Trust Score" />);
      expect(screen.getByText('Trust Score')).toBeTruthy();
    });

    it('includes an accessible aria-label with score and label', () => {
      render(<ScoreBadge score={85} label="Trust Score" />);
      expect(screen.getByRole('img', { name: 'Trust Score: 85 out of 100' })).toBeTruthy();
    });

    it('includes a default aria-label when no label is provided', () => {
      render(<ScoreBadge score={60} />);
      expect(screen.getByRole('img', { name: 'Score: 60 out of 100' })).toBeTruthy();
    });
  });

  describe('color coding', () => {
    it('applies red classes for score 0–39', () => {
      const { container } = render(<ScoreBadge score={25} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-red-100');
      expect(badge.className).toContain('text-red-800');
    });

    it('applies amber classes for score 40–69', () => {
      const { container } = render(<ScoreBadge score={55} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-amber-100');
      expect(badge.className).toContain('text-amber-800');
    });

    it('applies green classes for score 70–89', () => {
      const { container } = render(<ScoreBadge score={80} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-green-100');
      expect(badge.className).toContain('text-green-800');
    });

    it('applies blue classes for score 90–100', () => {
      const { container } = render(<ScoreBadge score={95} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-blue-100');
      expect(badge.className).toContain('text-blue-800');
    });

    it('applies red classes at boundary score 0', () => {
      const { container } = render(<ScoreBadge score={0} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-red-100');
    });

    it('applies red classes at boundary score 39', () => {
      const { container } = render(<ScoreBadge score={39} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-red-100');
    });

    it('applies amber classes at boundary score 40', () => {
      const { container } = render(<ScoreBadge score={40} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-amber-100');
    });

    it('applies amber classes at boundary score 69', () => {
      const { container } = render(<ScoreBadge score={69} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-amber-100');
    });

    it('applies green classes at boundary score 70', () => {
      const { container } = render(<ScoreBadge score={70} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-green-100');
    });

    it('applies green classes at boundary score 89', () => {
      const { container } = render(<ScoreBadge score={89} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-green-100');
    });

    it('applies blue classes at boundary score 90', () => {
      const { container } = render(<ScoreBadge score={90} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-blue-100');
    });

    it('applies blue classes at boundary score 100', () => {
      const { container } = render(<ScoreBadge score={100} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('bg-blue-100');
    });
  });

  describe('size variants', () => {
    it('applies sm size classes', () => {
      const { container } = render(<ScoreBadge score={50} size="sm" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('text-xs');
    });

    it('applies md size classes (default)', () => {
      const { container } = render(<ScoreBadge score={50} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('text-sm');
    });

    it('applies lg size classes', () => {
      const { container } = render(<ScoreBadge score={50} size="lg" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain('text-base');
    });
  });

  describe('score clamping', () => {
    it('clamps scores above 100 to 100', () => {
      render(<ScoreBadge score={150} />);
      expect(screen.getByText('100')).toBeTruthy();
    });

    it('clamps negative scores to 0', () => {
      render(<ScoreBadge score={-10} />);
      expect(screen.getByText('0')).toBeTruthy();
    });

    it('rounds non-integer scores', () => {
      render(<ScoreBadge score={75.7} />);
      expect(screen.getByText('76')).toBeTruthy();
    });
  });
});
