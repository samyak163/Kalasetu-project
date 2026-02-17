import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import VerificationBadge from '../common/VerificationBadge.jsx';

describe('VerificationBadge', () => {
  describe('visibility', () => {
    it('renders badge when isVerified is true', () => {
      render(<VerificationBadge isVerified={true} />);

      expect(screen.getByText('Verified')).toBeInTheDocument();
      expect(screen.getByTitle('KalaSetu Verified Artisan')).toBeInTheDocument();
    });

    it('returns null when isVerified is false', () => {
      const { container } = render(<VerificationBadge isVerified={false} />);

      expect(container.innerHTML).toBe('');
      expect(screen.queryByText('Verified')).not.toBeInTheDocument();
    });
  });

  describe('size variants', () => {
    it('renders with sm size classes by default', () => {
      render(<VerificationBadge isVerified={true} />);

      const badge = screen.getByTitle('KalaSetu Verified Artisan');
      expect(badge.className).toContain('text-xs');
    });

    it('renders with md size classes when size is md', () => {
      render(<VerificationBadge isVerified={true} size="md" />);

      const badge = screen.getByTitle('KalaSetu Verified Artisan');
      expect(badge.className).toContain('text-sm');
    });

    it('renders sm icon dimensions (16px) by default', () => {
      render(<VerificationBadge isVerified={true} />);

      // The green circle span has inline styles with width/height = 16
      const badge = screen.getByTitle('KalaSetu Verified Artisan');
      const iconCircle = badge.querySelector('.rounded-full.bg-green-500');
      expect(iconCircle).toBeInTheDocument();
      expect(iconCircle.style.width).toBe('16px');
      expect(iconCircle.style.height).toBe('16px');
    });

    it('renders md icon dimensions (20px) when size is md', () => {
      render(<VerificationBadge isVerified={true} size="md" />);

      const badge = screen.getByTitle('KalaSetu Verified Artisan');
      const iconCircle = badge.querySelector('.rounded-full.bg-green-500');
      expect(iconCircle).toBeInTheDocument();
      expect(iconCircle.style.width).toBe('20px');
      expect(iconCircle.style.height).toBe('20px');
    });

    it('falls back to sm when an invalid size is provided', () => {
      render(<VerificationBadge isVerified={true} size="lg" />);

      // Should fallback to sm via `sizeMap[size] || sizeMap.sm`
      const badge = screen.getByTitle('KalaSetu Verified Artisan');
      expect(badge.className).toContain('text-xs');
    });
  });

  describe('content', () => {
    it('renders a checkmark SVG', () => {
      render(<VerificationBadge isVerified={true} />);

      const badge = screen.getByTitle('KalaSetu Verified Artisan');
      const svg = badge.querySelector('svg');
      expect(svg).toBeInTheDocument();

      // The checkmark path
      const path = svg.querySelector('path');
      expect(path).toBeInTheDocument();
      expect(path.getAttribute('d')).toBe('M2 6L5 9L10 3');
    });

    it('displays "Verified" text with green styling', () => {
      render(<VerificationBadge isVerified={true} />);

      const verifiedText = screen.getByText('Verified');
      expect(verifiedText.className).toContain('text-green-700');
      expect(verifiedText.className).toContain('font-medium');
    });
  });
});
