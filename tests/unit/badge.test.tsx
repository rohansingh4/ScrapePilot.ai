import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
  it('renders with default variant', () => {
    render(<Badge>Default Badge</Badge>);
    const badge = screen.getByText(/default badge/i);
    expect(badge).toBeInTheDocument();
  });

  it('renders with primary variant', () => {
    render(<Badge variant="primary">Primary</Badge>);
    const badge = screen.getByText(/primary/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-[var(--primary)]/10');
  });

  it('renders with success variant', () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText(/success/i);
    expect(badge).toBeInTheDocument();
  });

  it('renders with children', () => {
    render(
      <Badge>
        <span>Icon</span>
        Text
      </Badge>
    );
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>);
    const badge = screen.getByText(/custom/i);
    expect(badge).toHaveClass('custom-class');
  });
});
