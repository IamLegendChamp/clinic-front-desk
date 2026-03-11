import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'staff@clinic.com', role: 'staff' },
    logout: vi.fn(),
  }),
}));

vi.mock('../components/ui', () => ({
  Button: ({ children, ...props }: { children?: React.ReactNode }) => React.createElement('button', props, children),
  TextField: (props: Record<string, unknown>) => React.createElement('input', { ...props, 'data-testid': 'textfield' }),
}));

describe('DashboardPage', () => {
  it('shows Front Desk heading', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Front Desk' })).toBeInTheDocument();
  });
});
